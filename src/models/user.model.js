const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't return password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'trainer', 'admin'],
    default: 'user'
  },
  profilePicture: {
    type: String,
    default: 'default-avatar.jpg'
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  membershipType: {
    type: String,
    enum: ['none', 'basic', 'premium', 'platinum'],
    default: 'none'
  },
  membershipStartDate: {
    type: Date
  },
  membershipEndDate: {
    type: Date
  },
  enrolledClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property for user age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual property to check if membership is active
userSchema.virtual('membershipActive').get(function() {
  if (!this.membershipEndDate) return false;
  return new Date() <= new Date(this.membershipEndDate);
});

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) return next();
  
  // Hash the password with a salt of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check if password is correct
userSchema.methods.isPasswordCorrect = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate a JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Token expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 