const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { AppError } = require('../middleware/error.middleware');
const sendEmail = require('../utils/email');

/**
 * Sign up a new user
 * @route POST /auth/signup
 */
exports.signup = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      address, 
      city, 
      state, 
      zipCode, 
      emergencyContact 
    } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }
    
    // Create new user with all provided fields
    const userData = {
      name,
      email,
      password,
    };

    // Add optional fields if provided
    if (phone) userData.phone = phone;
    if (address) userData.address = address;
    if (city) userData.city = city;
    if (state) userData.state = state;
    if (zipCode) userData.zipCode = zipCode;
    if (emergencyContact) userData.emergencyContact = emergencyContact;
    
    const user = await User.create(userData);
    
    // Generate token
    const token = user.generateAuthToken();
    
    // Set cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };
    
    res.cookie('token', token, cookieOptions);
    
    // Check if request is AJAX or regular form submission
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      // Remove password from output for API response
      user.password = undefined;
      
      return res.status(201).json({
        success: true,
        token,
        data: {
          user,
        },
      });
    }
    
    // For regular form submissions, redirect to home page
    res.redirect('/');
  } catch (error) {
    next(error);
  }
};

/**
 * Log in a user
 * @route POST /auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists and password is correct
    if (!user || !(await user.matchPassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }
    
    // Generate token
    const token = user.generateAuthToken();
    
    // Set cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };
    
    res.cookie('token', token, cookieOptions);
    
    // Check if request is AJAX or regular form submission
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      // Remove password from output for API response
      user.password = undefined;
      
      return res.status(200).json({
        success: true,
        token,
        data: {
          user,
        },
      });
    }
    
    // For regular form submissions, redirect to home page
    res.redirect('/');
  } catch (error) {
    next(error);
  }
};

/**
 * Log out a user
 * @route POST /auth/logout
 */
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });
  
  // Check if request is AJAX or regular form submission
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  }
  
  // For regular form submissions, redirect to home page
  res.redirect('/');
};

/**
 * Refresh authentication token
 * @route POST /auth/refresh-token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;
    
    if (!token) {
      return next(new AppError('Not authenticated', 401));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Generate new token
    const newToken = user.generateAuthToken();
    
    // Set cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };
    
    res.cookie('token', newToken, cookieOptions);
    
    res.status(200).json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 * @route POST /auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      return next(new AppError('There is no user with that email address', 404));
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set token expiry
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save({ validateBeforeSave: false });
    
    // Create reset URL
    const resetURL = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
    
    // Send email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 minutes)',
        message: `Forgot your password? Submit a request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`,
      });
      
      res.status(200).json({
        success: true,
        message: 'Token sent to email',
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      return next(new AppError('There was an error sending the email. Try again later.', 500));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * @route POST /auth/reset-password/:token
 */
exports.resetPassword = async (req, res, next) => {
  try {
    // Get token from params
    const { token } = req.params;
    
    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user by token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    
    // Check if token is valid and not expired
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    
    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();
    
    // Generate token
    const newToken = user.generateAuthToken();
    
    // Set cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };
    
    res.cookie('token', newToken, cookieOptions);
    
    res.status(200).json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * @route POST /auth/change-password
 */
exports.changePassword = async (req, res, next) => {
  try {
    // Get user from database
    const user = await User.findById(req.user.id).select('+password');
    
    // Check if current password is correct
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }
    
    // Update password
    user.password = req.body.newPassword;
    await user.save();
    
    // Generate token
    const token = user.generateAuthToken();
    
    // Set cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };
    
    res.cookie('token', token, cookieOptions);
    
    // Remove password from output
    user.password = undefined;
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}; 