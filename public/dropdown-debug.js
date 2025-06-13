/**
 * Debug script for dropdown menu functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Log initial state for debugging
    console.log('Dropdown debug script loaded');
    
    // Find all dropdown elements
    const dropdowns = document.querySelectorAll('.dropdown');
    console.log('Found', dropdowns.length, 'dropdown elements');
    
    // Find all dropdown toggle elements
    const toggles = document.querySelectorAll('.dropdown-toggle');
    console.log('Found', toggles.length, 'dropdown toggle elements');
    
    // Log each dropdown structure
    dropdowns.forEach((dropdown, index) => {
        console.log(`Dropdown ${index + 1}:`, dropdown);
        console.log(`- Has toggle:`, dropdown.querySelector('.dropdown-toggle') !== null);
        console.log(`- Has menu:`, dropdown.querySelector('.dropdown-menu') !== null);
    });
    
    // Direct click handler for dropdown toggles
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            console.log('Dropdown toggle clicked', this);
            e.preventDefault();
            
            // Get parent dropdown
            const parent = this.closest('.dropdown');
            console.log('Parent dropdown:', parent);
            
            if (parent) {
                // Toggle active class
                parent.classList.toggle('active');
                console.log('Toggled active class, now:', parent.classList.contains('active'));
                
                // Force dropdown menu to be visible
                const menu = parent.querySelector('.dropdown-menu');
                if (menu) {
                    if (parent.classList.contains('active')) {
                        menu.style.display = 'block';
                        menu.style.opacity = '1';
                        menu.style.visibility = 'visible';
                        menu.style.transform = 'translateY(0)';
                        console.log('Forced menu visible');
                    } else {
                        menu.style.display = '';
                        menu.style.opacity = '';
                        menu.style.visibility = '';
                        menu.style.transform = '';
                        console.log('Reset menu visibility');
                    }
                }
            }
        });
    });
    
    // Add click handler for profile button specifically
    const profileBtn = document.querySelector('.btn-profile');
    if (profileBtn) {
        console.log('Found profile button:', profileBtn);
        profileBtn.addEventListener('click', function(e) {
            console.log('Profile button clicked');
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = this.closest('.dropdown');
            console.log('Profile dropdown:', dropdown);
            
            if (dropdown) {
                dropdown.classList.toggle('active');
                console.log('Toggled profile dropdown active state:', dropdown.classList.contains('active'));
                
                // Force dropdown menu visibility
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) {
                    if (dropdown.classList.contains('active')) {
                        menu.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important;';
                    } else {
                        menu.style.cssText = '';
                    }
                }
            }
        });
    }
}); 