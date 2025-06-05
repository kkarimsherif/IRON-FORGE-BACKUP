const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A cart must belong to a user']
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Cart item must have a product']
      },
      quantity: {
        type: Number,
        required: [true, 'Cart item must have a quantity'],
        min: [1, 'Quantity must be at least 1']
      }
    }
  ],
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-find middleware to populate the product references with necessary info
cartSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'items.product',
    select: 'name price discountPercentage primaryImage category inStock quantity membershipDiscount'
  });
  next();
});

// Virtual property for total items
cartSchema.virtual('totalItems').get(function() {
  if (!this.items || !this.items.length) return 0;
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Static method to get or create a cart for a user
cartSchema.statics.getOrCreateUserCart = async function(userId) {
  let cart = await this.findOne({ user: userId });
  
  if (!cart) {
    cart = await this.create({ 
      user: userId,
      items: []
    });
  }
  
  return cart;
};

// Method to add a product to the cart
cartSchema.methods.addProduct = async function(productId, quantity = 1) {
  // Find if the product already exists in the cart
  const existingItem = this.items.find(
    item => item.product._id.toString() === productId.toString()
  );
  
  if (existingItem) {
    // Update quantity
    existingItem.quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity
    });
  }
  
  this.lastActive = Date.now();
  return await this.save();
};

// Method to update product quantity
cartSchema.methods.updateQuantity = async function(productId, quantity) {
  const item = this.items.find(
    item => item.product._id.toString() === productId.toString()
  );
  
  if (!item) {
    throw new Error('Product not in cart');
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    return await this.removeProduct(productId);
  }
  
  // Update quantity
  item.quantity = quantity;
  
  this.lastActive = Date.now();
  return await this.save();
};

// Method to remove a product from the cart
cartSchema.methods.removeProduct = async function(productId) {
  this.items = this.items.filter(
    item => item.product._id.toString() !== productId.toString()
  );
  
  this.lastActive = Date.now();
  return await this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.lastActive = Date.now();
  return await this.save();
};

// Method to calculate cart totals
cartSchema.methods.calculateTotals = function(membershipType = 'none') {
  if (!this.items.length) {
    return {
      subtotal: 0,
      discounts: 0,
      membershipDiscount: 0,
      total: 0
    };
  }
  
  let subtotal = 0;
  let discounts = 0;
  let membershipDiscount = 0;
  
  this.items.forEach(item => {
    if (!item.product || !item.product.price) return;
    
    // Base price x quantity
    const baseTotal = item.product.price * item.quantity;
    subtotal += baseTotal;
    
    // Regular discounts
    if (item.product.discountPercentage > 0) {
      const itemDiscount = baseTotal * (item.product.discountPercentage / 100);
      discounts += itemDiscount;
    }
    
    // Membership discounts
    if (membershipType !== 'none' && 
        item.product.membershipDiscount && 
        item.product.membershipDiscount.hasDiscount && 
        item.product.membershipDiscount.applicableMemberships.includes(membershipType)) {
      
      // Apply membership discount to already discounted price
      const discountedPrice = baseTotal - (baseTotal * (item.product.discountPercentage / 100));
      const memberDiscount = discountedPrice * (item.product.membershipDiscount.discountPercentage / 100);
      membershipDiscount += memberDiscount;
    }
  });
  
  const total = subtotal - discounts - membershipDiscount;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discounts: parseFloat(discounts.toFixed(2)),
    membershipDiscount: parseFloat(membershipDiscount.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

// Index to improve query performance
cartSchema.index({ user: 1 }, { unique: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 