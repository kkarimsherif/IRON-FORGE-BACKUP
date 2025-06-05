const express = require('express');
const orderController = require('./orders.controller');
const authController = require('./users.controller');

const router = express.Router();

// All order routes require authentication
router.use(authController.protect);

// User order routes
router.get('/myOrders', orderController.getMyOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrder); // Has controller-level permission check

// Admin only routes
router.use(authController.restrictTo('admin'));

router.get('/', orderController.getAllOrders);
router.patch('/:id/status', orderController.updateOrderStatus);
router.patch('/:id/payment', orderController.updatePaymentStatus);
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router; 