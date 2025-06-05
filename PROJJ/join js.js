document.addEventListener("DOMContentLoaded", function () {
    // Select elements
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    const signin_btn = document.getElementById("signin_btn");
    const signup_btn = document.getElementById("signup_btn");

    const toggleButton = document.getElementById("theme-toggle");
    
    // Join button redirect functionality
    const joinButton = document.getElementById('joinButton');
    
    if (joinButton) {
        // Mouse click event
        joinButton.addEventListener('click', handleJoinRedirect);
        
        // Keyboard accessibility - trigger on Enter or Space
        joinButton.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleJoinRedirect(event);
            }
        });
        
        // Touch devices
        joinButton.addEventListener('touchend', handleJoinRedirect);
    }
    
    function handleJoinRedirect(event) {
        event.preventDefault();
        
        try {
            // Visual feedback during transition
            joinButton.classList.add('redirecting');
            joinButton.textContent = 'Redirecting...';
            
            // Delay redirect for smooth transition (300ms)
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 300);
        } catch (error) {
            console.error('Redirect failed:', error);
            
            // Reset button if redirect fails
            joinButton.classList.remove('redirecting');
            joinButton.textContent = 'Join Now';
            
            // Show user-friendly error
            alert('Couldn\'t redirect to login page. Please try again.');
        }
    }

    // Check if elements exist before adding event listeners
    if (registerBtn && container) {
        registerBtn.addEventListener('click', () => {
            container.classList.add("active");
        });
    }

    if (loginBtn && container) {
        loginBtn.addEventListener('click', () => {
            container.classList.remove("active");
        });
    }

    if (signin_btn) {
        signin_btn.addEventListener('click', function() {
            
            window.location.href = "gym.html";
        });
    }

    if (signup_btn) {
        signup_btn.addEventListener('click', function() {
            window.location.href = "gym.html";
        });
    }


    function togglePassword(inputId, iconElement) {
        const passwordInput = document.getElementById(inputId);
        
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            iconElement.classList.remove("bx-hide");
            iconElement.classList.add("bx-show-alt");
        } else {
            passwordInput.type = "password";
            iconElement.classList.remove("bx-show-alt");
            iconElement.classList.add("bx-hide");
        }
    }

    // Expose function globally (optional)
    window.togglePassword = togglePassword;
});




