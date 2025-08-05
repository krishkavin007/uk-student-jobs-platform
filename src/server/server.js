// server.js
require('dotenv').config();

console.log('--- SERVER.JS STARTING UP ---');

const express = require('express');
const next = require('next');
const { Pool } = require('pg');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const pgSession = require('connect-pg-simple')(session);

const pool = require('./config/db');
const { ADMIN_JWT_SECRET, USER_JWT_SECRET, SESSION_SECRET } = require('./config/secrets');

const authRoutes = require('./routes/authRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');

// --- NEW IMPORTS: Authentication and Authorization Middleware for Admin Endpoints ---
const authenticateAdminJWT = require('./middleware/authenticateAdminJWT');
const authorizeAdmin = require('./middleware/authorizeAdmin');


const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

if (!ADMIN_JWT_SECRET || !USER_JWT_SECRET || !SESSION_SECRET) {
    console.error('--- FATAL ERROR: One or more environment variables (ADMIN_JWT_SECRET, USER_JWT_SECRET, SESSION_SECRET) are not defined. Please check your .env file. ---');
    process.exit(1);
}

app.prepare().then(async () => {
    const server = express();

    server.use(express.static(path.join(process.cwd(), 'public')));

    server.use(cors({
        origin: `http://${hostname}:${port}`,
        credentials: true,
    }));

    server.use(cookieParser());

    server.use(session({
        store: new pgSession({
            pool: pool,
            tableName: 'user_sessions',
            createTableIfMissing: true
        }),
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        }
    }));

    server.use('/api/auth', express.json(), authRoutes);
    server.use('/api/admin', express.json(), adminAuthRoutes);
    server.use('/api/user', userRoutes);
    server.use('/api/job', express.json(), jobRoutes);
    server.use('/api/admin/dashboard', express.json(), require('./routes/adminDashboardRoutes'));



    // --- Admin Action: Get User by ID (Admin Only) ---
    // Make sure these admin-specific routes are also protected
    server.get('/api/admin/user/:userId', authenticateAdminJWT, authorizeAdmin(['super_admin', 'admin', 'viewer']), async (req, res) => {
        const { userId } = req.params;
        try {
            const result = await pool.query('SELECT user_id, user_username, user_email, user_type, user_first_name, user_last_name, contact_phone_number, organisation_name, university_college, user_city, created_at FROM users WHERE user_id = $1', [userId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(result.rows[0]);
        } catch (err) {
            console.error('--- ERROR: Error fetching user by ID for admin:', err.stack);
            res.status(500).json({ error: 'Failed to fetch user data for admin' });
        }
    });

    // --- Admin Action: Update User by ID (Admin Only) ---
    server.put('/api/admin/user/:userId', express.json(), authenticateAdminJWT, authorizeAdmin(['super_admin', 'admin']), async (req, res) => {
        const { userId } = req.params;
        const {
            user_username, user_email, password, user_type, user_first_name,
            user_last_name, contact_phone_number, organisation_name, university_college, user_city
        } = req.body;

        let updateFields = [];
        let queryParams = [userId];
        let paramIndex = 2;

        try {
            if (user_username !== undefined) {
                updateFields.push(`user_username = $${paramIndex++}`);
                queryParams.push(user_username);
            }
            if (user_email !== undefined) {
                const checkEmail = await pool.query('SELECT user_id FROM users WHERE user_email = $1 AND user_id != $2', [user_email, userId]);
                if (checkEmail.rows.length > 0) {
                    return res.status(409).json({ message: 'Email already taken by another user.' });
                }
                updateFields.push(`user_email = $${paramIndex++}`);
                queryParams.push(user_email);
            }
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateFields.push(`password_hash = $${paramIndex++}`);
                queryParams.push(hashedPassword);
            }
            if (user_type !== undefined) {
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

            if (updateFields.length === 0) {
                return res.status(400).json({ message: 'No valid fields provided for update.' });
            }

            const result = await pool.query(
                `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = $1 RETURNING user_id, user_username, user_email, user_type`,
                queryParams
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: 'User updated successfully', user: result.rows[0] });

        } catch (err) {
            console.error('--- ERROR: Error updating user by ID for admin:', err.stack);
            res.status(500).json({ error: 'Failed to update user data for admin' });
        }
    });

    // --- Admin Action: Delete User by ID (Admin Only) ---
    server.delete('/api/admin/user/:userId', authenticateAdminJWT, authorizeAdmin(['super_admin', 'admin']), async (req, res) => {
        const { userId } = req.params;
        try {
            const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [userId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(204).send();
        } catch (err) {
            console.error('--- ERROR: Error deleting user by ID for admin:', err.stack);
            res.status(500).json({ error: 'Failed to delete user data for admin' });
        }
    });


    // --- Next.js Fallback Handler ---
    server.all('*', (req, res) => {
        console.log(`--- DEBUG: Next.js handler caught request. Method: ${req.method}, Path: ${req.url} ---`);
        return handle(req, res);
    });

    // Centralized Error Handling Middleware (should be the last middleware added)
    server.use((err, req, res, next) => {
        console.error('--- FATAL ERROR: Unhandled Server Error: ---', err.stack);
        const statusCode = err.status || 500;
        const errorMessage = err.message || 'An unexpected server error occurred.';

        res.status(statusCode).json({
            error: {
                message: errorMessage,
                ...(dev && { stack: err.stack })
            }
        });
    });

    // Start the server
    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Server (Next.js Frontend & Express Backend) Ready on http://${hostname}:${port}`);
    });
}).catch((err) => {
    console.error('--- FATAL ERROR: Error preparing Next.js application: ---', err.stack);
    process.exit(1);
});