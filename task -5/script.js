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

// ========== TASK 5 - SHOP & CART FUNCTIONS ==========

let allProducts = [];
let currentProducts = [];
let currentCategory = 'all';
let currentPage = 1;
const productsPerPage = 8;

// Load products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        allProducts = data.products;
        currentProducts = [...allProducts];
        filterProducts();
        updateCartBadge();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Filter, Sort, and Search products
function filterProducts() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortSelect')?.value || 'default';
    
    let filtered = [...allProducts];
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
    
    // Filter by search
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort products
    if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    currentProducts = filtered;
    currentPage = 1;
    displayProducts();
    updatePagination();
}

// Display products with pagination
function displayProducts() {
    const grid = document.getElementById('productsGrid');
    const count = document.getElementById('productsCount');
    
    if (!grid) return;
    
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = currentProducts.slice(start, end);
    
    if (count) {
        count.textContent = `Showing ${start + 1}-${Math.min(end, currentProducts.length)} of ${currentProducts.length} products`;
    }
    
    if (paginatedProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = paginatedProducts.map(product => `
        <div class="product-card" onclick="viewProduct(${product.id})">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    <div class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</div>
                    <span class="rating-text">(${product.rating})</span>
                </div>
                <div class="product-price">₹${product.price.toLocaleString()} <span>/-</span></div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Update pagination buttons
function updatePagination() {
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) return;
    
    const totalPages = Math.ceil(currentProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let buttons = '';
    buttons += `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>← Previous</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            buttons += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            buttons += `<span class="page-btn" style="border: none;">...</span>`;
        }
    }
    
    buttons += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;
    
    paginationDiv.innerHTML = buttons;
}

function changePage(page) {
    const totalPages = Math.ceil(currentProducts.length / productsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterByCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === category || (category === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        }
    });
    filterProducts();
}

// View product details
function viewProduct(id) {
    window.location.href = `product-detail.html?id=${id}`;
}

// Add to cart
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showNotification('✅ Added to cart!');
}

// Update cart badge count
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('#cartCount');
    badges.forEach(badge => {
        if (badge) badge.textContent = totalItems;
    });
}

// Load cart items on cart page
function loadCart() {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any items yet</p>
                <a href="shop.html" class="btn" style="margin-top: 1rem; display: inline-block;">Continue Shopping</a>
            </div>
        `;
        updateCartSummary(0, 0);
        return;
    }
    
    cartContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <div class="cart-item-subtotal">₹${(item.price * item.quantity).toLocaleString()}</div>
            <i class="fas fa-trash-alt remove-item" onclick="removeFromCart(${item.id})"></i>
        </div>
    `).join('');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateCartSummary(subtotal, subtotal);
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartBadge();
    }
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartBadge();
    showNotification('🗑️ Item removed from cart');
}

function updateCartSummary(subtotal, total) {
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `₹${total.toLocaleString()}`;
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    alert('🎉 Order placed successfully! Thank you for shopping with MainCrafts.');
    localStorage.removeItem('cart');
    loadCart();
    updateCartBadge();
    window.location.href = 'shop.html';
}

// Load product detail page
function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = allProducts.find(p => p.id === productId);
    
    if (!product || !document.getElementById('productDetail')) return;
    
    let quantity = 1;
    
    document.getElementById('productDetail').innerHTML = `
        <div class="product-detail-container">
            <img src="${product.image}" alt="${product.name}" class="product-detail-image">
            <div class="product-detail-info">
                <span class="product-detail-category">${product.category}</span>
                <h1>${product.name}</h1>
                <div class="product-rating">
                    <div class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</div>
                    <span class="rating-text">${product.rating} / 5</span>
                </div>
                <div class="product-detail-price">₹${product.price.toLocaleString()} <span style="font-size: 1rem;">/-</span></div>
                <p class="product-detail-description">${product.description}</p>
                <div class="quantity-selector">
                    <button onclick="updateDetailQuantity(-1)">-</button>
                    <span id="detailQuantity">1</span>
                    <button onclick="updateDetailQuantity(1)">+</button>
                </div>
                <button class="add-to-cart-btn" onclick="addToCartFromDetail(${product.id})">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <button class="buy-now-btn" onclick="buyNow(${product.id})">
                    <i class="fas fa-bolt"></i> Buy Now
                </button>
            </div>
        </div>
    `;
    
    window.updateDetailQuantity = (change) => {
        quantity = Math.max(1, quantity + change);
        document.getElementById('detailQuantity').textContent = quantity;
    };
    
    window.addToCartFromDetail = (id) => {
        for (let i = 0; i < quantity; i++) {
            addToCart(id);
        }
        quantity = 1;
        document.getElementById('detailQuantity').textContent = quantity;
    };
    
    window.buyNow = (id) => {
        addToCart(id);
        window.location.href = 'cart.html';
    };
}

// Initialize based on page
if (document.getElementById('productsGrid')) {
    loadProducts();
}

if (document.getElementById('cartItems')) {
    loadCart();
}

if (window.location.pathname.includes('product-detail.html')) {
    loadProducts().then(() => loadProductDetail());
}