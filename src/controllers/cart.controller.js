const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const { AppError } = require('../middleware/error.middleware');

/**
 * Get the current user's cart
 * @route GET /api/cart
 */
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.getOrCreateUserCart(req.user.id);
    
    // Get user membership type if available
    const user = await User.findById(req.user.id).select('membership');
    const membershipType = user && user.membership ? user.membership.type : 'none';
    
    // Calculate totals with membership discounts
    const totals = cart.calculateTotals(membershipType);
    
    res.status(200).json({
      success: true,
      data: {
        cart,
        totals
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a product to the cart
 * @route POST /api/cart/items
 */
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId) {
      return next(new AppError('Product ID is required', 400));
    }
    
    // Validate product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    
    if (!product.inStock || product.quantity < 1) {
      return next(new AppError('Product is out of stock', 400));
    }
    
    // Add to cart
    const cart = await Cart.getOrCreateUserCart(req.user.id);
    await cart.addProduct(productId, quantity || 1);
    
    // Get user membership type if available
    const user = await User.findById(req.user.id).select('membership');
    const membershipType = user && user.membership ? user.membership.type : 'none';
    
    // Calculate totals with membership discounts
    const totals = cart.calculateTotals(membershipType);
    
    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      data: {
        cart,
        totals
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update item quantity in cart
 * @route PUT /api/cart/items/:productId
 */
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 0) {
      return next(new AppError('Valid quantity is required', 400));
    }
    
    // Get cart
    const cart = await Cart.getOrCreateUserCart(req.user.id);
    
    // Update quantity or remove if quantity is 0
    if (quantity === 0) {
      await cart.removeProduct(productId);
    } else {
      await cart.updateQuantity(productId, quantity);
    }
    
    // Get user membership type if available
    const user = await User.findById(req.user.id).select('membership');
    const membershipType = user && user.membership ? user.membership.type : 'none';
    
    // Calculate totals with membership discounts
    const totals = cart.calculateTotals(membershipType);
    
    res.status(200).json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      data: {
        cart,
        totals
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove an item from the cart
 * @route DELETE /api/cart/items/:productId
 */
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    // Get cart
    const cart = await Cart.getOrCreateUserCart(req.user.id);
    
    // Remove product
    await cart.removeProduct(productId);
    
    // Get user membership type if available
    const user = await User.findById(req.user.id).select('membership');
    const membershipType = user && user.membership ? user.membership.type : 'none';
    
    // Calculate totals with membership discounts
    const totals = cart.calculateTotals(membershipType);
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cart,
        totals
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear the cart
 * @route DELETE /api/cart
 */
exports.clearCart = async (req, res, next) => {
  try {
    // Get cart
    const cart = await Cart.getOrCreateUserCart(req.user.id);
    
    // Clear cart
    await cart.clearCart();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: {
        cart,
        totals: {
          subtotal: 0,
          discounts: 0,
          membershipDiscount: 0,
          total: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
}; 