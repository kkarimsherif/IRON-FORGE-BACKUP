const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const { sendNotification } = require('./notifications.controller');

// Create JWT token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Create token and send response
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  
  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  };
  
  // Set cookie
  res.cookie('jwt', token, cookieOptions);
  
  // Remove sensitive data from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

/**
 * Register new user
 * Access: Public
 */
exports.signup = async (req, res, next) => {
  try {
    // Create new user
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role === 'admin' ? 'user' : req.body.role // Prevent creating admin accounts
    });
    
    // Send welcome notification
    await sendNotification({
      title: 'Welcome to Forge-Gym',
      message: `Hi ${newUser.name}, thank you for joining our fitness community. Start exploring our classes and products!`,
      type: 'system',
      user: newUser._id,
      priority: 'normal',
      action: {
        url: '/dashboard',
        text: 'Go to Dashboard'
      }
    });
    
    // Create and send token
    createSendToken(newUser, 201, req, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Login user
 * Access: Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }
    
    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }
    
    // If account is inactive, reactivate it
    if (!user.active) {
      user.active = true;
      await user.save({ validateBeforeSave: false });
      
      await sendNotification({
        title: 'Account Reactivated',
        message: 'Your account has been successfully reactivated. Welcome back!',
        type: 'account',
        user: user._id,
        priority: 'normal'
      });
    }
    
    // Create and send token
    createSendToken(user, 200, req, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Logout user
 * Access: Authenticated users
 */
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });
  
  res.status(200).json({ status: 'success' });
};

/**
 * Protect route - check if user is authenticated
 * Access: Middleware
 */
exports.protect = async (req, res, next) => {
  try {
    // Get token
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access.'
      });
    }
    
    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.'
      });
    }
    
    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'User recently changed password. Please log in again.'
      });
    }
    
    // Grant access to protected route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Restrict to certain roles
 * Access: Middleware
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

/**
 * Forgot password
 * Access: Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    // Get user by email
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'There is no user with this email address.'
      });
    }
    
    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // Create reset URL
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    
    try {
      // In a real app, you would send an email here
      // For our demo, we'll send a notification
      await sendNotification({
        title: 'Password Reset Request',
        message: `You requested a password reset. Click the button below to reset your password. This link is valid for 10 minutes.`,
        type: 'account',
        user: user._id,
        priority: 'high',
        action: {
          url: resetURL,
          text: 'Reset Password'
        }
      });
      
      res.status(200).json({
        status: 'success',
        message: 'Token sent to user via notification.'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the notification. Try again later!'
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Reset password
 * Access: Public (with token)
 */
exports.resetPassword = async (req, res, next) => {
  try {
    // Get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    // If token has expired or invalid token
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is invalid or has expired'
      });
    }
    
    // Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    // Notify user about password change
    await sendNotification({
      title: 'Password Reset Successful',
      message: 'Your password has been changed successfully. If you did not request this change, please contact support immediately.',
      type: 'account',
      user: user._id,
      priority: 'high'
    });
    
    // Log user in, send JWT
    createSendToken(user, 200, req, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Update current user password
 * Access: Authenticated users
 */
exports.updatePassword = async (req, res, next) => {
  try {
    // Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    
    // Check if current password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return res.status(401).json({
        status: 'error',
        message: 'Your current password is wrong'
      });
    }
    
    // If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    
    // Notify user about password change
    await sendNotification({
      title: 'Password Updated',
      message: 'Your password has been changed successfully. If you did not request this change, please contact support immediately.',
      type: 'account',
      user: user._id,
      priority: 'high'
    });
    
    // Log user in, send JWT
    createSendToken(user, 200, req, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Get current user
 * Access: Authenticated users
 */
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

/**
 * Update current user
 * Access: Authenticated users
 */
exports.updateMe = async (req, res, next) => {
  try {
    // Check if user is trying to update password
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'error',
        message: 'This route is not for password updates. Please use /updateMyPassword.'
      });
    }
    
    // Filter out unwanted fields that should not be updated
    const filteredBody = {};
    const allowedFields = ['name', 'email', 'photo', 'phone', 'address'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });
    
    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );
    
    // Send notification about profile update
    await sendNotification({
      title: 'Profile Updated',
      message: 'Your profile information has been updated successfully.',
      type: 'account',
      user: updatedUser._id,
      priority: 'low'
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete current user (deactivate)
 * Access: Authenticated users
 */
exports.deleteMe = async (req, res, next) => {
  try {
    // Set user as inactive
    await User.findByIdAndUpdate(req.user.id, { active: false });
    
    // Notify admins about account deactivation
    const admins = await User.find({ role: 'admin' }).select('_id');
    
    if (admins.length > 0) {
      await sendNotification({
        title: 'Account Deactivation',
        message: `User ${req.user.name} (${req.user.email}) has deactivated their account.`,
        type: 'account',
        user: admins[0]._id,
        priority: 'normal',
        reference: {
          model: 'User',
          id: req.user._id
        }
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all users
 * Access: Admin only
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // Only show active users by default
    if (!queryObj.active) {
      queryObj.active = { $ne: false };
    }
    
    // Convert query to MongoDB format
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    // Build query
    let query = User.find(JSON.parse(queryStr));
    
    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v -password');
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const users = await query;
    const totalCount = await User.countDocuments(JSON.parse(queryStr));
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: {
        users
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user by ID
 * Access: Admin only
 */
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user (admin functionality)
 * Access: Admin only
 */
exports.updateUser = async (req, res, next) => {
  try {
    // Store original user data for comparison
    const originalUser = await User.findById(req.params.id);
    
    if (!originalUser) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that ID'
      });
    }
    
    const originalMembershipType = originalUser.membershipType;
    const originalRole = originalUser.role;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    // Check if membership was changed
    if (req.body.membershipType && req.body.membershipType !== originalMembershipType) {
      await sendNotification({
        title: 'Membership Status Updated',
        message: `Your membership has been changed from ${originalMembershipType} to ${updatedUser.membershipType}.`,
        type: 'account',
        user: updatedUser._id,
        priority: 'high',
        action: {
          url: '/membership',
          text: 'View Membership Details'
        }
      });
    }
    
    // Check if role was changed
    if (req.body.role && req.body.role !== originalRole) {
      await sendNotification({
        title: 'Account Role Updated',
        message: `Your account access level has been updated from ${originalRole} to ${updatedUser.role}.`,
        type: 'account',
        user: updatedUser._id,
        priority: 'high'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete user (admin functionality)
 * Access: Admin only
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that ID'
      });
    }
    
    // Send notification to user about account deletion
    await sendNotification({
      title: 'Account Deleted',
      message: 'Your account has been deleted by an administrator. Please contact support if you have any questions.',
      type: 'account',
      user: user._id,
      priority: 'high'
    });
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user membership
 * Access: Admin only
 */
exports.updateMembership = async (req, res, next) => {
  try {
    const { membershipType, membershipExpires } = req.body;
    
    if (!membershipType) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a membership type'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that ID'
      });
    }
    
    // Store original membership for notification
    const originalMembership = user.membershipType;
    
    // Update membership
    user.membershipType = membershipType;
    
    if (membershipExpires) {
      user.membershipExpires = new Date(membershipExpires);
    } else if (membershipType !== 'none') {
      // Set default expiration to 1 year from now if upgrading
      user.membershipExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }
    
    await user.save();
    
    // Determine notification message based on membership change
    let notificationMessage;
    let notificationTitle;
    let priority = 'normal';
    
    if (originalMembership === 'none' && membershipType !== 'none') {
      // New membership
      notificationTitle = 'Welcome to Forge-Gym Membership!';
      notificationMessage = `You are now a ${membershipType} member. Enjoy your new benefits!`;
      priority = 'high';
    } else if (membershipType === 'none') {
      // Cancelled membership
      notificationTitle = 'Membership Cancelled';
      notificationMessage = 'Your membership has been cancelled. We hope to see you again soon!';
    } else if (originalMembership !== membershipType) {
      // Changed membership type
      notificationTitle = 'Membership Updated';
      notificationMessage = `Your membership has been updated from ${originalMembership} to ${membershipType}.`;
    } else {
      // Extended same membership
      notificationTitle = 'Membership Extended';
      notificationMessage = `Your ${membershipType} membership has been extended until ${user.membershipExpires.toLocaleDateString()}.`;
    }
    
    // Send notification to user
    await sendNotification({
      title: notificationTitle,
      message: notificationMessage,
      type: 'membership',
      user: user._id,
      priority,
      reference: {
        model: 'User',
        id: user._id
      },
      action: {
        url: '/membership',
        text: 'View Membership Details'
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
}; 