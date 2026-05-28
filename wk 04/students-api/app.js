// app.js
const path = require("path");
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
// Load environment variables
dotenv.config();

const studentController = require("./controllers/studentController");
const {
  validateStudent,
  validateStudentPatch,
  validateStudentId,
} = require("./middlewares/studentValidation"); // import Student Validation Middleware

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware (Parsing request bodies)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
// --- Add other general middleware here (e.g., logging, security headers) ---

// Routes for students
// Apply middleware *before* the controller function for routes that need it
app.get("/students", studentController.getAllStudents);
app.get("/students/:id", validateStudentId, studentController.getStudentById); // Use validateStudentId middleware
app.post("/students", validateStudent, studentController.createStudent); // Use validateStudent middleware
app.put("/students/:id", validateStudentId, validateStudent, studentController.updateStudent); // Full update
app.patch("/students/:id", validateStudentId, validateStudentPatch, studentController.patchStudent); // Partial update
app.delete("/students/:id", validateStudentId, studentController.deleteStudent); // Delete route

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});