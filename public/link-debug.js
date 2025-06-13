/**
 * Debug script to identify link click issues
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Link debugging script loaded');
  
  // Add click event listeners to all links
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(event) {
      console.log('Link clicked:', {
        href: this.getAttribute('href'),
        text: this.innerText.trim(),
        defaultPrevented: event.defaultPrevented
      });
      
      // If it's the My Profile link, log extra details
      if (this.innerText.includes('My Profile')) {
        console.log('My Profile link clicked - href:', this.getAttribute('href'));
        if (event.defaultPrevented) {
          console.warn('Default action was prevented!');
        }
      }
    }, true); // Use capturing to see event before it might be prevented
  });
}); 