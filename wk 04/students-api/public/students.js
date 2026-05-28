// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/students'; // Adjust to your API URL

// Global variables
let studentsData = [];
let deleteStudentId = null;

// Fetch and display all students
async function fetchAllStudents() {
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const studentsListDiv = document.getElementById('students-list');
    
    try {
        loadingDiv.style.display = 'block';
        errorDiv.style.display = 'none';
        
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        studentsData = await response.json();
        displayStudents(studentsData);
        loadingDiv.style.display = 'none';
        
    } catch (error) {
        console.error('Error fetching students:', error);
        loadingDiv.style.display = 'none';
        showError('Failed to load students. Please check if the API server is running.');
    }
}

// Display students in the UI
function displayStudents(students) {
    const studentsListDiv = document.getElementById('students-list');
    
    if (!students || students.length === 0) {
        studentsListDiv.innerHTML = '<p class="no-students">No students found. Create your first student!</p>';
        return;
    }
    
    const studentsHTML = `
        <div class="students-grid">
            ${students.map(student => `
                <div class="student-card" data-id="${student.id}">
                    <div class="student-info">
                        <h3>${escapeHtml(student.name)}</h3>
                        <p><strong>Email:</strong> ${escapeHtml(student.email)}</p>
                        <p><strong>Grade:</strong> ${student.grade || 'N/A'}</p>
                        <p><strong>Age:</strong> ${student.age || 'N/A'}</p>
                    </div>
                    <div class="student-actions">
                        <a href="view-student.html?id=${student.id}" class="btn btn-sm btn-info">View</a>
                        <a href="edit-student.html?id=${student.id}" class="btn btn-sm btn-warning">Edit</a>
                        <button onclick="showDeleteModal(${student.id}, '${escapeHtml(student.name)}')" class="btn btn-sm btn-danger">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    studentsListDiv.innerHTML = studentsHTML;
}

// Delete student
async function deleteStudent(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Remove from local data
        studentsData = studentsData.filter(student => student.id !== id);
        displayStudents(studentsData);
        
        // Show success message (optional)
        showTemporaryMessage('Student deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting student:', error);
        showError('Failed to delete student. Please try again.');
    }
}

// Modal functions
function showDeleteModal(id, name) {
    deleteStudentId = id;
    document.getElementById('studentNameToDelete').textContent = name;
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteStudentId = null;
}

// Helper functions
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showTemporaryMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '1000';
    messageDiv.style.padding = '10px 20px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.color = 'white';
    messageDiv.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchAllStudents();
    
    // Modal event listeners
    const modal = document.getElementById('deleteModal');
    const closeBtn = document.querySelector('.close');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    
    closeBtn.onclick = closeDeleteModal;
    cancelBtn.onclick = closeDeleteModal;
    
    confirmBtn.onclick = () => {
        if (deleteStudentId) {
            deleteStudent(deleteStudentId);
            closeDeleteModal();
        }
    };
    
    window.onclick = (event) => {
        if (event.target === modal) {
            closeDeleteModal();
        }
    };
});