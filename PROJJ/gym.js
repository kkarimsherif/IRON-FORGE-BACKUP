document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navbar.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.navbar a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navbar.classList.remove('active');
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
    
    // Membership Selection
    const membershipCards = document.querySelectorAll('.membership-card');
    const membershipSelect = document.getElementById('membership');
    
    membershipCards.forEach(card => {
        const selectBtn = card.querySelector('.btn-join');
        selectBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the membership title
            const membershipTitle = card.querySelector('h3').textContent;
            
            // Show the payment modal
            const paymentModal = document.getElementById('paymentModal');
            if (paymentModal) {
                paymentModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                // Select the correct membership in the dropdown
                if (membershipSelect) {
                    if (membershipTitle.includes('Basic')) {
                        membershipSelect.value = 'basic';
                    } else if (membershipTitle.includes('Black Card')) {
                        membershipSelect.value = 'black';
                    }
                }
            }
        });
    });
    
    // Services Data
    const servicesData = [
        {
            icon: 'fas fa-dumbbell',
            title: 'Personal Training',
            description: 'One-on-one sessions with certified trainers tailored to your goals.'
        },
        {
            icon: 'fas fa-users',
            title: 'Group Classes',
            description: 'Dynamic group workouts for all fitness levels in a motivating environment.'
        },
        {
            icon: 'fas fa-heartbeat',
            title: 'Nutrition Plans',
            description: 'Customized meal plans to complement your training regimen.'
        },
        {
            icon: 'fas fa-running',
            title: 'Cardio Zone',
            description: 'State-of-the-art cardio equipment with immersive training experiences.'
        },
        {
            icon: 'fas fa-weight',
            title: 'Strength Training',
            description: 'Comprehensive strength equipment for all levels of lifters.'
        },
        {
            icon: 'fas fa-spa',
            title: 'Recovery Services',
            description: 'Massage, cryotherapy and other recovery modalities.'
        }
    ];
    
    // Populate Services
    const servicesGrid = document.querySelector('.services-grid');
    
    if (servicesGrid) {
        servicesGrid.innerHTML = '';
        servicesData.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'service-card';
            serviceCard.innerHTML = `
                <i class="${service.icon}"></i>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
            `;
            servicesGrid.appendChild(serviceCard);
        });
    }
    
    // Classes Data
    const classesData = [
        {
            image: 'img/background.jpg',
            title: 'Iron Strength',
            description: 'High-intensity strength training focusing on compound lifts.',
            type: 'strength',
            time: '6:00 AM',
            duration: '60 min'
        },
        {
            image: 'img/background.jpg',
            title: 'Metabolic Conditioning',
            description: 'Circuit training designed to maximize calorie burn.',
            type: 'hiit',
            time: '7:30 AM',
            duration: '45 min'
        },
        {
            image: 'img/background.jpg',
            title: 'Power Yoga',
            description: 'Dynamic yoga flow to build strength and flexibility.',
            type: 'recovery',
            time: '12:00 PM',
            duration: '60 min'
        },
        {
            image: 'img/background.jpg',
            title: 'Endurance Run',
            description: 'Group running class with interval training.',
            type: 'cardio',
            time: '5:30 PM',
            duration: '45 min'
        },
        {
            image: 'img/background.jpg',
            title: 'Olympic Lifting',
            description: 'Master the snatch and clean & jerk with expert coaching.',
            type: 'strength',
            time: '6:30 PM',
            duration: '75 min'
        },
        {
            image: 'img/background.jpg',
            title: 'Core Crusher',
            description: 'Targeted abdominal and core strengthening workout.',
            type: 'hiit',
            time: '7:30 PM',
            duration: '30 min'
        }
    ];
    
    // Populate Classes
    const classesGrid = document.querySelector('.classes-grid');
    
    function displayClasses(filter = 'all') {
        if (!classesGrid) return;
        
        classesGrid.innerHTML = '';
        
        const filteredClasses = filter === 'all' 
            ? classesData 
            : classesData.filter(cls => cls.type === filter);
        
        filteredClasses.forEach(cls => {
            const classCard = document.createElement('div');
            classCard.className = 'class-card';
            classCard.innerHTML = `
                <div class="class-time">
                    ${cls.time}
                </div>
                <div class="class-info">
                    <h3>${cls.title}</h3>
                    <p>${cls.description}</p>
                </div>
                <div class="class-meta">
                    ${cls.duration}
                </div>
            `;
            classesGrid.appendChild(classCard);
        });
    }
    
    // Initial display
    displayClasses();
    
    // Filter Classes
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Get filter value
            const filter = this.getAttribute('data-filter');
            // Display filtered classes
            displayClasses(filter);
        });
    });
    
    // Products Data
    const productsData = [
        {
            image: 'img/Whey Protein.png',
            title: 'Whey Protein',
            price: '$39.99'
        },
        {
            image: 'img/classic-shaker-500-ml-black.avif',
            title: 'Shaker Bottle',
            price: '$12.99'
        },
        {
            image: 'img/background.jpg',
            title: 'Training Gloves',
            price: '$24.99'
        },
        {
            image: 'img/Weight Lifting Belt.avif',
            title: 'Weight Lifting Belt',
            price: '$49.99'
        },
        {
            image: 'img/Lifting Straps.avif',
            title: 'Lifting Straps',
            price: '$19.99'
        }
    ];
    
    // Add to cart functionality
    const cartItems = [];
    const cartCount = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    const cartModal = document.getElementById('cartModal');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const closeCartModal = cartModal ? cartModal.querySelector('.close-modal') : null;
    
    // Toggle cart modal
    const cartToggle = document.getElementById('cartToggle');
    if (cartToggle && cartModal) {
        cartToggle.addEventListener('click', () => {
            cartModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            renderCartItems();
        });
    }
    
    if (closeCartModal) {
        closeCartModal.addEventListener('click', () => {
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productTitle = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            const productImage = productCard.querySelector('img').src;
            
            // Add to cart
            addToCart({
                title: productTitle,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
            
            // Show notification
            alert(`${productTitle} added to cart!`);
        });
    });
    
    function addToCart(product) {
        // Check if product already in cart
        const existingItem = cartItems.find(item => item.title === product.title);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push(product);
        }
        
        // Update cart count
        updateCart();
    }
    
    function updateCart() {
        if (cartCount) {
            const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
    function renderCartItems() {
        if (!cartItemsContainer) return;
        
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
            if (cartTotalElement) cartTotalElement.textContent = '$0.00';
            if (checkoutBtn) checkoutBtn.style.display = 'none';
            return;
        }
        
        if (checkoutBtn) checkoutBtn.style.display = 'block';
        
        let cartHTML = '';
        let total = 0;
        
        cartItems.forEach(item => {
            const price = parseFloat(item.price.replace('$', ''));
            total += price * item.quantity;
            
            cartHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${item.price} x ${item.quantity}</div>
                    </div>
                    <button class="cart-item-remove" data-title="${item.title}"><i class="fas fa-times"></i></button>
                </div>
            `;
        });
        
        cartItemsContainer.innerHTML = cartHTML;
        
        if (cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', function() {
                const productTitle = this.getAttribute('data-title');
                removeFromCart(productTitle);
            });
        });
    }
    
    function removeFromCart(title) {
        const index = cartItems.findIndex(item => item.title === title);
        if (index !== -1) {
            cartItems.splice(index, 1);
            updateCart();
            renderCartItems();
        }
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            alert('Proceeding to checkout!');
            // In a real app, redirect to checkout page
        });
    }
    
    // Night mode toggle
    const nightModeToggle = document.getElementById('nightModeToggle');
    const body = document.body;
    
    // Check for stored preference
    if (localStorage.getItem('nightMode') === 'true') {
        body.classList.add('night-mode');
        const icon = nightModeToggle?.querySelector('i');
        if (icon) {
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    }
    
    if (nightModeToggle) {
        nightModeToggle.addEventListener('click', function() {
            body.classList.toggle('night-mode');
            const icon = this.querySelector('i');
            
            if (body.classList.contains('night-mode')) {
                icon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('nightMode', 'true');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('nightMode', 'false');
            }
            
            // Apply consistent transitions across all sections
            document.querySelectorAll('section, .card, .membership-card, .service-card, .product-card')
                .forEach(element => {
                    element.style.transition = "background-color 0.3s ease, color 0.3s ease";
                });
        });
    }
    
    // Payment Modal Functionality
    const paymentModal = document.getElementById('paymentModal');
    const successModal = document.getElementById('successModal');
    const joinButtons = document.querySelectorAll('[href="#join"], .btn-join:not([href="join.html"])');
    const closeModal = document.querySelector('.close-modal');
    const closeSuccessModal = document.getElementById('closeSuccessModal');
    const paymentForm = document.getElementById('paymentForm');
    
    // Show payment modal when clicking join buttons
    if (joinButtons.length > 0) {
        joinButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Only prevent default for buttons that are NOT linking to join.html
                if (!button.getAttribute('href') || button.getAttribute('href') === '#join') {
                    e.preventDefault();
                    if (paymentModal) {
                        paymentModal.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                    }
                }
            });
        });
    }
    
    // Close modals
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            if (paymentModal) {
                paymentModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    if (closeSuccessModal) {
        closeSuccessModal.addEventListener('click', function() {
            if (successModal) {
                successModal.style.display = 'none';
            }
            if (paymentModal) {
                paymentModal.style.display = 'none';
            }
            document.body.style.overflow = 'auto';
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (paymentModal && e.target === paymentModal) {
            paymentModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (successModal && e.target === successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Handle form submission
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate payment processing
            setTimeout(() => {
                if (paymentModal) {
                    paymentModal.style.display = 'none';
                }
                if (successModal) {
                    successModal.style.display = 'flex';
                }
            }, 1500);
        });
    }
    
    // Contact form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;
            
            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }
            
            // Simulate form submission
            setTimeout(() => {
                this.reset();
                alert('Thank you for your message! We will get back to you soon.');
            }, 1000);
        });
    }
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            if (!email) {
                alert('Please enter your email address');
                return;
            }
            
            // Simulate subscription
            setTimeout(() => {
                this.reset();
                alert('Thank you for subscribing to our newsletter!');
            }, 1000);
        });
    }

    // Product image animation
    const productImages = document.querySelectorAll('.product-img');
    
    productImages.forEach(img => {
        // Add load event to ensure image is properly loaded
        img.addEventListener('load', function() {
            // Add a subtle animation when image loads
            img.style.opacity = '0';
            setTimeout(() => {
                img.style.transition = 'opacity 0.5s ease';
                img.style.opacity = '1';
            }, 100);
            
            // Ensure parent container has proper styling
            const iconContainer = img.closest('.product-icon');
            if (iconContainer) {
                iconContainer.classList.add('image-loaded');
            }
        });
        
        // Apply hover effects
        const productCard = img.closest('.product-card');
        if (productCard) {
            productCard.addEventListener('mouseenter', function() {
                img.style.transform = 'scale(0.9)';
            });
            
            productCard.addEventListener('mouseleave', function() {
                img.style.transform = 'scale(1)';
            });
        }
    });
});

// Dumbbell Animation Section
document.addEventListener('DOMContentLoaded', () => {
    // Check if required libraries are available
    if (typeof THREE === 'undefined') {
        // Load Three.js if not already loaded
        loadScript('https://unpkg.com/three@0.152.2/build/three.min.js', initDumbbellAnimation);
    } else {
        initDumbbellAnimation();
    }
});

// Helper function to load scripts dynamically
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

// Initialize the dumbbell animation
function initDumbbellAnimation() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) {
        console.error("Canvas container not found");
        return;
    }

    console.log("Initializing dumbbell animation...");

    // Scene setup with transparent background
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background

    // Responsive sizing
    const updateSize = () => {
        const width = canvasContainer.clientWidth;
        // Adjust height based on viewport size for better responsiveness
        const viewportHeight = window.innerHeight;
        let height;
        
        if (window.innerWidth <= 768) {
            // Mobile devices: use square aspect ratio for better visibility
            height = width;
        } else {
            // Desktop: use viewport-based height with minimum
            height = Math.max(width * 0.5, viewportHeight * 0.7);
        }
        
        // Set container height
        canvasContainer.style.height = `${height}px`;
        console.log(`Canvas size updated: ${width}x${height}`);
        
        return { width, height };
    };
    
    const { width, height } = updateSize();

    // Camera setup for better framing
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 10; // Move camera back to view larger dumbbells

    // Renderer setup with transparency
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true // Enable transparency
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasContainer.appendChild(renderer.domElement);
    console.log("THREE.js renderer initialized");

    // Enhanced lighting for objects
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Accent light for better definition with orange tint
    const accentLight = new THREE.DirectionalLight(0xff8040, 0.8);
    accentLight.position.set(-5, 3, -5);
    scene.add(accentLight);

    // Calculate scale based on device size
    const deviceScale = window.innerWidth <= 768 ? 3.6 : 4.5;
    
    // Store references to the dumbbell models
    let leftDumbbell, rightDumbbell;
    let modelsLoaded = 0;
    
    // Check if GLTFLoader is available
    const hasGLTFLoader = typeof THREE.GLTFLoader !== 'undefined' || 
                          typeof GLTFLoader !== 'undefined' ||
                          document.querySelector('script[src*="GLTFLoader"]') !== null;
    
    console.log(`GLTFLoader availability: ${hasGLTFLoader ? 'YES' : 'NO'}`);
    
    // Initial feedback to user while loading
    const loaderElement = document.createElement('div');
    loaderElement.className = 'model-loader';
    loaderElement.innerHTML = '<div class="loader-spinner"></div><p>Loading 3D dumbbell model...</p>';
    canvasContainer.appendChild(loaderElement);
    
    // Create a simple spinning dumbbell icon while loading
    const tempScene = new THREE.Scene();
    const tempSphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff5e14 })
    );
    tempScene.add(tempSphere);
    
    // Start a temporary animation to show something is happening
    const tempAnimation = () => {
        if (!leftDumbbell || !rightDumbbell) {
            requestAnimationFrame(tempAnimation);
            tempSphere.rotation.y += 0.05;
            renderer.render(tempScene, camera);
        }
    };
    tempAnimation();
    
    // Try to load 3D models with a timeout fallback
    let modelLoadTimeout;
    
    if (hasGLTFLoader) {
        console.log("Attempting to load 3D dumbbell models from user specified path...");
        
        // Set a timeout to fallback to programmatic models if loading takes too long
        modelLoadTimeout = setTimeout(() => {
            if (modelsLoaded < 2) {
                console.warn("Model loading timed out, falling back to programmatic dumbbells");
                canvasContainer.removeChild(loaderElement);
                createProgrammaticDumbbells();
            }
        }, 15000); // 15 second timeout - increased for large models
        
        // Use single file for both dumbbells (position them separately)
        const modelPath = './dumbbell-animation/dumbbells.glb';
        console.log(`Attempting to load model from: ${modelPath}`);
        
        // Create loader instance
        let loader;
        if (typeof THREE.GLTFLoader !== 'undefined') {
            loader = new THREE.GLTFLoader();
        } else if (typeof GLTFLoader !== 'undefined') {
            loader = new GLTFLoader();
        } else {
            console.error("GLTFLoader not available!");
            createProgrammaticDumbbells();
            return;
        }
        
        // Try absolute path provided by user
        const absolutePaths = [
            'D:/WEB/PROJJ/dumbbell-animation/dumbbells.glb',
            'file:///D:/WEB/PROJJ/dumbbell-animation/dumbbells.glb',
            '/D:/WEB/PROJJ/dumbbell-animation/dumbbells.glb',
            window.location.origin + '/dumbbell-animation/dumbbells.glb'
        ];
        console.log("Trying absolute paths:", absolutePaths);
        
        // Try first absolute path
        tryAbsolutePath(0);
        
        function tryAbsolutePath(pathIndex) {
            if (pathIndex >= absolutePaths.length) {
                console.log("All absolute paths failed, trying relative path");
                tryAlternatePath();
                return;
            }
            
            const currentPath = absolutePaths[pathIndex];
            console.log(`Trying path ${pathIndex + 1}/${absolutePaths.length}: ${currentPath}`);
            
            loader.load(
                currentPath,
                function(gltf) {
                    console.log(`Model loaded successfully from path: ${currentPath}`);
                    
                    // Create left dumbbell
                    leftDumbbell = gltf.scene.clone();
                    leftDumbbell.position.set(-3, 0, 0);
                    leftDumbbell.rotation.x = 0.3;
                    leftDumbbell.rotation.z = -0.2;
                    leftDumbbell.scale.set(deviceScale * 0.1, deviceScale * 0.1, deviceScale * 0.1);
                    scene.add(leftDumbbell);
                    modelsLoaded++;
                    
                    // Create right dumbbell
                    rightDumbbell = gltf.scene.clone();
                    rightDumbbell.position.set(3, 0, 0);
                    rightDumbbell.rotation.x = 0.3;
                    rightDumbbell.rotation.z = 0.2;
                    rightDumbbell.scale.set(deviceScale * 0.1, deviceScale * 0.1, deviceScale * 0.1);
                    scene.add(rightDumbbell);
                    modelsLoaded++;
                    
                    console.log("Both dumbbells created from loaded model");
                    clearTimeout(modelLoadTimeout);
                    canvasContainer.removeChild(loaderElement);
                    startAnimation();
                },
                // Progress callback
                function(xhr) {
                    const percent = xhr.loaded / xhr.total * 100;
                    console.log(`Loading model: ${percent.toFixed(2)}% loaded from ${currentPath}`);
                },
                // Error callback
                function(absError) {
                    console.error(`Error loading model from ${currentPath}:`, absError);
                    // Try next path
                    tryAbsolutePath(pathIndex + 1);
                }
            );
        }
    } else {
        console.warn("GLTFLoader not available, using programmatic dumbbells");
        createProgrammaticDumbbells();
    }
    
    // Fallback to programmatic dumbbells
    function createProgrammaticDumbbells() {
        console.log("Creating programmatic dumbbell models");
        leftDumbbell = createDumbbell(deviceScale * 1.2);
        leftDumbbell.position.x = -3;
        leftDumbbell.position.y = 0;
        leftDumbbell.rotation.x = 0.3;
        leftDumbbell.rotation.z = -0.2;
        scene.add(leftDumbbell);

        rightDumbbell = createDumbbell(deviceScale * 1.2);
        rightDumbbell.position.x = 3;
        rightDumbbell.position.y = 0;
        rightDumbbell.rotation.x = 0.3;
        rightDumbbell.rotation.z = 0.2;
        scene.add(rightDumbbell);
        
        // Start animation immediately with programmatic models
        startAnimation();
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        const { width, height } = updateSize();
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        
        // Update dumbbell scale on resize
        const newScale = window.innerWidth <= 768 ? 3.6 : 4.5;
        if (leftDumbbell && rightDumbbell) {
            if (hasGLTFLoader && modelsLoaded === 2) {
                // For GLTF models
                const scaleValue = newScale * 0.1 / deviceScale;
                leftDumbbell.scale.set(scaleValue, scaleValue, scaleValue);
                rightDumbbell.scale.set(scaleValue, scaleValue, scaleValue);
            } else {
                // For programmatic models
                updateDumbbellScale(leftDumbbell, newScale);
                updateDumbbellScale(rightDumbbell, newScale);
            }
        }
    });

    // Function to update dumbbell scale
    function updateDumbbellScale(dumbbell, scale) {
        dumbbell.scale.set(scale/deviceScale, scale/deviceScale, scale/deviceScale);
    }

    // Smooth scroll animation with enhanced separation
    let scrollProgress = 0;
    let targetScrollProgress = 0;
    
    window.addEventListener('scroll', () => {
        // Calculate scroll progress with a more dramatic effect
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        
        // Enhance the effect by making it more sensitive to initial scrolling
        targetScrollProgress = Math.min(1, Math.pow(scrollTop / (scrollHeight * 0.6), 1.2));
        
        // Add 'scrolled' class for text fade effect
        const animationContainer = document.querySelector('.animation-container');
        const animationIntro = document.querySelector('.animation-intro');
        
        if (animationContainer && animationIntro) {
            const containerRect = animationContainer.getBoundingClientRect();
            if (containerRect.top < 0) {
                animationContainer.classList.add('scrolled');
            } else {
                animationContainer.classList.remove('scrolled');
            }
        }
    });

    // Start animation function
    function startAnimation() {
        console.log("Starting dumbbell animation");
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Smooth interpolation for scroll progress
            scrollProgress += (targetScrollProgress - scrollProgress) * 0.05;
            
            // Rotation animation (independent of scroll for continuous movement)
            const time = Date.now() * 0.001;
            
            if (leftDumbbell && rightDumbbell) {
                // Left dumbbell animation
                leftDumbbell.rotation.y = Math.sin(time * 0.3) * 0.2 - 0.2;
                if (!hasGLTFLoader || modelsLoaded < 2) {
                    // Only adjust position if using programmatic model
                    leftDumbbell.position.y = Math.sin(time * 0.5) * 0.15;
                }
                
                // Right dumbbell animation
                rightDumbbell.rotation.y = -Math.sin(time * 0.3) * 0.2 + 0.2;
                if (!hasGLTFLoader || modelsLoaded < 2) {
                    // Only adjust position if using programmatic model
                    rightDumbbell.position.y = Math.sin(time * 0.5 + 1) * 0.15;
                }
                
                // Enhanced scroll-based movement with nonlinear effect
                const moveX = Math.pow(scrollProgress, 1.5) * 4.5; // More dramatic movement
                
                leftDumbbell.position.x = -3 - moveX;
                rightDumbbell.position.x = 3 + moveX;
                
                // Add rotation as dumbbells separate
                leftDumbbell.rotation.z = -0.2 - scrollProgress * 0.5;
                rightDumbbell.rotation.z = 0.2 + scrollProgress * 0.5;
                
                // Scale down slightly as they move apart for perspective effect
                const scaleEffect = 1 - scrollProgress * 0.15;
                if (hasGLTFLoader && modelsLoaded === 2) {
                    // For GLTF models, maintain base scale
                    const baseScale = deviceScale * 0.1;
                    leftDumbbell.scale.set(baseScale * scaleEffect, baseScale * scaleEffect, baseScale * scaleEffect);
                    rightDumbbell.scale.set(baseScale * scaleEffect, baseScale * scaleEffect, baseScale * scaleEffect);
                } else {
                    // For programmatic models
                    leftDumbbell.scale.set(scaleEffect, scaleEffect, scaleEffect);
                    rightDumbbell.scale.set(scaleEffect, scaleEffect, scaleEffect);
                }
            }
            
            // Render the scene
            renderer.render(scene, camera);
        }

        animate();
    }
}

// Function to create a more detailed dumbbell 3D model
function createDumbbell(scale = 1) {
    const group = new THREE.Group();
    
    // Bar - increase size and detail
    const barGeometry = new THREE.CylinderGeometry(0.12 * scale, 0.12 * scale, 3 * scale, 32);
    const barMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x555555,
        metalness: 0.9,
        roughness: 0.3
    });
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.castShadow = true;
    bar.receiveShadow = true;
    group.add(bar);
    
    // Handle grips - add texture to the middle part of the bar
    const gripGeometry = new THREE.CylinderGeometry(0.15 * scale, 0.15 * scale, 0.8 * scale, 32);
    const gripMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        metalness: 0.5,
        roughness: 0.9
    });
    const grip = new THREE.Mesh(gripGeometry, gripMaterial);
    grip.castShadow = true;
    group.add(grip);
    
    // Weight discs (using TorusGeometry for more realistic weights)
    const weightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff5e14, // Primary orange color
        metalness: 0.6,
        roughness: 0.2
    });
    
    // Left weights - multiple discs for realism
    const leftWeightPositions = [-1.4, -1.2, -1.0]; // Positions for the weight discs
    leftWeightPositions.forEach((pos, index) => {
        const size = index === 0 ? 0.7 : (index === 1 ? 0.6 : 0.5); // Different sizes
        const weightGeometry = new THREE.CylinderGeometry(size * scale, size * scale, 0.18 * scale, 32);
        const weight = new THREE.Mesh(weightGeometry, weightMaterial);
        weight.position.x = pos * scale;
        weight.castShadow = true;
        weight.receiveShadow = true;
        group.add(weight);
    });
    
    // Right weights - multiple discs for realism
    const rightWeightPositions = [1.4, 1.2, 1.0]; // Positions for the weight discs
    rightWeightPositions.forEach((pos, index) => {
        const size = index === 0 ? 0.7 : (index === 1 ? 0.6 : 0.5); // Different sizes
        const weightGeometry = new THREE.CylinderGeometry(size * scale, size * scale, 0.18 * scale, 32);
        const weight = new THREE.Mesh(weightGeometry, weightMaterial);
        weight.position.x = pos * scale;
        weight.castShadow = true;
        weight.receiveShadow = true;
        group.add(weight);
    });
    
    // Weight collars - the metal pieces that secure the weights
    const collarGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.2 * scale, 0.1 * scale, 32);
    const collarMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.1
    });
    
    // Left collar
    const leftCollar = new THREE.Mesh(collarGeometry, collarMaterial);
    leftCollar.position.x = -0.8 * scale;
    leftCollar.castShadow = true;
    group.add(leftCollar);
    
    // Right collar
    const rightCollar = new THREE.Mesh(collarGeometry, collarMaterial);
    rightCollar.position.x = 0.8 * scale;
    rightCollar.castShadow = true;
    group.add(rightCollar);
    
    return group;
}

// Function to load dumbbell GLTF model instead of creating it programmatically
function loadDumbbellModel(scene, position, scale = 1, callback) {
    // Create loader instance
    let loader;
    
    // Check if GLTFLoader is available as a module or global
    if (typeof THREE.GLTFLoader !== 'undefined') {
        loader = new THREE.GLTFLoader();
        loadModel();
    } else if (typeof GLTFLoader !== 'undefined') {
        // Try direct access if imported as module
        loader = new GLTFLoader();
        loadModel();
    } else {
        // Dynamically load the GLTFLoader script
        console.log("Loading GLTFLoader script...");
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';
        script.onload = () => {
            console.log("GLTFLoader loaded successfully");
            // Try to get the loader based on how it was imported
            try {
                if (typeof THREE.GLTFLoader === 'function') {
                    loader = new THREE.GLTFLoader();
                } else if (typeof GLTFLoader === 'function') {
                    loader = new GLTFLoader();
                } else {
                    throw new Error("GLTFLoader not found after loading script");
                }
                loadModel();
            } catch (error) {
                console.error("Error initializing GLTFLoader:", error);
                // Fallback to programmatic creation
                const fallbackModel = createDumbbell(scale);
                fallbackModel.position.set(position.x, position.y, position.z);
                scene.add(fallbackModel);
                if (callback) callback(fallbackModel);
            }
        };
        script.onerror = (error) => {
            console.error("Failed to load GLTFLoader:", error);
            // Fallback to programmatic creation
            const fallbackModel = createDumbbell(scale);
            fallbackModel.position.set(position.x, position.y, position.z);
            scene.add(fallbackModel);
            if (callback) callback(fallbackModel);
        };
        document.head.appendChild(script);
        return;
    }
    
    function loadModel() {
        console.log("Attempting to load dumbbell model...");
        // Use the exact path specified by the user
        const modelPath = 'D:\\WEB\\PROJJ\\dumbbell-animation\\dumbbells.glb';
        console.log(`Trying to load model from: ${modelPath}`);
        
        loader.load(
            modelPath,
            // Success callback
            function(gltf) {
                console.log(`Model loaded successfully from ${modelPath}`);
                const model = gltf.scene;
                
                // Apply position and scale
                model.position.set(position.x, position.y, position.z);
                model.scale.set(scale, scale, scale);
                
                // Set shadows for all meshes
                model.traverse(function(node) {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                        
                        // Update materials for orange weights
                        if (node.name.includes('Weight') || node.name.includes('Plate')) {
                            node.material.color.set(0xff5e14);
                            node.material.metalness = 0.6;
                            node.material.roughness = 0.2;
                            node.material.emissive.set(0xff5e14);
                            node.material.emissiveIntensity = 0.1;
                        }
                        
                        console.log(`Found mesh: ${node.name}`);
                    }
                });
                
                scene.add(model);
                
                if (callback) callback(model);
            },
            // Progress callback
            function(xhr) {
                const percent = xhr.loaded / xhr.total * 100;
                console.log(`Loading model: ${percent.toFixed(2)}% loaded from ${modelPath}`);
            },
            // Error callback
            function(error) {
                console.error(`Error loading model from ${modelPath}:`, error);
                // Try absolute path provided by user
                const absolutePath = 'D:/WEB/PROJJ/dumbbell-animation/dumbbells.glb';
                console.log("Trying absolute path:", absolutePath);
                loader.load(
                    absolutePath,
                    function(gltf) {
                        console.log("Model loaded successfully from absolute path!");
                        
                        // Create left dumbbell
                        leftDumbbell = gltf.scene.clone();
                        leftDumbbell.position.set(-3, 0, 0);
                        leftDumbbell.rotation.x = 0.3;
                        leftDumbbell.rotation.z = -0.2;
                        leftDumbbell.scale.set(deviceScale * 0.1, deviceScale * 0.1, deviceScale * 0.1);
                        scene.add(leftDumbbell);
                        modelsLoaded++;
                        
                        // Create right dumbbell
                        rightDumbbell = gltf.scene.clone();
                        rightDumbbell.position.set(3, 0, 0);
                        rightDumbbell.rotation.x = 0.3;
                        rightDumbbell.rotation.z = 0.2;
                        rightDumbbell.scale.set(deviceScale * 0.1, deviceScale * 0.1, deviceScale * 0.1);
                        scene.add(rightDumbbell);
                        modelsLoaded++;
                        
                        console.log("Both dumbbells created from loaded model (absolute path)");
                        clearTimeout(modelLoadTimeout);
                        canvasContainer.removeChild(loaderElement);
                        startAnimation();
                    },
                    // Inner progress callback
                    function(xhr) {
                        const percent = xhr.loaded / xhr.total * 100;
                        console.log(`Loading model (absolute): ${percent.toFixed(2)}% loaded`);
                    },
                    // Inner error callback - try another path
                    function(absError) {
                        console.error("Error loading model from absolute path:", absError);
                        // Try alternate path
                        console.log("Trying alternate relative path...");
                        tryAlternatePath();
                    }
                );
            }
        );
    }
}

// Create Forge Cursor Animation
document.addEventListener('DOMContentLoaded', () => {
    // Enable the custom cursor if not on mobile
    const useFancyCursor = true; // Set to true to enable the custom cursor
    
    if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
        if (useFancyCursor) {
            // Initialize the custom cursor
            initializeCustomCursor();
        } else {
            // Restore normal cursor functionality and hide cursor elements
            document.body.style.cursor = 'auto';
            const cursorContainer = document.querySelector('.custom-cursor-container');
            if (cursorContainer) {
                cursorContainer.style.display = 'none';
            }
        }
        
        // Initialize the 3D forge model regardless of cursor choice
        initializeForgeModel();
    }
    
    // Initialize interactive elements that should work with clicks
    initializeModalHandlers();
});

// Custom cursor implementation
function initializeCustomCursor() {
    const cursorContainer = document.querySelector('.custom-cursor-container');
    const cursor = document.querySelector('.cursor');
    
    if (!cursorContainer || !cursor) return;
    
    // Create cursor trails
    const trailCount = 10;
    const trails = [];
    
    for (let i = 0; i < trailCount; i++) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.opacity = 1 - (i / trailCount);
        trail.style.pointerEvents = 'none'; // Ensure trails don't block clicks
        cursorContainer.appendChild(trail);
        trails.push({
            element: trail,
            x: 0,
            y: 0
        });
    }
    
    // Create sparks/ember particles
    function createSpark(x, y) {
        const spark = document.createElement('div');
        spark.className = 'cursor-trail';
        spark.style.width = Math.random() * 6 + 3 + 'px';
        spark.style.height = spark.style.width;
        spark.style.backgroundColor = `rgba(255, ${Math.floor(Math.random() * 100) + 50}, 20, ${Math.random() * 0.5 + 0.2})`;
        spark.style.position = 'fixed';
        spark.style.left = x + 'px';
        spark.style.top = y + 'px';
        spark.style.transition = 'none';
        spark.style.zIndex = '9997';
        spark.style.pointerEvents = 'none'; // Ensure sparks don't block clicks
        
        cursorContainer.appendChild(spark);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 60 + 30;
        const lifetime = Math.random() * 1000 + 500;
        
        let sparkX = x;
        let sparkY = y;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        let then = performance.now();
        
        function animateSpark(now) {
            const delta = (now - then) / 1000;
            then = now;
            
            sparkX += vx * delta;
            sparkY += vy * delta - 50 * delta * delta; // Add gravity
            
            spark.style.left = sparkX + 'px';
            spark.style.top = sparkY + 'px';
            spark.style.opacity = spark.style.opacity * 0.95;
            
            if (spark.style.opacity > 0.05) {
                requestAnimationFrame(animateSpark);
            } else {
                spark.remove();
            }
        }
        
        requestAnimationFrame(animateSpark);
        
        setTimeout(() => {
            spark.remove();
        }, lifetime);
    }
    
    // Main cursor position
    let cursorX = 0;
    let cursorY = 0;
    
    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        // Randomly create sparks while moving (reduce frequency for performance)
        if (Math.random() < 0.03) {
            createSpark(cursorX, cursorY);
        }
    });
    
    // Update trail positions with delay
    function updateTrails() {
        for (let i = trails.length - 1; i > 0; i--) {
            trails[i].x = trails[i - 1].x;
            trails[i].y = trails[i - 1].y;
        }
        
        trails[0].x = cursorX;
        trails[0].y = cursorY;
        
        trails.forEach((trail, index) => {
            trail.element.style.left = trail.x + 'px';
            trail.element.style.top = trail.y + 'px';
        });
        
        requestAnimationFrame(updateTrails);
    }
    
    updateTrails();
    
    // Special handling for navbar elements to prevent glitching
    const navbarItems = document.querySelectorAll('.navbar ul li a, .hamburger');
    navbarItems.forEach(item => {
        item.style.position = 'relative';
        item.style.zIndex = '9999';
        
        // Explicitly pass click events through
        item.addEventListener('click', (e) => {
            e.stopPropagation();
        }, { passive: false });
    });
    
    // Hover effect on interactive elements - better handling for clicks
    const interactiveElements = document.querySelectorAll('a, button, .btn, .forge-text, .membership-card, .btn-join, .filter-btn, .close-modal, #cartToggle, #nightModeToggle, .cart-item-remove');
    
    interactiveElements.forEach(element => {
        // Ensure element has proper cursor style
        element.style.cursor = 'pointer';
        
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            
            // Create multiple sparks on hover
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    createSpark(cursorX, cursorY);
                }, i * 50);
            }
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
    
    // Fix for Safari and some browsers
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
    
    // Ensure body cursor is properly set
    document.body.style.cursor = 'none';
    
    // Click effect
    document.addEventListener('mousedown', () => {
        cursor.classList.add('click');
        
        // Create burst of sparks on click
        for (let i = 0; i < 15; i++) {
            createSpark(cursorX, cursorY);
        }
        
        // Use a subtle scale effect on the cursor instead of screen shake
        cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
            cursor.style.transform = 'translate(-50%, -50%)';
        }, 50);
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('click');
    });
}

// Initialize the 3D forge model
function initializeForgeModel() {
    const modelContainer = document.getElementById('forgeModelContainer');
    if (!modelContainer) return;
    
    // Create a renderer
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true
    });
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 0);
    modelContainer.appendChild(renderer.domElement);
    
    // Create a scene
    const scene = new THREE.Scene();
    
    // Create a camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;
    
    // Create lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xff5e14, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xff5e14, 1, 10);
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);
    
    // Create an anvil model
    const anvilGroup = new THREE.Group();
    scene.add(anvilGroup);
    
    // Base of the anvil
    const baseGeometry = new THREE.BoxGeometry(3, 0.5, 1.2);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        metalness: 0.7,
        roughness: 0.2
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1.25;
    anvilGroup.add(base);
    
    // Middle section
    const middleGeometry = new THREE.BoxGeometry(1, 0.8, 1);
    const middle = new THREE.Mesh(middleGeometry, baseMaterial);
    middle.position.y = -0.6;
    anvilGroup.add(middle);
    
    // Top section
    const topGeometry = new THREE.BoxGeometry(2.5, 0.6, 1);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.8,
        roughness: 0.1
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 0;
    anvilGroup.add(top);
    
    // Horn
    const hornGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
    hornGeometry.rotateZ(Math.PI / 2);
    const horn = new THREE.Mesh(hornGeometry, topMaterial);
    horn.position.set(-1.6, 0, 0);
    anvilGroup.add(horn);
    
    // Create a glowing effect on the anvil
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff5e14,
        transparent: true,
        opacity: 0.2
    });
    
    const glowGeometry = new THREE.BoxGeometry(2.6, 0.7, 1.1);
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 0;
    anvilGroup.add(glow);
    
    // Add some runes or markings to the anvil
    const runeGeometry = new THREE.PlaneGeometry(1.5, 0.3);
    const runeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8840,
        transparent: true,
        opacity: 0.8
    });
    const rune = new THREE.Mesh(runeGeometry, runeMaterial);
    rune.rotation.x = -Math.PI / 2;
    rune.position.y = 0.31;
    anvilGroup.add(rune);
    
    // Add particle effects (sparks and embers)
    const particleCount = 50;
    const particles = new THREE.Group();
    anvilGroup.add(particles);
    
    for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 0.06 + 0.02;
        const particleGeometry = new THREE.SphereGeometry(size, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(
                Math.random() * 0.2 + 0.8, // R: mostly red
                Math.random() * 0.5,       // G: some green
                Math.random() * 0.1        // B: little blue
            ),
            transparent: true,
            opacity: Math.random() * 0.8 + 0.2
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Random initial positions
        particle.position.x = (Math.random() - 0.5) * 2;
        particle.position.y = Math.random() * 0.5 + 0.3;
        particle.position.z = (Math.random() - 0.5) * 2;
        
        // Store velocity for animation
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            Math.random() * 0.05 + 0.02,
            (Math.random() - 0.5) * 0.02
        );
        
        // Store lifetime for fading
        particle.userData.lifetime = Math.random() * 100 + 50;
        particle.userData.age = 0;
        
        particles.add(particle);
    }
    
    // Smoke particles
    const smokeCount = 15;
    const smoke = new THREE.Group();
    anvilGroup.add(smoke);
    
    for (let i = 0; i < smokeCount; i++) {
        const size = Math.random() * 0.3 + 0.1;
        const smokeGeometry = new THREE.SphereGeometry(size, 8, 8);
        const smokeMaterial = new THREE.MeshBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: Math.random() * 0.2 + 0.1
        });
        
        const smokeParticle = new THREE.Mesh(smokeGeometry, smokeMaterial);
        
        // Random initial positions
        smokeParticle.position.x = (Math.random() - 0.5) * 1.5;
        smokeParticle.position.y = Math.random() * 0.5 + 0.5;
        smokeParticle.position.z = (Math.random() - 0.5) * 1.5;
        
        // Store velocity for animation
        smokeParticle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.01,
            Math.random() * 0.01 + 0.005,
            (Math.random() - 0.5) * 0.01
        );
        
        // Store lifetime for fading
        smokeParticle.userData.lifetime = Math.random() * 200 + 100;
        smokeParticle.userData.age = 0;
        
        smoke.add(smokeParticle);
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate the anvil slightly
        anvilGroup.rotation.y += 0.005;
        
        // Pulsating glow
        const pulsate = Math.sin(Date.now() * 0.003) * 0.1 + 0.2;
        glow.material.opacity = pulsate;
        
        // Flickering light
        pointLight.intensity = Math.random() * 0.5 + 0.8;
        
        // Animate particles (sparks/embers)
        particles.children.forEach(particle => {
            // Update position based on velocity
            particle.position.add(particle.userData.velocity);
            
            // Add gravity effect
            particle.userData.velocity.y -= 0.001;
            
            // Increase age
            particle.userData.age++;
            
            // Fade out based on age
            particle.material.opacity = Math.max(0, 1 - (particle.userData.age / particle.userData.lifetime));
            
            // Reset particle if it's expired or fallen too far
            if (particle.userData.age >= particle.userData.lifetime || particle.position.y < -1) {
                particle.position.x = (Math.random() - 0.5) * 2;
                particle.position.y = Math.random() * 0.5 + 0.3;
                particle.position.z = (Math.random() - 0.5) * 2;
                
                particle.userData.velocity.set(
                    (Math.random() - 0.5) * 0.02,
                    Math.random() * 0.05 + 0.02,
                    (Math.random() - 0.5) * 0.02
                );
                
                particle.userData.age = 0;
                particle.material.opacity = Math.random() * 0.8 + 0.2;
            }
        });
        
        // Animate smoke
        smoke.children.forEach(smokeParticle => {
            // Update position based on velocity
            smokeParticle.position.add(smokeParticle.userData.velocity);
            
            // Slow down over time
            smokeParticle.userData.velocity.multiplyScalar(0.99);
            
            // Increase age
            smokeParticle.userData.age++;
            
            // Expand smoke over time
            smokeParticle.scale.multiplyScalar(1.002);
            
            // Fade out based on age
            smokeParticle.material.opacity = Math.max(0, 0.3 - (smokeParticle.userData.age / smokeParticle.userData.lifetime));
            
            // Reset smoke if it's expired
            if (smokeParticle.userData.age >= smokeParticle.userData.lifetime) {
                smokeParticle.position.x = (Math.random() - 0.5) * 1.5;
                smokeParticle.position.y = Math.random() * 0.5 + 0.5;
                smokeParticle.position.z = (Math.random() - 0.5) * 1.5;
                
                smokeParticle.userData.velocity.set(
                    (Math.random() - 0.5) * 0.01,
                    Math.random() * 0.01 + 0.005,
                    (Math.random() - 0.5) * 0.01
                );
                
                smokeParticle.scale.set(1, 1, 1);
                smokeParticle.userData.age = 0;
                smokeParticle.material.opacity = Math.random() * 0.2 + 0.1;
            }
        });
        
        renderer.render(scene, camera);
    }
    
    // Add click event for the strike effect
    const forgeText = document.querySelector('.forge-text');
    if (forgeText) {
        forgeText.addEventListener('click', () => {
            // Create a burst of sparks
            for (let i = 0; i < 20; i++) {
                const particle = particles.children[Math.floor(Math.random() * particles.children.length)];
                
                // Reset position to anvil top
                particle.position.x = (Math.random() - 0.5) * 1;
                particle.position.y = 0.3;
                particle.position.z = (Math.random() - 0.5) * 1;
                
                // Stronger upward velocity for strike
                particle.userData.velocity.set(
                    (Math.random() - 0.5) * 0.1,
                    Math.random() * 0.1 + 0.05,
                    (Math.random() - 0.5) * 0.1
                );
                
                particle.userData.age = 0;
                particle.material.opacity = 1;
            }
            
            // Flash the light
            pointLight.intensity = 2;
            
            // Play sound effect if available
            const hammerSound = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUHh4eHh4qKioqKioqPDw8PDxISEhISEhIXV1dXV1dXV1qampqampqdXV1dXV1dYODg4ODg4ODkZGRkZGRkZGRn5+fn5+fn5+frKysrKysrKy5ubm5ubm5ubm5xsbGxsbGxsbG0dHR0dHR0dHR3d3d3d3d3d3d6urq6urq6urq9PT09PT09PT0//T09PT09PT0AAAAOUlBVENPTU0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5DEAAABdADF2QAAACqAGi/AAAEE5N0jn5CCTJIg3OHiDcHwfB8Hw53xBuEAgEHB8Hwfg+D4Pg+D4PwfB8HwwIILi4Pg+D4Ph+OGDn4PYPmez0TGuCYPA+D4Pn/BAaDkrIAAEAALAAAsIAEAAAUAAHgoHAkWWXqYq/rZmZmJmdnRH/PxBeLpQ4Pnwff7sKjP/+hkkv8xHX9/jQ9DfORdNHSRUXUYUj//x0dZFvSx1kXf/09PTJ9XTzIAAB7BQcFEkwoODmzHMepPJbKnK3ZWd1NcpKUUmElOrcrSalTzOi8WfUolKTyVSj1L0pS/8W5atlFWsmgAAABgAGHQAvoOQFMR4MjMZwGDCUAjZHSEiYjGMEhGYSCOMYlAIoAiQ9MMMDljEx2gQJmGhAYGEBgAEDgcMCCQGCAwUAhWMoTAYaFlgwCCgkMFwIDKYYMCAAMNBA8AggPzBcoKFJaHiH4AAAB4tQYNDDwQMGHwwECBQABAA0BzDyEMjLEwIMDAIMAhswcBDA44BBgUgE4A+BioeadmEDhigMGAgoADDwQHBEKmBhMYgEhhQTGAAmYIj5gEBhIIGFIUYrj5gAvGABeYPFAMBTLAtMdAYw8EAYGmChwCA0CwDMS04wyHzAoSMCCkwKIzAEDMRRkwXKTCFJMRx4MFzC4BMLBU1hezJU0MJTEw7BgAYeEpkMJGOQIVCpgwKGGQiYGg5gsGGAQaYGFxrY8GtD+aJBRV+ZhwLmXDEanNRuE9GU7mSDGeYOpvQ1mPbcaJK5pZlnUTGZyNRvsvmpLGcX3ZmK1nF4sdm1ZtLTHXnkazQ9i7d67aWAAA8DAAAALqAAABAAAAKnkRAVAAAAAA8AAAABc6wW9avx5avLm+v7OD4UiAEnxKRo4FAAACH+eHgEP/++D4Ph8Xf/4Pnw4g3B8Hwfg+IAACIQAAAAADngAAEQAAAAvMiICoAAAAAHgAAAAN7Caq3a3pautrZvquqgwf/7UMQKgAJaAtHnc8AAAAA0I+AAAQUIicZTiESigAGAMPuCYWFoXBzKCE7q2XqVWoAAFAAAAADA5AAARAAAACjbRAAUAAAAADwAAAACfQoGDh5YjGQ5V0wJMjLUoN3Ik0OMjIEwMCDEI6MgnU1qOzBwiMEn0xKODSJnNSiEeB40qXDL4FNJnkUmU1ibTJgyM7jQwaADMYwMSkIxAKAQEGA4iYRh5g0NAwAYgC5hQymJAKYKDRhEpGKQAYdAZhIGmFi8YzEINAZqQ5BIKmAgqZZN5oA2msS+SBqBopJACwgCTBwhMcm0MgoweBQMDTBQ+Ma0QyAZzO1jNh0s36YAQGDRtSUF4FAAOoXAJiaAmJYiYrIRiVkmMouY6NBjSPmFQiYimoVAIrAJgEMGBQmYLDxgWMGFRQSgswCLDSF5NUSU2oQDMoGNPHcCAovB4HCwXEAUNQkc2JczHVpMLAcwQSzBYvMXlkyZPzS4xMOwkyuEjH44MbCsKAAwCMQIEzHocMhjkwQQDHEADwDMPh0vCgwGMzMclMUXY1FPhmVs0FnzVmINbQ00mljXlLMuFA2g8TWibN2q81qQAzjdwsozEQ+Mv101KMjVFpNxgQy8GAIJnW7McCI2hMDQJqKR82+pDY4/MUAc20AjNzULglYgAAABQT//vwxCEACrQDT9+KgAAAANIPgAAAVJRU1FTAAAA//sQxCmADuwTRd3dAAAAAA0g8AAAAQo=');
            hammerSound.volume = 0.5;
            hammerSound.play().catch(e => console.log("Sound not allowed without user interaction"));
        });
    }
    
    animate();
    
    // Add responsive handling
    window.addEventListener('resize', () => {
        const width = Math.min(300, modelContainer.clientWidth);
        const height = width;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
    });
}

// Initialize modal handlers to ensure clicks work
function initializeModalHandlers() {
    // Payment Modal handlers
    const paymentModal = document.getElementById('paymentModal');
    const successModal = document.getElementById('successModal');
    const cartModal = document.getElementById('cartModal');
    
    // Membership card click handlers
    const membershipCards = document.querySelectorAll('.membership-card');
    membershipCards.forEach(card => {
        const selectBtn = card.querySelector('.btn-join');
        if (selectBtn) {
            selectBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Get the membership title
                const membershipTitle = card.querySelector('h3').textContent;
                
                // Show the payment modal
                if (paymentModal) {
                    paymentModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                    
                    // Select the correct membership in the dropdown
                    const membershipSelect = document.getElementById('membership');
                    if (membershipSelect) {
                        if (membershipTitle.includes('Basic')) {
                            membershipSelect.value = 'basic';
                        } else if (membershipTitle.includes('Black Card')) {
                            membershipSelect.value = 'black';
                        }
                    }
                }
            });
        }
    });
    
    // Close modal handlers
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.payment-modal, .cart-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Close success modal
    const closeSuccessBtn = document.getElementById('closeSuccessModal');
    if (closeSuccessBtn && successModal) {
        closeSuccessBtn.addEventListener('click', function() {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Payment form submission
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm && paymentModal && successModal) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Hide payment modal
            paymentModal.style.display = 'none';
            
            // Show success modal
            successModal.style.display = 'flex';
        });
    }
    
    // Handle cart modal
    const cartToggle = document.getElementById('cartToggle');
    if (cartToggle && cartModal) {
        cartToggle.addEventListener('click', function() {
            cartModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (e.target === successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Function to try the relative path as fallback
function tryAlternatePath() {
    loader.load(
        'dumbbell-animation/dumbbells.glb',
        function(gltf) {
            console.log("Model loaded successfully from relative path!");
            
            // Create left dumbbell
            leftDumbbell = gltf.scene.clone();
            leftDumbbell.position.set(-3, 0, 0);
            leftDumbbell.rotation.x = 0.3;
            leftDumbbell.rotation.z = -0.2;
            leftDumbbell.scale.set(deviceScale * 0.1, deviceScale * 0.1, deviceScale * 0.1);
            scene.add(leftDumbbell);
            modelsLoaded++;
            
            // Create right dumbbell
            rightDumbbell = gltf.scene.clone();
            rightDumbbell.position.set(3, 0, 0);
            rightDumbbell.rotation.x = 0.3;
            rightDumbbell.rotation.z = 0.2;
            rightDumbbell.scale.set(deviceScale * 0.1, deviceScale * 0.1, deviceScale * 0.1);
            scene.add(rightDumbbell);
            modelsLoaded++;
            
            console.log("Both dumbbells created from loaded model (relative path)");
            clearTimeout(modelLoadTimeout);
            canvasContainer.removeChild(loaderElement);
            startAnimation();
        },
        // Inner progress callback
        function(xhr) {
            const percent = xhr.loaded / xhr.total * 100;
            console.log(`Loading model (relative): ${percent.toFixed(2)}% loaded`);
        },
        // Inner error callback - final fallback to programmatic
        function(relError) {
            console.error("Error loading model from relative path:", relError);
            console.log("All path attempts failed, falling back to programmatic model");
            createProgrammaticDumbbells();
        }
    );
}