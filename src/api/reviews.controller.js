const Review = require('../models/review.model');
const Product = require('../models/product.model');
const Class = require('../models/class.model');
const User = require('../models/user.model');
const Order = require('../models/order.model');
const { sendNotification } = require('./notifications.controller');

/**
 * Get all reviews (with filtering options)
 * Access: Public
 */
exports.getAllReviews = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // Filter by entity type and entity id if provided
    if (req.query.productId) {
      queryObj.entityType = 'Product';
      queryObj.entity = req.query.productId;
    } else if (req.query.classId) {
      queryObj.entityType = 'Class';
      queryObj.entity = req.query.classId;
    } else if (req.query.trainerId) {
      queryObj.entityType = 'User';
      queryObj.entity = req.query.trainerId;
    }
    
    // By default, only show approved reviews
    if (!queryObj.status && (!req.user || req.user.role !== 'admin')) {
      queryObj.status = 'approved';
    }
    
    // Convert query to MongoDB format
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    // Build base query
    let query = Review.find(JSON.parse(queryStr));
    
    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const reviews = await query;
    const totalCount = await Review.countDocuments(JSON.parse(queryStr));
    
    // Send response
    res.status(200).json({
      success: true,
      results: reviews.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: {
        reviews
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single review by ID
 * Access: Public with restricted fields for non-admins
 */
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'No review found with that ID'
      });
    }
    
    // Check if review is approved or if the user is admin/owner
    if (review.status !== 'approved' && 
        (!req.user || (req.user.role !== 'admin' && review.user.id !== req.user.id))) {
      return res.status(403).json({
        success: false,
        message: 'This review is not yet approved or has been rejected'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        review
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new review
 * Access: Authenticated users
 */
exports.createReview = async (req, res, next) => {
  try {
    // Set user ID from authenticated user
    req.body.user = req.user.id;
    
    // Validate entity type and ID
    const { entityType, entity } = req.body;
    
    if (!entityType || !entity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both entityType and entity ID'
      });
    }
    
    // Check if entity exists based on entityType
    let entityExists = false;
    let entityModel;
    let entityData;
    
    if (entityType === 'Product') {
      entityData = await Product.findById(entity);
      entityExists = !!entityData;
      entityModel = Product;
    } else if (entityType === 'Class') {
      entityData = await Class.findById(entity);
      entityExists = !!entityData;
      entityModel = Class;
    } else if (entityType === 'User') {
      // Only allow reviews for trainers
      entityData = await User.findOne({ _id: entity, role: 'trainer' });
      entityExists = !!entityData;
      entityModel = User;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid entity type. Must be Product, Class, or User'
      });
    }
    
    if (!entityExists) {
      return res.status(404).json({
        success: false,
        message: `No ${entityType.toLowerCase()} found with that ID`
      });
    }
    
    // Check if user already has a review for this entity
    const existingReview = await Review.findOne({
      user: req.user.id,
      entity,
      entityType
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item. Please update your existing review instead.'
      });
    }
    
    // For products, verify if user has purchased the item
    if (entityType === 'Product' && req.body.verified !== false) {
      const hasPurchased = await Order.exists({
        user: req.user.id,
        'items.product': entity,
        status: { $in: ['delivered', 'shipped'] }
      });
      
      req.body.verified = Boolean(hasPurchased);
      
      if (hasPurchased) {
        // Find the order to reference it
        const order = await Order.findOne({
          user: req.user.id,
          'items.product': entity,
          status: { $in: ['delivered', 'shipped'] }
        }).sort('-createdAt');
        
        if (order) {
          req.body.order = order._id;
        }
      }
    }
    
    // For classes, verify if user has attended
    if (entityType === 'Class' && req.body.verified !== false) {
      const hasAttended = await Class.exists({
        _id: entity,
        attendees: { $elemMatch: { user: req.user.id, attended: true } }
      });
      
      req.body.verified = Boolean(hasAttended);
    }
    
    // Create the review
    const newReview = await Review.create(req.body);
    
    // If auto-approving reviews is disabled, notify admins
    if (newReview.status === 'pending') {
      // Get admin IDs
      const admins = await User.find({ role: 'admin' }).select('_id');
      const adminIds = admins.map(admin => admin._id);
      
      // Create notification for admins
      if (adminIds.length > 0) {
        await sendNotification({
          title: 'New Review Needs Approval',
          message: `A new ${entityType.toLowerCase()} review requires moderation.`,
          type: 'review',
          user: adminIds[0], // Send to first admin
          priority: 'normal',
          reference: {
            model: 'Review',
            id: newReview._id
          },
          action: {
            url: `/admin/reviews/${newReview._id}`,
            text: 'Review Now'
          }
        });
      }
    } else if (entityType === 'User' && entityData) {
      // If it's a trainer review, notify the trainer
      await sendNotification({
        title: 'New Review Received',
        message: `You have received a new review with a rating of ${newReview.rating}/5.`,
        type: 'review',
        user: entity,
        priority: 'normal',
        reference: {
          model: 'Review',
          id: newReview._id
        }
      });
    }
    
    res.status(201).json({
      success: true,
      data: {
        review: newReview
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a review
 * Access: Owner or admin
 */
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'No review found with that ID'
      });
    }
    
    // Check if user is the review owner or admin
    if (review.user.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this review'
      });
    }
    
    // Restrict fields that can be updated
    const allowedFields = ['review', 'rating', 'title', 'media'];
    
    // Admin can update additional fields
    if (req.user.role === 'admin') {
      allowedFields.push('status', 'verified');
    }
    
    // Filter the request body
    const filteredBody = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });
    
    // Update updatedAt
    filteredBody.updatedAt = Date.now();
    
    // If status is being changed to approved, ensure it was not rejected
    if (req.user.role === 'admin' && filteredBody.status === 'approved' && review.status === 'rejected') {
      // Reset rejection info if it exists
      if (review.response && review.response.content) {
        filteredBody.response = undefined;
      }
    }
    
    // Update the review
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );
    
    // If review status changed to approved, notify the reviewer
    if (req.user.role === 'admin' && 
        filteredBody.status === 'approved' && 
        review.status === 'pending') {
      
      await sendNotification({
        title: 'Review Approved',
        message: 'Your review has been approved and is now visible to everyone.',
        type: 'review',
        user: review.user._id,
        priority: 'normal',
        reference: {
          model: 'Review',
          id: review._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        review: updatedReview
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a review
 * Access: Owner or admin
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'No review found with that ID'
      });
    }
    
    // Check if user is the review owner or admin
    if (review.user.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this review'
      });
    }
    
    // Delete the review
    await Review.findByIdAndDelete(req.params.id);
    
    // If admin deleted the review, notify the user
    if (req.user.role === 'admin' && review.user.id !== req.user.id) {
      await sendNotification({
        title: 'Review Removed',
        message: 'Your review has been removed by an administrator.',
        type: 'review',
        user: review.user._id,
        priority: 'normal'
      });
    }
    
    res.status(204).json({
      success: true,
      data: null
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add admin response to a review
 * Access: Admin only
 */
exports.respondToReview = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Response content is required'
      });
    }
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'No review found with that ID'
      });
    }
    
    // Update the review with admin response
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        response: {
          content,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    // Notify the reviewer that their review received a response
    await sendNotification({
      title: 'Response to Your Review',
      message: 'An administrator has responded to your review.',
      type: 'review',
      user: review.user._id,
      priority: 'normal',
      reference: {
        model: 'Review',
        id: review._id
      },
      action: {
        url: `/reviews/${review._id}`,
        text: 'View Response'
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        review: updatedReview
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all pending reviews (for admin moderation)
 * Access: Admin only
 */
exports.getPendingReviews = async (req, res, next) => {
  try {
    const queryObj = { status: 'pending' };
    
    // Apply additional filters if provided
    if (req.query.entityType) {
      queryObj.entityType = req.query.entityType;
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Execute query
    const reviews = await Review.find(queryObj)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
    
    const totalCount = await Review.countDocuments(queryObj);
    
    res.status(200).json({
      success: true,
      results: reviews.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: {
        reviews
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Approve or reject a review
 * Access: Admin only
 */
exports.moderateReview = async (req, res, next) => {
  try {
    const { status, responseContent } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (approved or rejected)'
      });
    }
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'No review found with that ID'
      });
    }
    
    // Update the review status and add response if rejecting
    const updateData = { status };
    
    if (status === 'rejected' && responseContent) {
      updateData.response = {
        content: responseContent,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    }
    
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );
    
    // Notify the user about the moderation decision
    if (status === 'approved') {
      await sendNotification({
        title: 'Review Approved',
        message: 'Your review has been approved and is now visible to everyone.',
        type: 'review',
        user: review.user._id,
        priority: 'normal',
        reference: {
          model: 'Review',
          id: review._id
        }
      });
    } else if (status === 'rejected') {
      await sendNotification({
        title: 'Review Not Approved',
        message: responseContent || 'Your review could not be approved. Please check admin response for details.',
        type: 'review',
        user: review.user._id,
        priority: 'normal',
        reference: {
          model: 'Review',
          id: review._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        review: updatedReview
      }
    });
  } catch (err) {
    next(err);
  }
}; 