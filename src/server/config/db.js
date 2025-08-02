// src/server/config/db.js
const { Pool } = require('pg');

const pool = new Pool({
   user: 'job_app_user',
    host: 'localhost',
    database: 'job_app_db',
    password: process.env.DB_PASSWORD, // Reads from the environment variable set in Plesk
    port: 5432,
});

module.exports = pool;