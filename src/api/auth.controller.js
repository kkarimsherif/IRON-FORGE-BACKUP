const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

/**
 * Create and send JWT token
 */
const createSendToken = (user, statusCode, res) => {
  const token = user.generateAuthToken();
  
  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  
  // Set secure flag in production
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
  // Send token as cookie
  res.cookie('jwt', token, cookieOptions);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user
    }
  });
};

/**
 * Sign up a new user
 */
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;
    
    // Check if password and passwordConfirm match
    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }
    
    // Create user
    const newUser = await User.create({
      name,
      email,
      password
    });
    
    // Generate token and send response
    createSendToken(newUser, 201, res);
  } catch (err) {
    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists. Please use a different email.'
      });
    }
    
    next(err);
  }
};

/**
 * Log in a user
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.isPasswordCorrect(password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }
    
    // If everything is ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Log out a user
 */
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Successfully logged out'
  });
};

/**
 * Forgot password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    // Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user with that email address'
      });
    }
    
    // Generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // Send it to user's email (in a real app, use a proper email service)
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    
    try {
      // For now, just return the URL in the response
      // In a real app, you'd send an email with this URL
      res.status(200).json({
        success: true,
        message: 'Token sent to email',
        resetURL // In production, you wouldn't send this in the response
      });
      
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      return res.status(500).json({
        success: false,
        message: 'There was an error sending the email. Try again later!'
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Reset password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    // Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    // If token has not expired, and there is user, set the new password
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired'
      });
    }
    
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    // Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Update current user password
 */
exports.updatePassword = async (req, res, next) => {
  try {
    // Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    
    // Check if POSTed current password is correct
    if (!(await user.isPasswordCorrect(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Your current password is incorrect'
      });
    }
    
    // If so, update password
    user.password = req.body.newPassword;
    await user.save();
    
    // Log user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
}; 