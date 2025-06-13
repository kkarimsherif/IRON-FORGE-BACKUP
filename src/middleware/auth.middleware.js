const jwt = require('jsonwebtoken');
const { AppError } = require('./error.middleware');
const User = require('../models/user.model');

/**
 * Middleware to protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth token found in Authorization header');
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Auth token found in cookies');
    }
    
    // Check if token exists
    if (!token) {
      console.log('No auth token - redirecting to login page');
      return res.redirect('/join');
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified, user ID:', decoded.id);
      
      // Find user by id
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('User not found in database - clearing token and redirecting');
        res.clearCookie('token');
        return res.redirect('/join');
      }
      
      console.log('User authenticated:', user.name);
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.clearCookie('token');
      return res.redirect('/join');
    }
  } catch (error) {
    console.error('Auth error:', error.message);
    res.clearCookie('token');
    return res.redirect('/join');
  }
};

/**
 * Middleware to check if user is authenticated and make user available to templates
 * This doesn't block access, just adds user to res.locals if available
 */
const checkAuth = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in Authorization header');
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Token found in cookies');
    }
    
    // If no token, just continue without setting user
    if (!token) {
      console.log('No authentication token found');
      return next();
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified, user ID:', decoded.id);
      
      // Find user by id
      const user = await User.findById(decoded.id);
      if (user) {
        console.log('User found in database:', user.name);
        // Add user to request object and res.locals for templates
        req.user = user;
        res.locals.user = user;
      } else {
        console.log('User not found in database - clearing token');
        res.clearCookie('token');
      }
    } catch (err) {
      // If token verification fails, clear the token
      console.error('Token verification failed:', err.message);
      res.clearCookie('token');
    }
    
    next();
  } catch (error) {
    // If any error occurs, just continue without setting user
    console.error('Error in checkAuth middleware:', error.message);
    res.clearCookie('token');
    next();
  }
};

/**
 * Middleware to restrict routes to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Not authorized to access this route', 403));
    }
    
    next();
  };
};

module.exports = { protect, authorize, checkAuth }; 