const express = require('express');
const userController = require('./users.controller');
const router = express.Router();

// Authentication routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/logout', userController.logout);

router.post('/forgotPassword', userController.forgotPassword);
router.patch('/resetPassword/:token', userController.resetPassword);

// Protected routes
router.use(userController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.patch('/updateMyPassword', userController.updatePassword);
router.delete('/deleteMe', userController.deleteMe);

// Admin only routes
router.use(userController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// Membership management
router.patch('/:id/membership', userController.updateMembership);

module.exports = router; 