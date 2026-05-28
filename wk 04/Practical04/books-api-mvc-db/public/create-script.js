// Get references to the form and message elements:
const createBookForm = document.getElementById("createBookForm");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3000";

createBookForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the default browser form submission

  messageDiv.textContent = ""; // Clear previous messages

  // Collect data from the form inputs
  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");

  const newBookData = {
    title: titleInput.value,
    author: authorInput.value,
  };

  try {
    // Make a POST request to your API endpoint
    const response = await fetch(`${apiBaseUrl}/books`, {
      method: "POST", // Specify the HTTP method
      headers: {
        "Content-Type": "application/json", // Tell the API we are sending JSON
      },
      body: JSON.stringify(newBookData), // Send the data as a JSON string in the request body
    });

    // Check for API response status (e.g., 201 Created, 400 Bad Request, 500 Internal Server Error)
    const responseBody = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { message: response.statusText };

    if (response.status === 201) {
      messageDiv.textContent = `Book created successfully! ID: ${responseBody.id}`;
      messageDiv.style.color = "green";
      createBookForm.reset(); // Clear the form after success
      console.log("Created Book:", responseBody);
    } else if (response.status === 400) {
      // Handle validation errors from the API (from Practical 04 validation middleware)
      messageDiv.textContent = `Validation Error: ${responseBody.message}`;
      messageDiv.style.color = "red";
      console.error("Validation Error:", responseBody);
    } else {
      // Handle other potential API errors (e.g., 500 from error handling middleware)
      throw new Error(
        `API error! status: ${response.status}, message: ${responseBody.message}`
      );
    }
  } catch (error) {
    console.error("Error creating book:", error);
    messageDiv.textContent = `Failed to create book: ${error.message}`;
    messageDiv.style.color = "red";
  }
});

// --- Start of code for learners to complete (Form Submission / PUT Request) ---

// Add an event listener for the form submission (for the Update operation)
editBookForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the default browser form submission

  // TODO: Collect updated data from form fields (editTitleInput.value, editAuthorInput.value)
  const updatedBook = {
    title: editTitleInput.value,
    author: editAuthorInput.value
  };

  // TODO: Get the book ID from the hidden input (bookIdInput.value)
  const bookId = bookIdInput.value;

  // Validate that required fields are not empty
  if (!updatedBook.title || !updatedBook.author) {
    messageDiv.textContent = "Please fill in both Title and Author fields.";
    messageDiv.style.color = "orange";
    return;
  }

  try {
    // Show loading/updating message
    messageDiv.textContent = "Updating book...";
    messageDiv.style.color = "blue";

    // TODO: Implement the fetch PUT request to the API endpoint /books/:id
    // TODO: Include the updated data in the request body (as JSON string)
    // TODO: Set the 'Content-Type': 'application/json' header
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedBook)
    });

    // TODO: Handle the API response (check status 200 for success, 400 for validation, 404 if book not found, 500 for server error)
    if (response.ok) {
      // Success! (status 200)
      // TODO: Provide feedback to the user using the messageDiv (success or error messages)
      messageDiv.textContent = "Book updated successfully!";
      messageDiv.style.color = "green";
      
      // TODO: Optionally, redirect back to the index page on successful update
      // Redirect back to the main page after 1.5 seconds
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
      
    } else if (response.status === 404) {
      const errorData = await response.json().catch(() => ({}));
      messageDiv.textContent = `Book not found: ${errorData.message || "Book with this ID does not exist"}`;
      messageDiv.style.color = "red";
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      messageDiv.textContent = `Invalid data: ${errorData.message || "Please check your input"}`;
      messageDiv.style.color = "red";
    } else {
      // Handle other errors (500, etc.)
      const errorData = await response.json().catch(() => ({}));
      messageDiv.textContent = `Failed to update: ${errorData.message || response.statusText}`;
      messageDiv.style.color = "red";
    }
    
  } catch (error) {
    console.error("Error updating book:", error);
    // TODO: Provide feedback to the user using the messageDiv (success or error messages)
    messageDiv.textContent = `Network error: ${error.message}`;
    messageDiv.style.color = "red";
  }
});

// --- End of code for learners to complete ---