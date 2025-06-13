document.addEventListener("DOMContentLoaded", function () {
    // Initialize Finisher Header
    new FinisherHeader({
        "count": 60,
        "size": {
          "min": 1,
          "max": 1001,
          "pulse": 0.2
        },
        "speed": {
          "x": {
            "min": 0,
            "max": 0.1
          },
          "y": {
            "min": 0,
            "max": 0.1
          }
        },
        "colors": {
          "background": "#212121",
          "particles": [
            "#000000",
            "#7b4040",
            "#d9d9d9",
            "#000000",
            "#ff7a00"
          ]
        },
        "blending": "overlay",
        "opacity": {
          "center": 0.85,
          "edge": 0
        },
        "skew": -2,
        "shapes": [
          "c"
        ]
      });

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

    function showError(input, errorDiv, message) {
        input.style.borderColor = '#ff3333';
        input.style.backgroundColor = 'rgba(255, 51, 51, 0.05)';
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    function showSuccess(input, errorDiv) {
        input.style.borderColor = '#28a745';
        input.style.backgroundColor = 'rgba(40, 167, 69, 0.05)';
        errorDiv.style.display = 'none';
    }

    function resetValidation(input, errorDiv) {
        input.style.borderColor = '';
        input.style.backgroundColor = '';
        errorDiv.style.display = 'none';
    }

    // Simple validation function
    function validateForm(formType) {
        let isValid = true;

        if (formType === 'signin') {
            const email = document.querySelector('.sign-in input[type="email"]');
            const password = document.getElementById('signin-password');
            const emailError = document.getElementById('signin-email-error');
            const passwordError = document.getElementById('signin-password-error');

            // Reset validation state
            resetValidation(email, emailError);
            resetValidation(password, passwordError);

            // Email validation
            if (email.value.trim() === '') {
                showError(email, emailError, 'Email is required');
                isValid = false;
            } else if (!email.value.includes('@') || !email.value.includes('.')) {
                showError(email, emailError, 'Please enter a valid email address');
                isValid = false;
            } else {
                showSuccess(email, emailError);
            }

            // Password validation
            if (password.value.trim() === '') {
                showError(password, passwordError, 'Password is required');
                isValid = false;
            } else if (password.value.length < 8) {
                showError(password, passwordError, 'Password must be at least 8 characters');
                isValid = false;
            } else {
                showSuccess(password, passwordError);
            }
        } else {
            const name = document.querySelector('.sign-up input[type="text"]');
            const email = document.querySelector('.sign-up input[type="email"]');
            const password = document.getElementById('signup-password');
            const nameError = document.getElementById('signup-name-error');
            const emailError = document.getElementById('signup-email-error');
            const passwordError = document.getElementById('signup-password-error');

            // Reset validation state
            resetValidation(name, nameError);
            resetValidation(email, emailError);
            resetValidation(password, passwordError);

            // Name validation
            if (name.value.trim() === '') {
                showError(name, nameError, 'Name is required');
                isValid = false;
            } else {
                showSuccess(name, nameError);
            }

            // Email validation
            if (email.value.trim() === '') {
                showError(email, emailError, 'Email is required');
                isValid = false;
            } else if (!email.value.includes('@') || !email.value.includes('.')) {
                showError(email, emailError, 'Please enter a valid email address');
                isValid = false;
            } else {
                showSuccess(email, emailError);
            }

            // Password validation
            if (password.value.trim() === '') {
                showError(password, passwordError, 'Password is required');
                isValid = false;
            } else if (password.value.length < 8) {
                showError(password, passwordError, 'Password must be at least 8 characters');
                isValid = false;
            } else {
                showSuccess(password, passwordError);
            }
        }

        return isValid;
    }

    // Add input event listeners for real-time validation
    document.querySelectorAll('input').forEach(input => {
        const errorDiv = input.parentElement.querySelector('.error-message') || 
                        input.parentElement.parentElement.querySelector('.error-message');
        
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                if (this.type === 'email' && (!this.value.includes('@') || !this.value.includes('.'))) {
                    showError(this, errorDiv, 'Please enter a valid email address');
                } else if (this.type === 'password' && this.value.length < 8) {
                    showError(this, errorDiv, 'Password must be at least 8 characters');
                } else {
                    showSuccess(this, errorDiv);
                }
            } else {
                resetValidation(this, errorDiv);
            }
        });
    });

    if (signin_btn) {
        signin_btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (validateForm('signin')) {
                // Submit the login form to the server
                this.closest('form').submit();
            }
        });
    }

    if (signup_btn) {
        signup_btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (validateForm('signup')) {
                // Submit the signup form to the server
                this.closest('form').submit();
            }
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




