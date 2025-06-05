const express = require('express');
const classController = require('./classes.controller');
const authController = require('./users.controller');

const router = express.Router();

// Public routes
router.get('/', classController.getAllClasses);
router.get('/:id', classController.getClass);

// Protected routes - require authentication
router.use(authController.protect);

// Classes a user is enrolled in
router.get('/user/:userId?', classController.getUserClasses);

// Class enrollment
router.post('/:id/enroll', classController.enrollClass);
router.delete('/:id/enrollment', classController.cancelEnrollment);

// Trainer classes
router.get('/trainer/:trainerId', classController.getTrainerClasses);

// Admin & trainer routes
router.use(authController.restrictTo('admin', 'trainer'));

// Create and manage classes
router.post('/', classController.createClass);
router.post('/:id/attendance', classController.markAttendance);
router.patch('/:id', classController.updateClass);

// Admin only routes
router.use(authController.restrictTo('admin'));
router.delete('/:id', classController.deleteClass);

module.exports = router; 