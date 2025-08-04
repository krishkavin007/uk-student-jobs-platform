const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import the centralized pool and ADMIN_JWT_SECRET from config files
const pool = require('../config/db');
const { ADMIN_JWT_SECRET } = require('../config/secrets');

// Import the centralized admin authentication middleware
const authenticateAdminJWT = require('../middleware/authenticateAdminJWT');
const authorizeAdmin = require('../middleware/authorizeAdmin');


// Admin Login
router.post('/login', async (req, res) => {
    // Frontend sends 'username' in the body, which can be an actual username or an email
    const { username, password } = req.body;
    console.log(`--- DEBUG: Admin login attempt for identifier (username or email): ${username} ---`);

    try {
        // ⭐ FIX: Modified query to check for either username OR admin_email ⭐
        const result = await pool.query(
            'SELECT admin_id, username, password_hash, role, admin_email, admin_roles, access_level, is_active, created_at, updated_at, last_login_at FROM admin_users WHERE username = $1 OR admin_email = $1',
            [username] // Now $1 will be checked against both username and admin_email
        );
        if (result.rows.length === 0) {
            console.log('--- DEBUG: Admin login failed: Admin user not found by username or email.');
            return res.status(401).json({ error: 'No admin account found with this username or email' });
        }

        const adminUser = result.rows[0];
        const isMatch = await bcrypt.compare(password, adminUser.password_hash);

        if (!isMatch) {
            console.log('--- DEBUG: Admin login failed: Password mismatch.');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // ⭐ NEW FIX: Check if the admin user is active ⭐
        if (!adminUser.is_active) {
            console.log(`--- DEBUG: Admin login failed: User ${adminUser.username} is inactive.`);
            return res.status(403).json({ error: 'Account is inactive. Please contact support.' });
        }

        // ⭐ NEW FIX: Update last_login_at for the admin user ⭐
        await pool.query(
            'UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE admin_id = $1',
            [adminUser.admin_id]
        );
        console.log(`--- DEBUG: Updated last_login_at for admin ID: ${adminUser.admin_id} ---`);


        // Generate JWT token
        const token = jwt.sign(
            { admin_id: adminUser.admin_id, username: adminUser.username, role: adminUser.role },
            ADMIN_JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set the JWT as an httpOnly cookie
        res.cookie('admin_jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000,
            sameSite: 'Lax',
            path: '/'
        });

        console.log('--- DEBUG: Admin login successful, token generated and set as httpOnly cookie. ---');
        res.status(200).json({ message: 'Admin login successful' });

    } catch (err) {
        console.error('--- ERROR: Error during admin login:', err.stack);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

// Admin Check - for verifying admin session/token
router.get('/admin-check', authenticateAdminJWT, (req, res) => {
    console.log('--- DEBUG: Admin /admin-check endpoint hit. Admin token is valid.');
    // @ts-ignore
    res.status(200).json({ message: 'Admin authenticated', admin: req.adminUser });
});

// Get currently logged-in admin's profile
router.get('/me', authenticateAdminJWT, (req, res) => {
    console.log('--- DEBUG: Admin /me endpoint hit. ---');
    // @ts-ignore
    if (req.adminUser) {
        // @ts-ignore
        const { password_hash, ...adminUserWithoutHash } = req.adminUser;
        console.log(`--- DEBUG: Admin /me: Data for admin ID ${req.adminUser.admin_id} retrieved.`);
        return res.json(adminUserWithoutHash);
    }
    console.log('--- DEBUG: Admin /me: Not authenticated or adminUser not found on request.');
    res.status(401).json({ error: 'Not authenticated as admin.' });
});

// Admin Logout
router.post('/logout', (req, res) => {
    console.log('--- DEBUG: Admin logout attempt. ---');
    // Clear the httpOnly cookie
    res.clearCookie('admin_jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/'
    });
    console.log('--- DEBUG: Admin logout successful, admin_jwt cookie cleared. ---');
    res.status(200).json({ message: 'Logged out successfully.' });
});

// Get All Admin Users (Admin Only)
router.get('/admin-users', authenticateAdminJWT, authorizeAdmin(['super_admin', 'admin']), async (req, res) => {
    console.log('--- DEBUG: Admin /admin-users endpoint hit. Fetching all admin users. ---');
    try {
        const result = await pool.query(
            'SELECT admin_id, username, admin_email, first_name, last_name, role, is_active, admin_roles, access_level, created_at, updated_at, last_login_at FROM admin_users ORDER BY username'
        );
        console.log(`--- DEBUG: Fetched ${result.rows.length} admin users. ---`);
        res.json(result.rows);
    } catch (err) {
        console.error('--- ERROR: Error fetching admin users:', err.stack);
        res.status(500).json({ error: 'Failed to fetch admin users' });
    }
});

// Get Single Admin User by ID (Admin Only)
router.get('/admin-users/:id', authenticateAdminJWT, authorizeAdmin(['super_admin', 'admin']), async (req, res) => {
    const { id } = req.params;
    console.log(`--- DEBUG: Admin /admin-users/${id} endpoint hit. Fetching admin user details. ---`);

    try {
        const result = await pool.query(
            'SELECT admin_id, username, admin_email, first_name, last_name, role, is_active, admin_roles, access_level, created_at, updated_at, last_login_at FROM admin_users WHERE admin_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            console.log(`--- DEBUG: Admin user with ID ${id} not found.`);
            return res.status(404).json({ error: 'Admin user not found' });
        }

        const adminUser = result.rows[0];
        console.log(`--- DEBUG: Admin user ID ${id} details fetched.`);
        res.json(adminUser);

    } catch (err) {
        console.error(`--- ERROR: Error fetching admin user ID ${id}:`, err.stack);
        res.status(500).json({ error: 'Failed to fetch admin user details' });
    }
});

// Add Admin User (POST /api/admin/admin-users)
router.post('/admin-users', authenticateAdminJWT, authorizeAdmin(['super_admin']), async (req, res) => {
    const { username, password, admin_email, role, is_active, admin_roles, access_level, first_name, last_name } = req.body;

    if (!username || !password || !admin_email) {
        return res.status(400).json({ error: 'Username, password, and email are required' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO admin_users (username, password_hash, admin_email, role, is_active, admin_roles, access_level, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING admin_id, username, admin_email, role, is_active, admin_roles, access_level, first_name, last_name, created_at, updated_at, last_login_at',
            [
                username,
                passwordHash,
                admin_email,
                role || 'admin',
                is_active !== undefined ? is_active : true,
                admin_roles || [],
                access_level !== undefined ? access_level : 1,
                first_name || null,
                last_name || null
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding new admin user:', err.stack);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Username or Email already exists' });
        }
        res.status(500).json({ error: 'Failed to add admin user' });
    }
});


// Update Admin User (PUT /api/admin/admin-users/:id)
router.put('/admin-users/:id', authenticateAdminJWT, authorizeAdmin(['super_admin', 'admin']), async (req, res) => {
    const { id } = req.params;
    const { username, admin_email, role, is_active, admin_roles, access_level, first_name, last_name } = req.body;

    try {
        const result = await pool.query(
            `UPDATE admin_users SET
                username = COALESCE($1, username),
                admin_email = COALESCE($2, admin_email),
                role = COALESCE($3, role),
                is_active = COALESCE($4, is_active),
                admin_roles = COALESCE($5, admin_roles),
                access_level = COALESCE($6, access_level),
                first_name = COALESCE($7, first_name),
                last_name = COALESCE($8, last_name),
                updated_at = CURRENT_TIMESTAMP
             WHERE admin_id = $9
             RETURNING admin_id, username, admin_email, first_name, last_name, role, is_active, admin_roles, access_level, created_at, updated_at, last_login_at`,
            [username, admin_email, role, is_active, admin_roles, access_level, first_name, last_name, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Admin user not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`Error updating admin user ${id}:`, err.stack);
        res.status(500).json({ error: 'Failed to update admin user' });
    }
});

// Delete Admin User
router.delete('/admin-users/:id', authenticateAdminJWT, authorizeAdmin(['super_admin']), async (req, res) => {
    const { id } = req.params;
    console.log(`--- DEBUG: Admin /admin-users/${id} DELETE endpoint hit. ---`);
    try {
        const result = await pool.query('DELETE FROM admin_users WHERE admin_id = $1 RETURNING admin_id', [id]);
        if (result.rows.length === 0) {
            console.log(`--- DEBUG: Admin user with ID ${id} not found for deletion.`);
            return res.status(404).json({ error: 'Admin user not found' });
        }
        console.log(`--- DEBUG: Admin user with ID ${id} deleted successfully.`);
        res.status(200).json({ message: 'Admin user deleted successfully' });
    } catch (err) {
        console.error(`--- ERROR: Error deleting admin user ${id}:`, err.stack);
        res.status(500).json({ error: 'Failed to delete admin user' });
    }
});

module.exports = router;