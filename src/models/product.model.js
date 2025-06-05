const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    trim: true,
    maxlength: [100, 'A product name must have less than or equal to 100 characters']
  },
  description: {
    type: String,
    required: [true, 'A product must have a description'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price'],
    min: [0, 'Price must be above or equal to 0']
  },
  category: {
    type: String,
    required: [true, 'A product must have a category'],
    enum: {
      values: ['clothing', 'supplements', 'equipment', 'accessories', 'membership', 'other'],
      message: 'Category must be one of: clothing, supplements, equipment, accessories, membership, other'
    }
  },
  images: {
    type: [String],
    default: ['default-product.jpg']
  },
  primaryImage: {
    type: String,
    default: 'default-product.jpg'
  },
  brand: {
    type: String,
    trim: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  quantity: {
    type: Number,
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%']
  },
  featured: {
    type: Boolean,
    default: false
  },
  membershipDiscount: {
    hasDiscount: {
      type: Boolean,
      default: false
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Membership discount cannot be negative'],
      max: [100, 'Membership discount cannot be more than 100%']
    },
    applicableMemberships: {
      type: [String],
      enum: {
        values: ['basic', 'premium', 'platinum'],
        message: 'Membership type must be one of: basic, premium, platinum'
      },
      default: ['premium', 'platinum']
    }
  },
  attributes: {
    type: Map,
    of: String
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot be above 5'],
      set: val => Math.round(val * 10) / 10 // Round to 1 decimal place
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property for discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discountPercentage === 0) return this.price;
  const discountAmount = (this.price * this.discountPercentage) / 100;
  return parseFloat((this.price - discountAmount).toFixed(2));
});

// Virtual property for member's price based on membership type
productSchema.methods.getPriceForMember = function(membershipType) {
  if (!this.membershipDiscount.hasDiscount) return this.discountedPrice;
  
  if (!membershipType || !this.membershipDiscount.applicableMemberships.includes(membershipType)) {
    return this.discountedPrice;
  }
  
  const additionalDiscountAmount = (this.discountedPrice * this.membershipDiscount.discountPercentage) / 100;
  return parseFloat((this.discountedPrice - additionalDiscountAmount).toFixed(2));
};

// Index to improve query performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 