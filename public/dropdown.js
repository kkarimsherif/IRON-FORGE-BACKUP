/**
 * Enhanced dropdown functionality for the profile menu
 */
document.addEventListener('DOMContentLoaded', function() {
    // Find all dropdown toggles (only the main dropdown button)
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    // Add click handlers to each toggle
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Find the parent dropdown container
            const parent = this.closest('.dropdown');
            
            // Toggle active class
            if (parent) {
                parent.classList.toggle('active');
                
                // Close other open dropdowns
                document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                    if (dropdown !== parent) {
                        dropdown.classList.remove('active');
                    }
                });
            }
            
            // Stop event propagation
            e.stopPropagation();
        });
    });
    
    // Handle clicks on dropdown menu items - allow them to navigate
    document.querySelectorAll('.dropdown-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            // Do not prevent default here, allowing navigation
            console.log('Dropdown menu item clicked, navigating to:', this.getAttribute('href'));
            // Optional: close the dropdown
            const parent = this.closest('.dropdown');
            if (parent) {
                setTimeout(() => {
                    parent.classList.remove('active');
                }, 100);
            }
        });
    });
    
    // Close dropdowns when clicking elsewhere on the page
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
    
    // For mobile compatibility, add touch event handlers
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.click();
        }, { passive: false });
    });
}); 