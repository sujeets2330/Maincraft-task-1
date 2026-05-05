// ========== API SERVICE LAYER ==========
// All API calls live here - never in UI code

const BASE_URL = 'https://fakestoreapi.com';

// GET - Fetch all products
export async function fetchProducts() {
    try {
        const response = await fetch(`${BASE_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const products = await response.json();
        
        // Load local products from localStorage
        const savedLocalProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
        
        // Transform FakeStoreAPI data to match our product format
        const apiProducts = products.map(product => ({
            id: product.id,
            name: product.title,
            price: product.price,
            category: product.category,
            image: product.image,
            rating: product.rating?.rate || 4.5,
            description: product.description,
            isLocal: false
        }));
        
        // Combine API products + local products
        return [...apiProducts, ...savedLocalProducts];
    } catch (error) {
        console.error('API Error - fetchProducts:', error);
        throw error;
    }
}

// GET - Fetch single product by ID
export async function fetchProductById(id) {
    try {
        // First check if it's a locally added product
        const savedLocalProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
        const localProduct = savedLocalProducts.find(p => p.id == id);
        
        if (localProduct) {
            return localProduct;
        }
        
        // Otherwise fetch from API
        const response = await fetch(`${BASE_URL}/products/${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const product = await response.json();
        
        return {
            id: product.id,
            name: product.title,
            price: product.price,
            category: product.category,
            image: product.image,
            rating: product.rating?.rate || 4.5,
            description: product.description,
            isLocal: false
        };
    } catch (error) {
        console.error('API Error - fetchProductById:', error);
        // Check local products one more time
        const savedLocalProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
        const localProduct = savedLocalProducts.find(p => p.id == id);
        if (localProduct) {
            return localProduct;
        }
        throw error;
    }
}

// POST - Add a new product
export async function addProduct(product) {
    try {
        // Try to add to FakeStoreAPI
        const response = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: product.name,
                price: product.price,
                category: product.category,
                description: product.description || 'New product added',
                image: product.image || 'https://picsum.photos/300/200'
            })
        });
        
        if (response.ok) {
            try {
                const apiProduct = await response.json();
                // Save locally as backup
                const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
                const newLocalProduct = {
                    id: Date.now(),
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    image: product.image || 'https://picsum.photos/300/200',
                    rating: 4.5,
                    description: product.description || 'New product added',
                    isLocal: true
                };
                localProducts.push(newLocalProduct);
                localStorage.setItem('localProducts', JSON.stringify(localProducts));
                return newLocalProduct;
            } catch (e) {
                console.log('API returned response but could not parse');
            }
        }
        
        // Save locally even if API fails
        const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
        const newLocalProduct = {
            id: Date.now(),
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image || 'https://picsum.photos/300/200',
            rating: 4.5,
            description: product.description || 'New product added',
            isLocal: true
        };
        
        localProducts.push(newLocalProduct);
        localStorage.setItem('localProducts', JSON.stringify(localProducts));
        
        return newLocalProduct;
    } catch (error) {
        console.error('API Error - addProduct:', error);
        // Save locally when API fails
        const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
        const newLocalProduct = {
            id: Date.now(),
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image || 'https://picsum.photos/300/200',
            rating: 4.5,
            description: product.description || 'New product added',
            isLocal: true
        };
        
        localProducts.push(newLocalProduct);
        localStorage.setItem('localProducts', JSON.stringify(localProducts));
        
        return newLocalProduct;
    }
}

// DELETE - Remove a product
export async function deleteProduct(id) {
    try {
        // Try to delete from API if it's not a local product
        if (id <= 100) {
            await fetch(`${BASE_URL}/products/${id}`, {
                method: 'DELETE'
            });
        }
        
        // Remove from local storage
        const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
        const updatedLocalProducts = localProducts.filter(p => p.id != id);
        localStorage.setItem('localProducts', JSON.stringify(updatedLocalProducts));
        
        return { success: true, id };
    } catch (error) {
        console.error('API Error - deleteProduct:', error);
        // Still remove from local storage
        const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
        const updatedLocalProducts = localProducts.filter(p => p.id != id);
        localStorage.setItem('localProducts', JSON.stringify(updatedLocalProducts));
        return { success: true, id };
    }
}