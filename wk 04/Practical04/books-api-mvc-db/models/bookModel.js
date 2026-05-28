const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all books
async function getAllBooks() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT id, title, author FROM Books";
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

// Get book by ID - MODIFIED to accept optional connection parameter
async function getBookById(id, existingConnection = null) {
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
    
    const query = "SELECT id, title, author FROM Books WHERE id = @id";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Book not found
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

// Create new book
async function createBook(bookData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "INSERT INTO Books (title, author) VALUES (@title, @author); SELECT SCOPE_IDENTITY() AS id;";
    const request = connection.request();
    request.input("title", bookData.title);
    request.input("author", bookData.author);
    const result = await request.query(query);

    const newBookId = result.recordset[0].id;
    return await getBookById(newBookId);
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


// Update book
async function updateBook(id, bookData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    let updates = [];
    let request = connection.request();
    request.input("id", id);
    
    if (bookData.title !== undefined) {
      updates.push("title = @title");
      request.input("title", bookData.title);
    }
    
    if (bookData.author !== undefined) {
      updates.push("author = @author");
      request.input("author", bookData.author);
    }
    
    if (updates.length === 0) {
      return null;
    }
    
    const query = `UPDATE Books SET ${updates.join(", ")} WHERE id = @id`;
    await request.query(query);
    
    // Pass the connection
    return await getBookById(id, connection);
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

// Delete book - FIXED VERSION
async function deleteBook(id) {
  let connection;
  try {
    // Create a new connection for this operation
    connection = await sql.connect(dbConfig);
    
    // Pass the SAME connection to getBookById
    const book = await getBookById(id, connection);  // ← PASS THE CONNECTION HERE
    if (!book) {
      return null; // Book not found
    }
    
    const query = "DELETE FROM Books WHERE id = @id";
    const request = connection.request();
    request.input("id", id);
    await request.query(query);
    
    return book; // Return the deleted book
  } catch (error) {
    console.error("Database error in deleteBook:", error);
    throw error;
  } finally {
    // Close the connection here
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
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};