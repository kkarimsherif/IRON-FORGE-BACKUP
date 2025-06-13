// Admin Dashboard JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initDashboard();
    setupNavigation();
    setupModals();
    setupFormHandlers();

    // Load initial data
    loadDashboardData();
    loadProductsData();
    loadOrdersData();
    loadUsersData();
});

// Global state for pagination and filters
const state = {
    products: {
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
        filters: {
            search: '',
            category: '',
            stock: ''
        }
    },
    orders: {
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
        filters: {
            search: '',
            dateFrom: '',
            dateTo: '',
            status: ''
        }
    },
    users: {
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
        filters: {
            search: '',
            role: '',
            status: ''
        }
    },
    subscriptions: {
        members: {
            currentPage: 1,
            itemsPerPage: 10,
            totalPages: 1,
            filters: {
                search: '',
                plan: '',
                status: ''
            }
        }
    }
};

// Initialize Dashboard Elements
function initDashboard() {
    // Set current date in header if needed
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Setup event listeners for filters
    setupFilters();
}

// Setup Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Handle logout separately
            if (targetId === 'logout-btn') {
                handleLogout();
                return;
            }
            
            // Remove active class from all links and add to clicked link
            navLinks.forEach(link => link.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
            
            // Hide all sections and show the target section
            contentSections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // Logout button handling
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// Handle Logout
function handleLogout() {
    // Display confirmation modal or perform logout directly
    if (confirm('Are you sure you want to logout?')) {
        // Clear authentication tokens/cookies
        localStorage.removeItem('authToken');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Setup Modal Handling
function setupModals() {
    // Product Modal
    const productModal = document.getElementById('product-modal');
    const addProductBtn = document.getElementById('add-product-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal, .cancel-btn');
    
    // Open Product Modal
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            // Reset form before opening
            document.getElementById('product-form').reset();
            document.getElementById('image-preview').innerHTML = '';
            
            // Set modal title for new product
            document.querySelector('#product-modal .modal-header h2').textContent = 'Add New Product';
            
            // Show modal
            productModal.style.display = 'block';
        });
    }
    
    // Close Modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Image preview for product form
    const productImage = document.getElementById('product-image');
    const imagePreview = document.getElementById('image-preview');
    
    if (productImage) {
        productImage.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Product Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Add User Modal
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            // Reset form before opening
            document.getElementById('user-form').reset();
            
            // Set modal title for new user
            document.querySelector('#user-modal .modal-header h2').textContent = 'Add New User';
            
            // Clear data-id attribute if present
            document.getElementById('user-form').removeAttribute('data-user-id');
            
            // Show modal
            document.getElementById('user-modal').style.display = 'block';
        });
    }

    // Add Subscription Modal Handling
    const addSubscriptionBtn = document.getElementById('add-subscription-btn');
    if (addSubscriptionBtn) {
        addSubscriptionBtn.addEventListener('click', function() {
            // Reset form before opening
            document.getElementById('subscription-form').reset();
            
            // Set modal title for new subscription
            document.querySelector('#subscription-modal .modal-header h2').textContent = 'Add Subscription Plan';
            
            // Clear data-id attribute if present
            document.getElementById('subscription-form').removeAttribute('data-plan-id');
            
            // Show modal
            document.getElementById('subscription-modal').style.display = 'block';
        });
    }
}

// Setup Form Handlers
function setupFormHandlers() {
    // Product Form Submit
    const productForm = document.getElementById('product-form');
    
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const productData = {
                name: document.getElementById('product-name').value,
                category: document.getElementById('product-category').value,
                price: parseFloat(document.getElementById('product-price').value),
                stock: parseInt(document.getElementById('product-stock').value),
                description: document.getElementById('product-description').value,
                featured: document.getElementById('product-featured').checked
            };
            
            // Get product ID if editing
            const productId = this.dataset.productId;
            
            if (productId) {
                // Update existing product
                updateProduct(productId, productData);
            } else {
                // Create new product
                createProduct(productData);
            }
            
            // Close modal
            document.getElementById('product-modal').style.display = 'none';
        });
    }

    // User Form Submit
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const userData = {
                firstName: document.getElementById('user-first-name').value,
                lastName: document.getElementById('user-last-name').value,
                email: document.getElementById('user-email').value,
                phone: document.getElementById('user-phone').value,
                role: document.getElementById('user-role').value,
                password: document.getElementById('user-password').value,
                active: document.getElementById('user-active').checked
            };
            
            // Get user ID if editing
            const userId = this.dataset.userId;
            
            if (userId) {
                // Update existing user
                updateUser(userId, userData);
            } else {
                // Create new user
                createUser(userData);
            }
            
            // Close modal
            document.getElementById('user-modal').style.display = 'none';
        });
    }

    // Subscription Form Submit
    const subscriptionForm = document.getElementById('subscription-form');
    if (subscriptionForm) {
        subscriptionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const planData = {
                name: document.getElementById('plan-name').value,
                price: parseFloat(document.getElementById('plan-price').value),
                duration: parseInt(document.getElementById('plan-duration').value),
                description: document.getElementById('plan-description').value,
                features: document.getElementById('plan-features').value.split('\n'),
                active: document.getElementById('plan-active').checked
            };
            
            // Get plan ID if editing
            const planId = this.dataset.planId;
            
            if (planId) {
                // Update existing plan
                updateSubscriptionPlan(planId, planData);
            } else {
                // Create new plan
                createSubscriptionPlan(planData);
            }
            
            // Close modal
            document.getElementById('subscription-modal').style.display = 'none';
        });
    }
}

// Setup Filter Event Listeners
function setupFilters() {
    // Product Filters
    const productSearch = document.getElementById('product-search');
    const categoryFilter = document.getElementById('category-filter');
    const stockFilter = document.getElementById('stock-filter');
    
    if (productSearch) {
        productSearch.addEventListener('input', function() {
            state.products.filters.search = this.value;
            state.products.currentPage = 1; // Reset to first page
            loadProductsData();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            state.products.filters.category = this.value;
            state.products.currentPage = 1;
            loadProductsData();
        });
    }
    
    if (stockFilter) {
        stockFilter.addEventListener('change', function() {
            state.products.filters.stock = this.value;
            state.products.currentPage = 1;
            loadProductsData();
        });
    }
    
    // Order Filters
    const orderSearch = document.getElementById('order-search');
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    const orderStatusFilter = document.getElementById('order-status-filter');
    
    if (orderSearch) {
        orderSearch.addEventListener('input', function() {
            state.orders.filters.search = this.value;
            state.orders.currentPage = 1;
            loadOrdersData();
        });
    }
    
    if (dateFrom) {
        dateFrom.addEventListener('change', function() {
            state.orders.filters.dateFrom = this.value;
            state.orders.currentPage = 1;
            loadOrdersData();
        });
    }
    
    if (dateTo) {
        dateTo.addEventListener('change', function() {
            state.orders.filters.dateTo = this.value;
            state.orders.currentPage = 1;
            loadOrdersData();
        });
    }
    
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', function() {
            state.orders.filters.status = this.value;
            state.orders.currentPage = 1;
            loadOrdersData();
        });
    }

    // User Filters
    if (document.getElementById('user-search')) {
        document.getElementById('user-search').addEventListener('input', function() {
            state.users.filters.search = this.value;
            state.users.currentPage = 1;
            loadUsersData();
        });
    }

    if (document.getElementById('role-filter')) {
        document.getElementById('role-filter').addEventListener('change', function() {
            state.users.filters.role = this.value;
            state.users.currentPage = 1;
            loadUsersData();
        });
    }

    if (document.getElementById('user-status-filter')) {
        document.getElementById('user-status-filter').addEventListener('change', function() {
            state.users.filters.status = this.value;
            state.users.currentPage = 1;
            loadUsersData();
        });
    }

    // Subscription Filters
    if (document.getElementById('member-search')) {
        document.getElementById('member-search').addEventListener('input', function() {
            state.subscriptions.members.filters.search = this.value;
            state.subscriptions.members.currentPage = 1;
            loadMembersData();
        });
    }

    if (document.getElementById('plan-filter')) {
        document.getElementById('plan-filter').addEventListener('change', function() {
            state.subscriptions.members.filters.plan = this.value;
            state.subscriptions.members.currentPage = 1;
            loadMembersData();
        });
    }

    if (document.getElementById('subscription-status-filter')) {
        document.getElementById('subscription-status-filter').addEventListener('change', function() {
            state.subscriptions.members.filters.status = this.value;
            state.subscriptions.members.currentPage = 1;
            loadMembersData();
        });
    }
}

// Load Dashboard Data
function loadDashboardData() {
    // Simulate API call with setTimeout (replace with actual API calls)
    setTimeout(() => {
        // Update dashboard stats
        document.getElementById('total-products').textContent = '128';
        document.getElementById('total-orders').textContent = '45';
        document.getElementById('total-revenue').textContent = '$8,250';
        document.getElementById('total-users').textContent = '634';
        
        // Create sample charts
        createSalesChart();
        createProductsChart();
        
        // Load recent activities
        loadRecentActivities();
    }, 500);
}

// Load Products Data
function loadProductsData() {
    // Show loading state if needed
    const productsTableBody = document.getElementById('products-table-body');
    if (!productsTableBody) return;
    
    productsTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Loading products...</td></tr>';
    
    // Simulate API call (replace with actual API)
    setTimeout(() => {
        // Sample product data (replace with API data)
        const products = [
            { id: 1, name: 'Pro Dumbbell Set', category: 'equipment', price: 299.99, stock: 25, status: 'in-stock', image: 'img/dumbbell-set.jpg' },
            { id: 2, name: 'Premium Yoga Mat', category: 'accessories', price: 49.99, stock: 50, status: 'in-stock', image: 'img/yoga-mat.jpg' },
            { id: 3, name: 'Whey Protein Powder', category: 'supplements', price: 79.99, stock: 12, status: 'low-stock', image: 'img/protein.jpg' },
            { id: 4, name: 'Workout T-shirt', category: 'apparel', price: 29.99, stock: 80, status: 'in-stock', image: 'img/tshirt.jpg' },
            { id: 5, name: 'Adjustable Bench', category: 'equipment', price: 199.99, stock: 0, status: 'out-of-stock', image: 'img/bench.jpg' },
            { id: 6, name: 'Resistance Bands Set', category: 'accessories', price: 24.99, stock: 35, status: 'in-stock', image: 'img/bands.jpg' },
            { id: 7, name: 'Pre-Workout Supplement', category: 'supplements', price: 39.99, stock: 8, status: 'low-stock', image: 'img/preworkout.jpg' },
            { id: 8, name: 'Compression Shorts', category: 'apparel', price: 34.99, stock: 42, status: 'in-stock', image: 'img/shorts.jpg' }
        ];
        
        // Apply filters
        let filteredProducts = products.filter(product => {
            // Search filter
            if (state.products.filters.search && !product.name.toLowerCase().includes(state.products.filters.search.toLowerCase())) {
                return false;
            }
            
            // Category filter
            if (state.products.filters.category && product.category !== state.products.filters.category) {
                return false;
            }
            
            // Stock filter
            if (state.products.filters.stock) {
                if (state.products.filters.stock === 'in-stock' && product.status !== 'in-stock') return false;
                if (state.products.filters.stock === 'low-stock' && product.status !== 'low-stock') return false;
                if (state.products.filters.stock === 'out-of-stock' && product.status !== 'out-of-stock') return false;
            }
            
            return true;
        });
        
        // Calculate pagination
        state.products.totalPages = Math.ceil(filteredProducts.length / state.products.itemsPerPage);
        
        // Get current page items
        const startIndex = (state.products.currentPage - 1) * state.products.itemsPerPage;
        const endIndex = startIndex + state.products.itemsPerPage;
        const currentPageItems = filteredProducts.slice(startIndex, endIndex);
        
        // Clear table
        productsTableBody.innerHTML = '';
        
        // Check if no products found
        if (currentPageItems.length === 0) {
            productsTableBody.innerHTML = '<tr><td colspan="9" class="text-center">No products found</td></tr>';
            return;
        }
        
        // Populate table
        currentPageItems.forEach(product => {
            const statusClass = product.status === 'in-stock' ? 'stock-in' : (product.status === 'low-stock' ? 'stock-low' : 'stock-out');
            
            productsTableBody.innerHTML += `
                <tr>
                    <td><input type="checkbox" class="product-checkbox" data-id="${product.id}"></td>
                    <td>#${product.id}</td>
                    <td><img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/50'"></td>
                    <td>${product.name}</td>
                    <td>${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>${product.stock}</td>
                    <td><span class="status-badge ${statusClass}">${product.status.replace('-', ' ')}</span></td>
                    <td class="actions">
                        <button class="action-btn edit-btn" data-id="${product.id}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${product.id}" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        
        // Setup product edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                editProduct(productId);
            });
        });
        
        // Setup product delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                deleteProduct(productId);
            });
        });
        
        // Update pagination
        updatePagination('products-pagination', state.products.currentPage, state.products.totalPages, page => {
            state.products.currentPage = page;
            loadProductsData();
        });
        
    }, 500);
}

// Load Orders Data
function loadOrdersData() {
    // Show loading state
    const ordersTableBody = document.getElementById('orders-table-body');
    if (!ordersTableBody) return;
    
    ordersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading orders...</td></tr>';
    
    // Simulate API call
    setTimeout(() => {
        // Sample order data (replace with API data)
        const orders = [
            { id: 'ORD-1001', customer: 'John Smith', date: '2023-12-15', total: 149.97, status: 'completed', payment: 'Paid' },
            { id: 'ORD-1002', customer: 'Sarah Johnson', date: '2023-12-16', total: 89.98, status: 'processing', payment: 'Paid' },
            { id: 'ORD-1003', customer: 'Michael Brown', date: '2023-12-17', total: 299.99, status: 'pending', payment: 'Pending' },
            { id: 'ORD-1004', customer: 'Emma Wilson', date: '2023-12-18', total: 54.97, status: 'completed', payment: 'Paid' },
            { id: 'ORD-1005', customer: 'James Davis', date: '2023-12-19', total: 119.96, status: 'cancelled', payment: 'Refunded' },
            { id: 'ORD-1006', customer: 'Linda Martinez', date: '2023-12-20', total: 249.98, status: 'processing', payment: 'Paid' }
        ];
        
        // Apply filters
        let filteredOrders = orders.filter(order => {
            // Search filter
            if (state.orders.filters.search) {
                const searchTerm = state.orders.filters.search.toLowerCase();
                if (!order.id.toLowerCase().includes(searchTerm) && 
                    !order.customer.toLowerCase().includes(searchTerm)) {
                    return false;
                }
            }
            
            // Date from filter
            if (state.orders.filters.dateFrom && new Date(order.date) < new Date(state.orders.filters.dateFrom)) {
                return false;
            }
            
            // Date to filter
            if (state.orders.filters.dateTo && new Date(order.date) > new Date(state.orders.filters.dateTo)) {
                return false;
            }
            
            // Status filter
            if (state.orders.filters.status && order.status !== state.orders.filters.status) {
                return false;
            }
            
            return true;
        });
        
        // Calculate pagination
        state.orders.totalPages = Math.ceil(filteredOrders.length / state.orders.itemsPerPage);
        
        // Get current page items
        const startIndex = (state.orders.currentPage - 1) * state.orders.itemsPerPage;
        const endIndex = startIndex + state.orders.itemsPerPage;
        const currentPageItems = filteredOrders.slice(startIndex, endIndex);
        
        // Clear table
        ordersTableBody.innerHTML = '';
        
        // Check if no orders found
        if (currentPageItems.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No orders found</td></tr>';
            return;
        }
        
        // Populate table
        currentPageItems.forEach(order => {
            const formattedDate = new Date(order.date).toLocaleDateString();
            const statusClass = `status-${order.status}`;
            
            ordersTableBody.innerHTML += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customer}</td>
                    <td>${formattedDate}</td>
                    <td>$${order.total.toFixed(2)}</td>
                    <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                    <td>${order.payment}</td>
                    <td class="actions">
                        <button class="action-btn view-btn" data-id="${order.id}" title="View"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-id="${order.id}" title="Edit"><i class="fas fa-edit"></i></button>
                    </td>
                </tr>
            `;
        });
        
        // Setup order view buttons
        document.querySelectorAll('.orders-list-container .view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = this.dataset.id;
                viewOrderDetails(orderId);
            });
        });
        
        // Update pagination
        updatePagination('orders-pagination', state.orders.currentPage, state.orders.totalPages, page => {
            state.orders.currentPage = page;
            loadOrdersData();
        });
        
    }, 500);
}

// Load Users Data
function loadUsersData() {
    // Show loading state
    const usersTableBody = document.getElementById('users-table-body');
    if (!usersTableBody) return;
    
    usersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading users...</td></tr>';
    
    // Simulate API call
    setTimeout(() => {
        // Sample user data (replace with API data)
        const users = [
            { id: 1, firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com', role: 'admin', joined: '2023-10-15', status: 'active' },
            { id: 2, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@example.com', role: 'manager', joined: '2023-10-20', status: 'active' },
            { id: 3, firstName: 'Michael', lastName: 'Brown', email: 'michael.b@example.com', role: 'customer', joined: '2023-11-05', status: 'active' },
            { id: 4, firstName: 'Emma', lastName: 'Wilson', email: 'emma.w@example.com', role: 'customer', joined: '2023-11-12', status: 'inactive' },
            { id: 5, firstName: 'James', lastName: 'Davis', email: 'james.d@example.com', role: 'customer', joined: '2023-11-18', status: 'blocked' },
            { id: 6, firstName: 'Linda', lastName: 'Martinez', email: 'linda.m@example.com', role: 'manager', joined: '2023-11-25', status: 'active' }
        ];
        
        // Apply filters
        let filteredUsers = users.filter(user => {
            // Search filter
            if (state.users.filters.search) {
                const searchTerm = state.users.filters.search.toLowerCase();
                if (!user.firstName.toLowerCase().includes(searchTerm) && 
                    !user.lastName.toLowerCase().includes(searchTerm) && 
                    !user.email.toLowerCase().includes(searchTerm)) {
                    return false;
                }
            }
            
            // Role filter
            if (state.users.filters.role && user.role !== state.users.filters.role) {
                return false;
            }
            
            // Status filter
            if (state.users.filters.status && user.status !== state.users.filters.status) {
                return false;
            }
            
            return true;
        });
        
        // Calculate pagination
        state.users.totalPages = Math.ceil(filteredUsers.length / state.users.itemsPerPage);
        
        // Get current page items
        const startIndex = (state.users.currentPage - 1) * state.users.itemsPerPage;
        const endIndex = startIndex + state.users.itemsPerPage;
        const currentPageItems = filteredUsers.slice(startIndex, endIndex);
        
        // Clear table
        usersTableBody.innerHTML = '';
        
        // Check if no users found
        if (currentPageItems.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No users found</td></tr>';
            return;
        }
        
        // Populate table
        currentPageItems.forEach(user => {
            const formattedDate = new Date(user.joined).toLocaleDateString();
            const statusClass = `status-${user.status === 'active' ? 'completed' : (user.status === 'inactive' ? 'pending' : 'cancelled')}`;
            const fullName = `${user.firstName} ${user.lastName}`;
            
            usersTableBody.innerHTML += `
                <tr>
                    <td><input type="checkbox" class="user-checkbox" data-id="${user.id}"></td>
                    <td>#${user.id}</td>
                    <td>${fullName}</td>
                    <td>${user.email}</td>
                    <td>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
                    <td>${formattedDate}</td>
                    <td><span class="status-badge ${statusClass}">${user.status}</span></td>
                    <td class="actions">
                        <button class="action-btn view-btn" data-id="${user.id}" title="View"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-id="${user.id}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${user.id}" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        
        // Setup user view buttons
        document.querySelectorAll('.users-list-container .view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.dataset.id;
                viewUserDetails(userId);
            });
        });
        
        // Setup user edit buttons
        document.querySelectorAll('.users-list-container .edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.dataset.id;
                editUser(userId);
            });
        });
        
        // Setup user delete buttons
        document.querySelectorAll('.users-list-container .delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.dataset.id;
                deleteUser(userId);
            });
        });
        
        // Update pagination
        updatePagination('users-pagination', state.users.currentPage, state.users.totalPages, page => {
            state.users.currentPage = page;
            loadUsersData();
        });
        
    }, 500);
}

// Load Recent Activities
function loadRecentActivities() {
    const activitiesList = document.getElementById('recent-activities-list');
    if (!activitiesList) return;
    
    // Sample activities (replace with actual data)
    const activities = [
        { type: 'order', message: 'New order #ORD-1007 received', time: '5 minutes ago', icon: 'shopping-cart' },
        { type: 'user', message: 'New user Lisa Johnson registered', time: '1 hour ago', icon: 'user-plus' },
        { type: 'review', message: 'New product review received for Pro Dumbbell Set', time: '3 hours ago', icon: 'star' },
        { type: 'product', message: 'Whey Protein Powder stock is low (12 items remaining)', time: '5 hours ago', icon: 'exclamation-triangle' },
        { type: 'order', message: 'Order #ORD-1002 status updated to Processing', time: '6 hours ago', icon: 'truck' }
    ];
    
    // Clear list
    activitiesList.innerHTML = '';
    
    // Populate list
    activities.forEach(activity => {
        activitiesList.innerHTML += `
            <div class="activity-item">
                <div class="activity-icon"><i class="fas fa-${activity.icon}"></i></div>
                <div class="activity-details">
                    <p>${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `;
    });
}

// Create Sales Chart
function createSalesChart() {
    const ctx = document.getElementById('sales-chart');
    if (!ctx) return;
    
    // Sample data (replace with actual data)
    const salesData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Monthly Sales',
            data: [1200, 1900, 1500, 2000, 2500, 2300, 2800, 3000, 2900, 3500, 3200, 3800],
            backgroundColor: 'rgba(255, 69, 0, 0.2)',
            borderColor: '#ff4500',
            borderWidth: 2,
            tension: 0.4
        }]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: salesData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

// Create Products Chart
function createProductsChart() {
    const ctx = document.getElementById('products-chart');
    if (!ctx) return;
    
    // Sample data (replace with actual data)
    const productData = {
        labels: ['Pro Dumbbell Set', 'Whey Protein', 'Yoga Mat', 'Resistance Bands', 'Workout Shirt'],
        datasets: [{
            label: 'Units Sold',
            data: [45, 68, 32, 52, 39],
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
            ]
        }]
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: productData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Update Pagination Controls
function updatePagination(containerId, currentPage, totalPages, callback) {
    const paginationContainer = document.getElementById(containerId);
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.classList.add('pagination-btn');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            callback(currentPage - 1);
        }
    });
    paginationContainer.appendChild(prevBtn);
    
    // Page buttons
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons && startPage > 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.classList.add('pagination-btn');
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            callback(i);
        });
        paginationContainer.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.classList.add('pagination-btn');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            callback(currentPage + 1);
        }
    });
    paginationContainer.appendChild(nextBtn);
}

// Edit Product
function editProduct(productId) {
    // Fetch product data (replace with actual API call)
    const product = {
        id: productId,
        name: 'Pro Dumbbell Set',
        category: 'equipment',
        price: 299.99,
        stock: 25,
        description: 'Professional grade adjustable dumbbell set for home or gym use.',
        featured: true
    };
    
    // Populate form
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-featured').checked = product.featured;
    
    // Set product ID on form
    document.getElementById('product-form').dataset.productId = productId;
    
    // Set modal title
    document.querySelector('#product-modal .modal-header h2').textContent = 'Edit Product';
    
    // Show modal
    document.getElementById('product-modal').style.display = 'block';
}

// Delete Product
function deleteProduct(productId) {
    if (confirm(`Are you sure you want to delete product #${productId}?`)) {
        // Simulate API call (replace with actual API)
        setTimeout(() => {
            alert(`Product #${productId} has been deleted`);
            loadProductsData();
        }, 500);
    }
}

// Create New Product
function createProduct(productData) {
    // Simulate API call (replace with actual API)
    setTimeout(() => {
        alert('New product has been created');
        loadProductsData();
        // Reload dashboard stats
        loadDashboardData();
    }, 500);
}

// Update Product
function updateProduct(productId, productData) {
    // Simulate API call (replace with actual API)
    setTimeout(() => {
        alert(`Product #${productId} has been updated`);
        loadProductsData();
    }, 500);
}

// View Order Details
function viewOrderDetails(orderId) {
    // Fetch order details (replace with actual API call)
    const order = {
        id: orderId,
        customer: 'John Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        date: '2023-12-15',
        status: 'completed',
        payment: 'Paid',
        paymentMethod: 'Credit Card',
        shippingAddress: '123 Main St, Anytown, CA 12345',
        items: [
            { id: 1, name: 'Pro Dumbbell Set', quantity: 1, price: 299.99, total: 299.99 },
            { id: 3, name: 'Whey Protein Powder', quantity: 2, price: 79.99, total: 159.98 }
        ],
        subtotal: 459.97,
        shipping: 10.00,
        tax: 37.50,
        total: 507.47
    };
    
    // Populate modal
    const detailsContent = document.getElementById('order-details-content');
    
    const formatDate = dateString => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };
    
    const statusBadge = `<span class="status-badge status-${order.status}">${order.status}</span>`;
    
    detailsContent.innerHTML = `
        <div class="order-details-header">
            <div>
                <h3>Order ${order.id}</h3>
                <p>Placed on ${formatDate(order.date)}</p>
            </div>
            <div class="order-status-form">
                <select id="update-order-status">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
                <button class="primary-btn" id="save-status-btn">Update Status</button>
            </div>
        </div>
        
        <div class="order-details-section">
            <h3>Customer Information</h3>
            <div class="customer-info">
                <div class="info-group">
                    <div class="info-label">Name</div>
                    <div class="info-value">${order.customer}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Email</div>
                    <div class="info-value">${order.email}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Phone</div>
                    <div class="info-value">${order.phone}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Order Status</div>
                    <div class="info-value">${statusBadge}</div>
                </div>
            </div>
        </div>
        
        <div class="order-details-section">
            <h3>Shipping & Payment</h3>
            <div class="shipping-info">
                <div class="info-group">
                    <div class="info-label">Shipping Address</div>
                    <div class="info-value">${order.shippingAddress}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Payment Method</div>
                    <div class="info-value">${order.paymentMethod}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Payment Status</div>
                    <div class="info-value">${order.payment}</div>
                </div>
            </div>
        </div>
        
        <div class="order-details-section">
            <h3>Order Items</h3>
            <table class="order-items-table data-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>$${item.price.toFixed(2)}</td>
                            <td>${item.quantity}</td>
                            <td>$${item.total.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="order-summary">
                <div class="summary-item">
                    <span>Subtotal:</span>
                    <span>$${order.subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Shipping:</span>
                    <span>$${order.shipping.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Tax:</span>
                    <span>$${order.tax.toFixed(2)}</span>
                </div>
                <div class="summary-item total">
                    <span>Total:</span>
                    <span>$${order.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    document.getElementById('order-details-modal').style.display = 'block';
    
    // Add event listener for status update
    document.getElementById('save-status-btn').addEventListener('click', function() {
        const newStatus = document.getElementById('update-order-status').value;
        updateOrderStatus(orderId, newStatus);
    });
}

// Update Order Status
function updateOrderStatus(orderId, status) {
    // Simulate API call (replace with actual API)
    setTimeout(() => {
        alert(`Order ${orderId} status updated to ${status}`);
        document.getElementById('order-details-modal').style.display = 'none';
        loadOrdersData();
    }, 500);
}

// View User Details
function viewUserDetails(userId) {
    // Fetch user details (replace with actual API call)
    const user = {
        id: userId,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        role: 'admin',
        joined: '2023-10-15',
        status: 'active',
        lastLogin: '2023-12-20 09:15:30',
        ordersCount: 5,
        totalSpent: 749.95
    };
    
    // Format date strings
    const joinedDate = new Date(user.joined).toLocaleDateString();
    const statusClass = `status-${user.status === 'active' ? 'completed' : (user.status === 'inactive' ? 'pending' : 'cancelled')}`;
    
    // Populate modal content
    const detailsContent = document.getElementById('user-details-content');
    detailsContent.innerHTML = `
        <div class="user-details">
            <div class="user-profile-header">
                <div class="user-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="user-info-header">
                    <h3>${user.firstName} ${user.lastName}</h3>
                    <p>${user.email}</p>
                    <div class="user-status">
                        <span class="status-badge ${statusClass}">${user.status}</span>
                        <span class="user-role">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="primary-btn edit-user-btn" data-id="${user.id}">Edit User</button>
                </div>
            </div>
            
            <div class="user-details-section">
                <h4>Contact Information</h4>
                <div class="user-contact-info">
                    <div class="info-group">
                        <div class="info-label">Email</div>
                        <div class="info-value">${user.email}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${user.phone || 'Not provided'}</div>
                    </div>
                </div>
            </div>
            
            <div class="user-details-section">
                <h4>Account Information</h4>
                <div class="user-account-info">
                    <div class="info-group">
                        <div class="info-label">Member Since</div>
                        <div class="info-value">${joinedDate}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Last Login</div>
                        <div class="info-value">${user.lastLogin || 'Never'}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Status</div>
                        <div class="info-value">${user.status}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Role</div>
                        <div class="info-value">${user.role}</div>
                    </div>
                </div>
            </div>
            
            <div class="user-details-section">
                <h4>Order History</h4>
                <div class="user-order-info">
                    <div class="info-group">
                        <div class="info-label">Total Orders</div>
                        <div class="info-value">${user.ordersCount}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Total Spent</div>
                        <div class="info-value">$${user.totalSpent.toFixed(2)}</div>
                    </div>
                </div>
                <button class="secondary-btn view-orders-btn" data-id="${user.id}">View Orders</button>
            </div>
        </div>
    `;
    
    // Show modal
    document.getElementById('user-details-modal').style.display = 'block';
    
    // Add event listener for edit button
    document.querySelector('.edit-user-btn').addEventListener('click', function() {
        document.getElementById('user-details-modal').style.display = 'none';
        editUser(this.dataset.id);
    });
    
    // Add event listener for view orders button
    document.querySelector('.view-orders-btn').addEventListener('click', function() {
        // Close this modal and show orders filtered by user
        document.getElementById('user-details-modal').style.display = 'none';
        
        // Navigate to orders tab
        document.querySelector('.nav-menu a[href="#orders"]').click();
        
        // Set order search to user email or ID
        document.getElementById('order-search').value = user.email;
        // Trigger search
        state.orders.filters.search = user.email;
        loadOrdersData();
    });
}

// Edit User
function editUser(userId) {
    // Fetch user data (replace with actual API call)
    const user = {
        id: userId,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        role: 'admin',
        status: 'active'
    };
    
    // Populate form
    document.getElementById('user-first-name').value = user.firstName;
    document.getElementById('user-last-name').value = user.lastName;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-phone').value = user.phone || '';
    document.getElementById('user-role').value = user.role;
    document.getElementById('user-active').checked = user.status === 'active';
    
    // Clear password field for existing user
    document.getElementById('user-password').value = '';
    document.getElementById('user-password').removeAttribute('required');
    
    // Set user ID on form
    document.getElementById('user-form').dataset.userId = userId;
    
    // Set modal title
    document.querySelector('#user-modal .modal-header h2').textContent = 'Edit User';
    
    // Show modal
    document.getElementById('user-modal').style.display = 'block';
}

// Delete User
function deleteUser(userId) {
    if (confirm(`Are you sure you want to delete user #${userId}?`)) {
        // Simulate API call (replace with actual API)
        setTimeout(() => {
            alert(`User #${userId} has been deleted`);
            loadUsersData();
        }, 500);
    }
}

// Create New User
function createUser(userData) {
    // Simulate API call (replace with actual API)
    setTimeout(() => {
        alert('New user has been created');
        loadUsersData();
    }, 500);
}

// Update User
function updateUser(userId, userData) {
    // Simulate API call (replace with actual API)
    setTimeout(() => {
        alert(`User #${userId} has been updated`);
        loadUsersData();
    }, 500);
}

// Load subscription members data
function loadMembersData() {
    // Show loading state
    const membersTableBody = document.getElementById('members-table-body');
    if (!membersTableBody) return;
    
    membersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading members...</td></tr>';
    
    // Simulate API call
    setTimeout(() => {
        // Sample member data (replace with API data)
        const members = [
            { id: 1, name: 'John Smith', plan: 'premium', startDate: '2023-09-15', renewalDate: '2023-12-15', status: 'active', billing: 'Credit Card' },
            { id: 2, name: 'Sarah Johnson', plan: 'basic', startDate: '2023-10-05', renewalDate: '2023-11-05', status: 'expired', billing: 'PayPal' },
            { id: 3, name: 'Michael Brown', plan: 'elite', startDate: '2023-10-20', renewalDate: '2024-01-20', status: 'active', billing: 'Credit Card' },
            { id: 4, name: 'Emma Wilson', plan: 'basic', startDate: '2023-11-01', renewalDate: '2023-12-01', status: 'active', billing: 'Bank Transfer' },
            { id: 5, name: 'James Davis', plan: 'premium', startDate: '2023-11-10', renewalDate: '2023-12-10', status: 'pending', billing: 'Credit Card' },
            { id: 6, name: 'Linda Martinez', plan: 'basic', startDate: '2023-11-15', renewalDate: '2023-12-15', status: 'cancelled', billing: 'PayPal' }
        ];
        
        // Apply filters
        let filteredMembers = members.filter(member => {
            // Search filter
            if (state.subscriptions.members.filters.search) {
                const searchTerm = state.subscriptions.members.filters.search.toLowerCase();
                if (!member.name.toLowerCase().includes(searchTerm)) {
                    return false;
                }
            }
            
            // Plan filter
            if (state.subscriptions.members.filters.plan && member.plan !== state.subscriptions.members.filters.plan) {
                return false;
            }
            
            // Status filter
            if (state.subscriptions.members.filters.status && member.status !== state.subscriptions.members.filters.status) {
                return false;
            }
            
            return true;
        });
        
        // Calculate pagination
        state.subscriptions.members.totalPages = Math.ceil(filteredMembers.length / state.subscriptions.members.itemsPerPage);
        
        // Get current page items
        const startIndex = (state.subscriptions.members.currentPage - 1) * state.subscriptions.members.itemsPerPage;
        const endIndex = startIndex + state.subscriptions.members.itemsPerPage;
        const currentPageItems = filteredMembers.slice(startIndex, endIndex);
        
        // Clear table
        membersTableBody.innerHTML = '';
        
        // Check if no members found
        if (currentPageItems.length === 0) {
            membersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No members found</td></tr>';
            return;
        }
        
        // Populate table
        currentPageItems.forEach(member => {
            const startDate = new Date(member.startDate).toLocaleDateString();
            const renewalDate = new Date(member.renewalDate).toLocaleDateString();
            const statusClass = `status-${member.status === 'active' ? 'completed' : (member.status === 'pending' ? 'pending' : (member.status === 'expired' ? 'processing' : 'cancelled'))}`;
            const planDisplay = member.plan.charAt(0).toUpperCase() + member.plan.slice(1);
            
            membersTableBody.innerHTML += `
                <tr>
                    <td>${member.name}</td>
                    <td>${planDisplay}</td>
                    <td>${startDate}</td>
                    <td>${renewalDate}</td>
                    <td><span class="status-badge ${statusClass}">${member.status}</span></td>
                    <td>${member.billing}</td>
                    <td class="actions">
                        <button class="action-btn view-btn" data-id="${member.id}" title="View"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-id="${member.id}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${member.id}" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        
        // Update pagination
        updatePagination('members-pagination', state.subscriptions.members.currentPage, state.subscriptions.members.totalPages, page => {
            state.subscriptions.members.currentPage = page;
            loadMembersData();
        });
        
    }, 500);
}

// Edit Subscription Plan
function editSubscriptionPlan(planId) {
    // Fetch plan data (replace with actual API call)
    let plan;
    
    if (planId === 'basic') {
        plan = {
            id: 'basic',
            name: 'Basic Plan',
            price: 29.99,
            duration: 1,
            description: 'Basic gym membership with limited equipment access.',
            features: [
                '+ Gym access (6 AM - 10 PM)',
                '+ Basic equipment access',
                '+ 1 Fitness assessment',
                '+ Access to basic classes',
                '- Personal trainer sessions'
            ],
            active: true
        };
    } else if (planId === 'premium') {
        plan = {
            id: 'premium',
            name: 'Premium Plan',
            price: 49.99,
            duration: 1,
            description: 'Premium gym membership with full equipment access and personal training sessions.',
            features: [
                '+ 24/7 Gym access',
                '+ Full equipment access',
                '+ Quarterly fitness assessments',
                '+ Access to all classes',
                '+ 2 Personal trainer sessions/month'
            ],
            active: true
        };
    } else if (planId === 'elite') {
        plan = {
            id: 'elite',
            name: 'Elite Plan',
            price: 79.99,
            duration: 1,
            description: 'Elite gym membership with all premium features plus exclusive services.',
            features: [
                '+ 24/7 Gym access',
                '+ Full equipment & spa access',
                '+ Monthly fitness assessments',
                '+ Priority booking for classes',
                '+ 5 Personal trainer sessions/month'
            ],
            active: true
        };
    }
    
    // Populate form
    document.getElementById('plan-name').value = plan.name;
    document.getElementById('plan-price').value = plan.price;
    document.getElementById('plan-duration').value = plan.duration;
    document.getElementById('plan-description').value = plan.description;
    document.getElementById('plan-features').value = plan.features.join('\n');
    document.getElementById('plan-active').checked = plan.active;
    
    // Set plan ID on form
    document.getElementById('subscription-form').dataset.planId = planId;
    
    // Set modal title
    document.querySelector('#subscription-modal .modal-header h2').textContent = 'Edit Subscription Plan';
    
    // Show modal
    document.getElementById('subscription-modal').style.display = 'block';
}

// Delete Subscription Plan
function deleteSubscriptionPlan(planId) {
    if (confirm(`Are you sure you want to delete the ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan?`)) {
        // Simulate API call (replace with actual API)
        setTimeout(() => {
            alert(`${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan has been deleted`);
            // In a real app, you would update the UI or reload the data
        }, 500);
    }
}

// Create New Subscription Plan
function createSubscriptionPlan(planData) {
    // Simulate API call (replace with actual API)
    setTimeout(() => {
        alert('New subscription plan has been created');
        // In a real app, you would update the UI or reload the data
    }, 500);
}

// Update Subscription Plan
function updateSubscriptionPlan(planId, planData) {
    // Simulate API call (replace with actual API)
    setTimeout(() => {
        alert(`${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan has been updated`);
        // In a real app, you would update the UI or reload the data
    }, 500);
}

// Setup Subscription Tabs
function setupSubscriptionTabs() {
    const tabButtons = document.querySelectorAll('.subscription-tabs .tab-btn');
    const tabPanes = document.querySelectorAll('.subscription-tab-content .tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to current button and pane
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Load data for the active tab if needed
            if (tabId === 'members') {
                loadMembersData();
            }
        });
    });
    
    // Setup subscription plan edit buttons
    document.querySelectorAll('.subscription-card .edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const planId = this.dataset.id;
            editSubscriptionPlan(planId);
        });
    });
    
    // Setup subscription plan delete buttons
    document.querySelectorAll('.subscription-card .delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const planId = this.dataset.id;
            deleteSubscriptionPlan(planId);
        });
    });
}

// Add this line to initDashboard or another initialization function
setupSubscriptionTabs(); 