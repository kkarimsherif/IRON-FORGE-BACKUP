// User Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Make API client available globally
    window.api = api;
    
    // Initialize dashboard
    initDashboard();
    
    // Check authentication
    checkAuthentication();
    
    // Event listeners
    setupEventListeners();
});

// Authentication check
function checkAuthentication() {
    // Check if the user is logged in using API client
    if (!api.auth.isLoggedIn()) {
        // Redirect to login page if not authenticated
        window.location.href = 'join.html';
        return;
    }
    
    // Fetch user data
    fetchUserData();
}

// Fetch user data from API
async function fetchUserData() {
    try {
        // Show loading indicators
        document.querySelectorAll('.loading-placeholder').forEach(el => {
            el.style.display = 'block';
        });
        
        // Get user dashboard data from API
        const response = await api.users.getDashboard();
        
        if (response.status === 'success') {
            // Update UI with user data
            updateUserInterface(response.data);
        } else {
            showAlert('Failed to load user data. Please try again.', 'error');
            console.error('API Error:', response);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        
        if (error.status === 401) {
            // Token is invalid or expired, redirect to login
            localStorage.removeItem('userToken');
            window.location.href = 'join.html';
        } else {
            showAlert('Failed to load user data. Please try again.', 'error');
        }
    } finally {
        // Hide all loading indicators
        document.querySelectorAll('.loading-placeholder').forEach(el => {
            el.style.display = 'none';
        });
    }
}

// Update UI with user data
function updateUserInterface(userData) {
    // Update sidebar user info
    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('membership-badge').textContent = userData.membership.type;
    
    // Update profile section
    document.getElementById('profile-name').textContent = userData.name;
    document.getElementById('profile-email').textContent = userData.email;
    document.getElementById('profile-member-since').textContent = `Member since: ${formatDate(userData.memberSince)}`;
    
    // Form fields
    if (document.getElementById('full-name')) {
        document.getElementById('full-name').value = userData.name;
    }
    
    if (document.getElementById('height')) {
        document.getElementById('height').value = userData.stats.height;
    }
    
    if (document.getElementById('weight')) {
        document.getElementById('weight').value = userData.stats.weight;
    }
    
    if (document.getElementById('fitness-goal')) {
        document.getElementById('fitness-goal').value = userData.stats.fitnessGoal;
    }
    
    if (document.getElementById('activity-level')) {
        document.getElementById('activity-level').value = userData.stats.activityLevel;
    }
    
    // Update membership details
    document.getElementById('plan-name').textContent = userData.membership.type;
    document.getElementById('plan-price').innerHTML = `$${userData.membership.price}<span>/month</span>`;
    document.getElementById('plan-status').textContent = userData.membership.status;
    document.getElementById('plan-start-date').textContent = formatDate(userData.membership.startDate);
    document.getElementById('plan-next-billing').textContent = formatDate(userData.membership.nextBilling);
    
    // Update notification count
    const unreadNotifications = userData.notifications.filter(notif => !notif.read);
    document.getElementById('notification-count').textContent = unreadNotifications.length;
    
    // Update dashboard widgets
    updateDashboardWidgets(userData);
}

// Update dashboard overview widgets
function updateDashboardWidgets(userData) {
    // Update membership status
    document.getElementById('membership-status').textContent = userData.membership.type;
    document.getElementById('membership-expiry').textContent = `Valid until: ${formatDate(userData.membership.nextBilling)}`;
    
    // Update upcoming classes count
    document.getElementById('upcoming-classes-count').textContent = 
        userData.classes.length > 0 ? `${userData.classes.length} classes scheduled` : 'No classes scheduled';
    
    // Update recent orders count
    document.getElementById('recent-orders-count').textContent = 
        userData.orders.length > 0 ? `${userData.orders.length} recent orders` : 'No recent orders';
    
    // Populate activity feed
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = ''; // Clear loading placeholder
    
    if (userData.notifications.length === 0) {
        activityList.innerHTML = '<p class="no-data">No recent activity</p>';
    } else {
        userData.notifications.forEach(notification => {
            const activityItem = document.createElement('div');
            activityItem.className = `activity-item ${notification.read ? 'read' : 'unread'}`;
            
            activityItem.innerHTML = `
                <div class="activity-content">
                    <p>${notification.message}</p>
                    <span class="activity-date">${formatDate(notification.date)}</span>
                </div>
            `;
            
            activityList.appendChild(activityItem);
        });
    }
    
    // Populate upcoming classes
    const classList = document.getElementById('class-list');
    classList.innerHTML = ''; // Clear loading placeholder
    
    if (userData.classes.length === 0) {
        classList.innerHTML = '<p class="no-data">No upcoming classes</p>';
    } else {
        userData.classes.forEach(classItem => {
            const classElement = document.createElement('div');
            classElement.className = 'class-item';
            
            classElement.innerHTML = `
                <div class="class-info">
                    <h3>${classItem.name}</h3>
                    <p>${formatDate(classItem.date)} at ${classItem.time}</p>
                    <p>Instructor: ${classItem.instructor}</p>
                </div>
            `;
            
            classList.appendChild(classElement);
        });
    }
    
    // Populate registered classes
    const registeredClassesList = document.getElementById('registered-classes-list');
    
    if (userData.classes.length === 0) {
        registeredClassesList.innerHTML = `
            <div class="no-classes-message">
                <i class="fas fa-calendar-times"></i>
                <p>You are not registered for any classes.</p>
                <button class="btn primary-btn" id="browse-classes-btn">Browse Classes</button>
            </div>
        `;
    } else {
        registeredClassesList.innerHTML = '';
        userData.classes.forEach(classItem => {
            const classElement = document.createElement('div');
            classElement.className = 'class-item';
            
            classElement.innerHTML = `
                <div class="class-info">
                    <h3>${classItem.name}</h3>
                    <p>${formatDate(classItem.date)} at ${classItem.time}</p>
                    <p>Instructor: ${classItem.instructor} | Duration: ${classItem.duration} minutes</p>
                </div>
                <div class="class-actions">
                    <button class="btn secondary-btn class-details-btn" data-id="${classItem.id}">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button class="btn danger-btn cancel-class-btn" data-id="${classItem.id}">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            `;
            
            registeredClassesList.appendChild(classElement);
        });
    }
    
    // Populate orders list
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = ''; // Clear loading placeholder
    
    if (userData.orders.length === 0) {
        ordersList.innerHTML = '<p class="no-data">No orders found</p>';
    } else {
        userData.orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            
            orderElement.innerHTML = `
                <div class="order-header">
                    <div class="order-id">
                        <h3>Order #${order.id}</h3>
                        <span class="order-date">${formatDate(order.date)}</span>
                    </div>
                    <div class="order-status ${order.status}">
                        ${order.status}
                    </div>
                </div>
                <div class="order-summary">
                    <p>${order.items.length} item(s)</p>
                    <p class="order-total">$${order.total.toFixed(2)}</p>
                </div>
                <button class="btn secondary-btn view-order-btn" data-id="${order.id}">
                    View Details
                </button>
            `;
            
            ordersList.appendChild(orderElement);
        });
    }
    
    // Calculate and update BMI if height and weight are available
    if (userData.stats.height && userData.stats.weight) {
        calculateBMI(userData.stats.weight, userData.stats.height);
    }
}

// Initialize dashboard
function initDashboard() {
    // Show default section (overview)
    showSection('overview');
    
    // Show default tabs
    document.querySelector('.tab-btn[data-tab="personal-info"]').classList.add('active');
    document.getElementById('personal-info').classList.add('active');
    
    document.querySelector('.tab-btn[data-tab="registered-classes"]').classList.add('active');
    document.getElementById('registered-classes').classList.add('active');
    
    document.querySelector('.tab-btn[data-tab="all-notifications"]').classList.add('active');
    document.getElementById('all-notifications').classList.add('active');
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar navigation
    const navItems = document.querySelectorAll('.sidebar-nav li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            
            if (section) {
                showSection(section);
                
                // Update active state
                navItems.forEach(navItem => navItem.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            const tabContainer = this.closest('.profile-tabs, .classes-tabs, .notification-tabs');
            const contentContainer = tabContainer.nextElementSibling;
            
            // Update active tab button
            tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show active tab content
            contentContainer.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(tab).classList.add('active');
        });
    });
    
    // Form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('loading');
            }
            
            // Simulate form submission (would be an API call in production)
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.classList.remove('loading');
                }
                
                // Show success message
                showAlert('Changes saved successfully!', 'success');
            }, 1500);
        });
    });
    
    // Calculate BMI button
    const calculateBMIBtn = document.getElementById('calculate-bmi');
    if (calculateBMIBtn) {
        calculateBMIBtn.addEventListener('click', function() {
            const weight = parseFloat(document.getElementById('weight').value);
            const height = parseFloat(document.getElementById('height').value);
            
            if (weight && height) {
                calculateBMI(weight, height);
            } else {
                showAlert('Please enter both weight and height', 'error');
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show confirmation modal
            showConfirmModal(
                'Logout Confirmation', 
                'Are you sure you want to logout?',
                function() {
                    // Clear local storage
                    localStorage.removeItem('userToken');
                    
                    // Redirect to login page
                    window.location.href = 'join.html';
                }
            );
        });
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            // Update icon
            const icon = this.querySelector('i');
            if (document.body.classList.contains('dark-theme')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
            
            // Save preference to local storage
            localStorage.setItem('darkTheme', document.body.classList.contains('dark-theme'));
        });
        
        // Apply saved theme preference
        if (localStorage.getItem('darkTheme') === 'true') {
            document.body.classList.add('dark-theme');
            themeToggle.querySelector('i').className = 'fas fa-sun';
        }
    }
    
    // Plan selection buttons
    const planButtons = document.querySelectorAll('.select-plan-btn');
    planButtons.forEach(button => {
        button.addEventListener('click', function() {
            const plan = this.getAttribute('data-plan');
            
            showConfirmModal(
                'Change Membership Plan', 
                `Are you sure you want to switch to the ${plan === 'black-card' ? 'Black Card®' : 'Basic'} plan?`,
                function() {
                    // Show success message (would be an API call in production)
                    showAlert('Membership plan updated successfully!', 'success');
                    
                    // Update UI
                    document.getElementById('plan-name').textContent = plan === 'black-card' ? 'Black Card®' : 'Basic';
                    document.getElementById('plan-price').innerHTML = plan === 'black-card' ? '$24<span>/month</span>' : '$10<span>/month</span>';
                    document.getElementById('membership-badge').textContent = plan === 'black-card' ? 'Black Card®' : 'Basic';
                }
            );
        });
    });
    
    // Browse classes button
    const browseClassesBtn = document.getElementById('browse-classes-btn');
    if (browseClassesBtn) {
        browseClassesBtn.addEventListener('click', function() {
            // Show available classes tab
            document.querySelector('.tab-btn[data-tab="available-classes"]').click();
        });
    }
    
    // Close modal buttons
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
}

// Calculate BMI
function calculateBMI(weight, height) {
    // BMI formula: weight (kg) / (height (m))²
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    const bmiValue = document.querySelector('.bmi-value');
    const bmiCategory = document.querySelector('.bmi-category');
    
    if (bmiValue && bmiCategory) {
        bmiValue.textContent = bmi.toFixed(1);
        
        // Determine BMI category
        let category = '';
        let categoryClass = '';
        
        if (bmi < 18.5) {
            category = 'Underweight';
            categoryClass = 'underweight';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal weight';
            categoryClass = 'normal';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            categoryClass = 'overweight';
        } else {
            category = 'Obese';
            categoryClass = 'obese';
        }
        
        bmiCategory.textContent = category;
        
        // Remove all category classes
        bmiCategory.classList.remove('underweight', 'normal', 'overweight', 'obese');
        
        // Add appropriate class
        bmiCategory.classList.add(categoryClass);
    }
}

// Show confirmation modal
function showConfirmModal(title, message, callback) {
    const modal = document.getElementById('confirm-modal');
    const modalTitle = document.getElementById('confirm-title');
    const modalMessage = document.getElementById('confirm-message');
    const confirmBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Show modal
    modal.style.display = 'flex';
    
    // Remove old event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Add new event listeners
    newConfirmBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        if (typeof callback === 'function') {
            callback();
        }
    });
    
    newCancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
}

// Show alert/toast message
function showAlert(message, type = 'info') {
    // Create alert element if it doesn't exist
    let alertContainer = document.querySelector('.alert-container');
    
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.className = 'alert-container';
        document.body.appendChild(alertContainer);
    }
    
    // Create alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-message">${message}</div>
        <button class="alert-close">&times;</button>
    `;
    
    // Add alert to container
    alertContainer.appendChild(alert);
    
    // Show alert with animation
    setTimeout(() => {
        alert.classList.add('show');
    }, 10);
    
    // Add close button event
    const closeBtn = alert.querySelector('.alert-close');
    closeBtn.addEventListener('click', function() {
        removeAlert(alert);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        removeAlert(alert);
    }, 5000);
}

// Remove alert with animation
function removeAlert(alert) {
    alert.classList.remove('show');
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 300);
}

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Add CSS for alerts/toasts
const alertStyles = document.createElement('style');
alertStyles.textContent = `
    .alert-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .alert {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 450px;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .alert.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .alert-success {
        border-left: 4px solid var(--success-color);
    }
    
    .alert-error {
        border-left: 4px solid var(--danger-color);
    }
    
    .alert-warning {
        border-left: 4px solid var(--warning-color);
    }
    
    .alert-info {
        border-left: 4px solid var(--info-color);
    }
    
    .alert-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: var(--text-muted);
    }
    
    .alert-message {
        flex: 1;
    }
    
    .btn.loading .btn-text {
        visibility: hidden;
    }
    
    .btn.loading .spinner {
        display: flex;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
    
    .spinner {
        display: none;
    }
    
    /* Additional button types */
    .danger-btn {
        background-color: var(--danger-color);
        color: white;
    }
    
    .danger-btn:hover {
        background-color: #c82333;
    }
    
    /* Additional order status colors */
    .order-status.completed {
        color: var(--success-color);
    }
    
    .order-status.processing {
        color: var(--accent-color);
    }
    
    .order-status.shipped {
        color: var(--info-color);
    }
    
    .order-status.cancelled {
        color: var(--danger-color);
    }
    
    /* BMI colors */
    .bmi-category.underweight {
        color: var(--info-color);
    }
    
    .bmi-category.normal {
        color: var(--success-color);
    }
    
    .bmi-category.overweight {
        color: var(--warning-color);
    }
    
    .bmi-category.obese {
        color: var(--danger-color);
    }
    
    /* No data message */
    .no-data {
        text-align: center;
        color: var(--text-muted);
        padding: 20px;
    }
`;

document.head.appendChild(alertStyles); 