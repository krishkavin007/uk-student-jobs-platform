// src/server/middleware/authenticateAdminJWT.js
const jwt = require('jsonwebtoken');
// Import ADMIN_JWT_SECRET from the new centralized secrets file
const { ADMIN_JWT_SECRET } = require('../config/secrets');

// Basic validation (also done in secrets.js, but good to have a check here too)
if (!ADMIN_JWT_SECRET) {
    console.error('FATAL ERROR: ADMIN_JWT_SECRET is not defined in authenticateAdminJWT middleware!');
    // Depending on your error handling, you might want to throw or exit here.
}

const authenticateAdminJWT = (req, res, next) => {
    // --- UPDATED: Get token from httpOnly cookie ---
    const token = req.cookies.admin_jwt;

    if (!token) {
        console.log('--- DEBUG: authenticateAdminJWT: No admin_jwt cookie found. Unauthorized.');
        // Previously: "No token provided, authorization denied."
        return res.status(401).json({ error: 'Authentication required: No token found.' });
    }

    try {
        const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
        // @ts-ignore
        req.adminUser = decoded; // Attach decoded payload to request, e.g., { admin_id, username, role }

        console.log(`--- DEBUG: authenticateAdminJWT: Token verified for admin ID ${decoded.admin_id}.`);
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        console.error('--- ERROR: authenticateAdminJWT: Token verification failed:', err.message);
        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Authentication token expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid or malformed authentication token. Access denied.' });
    }
};

module.exports = authenticateAdminJWT;