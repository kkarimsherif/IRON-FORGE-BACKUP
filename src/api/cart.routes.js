const express = require('express');
const cartController = require('./cart.controller');
const authController = require('./users.controller');

const router = express.Router();

// All cart routes require authentication
router.use(authController.protect);

// Routes for authenticated users
router.get('/', cartController.getMyCart);
router.post('/items', cartController.addToCart);
router.patch('/items/:productId', cartController.updateCartItem);
router.delete('/items/:productId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router; 