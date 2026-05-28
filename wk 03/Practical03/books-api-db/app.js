const express = require("express");
const sql = require("mssql"); // Assuming you've installed mssql
const dbConfig = require("./dbConfig");

const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default port

app.use(express.json()); // middleware inbuilt in express to recognize the incoming Request Object as a JSON Object.
app.use(express.urlencoded()); // middleware inbuilt in express to recognize the incoming Request Object as strings or arrays

app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  // --- GET Routes  ---

// GET all books
app.get("/books", async (req, res) => {
  let connection; // Declare connection outside try for finally block
  try {
    connection = await sql.connect(dbConfig); // Get the database connection
    const sqlQuery = `SELECT id, title, author FROM Books`; // Select specific columns
    const request = connection.request();
    const result = await request.query(sqlQuery);
    res.json(result.recordset); // Send the result as JSON
  } catch (error) {
    console.error("Error in GET /books:", error);
    res.status(500).send("Error retrieving books"); // Send a 500 error on failure
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the database connection
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// GET book by ID
app.get("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).send("Invalid book ID");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig); // Get the database connection
    const sqlQuery = `SELECT id, title, author FROM Books WHERE id = @id`;
    const request = connection.request();
    request.input("id", bookId); // Bind the id parameter
    const result = await request.query(sqlQuery);

    if (!result.recordset[0]) {
      return res.status(404).send("Book not found");
    }
    res.json(result.recordset[0]); // Send the book data as JSON
  } catch (error) {
    console.error(`Error in GET /books/${bookId}:`, error);
    res.status(500).send("Error retrieving book");
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the database connection
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- POST Route  ---

// POST create new book
app.post("/books", async (req, res) => {
  const newBookData = req.body; // Get new book data from request body

  // **WARNING:** No validation is performed here. Invalid data may cause database errors. We will implement the necessary validation in future practicals.

  let connection;
  try {
    connection = await sql.connect(dbConfig); // Get the database connection
    const sqlQuery = `INSERT INTO Books (title, author) VALUES (@title, @author); SELECT SCOPE_IDENTITY() AS id;`;
    const request = connection.request();
    // Bind parameters from the request body
    request.input("title", newBookData.title);
    request.input("author", newBookData.author);
    const result = await request.query(sqlQuery);

    // Attempt to fetch the newly created book to return it
    const newBookId = result.recordset[0].id;

    // Directly fetch the new book here instead of calling a function
    // Re-using the same connection before closing it in finally
    const getNewBookQuery = `SELECT id, title, author FROM Books WHERE id = @id`;
    const getNewBookRequest = connection.request();
    getNewBookRequest.input("id", newBookId);
    const newBookResult = await getNewBookRequest.query(getNewBookQuery);

    res.status(201).json(newBookResult.recordset[0]); // Send 201 Created status and the new book data
  } catch (error) {
    console.error("Error in POST /books:", error);
    // Database errors due to invalid data (e.g., missing required fields) will likely be caught here
    res.status(500).send("Error creating book");
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the database connection
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- PUT Route (Full Update) ---

// PUT update book by ID (full update)
app.put("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  const updatedBookData = req.body;
  
  // Validate book ID
  if (isNaN(bookId)) {
    return res.status(400).send("Invalid book ID");
  }
  
  // Validate request body has required fields
  if (!updatedBookData.title || !updatedBookData.author) {
    return res.status(400).send("Missing required fields: title and author");
  }
  
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    // First check if the book exists
    const checkQuery = `SELECT id FROM Books WHERE id = @id`;
    const checkRequest = connection.request();
    checkRequest.input("id", bookId);
    const checkResult = await checkRequest.query(checkQuery);
    
    if (!checkResult.recordset[0]) {
      return res.status(404).send("Book not found");
    }
    
    // Update the book
    const updateQuery = `UPDATE Books SET title = @title, author = @author WHERE id = @id`;
    const updateRequest = connection.request();
    updateRequest.input("id", bookId);
    updateRequest.input("title", updatedBookData.title);
    updateRequest.input("author", updatedBookData.author);
    
    await updateRequest.query(updateQuery);
    
    // Fetch and return the updated book
    const getUpdatedQuery = `SELECT id, title, author FROM Books WHERE id = @id`;
    const getUpdatedRequest = connection.request();
    getUpdatedRequest.input("id", bookId);
    const updatedResult = await getUpdatedRequest.query(getUpdatedQuery);
    
    // res.json(updatedResult.recordset[0]).send("Book updated successfully")  ;
    res.json({message: "Book updated successfully",...updatedResult.recordset[0]});

    
  } catch (error) {
    console.error(`Error in PUT /books/${bookId}:`, error);
    res.status(500).send("Error updating book");
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

// PATCH update book by ID (partial update)
app.patch("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  const updates = req.body;
  
  // Validate book ID
  if (isNaN(bookId)) {
    return res.status(400).send("Invalid book ID");
  }
  
  // Check if there's anything to update
  if (Object.keys(updates).length === 0) {
    return res.status(400).send("No update fields provided");
  }
  
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    // First check if the book exists
    const checkQuery = `SELECT id FROM Books WHERE id = @id`;
    const checkRequest = connection.request();
    checkRequest.input("id", bookId);
    const checkResult = await checkRequest.query(checkQuery);
    
    if (!checkResult.recordset[0]) {
      return res.status(404).send("Book not found");
    }
    
    // Build dynamic UPDATE query based on provided fields
    let updateFields = [];
    let updateRequest = connection.request();
    updateRequest.input("id", bookId);
    
    if (updates.title !== undefined) {
      updateFields.push("title = @title");
      updateRequest.input("title", updates.title);
    }
    
    if (updates.author !== undefined) {
      updateFields.push("author = @author");
      updateRequest.input("author", updates.author);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).send("No valid fields to update");
    }
    
    const updateQuery = `UPDATE Books SET ${updateFields.join(", ")} WHERE id = @id`;
    await updateRequest.query(updateQuery);
    
    // Fetch and return the updated book
    const getUpdatedQuery = `SELECT id, title, author FROM Books WHERE id = @id`;
    const getUpdatedRequest = connection.request();
    getUpdatedRequest.input("id", bookId);
    const updatedResult = await getUpdatedRequest.query(getUpdatedQuery);
    
    res.json(updatedResult.recordset[0]);
    
  } catch (error) {
    console.error(`Error in PATCH /books/${bookId}:`, error);
    res.status(500).send("Error updating book");
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

// DELETE book by ID
app.delete("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  
  // Validate book ID
  if (isNaN(bookId)) {
    return res.status(400).send("Invalid book ID");
  }
  
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    // First check if the book exists
    const checkQuery = `SELECT id FROM Books WHERE id = @id`;
    const checkRequest = connection.request();
    checkRequest.input("id", bookId);
    const checkResult = await checkRequest.query(checkQuery);
    
    if (!checkResult.recordset[0]) {
      return res.status(404).send("Book not found");
    }
    
    // Delete the book
    const deleteQuery = `DELETE FROM Books WHERE id = @id`;
    const deleteRequest = connection.request();
    deleteRequest.input("id", bookId);
    await deleteRequest.query(deleteQuery);
    
    // Send 204 No Content status (successful deletion, no content to return)
    // res.status(205).send("Book deleted successfully");
    // res.status(205).send("Book deleted successfully");

    res.json({ message: "Book deleted successfully." });

    
  } catch (error) {
    console.error(`Error in DELETE /books/${bookId}:`, error);
    res.status(500).send("Error deleting book");
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
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});