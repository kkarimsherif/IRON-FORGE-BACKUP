const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      trim: true,
      maxlength: [500, 'Review cannot exceed 500 characters']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating is required']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    // Reference to the user who wrote the review
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    },
    // Polymorphic association - can reference different models
    entityType: {
      type: String,
      required: [true, 'Review must specify entity type'],
      enum: {
        values: ['Product', 'Class', 'User'],
        message: 'Entity type must be either Product, Class, or User'
      }
    },
    entity: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Review must be associated with an entity'],
      refPath: 'entityType'
    },
    // Optional reference to an order (for product reviews)
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    // For verified purchases/attended classes
    verified: {
      type: Boolean,
      default: false
    },
    // For admin moderation
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status must be pending, approved, or rejected'
      },
      default: 'approved' // Auto-approve by default, but can be changed to 'pending' for moderation
    },
    // Optional fields
    title: {
      type: String,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      trim: true
    },
    likes: {
      type: Number,
      default: 0
    },
    media: [
      {
        type: String, // URL to uploaded image/video
        trim: true
      }
    ],
    // Admin response to review
    response: {
      content: {
        type: String,
        trim: true,
        maxlength: [500, 'Response cannot exceed 500 characters']
      },
      createdAt: {
        type: Date
      },
      updatedAt: {
        type: Date
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create compound index for one review per user per entity
reviewSchema.index({ user: 1, entity: 1 }, { unique: true });

// Static method to calculate average ratings for an entity
reviewSchema.statics.calcAverageRatings = async function(entityId) {
  const stats = await this.aggregate([
    {
      $match: { entity: entityId, status: 'approved' }
    },
    {
      $group: {
        _id: '$entity',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  return stats.length > 0 
    ? { count: stats[0].nRating, average: stats[0].avgRating }
    : { count: 0, average: 0 };
};

// Update entity's average rating after save
reviewSchema.post('save', async function() {
  // Get model based on entityType
  const Model = mongoose.model(this.entityType);
  
  // Calculate new ratings
  const stats = await this.constructor.calcAverageRatings(this.entity);
  
  // Different models might store ratings differently
  if (this.entityType === 'Product') {
    await Model.findByIdAndUpdate(this.entity, {
      'ratings.average': stats.average,
      'ratings.count': stats.count
    });
  } else if (this.entityType === 'Class') {
    await Model.findByIdAndUpdate(this.entity, {
      rating: stats.average,
      ratingCount: stats.count
    });
  } else if (this.entityType === 'User') {
    // For trainers, only update if role is 'trainer'
    await Model.findOneAndUpdate(
      { _id: this.entity, role: 'trainer' },
      { rating: stats.average, ratingCount: stats.count }
    );
  }
});

// Also update entity when review is deleted
reviewSchema.post(/^findOneAndDelete|^findOneAndRemove/, async function(doc) {
  if (doc) {
    const Model = mongoose.model(doc.entityType);
    const stats = await doc.constructor.calcAverageRatings(doc.entity);
    
    if (doc.entityType === 'Product') {
      await Model.findByIdAndUpdate(doc.entity, {
        'ratings.average': stats.average,
        'ratings.count': stats.count
      });
    } else if (doc.entityType === 'Class') {
      await Model.findByIdAndUpdate(doc.entity, {
        rating: stats.average, 
        ratingCount: stats.count
      });
    } else if (doc.entityType === 'User') {
      await Model.findOneAndUpdate(
        { _id: doc.entity, role: 'trainer' },
        { rating: stats.average, ratingCount: stats.count }
      );
    }
  }
});

// Populate user reference on find
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 