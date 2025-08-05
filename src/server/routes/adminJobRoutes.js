// src/server/routes/adminJobRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateAdminJWT = require('../middleware/authenticateAdminJWT');

// GET all jobs for admin dashboard
router.get('/', authenticateAdminJWT, async (req, res) => {
    console.log('--- DEBUG: Admin jobs route hit ---');
    try {
        console.log('--- DEBUG: About to execute query ---');
        const result = await pool.query(`
            SELECT 
                ja.job_id as id,
                ja.job_title as title,
                u.organisation_name as "companyName",
                ja.job_location as location,
                ja.job_category as type,
                ja.job_status as status,
                ja.hourly_pay as salary,
                ja.job_description as description,
                ja.created_at as "postedDate",
                COALESCE(application_counts.count, 0) as "applicantsCount"
            FROM job_applications ja
            LEFT JOIN users u ON ja.posted_by_user_id = u.user_id
            LEFT JOIN (
                SELECT 
                    job_id,
                    COUNT(*) as count
                FROM student_applications
                GROUP BY job_id
            ) application_counts ON ja.job_id = application_counts.job_id
            ORDER BY ja.created_at DESC
        `);
        console.log('--- DEBUG: Query executed successfully, rows:', result.rows.length);

        // Transform the data to match the expected format
        const jobs = result.rows.map(row => ({
            id: row.id.toString(),
            title: row.title,
            companyName: row.companyName || 'Unknown Company',
            location: row.location,
            type: row.type || 'Other',
            status: row.status === 'inactive' ? 'archived' : row.status, // Map inactive to archived
            applicantsCount: parseInt(row.applicantsCount) || 0,
            postedDate: row.postedDate,
            salary: row.salary ? `£${row.salary}/hr` : 'Not specified',
            description: row.description
        }));

        console.log('--- DEBUG: Sending response with', jobs.length, 'jobs');
        res.json(jobs);
    } catch (err) {
        console.error('Error fetching jobs for admin:', err.stack);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// GET specific job details for admin
router.get('/:id', authenticateAdminJWT, async (req, res) => {
    const { id } = req.params;
    console.log('--- DEBUG: Admin job details route hit for job ID:', id);
    
    try {
        // Get job details
        const jobResult = await pool.query(`
            SELECT 
                ja.job_id as id,
                ja.job_title as title,
                u.organisation_name as "companyName",
                ja.job_location as location,
                ja.job_category as type,
                ja.job_status as status,
                ja.hourly_pay as salary,
                ja.job_description as description,
                ja.created_at as "postedDate",
                ja.posted_by_user_id as "employer_id",
                COALESCE(application_counts.count, 0) as "applicantsCount"
            FROM job_applications ja
            LEFT JOIN users u ON ja.posted_by_user_id = u.user_id
            LEFT JOIN (
                SELECT 
                    job_id,
                    COUNT(*) as count
                FROM student_applications
                GROUP BY job_id
            ) application_counts ON ja.job_id = application_counts.job_id
            WHERE ja.job_id = $1
        `, [id]);

        if (jobResult.rows.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = jobResult.rows[0];

        // Get applicants for this job
        const applicantsResult = await pool.query(`
            SELECT 
                sa.student_id as user_id,
                u.user_username,
                u.user_email,
                u.user_first_name,
                u.user_last_name,
                sa.application_status,
                sa.applied_at
            FROM student_applications sa
            LEFT JOIN users u ON sa.student_id = u.user_id
            WHERE sa.job_id = $1
            ORDER BY sa.applied_at DESC
        `, [id]);

        // Transform the data
        const detailedJob = {
            id: job.id.toString(),
            title: job.title,
            companyName: job.companyName || 'Unknown Company',
            location: job.location,
            type: job.type || 'Other',
            status: job.status === 'inactive' ? 'archived' : job.status, // Map inactive to archived
            applicantsCount: parseInt(job.applicantsCount) || 0,
            postedDate: job.postedDate,
            salary: job.salary ? `£${job.salary}/hr` : 'Not specified',
            description: job.description,
            employer_id: job.employer_id,
            applicants: applicantsResult.rows.map(app => ({
                user_id: app.user_id,
                user_username: app.user_username,
                user_email: app.user_email,
                user_first_name: app.user_first_name,
                user_last_name: app.user_last_name,
                full_name: app.user_first_name && app.user_last_name ? `${app.user_first_name} ${app.user_last_name}` : app.user_username || app.user_email,
                application_status: app.application_status,
                applied_at: app.applied_at
            })),
            job_analytics: {
                views: 0,
                clicks: 0,
                applications: parseInt(job.applicantsCount) || 0
            },
            moderation_notes: []
        };

        console.log('--- DEBUG: Sending detailed job response');
        console.log('--- DEBUG: Applicants data:', applicantsResult.rows);
        console.log('--- DEBUG: First applicant applied_at:', applicantsResult.rows[0]?.applied_at);
        console.log('--- DEBUG: First applicant applied_at type:', typeof applicantsResult.rows[0]?.applied_at);
        console.log('--- DEBUG: All applicant applied_at values:', applicantsResult.rows.map(app => ({ 
            user_id: app.user_id, 
            applied_at: app.applied_at, 
            applied_at_type: typeof app.applied_at 
        })));
        
        // Test query to check if applied_at exists in database
        const testQuery = await pool.query(`
            SELECT student_id, applied_at, application_status 
            FROM student_applications 
            WHERE job_id = $1 
            LIMIT 1
        `, [id]);
        console.log('--- DEBUG: Test query result:', testQuery.rows);
        res.json(detailedJob);
    } catch (err) {
        console.error('Error fetching job details for admin:', err.stack);
        res.status(500).json({ error: 'Failed to fetch job details' });
    }
});

// PUT update job status
router.put('/:id/status', authenticateAdminJWT, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    console.log('--- DEBUG: Admin update job status route hit for job ID:', id, 'status:', status);

    try {
        // Map admin status to database status
        let dbStatus;
        switch (status) {
            case 'active':
                dbStatus = 'active';
                break;
            case 'filled':
                dbStatus = 'filled';
                break;
            case 'removed':
                dbStatus = 'removed';
                break;
            case 'expired':
                dbStatus = 'expired';
                break;
            case 'archived':
                dbStatus = 'inactive'; // Map archived to inactive since archived might not exist
                break;
            default:
                return res.status(400).json({ error: 'Invalid status' });
        }

        console.log('--- DEBUG: Updating job status to:', dbStatus);

        const result = await pool.query(
            'UPDATE job_applications SET job_status = $1 WHERE job_id = $2 RETURNING job_id',
            [dbStatus, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        console.log('--- DEBUG: Job status updated successfully');
        res.json({ message: 'Job status updated successfully' });
    } catch (err) {
        console.error('Error updating job status:', err.stack);
        res.status(500).json({ error: 'Failed to update job status', details: err.message });
    }
});

// DELETE job
router.delete('/:id', authenticateAdminJWT, async (req, res) => {
    const { id } = req.params;
    console.log('--- DEBUG: Admin delete job route hit for job ID:', id);

    try {
        // First delete related applications
        await pool.query('DELETE FROM student_applications WHERE job_id = $1', [id]);
        
        // Then delete the job
        const result = await pool.query('DELETE FROM job_applications WHERE job_id = $1 RETURNING job_id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        console.log('--- DEBUG: Job deleted successfully');
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        console.error('Error deleting job:', err.stack);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

// PUT update applicant status
router.put('/:id/applicant-status', authenticateAdminJWT, async (req, res) => {
    const { id } = req.params;
    const { applicantId, status } = req.body;
    console.log('--- DEBUG: Admin update applicant status route hit for job ID:', id, 'applicant ID:', applicantId, 'status:', status);

    try {
        // Validate status
        const validStatuses = ['pending', 'contacted', 'rejected', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be one of: pending, contacted, rejected, cancelled' });
        }

        console.log('--- DEBUG: Updating applicant status to:', status);

        // Map application_status to student_outcome
        let studentOutcome;
        switch (status) {
            case 'pending':
                studentOutcome = 'pending';
                break;
            case 'contacted':
                studentOutcome = 'pending'; // Still in process
                break;
            case 'rejected':
                studentOutcome = 'not_got_job';
                break;
            case 'cancelled':
                studentOutcome = 'cancelled';
                break;
            default:
                studentOutcome = 'pending';
        }

        // Update both application_status (for employer) and student_outcome (for student)
        const result = await pool.query(
            'UPDATE student_applications SET application_status = $1, student_outcome = $2 WHERE job_id = $3 AND student_id = $4 RETURNING application_id',
            [status, studentOutcome, id, applicantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Applicant not found for this job' });
        }

        console.log('--- DEBUG: Applicant status updated successfully');
        res.json({ message: 'Applicant status updated successfully' });
    } catch (err) {
        console.error('Error updating applicant status:', err.stack);
        res.status(500).json({ error: 'Failed to update applicant status', details: err.message });
    }
});

module.exports = router; 