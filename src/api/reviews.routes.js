const express = require('express');
const authController = require('./users.controller');
const reviewController = require('./reviews.controller');

const router = express.Router();

// Public routes for viewing reviews
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReview);

// Protected routes - require authentication
router.use(authController.protect);

// Create review
router.post('/', reviewController.createReview);

// Owner-only routes
router.patch('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

// Admin-only routes
router.use(authController.restrictTo('admin'));

router.get('/pending/moderation', reviewController.getPendingReviews);
router.patch('/:id/moderate', reviewController.moderateReview);
router.post('/:id/respond', reviewController.respondToReview);

module.exports = router; 