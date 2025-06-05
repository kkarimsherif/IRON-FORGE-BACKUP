const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { sendNotification } = require('./notifications.controller');

/**
 * Get all orders
 * Access: Admin only
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    // Fields to exclude from filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    // Build query
    let query = Order.find(JSON.parse(queryStr));
    
    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const orders = await query;
    
    // Send response
    res.status(200).json({
      success: true,
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single order
 * Access: Admin or order owner
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found with that ID'
      });
    }
    
    // Check if user is admin or the order owner
    if (req.user.role !== 'admin' && 
        order.user.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this order'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new order
 * Access: Any authenticated user
 */
exports.createOrder = async (req, res, next) => {
  try {
    // Add user ID to order
    if (!req.body.user) {
      req.body.user = req.user.id;
    }
    
    // Validate order items
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item'
      });
    }
    
    // Validate and enrich each item
    const orderItems = [];
    let totalAmount = 0;
    let membershipDiscount = false;
    
    for (const item of req.body.items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }
      
      if (!product.inStock || product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is out of stock or has insufficient quantity`
        });
      }
      
      // Calculate price based on membership if applicable
      let price = product.discountedPrice;
      
      if (req.user.membershipType !== 'none' && 
          product.membershipDiscount.hasDiscount && 
          product.membershipDiscount.applicableMemberships.includes(req.user.membershipType)) {
        price = product.getPriceForMember(req.user.membershipType);
        membershipDiscount = true;
      }
      
      // Add item to order
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price,
        productSnapshot: {
          name: product.name,
          category: product.category,
          image: product.primaryImage
        }
      });
      
      // Add to total
      totalAmount += price * item.quantity;
      
      // Update product quantity
      product.quantity -= item.quantity;
      if (product.quantity <= 0) {
        product.inStock = false;
      }
      await product.save();
    }
    
    // Create the order
    const newOrder = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      membershipDiscount,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes
    });
    
    // Send notification to the user
    await sendNotification({
      title: 'Order Placed Successfully',
      message: `Your order #${newOrder._id.toString().slice(-6)} has been received and is being processed.`,
      type: 'order',
      user: req.user.id,
      priority: 'normal',
      reference: {
        model: 'Order',
        id: newOrder._id
      },
      action: {
        url: `/orders/${newOrder._id}`,
        text: 'View Order'
      }
    });
    
    res.status(201).json({
      success: true,
      data: {
        order: newOrder
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update order status
 * Access: Admin only
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found with that ID'
      });
    }
    
    // Update status
    await order.updateStatus(status);
    
    // Send notification to the customer based on new status
    let notificationTitle, notificationMessage;
    
    const orderNumber = order._id.toString().slice(-6);
    
    switch (status) {
      case 'processing':
        notificationTitle = 'Order Update';
        notificationMessage = `Your order #${orderNumber} is being processed. We'll notify you once it's shipped.`;
        break;
      case 'shipped':
        notificationTitle = 'Order Shipped';
        notificationMessage = `Good news! Your order #${orderNumber} has been shipped.`;
        break;
      case 'delivered':
        notificationTitle = 'Order Delivered';
        notificationMessage = `Your order #${orderNumber} has been delivered. Enjoy your purchase!`;
        break;
      case 'cancelled':
        notificationTitle = 'Order Cancelled';
        notificationMessage = `Your order #${orderNumber} has been cancelled. Please contact support if you have any questions.`;
        break;
      default:
        notificationTitle = 'Order Status Updated';
        notificationMessage = `Your order #${orderNumber} has been updated to: ${status}.`;
    }
    
    if (notificationTitle && notificationMessage) {
      await sendNotification({
        title: notificationTitle,
        message: notificationMessage,
        type: 'order',
        user: order.user._id,
        priority: status === 'cancelled' ? 'high' : 'normal',
        reference: {
          model: 'Order',
          id: order._id
        },
        action: {
          url: `/orders/${order._id}`,
          text: 'View Order'
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update payment status
 * Access: Admin only
 */
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a payment status'
      });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found with that ID'
      });
    }
    
    // Track previous payment status for notification
    const previousStatus = order.paymentStatus;
    
    // Update payment status
    await order.updatePaymentStatus(paymentStatus);
    
    // Send notification if payment status changed to certain states
    if (paymentStatus !== previousStatus) {
      const orderNumber = order._id.toString().slice(-6);
      
      if (paymentStatus === 'paid') {
        await sendNotification({
          title: 'Payment Successful',
          message: `Your payment for order #${orderNumber} has been successfully processed.`,
          type: 'payment',
          user: order.user._id,
          priority: 'normal',
          reference: {
            model: 'Order',
            id: order._id
          }
        });
      } else if (paymentStatus === 'failed') {
        await sendNotification({
          title: 'Payment Failed',
          message: `We couldn't process your payment for order #${orderNumber}. Please update your payment method.`,
          type: 'payment',
          user: order.user._id,
          priority: 'high',
          reference: {
            model: 'Order',
            id: order._id
          },
          action: {
            url: `/orders/${order._id}/payment`,
            text: 'Update Payment'
          }
        });
      } else if (paymentStatus === 'refunded') {
        await sendNotification({
          title: 'Refund Processed',
          message: `We've processed a refund for order #${orderNumber}. It may take a few days to appear in your account.`,
          type: 'payment',
          user: order.user._id,
          priority: 'normal',
          reference: {
            model: 'Order',
            id: order._id
          }
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel an order
 * Access: Admin or order owner (if order status is 'pending')
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found with that ID'
      });
    }
    
    // Check if user is admin or the order owner and order is pending
    if (req.user.role !== 'admin' && 
        (order.user.id !== req.user.id || order.status !== 'pending')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this order, or the order is no longer in pending status'
      });
    }
    
    // Update status to cancelled
    await order.updateStatus('cancelled');
    
    // Restore product quantities
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        product.inStock = product.quantity > 0;
        await product.save();
      }
    }
    
    // Send cancellation notification
    const orderNumber = order._id.toString().slice(-6);
    let message;
    
    if (req.user.role === 'admin' && order.user.id !== req.user.id) {
      message = `Your order #${orderNumber} has been cancelled by an administrator. Please contact support for details.`;
    } else {
      message = `Your order #${orderNumber} has been cancelled at your request.`;
    }
    
    await sendNotification({
      title: 'Order Cancelled',
      message,
      type: 'order',
      user: order.user._id,
      priority: 'high',
      reference: {
        model: 'Order',
        id: order._id
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current user's orders
 * Access: Any authenticated user
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (err) {
    next(err);
  }
}; 