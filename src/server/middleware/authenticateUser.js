// src/server/middleware/authenticateUser.js
// This middleware checks for session-based user authentication.
// It relies on req.session.userId being set by the login process.

const authenticateUser = (req, res, next) => {
    if (req.session && req.session.userId) {
        console.log(`--- DEBUG: authenticateUser: User ID ${req.session.userId} found in session.`);
        // Optionally, fetch user details and attach to req.user here if needed by all protected routes.
        // For now, we assume user details are fetched in specific routes like /me.
        return next(); // User is authenticated, proceed
    }
    console.log('--- DEBUG: authenticateUser: No userId in session. Unauthorized.');
    res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
};

module.exports = authenticateUser;