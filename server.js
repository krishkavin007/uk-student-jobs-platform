// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000; // Use port from environment variable or default to 5000

// Middleware to parse JSON bodies
app.use(express.json());

// Database connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to PostgreSQL at:', res.rows[0].now);
});

// Basic route to check if the server is running
app.get('/', (req, res) => {
    res.send('Job Application API is running!');
});

// GET all job applications (now correctly named job_applications)
app.get('/api/jobs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM job_applications ORDER BY job_id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching job posts:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST a new job application (now using columns from your actual table schema)
app.post('/api/jobs', async (req, res) => {
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
        posted_by_user_id,
        expires_at,
        job_status
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO job_applications (
                job_title, job_description, job_category, job_location, hourly_pay,
                hours_per_week, contact_name, contact_phone, contact_email,
                is_sponsored, posted_by_user_id, expires_at, job_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [
                job_title, job_description, job_category, job_location, hourly_pay,
                hours_per_week, contact_name, contact_phone, contact_email,
                is_sponsored, posted_by_user_id, expires_at, job_status
            ]
        );
        res.status(201).json(result.rows[0]); // 201 Created
    } catch (err) {
        console.error('Error creating job post:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE a job post by ID
app.delete('/api/jobs/:id', async (req, res) => {
    const { id } = req.params; // Get the ID from the URL parameter (which is job_id)
    try {
        const result = await pool.query('DELETE FROM job_applications WHERE job_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Job post not found' });
        }
        res.status(200).json({ message: 'Job post deleted successfully', deletedJob: result.rows[0] });
    } catch (err) {
        console.error('Error deleting job post:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT/PATCH a job application by ID
app.put('/api/jobs/:id', async (req, res) => {
    const { id } = req.params; // Get job_id from URL parameter
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
        posted_by_user_id,
        expires_at,
        job_status
    } = req.body; // Get updated data from request body

    try {
        // Dynamically build the SET clause for the SQL UPDATE statement
        // This allows for partial updates (PATCH-like behavior)
        const updates = [];
        const values = [];
        let paramIndex = 1; // Used for parameterized query values ($1, $2, etc.)

        // Define all possible fields that can be updated
        const fields = {
            job_title, job_description, job_category, job_location, hourly_pay,
            hours_per_week, contact_name, contact_phone, contact_email,
            is_sponsored, posted_by_user_id, expires_at, job_status
        };

        // Iterate over the fields and add them to the updates array if they are provided in the request body
        for (const key in fields) {
            // Check if the field exists and is not undefined in the request body
            if (fields[key] !== undefined) {
                updates.push(`${key} = $${paramIndex}`); // Add 'column = $paramIndex' to updates array
                values.push(fields[key]); // Add the value to the values array
                paramIndex++; // Increment for the next parameter
            }
        }

        // If no fields were provided in the request body, return an error
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update provided' });
        }

        values.push(id); // Add the job_id to the end of the values array for the WHERE clause
        // Construct the final SQL query
        const query = `UPDATE job_applications SET ${updates.join(', ')} WHERE job_id = $${paramIndex} RETURNING *`;

        // Execute the query
        const result = await pool.query(query, values);

        // Check if any row was updated (i.e., if the job_id existed)
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Job post not found' });
        }
        // Return the updated job record
        res.status(200).json(result.rows[0]); // 200 OK - Return the updated resource
    } catch (err) {
        console.error('Error updating job post:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
