// src/server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const axios = require('axios'); // For Google OAuth API calls

// Import the centralized pool and secrets from config files
const pool = require('../config/db');
const { USER_JWT_SECRET, SESSION_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('../config/secrets'); // Added Google OAuth secrets

// Import the centralized authenticateUser middleware
const authenticateUser = require('../middleware/authenticateUser');

// Utility function to clean profile image URLs
const cleanProfileImageUrl = (url) => {
    if (!url) return null;
    // Remove quotes and extra whitespace
    return url.replace(/^["']|["']$/g, '').trim();
};

// Google OAuth Configuration
const GOOGLE_OAUTH_CONFIG = {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'openid email profile' // Minimal scope for GDPR compliance
};


// User Registration
router.post('/register', async (req, res) => {
    let { // Use 'let' to allow modification
        user_username,
        user_email, // This will be converted to lowercase
        password,
        user_type,
        user_first_name,
        user_last_name,
        contact_phone_number,
        organisation_name,
        university_college,
        user_city
    } = req.body;

    // --- NEW: Convert email to lowercase for consistent storage and lookup ---
    user_email = user_email.toLowerCase(); // Ensure email is stored in lowercase

    // Basic validation
    if (!user_email || !password || !user_first_name || !user_last_name) {
        return res.status(400).json({ error: 'Email, password, first name, and last name are required.' });
    }

    try {
        // Check for existing user (username or email)
        const checkUser = await pool.query(
            'SELECT user_id, user_email, user_username, google_id FROM users WHERE LOWER(user_email) = LOWER($1) OR user_username = $2',
            [user_email, user_username || null] // Compare with lowercase email
        );

        if (checkUser.rows.length > 0) {
            const existingUser = checkUser.rows[0];
            console.log(`--- DEBUG: Found existing user for email ${user_email}:`, existingUser);
            console.log(`--- DEBUG: Comparing emails: "${existingUser.user_email}" vs "${user_email}"`);
            console.log(`--- DEBUG: Google ID exists: ${!!existingUser.google_id}`);
            
            // Check if this email is linked to Google OAuth
            if (existingUser.google_id) {
                console.log(`--- DEBUG: Email ${user_email} is linked to Google OAuth`);
                return res.status(409).json({ 
                    error: 'This email is already linked to a Google account. Please sign in with Google instead.' 
                });
            }
            
            if (existingUser.user_email.toLowerCase() === user_email.toLowerCase()) {
                console.log(`--- DEBUG: Email ${user_email} already exists as normal account`);
                return res.status(409).json({ error: 'Email already registered.' });
            }
            
            if (user_username && existingUser.user_username === user_username) {
                return res.status(409).json({ error: 'Username already taken.' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (
                user_username, user_email, password_hash, user_type,
                user_first_name, user_last_name, contact_phone_number,
                organisation_name, university_college, user_city
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING user_id, user_username, user_email, user_type`,
            [
                user_username || null, // Allow username to be null
                user_email, // Store lowercase email
                hashedPassword,
                user_type || 'student', // Default to 'student' if not provided
                user_first_name,
                user_last_name,
                contact_phone_number || null,
                organisation_name || null,
                university_college || null,
                user_city || null
            ]
        );

        const newUser = result.rows[0];

        // Establish session for the newly registered user
        req.session.userId = newUser.user_id;
        req.session.username = newUser.user_username || newUser.user_email; // Use username if available, else email
        req.session.userType = newUser.user_type;

        console.log(`--- DEBUG: User registered and logged in: ${newUser.user_email} (ID: ${newUser.user_id}) ---`);
        res.status(201).json({
            message: 'User registered and logged in successfully!',
            user: {
                user_id: newUser.user_id,
                user_username: newUser.user_username,
                user_email: newUser.user_email,
                user_type: newUser.user_type
            }
        });

    } catch (err) {
        console.error('--- ERROR: User registration failed:', err.stack);
        
        // Check for specific unique constraint errors if not caught by initial check
        if (err.code === '23505') { // PostgreSQL unique violation error code
            if (err.detail.includes('user_email')) {
                // Check if this is a Google OAuth user
                try {
                    const googleCheck = await pool.query(
                        'SELECT google_id FROM users WHERE LOWER(user_email) = LOWER($1)',
                        [user_email]
                    );
                    
                    if (googleCheck.rows.length > 0 && googleCheck.rows[0].google_id) {
                        console.log(`--- DEBUG: Unique constraint violation for Google OAuth user: ${user_email}`);
                        return res.status(409).json({ 
                            error: 'This email is already linked to a Google account. Please sign in with Google instead.' 
                        });
                    }
                } catch (checkErr) {
                    console.error('--- ERROR: Failed to check Google OAuth status:', checkErr);
                }
                
                return res.status(409).json({ error: 'Email already registered.' });
            }
            if (err.detail.includes('user_username')) {
                return res.status(409).json({ error: 'Username already taken.' });
            }
        }
        res.status(500).json({ error: 'Failed to register user. Please try again.' });
    }
});


// User Login
router.post('/login', async (req, res) => {
    let { email, password } = req.body;
    console.log(`--- DEBUG: Login attempt for email: ${email} ---`);

    // Convert incoming email to lowercase for comparison
    email = email.toLowerCase();

    try {
        // --- MODIFIED: Select user_status here ---
        const result = await pool.query(
            'SELECT user_id, user_username, user_email, password_hash, user_type, user_status FROM users WHERE user_email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            console.log('--- DEBUG: Login failed: User not found for email:', email);
            return res.status(401).json({ error: 'No account found with this email address' });
        }

        const user = result.rows[0];

        // --- ADDED: Check user_status before password comparison ---
        if (user.user_status === 'inactive') {
            console.log(`--- DEBUG: Login denied: User ${email} is inactive.`);
            return res.status(403).json({ error: 'Your account is inactive. Please contact support to reactivate.' });
        }
        if (user.user_status === 'suspended') {
            console.log(`--- DEBUG: Login denied: User ${email} is suspended.`);
            return res.status(403).json({ error: 'Your account has been suspended. Please contact support for more information.' });
        }
        // --- END ADDED ---

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            console.log('--- DEBUG: Login failed: Password mismatch for email:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last_login timestamp on successful login
        await pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
            [user.user_id]
        );
        console.log(`--- DEBUG: Updated last_login for user ID: ${user.user_id} ---`);


        // Set session variables
        req.session.userId = user.user_id;
        req.session.username = user.user_username || user.user_email; // Use username if available, else email
        req.session.userType = user.user_type;

        console.log(`--- DEBUG: User logged in: ${user.user_email} (ID: ${user.user_id}, Type: ${user.user_type}) ---`);
        res.status(200).json({
            message: 'Logged in successfully',
            user: {
                user_id: user.user_id,
                user_username: user.user_username,
                user_email: user.user_email,
                user_type: user.user_type
            }
        });

    } catch (err) {
        console.error('--- ERROR: Login error:', err.stack);
        res.status(500).json({ error: 'Failed to log in' });
    }
});

// User Logout (no changes needed unless you want to log the user out case-insensitively, which is less common)
router.post('/logout', (req, res) => {
    if (req.session) {
        const usernameToLog = req.session.username;
        req.session.destroy(err => {
            if (err) {
                console.error('--- ERROR: Error destroying session:', err.stack);
                return res.status(500).json({ error: 'Logout failed' });
            }
            res.clearCookie('connect.sid', {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
            });
            console.log(`--- DEBUG: User logged out: ${usernameToLog || 'unknown'} ---`);
            res.json({ message: 'Logged out successfully' });
        });
    } else {
        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
        });
        res.status(200).json({ message: 'No active session to log out from.' });
    }
});

// Get logged-in user details
router.get('/me', authenticateUser, async (req, res) => {
    console.log('--- DEBUG: /api/auth/me endpoint hit. Session userId:', req.session.userId);
    try {
        const userId = req.session.userId;

        if (!userId) {
            console.log('--- DEBUG: /api/auth/me: userId not found in session after authentication check.');
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        const result = await pool.query(
            `SELECT user_id, user_username, user_email, user_type,
                    user_first_name, user_last_name, contact_phone_number,
                    organisation_name, university_college, user_city, user_image, created_at,
                    google_id, google_oauth_completed, profile_completion_status,
                    terms_accepted_at, privacy_accepted_at
             FROM users WHERE user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            console.log(`--- DEBUG: /api/auth/me: User with ID ${userId} not found in DB.`);
            return res.status(404).json({ error: 'User data not found.' });
        }

        const user = result.rows[0];
        console.log(`--- DEBUG: /api/auth/me: User data retrieved for ID ${userId}.`);
        console.log(`--- DEBUG: Raw user_image from database: "${user.user_image}"`);
        console.log(`--- DEBUG: user_image type: ${typeof user.user_image}`);
        console.log(`--- DEBUG: user_image length: ${user.user_image ? user.user_image.length : 0}`);
        
        // Clean the user_image if it has quotes
        if (user.user_image && typeof user.user_image === 'string') {
            const cleanedImage = user.user_image.replace(/^["']|["']$/g, '').trim();
            if (cleanedImage !== user.user_image) {
                console.log(`--- DEBUG: Cleaning user_image: "${user.user_image}" -> "${cleanedImage}"`);
                user.user_image = cleanedImage;
                
                // Update the database with the cleaned URL
                await pool.query(
                    'UPDATE users SET user_image = $1 WHERE user_id = $2',
                    [cleanedImage, userId]
                );
                console.log(`--- DEBUG: Updated database with cleaned user_image`);
            }
        }
        
        // Final cleanup: ensure no quotes in the response
        if (user.user_image && typeof user.user_image === 'string') {
            user.user_image = user.user_image.replace(/^["']|["']$/g, '').trim();
            console.log(`--- DEBUG: Final cleaned user_image for response: "${user.user_image}"`);
        }
        
        res.json({ user });

    } catch (err) {
        console.error('--- ERROR: Error fetching user data from /api/auth/me:', err.stack);
        res.status(500).json({ error: 'Failed to fetch user data.' });
    }
});

// Update user profile information
router.put('/user/:userId', authenticateUser, async (req, res) => {
    const { userId } = req.params;
    const sessionUserId = req.session.userId;
    
    // Ensure user can only update their own profile
    if (parseInt(userId) !== parseInt(sessionUserId)) {
        return res.status(403).json({ error: 'You can only update your own profile' });
    }
    
    const updateData = req.body;
    console.log(`--- DEBUG: Updating user ${userId} with data:`, updateData);
    
    try {
        // Build dynamic update query based on provided fields
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;
        
        // Handle terms acceptance
        if (updateData.terms_accepted_at) {
            updateFields.push(`terms_accepted_at = $${paramCount}`);
            updateValues.push(updateData.terms_accepted_at);
            paramCount++;
        }
        
        // Handle privacy acceptance
        if (updateData.privacy_accepted_at) {
            updateFields.push(`privacy_accepted_at = $${paramCount}`);
            updateValues.push(updateData.privacy_accepted_at);
            paramCount++;
        }
        
        // Handle user type
        if (updateData.user_type) {
            updateFields.push(`user_type = $${paramCount}`);
            updateValues.push(updateData.user_type);
            paramCount++;
        }
        
        // Handle profile completion
        if (updateData.profile_completion_status) {
            updateFields.push(`profile_completion_status = $${paramCount}`);
            updateValues.push(updateData.profile_completion_status);
            paramCount++;
        }
        
        // Handle other profile fields
        if (updateData.contact_phone_number !== undefined) {
            updateFields.push(`contact_phone_number = $${paramCount}`);
            updateValues.push(updateData.contact_phone_number);
            paramCount++;
        }
        
        if (updateData.user_city !== undefined) {
            updateFields.push(`user_city = $${paramCount}`);
            updateValues.push(updateData.user_city);
            paramCount++;
        }
        
        if (updateData.university_college !== undefined) {
            updateFields.push(`university_college = $${paramCount}`);
            updateValues.push(updateData.university_college);
            paramCount++;
        }
        
        if (updateData.organisation_name !== undefined) {
            updateFields.push(`organisation_name = $${paramCount}`);
            updateValues.push(updateData.organisation_name);
            paramCount++;
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        // Add user_id to values array
        updateValues.push(userId);
        
        const updateQuery = `
            UPDATE users 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $${paramCount}
            RETURNING user_id, user_email, user_type, profile_completion_status
        `;
        
        const result = await pool.query(updateQuery, updateValues);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const updatedUser = result.rows[0];
        console.log(`--- DEBUG: User ${userId} updated successfully:`, updatedUser);
        
        res.json({ 
            message: 'User updated successfully',
            user: updatedUser
        });
        
    } catch (err) {
        console.error('--- ERROR: Error updating user:', err.stack);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});

// Google OAuth Routes

// Initiate Google OAuth flow
router.get('/google', (req, res) => {
    // Generate secure state parameter for CSRF protection
    const state = require('crypto').randomBytes(32).toString('hex');
    req.session.oauthState = state;
    
    // Check if this is from signup flow to get user type
    const signupUserType = req.query.signup_user_type;
    if (signupUserType) {
        req.session.signupUserType = signupUserType;
    }
    
    // Build Google OAuth URL with minimal scopes for GDPR compliance
    const authUrl = new URL(GOOGLE_OAUTH_CONFIG.authUrl);
    authUrl.searchParams.set('client_id', GOOGLE_OAUTH_CONFIG.clientId);
    authUrl.searchParams.set('redirect_uri', GOOGLE_OAUTH_CONFIG.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', GOOGLE_OAUTH_CONFIG.scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline'); // For refresh tokens
    authUrl.searchParams.set('prompt', 'consent'); // Always show consent screen for GDPR
    
    console.log('--- DEBUG: Initiating Google OAuth flow ---');
    res.redirect(authUrl.toString());
});

// Google OAuth callback handler
router.get('/google/callback', async (req, res) => {
    const { code, state, error } = req.query;
    
    // Validate state parameter for CSRF protection
    if (!state || !req.session.oauthState || state !== req.session.oauthState) {
        console.error('--- ERROR: Invalid OAuth state parameter - potential CSRF attack ---');
        return res.status(400).json({ error: 'Invalid OAuth state parameter' });
    }
    
    // Clear OAuth state from session
    delete req.session.oauthState;
    
    if (error) {
        console.error('--- ERROR: Google OAuth error:', error);
        return res.redirect('/login?error=oauth_cancelled');
    }
    
    if (!code) {
        console.error('--- ERROR: No authorization code received from Google ---');
        return res.redirect('/login?error=oauth_failed');
    }
    
    try {
        // Exchange authorization code for access token
        const tokenResponse = await axios.post(GOOGLE_OAUTH_CONFIG.tokenUrl, {
            client_id: GOOGLE_OAUTH_CONFIG.clientId,
            client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri
        });
        
        const { access_token, id_token } = tokenResponse.data;
        
        if (!access_token) {
            throw new Error('No access token received from Google');
        }
        
        // Fetch user information from Google
        const userInfoResponse = await axios.get(GOOGLE_OAUTH_CONFIG.userInfoUrl, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });
        
        const googleUser = userInfoResponse.data;
        
        // Validate required fields from Google
        if (!googleUser.email || !googleUser.id) {
            throw new Error('Incomplete user data received from Google');
        }
        
        console.log(`--- DEBUG: Google OAuth successful for email: ${googleUser.email} ---`);
        
        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT user_id, user_email, google_id, profile_completion_status, user_type, user_image FROM users WHERE user_email = $1 OR google_id = $2',
            [googleUser.email.toLowerCase(), googleUser.id]
        );
        
        if (existingUser.rows.length > 0) {
            // User exists - update Google ID if needed and log them in
            const user = existingUser.rows[0];
            
            // Update Google ID if not already set
            if (!user.google_id) {
                await pool.query(
                    'UPDATE users SET google_id = $1, google_oauth_completed = TRUE WHERE user_id = $2',
                    [googleUser.id, user.user_id]
                );
                console.log(`--- DEBUG: Linked Google account to existing user: ${user.user_email} ---`);
            }
            
            // Only update profile image if user doesn't already have one
            if (googleUser.picture && !user.user_image) {
                try {
                    const url = new URL(googleUser.picture);
                    const cleanImageUrl = cleanProfileImageUrl(googleUser.picture);
                    console.log(`--- DEBUG: Setting Google profile image (no existing image): ${cleanImageUrl}`);
                    
                    // Ensure the URL is completely clean before storing
                    const finalCleanUrl = cleanImageUrl.replace(/^["']|["']$/g, '').trim();
                    console.log(`--- DEBUG: Final clean URL for database: ${finalCleanUrl}`);
                    
                    await pool.query(
                        'UPDATE users SET user_image = $1 WHERE user_id = $2',
                        [finalCleanUrl, user.user_id]
                    );
                    
                    console.log(`--- DEBUG: Profile image set in database to: ${finalCleanUrl}`);
                } catch (urlError) {
                    console.warn(`--- WARNING: Invalid Google profile image URL for existing user: ${googleUser.picture}`);
                }
            } else if (googleUser.picture && user.user_image) {
                console.log(`--- DEBUG: User already has profile image, keeping existing: "${user.user_image}"`);
            } else if (!googleUser.picture) {
                console.log(`--- DEBUG: No Google profile picture provided, keeping existing image if any`);
            }
            
            // Set session and redirect based on profile completion status
            req.session.userId = user.user_id;
            req.session.username = user.user_email;
            req.session.userType = user.user_type;
            
            if (user.profile_completion_status === 'completed') {
                // Existing user with complete profile - redirect to my-account
                console.log(`--- DEBUG: Existing user logged in via Google: ${user.user_email} ---`);
                res.redirect('/my-account');
            } else {
                // Existing user with incomplete profile - redirect to profile completion
                console.log(`--- DEBUG: Existing user needs profile completion: ${user.user_email} ---`);
                res.redirect('/profile-completion');
            }
        } else {
            // New user - create account and redirect to terms agreement
            // Check if this is from signup flow to get user type
            const signupUserType = req.session.signupUserType || 'student'; // Default to student
            
            // Generate a secure random password for Google OAuth users
            const randomPassword = require('crypto').randomBytes(32).toString('hex');
            const passwordHash = await bcrypt.hash(randomPassword, 12);
            
            // Ensure profile image is a valid URL
            let profileImageUrl = null;
            if (googleUser.picture) {
                try {
                    const url = new URL(googleUser.picture);
                    profileImageUrl = cleanProfileImageUrl(googleUser.picture);
                    console.log(`--- DEBUG: Raw Google picture: "${googleUser.picture}"`);
                    console.log(`--- DEBUG: Cleaned profile image URL: "${profileImageUrl}"`);
                    
                    // Final cleanup to ensure no quotes
                    profileImageUrl = profileImageUrl.replace(/^["']|["']$/g, '').trim();
                    console.log(`--- DEBUG: Final clean URL for database: ${profileImageUrl}`);
                } catch (urlError) {
                    console.warn(`--- WARNING: Invalid Google profile image URL: ${googleUser.picture}`);
                    profileImageUrl = null;
                }
            }
            
            const newUser = await pool.query(
                `INSERT INTO users (
                    user_email, google_id, user_first_name, user_last_name, 
                    user_image, google_oauth_completed, profile_completion_status,
                    user_type, user_status, created_at, password_hash
                ) VALUES ($1, $2, $3, $4, $5, TRUE, 'pending', $6, 'active', CURRENT_TIMESTAMP, $7)
                RETURNING user_id, user_email, user_type`,
                [
                    googleUser.email.toLowerCase(),
                    googleUser.id,
                    googleUser.given_name || '',
                    googleUser.family_name || '',
                    profileImageUrl,
                    signupUserType,
                    passwordHash
                ]
            );
            
            console.log(`--- DEBUG: Database insert completed. Profile image stored as: "${profileImageUrl}"`);
            
            const createdUser = newUser.rows[0];
            
            // Set session for new user
            req.session.userId = createdUser.user_id;
            req.session.username = createdUser.user_email;
            req.session.userType = createdUser.user_type;
            req.session.isNewGoogleUser = true; // Flag for terms agreement flow
            
            // Clear signup user type from session
            delete req.session.signupUserType;
            
            console.log(`--- DEBUG: New Google user created: ${createdUser.user_email} (${createdUser.user_type}) ---`);
            
            // Redirect to terms agreement for new users
            res.redirect('/terms-agreement');
        }
        
    } catch (err) {
        console.error('--- ERROR: Google OAuth callback error:', err.stack);
        res.redirect('/login?error=oauth_failed');
    }
});

// Link existing account with Google OAuth
router.post('/link-google', authenticateUser, async (req, res) => {
    const { googleId, googleEmail, googleFirstName, googleLastName, googlePicture } = req.body;
    const userId = req.session.userId;
    
    if (!googleId || !googleEmail) {
        return res.status(400).json({ error: 'Missing required Google OAuth data' });
    }
    
    try {
        // Check if Google account is already linked to another user
        const existingGoogleUser = await pool.query(
            'SELECT user_id FROM users WHERE google_id = $1 AND user_id != $2',
            [googleId, userId]
        );
        
        if (existingGoogleUser.rows.length > 0) {
            return res.status(409).json({ error: 'This Google account is already linked to another user' });
        }
        
        // Update user with Google OAuth information
        await pool.query(
            `UPDATE users SET 
                google_id = $1, 
                google_oauth_completed = TRUE,
                user_first_name = COALESCE($2, user_first_name),
                user_last_name = COALESCE($3, user_last_name),
                user_image = COALESCE($4, user_image)
             WHERE user_id = $5`,
            [googleId, googleFirstName, googleLastName, googlePicture, userId]
        );
        
        console.log(`--- DEBUG: Google account linked to user ID: ${userId} ---`);
        res.json({ message: 'Google account linked successfully' });
        
    } catch (err) {
        console.error('--- ERROR: Error linking Google account:', err.stack);
        res.status(500).json({ error: 'Failed to link Google account' });
    }
});

// Unlink Google account
router.post('/unlink-google', authenticateUser, async (req, res) => {
    const userId = req.session.userId;
    
    try {
        await pool.query(
            'UPDATE users SET google_id = NULL, google_oauth_completed = FALSE WHERE user_id = $1',
            [userId]
        );
        
        console.log(`--- DEBUG: Google account unlinked from user ID: ${userId} ---`);
        res.json({ message: 'Google account unlinked successfully' });
        
    } catch (err) {
        console.error('--- ERROR: Error unlinking Google account:', err.stack);
        res.status(500).json({ error: 'Failed to unlink Google account' });
    }
});

// Clean up quoted profile image URLs (one-time fix)
router.post('/cleanup-profile-images', async (req, res) => {
    try {
        console.log('--- DEBUG: Starting profile image cleanup...');
        
        // First, let's see what's actually in the database
        const allImages = await pool.query(
            'SELECT user_id, user_email, user_image FROM users WHERE user_image IS NOT NULL'
        );
        
        console.log(`--- DEBUG: Total users with profile images: ${allImages.rows.length}`);
        
        // Show all profile images for debugging
        for (const row of allImages.rows) {
            console.log(`--- DEBUG: User ${row.user_id} (${row.user_email}): "${row.user_image}"`);
        }
        
        // Find all users with quoted profile image URLs (various quote types)
        const result = await pool.query(
            'SELECT user_id, user_email, user_image FROM users WHERE user_image LIKE \'"%"\' OR user_image LIKE \'"%"\' OR user_image LIKE \'%"\' OR user_image LIKE \'%"\''
        );
        
        console.log(`--- DEBUG: Found ${result.rows.length} users with quoted profile images`);
        
        let cleanedCount = 0;
        for (const row of result.rows) {
            if (row.user_image) {
                // Remove various types of quotes and extra whitespace
                const cleanedUrl = row.user_image
                    .replace(/^["'`]|["'`]$/g, '')  // Remove quotes, single quotes, backticks
                    .replace(/^["'`]|["'`]$/g, '')  // Remove smart quotes
                    .trim();
                
                if (cleanedUrl !== row.user_image) {
                    await pool.query(
                        'UPDATE users SET user_image = $1 WHERE user_id = $2',
                        [cleanedUrl, row.user_id]
                    );
                    console.log(`--- DEBUG: Cleaned user ${row.user_id}: "${row.user_image}" -> "${cleanedUrl}"`);
                    cleanedCount++;
                }
            }
        }
        
        console.log(`--- DEBUG: Profile image cleanup completed. ${cleanedCount} users updated.`);
        res.json({ 
            message: 'Profile image cleanup completed', 
            totalUsers: allImages.rows.length,
            totalFound: result.rows.length,
            cleanedCount: cleanedCount,
            allImages: allImages.rows.map(row => ({
                user_id: row.user_id,
                user_email: row.user_email,
                user_image: row.user_image
            }))
        });
        
    } catch (err) {
        console.error('--- ERROR: Profile image cleanup failed:', err.stack);
        res.status(500).json({ error: 'Failed to cleanup profile images' });
    }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Check if user exists and get their account type
        const user = await pool.query(
            'SELECT user_id, user_email, google_id, google_oauth_completed FROM users WHERE user_email = $1',
            [email.toLowerCase()]
        );

        if (user.rows.length === 0) {
            // Don't reveal if email exists or not (security best practice)
            return res.json({
                message: 'If an account with this email exists, you will receive a password reset link.'
            });
        }

        const userData = user.rows[0];

        // Google-only user
        if (userData.google_id && userData.google_oauth_completed) {
            return res.status(400).json({
                error: 'This email is linked to a Google account. Please sign in with Google instead. You cannot reset the password for a Google account here.'
            });
        }

        // Hybrid user (has both Google and regular password) - allow password reset
        if (userData.google_id && userData.google_oauth_completed) {
            return res.json({
                message: 'Password reset link sent to your email. You can also sign in with Google.'
            });
        }

        // Regular user - allow password reset
        return res.json({
            message: 'Password reset link sent to your email.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;