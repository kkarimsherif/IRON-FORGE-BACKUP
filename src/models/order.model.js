const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'An order must belong to a user']
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Order item must have a product']
      },
      quantity: {
        type: Number,
        required: [true, 'Order item must have a quantity'],
        min: [1, 'Quantity must be at least 1']
      },
      price: {
        type: Number,
        required: [true, 'Order item must have a price']
      },
      // Store the name and other product info in case the product changes later
      productSnapshot: {
        name: String,
        category: String,
        image: String
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: [true, 'An order must have a total amount']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      message: 'Status must be one of: pending, processing, shipped, delivered, cancelled'
    },
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded'],
      message: 'Payment status must be one of: pending, paid, failed, refunded'
    },
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['credit-card', 'paypal', 'cash', 'bank-transfer', 'other'],
      message: 'Payment method must be one of: credit-card, paypal, cash, bank-transfer, other'
    },
    default: 'credit-card'
  },
  paymentDetails: {
    transactionId: String,
    provider: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  discountApplied: {
    type: Number,
    default: 0
  },
  membershipDiscount: {
    type: Boolean,
    default: false
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now()
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

// Pre-find middleware to populate the user reference
orderSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email'
  }).populate({
    path: 'items.product',
    select: 'name price category'
  });
  next();
});

// Static method to calculate the total price
orderSchema.statics.calculateTotalAmount = function(items) {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Method to update order status
orderSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  this.updatedAt = Date.now();
  return await this.save();
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = async function(newPaymentStatus) {
  this.paymentStatus = newPaymentStatus;
  this.updatedAt = Date.now();
  return await this.save();
};

// Index to improve query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 