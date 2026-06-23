// app.js
const path = require("path");
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
// Load environment variables
dotenv.config();

// Import Controllers
const bookController = require("./controllers/bookController");
const userController = require("./controllers/userController");

// Import Validation Middlewares
const {
    validateBook,
    validateBookId,
} = require("./middlewares/bookValidation");
const {
    validateUser,
    validateUserId,
} = require("./middlewares/userValidation");

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware (Parsing request bodies)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// ============================================
// BOOK ROUTES
// ============================================
app.get("/books", bookController.getAllBooks);
app.get("/books/:id", validateBookId, bookController.getBookById);
app.post("/books", validateBook, bookController.createBook);
app.put("/books/:id", validateBookId, validateBook, bookController.updateBook);
app.delete("/books/:id", validateBookId, bookController.deleteBook);

// ============================================
// USER ROUTES
// ============================================
app.post("/users", validateUser, userController.createUser);
app.get("/users", userController.getAllUsers);
app.get("/users/search", userController.searchUsers);
app.get("/users/:id", validateUserId, userController.getUserById);
app.put("/users/:id", validateUserId, validateUser, userController.updateUser);
app.delete("/users/:id", validateUserId, userController.deleteUser);
app.get("/users/with-books", userController.getUsersWithBooks);
// ============================================
// HEALTH CHECK ROUTE
// ============================================
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`
    });
});

app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(500).json({
        success: false,
        error: "Internal server error"
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(port, () => {
    console.log(`\nServer running on port ${port}`);
    console.log(`http://localhost:${port}`);
    
    console.log(`BOOK ENDPOINTS:`);
    console.log(`  GET    /books              - Get all books`);
    console.log(`  GET    /books/:id          - Get book by ID`);
    console.log(`  POST   /books              - Create a new book`);
    console.log(`  PUT    /books/:id          - Update a book`);
    console.log(`  DELETE /books/:id          - Delete a book`);
    
    console.log(`\nUSER ENDPOINTS:`);
    console.log(`  GET    /users              - Get all users`);
    console.log(`  GET    /users/search?q=term - Search users`);
    console.log(`  GET    /users/:id          - Get user by ID`);
    console.log(`  POST   /users              - Create a new user`);
    console.log(`  PUT    /users/:id          - Update a user`);
    console.log(`  DELETE /users/:id          - Delete a user`);
    
    console.log(`\nServer is ready to handle requests!\n`);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on("SIGINT", async () => {
    console.log("\nServer is gracefully shutting down...");
    try {
        await sql.close();
        console.log("Database connections closed");
    } catch (error) {
        console.error("Error closing database connections:", error);
    }
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("\nServer is gracefully shutting down...");
    try {
        await sql.close();
        console.log("Database connections closed");
    } catch (error) {
        console.error("Error closing database connections:", error);
    }
    process.exit(0);
});

module.exports = app;