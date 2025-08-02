// src/server/routes/userRoutes.js
const express = require('express');
const router = express.Router();

// --- ADDED: express.json() middleware for this router ---
// This ensures that JSON request bodies are parsed and available in req.body
// for routes like POST / (signup) and any other JSON-based routes.
router.use(express.json());

const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Import the centralized pool from config file
const pool = require('../config/db');
// Import the centralized authentication middleware
const authenticateUser = require('../middleware/authenticateUser');
const authenticateAdminJWT = require('../middleware/authenticateAdminJWT');
const authorizeAdmin = require('../middleware/authorizeAdmin'); // Import the authorization middleware

// --- Multer Storage Configuration for Profile Images ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'users_images');
        // Ensure the directory exists
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Use the original extension
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB file size limit
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png'];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            // This error is passed by Multer via next(err)
            cb(new Error('Only JPEG, JPG, and PNG image files are allowed!'), false);
        }
    }
});

// POST create new user (Signup)
router.post('/', async (req, res) => {
    const {
        user_username,
        user_email,
        password, // The plain text password from the request body
        user_type,
        user_first_name,
        user_last_name,
        contact_phone_number,
        organisation_name,
        university_college,
        user_city,
    } = req.body;

    // --- Backend Validation Starts Here ---

    // 1. Basic required fields check
    if (!user_email || !password || !user_type) {
        return res.status(400).json({ error: { message: 'Email, password, and user type are required.' } });
    }

    // --- CORRECTION: Enforce NOT NULL for user_first_name and user_last_name as per DB schema ---
    if (!user_first_name) {
        return res.status(400).json({ error: { message: 'First name is required.' } });
    }
    if (!user_last_name) {
        return res.status(400).json({ error: { message: 'Last name is required.' } });
    }
    // --- END CORRECTION ---

    // 2. Password length check (must be at least 6 characters)
    if (password.length < 6) {
        return res.status(400).json({ error: { message: 'Password must be at least 6 characters long.' } });
    }

   // 3. UK Phone Number format check (mobile numbers only)
const UK_PHONE_REGEX = /^(?:\+44\s?7|0044\s?7|44\s?7|07|7)\d{3}[\s-]?\d{3}[\s-]?\d{3}$/;

// Clean the phone number before validation and insertion
const cleanedPhoneNumber = contact_phone_number
  ? contact_phone_number.replace(/[\s()-]/g, '')
  : null;

if (cleanedPhoneNumber && !UK_PHONE_REGEX.test(contact_phone_number)) {
  return res.status(400).json({
    error: {
      message:
        'Please enter a valid UK mobile number (e.g., 07123 456789, +447123456789, or 447123456789).',
    },
  });
}

    // --- Backend Validation Ends Here ---

    try {
        // Check if email already exists
        const checkEmail = await pool.query('SELECT user_id FROM users WHERE user_email = $1', [user_email]);
        if (checkEmail.rows.length > 0) {
            return res.status(409).json({ error: { message: 'Email already registered.' } });
        }

        // Check if username already exists (if provided)
        if (user_username) {
            const checkUsername = await pool.query('SELECT user_id FROM users WHERE user_username = $1', [user_username]);
            if (checkUsername.rows.length > 0) {
                return res.status(409).json({ error: { message: 'Username already taken.' } });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

        const result = await pool.query(
            `INSERT INTO users (
                user_username, user_email, password_hash, user_type,
                user_first_name, user_last_name, contact_phone_number,
                organisation_name, university_college, user_city
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING user_id, user_username, user_email, user_type, created_at`,
            [
                user_username || null, // Allow null if not provided
                user_email,
                hashedPassword,
                user_type,
                user_first_name, // Now required as per validation
                user_last_name,  // Now required as per validation
                cleanedPhoneNumber || null, // Use the cleaned phone number here
                organisation_name || null,
                university_college || null,
                user_city || null,
            ]
        );

        // --- CRUCIAL ADDITION: Set session data after successful signup ---
        req.session.userId = result.rows[0].user_id;
        req.session.userEmail = result.rows[0].user_email;
        req.session.userType = result.rows[0].user_type;
        // Optionally store more data if directly needed in the session middleware for other checks
        // For example, if you have a middleware that checks if an employer is logged in:
        // req.session.organisationName = result.rows[0].organisation_name;

        // Ensure the session is saved before sending the response.
        // This is important for `saveUninitialized: false`.
        await req.session.save();
        console.log('--- DEBUG: Session set successfully for new user (ID:', req.session.userId, ') ---');
        // --- END CRUCIAL ADDITION ---


        res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });

    } catch (err) {
        console.error('--- ERROR: Error registering user:', err.stack);
        if (err.code === '23505') { // PostgreSQL unique violation error code
            if (err.detail.includes('user_email')) {
                return res.status(409).json({ error: { message: 'Email already registered.' } });
            }
            if (err.detail.includes('user_username')) {
                return res.status(409).json({ error: { message: 'Username already taken.' } });
            }
        }
        res.status(500).json({ error: { message: 'Failed to register user' } });
    }
});


// GET user by ID (Authenticated users and Admin)
router.get('/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const userIdFromSession = req.session.userId;
    // @ts-ignore
    const isAdmin = req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'super_admin');
      console.log('--- DEBUG: PUT /api/user/:id request for ID:', id);
        console.log('--- DEBUG: Request Body:', req.body);
        console.log('--- DEBUG: isAdmin flag:', isAdmin); // <-- ADD THIS
        console.log('--- DEBUG: req.adminUser:', req.adminUser); // <-- ADD THIS to see if middleware is populating it

    // Allow access if user is requesting their own profile OR if it's an admin
    if (userIdFromSession !== parseInt(id, 10) && !isAdmin) {
        console.log(`--- DEBUG: Unauthorized attempt to access user ID ${id} by user ID ${userIdFromSession}.`);
        return res.status(403).json({ error: { message: 'Forbidden: You can only access your own profile unless you are an admin.' } });
    }

    try {
        const result = await pool.query(
            // UPDATED: Added google_id, user_status, and last_login
            `SELECT user_id, user_username, user_email, google_id, user_type,
                    user_first_name, user_last_name, contact_phone_number,
                    organisation_name, university_college, user_city, user_image,
                    created_at, updated_at, user_status, last_login
             FROM users WHERE user_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            console.log(`--- DEBUG: User ID ${id} not found.`);
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('--- ERROR: Error fetching user by ID:', err.stack);
        res.status(500).json({ error: { message: 'Failed to fetch user' } });
    }
});

// PUT update user by ID (Authenticated users for their own profile, or Admin)
router.put(
    '/:id',
   authenticateAdminJWT,
    // Custom middleware to handle Multer errors specifically
    (req, res, next) => {
        // Changed 'userImage' to 'profileImage' to match common frontend expectations
        upload.single('userImage')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                console.error('--- ERROR: Multer error caught directly in route middleware:', err.message);
                // Clean up partially uploaded file if it exists
                if (req.file) {
                    const filePath = req.file.path;
                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) console.error('--- ERROR: Failed to delete partial file:', unlinkErr);
                    });
                }
                return res.status(400).json({ error: { message: `File upload error: ${err.message}` } });
            } else if (err) {
                // For any other non-Multer error during upload processing, pass to next error handler
                console.error('--- ERROR: Non-Multer error during upload processing (will be passed to next):', err.stack);
                return next(err);
            }
            // If no error from Multer, proceed to the next middleware (the async route handler)
            next();
        });
    },
    async (req, res) => { // Your main route logic starts here
        const { id } = req.params;
        const userIdFromSession = req.session.userId;
        // @ts-ignore
        const isAdmin = req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'super_admin');

        // --- DEBUG LOGS ---
        console.log('--- DEBUG: Received PUT /api/user/:id request for ID:', id);
        console.log('--- DEBUG: Request Body:', req.body);
        console.log('--- DEBUG: Request File:', req.file);
        // --- END DEBUG LOGS ---

        // Allow update if user is updating their own profile OR if it's an admin
        if (userIdFromSession !== parseInt(id, 10) && !isAdmin) {
            console.log(`--- DEBUG: Unauthorized attempt to update user ID ${id} by user ID ${userIdFromSession}.`);
            return res.status(403).json({ error: { message: 'Forbidden: You can only update your own profile unless you are an admin.' } });
        }

        // Access fields from req.body (for text fields) and req.file (for the uploaded image)
        const {
            user_username,
            user_email,
            newPassword,
            user_type,
            user_first_name,
            user_last_name,
            contact_phone_number,
            organisation_name,
            university_college,
            user_city,
            user_status, // <--- ADDED: user_status to be deconstructed from req.body
        } = req.body;

        const uploadedImagePath = req.file ? `/uploads/users_images/${req.file.filename}` : undefined;
        const removeImage = req.body.removeUserImage === 'true'; // Assuming frontend sends this flag

        let updateFields = [];
        let queryParams = [id];
        let paramIndex = 2;

        try {
            // Build dynamic update query
            if (user_username !== undefined) {
                if (user_username !== null && user_username !== '') {
                    const checkUsername = await pool.query(
                        'SELECT user_id FROM users WHERE user_username = $1 AND user_id != $2',
                        [user_username, id]
                    );
                    if (checkUsername.rows.length > 0) {
                        return res.status(409).json({ error: { message: 'Username already taken.' } });
                    }
                }
                updateFields.push(`user_username = $${paramIndex++}`);
                queryParams.push(user_username === '' ? null : user_username);
            }
            if (user_email !== undefined) {
                const checkEmail = await pool.query(
                    'SELECT user_id FROM users WHERE user_email = $1 AND user_id != $2',
                    [user_email, id]
                );
                if (checkEmail.rows.length > 0) {
                    return res.status(409).json({ error: { message: 'Email already taken.' } });
                }
                updateFields.push(`user_email = $${paramIndex++}`);
                queryParams.push(user_email);
            }
            if (newPassword) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                updateFields.push(`password_hash = $${paramIndex++}`);
                queryParams.push(hashedPassword);
            }
            if (user_type !== undefined && isAdmin) { // Only allow admin to change user_type
                updateFields.push(`user_type = $${paramIndex++}`);
                queryParams.push(user_type);
            }
            if (user_first_name !== undefined) {
                updateFields.push(`user_first_name = $${paramIndex++}`);
                queryParams.push(user_first_name === '' ? null : user_first_name);
            }
            if (user_last_name !== undefined) {
                updateFields.push(`user_last_name = $${paramIndex++}`);
                queryParams.push(user_last_name === '' ? null : user_last_name);
            }
            if (contact_phone_number !== undefined) {
                updateFields.push(`contact_phone_number = $${paramIndex++}`);
                queryParams.push(contact_phone_number === '' ? null : contact_phone_number);
            }
            if (organisation_name !== undefined) {
                updateFields.push(`organisation_name = $${paramIndex++}`);
                queryParams.push(organisation_name === '' ? null : organisation_name);
            }
            if (university_college !== undefined) {
                updateFields.push(`university_college = $${paramIndex++}`);
                queryParams.push(university_college === '' ? null : university_college);
            }
            if (user_city !== undefined) {
                updateFields.push(`user_city = $${paramIndex++}`);
                queryParams.push(user_city === '' ? null : user_city);
            }

            // --- ADDED: Handle user_status update ---
            if (user_status !== undefined && isAdmin) { // Only allow admin to change user_status
                 console.log('--- DEBUG: Adding user_status to updateFields:', user_status); // <-- ADD THIS
                updateFields.push(`user_status = $${paramIndex++}`);
                queryParams.push(user_status);
            }
            // Note: 'is_active' is derived on the frontend based on user_status,
            // and is not a direct column in the 'User' interface or in the DB based on your schema.

            // --- Handle user_image update ---
            if (uploadedImagePath !== undefined) {
                // If a new image was uploaded, update the path
                updateFields.push(`user_image = $${paramIndex++}`);
                queryParams.push(uploadedImagePath);

                // Optional: Delete old image file if it exists
                const oldUserResult = await pool.query('SELECT user_image FROM users WHERE user_id = $1', [id]);
                if (oldUserResult.rows.length > 0 && oldUserResult.rows[0].user_image) {
                    const oldImagePath = path.join(process.cwd(), 'public', oldUserResult.rows[0].user_image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlink(oldImagePath, (err) => {
                            if (err) console.error('--- ERROR: Error deleting old user image file:', err);
                        });
                    }
                }
            } else if (removeImage) {
                // If frontend explicitly requested image removal, set to null
                updateFields.push(`user_image = $${paramIndex++}`);
                queryParams.push(null); // Set image to null

                // Optional: Delete current image file if it exists
                const oldUserResult = await pool.query('SELECT user_image FROM users WHERE user_id = $1', [id]);
                if (oldUserResult.rows.length > 0 && oldUserResult.rows[0].user_image) {
                    const oldImagePath = path.join(process.cwd(), 'public', oldUserResult.rows[0].user_image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlink(oldImagePath, (err) => {
                            if (err) console.error('--- ERROR: Error deleting current user image file:', err);
                        });
                    }
                }
            }
            // Note: If no new image and no removeImage flag, user_image field is not updated.

            // --- DEBUG LOGS ---
            console.log('--- DEBUG: Update Fields Array (before query):', updateFields);
            console.log('--- DEBUG: Query Parameters Array (before query):', queryParams);
            console.log('--- DEBUG: Constructed SQL SET clause (before query):', updateFields.join(', '));
            // --- END DEBUG LOGS ---

            if (updateFields.length === 0) {
                return res.status(400).json({ error: { message: 'No valid fields provided for update.' } });
            }

            const result = await pool.query(
                `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE user_id = $1 RETURNING user_id, user_username, user_email, user_type, user_image, user_status, updated_at`, // <--- ADDED: user_status AND updated_at to RETURNING clause
                queryParams
            );

            if (result.rows.length === 0) {
                console.log(`--- DEBUG: Update failed: User ID ${id} not found.`);
                return res.status(404).json({ error: { message: 'User not found or nothing to update.' } });
            }

            console.log(`--- DEBUG: User ID ${id} updated. ---`);
            res.json({ message: 'User updated successfully', user: result.rows[0] });

        } catch (err) {
            // This catch block handles errors *within* the async route logic
            // (e.g., database errors, bcrypt errors, etc.), NOT Multer errors.
            console.error('--- DEBUG: Error caught in userRoutes PUT /:id handler (inside try/catch):');
            console.error('--- DEBUG: Error object:', err);
            console.error('--- DEBUG: Error stack:', err.stack);

            if (err.code === '23505') { // PostgreSQL unique violation error code
                if (err.detail.includes('user_email')) {
                    return res.status(409).json({ error: { message: 'Email already taken.' } });
                }
                if (err.detail.includes('user_username')) {
                    return res.status(409).json({ error: { message: 'Username already taken.' } });
                }
            }
            // For any other unexpected server error that happens within this try block
            res.status(500).json({ error: { message: 'Failed to update user' } });
        }
    }
);

// DELETE user by ID (Admin-only)
router.delete('/:id', authenticateAdminJWT, async (req, res) => {
    const { id } = req.params;
    try {
        const userResult = await pool.query('SELECT user_image FROM users WHERE user_id = $1', [id]);
        if (userResult.rows.length > 0 && userResult.rows[0].user_image) {
            const imagePath = path.join(process.cwd(), 'public', userResult.rows[0].user_image);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error('--- ERROR: Error deleting user image file:', err);
                });
            }
        }

        const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [id]);
        if (result.rows.length === 0) {
            console.log(`--- DEBUG: Delete failed: User ID ${id} not found.`);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(`--- DEBUG: User ID ${id} deleted. ---`);
        res.status(204).send();
    } catch (err) {
        console.error('--- ERROR: Error deleting user:', err.stack);
        res.status(500).json({ error: { message: 'Failed to delete user' } });
    }
});

// --- NEW ADMIN-SPECIFIC USER MANAGEMENT ENDPOINTS ---

// GET /admin/users - List all users with pagination/filtering (Admin/Super Admin only)
router.get('/admin/users', authenticateAdminJWT, authorizeAdmin(['super_admin', 'admin', 'moderator', 'viewer']), async (req, res) => {
    // @ts-ignore
    const requestingAdminRole = req.adminUser.role; // Role of the admin making the request

    // The authorization is now handled by the authorizeAdmin middleware.
    // However, the existing conditional logic below ensures only super_admin/admin can access.
    // If authorizeAdmin is fully configured, this check might be redundant but doesn't harm.
    const isAdmin = requestingAdminRole === 'admin' || requestingAdminRole === 'super_admin' || requestingAdminRole === 'moderator' || requestingAdminRole === 'viewer';


    if (!isAdmin) {
        return res.status(403).json({ error: { message: 'Forbidden: Insufficient role permissions.' } });
    }

    const {
        limit = 10,
        offset = 0,
        user_type,
        user_status,
        user_email,
        user_username,
        search // General search term for username/email/first_name/last_name
    } = req.query;

    let query = `SELECT
        user_id,
        user_username,
        user_email,
        google_id,
        user_type,
        created_at,
        updated_at,            -- ADDED THIS LINE: updated_at
        organisation_name,
        contact_phone_number,
        user_first_name,
        user_last_name,
        university_college,
        user_image,
        user_city,
        user_status,
        last_login             -- ADDED THIS LINE: last_login
        FROM users WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM users WHERE 1=1`; // countQuery doesn't need all fields, just count(*)
    const queryParams = [];
    let paramIndex = 1;

    // Filtering conditions
    if (user_type) {
        query += ` AND user_type = $${paramIndex}`;
        countQuery += ` AND user_type = $${paramIndex}`;
        queryParams.push(user_type);
        paramIndex++;
    }
    if (user_status) {
        query += ` AND user_status = $${paramIndex}`;
        countQuery += ` AND user_status = $${paramIndex}`;
        queryParams.push(user_status);
        paramIndex++;
    }
    if (user_email) {
        query += ` AND user_email ILIKE $${paramIndex}`;
        countQuery += ` AND user_email ILIKE $${paramIndex}`;
        queryParams.push(`%${user_email}%`);
        paramIndex++;
    }
    if (user_username) {
        query += ` AND user_username ILIKE $${paramIndex}`;
        countQuery += ` AND user_username ILIKE $${paramIndex}`;
        queryParams.push(`%${user_username}%`);
        paramIndex++;
    }
    if (search) {
        query += ` AND (user_username ILIKE $${paramIndex} OR user_email ILIKE $${paramIndex} OR user_first_name ILIKE $${paramIndex} OR user_last_name ILIKE $${paramIndex})`;
        countQuery += ` AND (user_username ILIKE $${paramIndex} OR user_email ILIKE $${paramIndex} OR user_first_name ILIKE $${paramIndex} OR user_last_name ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
    }

    // Pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit, 10), parseInt(offset, 10));

    try {
        const usersResult = await pool.query(query, queryParams);
        const totalCountResult = await pool.query(countQuery, queryParams.slice(0, queryParams.length - 2)); // Remove limit/offset for count

        res.json({
            total: parseInt(totalCountResult.rows[0].count, 10),
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            users: usersResult.rows
        });
    } catch (err) {
        console.error('--- ERROR: Error fetching users for admin panel:', err.stack);
        res.status(500).json({ error: { message: 'Failed to fetch users' } });
    }
});


// UPDATED: PUT /admin/users/:id - Modify user status/type (Admin/Super Admin only)
// Now accepts user_id as a URL parameter
router.put('/admin/users/:id', authenticateAdminJWT, authorizeAdmin(['super_admin', 'admin']), async (req, res) => {
    // @ts-ignore
    const requestingAdminRole = req.adminUser.role;
    const { id } = req.params; // Get user_id from URL parameter

    const isSuperAdmin = requestingAdminRole === 'super_admin';
    const isAdmin = requestingAdminRole === 'admin';

    // Ensure only super_admin or admin can perform updates
    if (!isSuperAdmin && !isAdmin) {
        return res.status(403).json({ error: { message: 'Forbidden: Insufficient role permissions.' } });
    }

    const { user_status, user_type } = req.body; // user_id is now from req.params

    if (!id) { // Check if ID is present from params
        return res.status(400).json({ error: { message: 'User ID is required for update.' } });
    }

    let updateFields = [];
    const queryParams = [id]; // Use ID from params as the first query parameter
    let paramIndex = 2;

    try {
        // Fetch current user details to apply role-based restrictions
        const currentUserResult = await pool.query('SELECT user_type FROM users WHERE user_id = $1', [id]);
        if (currentUserResult.rows.length === 0) {
            return res.status(404).json({ error: { message: 'User not found.' } });
        }
        const targetUserType = currentUserResult.rows[0].user_type;

        // Super Admin can change any user's status/type, including other admins/super admins
        // Admin can change status/type of regular users, but NOT other admins/super_admins
        if (!isSuperAdmin) { // If not a super_admin
            if (targetUserType === 'admin' || targetUserType === 'super_admin') {
                return res.status(403).json({ error: { message: 'Forbidden: Only a super admin can modify other admin accounts.' } });
            }
            if (user_type && (user_type === 'admin' || user_type === 'super_admin')) {
                return res.status(403).json({ error: { message: 'Forbidden: Only a super admin can promote users to admin roles.' } });
            }
        }


        if (user_status !== undefined) {
            updateFields.push(`user_status = $${paramIndex++}`);
            queryParams.push(user_status);
        }
        if (user_type !== undefined) {
            updateFields.push(`user_type = $${paramIndex++}`);
            queryParams.push(user_type);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: { message: 'No valid fields provided for update (user_status or user_type).' } });
        }

        const result = await pool.query(
            `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE user_id = $1 RETURNING user_id, user_username, user_email, user_type, user_status, updated_at`,
            queryParams
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: { message: 'User not found.' } });
        }

        res.json({ message: 'User updated successfully', user: result.rows[0] });

    } catch (err) {
        console.error('--- ERROR: Error updating user by admin:', err.stack);
        res.status(500).json({ error: { message: 'Failed to update user' } });
    }
});

// UPDATED: DELETE /admin/users/:id - PERFORMS HARD DELETE (Conditional Admin/Super Admin)
// Now accepts user_id as a URL parameter
router.delete('/admin/users/:id', authenticateAdminJWT, authorizeAdmin(['super_admin', 'admin']), async (req, res) => {
    // @ts-ignore
    const requestingAdminRole = req.adminUser.role; // Role of the admin making the request
    const { id } = req.params; // Get user_id from URL parameter

    if (!id) { // Check if ID is present from params
        return res.status(400).json({ error: { message: 'User ID is required for deletion.' } });
    }

    try {
        // First, retrieve the user_type of the user to be deleted
        const targetUserResult = await pool.query('SELECT user_type, user_image FROM users WHERE user_id = $1', [id]);

        if (targetUserResult.rows.length === 0) {
            return res.status(404).json({ error: { message: 'User not found.' } });
        }

        const targetUserType = targetUserResult.rows[0].user_type;
        const targetUserImage = targetUserResult.rows[0].user_image;

        // Conditional authorization based on target user's role
        const isSuperAdminRequest = requestingAdminRole === 'super_admin';
        const isTargetAdmin = targetUserType === 'admin' || targetUserType === 'super_admin';

        if (!isSuperAdminRequest && isTargetAdmin) {
            // An 'admin' role is trying to delete another 'admin' or 'super_admin'
            return res.status(403).json({ error: { message: 'Forbidden: Only a super admin can delete other admin or super admin accounts.' } });
        }

        // If the requesting admin is a super_admin, or if the target is not an admin/super_admin, proceed.
        // --- Optional: Delete associated user image file before deleting user record ---
        if (targetUserImage) {
            const imagePath = path.join(process.cwd(), 'public', targetUserImage);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error('--- ERROR: Error deleting user image file during hard delete:', err);
                });
            }
        }
        // --- End Optional Image Deletion ---

        // Perform the hard delete
        const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [id]);

        if (result.rows.length === 0) {
            // This case should ideally not be hit if targetUserResult.rows.length > 0
            return res.status(404).json({ error: { message: 'User not found or already deleted.' } });
        }

        console.log(`--- DEBUG: User ID ${id} permanently deleted. ---`);
        res.status(204).send(); // 204 No Content for successful deletion
    } catch (err) {
        console.error('--- ERROR: Error permanently deleting user:', err.stack);
        res.status(500).json({ error: { message: 'Failed to permanently delete user' }});
    }
});

module.exports = router;