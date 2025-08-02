// src/server/routes/adminDashboardRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Your database connection pool
const authenticateAdminJWT = require('../middleware/authenticateAdminJWT');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// Define an API endpoint for fetching dashboard statistics
router.get(
  '/stats',
  authenticateAdminJWT, // Protect the route with JWT authentication
  authorizeAdmin(['super_admin', 'admin', 'viewer']), // Only specific admin roles can access
  async (req, res) => {
    try {
      // 1. Get total number of Students
      const studentsResult = await pool.query(
        "SELECT COUNT(user_id) FROM users WHERE user_type = 'student';"
      );
      const totalStudents = parseInt(studentsResult.rows[0].count, 10);

      // 2. Get total number of Employers
      const employersResult = await pool.query(
        "SELECT COUNT(user_id) FROM users WHERE user_type = 'employer';"
      );
      const totalEmployers = parseInt(employersResult.rows[0].count, 10);

      // 3. Get total number of Admins (assuming user_type can be 'admin' or 'super_admin')
      const adminsResult = await pool.query(
        "SELECT COUNT(user_id) FROM users WHERE user_type IN ('admin', 'super_admin');"
      );
      const totalAdmins = parseInt(adminsResult.rows[0].count, 10);

      // 4. Get number of Active Logins (e.g., logged in within the last 15 minutes and user_status is 'active')
      // Adjust '15 minutes' as per your definition of "active"
      const activeLoginsResult = await pool.query(
        `SELECT COUNT(DISTINCT user_id)
         FROM users
         WHERE last_login >= NOW() - INTERVAL '15 minutes'
           AND user_status = 'active';`
      );
      const activeLogins = parseInt(activeLoginsResult.rows[0].count, 10);

      // Combine all results into a single object
      const adminStats = {
        totalStudents,
        totalEmployers,
        totalAdmins,
        activeLogins,
      };

      res.json(adminStats); // Send the combined statistics as JSON
    } catch (error) {
      console.error('Error fetching admin dashboard statistics:', error.stack);
      res.status(500).json({ error: { message: 'Failed to fetch dashboard statistics' } });
    }
  }
);

module.exports = router;