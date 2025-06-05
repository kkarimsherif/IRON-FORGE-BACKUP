const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Protect routes - only allow authenticated users
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 1) Get token from Authorization header or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token from Bearer token format
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      // Get token from cookies if available
      token = req.cookies.jwt;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in. Please log in to get access.'
      });
    }
    
    // 2) Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }
    
    // 4) Check if user changed password after the token was issued
    // This functionality can be added if needed
    
    // Grant access to protected route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your token has expired. Please log in again.'
      });
    }
    
    next(err);
  }
};

/**
 * Restrict access to certain roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Roles is an array ['admin', 'trainer']
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }
    
    next();
  };
}; 