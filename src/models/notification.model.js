const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification must belong to a user']
  },
  title: {
    type: String,
    required: [true, 'Notification must have a title'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification must have a message'],
    trim: true
  },
  type: {
    type: String,
    enum: {
      values: ['order', 'class', 'membership', 'system', 'review', 'payment'],
      message: 'Type must be one of: order, class, membership, system, review, payment'
    },
    required: [true, 'Notification must have a type']
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'normal', 'high', 'critical'],
      message: 'Priority must be one of: low, normal, high, critical'
    },
    default: 'normal'
  },
  read: {
    type: Boolean,
    default: false
  },
  action: {
    url: {
      type: String,
      trim: true
    },
    text: {
      type: String,
      trim: true
    }
  },
  // For associating with other models
  reference: {
    model: {
      type: String,
      enum: {
        values: ['Order', 'Class', 'Product', 'User', 'Review', 'Payment'],
        message: 'Reference model must be one of: Order, Class, Product, User, Review, Payment'
      }
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  // For grouping related notifications
  category: {
    type: String,
    trim: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index to improve query performance
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

// Virtual property to check if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  return await this.save();
};

// Static method to create and send a notification to a user
notificationSchema.statics.createNotification = async function(notificationData) {
  // Create the notification
  return await this.create(notificationData);
};

// Static method to create notifications for multiple users
notificationSchema.statics.createBulkNotifications = async function(users, notificationTemplate) {
  const notifications = [];

  for (const userId of users) {
    const notificationData = {
      ...notificationTemplate,
      user: userId
    };
    
    notifications.push(notificationData);
  }

  return await this.insertMany(notifications);
};

// Get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    user: userId,
    read: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { user: userId, read: false },
    { read: true }
  );
};

// Auto-populate user reference with select fields
notificationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email'
  });
  
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 