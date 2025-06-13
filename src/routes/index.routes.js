const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index.controller');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// Public pages
router.get('/', indexController.getHomePage);
router.get('/join', indexController.getJoinPage);
router.get('/bmi', indexController.getBmiPage);
router.get('/cart', protect, indexController.getCartPage);
router.get('/checkout', protect, indexController.getCheckoutPage);
router.get('/payment-success', indexController.getPaymentSuccessPage);

// Protected user dashboard pages
router.get('/user-dashboard', protect, userController.getUserDashboardPage);
router.get('/user-profile', protect, userController.getUserProfilePage);
router.get('/user-membership', protect, userController.getUserMembershipPage);
router.get('/user-classes', protect, userController.getUserClassesPage);
router.get('/user-orders', protect, userController.getUserOrdersPage);
router.get('/user-notifications', protect, userController.getUserNotificationsPage);

module.exports = router; 