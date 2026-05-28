// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/students'; // Adjust to your API URL

// Get form elements
const form = document.getElementById('createStudentForm');
const errorDiv = document.getElementById('error');
const successDiv = document.getElementById('success');

// Handle form submission
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Hide previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Get form data
    const studentData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        grade: document.getElementById('grade').value.trim(),
        age: document.getElementById('age').value ? parseInt(document.getElementById('age').value) : null,
        major: document.getElementById('major').value.trim()
    };
    
    // Validation
    if (!studentData.name || !studentData.email) {
        showError('Name and email are required fields.');
        return;
    }
    
    if (!isValidEmail(studentData.email)) {
        showError('Please enter a valid email address.');
        return;
    }
    
    try {
        // Disable submit button while processing
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
        
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const createdStudent = await response.json();
        
        // Show success message
        showSuccess('Student created successfully! Redirecting...');
        
        // Reset form
        form.reset();
        
        // Redirect to students list after 2 seconds
        setTimeout(() => {
            window.location.href = 'students.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error creating student:', error);
        showError(error.message || 'Failed to create student. Please try again.');
        
    } finally {
        // Re-enable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Student';
    }
});

// Helper functions
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Scroll to error message
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        if (errorDiv.style.display === 'block') {
            errorDiv.style.display = 'none';
        }
    }, 5000);
}

function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}