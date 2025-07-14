const express = require('express');
const next = require('next');
const { Pool } = require('pg');
// If you plan to implement user registration/login, you MUST hash passwords.
// Install bcryptjs: npm install bcryptjs
// Then uncomment the line below:
// const bcrypt = require('bcryptjs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Create the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Configure your PostgreSQL database connection pool
const pool = new Pool({
  user: 'job_app_user',
  host: 'localhost',
  database: 'job_app_db',
  password: process.env.DB_PASSWORD, // Reads from the environment variable set in Plesk
  port: 5432,
});


app.prepare().then(async () => {
  const server = express();
  server.use(express.json()); // Essential middleware to parse JSON request bodies for POST/PUT


  // ============== YOUR BACKEND API ROUTES START HERE ==============

  // Test endpoint (can keep for basic testing)
  server.get('/api/test', (req, res) => {
    res.send('Hello from the backend API!');
  });


  // --- API Endpoints for 'Users' Table ---

  // GET all users
  // Path: /api/user
  server.get('/api/user', async (req, res) => {
    try {
      const result = await pool.query(`SELECT
        user_id, user_username, user_email, google_id, user_type,
        organization_name, contact_phone_number, user_first_name,
        user_last_name, university_college, created_at
        FROM Users`);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching users:', err.stack);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // GET user by ID
  // Path: /api/user/:id
  server.get('/api/user/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(`SELECT
        user_id, user_username, user_email, google_id, user_type,
        organization_name, contact_phone_number, user_first_name,
        user_last_name, university_college, created_at
        FROM Users WHERE user_id = $1`, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching user by ID:', err.stack);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // POST new user (Registration)
  // Path: /api/user
  server.post('/api/user', async (req, res) => {
    console.log('--- DEBUG: POST /api/user endpoint hit ---');
    console.log('Request body:', req.body);

    const { user_username, user_email, password, google_id, user_type, organization_name, contact_phone_number, user_first_name, user_last_name, university_college } = req.body;

    if (!user_email || !password || !user_type) {
      console.log('--- DEBUG: Missing required fields ---');
      return res.status(400).json({ error: 'Email, password, and user_type are required' });
    }

    try {
      const password_hash = password; // WARNING: Storing plaintext password for demonstration.

      const result = await pool.query(
        `INSERT INTO Users (user_username, user_email, password_hash, google_id, user_type, organization_name, contact_phone_number, user_first_name, user_last_name, university_college)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING user_id, user_username, user_email, user_type, created_at`,
        [user_username, user_email, password_hash, google_id, user_type, organization_name, contact_phone_number, user_first_name, user_last_name, university_college]
      );
      console.log('--- DEBUG: User created successfully ---');
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('--- DEBUG: Error creating user:', err.stack);
      if (err.code === '23505') {
        return res.status(409).json({ error: 'User with this email or username already exists.' });
      }
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // PUT update user
  // Path: /api/user/:id
  server.put('/api/user/:id', async (req, res) => {
    const { id } = req.params;
    const { user_username, user_email, user_type, organization_name, contact_phone_number, user_first_name, user_last_name, university_college } = req.body;
    try {
      const result = await pool.query(
        `UPDATE Users SET
           user_username = COALESCE($1, user_username),
           user_email = COALESCE($2, user_email),
           user_type = COALESCE($3, user_type),
           organization_name = COALESCE($4, organization_name),
           contact_phone_number = COALESCE($5, contact_phone_number),
           user_first_name = COALESCE($6, user_first_name),
           user_last_name = COALESCE($7, user_last_name),
           university_college = COALESCE($8, university_college)
         WHERE user_id = $9 RETURNING user_id, user_username, user_email, user_type`,
        [user_username, user_email, user_type, organization_name, contact_phone_number, user_first_name, user_last_name, university_college, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating user:', err.stack);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // DELETE user
  // Path: /api/user/:id
  server.delete('/api/user/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM Users WHERE user_id = $1 RETURNING user_id', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(204).send();
    } catch (err) {
      console.error('Error deleting user:', err.stack);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // (Optional) POST Login endpoint
  // Path: /api/login
  server.post('/api/login', async (req, res) => {
    const { user_email, password } = req.body;
    if (!user_email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const result = await pool.query('SELECT user_id, user_email, password_hash, user_type FROM Users WHERE user_email = $1', [user_email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const isPasswordValid = (password === user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      res.json({ message: 'Login successful', user: { user_id: user.user_id, user_email: user.user_email, user_type: user.user_type } });

    } catch (err) {
      console.error('Error during login:', err.stack);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // --- NEW API Endpoints for 'job_applications' Table ---
  // Note: Database table name is 'job_applications' (all lowercase)
  // API path is '/api/job' (singular, as preferred)

  // GET all jobs
  // Path: /api/job
  server.get('/api/job', async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM job_applications`);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching jobs:', err.stack);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });

  // GET job by ID
  // Path: /api/job/:id
  server.get('/api/job/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM job_applications WHERE job_id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching job by ID:', err.stack);
      res.status(500).json({ error: 'Failed to fetch job' });
    }
  });

  // POST new job
  // Path: /api/job
  server.post('/api/job', async (req, res) => {
    const { job_title, job_description, job_category, job_location, hourly_pay, hours_per_week, contact_name, contact_phone, contact_email, is_sponsored, posted_by_user_id, expires_at, job_status } = req.body;

    // Basic validation for required fields
    if (!job_title || !job_description || !job_category || !job_location || hourly_pay === undefined || !hours_per_week || !contact_name || !contact_phone || !contact_email || is_sponsored === undefined || !posted_by_user_id) {
      return res.status(400).json({ error: 'Missing required job fields' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO job_applications (job_title, job_description, job_category, job_location, hourly_pay, hours_per_week, contact_name, contact_phone, contact_email, is_sponsored, posted_by_user_id, expires_at, job_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`, // Return all fields of the newly created job
        [job_title, job_description, job_category, job_location, hourly_pay, hours_per_week, contact_name, contact_phone, contact_email, is_sponsored, posted_by_user_id, expires_at, job_status]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating job:', err.stack);
      res.status(500).json({ error: 'Failed to create job' });
    }
  });

  // PUT update job
  // Path: /api/job/:id
  server.put('/api/job/:id', async (req, res) => {
    const { id } = req.params;
    const { job_title, job_description, job_category, job_location, hourly_pay, hours_per_week, contact_name, contact_phone, contact_email, is_sponsored, posted_by_user_id, expires_at, job_status } = req.body;

    try {
      const result = await pool.query(
        `UPDATE job_applications SET
           job_title = COALESCE($1, job_title),
           job_description = COALESCE($2, job_description),
           job_category = COALESCE($3, job_category),
           job_location = COALESCE($4, job_location),
           hourly_pay = COALESCE($5, hourly_pay),
           hours_per_week = COALESCE($6, hours_per_week),
           contact_name = COALESCE($7, contact_name),
           contact_phone = COALESCE($8, contact_phone),
           contact_email = COALESCE($9, contact_email),
           is_sponsored = COALESCE($10, is_sponsored),
           posted_by_user_id = COALESCE($11, posted_by_user_id),
           expires_at = COALESCE($12, expires_at),
           job_status = COALESCE($13, job_status)
         WHERE job_id = $14 RETURNING *`, // Return all fields of the updated job
        [job_title, job_description, job_category, job_location, hourly_pay, hours_per_week, contact_name, contact_phone, contact_email, is_sponsored, posted_by_user_id, expires_at, job_status, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating job:', err.stack);
      res.status(500).json({ error: 'Failed to update job' });
    }
  });

  // DELETE job
  // Path: /api/job/:id
  server.delete('/api/job/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM job_applications WHERE job_id = $1 RETURNING job_id', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }
      res.status(204).send(); // 204 No Content - successful deletion
    } catch (err) {
      console.error('Error deleting job:', err.stack);
      res.status(500).json({ error: 'Failed to delete job' });
    }
  });

  // GET jobs by user (employer)
  // Path: /api/job/user/:userId
  server.get('/api/job/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const result = await pool.query('SELECT * FROM job_applications WHERE posted_by_user_id = $1', [userId]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching jobs by user ID:', err.stack);
      res.status(500).json({ error: 'Failed to fetch jobs for user' });
    }
  });

  // GET jobs by category
  // Path: /api/job/category/:category
  server.get('/api/job/category/:category', async (req, res) => {
    const { category } = req.params;
    try {
      const result = await pool.query('SELECT * FROM job_applications WHERE job_category ILIKE $1', [`%${category}%`]); // ILIKE for case-insensitive search
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching jobs by category:', err.stack);
      res.status(500).json({ error: 'Failed to fetch jobs by category' });
    }
  });


  // ============== YOUR BACKEND API ROUTES END HERE ==============

  // All other requests are handled by Next.js
  server.all('*', (req, res) => {
    console.log(`--- DEBUG: Next.js handler caught request. Method: ${req.method}, Path: ${req.url} ---`);
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});