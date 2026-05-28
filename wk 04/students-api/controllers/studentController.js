// controllers/studentController.js
const studentModel = require("../models/studentModel");

// Get all students
async function getAllStudents(req, res) {
  try {
    const students = await studentModel.getAllStudents();
    res.json(students);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving students" });
  }
}

// Get student by ID
async function getStudentById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const student = await studentModel.getStudentById(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving student" });
  }
}

// Create new student
async function createStudent(req, res) {
  try {
    const newStudent = await studentModel.createStudent(req.body);
    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Controller error:", error);
    // Check for duplicate key error (SQL Server error code 2627)
    if (error.message && error.message.includes("Violation of PRIMARY KEY")) {
      return res.status(409).json({ error: "Student ID already exists" });
    }
    res.status(500).json({ error: "Error creating student" });
  }
}

// Update student (full update)
async function updateStudent(req, res) {
  try {
    const id = parseInt(req.params.id);
    const updatedStudent = await studentModel.updateStudent(id, req.body);
    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(updatedStudent);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating student" });
  }
}

// Partial update student (PATCH)
async function patchStudent(req, res) {
  try {
    const id = parseInt(req.params.id);
    const patchedStudent = await studentModel.patchStudent(id, req.body);
    if (!patchedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(patchedStudent);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating student" });
  }
}

// Delete student
async function deleteStudent(req, res) {
  try {
    const id = parseInt(req.params.id);
    const deletedStudent = await studentModel.deleteStudent(id);
    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ message: "Student deleted successfully", student: deletedStudent });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting student" });
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  patchStudent,
  deleteStudent,
};