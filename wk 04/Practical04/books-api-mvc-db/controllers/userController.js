// controllers/userController.js
const User = require("../models/userModel");

// CREATE - Create a new user
async function createUser(req, res) {
    try {
        // Extract user data from the request body
        const userData = req.body;
        
        // Validate required fields
        if (!userData.username || !userData.email || !userData.password) {
            return res.status(400).json({ 
                error: "Username, email, and password are required" 
            });
        }
        
        // Check if email already exists
        const existingEmail = await User.getUserByEmail(userData.email);
        if (existingEmail) {
            return res.status(409).json({ 
                error: "Email already registered" 
            });
        }
        
        // Check if username already exists
        const existingUsername = await User.getUserByUsername(userData.username);
        if (existingUsername) {
            return res.status(409).json({ 
                error: "Username already taken" 
            });
        }
        
        // Call the User.createUser method to save the new user
        const newUser = await User.createUser(userData);
        
        // Remove password from response for security
        const { password, ...userWithoutPassword } = newUser;
        
        // Upon successful creation, return a success response with the created user data
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: userWithoutPassword
        });
        
    } catch (error) {
        // Handle potential errors during user creation
        console.error("Controller error in createUser:", error);
        res.status(500).json({ 
            error: "Error creating user",
            details: error.message 
        });
    }
}

// READ - Get all users
async function getAllUsers(req, res) {
    try {
        // Call the User.getAllUsers method to retrieve all users
        const users = await User.getAllUsers();
        
        // Remove passwords from response for security
        const sanitizedUsers = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        
        // Upon successful retrieval, return a response with the list of user objects
        res.json({
            success: true,
            count: sanitizedUsers.length,
            data: sanitizedUsers
        });
        
    } catch (error) {
        // Handle potential errors during user retrieval
        console.error("Controller error in getAllUsers:", error);
        res.status(500).json({ 
            error: "Error retrieving users",
            details: error.message 
        });
    }
}

// READ - Get user by ID
async function getUserById(req, res) {
    try {
        // Extract the user ID from the request parameter
        const id = parseInt(req.params.id);
        
        // Call the User.getUserById method to find the user
        const user = await User.getUserById(id);
        
        // If not found, return a not-found error response
        if (!user) {
            return res.status(404).json({ 
                error: `User with ID ${id} not found` 
            });
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        // If found, return a response with the user object
        res.json({
            success: true,
            data: userWithoutPassword
        });
        
    } catch (error) {
        // Handle potential errors during user retrieval
        console.error("Controller error in getUserById:", error);
        res.status(500).json({ 
            error: "Error retrieving user",
            details: error.message 
        });
    }
}

// UPDATE - Update user
async function updateUser(req, res) {
    try {
        // Extract the user ID and updated data from the request
        const id = parseInt(req.params.id);
        const updatedData = req.body;
        
        // Check if user exists
        const existingUser = await User.getUserById(id);
        if (!existingUser) {
            return res.status(404).json({ 
                error: `User with ID ${id} not found` 
            });
        }
        
        // Check if email is being changed and already exists
        if (updatedData.email && updatedData.email !== existingUser.email) {
            const emailExists = await User.getUserByEmail(updatedData.email);
            if (emailExists) {
                return res.status(409).json({ 
                    error: "Email already registered" 
                });
            }
        }
        
        // Check if username is being changed and already exists
        if (updatedData.username && updatedData.username !== existingUser.username) {
            const usernameExists = await User.getUserByUsername(updatedData.username);
            if (usernameExists) {
                return res.status(409).json({ 
                    error: "Username already taken" 
                });
            }
        }
        
        // Call the User.updateUser method to update the user information
        const result = await User.updateUser(id, updatedData);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = result.user;
        
        // Upon successful update, return a success response
        res.json({
            success: true,
            message: result.message,
            data: userWithoutPassword
        });
        
    } catch (error) {
        // Handle potential errors during user update
        console.error("Controller error in updateUser:", error);
        
        if (error.message.includes("not found")) {
            return res.status(404).json({ 
                error: "User not found" 
            });
        }
        
        res.status(500).json({ 
            error: "Error updating user",
            details: error.message 
        });
    }
}

// DELETE - Delete user
async function deleteUser(req, res) {
    try {
        // Extract the user ID from the request parameter
        const id = parseInt(req.params.id);
        
        // Call the User.deleteUser method to delete the user
        const result = await User.deleteUser(id);
        
        // Remove password from deleted user data
        const { password, ...userWithoutPassword } = result.deletedUser;
        
        // Upon successful deletion, return a success response
        res.json({
            success: true,
            message: result.message,
            data: userWithoutPassword
        });
        
    } catch (error) {
        // Handle potential errors during user deletion
        console.error("Controller error in deleteUser:", error);
        
        if (error.message.includes("not found")) {
            return res.status(404).json({ 
                error: "User not found" 
            });
        }
        
        res.status(500).json({ 
            error: "Error deleting user",
            details: error.message 
        });
    }
}

// READ - Search users by username, email, firstName, or lastName
async function searchUsers(req, res) {
    try {
        // Extract search term from query parameters (supports both 'q' and 'searchTerm')
        const searchTerm = req.query.q || req.query.searchTerm;
        
        // Validate that search term is provided
        if (!searchTerm) {
            return res.status(400).json({ 
                error: "Search term is required. Use ?q=your_search_term" 
            });
        }
        
        // Call the User.searchUsers method to find matching users
        const users = await User.searchUsers(searchTerm);
        
        // Remove passwords from response for security
        const sanitizedUsers = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        
        // Return success response with search results
        res.json({
            success: true,
            count: sanitizedUsers.length,
            searchTerm: searchTerm,
            data: sanitizedUsers
        });
        
    } catch (error) {
        // Handle potential errors during user search
        console.error("Controller error in searchUsers:", error);
        res.status(500).json({ 
            error: "Error searching users",
            details: error.message 
        });
    }
}

// READ - Get users with their books (NEW)
async function getUsersWithBooks(req, res) {
    try {
        // Call the User.getUsersWithBooks method to retrieve users with their books
        const users = await User.getUsersWithBooks();
        
        // Return success response with users and their books
        res.json({
            success: true,
            count: users.length,
            data: users
        });
        
    } catch (error) {
        // Handle potential errors during retrieval
        console.error("Controller error in getUsersWithBooks:", error);
        res.status(500).json({ 
            error: "Error fetching users with books",
            details: error.message 
        });
    }
}

// Export all controller functions
module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    searchUsers,
    getUsersWithBooks  // ← New export added
};