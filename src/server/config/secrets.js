// src/server/config/secrets.js
// Ensure dotenv is loaded if this file is accessed directly, though server.js loads it
require('dotenv').config();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const USER_JWT_SECRET = process.env.USER_JWT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Google OAuth credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Basic validation for critical secrets
if (!ADMIN_JWT_SECRET) {
    console.error('FATAL ERROR: ADMIN_JWT_SECRET environment variable is not defined!');
    // process.exit(1); // Server.js will handle global exit
}
if (!USER_JWT_SECRET) {
    console.error('FATAL ERROR: USER_JWT_SECRET environment variable is not defined!');
    // process.exit(1);
}
if (!SESSION_SECRET) {
    console.error('FATAL ERROR: SESSION_SECRET environment variable is not defined!');
    // process.exit(1);
}

// Google OAuth validation (only warn, not fatal, as it's optional for basic functionality)
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('WARNING: Google OAuth credentials not configured. Google Sign-in will be disabled.');
    console.warn('To enable Google OAuth, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
}

module.exports = {
    ADMIN_JWT_SECRET,
    USER_JWT_SECRET,
    SESSION_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
};