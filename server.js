// server.js

const express = require('express');
const next = require('next');
const { Pool } = require('pg');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // For generating unique filenames
const fs = require('fs'); // Import fs for directory creation

// Configure storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Construct path relative to server.js.
        // This will create 'uploads/users_images' within your project directory
        // where server.js is located.
        const uploadDir = path.join(__dirname, 'uploads', 'users_images');
        
        // Ensure the directory exists. If not, create it recursively.
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate a unique filename using UUID and the original file extension
        const uniqueSuffix = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

// Configure multer upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB (adjust as needed)
    fileFilter: function (req, file, cb) {
        // Accept only image files (jpeg, jpg, png, gif)
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (JPEG, JPG, PNG, GIF) are allowed!'));
    }
});


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

    // IMPORTANT: Add this line to tell Express to trust proxy headers (like X-Forwarded-Proto)
    // This is essential when running behind a reverse proxy like Plesk.
    server.set('trust proxy', 1);

    // Configure and use express-session middleware
    server.use(session({
        secret: process.env.SESSION_SECRET || 'a_very_secret_key_please_change_this_in_production', // IMPORTANT: Use a strong, random key! Set as env variable in Plesk.
        resave: false, // Don't save session if unmodified
        saveUninitialized: false, // Don't create session until something is stored
        cookie: {
            secure: process.env.NODE_ENV === 'production', // This will now correctly evaluate based on the original HTTPS request
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            maxAge: 24 * 60 * 60 * 1000 // Session expires in 24 hours (adjust as needed)
        }
    }));

    // Serve static files (like images) from the 'uploads' directory
    // This assumes your 'uploads' folder is at the same level as your 'server.js' file.
    server.use('/uploads', express.static(path.join(__dirname, 'uploads')));


    // NEW: Authentication Middleware
    // This middleware will check if a user is logged in via session
    // and attach their user data to req.user for subsequent routes.
    const authenticateUser = async (req, res, next) => {
        // If no userId in the session, the user is not authenticated
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized: No active session' });
        }

        try {
            // Fetch user details from the database using the ID stored in the session
            const result = await pool.query(
                `SELECT
                    user_id, user_username, user_email, google_id, user_type,
                    organisation_name, contact_phone_number, user_first_name,
                    user_last_name, university_college, created_at, user_image, user_city
                FROM Users WHERE user_id = $1`,
                [req.session.userId]
            );

            if (result.rows.length === 0) {
                // If user ID in session doesn't match any user (e.g., user deleted),
                // destroy the invalid session to prevent stale sessions.
                req.session.destroy(err => {
                    if (err) console.error('Error destroying invalid session:', err);
                });
                return res.status(401).json({ error: 'Unauthorized: User not found or session invalid' });
            }

            // Attach the user object to the request. This makes user data available
            // to any route that uses this 'authenticateUser' middleware.
            req.user = result.rows[0];
            next(); // Continue to the actual route handler
        } catch (err) {
            console.error('Error in authentication middleware:', err.stack);
            res.status(500).json({ error: 'Internal server error during authentication check' });
        }
    };
    // END NEW: Authentication Middleware


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
                organisation_name, contact_phone_number, user_first_name,
                user_last_name, university_college, created_at, user_image, user_city
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
                organisation_name, contact_phone_number, user_first_name,
                user_last_name, university_college, created_at, user_image, user_city
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

        // MODIFIED: Changed organization_name to organisation_name in destructuring
        const { user_username, user_email, password, google_id, user_type, organisation_name, contact_phone_number, user_first_name, user_last_name, university_college, user_city } = req.body;

        if (!user_email || !password || !user_type) {
            console.log('--- DEBUG: Missing required fields ---');
            return res.status(400).json({ error: 'Email, password, and user_type are required' });
        }

        try {
            // Hash the password before storing it
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            const result = await pool.query(
                `INSERT INTO Users (user_username, user_email, password_hash, google_id, user_type, organisation_name, contact_phone_number, user_first_name, user_last_name, university_college, user_city)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                 RETURNING user_id, user_username, user_email, google_id, user_type, organisation_name, contact_phone_number, user_first_name, user_last_name, university_college, created_at, user_image, user_city`, // MODIFIED: Changed organization_name to organisation_name in RETURNING clause
                [user_username, user_email, password_hash, google_id, user_type, organisation_name, contact_phone_number, user_first_name, user_last_name, university_college, user_city]
            );
            console.log('--- DEBUG: User created successfully ---');

            // Log in the newly created user immediately by setting session ID
            req.session.userId = result.rows[0].user_id;

            // Return the full user object for automatic frontend login, wrapped in a 'user' property
            res.status(201).json({ message: 'Account created successfully', user: result.rows[0] });

        } catch (err) {
            console.error('--- DEBUG: Error creating user:', err.stack);
            if (err.code === '23505') { // Unique violation
                return res.status(409).json({ error: 'User with this email or username already exists.' });
            }
            res.status(500).json({ error: 'Failed to create user' });
        }
    });

    // PUT update user (including optional image upload)
    // Path: /api/user/:id
    // Use `upload.single('userImage')` as middleware. 'userImage' is the name of the form field for the image.
    server.put('/api/user/:id', (req, res, next) => {
        upload.single('userImage')(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                // These errors have specific codes that you can use for more precise messages.
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'File too large. Maximum file size is 5MB.' });
                }
                // For other Multer errors like 'LIMIT_UNEXPECTED_FILE', 'LIMIT_FIELD_COUNT', etc.
                return res.status(400).json({ error: `File upload error: ${err.message}` });
            } else if (err) {
                // An unknown error occurred, likely from your fileFilter function.
                // This will catch the 'Only images (JPEG, JPG, PNG, GIF) are allowed!' message.
                return res.status(400).json({ error: err.message });
            }
            // Everything went fine with the upload, continue to the route handler
            next();
        });
    }, async (req, res) => {
        const { id } = req.params;
        // Destructure other profile fields from req.body (non-file fields)
        // MODIFIED: Changed organization_name to organisation_name in destructuring
        const { user_username, user_email, user_type, organisation_name, contact_phone_number, user_first_name, user_last_name, university_college, user_city } = req.body;

        let user_image_url = undefined; // Use undefined initially, so COALESCE doesn't update it if not provided

        // Check if a file was uploaded by multer
        if (req.file) {
            // Construct the full public URL for the image
            user_image_url = `${req.protocol}://${req.get('host')}/uploads/users_images/${req.file.filename}`;
            console.log('--- DEBUG: Image uploaded, URL:', user_image_url); // For debugging
        }

        try {
            let queryParts = [];
            let queryParams = [];
            let paramCounter = 1;

            // Add fields to update only if they are provided in the request body or a new image URL is present
            if (user_username !== undefined) {
                queryParts.push(`user_username = $${paramCounter++}`);
                queryParams.push(user_username);
            }
            if (user_email !== undefined) {
                queryParts.push(`user_email = $${paramCounter++}`);
                queryParams.push(user_email);
            }
            if (user_type !== undefined) {
                queryParts.push(`user_type = $${paramCounter++}`);
                queryParams.push(user_type);
            }
            // MODIFIED: Changed organization_name to organisation_name in query part
            if (organisation_name !== undefined) {
                queryParts.push(`organisation_name = $${paramCounter++}`);
                queryParams.push(organisation_name);
            }
            if (contact_phone_number !== undefined) {
                queryParts.push(`contact_phone_number = $${paramCounter++}`);
                queryParams.push(contact_phone_number);
            }
            if (user_first_name !== undefined) {
                queryParts.push(`user_first_name = $${paramCounter++}`);
                queryParams.push(user_first_name);
            }
            if (user_last_name !== undefined) {
                queryParts.push(`user_last_name = $${paramCounter++}`);
                queryParams.push(user_last_name);
            }
            if (university_college !== undefined) {
                queryParts.push(`university_college = $${paramCounter++}`);
                queryParams.push(university_college);
            }
            if (user_city !== undefined) {
                queryParts.push(`user_city = $${paramCounter++}`);
                queryParams.push(user_city);
            }
            // IMPORTANT: Add user_image to updates if a new image URL was generated OR if the client explicitly sent a user_image field (e.g., to clear it)
            if (user_image_url !== undefined) {
                queryParts.push(`user_image = $${paramCounter++}`);
                queryParams.push(user_image_url);
            } else if (Object.prototype.hasOwnProperty.call(req.body, 'user_image')) { // Check if 'user_image' key exists in req.body
                queryParts.push(`user_image = $${paramCounter++}`);
                queryParams.push(req.body.user_image); // Allow explicit setting to null, empty string, etc.
            }


            if (queryParts.length === 0) {
                return res.status(400).json({ message: 'No fields provided for update.' });
            }

            queryParams.push(id); // Add the ID as the last parameter for the WHERE clause

            const queryText = `UPDATE Users SET ${queryParts.join(', ')} WHERE user_id = $${paramCounter} RETURNING *;`;
            console.log('--- DEBUG: SQL Query:', queryText); // For debugging
            console.log('--- DEBUG: SQL Params:', queryParams); // For debugging

            const result = await pool.query(queryText, queryParams);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(result.rows[0]); // Return the updated user data (which will now include user_image)
        } catch (err) {
            console.error('--- DEBUG: Error updating user with image:', err.stack);
            // This remains a generic 500, as it's an unexpected server/database error.
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
            res.status(204).send(); // 204 No Content - successful deletion
        } catch (err) {
            console.error('Error deleting user:', err.stack);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    });

    // POST Login endpoint
    // Path: /api/login
    server.post('/api/login', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        try {
            // Select all user profile fields from the database
            const result = await pool.query(
                `SELECT
                    user_id, user_username, user_email, password_hash, user_type,
                    organisation_name, contact_phone_number, user_first_name,
                    user_last_name, university_college, created_at, user_image, user_city
                FROM Users WHERE user_email = $1`, // MODIFIED: Changed organization_name to organisation_name
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = result.rows[0];
            // Compare the provided password with the hashed password in the database
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Store user ID in the session after successful login
            req.session.userId = user.user_id;

            // Include ALL fetched user fields in the returned user object
            res.json({
                message: 'Login successful',
                user: {
                    user_id: user.user_id,
                    user_username: user.user_username,
                    user_email: user.user_email,
                    user_type: user.user_type,
                    user_image: user.user_image,
                    contact_phone_number: user.contact_phone_number,
                    user_first_name: user.user_first_name,
                    user_last_name: user.user_last_name,
                    university_college: user.university_college,
                    organisation_name: user.organisation_name, // MODIFIED: Changed organization_name to organisation_name
                    user_city: user.user_city,
                    created_at: user.created_at
                }
            });

        } catch (err) {
            console.error('Error during login:', err.stack);
            res.status(500).json({ error: 'Login failed' });
        }
    });

    // NEW: API Endpoint for Current User
    // Path: /api/auth/me
    // This route is protected by 'authenticateUser' middleware
    server.get('/api/auth/me', authenticateUser, (req, res) => {
        // If we reach here, 'req.user' has been populated by the 'authenticateUser' middleware
        // It contains the full details of the currently logged-in user, now including user_image.
        res.json(req.user);
    });

    // NEW: Logout Endpoint
    // Path: /api/logout
    server.post('/api/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session during logout:', err.stack);
                return res.status(500).json({ error: 'Failed to log out' });
            }
            // Also clear the session cookie from the client's browser
            res.clearCookie('connect.sid'); // 'connect.sid' is the default name for express-session cookie
            res.status(200).json({ message: 'Logged out successfully' });
        });
    });


    // --- API Endpoints for 'job_applications' Table ---
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

    // POST new job (MODIFIED TO HANDLE EMPLOYER REGISTRATION/LOGIN)
    // Path: /api/job
    server.post('/api/job', async (req, res) => {
        const { job_title, job_description, job_category, job_location, hourly_pay, hours_per_week, is_sponsored, employer_registration_data } = req.body;

        let posted_by_user_id;
        let job_contact_name;
        let job_contact_phone;
        let job_contact_email;

        try {
            if (req.session.userId) {
                // Scenario 1: User is already logged in
                const userResult = await pool.query(
                    `SELECT user_id, user_type, user_first_name, user_last_name, user_email, contact_phone_number, organisation_name
                    FROM Users WHERE user_id = $1`, // MODIFIED: Changed organization_name to organisation_name
                    [req.session.userId]
                );

                if (userResult.rows.length === 0) {
                    req.session.destroy(() => {}); // Clear invalid session
                    return res.status(401).json({ error: 'Authenticated user not found or session invalid.' });
                }

                const user = userResult.rows[0];

                if (user.user_type !== 'employer') {
                    return res.status(403).json({ error: 'Only employers can post jobs.' });
                }

                posted_by_user_id = user.user_id;
                job_contact_name = `${user.user_first_name || ''} ${user.user_last_name || ''}`.trim();
                job_contact_phone = user.contact_phone_number;
                job_contact_email = user.user_email;

            } else {
                // Scenario 2: User is not logged in, expect employer_registration_data
                if (!employer_registration_data) {
                    return res.status(400).json({ error: 'Employer registration data is required if not logged in.' });
                }

                // MODIFIED: Changed businessName to organisationName in destructuring
                const { firstName, lastName, email, phoneNumber, city, organisationName, password } = employer_registration_data;

                // Basic validation for new employer registration fields
                if (!firstName || !lastName || !email || !phoneNumber || !city || !organisationName || !password) { // MODIFIED: Changed businessName to organisationName
                    return res.status(400).json({ error: 'All employer registration fields are required.' });
                }
                if (password.length < 6) {
                    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
                }

                // Check if email already exists and get its user_type
                const existingUserResult = await pool.query('SELECT user_id, user_type FROM Users WHERE user_email = $1', [email]);
                if (existingUserResult.rows.length > 0) {
                    const existingUserType = existingUserResult.rows[0].user_type;
                    let errorMessage = 'An account is already registered with this email address. Please log in or use a different email.';

                    if (existingUserType === 'employer') {
                        errorMessage = 'An employer account is already registered with this email address. Please log in or use a different email.';
                    } else if (existingUserType === 'student') {
                        errorMessage = 'A student account is already registered with this email address. Please log in or use a different email.';
                    }
                    return res.status(409).json({ error: errorMessage });
                }

                // Hash the password
                const salt = await bcrypt.genSalt(10);
                const password_hash = await bcrypt.hash(password, salt);

                // Create new employer user
                const newUserResult = await pool.query(
                    `INSERT INTO Users (user_first_name, user_last_name, user_email, contact_phone_number, user_city, organisation_name, password_hash, user_type, user_username)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, 'employer', $3) -- user_username is set to user_email
                    RETURNING user_id, user_first_name, user_last_name, user_email, contact_phone_number, user_city, organisation_name, user_username, user_type, created_at, user_image`, // MODIFIED: Changed organization_name to organisation_name and added all returning fields
                    [firstName, lastName, email, phoneNumber, city, organisationName, password_hash] // MODIFIED: Changed businessName to organisationName
                );

                const newUser = newUserResult.rows[0];

                // Log in the newly created user (employer)
                req.session.userId = newUser.user_id;

                posted_by_user_id = newUser.user_id;
                job_contact_name = `${newUser.user_first_name} ${newUser.user_last_name}`;
                job_contact_phone = newUser.contact_phone_number;
                job_contact_email = newUser.user_email;
            }

            // Basic validation for required job fields
            if (!job_title || !job_description || !job_category || !job_location || hourly_pay === undefined || !hours_per_week || is_sponsored === undefined || !posted_by_user_id) {
                return res.status(400).json({ error: 'Missing required job fields or employer information.' });
            }

            // Insert job application
            const result = await pool.query(
                `INSERT INTO job_applications (job_title, job_description, job_category, job_location, hourly_pay, hours_per_week, contact_name, contact_phone, contact_email, is_sponsored, posted_by_user_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *`,
                [job_title, job_description, job_category, job_location, hourly_pay, hours_per_week, job_contact_name, job_contact_phone, job_contact_email, is_sponsored, posted_by_user_id]
            );
            res.status(201).json(result.rows[0]);

        } catch (err) {
            console.error('Error posting job or creating employer:', err.stack);
            if (err.code === '23505') {
                return res.status(409).json({ error: 'A user with this email already exists. Please log in or use a different email.' });
            }
            res.status(500).json({ error: 'Failed to post job due to a server error.' });
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
                 WHERE job_id = $14 RETURNING *`,
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