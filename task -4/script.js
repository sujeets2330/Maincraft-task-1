// ========== MOBILE MENU TOGGLE (Common for all pages) ==========
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.createElement('div');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    
    const navbar = document.querySelector('.navbar');
    const nav = document.querySelector('nav');
    
    if (navbar && nav) {
        navbar.insertBefore(mobileMenuBtn, nav);
        
        const navMenu = nav.querySelector('ul');
        
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!nav.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                if (navMenu) navMenu.classList.remove('show');
            }
        });

        // Handle dropdown on mobile
        const dropdownTriggers = document.querySelectorAll('nav > ul > li:has(.dropdown) > a');
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const dropdown = this.nextElementSibling;
                    if (dropdown) {
                        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                    }
                }
            });
        });
    }

    // Set active nav based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
});

// ========== TASK 3 - CONTACT FORM WITH LOCALSTORAGE ==========
if (document.getElementById('contactForm')) {
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        let name = document.getElementById('name').value.trim();
        let email = document.getElementById('email').value.trim();
        let message = document.getElementById('message').value.trim();
        
        // Get input elements for styling
        let nameInput = document.getElementById('name');
        let emailInput = document.getElementById('email');
        let messageInput = document.getElementById('message');
        
        // Reset error states
        nameInput.classList.remove('error');
        emailInput.classList.remove('error');
        messageInput.classList.remove('error');
        
        // Validation - Check if any field is empty
        if (name === "" || email === "" || message === "") {
            if (name === "") {
                nameInput.classList.add('error');
            }
            if (email === "") {
                emailInput.classList.add('error');
            }
            if (message === "") {
                messageInput.classList.add('error');
            }
            
            alert("All fields are required! Please fill in all fields.");
            return;
        }
        
        // Email validation (basic)
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            emailInput.classList.add('error');
            alert("Please enter a valid email address!");
            return;
        }
        
        // Get existing submissions from localStorage
        let submissions = JSON.parse(localStorage.getItem('contacts')) || [];
        
        // Add new submission with timestamp
        let newSubmission = {
            id: Date.now(),
            name: name,
            email: email,
            message: message,
            date: new Date().toLocaleString()
        };
        
        submissions.push(newSubmission);
        
        // Save to localStorage
        localStorage.setItem('contacts', JSON.stringify(submissions));
        
        // Show success message
        alert("Form submitted successfully! Your data has been saved. Check Submissions page.");
        
        // Reset form
        document.getElementById('contactForm').reset();
    });
}

// ========== TASK 3 - SUBMISSIONS PAGE ==========
if (document.getElementById('submissionsList')) {
    
    // Function to display submissions
    function displaySubmissions() {
        let submissions = JSON.parse(localStorage.getItem('contacts')) || [];
        let list = document.getElementById('submissionsList');
        let statsElement = document.getElementById('submissionsCount');
        
        // Update stats
        if (statsElement) {
            statsElement.textContent = `${submissions.length} Submission${submissions.length !== 1 ? 's' : ''}`;
        }
        
        // Clear current list
        list.innerHTML = '';
        
        // Check if there are any submissions
        if (submissions.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No Submissions Yet</h3>
                    <p>Be the first to submit the contact form!</p>
                    <a href="contact.html" class="btn btn-small">Go to Contact Page</a>
                </div>
            `;
            return;
        }
        
        // Display all submissions in reverse order (newest first)
        submissions.reverse().forEach(sub => {
            let card = document.createElement('div');
            card.className = 'submission-card';
            card.innerHTML = `
                <div class="submission-header">
                    <div class="submission-avatar">
                        ${sub.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="submission-info">
                        <h3>${escapeHtml(sub.name)}</h3>
                        <p><i class="fas fa-envelope"></i> ${escapeHtml(sub.email)}</p>
                    </div>
                </div>
                <div class="submission-message">
                    <i class="fas fa-quote-left" style="color: var(--primary-light); opacity: 0.5;"></i>
                    ${escapeHtml(sub.message)}
                </div>
                <div class="submission-footer">
                    <span><i class="far fa-clock"></i> ${sub.date || 'Just now'}</span>
                    <button class="delete-btn" onclick="deleteSubmission(${sub.id})" title="Delete submission">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            list.appendChild(card);
        });
    }
    
    // Function to delete a submission
    window.deleteSubmission = function(id) {
        if (confirm('Are you sure you want to delete this submission?')) {
            let submissions = JSON.parse(localStorage.getItem('contacts')) || [];
            submissions = submissions.filter(sub => sub.id !== id);
            localStorage.setItem('contacts', JSON.stringify(submissions));
            displaySubmissions(); 
            alert('Submission deleted successfully!');
            
            // Update clear all button visibility
            let clearBtn = document.querySelector('.clear-all-btn');
            if (clearBtn) {
                clearBtn.style.display = submissions.length > 0 ? 'inline-flex' : 'none';
            }
        }
    };
    
    // Function to clear all submissions
    window.clearAllSubmissions = function() {
        if (confirm('Are you sure you want to delete ALL submissions? This cannot be undone!')) {
            localStorage.removeItem('contacts');
            displaySubmissions(); // Refresh the display
            alert('All submissions cleared!');
            
            // Hide clear all button
            let clearBtn = document.querySelector('.clear-all-btn');
            if (clearBtn) {
                clearBtn.style.display = 'none';
            }
        }
    };
    
    // Show/hide clear all button based on submissions
    function updateClearAllButton() {
        let submissions = JSON.parse(localStorage.getItem('contacts')) || [];
        let clearBtn = document.querySelector('.clear-all-btn');
        if (clearBtn) {
            clearBtn.style.display = submissions.length > 0 ? 'inline-flex' : 'none';
        }
    }
    
    // Display submissions when page loads
    displaySubmissions();
    updateClearAllButton();
}

// ========== TASK 4 - DASHBOARD CRUD FUNCTIONS ==========

// Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Initialize dashboard when page loads
if (document.getElementById('taskList')) {
    document.addEventListener('DOMContentLoaded', function() {
        displayTasks();
        updateTaskStats();
        
        // Add enter key support for task input
        const taskInput = document.getElementById('taskInput');
        if (taskInput) {
            taskInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addTask();
                }
            });
        }
    });
}

// Track editing task
let editingTaskId = null;

// ========== CREATE ==========
function addTask() {
    const input = document.getElementById("taskInput");
    if (!input) return;
    
    const taskName = input.value.trim();
    
    // Validation
    if (!taskName) {
        input.classList.add('error');
        alert("Task cannot be empty!");
        input.focus();
        return;
    }
    
    input.classList.remove('error');
    
    // Create new task object
    const newTask = {
        id: Date.now(), 
        name: taskName,
        completed: false,
        createdAt: new Date().toLocaleString()
    };
    
    // Add to tasks array
    tasks.push(newTask);
    
    // Save to localStorage
    saveTasks();
    
    // Clear input
    input.value = "";
    
    // Refresh display
    displayTasks();
    updateTaskStats();
    
    // Show success message
    showNotification("Task added successfully!");
}

// ========== READ (Display Tasks) ==========
function displayTasks() {
    const list = document.getElementById("taskList");
    if (!list) return;
    
    // Get current filter and search values
    const filterValue = document.getElementById('filterSelect')?.value || 'all';
    const searchValue = document.getElementById('searchBox')?.value.toLowerCase() || '';
    
    // Filter tasks based on search and filter
    let filteredTasks = tasks;
    
    // Apply search filter
    if (searchValue) {
        filteredTasks = filteredTasks.filter(task => 
            task.name.toLowerCase().includes(searchValue)
        );
    }
    
    // Apply status filter
    if (filterValue === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (filterValue === 'pending') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    }
    
    // Clear list
    list.innerHTML = '';
    
    // Check if there are any tasks
    if (filteredTasks.length === 0) {
        list.innerHTML = `
            <div class="empty-state-small">
                <i class="fas fa-clipboard-list"></i>
                <p>${tasks.length === 0 ? 'No tasks yet. Add your first task!' : 'No tasks match your search/filter'}</p>
            </div>
        `;
        
        // Update task count
        const taskCount = document.getElementById('taskCount');
        if (taskCount) taskCount.textContent = '0';
        
        // Update clear all button state
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.disabled = tasks.length === 0;
        }
        
        return;
    }
    
    // Display filtered tasks
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;
        
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    onchange="toggleTaskComplete(${task.id})">
                <span class="task-name">${escapeHtml(task.name)}</span>
                ${task.id === editingTaskId ? `
                    <input type="text" class="edit-input" value="${escapeHtml(task.name)}" 
                        onkeypress="handleEditKeyPress(event, ${task.id})">
                ` : ''}
            </div>
            <div class="task-actions">
                ${task.id === editingTaskId ? `
                    <button class="task-btn save-btn" onclick="saveEdit(${task.id})" title="Save">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="task-btn cancel-btn" onclick="cancelEdit()" title="Cancel">
                        <i class="fas fa-times"></i>
                    </button>
                ` : `
                    <button class="task-btn edit-btn" onclick="editTask(${task.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                `}
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        list.appendChild(li);
    });
    
    // Focus on edit input if in edit mode
    if (editingTaskId) {
        const editInput = document.querySelector('.edit-input');
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }
    
    // Update task count
    const taskCount = document.getElementById('taskCount');
    if (taskCount) {
        taskCount.textContent = filteredTasks.length;
    }
    
    // Update clear all button state
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.disabled = tasks.length === 0;
    }
}

// ========== UPDATE ==========
function editTask(id) {
    editingTaskId = id;
    displayTasks(); // Re-render to show edit input
}

function saveEdit(id) {
    const editInput = document.querySelector('.edit-input');
    if (!editInput) return;
    
    const newName = editInput.value.trim();
    
    if (!newName) {
        alert("Task cannot be empty!");
        return;
    }
    
    // Find and update task
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].name = newName;
        saveTasks();
        showNotification("Task updated successfully!");
    }
    
    // Exit edit mode
    editingTaskId = null;
    
    // Refresh display
    displayTasks();
    updateTaskStats();
}

function cancelEdit() {
    editingTaskId = null;
    displayTasks();
}

function handleEditKeyPress(event, id) {
    if (event.key === 'Enter') {
        saveEdit(id);
    } else if (event.key === 'Escape') {
        cancelEdit();
    }
}

// Toggle task completion
function toggleTaskComplete(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        displayTasks();
        updateTaskStats();
        
        const status = tasks[taskIndex].completed ? 'completed' : 'pending';
        showNotification(`Task marked as ${status}!`);
    }
}

// ========== DELETE ==========
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        // Filter out the task
        tasks = tasks.filter(task => task.id !== id);
        
        // Save to localStorage
        saveTasks();
        
        // Exit edit mode if this task was being edited
        if (editingTaskId === id) {
            editingTaskId = null;
        }
        
        // Refresh display
        displayTasks();
        updateTaskStats();
        
        showNotification("Task deleted successfully!");
    }
}

// Clear all tasks
function clearAllTasks() {
    if (tasks.length === 0) {
        alert("No tasks to clear!");
        return;
    }
    
    if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone!')) {
        tasks = [];
        editingTaskId = null;
        saveTasks();
        displayTasks();
        updateTaskStats();
        showNotification("All tasks cleared!");
    }
}

// ========== SEARCH & FILTER ==========
function searchTasks() {
    displayTasks();
    updateTaskStats();
}

function filterTasks() {
    displayTasks();
    updateTaskStats();
}

// ========== HELPER FUNCTIONS ==========
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateTaskStats() {
    const totalTasks = document.getElementById('totalTasks');
    const completedTasks = document.getElementById('completedTasks');
    const pendingTasks = document.getElementById('pendingTasks');
    
    if (totalTasks) {
        totalTasks.textContent = tasks.length;
    }
    
    if (completedTasks) {
        const completed = tasks.filter(t => t.completed).length;
        completedTasks.textContent = completed;
    }
    
    if (pendingTasks) {
        const pending = tasks.filter(t => !t.completed).length;
        pendingTasks.textContent = pending;
    }
}

// Show temporary notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 2 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== LEGACY FUNCTION (Task 2 compatibility) ==========
function validateForm() {
    let name = document.forms["contactForm"]?.["name"]?.value.trim();
    let email = document.forms["contactForm"]?.["email"]?.value.trim();
    let message = document.forms["contactForm"]?.["message"]?.value.trim();
    
    if (!name || !email || !message) {
        alert("Name and Email must be filled out!");
        return false;
    }
    return true;
}