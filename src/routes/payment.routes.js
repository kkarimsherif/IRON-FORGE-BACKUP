const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.post('/initiate', paymentController.initiatePayment);
router.post('/webhook', paymentController.handlePaymentWebhook);
router.get('/status/:orderId', paymentController.getPaymentStatus);

// Protected routes
router.use(protect);
router.post('/process', paymentController.processPayment);
router.post('/refund/:orderId', paymentController.refundPayment);

// Admin only routes
router.use(authorize(ROLES.ADMIN));
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);

module.exports = router; 