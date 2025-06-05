const express = require('express');
const productController = require('./products.controller');
const authController = require('./users.controller');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProduct);

// Protected routes - Admin only
router.use(authController.protect); 
router.use(authController.restrictTo('admin'));

router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.patch('/:id/stock', productController.updateStock);

module.exports = router; 