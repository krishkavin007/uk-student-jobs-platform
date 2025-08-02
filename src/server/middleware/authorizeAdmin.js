// src/server/middleware/authorizeAdmin.js
function authorizeAdmin(requiredRoles) {
    return (req, res, next) => {
        // @ts-ignore
        if (!req.adminUser || !req.adminUser.role) {
            console.warn('--- AUTH ERROR: Admin user not found on request or role is missing. ---');
            return res.status(403).json({ error: 'Access denied: Not authenticated as admin.' });
        }

        // @ts-ignore
        const userRole = req.adminUser.role;

        if (requiredRoles.includes(userRole)) {
            next(); // User has the required role
        } else {
            console.warn(`--- AUTH ERROR: User '${// @ts-ignore
            req.adminUser.username}' with role '${userRole}' attempted to access route requiring roles: [${requiredRoles.join(', ')}]. ---`);
            return res.status(403).json({ error: 'Access denied: Insufficient role permissions.' });
        }
    };
}

module.exports = authorizeAdmin;