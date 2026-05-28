const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, async () => {
  try {
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }

  // --- GET Routes ---

  // GET all students
  app.get("/students", async (req, res) => {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const sqlQuery = `SELECT students_id, name, address FROM Students`;
      const request = connection.request();
      const result = await request.query(sqlQuery);
      res.json(result.recordset);
    } catch (error) {
      console.error("Error in GET /students:", error);
      res.status(500).send("Error retrieving students");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error("Error closing database connection:", closeError);
        }
      }
    }
  });

  // GET student by ID
  app.get("/students/:id", async (req, res) => {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId)) {
      return res.status(400).send("Invalid student ID");
    }

    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const sqlQuery = `SELECT students_id, name, address FROM Students WHERE students_id = @id`;
      const request = connection.request();
      request.input("id", studentId);
      const result = await request.query(sqlQuery);

      if (!result.recordset[0]) {
        return res.status(404).send("Student not found");
      }
      res.json(result.recordset[0]);
    } catch (error) {
      console.error(`Error in GET /students/${studentId}:`, error);
      res.status(500).send("Error retrieving student");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error("Error closing database connection:", closeError);
        }
      }
    }
  });

  // POST create new student
app.post("/students", async (req, res) => {
  const newStudentData = req.body;

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    // Convert students_id to integer if it exists and is a string
    let studentId = newStudentData.students_id;
    if (studentId && typeof studentId === 'string') {
      studentId = parseInt(studentId);
    }
    
    const sqlQuery = `INSERT INTO Students (students_id, name, address) VALUES (@students_id, @name, @address)`;
    const request = connection.request();
    request.input("students_id", studentId);
    request.input("name", newStudentData.name);
    request.input("address", newStudentData.address);
    await request.query(sqlQuery);
    
    // Return the created student
    const getNewStudentQuery = `SELECT students_id, name, address FROM Students WHERE students_id = @id`;
    const getNewStudentRequest = connection.request();
    getNewStudentRequest.input("id", studentId);
    const newStudentResult = await getNewStudentRequest.query(getNewStudentQuery);
    
    res.status(201).json(newStudentResult.recordset[0]);
  } catch (error) {
    console.error("Error in POST /students:", error);
    console.error("Error message:", error.message);
    res.status(500).send(`Error creating student: ${error.message}`);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

  // --- PUT Route (Full Update) ---

  // PUT update student by ID (full update)
  app.put("/students/:id", async (req, res) => {
    const studentId = parseInt(req.params.id);
    const updatedStudentData = req.body;
    
    if (isNaN(studentId)) {
      return res.status(400).send("Invalid student ID");
    }
    
    if (!updatedStudentData.name || !updatedStudentData.address) {
      return res.status(400).send("Missing required fields: name and address");
    }
    
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      
      const checkQuery = `SELECT students_id FROM Students WHERE students_id = @id`;
      const checkRequest = connection.request();
      checkRequest.input("id", studentId);
      const checkResult = await checkRequest.query(checkQuery);
      
      if (!checkResult.recordset[0]) {
        return res.status(404).send("Student not found");
      }
      
      const updateQuery = `UPDATE Students SET name = @name, address = @address WHERE students_id = @id`;
      const updateRequest = connection.request();
      updateRequest.input("id", studentId);
      updateRequest.input("name", updatedStudentData.name);
      updateRequest.input("address", updatedStudentData.address);
      
      await updateRequest.query(updateQuery);
      
      const getUpdatedQuery = `SELECT students_id, name, address FROM Students WHERE students_id = @id`;
      const getUpdatedRequest = connection.request();
      getUpdatedRequest.input("id", studentId);
      const updatedResult = await getUpdatedRequest.query(getUpdatedQuery);
      
      res.json({ message: "Student updated successfully", ...updatedResult.recordset[0] });
      
    } catch (error) {
      console.error(`Error in PUT /students/${studentId}:`, error);
      res.status(500).send("Error updating student");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error("Error closing database connection:", closeError);
        }
      }
    }
  });

  // --- PATCH Route (Partial Update) ---

  // PATCH update student by ID (partial update)
  app.patch("/students/:id", async (req, res) => {
    const studentId = parseInt(req.params.id);
    const updates = req.body;
    
    if (isNaN(studentId)) {
      return res.status(400).send("Invalid student ID");
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).send("No update fields provided");
    }
    
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      
      const checkQuery = `SELECT students_id FROM Students WHERE students_id = @id`;
      const checkRequest = connection.request();
      checkRequest.input("id", studentId);
      const checkResult = await checkRequest.query(checkQuery);
      
      if (!checkResult.recordset[0]) {
        return res.status(404).send("Student not found");
      }
      
      let updateFields = [];
      let updateRequest = connection.request();
      updateRequest.input("id", studentId);
      
      if (updates.name !== undefined) {
        updateFields.push("name = @name");
        updateRequest.input("name", updates.name);
      }
      
      if (updates.address !== undefined) {
        updateFields.push("address = @address");
        updateRequest.input("address", updates.address);
      }
      
      if (updateFields.length === 0) {
        return res.status(400).send("No valid fields to update");
      }
      
      const updateQuery = `UPDATE Students SET ${updateFields.join(", ")} WHERE students_id = @id`;
      await updateRequest.query(updateQuery);
      
      const getUpdatedQuery = `SELECT students_id, name, address FROM Students WHERE students_id = @id`;
      const getUpdatedRequest = connection.request();
      getUpdatedRequest.input("id", studentId);
      const updatedResult = await getUpdatedRequest.query(getUpdatedQuery);
      
      res.json(updatedResult.recordset[0]);
      
    } catch (error) {
      console.error(`Error in PATCH /students/${studentId}:`, error);
      res.status(500).send("Error updating student");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error("Error closing database connection:", closeError);
        }
      }
    }
  });

  // --- DELETE Route ---

  // DELETE student by ID
  app.delete("/students/:id", async (req, res) => {
    const studentId = parseInt(req.params.id);
    
    if (isNaN(studentId)) {
      return res.status(400).send("Invalid student ID");
    }
    
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      
      const checkQuery = `SELECT students_id FROM Students WHERE students_id = @id`;
      const checkRequest = connection.request();
      checkRequest.input("id", studentId);
      const checkResult = await checkRequest.query(checkQuery);
      
      if (!checkResult.recordset[0]) {
        return res.status(404).send("Student not found");
      }
      
      const deleteQuery = `DELETE FROM Students WHERE students_id = @id`;
      const deleteRequest = connection.request();
      deleteRequest.input("id", studentId);
      await deleteRequest.query(deleteQuery);
      
      res.json({ message: "Student deleted successfully." });
      
    } catch (error) {
      console.error(`Error in DELETE /students/${studentId}:`, error);
      res.status(500).send("Error deleting student");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error("Error closing database connection:", closeError);
        }
      }
    }
  });

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0);
});