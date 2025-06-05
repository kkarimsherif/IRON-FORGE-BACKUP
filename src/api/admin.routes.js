const express = require('express');
const adminController = require('./admin.controller');
const authController = require('./users.controller');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Sales
router.get('/sales', adminController.getSalesStats);
router.get('/sales/products', adminController.getTopSellingProducts);
router.get('/sales/monthly', adminController.getMonthlySales);

// Users
router.get('/users/stats', adminController.getUserStats);
router.get('/users/new', adminController.getNewUsers);

// Inventory
router.get('/inventory/low-stock', adminController.getLowStockProducts);
router.get('/inventory/stock-history/:productId', adminController.getProductStockHistory);

// Classes
router.get('/classes/stats', adminController.getClassStats);
router.get('/classes/attendance', adminController.getClassAttendance);

module.exports = router; 