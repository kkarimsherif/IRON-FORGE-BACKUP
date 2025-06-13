const User = require('../models/user.model');
const { AppError } = require('../middleware/error.middleware');
const { BMI_CATEGORIES } = require('../config/constants');

/**
 * Calculate BMI category
 * @param {number} bmi - BMI value
 * @returns {string} - BMI category
 */
const getBmiCategory = (bmi) => {
  if (bmi < 18.5) {
    return BMI_CATEGORIES.UNDERWEIGHT;
  } else if (bmi >= 18.5 && bmi < 25) {
    return BMI_CATEGORIES.NORMAL;
  } else if (bmi >= 25 && bmi < 30) {
    return BMI_CATEGORIES.OVERWEIGHT;
  } else {
    return BMI_CATEGORIES.OBESE;
  }
};

/**
 * Save BMI result to user profile
 * @route POST /api/bmi/save
 */
exports.saveBmiResult = async (req, res, next) => {
  try {
    const { bmi, category } = req.body;
    
    if (!bmi) {
      return next(new AppError('BMI value is required', 400));
    }
    
    // Get user from request (set by protect middleware)
    const user = req.user;
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Update user BMI data
    user.bmi = {
      value: bmi,
      category: category || getBmiCategory(parseFloat(bmi)),
      date: new Date(),
    };
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user.bmi,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's BMI history
 * @route GET /user/bmi
 */
exports.getBmiHistory = async (req, res, next) => {
  try {
    // Get user from request (set by protect middleware)
    const user = req.user;
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Return BMI data if available
    if (!user.bmi) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.bmi,
    });
  } catch (error) {
    next(error);
  }
}; 