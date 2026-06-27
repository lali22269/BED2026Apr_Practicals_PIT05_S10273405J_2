/**
 * Authentication and Authorization Middleware
 * Handles JWT verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Verify JWT Token and extract user information
 */
function verifyToken(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Authentication error.',
            error: error.message
        });
    }
}

/**
 * Authorization middleware for roles
 * @param {...string} allowedRoles - List of roles allowed to access the route
 */
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
}

/**
 * Check if user is librarian
 */
function isLibrarian(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated'
        });
    }

    if (req.user.role !== 'librarian') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Librarian privileges required.'
        });
    }

    next();
}

/**
 * Check if user is member or librarian
 */
function isMemberOrLibrarian(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated'
        });
    }

    if (!['member', 'librarian'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Member or librarian privileges required.'
        });
    }

    next();
}

module.exports = {
    verifyToken,
    authorize,
    isLibrarian,
    isMemberOrLibrarian
};