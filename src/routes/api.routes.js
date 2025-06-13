const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/constants');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Product routes
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);

// Protected routes
router.use(protect);
router.post('/bmi/save', require('../controllers/bmi.controller').saveBmiResult);

// Admin only routes
router.use('/admin', protect, authorize(ROLES.ADMIN));
router.post('/admin/products', productController.createProduct);
router.put('/admin/products/:id', productController.updateProduct);
router.delete('/admin/products/:id', productController.deleteProduct);

module.exports = router; 