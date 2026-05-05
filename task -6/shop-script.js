// ========== TASK 6 - SHOP WITH API INTEGRATION ==========
import { fetchProducts, addProduct, deleteProduct } from './api.js';

let allProducts = [];
let currentProducts = [];
let currentCategory = 'all';
let currentPage = 1;
let isLoading = false;
let currentSearchTerm = '';
let currentSortBy = 'default';
const productsPerPage = 8;

// Initialize shop when page loads
if (document.getElementById('productsGrid')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadProductsFromAPI();
        setupEventListeners();
        updateCartBadge();
    });
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentSearchTerm = searchInput.value.toLowerCase();
            filterProducts();
        }, 300));
    }
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSortBy = e.target.value;
            filterProducts();
        });
    }
    
    const addForm = document.getElementById('addProductForm');
    if (addForm) {
        addForm.addEventListener('submit', handleAddProduct);
    }
}

// Debounce function for search
function debounce(func, delay) {
    let timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), delay);
    };
}

// Load products from API
async function loadProductsFromAPI() {
    showLoadingSkeletons();
    updateAPIStatus('loading');
    
    try {
        allProducts = await fetchProducts();
        currentProducts = [...allProducts];
        filterProducts();
        updateAPIStatus('online');
        hideLoading();
    } catch (error) {
        console.error('Failed to load products:', error);
        showErrorState();
        updateAPIStatus('offline');
        hideLoading();
    }
}

// Show loading skeletons
function showLoadingSkeletons() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="skeleton-grid">
            ${Array(8).fill(0).map(() => `
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-price"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function hideLoading() {
    isLoading = false;
}

// Show error state
function showErrorState() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Failed to Load Products</h3>
            <p>Unable to connect to the API. Please check your internet connection and try again.</p>
            <button class="retry-btn" onclick="location.reload()">
                <i class="fas fa-sync-alt"></i> Try Again
            </button>
        </div>
    `;
}

// Update API status indicator
function updateAPIStatus(status) {
    const statusDiv = document.getElementById('apiStatus');
    if (!statusDiv) return;
    
    if (status === 'online') {
        statusDiv.className = 'api-status online';
        statusDiv.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> API Connected (FakeStoreAPI)';
    } else if (status === 'offline') {
        statusDiv.className = 'api-status offline';
        statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> API Offline - Using Local Data';
    } else if (status === 'loading') {
        statusDiv.className = 'api-status';
        statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading from API...';
    }
}

// Filter, sort, and search products
function filterProducts() {
    let filtered = [...allProducts];
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
    
    // Filter by search
    if (currentSearchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(currentSearchTerm) ||
            p.category.toLowerCase().includes(currentSearchTerm)
        );
    }
    
    // Sort products
    if (currentSortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (currentSortBy === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSortBy === 'name-desc') {
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
        if (allProducts.length === 0) {
            count.textContent = 'No products loaded';
        } else {
            count.textContent = `Showing ${start + 1}-${Math.min(end, currentProducts.length)} of ${currentProducts.length} products`;
        }
    }
    
    if (paginatedProducts.length === 0 && allProducts.length > 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter</p>
            </div>
        `;
        return;
    }
    
    if (allProducts.length === 0 && !isLoading) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-box-open"></i>
                <h3>No Products Available</h3>
                <p>Add your first product using the admin form above!</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = paginatedProducts.map(product => {
        const isLocal = product.id > 100 || product.isLocal === true;
        const displayPrice = isLocal ? product.price : Math.round(product.price * 85);
        
        return `
        <div class="product-card" style="position: relative;">
            <button class="delete-product-btn" onclick="event.stopPropagation(); window.handleDeleteProduct(${product.id})" title="Delete Product">
                <i class="fas fa-trash-alt"></i>
            </button>
            <div onclick="window.viewProduct(${product.id})">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://picsum.photos/300/200'">
                <div class="product-info">
                    <span class="product-category">${escapeHtml(product.category)}</span>
                    <h3 class="product-title">${escapeHtml(product.name.substring(0, 50))}${product.name.length > 50 ? '...' : ''}</h3>
                    <div class="product-rating">
                        <div class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</div>
                        <span class="rating-text">(${product.rating})</span>
                    </div>
                    <div class="product-price">₹${displayPrice.toLocaleString()} <span>/-</span></div>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); window.addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
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
    buttons += `<button class="page-btn" onclick="window.changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>← Previous</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            buttons += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            buttons += `<span class="page-btn" style="border: none;">...</span>`;
        }
    }
    
    buttons += `<button class="page-btn" onclick="window.changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;
    
    paginationDiv.innerHTML = buttons;
}

window.changePage = function(page) {
    const totalPages = Math.ceil(currentProducts.length / productsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.filterByCategory = function(category) {
    currentCategory = category;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category || (category === 'all' && btn.getAttribute('data-category') === 'all')) {
            btn.classList.add('active');
        }
    });
    filterProducts();
};

// Handle Add Product
async function handleAddProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName')?.value;
    const price = parseFloat(document.getElementById('productPrice')?.value);
    const category = document.getElementById('productCategory')?.value;
    const image = document.getElementById('productImage')?.value;
    const description = document.getElementById('productDesc')?.value;
    
    if (!name || !price || !category) {
        alert('Please fill in all required fields!');
        return;
    }
    
    const newProduct = {
        name: name,
        price: price,
        category: category,
        description: description || 'New product added',
        image: image || 'https://picsum.photos/300/200'
    };
    
    try {
        showNotification('Adding product...');
        const added = await addProduct(newProduct);
        allProducts.unshift(added);
        filterProducts();
        e.target.reset();
        showNotification('✅ Product added successfully!');
        updateAPIStatus('online');
    } catch (error) {
        console.error('Failed to add product:', error);
        alert('Failed to add product. Please try again.');
    }
}

// Handle Delete Product
window.handleDeleteProduct = async function(id) {
    if (!confirm('⚠️ Are you sure you want to delete this product?')) {
        return;
    }
    
    const originalProducts = [...allProducts];
    allProducts = allProducts.filter(p => p.id !== id);
    filterProducts();
    
    try {
        await deleteProduct(id);
        showNotification('✅ Product deleted successfully!');
    } catch (error) {
        console.error('Failed to delete product:', error);
        allProducts = originalProducts;
        filterProducts();
        alert('Failed to delete product. Please try again.');
    }
};

// View product details
window.viewProduct = function(id) {
    window.location.href = `product-detail.html?id=${id}`;
};

// Add to cart
window.addToCart = function(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) return;
    
    const isLocal = product.id > 100 || product.isLocal === true;
    const cartPrice = isLocal ? product.price : Math.round(product.price * 85);
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: cartPrice,
            image: product.image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showNotification('✅ Added to cart!');
};

// Update cart badge count
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('#cartCount');
    badges.forEach(badge => {
        if (badge) badge.textContent = totalItems;
    });
}

// Helper functions
function showNotification(message) {
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
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}