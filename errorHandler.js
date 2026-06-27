/**
 * Global Error Handler Middleware
 */

function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let errors = err.errors || null;

    // SQL Server specific errors
    if (err.code === 'EREQUEST') {
        statusCode = 400;
        message = 'Database request error';
        errors = [err.message];
    }

    if (err.code === 'ECONNCLOSED') {
        statusCode = 503;
        message = 'Database connection lost';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please login again.';
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
        errors = Object.values(err.errors).map(error => error.message);
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        timestamp: new Date().toISOString()
    });
}

module.exports = errorHandler;