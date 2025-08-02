// src/server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Import the centralized pool and secrets from config files
const pool = require('../config/db');
const { USER_JWT_SECRET, SESSION_SECRET } = require('../config/secrets'); // SESSION_SECRET primarily for context

// Import the centralized authenticateUser middleware
const authenticateUser = require('../middleware/authenticateUser');


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
            'SELECT user_id, user_email, user_username FROM users WHERE user_email = $1 OR user_username = $2',
            [user_email, user_username || null] // Compare with lowercase email
        );

        if (checkUser.rows.length > 0) {
            const existingUser = checkUser.rows[0];
            if (existingUser.user_email === user_email) {
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
            return res.status(401).json({ error: 'Invalid credentials' });
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
                    organisation_name, university_college, user_city, user_image, created_at
             FROM users WHERE user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            console.log(`--- DEBUG: /api/auth/me: User with ID ${userId} not found in DB.`);
            return res.status(404).json({ error: 'User data not found.' });
        }

        const user = result.rows[0];
        console.log(`--- DEBUG: /api/auth/me: User data retrieved for ID ${userId}.`);
        res.json({ user });

    } catch (err) {
        console.error('--- ERROR: Error fetching user data from /api/auth/me:', err.stack);
        res.status(500).json({ error: 'Failed to fetch user data.' });
    }
});


module.exports = router;