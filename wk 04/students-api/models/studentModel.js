// models/studentModel.js
const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all students
async function getAllStudents() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT students_id, name, address FROM Students";
    const result = await connection.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Get student by ID - with optional connection parameter for transaction support
async function getStudentById(id, existingConnection = null) {
  let connection;
  let shouldClose = false;
  
  try {
    // Use existing connection if provided, otherwise create a new one
    if (existingConnection) {
      connection = existingConnection;
    } else {
      connection = await sql.connect(dbConfig);
      shouldClose = true;
    }
    
    const query = "SELECT students_id, name, address FROM Students WHERE students_id = @id";
    const request = connection.request();
    request.input("id", sql.Int, id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Student not found
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    // Only close the connection if we created it in this function
    if (shouldClose && connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Create new student
async function createStudent(studentData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "INSERT INTO Students (students_id, name, address) VALUES (@students_id, @name, @address); SELECT students_id, name, address FROM Students WHERE students_id = @students_id";
    const request = connection.request();
    request.input("students_id", sql.Int, studentData.students_id);
    request.input("name", sql.NVarChar, studentData.name);
    request.input("address", sql.NVarChar, studentData.address);
    const result = await request.query(query);

    return result.recordset[0]; // Return the created student
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Update student (full update)
async function updateStudent(id, studentData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    // First check if student exists using the same connection
    const existingStudent = await getStudentById(id, connection);
    if (!existingStudent) {
      return null;
    }
    
    const query = "UPDATE Students SET name = @name, address = @address WHERE students_id = @id";
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("name", sql.NVarChar, studentData.name);
    request.input("address", sql.NVarChar, studentData.address);
    await request.query(query);
    
    // Return updated student using the same connection
    return await getStudentById(id, connection);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Partial update student (PATCH)
async function patchStudent(id, studentData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    // First check if student exists using the same connection
    const existingStudent = await getStudentById(id, connection);
    if (!existingStudent) {
      return null;
    }
    
    let updates = [];
    let request = connection.request();
    request.input("id", sql.Int, id);
    
    if (studentData.name !== undefined) {
      updates.push("name = @name");
      request.input("name", sql.NVarChar, studentData.name);
    }
    
    if (studentData.address !== undefined) {
      updates.push("address = @address");
      request.input("address", sql.NVarChar, studentData.address);
    }
    
    if (updates.length === 0) {
      return existingStudent; // No updates, return existing student
    }
    
    const query = `UPDATE Students SET ${updates.join(", ")} WHERE students_id = @id`;
    await request.query(query);
    
    // Return updated student using the same connection
    return await getStudentById(id, connection);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Delete student
async function deleteStudent(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    // Pass the SAME connection to getStudentById
    const student = await getStudentById(id, connection);
    if (!student) {
      return null; // Student not found
    }
    
    const query = "DELETE FROM Students WHERE students_id = @id";
    const request = connection.request();
    request.input("id", sql.Int, id);
    await request.query(query);
    
    return student; // Return the deleted student
  } catch (error) {
    console.error("Database error in deleteStudent:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
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