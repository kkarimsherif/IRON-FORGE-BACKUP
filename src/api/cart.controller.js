const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

/**
 * Get current user's cart
 * Access: Authenticated users
 */
exports.getMyCart = async (req, res, next) => {
  try {
    const cart = await Cart.getOrCreateUserCart(req.user.id);
    
    // Calculate totals based on user's membership type
    const totals = cart.calculateTotals(req.user.membershipType);
    
    res.status(200).json({
      success: true,
      data: {
        cart: {
          ...cart.toObject(),
          totals
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add item to cart
 * Access: Authenticated users
 */
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Check if product exists and is in stock
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!product.inStock) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }
    
    // Check if there's sufficient quantity
    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} items available`
      });
    }
    
    // Get or create user's cart
    const cart = await Cart.getOrCreateUserCart(req.user.id);
    
    // Add product to cart
    await cart.addProduct(productId, quantity);
    
    // Recalculate totals based on user's membership type
    const totals = cart.calculateTotals(req.user.membershipType);
    
    res.status(200).json({
      success: true,
      data: {
        cart: {
          ...cart.toObject(),
          totals
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update cart item quantity
 * Access: Authenticated users
 */
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required'
      });
    }
    
    // Check if product exists and has sufficient stock
    if (quantity > 0) {
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      if (!product.inStock) {
        return res.status(400).json({
          success: false,
          message: 'Product is out of stock'
        });
      }
      
      if (product.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.quantity} items available`
        });
      }
    }
    
    // Get user's cart
    const cart = await Cart.getOrCreateUserCart(req.user.id);
    
    // Update quantity (this method handles removal if quantity <= 0)
    await cart.updateQuantity(productId, quantity);
    
    // Recalculate totals based on user's membership type
    const totals = cart.calculateTotals(req.user.membershipType);
    
    res.status(200).json({
      success: true,
      data: {
        cart: {
          ...cart.toObject(),
          totals
        }
      }
    });
  } catch (err) {
    if (err.message === 'Product not in cart') {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }
    next(err);
  }
};

/**
 * Remove item from cart
 * Access: Authenticated users
 */
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Get user's cart
    const cart = await Cart.getOrCreateUserCart(req.user.id);
    
    // Remove product
    await cart.removeProduct(productId);
    
    // Recalculate totals based on user's membership type
    const totals = cart.calculateTotals(req.user.membershipType);
    
    res.status(200).json({
      success: true,
      data: {
        cart: {
          ...cart.toObject(),
          totals
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Clear cart
 * Access: Authenticated users
 */
exports.clearCart = async (req, res, next) => {
  try {
    // Get user's cart
    const cart = await Cart.getOrCreateUserCart(req.user.id);
    
    // Clear cart
    await cart.clearCart();
    
    res.status(200).json({
      success: true,
      data: {
        cart
      }
    });
  } catch (err) {
    next(err);
  }
}; 