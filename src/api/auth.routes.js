const express = require('express');
const userController = require('./users.controller');
const router = express.Router();

// Authentication routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.post('/forgotPassword', userController.forgotPassword);
router.patch('/resetPassword/:token', userController.resetPassword);

module.exports = router; 