/**
 * Fix for the user dashboard link
 */
document.addEventListener('DOMContentLoaded', function() {
    // Find the profile link in the dropdown
    const profileLink = document.getElementById('profile-link');
    
    if (profileLink) {
        console.log('Found profile link:', profileLink.href);
        
        // Remove any existing click handlers
        const newProfileLink = profileLink.cloneNode(true);
        profileLink.parentNode.replaceChild(newProfileLink, profileLink);
        
        // Add a direct click handler
        newProfileLink.addEventListener('click', function(e) {
            // Don't prevent default - allow normal navigation
            console.log('Profile link clicked, navigating to:', this.href);
            window.location.href = '/user-dashboard';
        });
    } else {
        console.error('Profile link not found in the document');
    }
}); 