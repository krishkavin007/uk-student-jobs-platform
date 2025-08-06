// src/server/routes/adminDashboardRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Your database connection pool
const authenticateAdminJWT = require('../middleware/authenticateAdminJWT');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// Define an API endpoint for fetching dashboard statistics
router.get(
  '/analytics',
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

      // 4. Get number of Active Logins (users with active sessions)
      let activeLogins = 0;
      try {
        const activeLoginsResult = await pool.query(
          `SELECT COUNT(*) as count
           FROM user_sessions
           WHERE expire > NOW();`
        );
        activeLogins = parseInt(activeLoginsResult.rows[0].count, 10);
      } catch (error) {
        console.log('Session table not available, using fallback method');
        // Fallback: count users with recent login activity
        const fallbackResult = await pool.query(
          `SELECT COUNT(DISTINCT user_id)
           FROM users
           WHERE last_login >= NOW() - INTERVAL '5 minutes'
             AND user_status = 'active';`
        );
        activeLogins = parseInt(fallbackResult.rows[0].count, 10);
      }

      // 5. Get new students for the last 7 days
      const newStudentsResult = await pool.query(
        `SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
         FROM users 
         WHERE user_type = 'student' 
           AND created_at >= CURRENT_DATE - INTERVAL '7 days'
         GROUP BY DATE(created_at)
         ORDER BY date ASC;`
      );
      
      const newStudentsByDay = newStudentsResult.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count, 10)
      }));

      // 6. Get new employers for the last 7 days
      const newEmployersResult = await pool.query(
        `SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
         FROM users 
         WHERE user_type = 'employer' 
           AND created_at >= CURRENT_DATE - INTERVAL '7 days'
         GROUP BY DATE(created_at)
         ORDER BY date ASC;`
      );
      
      const newEmployersByDay = newEmployersResult.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count, 10)
      }));

      // Combine all results into a single object
      const adminStats = {
        totalStudents,
        totalEmployers,
        totalAdmins,
        activeLogins,
        newStudentsByDay,
        newEmployersByDay,
      };

      res.json(adminStats); // Send the combined statistics as JSON
    } catch (error) {
      console.error('Error fetching admin dashboard statistics:', error.stack);
      res.status(500).json({ error: { message: 'Failed to fetch dashboard statistics' } });
    }
  }
);

module.exports = router;