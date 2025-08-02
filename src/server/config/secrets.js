// src/server/config/secrets.js
// Ensure dotenv is loaded if this file is accessed directly, though server.js loads it
require('dotenv').config();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const USER_JWT_SECRET = process.env.USER_JWT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;

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

module.exports = {
    ADMIN_JWT_SECRET,
    USER_JWT_SECRET,
    SESSION_SECRET,
};