/**
 * Smooth scrolling functionality for navbar links
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get all links with hash (#) references
    const navLinks = document.querySelectorAll('a[href^="/#"]');
    
    // Add click event handler to each link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Prevent default anchor click behavior
            e.preventDefault();
            
            // Get the target section id from the href
            const targetId = this.getAttribute('href').replace('/', '');
            const targetSection = document.querySelector(targetId);
            
            // If the target section exists, scroll to it smoothly
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 100, // Offset to account for the fixed header
                    behavior: 'smooth'
                });
                
                // Update URL hash without causing a page scroll
                history.pushState(null, null, targetId);
            } else {
                // If we're on a different page, navigate to the home page with the hash
                window.location.href = this.getAttribute('href');
            }
        });
    });
    
    // Also handle links for current page without the leading slash
    const currentPageLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    currentPageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                history.pushState(null, null, targetId);
            }
        });
    });
}); 