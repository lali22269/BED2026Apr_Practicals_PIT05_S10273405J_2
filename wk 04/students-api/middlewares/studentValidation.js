// middlewares/studentValidation.js
const Joi = require("joi"); // Import Joi for validation

// Validation schema for students (used for POST/PUT)
const studentSchema = Joi.object({
  students_id: Joi.number().integer().positive().required().messages({
    "number.base": "Student ID must be a number",
    "number.integer": "Student ID must be an integer",
    "number.positive": "Student ID must be a positive number",
    "any.required": "Student ID is required",
  }),
  name: Joi.string().min(1).max(100).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 1 character long",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),
  address: Joi.string().min(1).max(255).required().messages({
    "string.base": "Address must be a string",
    "string.empty": "Address cannot be empty",
    "string.min": "Address must be at least 1 character long",
    "string.max": "Address cannot exceed 255 characters",
    "any.required": "Address is required",
  }),
});

// Validation schema for partial updates (PATCH)
const studentPatchSchema = Joi.object({
  name: Joi.string().min(1).max(100).messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 1 character long",
    "string.max": "Name cannot exceed 100 characters",
  }),
  address: Joi.string().min(1).max(255).messages({
    "string.base": "Address must be a string",
    "string.empty": "Address cannot be empty",
    "string.min": "Address must be at least 1 character long",
    "string.max": "Address cannot exceed 255 characters",
  }),
}).min(1); // At least one field must be provided

// Middleware to validate student data (for POST/PUT)
function validateStudent(req, res, next) {
  // Validate the request body against the studentSchema
  const { error } = studentSchema.validate(req.body, { abortEarly: false });

  if (error) {
    // If validation fails, format the error messages and send a 400 response
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  // If validation succeeds, pass control to the next middleware/route handler
  next();
}

// Middleware to validate student data for PATCH requests
function validateStudentPatch(req, res, next) {
  // Validate the request body against the studentPatchSchema
  const { error } = studentPatchSchema.validate(req.body, { abortEarly: false });

  if (error) {
    // If validation fails, format the error messages and send a 400 response
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  // If validation succeeds, pass control to the next middleware/route handler
  next();
}

// Middleware to validate student ID from URL parameters (for GET by ID, PUT, PATCH, DELETE)
function validateStudentId(req, res, next) {
  // Parse the ID from request parameters
  const id = parseInt(req.params.id);

  // Check if the parsed ID is a valid positive number
  if (isNaN(id) || id <= 0) {
    // If not valid, send a 400 response
    return res
      .status(400)
      .json({ error: "Invalid student ID. ID must be a positive number" });
  }

  // Store the validated ID back in params
  req.params.id = id;
  
  // If validation succeeds, pass control to the next middleware/route handler
  next();
}

module.exports = {
  validateStudent,
  validateStudentPatch,
  validateStudentId,
};