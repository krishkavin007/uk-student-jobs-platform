// src/server/routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateAdminJWT = require('../middleware/authenticateAdminJWT');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// Create a new support message (from contact modal)
router.post('/create', async (req, res) => {
  try {
    const { subject, message, userType, userId, guestName, guestEmail, guestType } = req.body;
    


    // Check if user is logged in
    if (userId) {
      // Logged in user - get their details from users table
      const userResult = await pool.query(
        'SELECT user_first_name, user_last_name, user_email, user_type FROM users WHERE user_id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];
      
            // For logged-in users, always use their user table data
      const result = await pool.query(
        `INSERT INTO support_messages 
         (message_subject, message_content, user_id, guest_name, guest_email, guest_type, message_status) 
                  VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING message_id`,
        [
          subject,
          message,
          userId,
          `${user.user_first_name} ${user.user_last_name}`, // Always use user table data
          user.user_email, // Always use user table data
          user.user_type,
          'to-do'
        ]
      );

      res.status(201).json({ 
        message: 'Support message created successfully',
        messageId: result.rows[0].message_id 
      });
    } else {
      // Guest user - check if email exists in users table
      let existingUser = null;
      if (guestEmail) {
        const existingUserResult = await pool.query(
          'SELECT user_id, user_first_name, user_last_name, user_email, user_type FROM users WHERE user_email = $1',
          [guestEmail]
        );
        if (existingUserResult.rows.length > 0) {
          existingUser = existingUserResult.rows[0];
        }
      }

      // Insert guest message
      const result = await pool.query(
        `INSERT INTO support_messages 
         (message_subject, message_content, user_id, guest_name, guest_email, guest_type, message_status) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING message_id`,
        [
          subject,
          message,
          existingUser ? existingUser.user_id : null,
          existingUser ? `${existingUser.user_first_name} ${existingUser.user_last_name}` : guestName,
          existingUser ? existingUser.user_email : guestEmail,
          existingUser ? existingUser.user_type : (guestType || 'not_known'),
          'to-do'
        ]
      );

      res.status(201).json({ 
        message: 'Support message created successfully',
        messageId: result.rows[0].message_id 
      });
    }
  } catch (error) {
    console.error('Error creating support message:', error.stack);
    res.status(500).json({ error: 'Failed to create support message' });
  }
});

// Get all support messages (admin only)
router.get('/all', authenticateAdminJWT, authorizeAdmin(['super_admin', 'admin', 'viewer']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        sm.message_id,
        sm.guest_name as name,
        sm.guest_email as email,
        sm.guest_type as profile,
        sm.message_subject as subject,
        sm.message_status as status,
        sm.created_at,
        sm.user_id
       FROM support_messages sm
       ORDER BY sm.created_at DESC`
    );
    


    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching support messages:', error.stack);
    res.status(500).json({ error: 'Failed to fetch support messages' });
  }
});

// Get support message by ID (admin only)
router.get('/:messageId', authenticateAdminJWT, authorizeAdmin(['super_admin', 'admin', 'viewer']), async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        sm.message_id,
        sm.guest_name as name,
        sm.guest_email as email,
        sm.guest_type as profile,
        sm.message_subject as subject,
        sm.message_content as message,
        sm.message_status as status,
        sm.created_at,
        sm.user_id
       FROM support_messages sm
       WHERE sm.message_id = $1`,
      [messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Support message not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching support message:', error.stack);
    res.status(500).json({ error: 'Failed to fetch support message' });
  }
});

// Update message status (admin only)
router.patch('/:messageId/status', authenticateAdminJWT, authorizeAdmin(['super_admin', 'admin']), async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['to-do', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const result = await pool.query(
      'UPDATE support_messages SET message_status = $1, updated_at = CURRENT_TIMESTAMP WHERE message_id = $2 RETURNING message_id',
      [status, messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Support message not found' });
    }

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating support message status:', error.stack);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete support message (admin only)
router.delete('/:messageId', authenticateAdminJWT, authorizeAdmin(['super_admin', 'admin']), async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM support_messages WHERE message_id = $1 RETURNING message_id',
      [messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Support message not found' });
    }

    res.json({ message: 'Support message deleted successfully' });
  } catch (error) {
    console.error('Error deleting support message:', error.stack);
    res.status(500).json({ error: 'Failed to delete support message' });
  }
});

module.exports = router;
