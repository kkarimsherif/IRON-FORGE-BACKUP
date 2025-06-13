/**
 * Data Validation Middleware and Helpers
 * Provides validation functions for data before database operations
 */

/**
 * Validates required fields in the request body
 * @param {Object} req - Express request object
 * @param {Array} fields - Array of required field names
 * @returns {Object} - Object with isValid boolean and error message
 */
const validateRequiredFields = (req, fields) => {
  const missingFields = fields.filter(field => {
    return req.body[field] === undefined || req.body[field] === null || 
           (typeof req.body[field] === 'string' && req.body[field].trim() === '');
  });
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  return { isValid: true };
};

/**
 * Validates email format
 * @param {String} email - Email to validate
 * @returns {Boolean} - True if valid, false otherwise
 */
const validateEmail = (email) => {
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(String(email).toLowerCase());
};

/**
 * Validates password strength
 * @param {String} password - Password to validate
 * @returns {Object} - Object with isValid boolean and error message
 */
const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      error: 'Password is required'
    };
  }
  
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long'
    };
  }
  
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number'
    };
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one letter'
    };
  }
  
  return { isValid: true };
};

/**
 * Express middleware to validate request body against a schema
 * @param {Object} schema - Object with field names and validation functions
 * @returns {Function} - Express middleware function
 */
const validateSchema = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const [field, validation] of Object.entries(schema)) {
      if (req.body[field] !== undefined) {
        const result = validation(req.body[field]);
        if (!result.isValid) {
          errors.push(`${field}: ${result.error}`);
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

/**
 * Middleware for validating user registration
 */
const validateUserRegistration = (req, res, next) => {
  // Check required fields
  const requiredFields = ['name', 'email', 'password', 'passwordConfirm'];
  const fieldsCheck = validateRequiredFields(req, requiredFields);
  
  if (!fieldsCheck.isValid) {
    return res.status(400).json({
      status: 'fail',
      message: fieldsCheck.error
    });
  }
  
  // Validate email
  if (!validateEmail(req.body.email)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a valid email address'
    });
  }
  
  // Validate password
  const passwordCheck = validatePassword(req.body.password);
  if (!passwordCheck.isValid) {
    return res.status(400).json({
      status: 'fail',
      message: passwordCheck.error
    });
  }
  
  // Check if passwords match
  if (req.body.password !== req.body.passwordConfirm) {
    return res.status(400).json({
      status: 'fail',
      message: 'Passwords do not match'
    });
  }
  
  // If all validations pass, proceed
  next();
};

/**
 * Middleware for validating class creation/update
 */
const validateClass = (req, res, next) => {
  // Check required fields
  const requiredFields = ['name', 'description', 'type', 'duration', 'difficulty', 'capacity', 'instructor'];
  const fieldsCheck = validateRequiredFields(req, requiredFields);
  
  if (!fieldsCheck.isValid) {
    return res.status(400).json({
      status: 'fail',
      message: fieldsCheck.error
    });
  }
  
  // Validate class type
  const validTypes = ['yoga', 'cardio', 'strength', 'hiit', 'pilates', 'cycling', 'dance', 'martial-arts', 'other'];
  if (req.body.type && !validTypes.includes(req.body.type)) {
    return res.status(400).json({
      status: 'fail',
      message: `Type must be one of: ${validTypes.join(', ')}`
    });
  }
  
  // Validate difficulty
  const validDifficulties = ['beginner', 'intermediate', 'advanced', 'all-levels'];
  if (req.body.difficulty && !validDifficulties.includes(req.body.difficulty)) {
    return res.status(400).json({
      status: 'fail',
      message: `Difficulty must be one of: ${validDifficulties.join(', ')}`
    });
  }
  
  // Validate duration
  if (req.body.duration) {
    const duration = parseInt(req.body.duration);
    if (isNaN(duration) || duration < 15 || duration > 180) {
      return res.status(400).json({
        status: 'fail',
        message: 'Duration must be between 15 and 180 minutes'
      });
    }
  }
  
  // Validate capacity
  if (req.body.capacity) {
    const capacity = parseInt(req.body.capacity);
    if (isNaN(capacity) || capacity < 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'Capacity must be at least 1'
      });
    }
  }
  
  // If all validations pass, proceed
  next();
};

module.exports = {
  validateRequiredFields,
  validateEmail,
  validatePassword,
  validateSchema,
  validateUserRegistration,
  validateClass
}; 