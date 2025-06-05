const express = require('express');
const notificationController = require('./notifications.controller');
const authController = require('./users.controller');

const router = express.Router();

// All notification routes require authentication
router.use(authController.protect);

// Dashboard and analytics
router.get('/dashboard', notificationController.getDashboard);
router.get('/counts', notificationController.getUnreadCounts);

// User notification management
router.get('/', notificationController.getMyNotifications);
router.get('/:id', notificationController.getNotification);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.delete('/read', notificationController.deleteAllRead);

// Admin only routes
router.use(authController.restrictTo('admin'));

router.post('/system', notificationController.sendSystemNotification);
router.post('/broadcast', notificationController.broadcastNotification);
router.post('/role', notificationController.scheduleNotificationForRole);
router.post('/cleanup', notificationController.cleanupOldNotifications);

module.exports = router; 