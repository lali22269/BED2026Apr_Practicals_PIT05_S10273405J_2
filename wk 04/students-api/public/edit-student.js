// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/students'; // Adjust to your API URL

// Get student ID from URL
function getStudentIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
        showError('No student ID provided. Redirecting...');
        setTimeout(() => {
            window.location.href = 'students.html';
        }, 2000);
        return null;
    }
    
    return parseInt(id);
}

// Fetch student data by ID
async function fetchStudentById(id) {
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const form = document.getElementById('editStudentForm');
    
    try {
        loadingDiv.style.display = 'block';
        errorDiv.style.display = 'none';
        
        const response = await fetch(`${API_BASE_URL}/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Student not found');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const student = await response.json();
        
        // Populate form with student data
        document.getElementById('name').value = student.name || '';
        document.getElementById('email').value = student.email || '';
        document.getElementById('grade').value = student.grade || '';
        document.getElementById('age').value = student.age || '';
        document.getElementById('major').value = student.major || '';
        
        loadingDiv.style.display = 'none';
        form.style.display = 'block';
        
    } catch (error) {
        console.error('Error fetching student:', error);
        loadingDiv.style.display = 'none';
        showError(error.message || 'Failed to load student data. Please try again.');
        
        // Redirect after 3 seconds if student not found
        if (error.message === 'Student not found') {
            setTimeout(() => {
                window.location.href = 'students.html';
            }, 3000);
        }
    }
}

// Update student
async function updateStudent(id, studentData) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const updatedStudent = await response.json();
        return updatedStudent;
        
    } catch (error) {
        throw error;
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const studentId = getStudentIdFromUrl();
    if (!studentId) return;
    
    // Hide previous messages
    const errorDiv = document.getElementById('error');
    const successDiv = document.getElementById('success');
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
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';
        
        await updateStudent(studentId, studentData);
        
        // Show success message
        showSuccess('Student updated successfully! Redirecting...');
        
        // Redirect to students list after 2 seconds
        setTimeout(() => {
            window.location.href = 'students.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error updating student:', error);
        showError(error.message || 'Failed to update student. Please try again.');
        
    } finally {
        // Re-enable submit button
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Student';
    }
}

// Helper functions
function showError(message) {
    const errorDiv = document.getElementById('error');
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
    const successDiv = document.getElementById('success');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const studentId = getStudentIdFromUrl();
    
    if (studentId) {
        fetchStudentById(studentId);
        
        // Attach form submit handler
        const form = document.getElementById('editStudentForm');
        form.addEventListener('submit', handleFormSubmit);
    }
});