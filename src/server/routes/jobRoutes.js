// src/server/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer'); // For file uploads
const { v4: uuidv4 } = require('uuid'); // For unique filenames

// Import the centralized pool from config file
const pool = require('../config/db');
// Import the centralized authentication middleware
const authenticateUser = require('../middleware/authenticateUser'); // For user-specific job actions
const authenticateAdminJWT = require('../middleware/authenticateAdminJWT'); // For admin-only job actions


// Multer storage configuration for job logos (defined locally for this route for now)
const jobLogoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'job_logos');
        fs.mkdirSync(uploadDir, { recursive: true }); // Ensure the directory exists
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`); // Unique filename
    }
});

const uploadJobLogo = multer({ storage: jobLogoStorage });


// GET all jobs
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM job_applications ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('--- ERROR: Error fetching all jobs:', err.stack);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// GET job by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM job_applications WHERE job_id = $1', [id]);
        if (result.rows.length === 0) {
            console.log(`--- DEBUG: Job ID ${id} not found.`);
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('--- ERROR: Error fetching job by ID:', err.stack);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
});

// POST a new job (Authenticated User or Admin)
// MODIFIED: Removed uploadJobLogo.single('company_logo') middleware and all references to company_logo in the INSERT query.
router.post('/', authenticateUser, async (req, res) => {
    const {
        job_title,
        job_description,
        job_category,
        job_location,
        hourly_pay,
        hours_per_week,
        contact_name,
        contact_phone,
        contact_email,
        is_sponsored,
        expires_at
    } = req.body;

    // Use posted_by_user_id from session (authenticated user)
    const posted_by_user_id = req.session.userId;

    // --- REMOVED: Logic for company_logo as it's not being used/uploaded from frontend currently ---
    // const company_logo = req.file ? `/uploads/job_logos/${req.file.filename}` : null;

    // Basic validation
    if (!job_title || !job_description || !contact_name || !contact_email || !posted_by_user_id) {
        // --- REMOVED: File cleanup logic related to company_logo for validation errors ---
        // if (req.file && fs.existsSync(req.file.path)) {
        //     fs.unlink(req.file.path, (unlinkErr) => {
        //         if (unlinkErr) console.error('--- ERROR: Failed to delete uploaded file after validation error:', unlinkErr);
        //     });
        // }
        return res.status(400).json({ error: 'Title, description, contact name, contact email, and user ID are required.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO job_applications (
                job_title, job_description, job_category, job_location, hourly_pay,
                hours_per_week, contact_name, contact_phone, contact_email,
                is_sponsored, posted_by_user_id, expires_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING job_id, job_title`,
            [
                job_title, job_description, job_category || null, job_location || null,
                hourly_pay || null, hours_per_week || null, contact_name, contact_phone || null,
                contact_email, is_sponsored || false, posted_by_user_id,
                expires_at ? new Date(expires_at) : null
                // --- REMOVED: company_logo from values ---
            ]
        );
        console.log(`--- DEBUG: New job posted: ${result.rows[0].job_title} (ID: ${result.rows[0].job_id}) ---`);
        res.status(201).json({ message: 'Job posted successfully!', job: result.rows[0] });
    } catch (err) {
        console.error('--- ERROR: Error posting job:', err.stack);
        // --- REMOVED: File cleanup logic related to company_logo for DB errors ---
        // if (req.file && fs.existsSync(req.file.path)) {
        //     fs.unlink(req.file.path, (unlinkErr) => {
        //         if (unlinkErr) console.error('--- ERROR: Failed to delete uploaded file after DB error:', unlinkErr);
        //     });
        // }
        res.status(500).json({ error: 'Failed to post job' });
    }
});

// PUT update job by ID (User who posted or Admin)
router.put('/:id', authenticateUser, uploadJobLogo.single('company_logo'), async (req, res) => {
    const { id } = req.params;
    const userIdFromSession = req.session.userId;
    // @ts-ignore
    const isAdmin = req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'super_admin');

    const {
        job_title, job_description, job_category, job_location, hourly_pay,
        hours_per_week, contact_name, contact_phone, contact_email,
        is_sponsored, expires_at, job_status // Allow job_status update
    } = req.body;

    let updateFields = [];
    let queryParams = [id];
    let paramIndex = 2; // Start index for dynamic parameters

    try {
        // First, check if the job exists and if the user has permission to update it
        // NOTE: This SELECT query still tries to retrieve 'company_logo'.
        // If you don't intend to use company_logo at all, you might remove it from this SELECT as well.
        const checkJob = await pool.query('SELECT posted_by_user_id, company_logo FROM job_applications WHERE job_id = $1', [id]);
        if (checkJob.rows.length === 0) {
            console.log(`--- DEBUG: Update failed: Job ID ${id} not found.`);
            // Clean up uploaded file if job not found
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('--- ERROR: Failed to delete uploaded file after job not found error:', unlinkErr);
                });
            }
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = checkJob.rows[0];
        // Allow update if user posted the job OR if it's an admin
        if (job.posted_by_user_id !== userIdFromSession && !isAdmin) {
            console.log(`--- DEBUG: Unauthorized attempt to update job ID ${id} by user ID ${userIdFromSession}.`);
            // Clean up uploaded file if authorization fails
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('--- ERROR: Failed to delete uploaded file after auth error:', unlinkErr);
                });
            }
            return res.status(403).json({ error: 'Forbidden: You can only update jobs you posted unless you are an admin.' });
        }


        let oldLogoPath = null;
        if (req.file) { // New file uploaded
            const newLogoPath = `/uploads/job_logos/${req.file.filename}`;
            updateFields.push(`company_logo = $${paramIndex++}`);
            queryParams.push(newLogoPath);
            oldLogoPath = job.company_logo ? path.join(process.cwd(), 'public', job.company_logo) : null;
        } else if (req.body.company_logo === null || req.body.company_logo === '') {
            // User explicitly sent null/empty for company_logo, indicating removal
            updateFields.push(`company_logo = $${paramIndex++}`);
            queryParams.push(null);
            oldLogoPath = job.company_logo ? path.join(process.cwd(), 'public', job.company_logo) : null;
        }

        if (job_title !== undefined) {
            updateFields.push(`job_title = $${paramIndex++}`);
            queryParams.push(job_title);
        }
        if (job_description !== undefined) {
            updateFields.push(`job_description = $${paramIndex++}`);
            queryParams.push(job_description);
        }
        if (job_category !== undefined) {
            updateFields.push(`job_category = $${paramIndex++}`);
            queryParams.push(job_category === '' ? null : job_category);
        }
        if (job_location !== undefined) {
            updateFields.push(`job_location = $${paramIndex++}`);
            queryParams.push(job_location === '' ? null : job_location);
        }
        if (hourly_pay !== undefined) {
            updateFields.push(`hourly_pay = $${paramIndex++}`);
            queryParams.push(hourly_pay);
        }
        if (hours_per_week !== undefined) {
            updateFields.push(`hours_per_week = $${paramIndex++}`);
            queryParams.push(hours_per_week === '' ? null : hours_per_week);
        }
        if (contact_name !== undefined) {
            updateFields.push(`contact_name = $${paramIndex++}`);
            queryParams.push(contact_name);
        }
        if (contact_phone !== undefined) {
            updateFields.push(`contact_phone = $${paramIndex++}`);
            queryParams.push(contact_phone === '' ? null : contact_phone);
        }
        if (contact_email !== undefined) {
            updateFields.push(`contact_email = $${paramIndex++}`);
            queryParams.push(contact_email);
        }
        if (is_sponsored !== undefined) {
            updateFields.push(`is_sponsored = $${paramIndex++}`);
            queryParams.push(is_sponsored);
        }
        if (expires_at !== undefined) {
            updateFields.push(`expires_at = $${paramIndex++}`);
            queryParams.push(expires_at ? new Date(expires_at) : null);
        }
        if (job_status !== undefined && isAdmin) { // Only admin can change job_status
            updateFields.push(`job_status = $${paramIndex++}`);
            queryParams.push(job_status);
        }

        if (updateFields.length === 0) {
            console.log(`--- DEBUG: No valid fields for update for job ID ${id}.`);
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        const result = await pool.query(
            `UPDATE job_applications SET ${updateFields.join(', ')} WHERE job_id = $1 RETURNING job_id, job_title`,
            queryParams
        );

        if (result.rows.length === 0) {
            console.log(`--- DEBUG: Update failed: Job ID ${id} not found after checks.`);
            return res.status(404).json({ message: 'Job not found or nothing to update.' });
        }

        // If a new logo was uploaded or existing one removed, delete the old file
        if (oldLogoPath && fs.existsSync(oldLogoPath)) {
            fs.unlink(oldLogoPath, (err) => {
                if (err) console.error('--- ERROR: Error deleting old job logo file:', err);
            });
        }

        console.log(`--- DEBUG: Job ID ${id} updated. ---`);
        res.json({ message: 'Job updated successfully', job: result.rows[0] });

    } catch (err) {
        console.error('--- ERROR: Error updating job:', err.stack);
        // Clean up newly uploaded file if DB update fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('--- ERROR: Failed to delete newly uploaded file after DB error:', unlinkErr);
            });
        }
        res.status(500).json({ error: 'Failed to update job' });
    }
});

// DELETE job by ID (User who posted or Admin)
router.delete('/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const userIdFromSession = req.session.userId;
    // @ts-ignore
    const isAdmin = req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'super_admin');

    try {
        // First, check if the job exists and if the user has permission to delete it
        // NOTE: This SELECT query still tries to retrieve 'company_logo'.
        // If you don't intend to use company_logo at all, you might remove it from this SELECT as well.
        const checkJob = await pool.query('SELECT posted_by_user_id, company_logo FROM job_applications WHERE job_id = $1', [id]);
        if (checkJob.rows.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = checkJob.rows[0];
        // Allow delete if user posted the job OR if it's an admin
        if (job.posted_by_user_id !== userIdFromSession && !isAdmin) {
            console.log(`--- DEBUG: Unauthorized attempt to delete job ID ${id} by user ID ${userIdFromSession}.`);
            return res.status(403).json({ error: 'Forbidden: You can only delete jobs you posted unless you are an admin.' });
        }

        // If job has a logo, delete the file first
        if (job.company_logo) {
            const logoFilePath = path.join(process.cwd(), 'public', job.company_logo);
            if (fs.existsSync(logoFilePath)) {
                fs.unlink(logoFilePath, (err) => {
                    if (err) console.error('--- ERROR: Error deleting job logo file:', err);
                });
            }
        }

        const result = await pool.query('DELETE FROM job_applications WHERE job_id = $1 RETURNING job_id', [id]);
        if (result.rows.length === 0) {
            console.log(`--- DEBUG: Delete failed: Job ID ${id} not found after checks.`);
            return res.status(404).json({ message: 'Job not found' });
        }
        console.log(`--- DEBUG: Job ID ${id} deleted.`);
        res.status(204).send(); // 204 No Content for successful deletion

    } catch (err) {
        console.error('--- ERROR: Error deleting job:', err.stack);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

// GET all jobs posted by a specific user (Authenticated User for their own jobs, or Admin)
router.get('/user/:userId', authenticateUser, async (req, res) => {
    const { userId } = req.params;
    const userIdFromSession = req.session.userId;
    // @ts-ignore
    const isAdmin = req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'super_admin');

    // Allow access if user is requesting their own jobs OR if it's an admin
    if (userIdFromSession !== parseInt(userId, 10) && !isAdmin) {
        console.log(`--- DEBUG: Unauthorized attempt to access jobs of user ID ${userId} by user ID ${userIdFromSession}.`);
        return res.status(403).json({ error: 'Forbidden: You can only view jobs you posted unless you are an admin.' });
    }

    try {
        const result = await pool.query('SELECT * FROM job_applications WHERE posted_by_user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('--- ERROR: Error fetching jobs by user ID:', err.stack);
        res.status(500).json({ error: 'Failed to fetch jobs for user' });
    }
});

// GET all jobs by category
router.get('/category/:category', async (req, res) => {
    const { category } = req.params;
    try {
        // Using ILIKE for case-insensitive search
        const result = await pool.query('SELECT * FROM job_applications WHERE job_category ILIKE $1 ORDER BY created_at DESC', [`%${category}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error('--- ERROR: Error fetching jobs by category:', err.stack);
        res.status(500).json({ error: 'Failed to fetch jobs by category' });
    }
});

module.exports = router;