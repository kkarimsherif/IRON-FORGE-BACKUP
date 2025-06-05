const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A class must have a name'],
    trim: true,
    maxlength: [50, 'A class name must have less than or equal to 50 characters']
  },
  description: {
    type: String,
    required: [true, 'A class must have a description'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'A class must have a type'],
    enum: {
      values: ['yoga', 'cardio', 'strength', 'hiit', 'pilates', 'cycling', 'dance', 'martial-arts', 'other'],
      message: 'Type must be one of: yoga, cardio, strength, hiit, pilates, cycling, dance, martial-arts, other'
    }
  },
  image: {
    type: String,
    default: 'default-class.jpg'
  },
  duration: {
    type: Number,
    required: [true, 'A class must have a duration'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [180, 'Duration must be less than or equal to 180 minutes']
  },
  difficulty: {
    type: String,
    required: [true, 'A class must have a difficulty level'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'all-levels'],
      message: 'Difficulty must be one of: beginner, intermediate, advanced, all-levels'
    }
  },
  capacity: {
    type: Number,
    required: [true, 'A class must have a capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  enrolledUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A class must have an instructor']
  },
  schedule: [{
    day: {
      type: String,
      required: [true, 'A schedule must have a day'],
      enum: {
        values: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        message: 'Day must be one of the days of the week'
      }
    },
    startTime: {
      type: String,
      required: [true, 'A schedule must have a start time'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in format HH:MM (24-hour)']
    },
    endTime: {
      type: String,
      required: [true, 'A schedule must have an end time'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in format HH:MM (24-hour)']
    },
    location: {
      type: String,
      required: [true, 'A schedule must specify a location'],
      trim: true
    }
  }],
  requiresMembership: {
    type: Boolean,
    default: true
  },
  membershipTypes: {
    type: [String],
    enum: {
      values: ['basic', 'premium', 'platinum'],
      message: 'Membership type must be one of: basic, premium, platinum'
    },
    default: ['basic', 'premium', 'platinum']
  },
  price: {
    type: Number,
    default: 0 // Free for members, otherwise specified price
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property for available spots
classSchema.virtual('availableSpots').get(function() {
  return this.capacity - (this.enrolledUsers ? this.enrolledUsers.length : 0);
});

// Virtual property to check if class is full
classSchema.virtual('isFull').get(function() {
  return this.availableSpots <= 0;
});

// Index to improve query performance
classSchema.index({ name: 1 });
classSchema.index({ type: 1 });
classSchema.index({ difficulty: 1 });

// Pre-find middleware to populate instructor
classSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'instructor',
    select: 'name email profilePicture'
  });
  next();
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class; 