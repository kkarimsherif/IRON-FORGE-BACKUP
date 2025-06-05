const Notification = require('../models/notification.model');
const User = require('../models/user.model');

/**
 * Get all notifications for the current user
 * Access: Authenticated users (own notifications only)
 */
exports.getMyNotifications = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { user: req.user.id };
    
    // Filter by read status if provided
    if (req.query.read === 'true') {
      queryObj.read = true;
    } else if (req.query.read === 'false') {
      queryObj.read = false;
    }
    
    // Filter by type if provided
    if (req.query.type) {
      queryObj.type = req.query.type;
    }
    
    // Filter by priority if provided
    if (req.query.priority) {
      queryObj.priority = req.query.priority;
    }
    
    // Filter out expired notifications by default
    if (!req.query.includeExpired || req.query.includeExpired !== 'true') {
      queryObj.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ];
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Execute query
    const notifications = await Notification.find(queryObj)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
    
    // Count total unread
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      read: false 
    });
    
    // Count total by type
    const typeCounts = await Notification.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    const typeCountMap = {};
    typeCounts.forEach(item => {
      typeCountMap[item._id] = item.count;
    });
    
    const totalCount = await Notification.countDocuments(queryObj);
    
    res.status(200).json({
      success: true,
      results: notifications.length,
      unreadCount,
      typeCounts: typeCountMap,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: {
        notifications
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get notification by ID
 * Access: Owner of notification or admin
 */
exports.getNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user is the recipient or admin
    if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this notification'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        notification
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark a notification as read
 * Access: Owner of notification or admin
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user is the recipient or admin
    if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this notification'
      });
    }
    
    // Already read, no need to update
    if (notification.read) {
      return res.status(200).json({
        success: true,
        data: {
          notification
        }
      });
    }
    
    // Update the notification
    notification.read = true;
    notification.readAt = Date.now();
    await notification.save();
    
    res.status(200).json({
      success: true,
      data: {
        notification
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all notifications as read for current user
 * Access: Authenticated user
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    // Filter options
    const filterOptions = { user: req.user.id, read: false };
    
    // Filter by type if specified
    if (req.query.type) {
      filterOptions.type = req.query.type;
    }
    
    // Update all matching unread notifications
    const result = await Notification.updateMany(
      filterOptions,
      { 
        read: true,
        readAt: Date.now()
      }
    );
    
    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a notification
 * Access: Owner of notification or admin
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user is the recipient or admin
    if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this notification'
      });
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      success: true,
      data: null
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete all read notifications for current user
 * Access: Authenticated user
 */
exports.deleteAllRead = async (req, res, next) => {
  try {
    // Filter options
    const filterOptions = { user: req.user.id, read: true };
    
    // Filter by type if specified
    if (req.query.type) {
      filterOptions.type = req.query.type;
    }
    
    // Delete all matching read notifications
    const result = await Notification.deleteMany(filterOptions);
    
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} read notifications`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get unread count by type for the current user
 * Access: Authenticated user
 */
exports.getUnreadCounts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get overall unread count
    const totalUnread = await Notification.countDocuments({
      user: userId,
      read: false
    });
    
    // Get unread counts by type
    const typeCounts = await Notification.aggregate([
      { 
        $match: { 
          user: req.user._id,
          read: false
        } 
      },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    // Format the type counts as an object
    const formattedTypeCounts = {};
    typeCounts.forEach(item => {
      formattedTypeCounts[item._id] = item.count;
    });
    
    // Get high priority count
    const highPriorityCount = await Notification.countDocuments({
      user: userId,
      read: false,
      priority: 'high'
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalUnread,
        byType: formattedTypeCounts,
        highPriority: highPriorityCount
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get notifications dashboard data
 * Access: Authenticated user
 */
exports.getDashboard = async (req, res, next) => {
  try {
    // Count total notifications
    const totalCount = await Notification.countDocuments();
    
    // Get counts by type
    const typeStats = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get counts by priority
    const priorityStats = await Notification.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { _id: 1 } } // low, normal, high
    ]);
    
    // Notifications over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyStats = await Notification.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Read vs unread stats
    const readStats = await Notification.aggregate([
      { $group: { _id: '$read', count: { $sum: 1 } } }
    ]);
    
    const readCount = readStats.find(item => item._id === true)?.count || 0;
    const unreadCount = readStats.find(item => item._id === false)?.count || 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalCount,
        typeStats,
        priorityStats,
        dailyStats,
        readStats: {
          read: readCount,
          unread: unreadCount,
          readPercentage: totalCount > 0 ? (readCount / totalCount * 100).toFixed(1) : 0
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Cleanup old notifications
 * Access: Admin only
 */
exports.cleanupOldNotifications = async (req, res, next) => {
  try {
    const { olderThanDays, readOnly, type } = req.body;
    
    // Validate input
    if (!olderThanDays) {
      return res.status(400).json({
        success: false,
        message: 'olderThanDays parameter is required'
      });
    }
    
    const days = parseInt(olderThanDays);
    if (isNaN(days) || days < 1) {
      return res.status(400).json({
        success: false,
        message: 'olderThanDays must be a positive number'
      });
    }
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Build query
    const query = {
      createdAt: { $lt: cutoffDate }
    };
    
    // Add read filter if specified
    if (readOnly === true) {
      query.read = true;
    }
    
    // Add type filter if specified
    if (type) {
      query.type = type;
    }
    
    // Delete matching notifications
    const result = await Notification.deleteMany(query);
    
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old notifications`,
      data: {
        deletedCount: result.deletedCount,
        criteria: {
          olderThanDays: days,
          readOnly: !!readOnly,
          type: type || 'all'
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Schedule notification for all users of a certain role
 * Access: Admin only
 */
exports.scheduleNotificationForRole = async (req, res, next) => {
  try {
    const { role, title, message, type, priority, scheduledFor, expiresInDays } = req.body;
    
    // Validate input
    if (!role || !title || !message || !scheduledFor) {
      return res.status(400).json({
        success: false,
        message: 'Role, title, message, and scheduledFor date are required'
      });
    }
    
    // Parse and validate scheduledFor date
    let scheduledDate;
    try {
      scheduledDate = new Date(scheduledFor);
      if (isNaN(scheduledDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scheduledFor date format. Use ISO format (YYYY-MM-DDTHH:MM:SS.sssZ)'
      });
    }
    
    // Check if scheduled time is in the future
    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time must be in the future'
      });
    }
    
    // Create expiration date if specified
    let expiresAt;
    if (expiresInDays) {
      expiresAt = new Date(scheduledDate);
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
    }
    
    // Get users with the specified role
    const users = await User.find({ role, active: true });
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active users found with role: ${role}`
      });
    }
    
    // Create a scheduled job
    const scheduler = require('../middleware/scheduler');
    const jobId = scheduler.scheduleOneTimeJob(async () => {
      // Create notifications for each user
      const notifications = [];
      for (const user of users) {
        notifications.push({
          title,
          message,
          type: type || 'role',
          user: user._id,
          priority: priority || 'normal',
          expiresAt,
          sentBy: req.user.id
        });
      }
      
      // Insert all notifications at once
      await Notification.insertMany(notifications);
      console.log(`Scheduled notification sent to ${users.length} users with role: ${role}`);
    }, scheduledDate.getTime() - Date.now());
    
    res.status(200).json({
      success: true,
      message: `Notification scheduled for ${users.length} users with role: ${role}`,
      data: {
        scheduledFor: scheduledDate,
        usersCount: users.length,
        jobId
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create notification for user(s) - Admin Only
 * Access: Admin only
 */
exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, type, userIds, priority, action, reference, category, expiresAt } = req.body;
    
    // Validate required fields
    if (!title || !message || !type || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, message, type, and userIds array'
      });
    }
    
    // Create notification template
    const notificationTemplate = {
      title,
      message,
      type,
      priority: priority || 'normal',
      action,
      reference,
      category,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    };
    
    // Create notifications for all users
    const notifications = await Notification.createBulkNotifications(
      userIds,
      notificationTemplate
    );
    
    res.status(201).json({
      success: true,
      results: notifications.length,
      message: `Successfully created ${notifications.length} notifications`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create system notification for all users - Admin Only
 * Access: Admin only
 */
exports.createSystemNotification = async (req, res, next) => {
  try {
    const { title, message, priority, action, category, expiresAt } = req.body;
    
    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and message'
      });
    }
    
    // Get all user IDs
    const users = await User.find().select('_id');
    const userIds = users.map(user => user._id);
    
    // Create notification template
    const notificationTemplate = {
      title,
      message,
      type: 'system',
      priority: priority || 'normal',
      action,
      category,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    };
    
    // Create notifications for all users
    const notifications = await Notification.createBulkNotifications(
      userIds,
      notificationTemplate
    );
    
    res.status(201).json({
      success: true,
      results: notifications.length,
      message: `Successfully created ${notifications.length} system notifications`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Send a system notification to a specific user
 * Access: Admin only
 */
exports.sendSystemNotification = async (req, res, next) => {
  try {
    const { userId, title, message, type, priority, expiresInDays } = req.body;
    
    // Validate input
    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, title, and message are required'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create expiration date if specified
    let expiresAt;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
    }
    
    // Create notification
    const notification = await Notification.create({
      title,
      message,
      type: type || 'system',
      user: userId,
      priority: priority || 'normal',
      expiresAt,
      sentBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: {
        notification
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Broadcast a notification to all users
 * Access: Admin only
 */
exports.broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, type, priority, expiresInDays } = req.body;
    
    // Validate input
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }
    
    // Create expiration date if specified
    let expiresAt;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
    }
    
    // Get all active users
    const users = await User.find({ active: true });
    
    // Create notifications in bulk
    const notifications = [];
    for (const user of users) {
      notifications.push({
        title,
        message,
        type: type || 'broadcast',
        user: user._id,
        priority: priority || 'normal',
        expiresAt,
        sentBy: req.user.id
      });
    }
    
    // Insert all notifications at once
    await Notification.insertMany(notifications);
    
    res.status(201).json({
      success: true,
      message: `Notification broadcast to ${users.length} users`,
      data: {
        usersNotified: users.length
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Helper function to send a notification
 * @param {Object} notificationData - The notification data
 * @returns {Promise<Object>} - The created notification
 */
exports.sendNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (err) {
    console.error('Error sending notification:', err);
    throw err;
  }
}; 