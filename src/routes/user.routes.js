const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/constants');

// All user routes require authentication
router.use(protect);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/profile-picture', userController.uploadProfilePicture, userController.saveProfilePicture);
router.post('/change-password', userController.changePassword);
router.put('/fitness-stats', userController.updateFitnessStats);

// BMI routes
router.post('/bmi', userController.saveBmiResult);
router.get('/bmi', userController.getBmiHistory);

// Membership routes
router.get('/membership', userController.getMembership);
router.put('/membership', userController.updateMembership);

// Order history routes
router.get('/orders', userController.getOrderHistory);
router.get('/orders/:id', userController.getOrderDetails);

// Admin only routes
router.use(authorize(ROLES.ADMIN));
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router; 