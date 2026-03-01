// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.createElement('div');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    
    const navbar = document.querySelector('.navbar');
    const nav = document.querySelector('nav');
    
    navbar.insertBefore(mobileMenuBtn, nav);
    
    const navMenu = nav.querySelector('ul');
    
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('show');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!nav.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
            navMenu.classList.remove('show');
        }
    });

    // Handle dropdown on mobile
    const dropdownTriggers = document.querySelectorAll('nav > ul > li:has(.dropdown) > a');
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const dropdown = this.nextElementSibling;
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

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

// Form validation function
function validateForm() {
    // Get form elements
    let name = document.forms["contactForm"]["name"].value.trim();
    let email = document.forms["contactForm"]["email"].value.trim();
    let message = document.forms["contactForm"]["message"].value.trim();
    
    // Get input elements for styling
    let nameInput = document.forms["contactForm"]["name"];
    let emailInput = document.forms["contactForm"]["email"];
    let messageInput = document.forms["contactForm"]["message"];
    
    // Reset error states
    nameInput.classList.remove('error');
    emailInput.classList.remove('error');
    messageInput.classList.remove('error');
    
    // Validation
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
        
        alert("Please fill out all fields: Name, Email, and Message!");
        return false;
    }
    
    // Email validation (basic)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        emailInput.classList.add('error');
        alert("Please enter a valid email address!");
        return false;
    }
    
    // If validation passes
    alert("Form submitted successfully! (This is a demo - no data was sent)");
    return true;
}