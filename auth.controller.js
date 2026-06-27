/**
 * Authentication Controller
 * Handles registration and login
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/database.model');

/**
 * User Registration
 * POST /register
 */
async function register(req, res) {
    try {
        const { username, password, role, email, fullName } = req.body;

        // Validate required fields
        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, and role are required'
            });
        }

        // Validate role
        if (!['member', 'librarian'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be member or librarian'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if username already exists
        const existingUser = await UserModel.usernameExists(username);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists. Please choose another.'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user in database
        const newUser = await UserModel.createUser(
            username,
            passwordHash,
            role,
            email,
            fullName || username
        );

        // Remove password hash from response
        const { passwordHash: _, ...userResponse } = newUser;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
}

/**
 * User Login
 * POST /login
 */
async function login(req, res) {
    try {
        const { username, password } = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Get user from database
        const user = await UserModel.getByUsername(username);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare password with hash
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        // Remove password hash from response
        const { passwordHash: _, ...userData } = user;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
}

module.exports = {
    register,
    login
};