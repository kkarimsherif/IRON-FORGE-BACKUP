const User = require('../models/user.model');
const Order = require('../models/order.model');
const { AppError } = require('../middleware/error.middleware');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Get user dashboard page
 * @route GET /user-dashboard
 */
exports.getUserDashboardPage = (req, res) => {
  // User is available in res.locals.user from checkAuth middleware
  const user = res.locals.user;
  
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

/**
 * Get user profile page
 * @route GET /user-profile
 */
exports.getUserProfilePage = (req, res) => {
  // User is available in res.locals.user from checkAuth middleware
  const user = res.locals.user;
  
  res.render('user-profile', { 
    title: 'IRON-FORGE | My Profile',
    user
  });
};

/**
 * Get user membership page
 * @route GET /user-membership
 */
exports.getUserMembershipPage = (req, res) => {
  // User is available in res.locals.user from checkAuth middleware
  const user = res.locals.user;
  
  res.render('user-membership', { 
    title: 'IRON-FORGE | Membership',
    user
  });
};

/**
 * Get user classes page
 * @route GET /user-classes
 */
exports.getUserClassesPage = (req, res) => {
  // User is available in res.locals.user from checkAuth middleware
  const user = res.locals.user;
  
  // Sample classes
  const classes = [
    {
      id: 1,
      name: 'Strength Training 101',
      date: new Date('2023-12-15T10:00:00'),
      trainer: 'Mike Johnson',
      description: 'Learn the fundamentals of strength training with proper form and technique.'
    },
    {
      id: 2,
      name: 'HIIT Cardio Blast',
      date: new Date('2023-12-17T15:30:00'),
      trainer: 'Sarah Williams',
      description: 'High-intensity interval training to boost your cardio and burn calories.'
    }
  ];
  
  res.render('user-classes', { 
    title: 'IRON-FORGE | My Classes',
    user,
    classes
  });
};

/**
 * Get user orders page
 * @route GET /user-orders
 */
exports.getUserOrdersPage = (req, res) => {
  // User is available in res.locals.user from checkAuth middleware
  const user = res.locals.user;
  
  // Sample orders
  const orders = [
    {
      id: 'ORD12345',
      date: new Date('2023-12-01'),
      amount: 89.98,
      items: [
        { name: 'Weight Lifting Belt', price: 49.99, quantity: 1 },
        { name: 'Protein Shake', price: 19.99, quantity: 2 }
      ],
      status: 'Delivered'
    },
    {
      id: 'ORD12346',
      date: new Date('2023-11-15'),
      amount: 129.99,
      items: [
        { name: 'Workout Gloves', price: 29.99, quantity: 1 },
        { name: 'Resistance Bands Set', price: 49.99, quantity: 1 },
        { name: 'Shaker Bottle', price: 14.99, quantity: 1 }
      ],
      status: 'Processing'
    }
  ];
  
  res.render('user-orders', { 
    title: 'IRON-FORGE | Order History',
    user,
    orders
  });
};

/**
 * Get user notifications page
 * @route GET /user-notifications
 */
exports.getUserNotificationsPage = (req, res) => {
  // User is available in res.locals.user from checkAuth middleware
  const user = res.locals.user;
  
  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: 'New Class Added',
      message: 'A new Yoga class has been added to the schedule.',
      date: new Date('2023-12-01'),
      read: false
    },
    {
      id: 2,
      title: 'Membership Renewal',
      message: 'Your membership will expire in 7 days. Please renew to continue enjoying our services.',
      date: new Date('2023-11-28'),
      read: true
    }
  ];
  
  res.render('user-notifications', { 
    title: 'IRON-FORGE | Notifications',
    user,
    notifications
  });
};

/**
 * Get user profile
 * @route GET /user/profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    // User is already available in req.user from protect middleware
    const user = req.user;
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PUT /user/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    // Fields that are allowed to be updated
    const allowedFields = [
      'name', 
      'email', 
      'phone', 
      'address', 
      'city', 
      'state', 
      'zipCode', 
      'emergencyContact'
    ];
    
    // Create an object with only allowed fields
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });
    
    // Update user
    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user fitness stats
 * @route PUT /user/fitness-stats
 */
exports.updateFitnessStats = async (req, res, next) => {
  try {
    const { height, weight, fitnessGoal } = req.body;
    
    // Calculate BMI if height and weight are provided
    let bmi = null;
    if (height && weight) {
      // BMI = weight (kg) / (height (m))^2
      const heightInMeters = height / 100;
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      
      // Determine BMI category
      let category;
      if (bmiValue < 18.5) {
        category = 'Underweight';
      } else if (bmiValue >= 18.5 && bmiValue < 25) {
        category = 'Normal weight';
      } else if (bmiValue >= 25 && bmiValue < 30) {
        category = 'Overweight';
      } else {
        category = 'Obese';
      }
      
      bmi = {
        value: bmiValue,
        category,
        date: new Date()
      };
    }
    
    // Update user
    const updateData = { height, weight, fitnessGoal };
    if (bmi) {
      updateData.bmi = bmi;
    }
    
    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });
    
    res.status(200).json({
      success: true,
      data: user,
      bmi: user.bmi
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * @route POST /user/change-password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check if current password is correct
    if (!(await user.matchPassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/profile');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

/**
 * Upload profile picture
 * @route POST /user/profile-picture
 */
exports.uploadProfilePicture = upload.single('profilePicture');

/**
 * Save profile picture
 * @route POST /user/profile-picture
 */
exports.saveProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }
    
    // Get relative path for storage in DB
    const relativePath = `/uploads/profile/${path.basename(req.file.path)}`;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: relativePath },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: {
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save BMI result
 * @route POST /user/bmi
 */
exports.saveBmiResult = async (req, res, next) => {
  try {
    // This is handled by the BMI controller
    const bmiController = require('./bmi.controller');
    return bmiController.saveBmiResult(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Get BMI history
 * @route GET /user/bmi
 */
exports.getBmiHistory = async (req, res, next) => {
  try {
    // This is handled by the BMI controller
    const bmiController = require('./bmi.controller');
    return bmiController.getBmiHistory(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user membership
 * @route GET /user/membership
 */
exports.getMembership = async (req, res, next) => {
  try {
    // User is already available in req.user from protect middleware
    const user = req.user;
    
    res.status(200).json({
      success: true,
      data: user.membership,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user membership
 * @route PUT /user/membership
 */
exports.updateMembership = async (req, res, next) => {
  try {
    const { type } = req.body;
    
    if (!type || !['basic', 'black'].includes(type)) {
      return next(new AppError('Invalid membership type', 400));
    }
    
    // Calculate renewal date (1 month from now)
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);
    
    // Update user membership
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        membership: {
          type,
          startDate: new Date(),
          renewalDate,
          active: true,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    
    res.status(200).json({
      success: true,
      data: user.membership,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user order history
 * @route GET /user/orders
 */
exports.getOrderHistory = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order details
 * @route GET /user/orders/:id
 */
exports.getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (admin only)
 * @route GET /user
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID (admin only)
 * @route GET /user/:id
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user (admin only)
 * @route PUT /user/:id
 */
exports.updateUser = async (req, res, next) => {
  try {
    // Fields that are allowed to be updated
    const allowedFields = ['name', 'email', 'role', 'membership'];
    
    // Create an object with only allowed fields
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });
    
    // Update user
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (admin only)
 * @route DELETE /user/:id
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
}; 