/**
 * Controller for rendering main pages
 */

// Get home page
exports.getHomePage = (req, res) => {
  // Sample data for the EJS template
  const data = {
    title: 'IRON-FORGE | Forge Your Strength, Shape Your Future',
    services: [
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
        icon: 'fas fa-utensils',
        title: 'Nutrition Plans',
        description: 'Customized meal plans to complement your training regimen.'
      },
      {
        icon: 'fas fa-running',
        title: 'Cardio Zone',
        description: 'State-of-the-art cardio equipment with immersive training experiences.'
      },
      {
        icon: 'fas fa-dumbbell',
        title: 'Strength Training',
        description: 'Comprehensive strength equipment for all levels of lifters.'
      },
      {
        icon: 'fas fa-spa',
        title: 'Recovery Services',
        description: 'Massage, cryotherapy and other recovery modalities.'
      }
    ],
    products: [
      {
        title: 'Weight Lifting Belt',
        price: 49.99,
        image: 'img/Weight Lifting Belt.avif'
      },
      {
        title: 'Lifting Straps',
        price: 19.99,
        image: 'img/Lifting Straps.avif'
      },
      {
        title: 'Whey Protein',
        price: 39.99,
        image: 'img/Whey Protein.png'
      },
      {
        title: 'Shaker Bottle',
        price: 14.99,
        image: 'img/classic-shaker-500-ml-black.avif'
      }
    ],
    testimonials: [
      {
        name: 'Sarah K.',
        memberSince: 'Member since 2020',
        text: 'IRON-FORGE changed my life. The supportive environment and affordable membership helped me lose 50 pounds and gain confidence!',
        image: 'img/background.jpg',
        stars: 5
      },
      {
        name: 'Michael T.',
        memberSince: 'Member since 2021',
        text: 'The Black Card membership is amazing! I can bring my workout buddy anytime and we both love the hydromassage after intense workouts.',
        image: 'img/background.jpg',
        stars: 5
      }
    ],
    contactInfo: {
      address: '123 Fitness Street, Iron District',
      phone: '(555) 123-4567',
      email: 'info@ironforge.com',
      hours: 'Mon-Fri: 5AM - 11PM<br>Sat-Sun: 7AM - 9PM'
    }
  };

  res.render('gym', data);
};

// Get join page
exports.getJoinPage = (req, res) => {
  res.render('join', { title: 'IRON-FORGE | Join Now' });
};

// Get BMI calculator page
exports.getBmiPage = (req, res) => {
  res.render('bmi', { title: 'IRON-FORGE | BMI Calculator' });
};

// Get cart page
exports.getCartPage = (req, res) => {
  res.render('cart', { 
    title: 'IRON-FORGE | Shopping Cart'
  });
};

// Get checkout page
exports.getCheckoutPage = (req, res) => {
  // Sample cart data
  const cart = [
    { id: 1, title: 'Weight Lifting Belt', price: 49.99, quantity: 1 },
    { id: 2, title: 'Whey Protein', price: 39.99, quantity: 2 }
  ];
  
  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 15.00;
  const total = subtotal + shipping;
  
  res.render('checkout', { 
    title: 'IRON-FORGE | Checkout',
    cart,
    subtotal,
    shipping,
    total
  });
};

// Get payment success page
exports.getPaymentSuccessPage = (req, res) => {
  res.render('payment-success', { 
    title: 'IRON-FORGE | Payment Successful',
    order: null // In a real implementation, you would fetch this from the database
  });
};

// Get user dashboard page
exports.getUserDashboardPage = (req, res) => {
  // In a real implementation, you would use the authenticated user from req.user
  // For now, we'll use sample data
  const user = {
    name: 'John Smith',
    email: 'john@example.com',
    membership: {
      type: 'Black Card',
      startDate: new Date('2023-01-01'),
      renewalDate: new Date('2024-01-01')
    },
    bmi: {
      value: '22.5',
      category: 'Normal weight',
      date: new Date('2023-12-01')
    }
  };
  
  // Sample classes
  const classes = [
    {
      id: 1,
      name: 'Strength Training 101',
      date: new Date('2023-12-15T10:00:00'),
      trainer: 'Mike Johnson'
    },
    {
      id: 2,
      name: 'HIIT Cardio Blast',
      date: new Date('2023-12-17T15:30:00'),
      trainer: 'Sarah Williams'
    }
  ];
  
  // Sample orders
  const orders = [
    {
      id: 'ORD12345',
      date: new Date('2023-12-01'),
      amount: 89.98
    },
    {
      id: 'ORD12346',
      date: new Date('2023-11-15'),
      amount: 129.99
    }
  ];
  
  res.render('user-dashboard', { 
    title: 'IRON-FORGE | User Dashboard',
    user,
    classes,
    orders
  });
}; 