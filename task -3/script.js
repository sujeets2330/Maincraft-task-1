// Mobile menu toggle
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

// ========== CONTACT FORM WITH LOCALSTORAGE ==========
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
            
            alert(" All fields are required! Please fill in all fields.");
            return;
        }
        
        // Email validation (basic)
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            emailInput.classList.add('error');
            alert(" Please enter a valid email address!");
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
        alert(" Form submitted successfully! Your data has been saved.");
        
        // Reset form
        document.getElementById('contactForm').reset();
    });
}

// ========== SUBMISSIONS PAGE ==========
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
    
    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Function to delete a submission
    window.deleteSubmission = function(id) {
        if (confirm('Are you sure you want to delete this submission?')) {
            let submissions = JSON.parse(localStorage.getItem('contacts')) || [];
            submissions = submissions.filter(sub => sub.id !== id);
            localStorage.setItem('contacts', JSON.stringify(submissions));
            displaySubmissions(); // Refresh the display
            alert(' Submission deleted successfully!');
        }
    };
    
    // Function to clear all submissions
    window.clearAllSubmissions = function() {
        if (confirm(' Are you sure you want to delete ALL submissions? This cannot be undone!')) {
            localStorage.removeItem('contacts');
            displaySubmissions(); // Refresh the display
            alert(' All submissions cleared!');
        }
    };
    
    // Display submissions when page loads
    displaySubmissions();
}

// ========== FORM VALIDATION FOR TASK 2 (keep for compatibility) ==========
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