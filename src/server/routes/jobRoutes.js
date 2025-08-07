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
        const result = await pool.query(`
            SELECT 
                ja.*,
                COALESCE(application_counts.count, 0) as application_count
            FROM job_applications ja
            LEFT JOIN (
                SELECT 
                    job_id,
                    COUNT(*) as count
                FROM student_applications
                GROUP BY job_id
            ) application_counts ON ja.job_id = application_counts.job_id
            WHERE ja.job_status = 'active' 
            AND (ja.expires_at IS NULL OR ja.expires_at > NOW())
            ORDER BY ja.is_sponsored DESC, ja.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('--- ERROR: Error fetching all jobs:', err.stack);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// GET job by ID (MUST come before /apply route)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                ja.*,
                COALESCE(application_counts.count, 0) as application_count
            FROM job_applications ja
            LEFT JOIN (
                SELECT 
                    job_id,
                    COUNT(*) as count
                FROM student_applications
                GROUP BY job_id
            ) application_counts ON ja.job_id = application_counts.job_id
            WHERE ja.job_id = $1
        `, [id]);
        
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

// POST - Student applies to a job
router.post('/apply', authenticateUser, async (req, res) => {
    const { job_id, application_message } = req.body;
    const student_id = req.session.userId;

    // Basic validation
    if (!job_id || !student_id) {
        return res.status(400).json({ error: 'Job ID and student ID are required.' });
    }

    try {
        // Check if student has already applied to this job
        const existingApplication = await pool.query(
            'SELECT * FROM student_applications WHERE job_id = $1 AND student_id = $2',
            [job_id, student_id]
        );

        if (existingApplication.rows.length > 0) {
            return res.status(409).json({ error: 'You have already applied to this job.' });
        }

        // Insert the application
        const result = await pool.query(
            `INSERT INTO student_applications (
                job_id, student_id, application_message, application_status, applied_at
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING application_id`,
            [job_id, student_id, application_message || null, 'applied', new Date()]
        );

        console.log(`--- DEBUG: Student ${student_id} applied to job ${job_id} ---`);
        res.status(201).json({ 
            message: 'Application submitted successfully!', 
            application_id: result.rows[0].application_id 
        });
    } catch (err) {
        console.error('--- ERROR: Error submitting application:', err.stack);
        
        // Check if it's a table doesn't exist error
        if (err.message && err.message.includes('relation "student_applications" does not exist')) {
            return res.status(500).json({ 
                error: 'Database setup required. Please run the setup-database.sql script first.' 
            });
        }
        
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// PUT - Contact applicant (Job poster or Admin only)
router.put('/applications/:applicationId/contact', authenticateUser, async (req, res) => {
    const { applicationId } = req.params;
    const userIdFromSession = req.session.userId;
    // @ts-ignore
    const isAdmin = req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'super_admin');

    try {
        // Check if the application exists and if the user has permission to update it
        const checkApp = await pool.query(`
            SELECT sa.application_id, ja.posted_by_user_id 
            FROM student_applications sa
            JOIN job_applications ja ON sa.job_id = ja.job_id
            WHERE sa.application_id = $1
        `, [applicationId]);

        if (checkApp.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const app = checkApp.rows[0];
        // Allow update if user posted the job OR if it's an admin
        if (app.posted_by_user_id !== parseInt(userIdFromSession, 10) && !isAdmin) {
            console.log(`--- DEBUG: Unauthorized attempt to contact applicant ${applicationId} by user ID ${userIdFromSession}.`);
            return res.status(403).json({ error: 'Forbidden: You can only contact applicants for jobs you posted unless you are an admin.' });
        }

        // Update the application status to applied and student outcome to applied (still in process)
        const result = await pool.query(
            'UPDATE student_applications SET application_status = $1, student_outcome = $2 WHERE application_id = $3 RETURNING application_id, application_status, student_outcome',
            ['applied', 'applied', applicationId]
        );

        console.log(`--- DEBUG: Application ${applicationId} marked as contacted by user ${userIdFromSession}. ---`);
        res.json({ message: 'Applicant contacted successfully', status: result.rows[0].application_status });

    } catch (err) {
        console.error('--- ERROR: Error contacting applicant:', err.stack);
        res.status(500).json({ error: 'Failed to contact applicant' });
    }
});

// PUT - Reject applicant (Job poster or Admin only)
router.put('/applications/:applicationId/reject', authenticateUser, async (req, res) => {
    const { applicationId } = req.params;
    const userIdFromSession = req.session.userId;
    // @ts-ignore
    const isAdmin = req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'super_admin');

    try {
        // Check if the application exists and if the user has permission to update it
        const checkApp = await pool.query(`
            SELECT sa.application_id, ja.posted_by_user_id 
            FROM student_applications sa
            JOIN job_applications ja ON sa.job_id = ja.job_id
            WHERE sa.application_id = $1
        `, [applicationId]);

        if (checkApp.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const app = checkApp.rows[0];
        // Allow update if user posted the job OR if it's an admin
        if (app.posted_by_user_id !== parseInt(userIdFromSession, 10) && !isAdmin) {
            console.log(`--- DEBUG: Unauthorized attempt to reject applicant ${applicationId} by user ID ${userIdFromSession}.`);
            return res.status(403).json({ error: 'Forbidden: You can only reject applicants for jobs you posted unless you are an admin.' });
        }

        // Update the application status to rejected and student outcome to declined
        const result = await pool.query(
            'UPDATE student_applications SET application_status = $1, student_outcome = $2 WHERE application_id = $3 RETURNING application_id, application_status, student_outcome',
            ['rejected', 'declined', applicationId]
        );

        console.log(`--- DEBUG: Application ${applicationId} marked as rejected by user ${userIdFromSession}. ---`);
        res.json({ message: 'Applicant rejected successfully', status: result.rows[0].application_status });

    } catch (err) {
        console.error('--- ERROR: Error rejecting applicant:', err.stack);
        res.status(500).json({ error: 'Failed to reject applicant' });
    }
});

// POST - Fix existing rejected applications (one-time fix)
router.post('/fix-rejected-applications', authenticateUser, async (req, res) => {
    try {
        // Update all existing rejected applications to have student_outcome = 'declined'
        const result = await pool.query(
            'UPDATE student_applications SET student_outcome = $1 WHERE application_status = $2 AND student_outcome = $3 RETURNING application_id, application_status, student_outcome',
            ['declined', 'rejected', 'applied']
        );

        console.log(`--- DEBUG: Fixed ${result.rows.length} rejected applications. ---`);
        res.json({ message: `Fixed ${result.rows.length} rejected applications`, updatedCount: result.rows.length });

    } catch (err) {
        console.error('--- ERROR: Error fixing rejected applications:', err.stack);
        res.status(500).json({ error: 'Failed to fix rejected applications' });
    }
});



// PUT - Employer confirm student hire
router.put('/applications/:applicationId/confirm-hire', authenticateUser, async (req, res) => {
    const { applicationId } = req.params;
    const { confirmed } = req.body;
    const userIdFromSession = req.session.userId;

    try {
        // Check if the application exists and get job details
        const checkApp = await pool.query(
            'SELECT sa.application_id, sa.student_id, sa.student_outcome, ja.posted_by_user_id FROM student_applications sa JOIN job_applications ja ON sa.job_id = ja.job_id WHERE sa.application_id = $1',
            [applicationId]
        );

        if (checkApp.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const application = checkApp.rows[0];

        // Check if the user is the employer who posted the job
        if (application.posted_by_user_id !== parseInt(userIdFromSession, 10)) {
            return res.status(403).json({ error: 'Forbidden: You can only confirm hires for jobs you posted' });
        }

        // Check if the student has marked themselves as hired
        if (application.student_outcome !== 'hired') {
            return res.status(400).json({ error: 'Student has not marked themselves as hired' });
        }

        if (confirmed) {
            // Employer confirmed the hire - keep status as hired
            const result = await pool.query(
                'UPDATE student_applications SET student_outcome = $1, application_status = $2 WHERE application_id = $3 RETURNING application_id, student_outcome, application_status',
                ['hired', 'hired', applicationId]
            );

            console.log(`--- DEBUG: Employer ${userIdFromSession} confirmed hire for application ${applicationId}. ---`);
            res.json({ 
                message: 'Hire confirmed successfully', 
                outcome: result.rows[0].student_outcome,
                applicationStatus: result.rows[0].application_status
            });
        } else {
            // Employer declined the hire - set to rejected
            const result = await pool.query(
                'UPDATE student_applications SET student_outcome = $1, application_status = $2 WHERE application_id = $3 RETURNING application_id, student_outcome, application_status',
                ['declined', 'rejected', applicationId]
            );

            console.log(`--- DEBUG: Employer ${userIdFromSession} declined hire for application ${applicationId}. ---`);
            res.json({ 
                message: 'Hire declined, status set to rejected', 
                outcome: result.rows[0].student_outcome,
                applicationStatus: result.rows[0].application_status
            });
        }

    } catch (err) {
        console.error('--- ERROR: Error confirming hire:', err.stack);
        res.status(500).json({ error: 'Failed to confirm hire' });
    }
});

// PUT - Update student application outcome
router.put('/student/applications/:applicationId/outcome', authenticateUser, async (req, res) => {
    const { applicationId } = req.params;
    const { outcome } = req.body;
    const userIdFromSession = req.session.userId;

    // Validate outcome
    const validOutcomes = ['applied', 'hired', 'declined', 'cancelled'];
    if (!validOutcomes.includes(outcome)) {
        return res.status(400).json({ error: 'Invalid outcome. Must be one of: applied, hired, declined, cancelled' });
    }

    try {
        // Check if the application exists and belongs to the user
        const checkApp = await pool.query(
            'SELECT student_id FROM student_applications WHERE application_id = $1',
            [applicationId]
        );

        if (checkApp.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (checkApp.rows[0].student_id !== parseInt(userIdFromSession, 10)) {
            return res.status(403).json({ error: 'Forbidden: You can only update your own applications' });
        }

        // Update the outcome and sync with application_status for employer view
        let applicationStatus;
        switch (outcome) {
            case 'hired':
                applicationStatus = 'applied'; // Student claims hired, but employer needs to confirm (keep as applied until confirmed)
                break;
            case 'declined':
                applicationStatus = 'rejected';
                break;
            case 'cancelled':
                applicationStatus = 'cancelled';
                break;
            default: // For 'applied'
                applicationStatus = 'applied';
        }

        const result = await pool.query(
            'UPDATE student_applications SET student_outcome = $1, application_status = $2 WHERE application_id = $3 RETURNING application_id, student_outcome, application_status',
            [outcome, applicationStatus, applicationId]
        );

        console.log(`--- DEBUG: Application ${applicationId} outcome updated to ${outcome} (status: ${applicationStatus}) by user ${userIdFromSession}. ---`);
        res.json({ 
            message: 'Application outcome updated successfully', 
            outcome: result.rows[0].student_outcome,
            applicationStatus: result.rows[0].application_status
        });

    } catch (err) {
        console.error('--- ERROR: Error updating application outcome:', err.stack);
        res.status(500).json({ error: 'Failed to update application outcome' });
    }
});

// GET - Fetch all applications for a student (MUST come before /:id route)
router.get('/student/applications/:studentId', authenticateUser, async (req, res) => {
    const { studentId } = req.params;
    const userIdFromSession = req.session.userId;
    // @ts-ignore
    const isAdmin = req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'super_admin');

    // Allow access if user is requesting their own applications OR if it's an admin
    if (userIdFromSession !== parseInt(studentId, 10) && !isAdmin) {
        console.log(`--- DEBUG: Unauthorized attempt to access applications of student ID ${studentId} by user ID ${userIdFromSession}.`);
        return res.status(403).json({ error: 'Forbidden: You can only view your own applications unless you are an admin.' });
    }

    try {
        // First, automatically move expired active jobs to expired status
        const now = new Date();
        const updateExpiredJobs = await pool.query(
            'UPDATE job_applications SET job_status = $1 WHERE job_status = $2 AND expires_at < $3',
            ['expired', 'active', now]
        );
        
        if (updateExpiredJobs.rowCount > 0) {
            console.log(`--- DEBUG: Moved ${updateExpiredJobs.rowCount} expired jobs to expired status. ---`);
            
            // Get the job IDs that were just expired
            const expiredJobIds = await pool.query(
                'SELECT job_id FROM job_applications WHERE job_status = $1 AND expires_at < $2',
                ['expired', now]
            );
            
            // Update student applications for expired jobs to declined status
            // BUT completely skip employer-confirmed hired students (they keep their hired status forever)
            for (const job of expiredJobIds.rows) {
                await pool.query(
                    `UPDATE student_applications 
                     SET student_outcome = $1, application_status = $2 
                     WHERE job_id = $3 
                       AND NOT (student_outcome = 'hired' AND application_status = 'hired')`,
                    ['declined', 'rejected', job.job_id]
                );
            }
            
            console.log(`--- DEBUG: Updated student applications for ${expiredJobIds.rows.length} expired jobs to declined status. ---`);
        }

        const result = await pool.query(`
            SELECT 
                sa.application_id,
                sa.job_id,
                sa.application_message,
                sa.application_status,
                sa.student_outcome,
                sa.applied_at,
                ja.job_title,
                ja.job_location,
                ja.contact_name,
                ja.contact_phone,
                ja.contact_email,
                ja.hourly_pay,
                ja.hours_per_week,
                ja.job_status,
                u.contact_phone_number as employer_phone,
                u.user_email as employer_email
            FROM student_applications sa
            JOIN job_applications ja ON sa.job_id = ja.job_id
            JOIN users u ON ja.posted_by_user_id = u.user_id
            WHERE sa.student_id = $1 
            ORDER BY sa.applied_at DESC
        `, [studentId]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('--- ERROR: Error fetching applications for student:', err.stack);
        
        // Check if it's a table doesn't exist error
        if (err.message && err.message.includes('relation "student_applications" does not exist')) {
            return res.status(500).json({ 
                error: 'Database setup required. Please run the setup-database.sql script first.' 
            });
        }
        
        res.status(500).json({ error: 'Failed to fetch applications for student' });
    }
});

// GET - Fetch all applications for a specific job (Job poster or Admin only)
router.get('/:jobId/applications', authenticateUser, async (req, res) => {
    const { jobId } = req.params;
    const userIdFromSession = req.session.userId;
    // @ts-ignore
    const isAdmin = req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'super_admin');

    try {
        // First, check if the job exists and if the user has permission to view applications
        const checkJob = await pool.query('SELECT posted_by_user_id FROM job_applications WHERE job_id = $1', [jobId]);
        if (checkJob.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const job = checkJob.rows[0];
        // Allow access if user posted the job OR if it's an admin
        if (job.posted_by_user_id !== parseInt(userIdFromSession, 10) && !isAdmin) {
            console.log(`--- DEBUG: Unauthorized attempt to view applications for job ID ${jobId} by user ID ${userIdFromSession}.`);
            return res.status(403).json({ error: 'Forbidden: You can only view applications for jobs you posted unless you are an admin.' });
        }

        // Get total application count (including cancelled)
        const totalCountResult = await pool.query(`
            SELECT COUNT(*) as total_count
            FROM student_applications sa
            WHERE sa.job_id = $1
        `, [jobId]);
        
        const totalApplications = parseInt(totalCountResult.rows[0].total_count);
        
        // Fetch applications with student details (excluding cancelled applications for display)
        const result = await pool.query(`
            SELECT 
                sa.application_id,
                sa.job_id,
                sa.application_message,
                sa.application_status,
                sa.student_outcome,
                sa.applied_at,
                u.user_first_name,
                u.user_last_name,
                u.user_email,
                u.university_college,
                u.contact_phone_number,
                u.user_image
            FROM student_applications sa
            JOIN users u ON sa.student_id = u.user_id
            WHERE sa.job_id = $1 AND sa.application_status != 'cancelled'
            ORDER BY sa.applied_at DESC
        `, [jobId]);
        
        console.log(`--- DEBUG: Fetched ${result.rows.length} visible applications (${totalApplications} total including cancelled) for job ID ${jobId}. ---`);
        
        // Add total count to the response
        res.json({
            applications: result.rows,
            totalCount: totalApplications
        });
        
    } catch (err) {
        console.error('--- ERROR: Error fetching applications for job:', err.stack);
        res.status(500).json({ error: 'Failed to fetch applications for job' });
    }
});



// POST a new job (Authenticated User or Admin)
// MODIFIED: Removed uploadJobLogo.single('company_logo') middleware and all references to company_logo in the INSERT query.
router.post('/', authenticateUser, async (req, res) => {
    console.log('--- DEBUG: Job posting request body:', req.body);
    
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
    
    console.log('--- DEBUG: job_category received:', job_category);

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
        // Calculate expiry date based on sponsor status
        const now = new Date();
        let calculatedExpiryDate;
        
        if (is_sponsored) {
            // Sponsored jobs expire in 45 days
            calculatedExpiryDate = new Date(now.getTime() + (45 * 24 * 60 * 60 * 1000));
        } else {
            // Non-sponsored jobs expire in 30 days
            calculatedExpiryDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        }

        const result = await pool.query(
            `INSERT INTO job_applications (
                job_title, job_description, job_category, job_location, hourly_pay,
                hours_per_week, contact_name, contact_phone, contact_email,
                is_sponsored, posted_by_user_id, expires_at, job_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING job_id, job_title`,
            [
                job_title, job_description, job_category || null, job_location || null,
                hourly_pay || null, hours_per_week || null, contact_name, contact_phone || null,
                contact_email, is_sponsored || false, posted_by_user_id,
                calculatedExpiryDate, 'active'
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

// PUT - Mark job as filled (User who posted or Admin)
router.put('/:id/fill', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const userIdFromSession = req.session.userId;
    // @ts-ignore
    const isAdmin = req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'super_admin');

    try {
        // First, check if the job exists and if the user has permission to update it
        const checkJob = await pool.query('SELECT posted_by_user_id FROM job_applications WHERE job_id = $1', [id]);
        if (checkJob.rows.length === 0) {
            console.log(`--- DEBUG: Mark as filled failed: Job ID ${id} not found.`);
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = checkJob.rows[0];
        // Allow update if user posted the job OR if it's an admin
        if (job.posted_by_user_id !== parseInt(userIdFromSession, 10) && !isAdmin) {
            console.log(`--- DEBUG: Unauthorized attempt to mark job ID ${id} as filled by user ID ${userIdFromSession}.`);
            return res.status(403).json({ error: 'Forbidden: You can only mark jobs you posted as filled unless you are an admin.' });
        }

        // Update job status to filled
        const result = await pool.query(
            'UPDATE job_applications SET job_status = $1 WHERE job_id = $2 RETURNING job_id, job_title',
            ['filled', id]
        );

        if (result.rows.length === 0) {
            console.log(`--- DEBUG: Mark as filled failed: Job ID ${id} not found after checks.`);
            return res.status(404).json({ message: 'Job not found or nothing to update.' });
        }

        // Update all student applications for this job to declined status
        // BUT completely skip employer-confirmed hired students (they keep their hired status forever)
        const studentUpdateResult = await pool.query(
            `UPDATE student_applications 
             SET student_outcome = $1, application_status = $2 
             WHERE job_id = $3 
               AND NOT (student_outcome = 'hired' AND application_status = 'hired')
             RETURNING application_id`,
            ['declined', 'rejected', id]
        );

        console.log(`--- DEBUG: Job ID ${id} marked as filled. Updated ${studentUpdateResult.rows.length} student applications to declined. ---`);
        res.json({ message: 'Job marked as filled successfully', job: result.rows[0] });

    } catch (err) {
        console.error('--- ERROR: Error marking job as filled:', err.stack);
        res.status(500).json({ error: 'Failed to mark job as filled' });
    }
});

// PUT - Remove job (move to post history instead of deleting)
router.put('/:id/remove', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const userIdFromSession = req.session.userId;
    // @ts-ignore
    const isAdmin = req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'super_admin');

    try {
        // First, check if the job exists and if the user has permission to update it
        const checkJob = await pool.query('SELECT posted_by_user_id FROM job_applications WHERE job_id = $1', [id]);
        if (checkJob.rows.length === 0) {
            console.log(`--- DEBUG: Remove failed: Job ID ${id} not found.`);
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = checkJob.rows[0];
        // Allow update if user posted the job OR if it's an admin
        if (job.posted_by_user_id !== parseInt(userIdFromSession, 10) && !isAdmin) {
            console.log(`--- DEBUG: Unauthorized attempt to remove job ID ${id} by user ID ${userIdFromSession}.`);
            return res.status(403).json({ error: 'Forbidden: You can only remove jobs you posted unless you are an admin.' });
        }

        // Update job status to removed
        const result = await pool.query(
            'UPDATE job_applications SET job_status = $1 WHERE job_id = $2 RETURNING job_id, job_title',
            ['removed', id]
        );

        if (result.rows.length === 0) {
            console.log(`--- DEBUG: Remove failed: Job ID ${id} not found after checks.`);
            return res.status(404).json({ message: 'Job not found or nothing to update.' });
        }

        // Update all student applications for this job to declined status  
        // BUT completely skip employer-confirmed hired students (they keep their hired status forever)
        const studentUpdateResult = await pool.query(
            `UPDATE student_applications 
             SET student_outcome = $1, application_status = $2 
             WHERE job_id = $3 
               AND NOT (student_outcome = 'hired' AND application_status = 'hired')
             RETURNING application_id`,
            ['declined', 'rejected', id]
        );

        console.log(`--- DEBUG: Job ID ${id} moved to post history. Updated ${studentUpdateResult.rows.length} student applications to declined. ---`);
        res.json({ message: 'Job moved to post history successfully', job: result.rows[0] });

    } catch (err) {
        console.error('--- ERROR: Error removing job:', err.stack);
        res.status(500).json({ error: 'Failed to remove job' });
    }
});

// PUT - Reactivate job after payment (User who posted or Admin)
router.put('/:id/reactivate-after-payment', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const userIdFromSession = req.session.userId;
    // @ts-ignore
    const isAdmin = req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'super_admin');

    try {
        // First, check if the job exists and if the user has permission to update it
        const checkJob = await pool.query('SELECT posted_by_user_id FROM job_applications WHERE job_id = $1', [id]);
        if (checkJob.rows.length === 0) {
            console.log(`--- DEBUG: Reactivate after payment failed: Job ID ${id} not found.`);
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = checkJob.rows[0];
        // Allow update if user posted the job OR if it's an admin
        if (job.posted_by_user_id !== parseInt(userIdFromSession, 10) && !isAdmin) {
            console.log(`--- DEBUG: Unauthorized attempt to reactivate job ID ${id} by user ID ${userIdFromSession}.`);
            return res.status(403).json({ error: 'Forbidden: You can only reactivate jobs you posted unless you are an admin.' });
        }

        // Calculate new expiry date based on sponsorship status
        const now = new Date();
        let newExpiryDate;
        const jobDetails = await pool.query('SELECT is_sponsored FROM job_applications WHERE job_id = $1', [id]);
        const isSponsored = jobDetails.rows[0]?.is_sponsored || false;
        
        if (isSponsored) {
            newExpiryDate = new Date(now.getTime() + (45 * 24 * 60 * 60 * 1000)); // 45 days
        } else {
            newExpiryDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
        }

        const result = await pool.query(
            'UPDATE job_applications SET job_status = $1, expires_at = $2, created_at = $3 WHERE job_id = $4 RETURNING job_id, job_title',
            ['active', newExpiryDate, now, id]
        );

        if (result.rows.length === 0) {
            console.log(`--- DEBUG: Reactivate after payment failed: Job ID ${id} not found after checks.`);
            return res.status(404).json({ message: 'Job not found or nothing to update.' });
        }

        console.log(`--- DEBUG: Job ID ${id} reactivated after payment with new expiry date. ---`);
        res.json({ message: 'Job reactivated successfully after payment', job: result.rows[0] });

    } catch (err) {
        console.error('--- ERROR: Error reactivating job after payment:', err.stack);
        res.status(500).json({ error: 'Failed to reactivate job after payment' });
    }
});

// PUT - Reactivate job (User who posted or Admin)
router.put('/:id/reactivate', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const userIdFromSession = req.session.userId;
    // @ts-ignore
    const isAdmin = req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'super_admin');

    try {
        // First, check if the job exists and get its details
        const checkJob = await pool.query(
            'SELECT posted_by_user_id, expires_at, is_sponsored FROM job_applications WHERE job_id = $1', 
            [id]
        );
        if (checkJob.rows.length === 0) {
            console.log(`--- DEBUG: Reactivate failed: Job ID ${id} not found.`);
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = checkJob.rows[0];
        // Allow update if user posted the job OR if it's an admin
        if (job.posted_by_user_id !== parseInt(userIdFromSession, 10) && !isAdmin) {
            console.log(`--- DEBUG: Unauthorized attempt to reactivate job ID ${id} by user ID ${userIdFromSession}.`);
            return res.status(403).json({ error: 'Forbidden: You can only reactivate jobs you posted unless you are an admin.' });
        }

        // Check if job is expired
        const now = new Date();
        const expiryDate = new Date(job.expires_at);
        const isExpired = expiryDate < now;

        if (isExpired) {
            // Job is expired - return special response to trigger edit mode
            return res.status(410).json({ 
                message: 'Job has expired and needs to be updated',
                job: { job_id: id, job_title: job.job_title },
                expired: true,
                requiresPayment: true
            });
        }

        // Job is not expired - reactivate it
        const result = await pool.query(
            'UPDATE job_applications SET job_status = $1 WHERE job_id = $2 RETURNING job_id, job_title',
            ['active', id]
        );

        if (result.rows.length === 0) {
            console.log(`--- DEBUG: Reactivate failed: Job ID ${id} not found after checks.`);
            return res.status(404).json({ message: 'Job not found or nothing to update.' });
        }

        console.log(`--- DEBUG: Job ID ${id} reactivated. ---`);
        res.json({ message: 'Job reactivated successfully', job: result.rows[0] });

    } catch (err) {
        console.error('--- ERROR: Error reactivating job:', err.stack);
        res.status(500).json({ error: 'Failed to reactivate job' });
    }
});

// PUT update job by ID (User who posted or Admin)
router.put('/:id', authenticateUser, async (req, res) => {
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
        const checkJob = await pool.query('SELECT posted_by_user_id FROM job_applications WHERE job_id = $1', [id]);
        if (checkJob.rows.length === 0) {
            console.log(`--- DEBUG: Update failed: Job ID ${id} not found.`);
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = checkJob.rows[0];
        // Allow update if user posted the job OR if it's an admin
        if (job.posted_by_user_id !== parseInt(userIdFromSession, 10) && !isAdmin) {
            console.log(`--- DEBUG: Unauthorized attempt to update job ID ${id} by user ID ${userIdFromSession}.`);
            return res.status(403).json({ error: 'Forbidden: You can only update jobs you posted unless you are an admin.' });
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

        console.log(`--- DEBUG: Job ID ${id} updated. ---`);
        res.json({ message: 'Job updated successfully', job: result.rows[0] });

    } catch (err) {
        console.error('--- ERROR: Error updating job:', err.stack);
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
        const checkJob = await pool.query('SELECT posted_by_user_id FROM job_applications WHERE job_id = $1', [id]);
        if (checkJob.rows.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = checkJob.rows[0];
        // Allow delete if user posted the job OR if it's an admin
        if (job.posted_by_user_id !== parseInt(userIdFromSession, 10) && !isAdmin) {
            console.log(`--- DEBUG: Unauthorized attempt to delete job ID ${id} by user ID ${userIdFromSession}.`);
            return res.status(403).json({ error: 'Forbidden: You can only delete jobs you posted unless you are an admin.' });
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
        // First, automatically move expired active jobs to post history
        const now = new Date();
        const updateExpiredJobs = await pool.query(
            'UPDATE job_applications SET job_status = $1 WHERE posted_by_user_id = $2 AND job_status = $3 AND expires_at < $4',
            ['expired', userId, 'active', now]
        );
        
        if (updateExpiredJobs.rowCount > 0) {
            console.log(`--- DEBUG: Moved ${updateExpiredJobs.rowCount} expired jobs to post history for user ID ${userId}. ---`);
        }

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