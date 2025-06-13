const axios = require('axios');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const { AppError } = require('../middleware/error.middleware');
const { PAYMENT_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * Initiate a payment
 * @route POST /api/payments/initiate
 */
exports.initiatePayment = async (req, res, next) => {
  try {
    const {
      amount,
      customerName,
      customerEmail,
      items,
      address,
      city,
      postalCode,
      phone,
    } = req.body;
    
    if (!amount || amount <= 0) {
      return next(new AppError('Invalid amount', 400));
    }
    
    // For demo purposes, we'll create a mock payment URL
    // In a real app, you would integrate with a payment gateway like Paymob, Stripe, etc.
    
    // Create an order in the database
    let user = req.user;
    
    // If user is not authenticated, try to find by email
    if (!user && customerEmail) {
      user = await User.findOne({ email: customerEmail });
    }
    
    const order = await Order.create({
      user: user ? user._id : null,
      items: items.map(item => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress: {
        firstName: customerName.split(' ')[0],
        lastName: customerName.split(' ').slice(1).join(' '),
        address,
        city,
        postalCode,
        phone,
      },
      paymentMethod: 'credit-card',
      subtotal: items.reduce((total, item) => total + (item.price * item.quantity), 0),
      shippingCost: 15, // Fixed shipping cost for demo
      totalAmount: amount,
      status: 'pending',
    });
    
    // Log the order creation
    logger.info(`New order created: ${order._id}`);
    
    // Create a mock payment URL
    const paymentUrl = `${req.protocol}://${req.get('host')}/payment-iframe.html?order_id=${order._id}`;
    
    res.status(200).json({
      success: true,
      order_id: order._id,
      payment_url: paymentUrl,
    });
  } catch (error) {
    logger.error(`Payment initiation error: ${error.message}`);
    next(error);
  }
};

/**
 * Process a payment
 * @route POST /api/payments/process
 */
exports.processPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod } = req.body;
    
    if (!orderId) {
      return next(new AppError('Order ID is required', 400));
    }
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Check if order belongs to the authenticated user
    if (order.user && order.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized to process this payment', 403));
    }
    
    // Update order payment details
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'processing';
    order.paymentResult = {
      id: `PAY-${Date.now()}`,
      status: PAYMENT_STATUS.COMPLETED,
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };
    
    await order.save();
    
    // Log the payment
    logger.info(`Payment processed for order: ${order._id}`);
    
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    logger.error(`Payment processing error: ${error.message}`);
    next(error);
  }
};

/**
 * Handle payment webhook from payment gateway
 * @route POST /api/payments/webhook
 */
exports.handlePaymentWebhook = async (req, res, next) => {
  try {
    const { type, data } = req.body;
    
    // Verify webhook signature (in a real app)
    // const isValid = verifyWebhookSignature(req);
    // if (!isValid) {
    //   return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    // }
    
    // Process different webhook events
    switch (type) {
      case 'payment_success':
        await handlePaymentSuccess(data);
        break;
      case 'payment_failed':
        await handlePaymentFailure(data);
        break;
      default:
        logger.info(`Unhandled webhook event: ${type}`);
    }
    
    // Always return 200 to acknowledge receipt
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`Webhook error: ${error.message}`);
    // Still return 200 to prevent retries
    res.status(200).json({ success: true });
  }
};

/**
 * Get payment status
 * @route GET /api/payments/status/:orderId
 */
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return next(new AppError('Order ID is required', 400));
    }
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    res.status(200).json({
      success: true,
      order: {
        id: order._id,
        status: order.status,
        isPaid: order.isPaid,
        amount_cents: Math.round(order.totalAmount * 100),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refund a payment
 * @route POST /api/payments/refund/:orderId
 */
exports.refundPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;
    
    if (!orderId) {
      return next(new AppError('Order ID is required', 400));
    }
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Check if order is paid
    if (!order.isPaid) {
      return next(new AppError('Order is not paid yet', 400));
    }
    
    // In a real app, you would call the payment gateway's refund API
    // For demo purposes, we'll just update the order status
    
    order.status = 'refunded';
    order.paymentResult.status = PAYMENT_STATUS.REFUNDED;
    order.paymentResult.update_time = new Date().toISOString();
    
    await order.save();
    
    // Log the refund
    logger.info(`Payment refunded for order: ${order._id}, amount: ${amount || order.totalAmount}, reason: ${reason || 'Not specified'}`);
    
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    logger.error(`Refund error: ${error.message}`);
    next(error);
  }
};

/**
 * Get all payments (admin only)
 * @route GET /api/payments
 */
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment by ID (admin only)
 * @route GET /api/payments/:id
 */
exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions for webhook handling
async function handlePaymentSuccess(data) {
  try {
    const { order_id } = data;
    
    // Find and update the order
    const order = await Order.findById(order_id);
    
    if (!order) {
      logger.error(`Order not found for payment success: ${order_id}`);
      return;
    }
    
    // Update order status
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'processing';
    order.paymentResult = {
      id: data.transaction_id || `PAY-${Date.now()}`,
      status: PAYMENT_STATUS.COMPLETED,
      update_time: new Date().toISOString(),
      email_address: data.email || '',
    };
    
    await order.save();
    logger.info(`Order ${order_id} marked as paid via webhook`);
  } catch (error) {
    logger.error(`Error handling payment success: ${error.message}`);
  }
}

async function handlePaymentFailure(data) {
  try {
    const { order_id } = data;
    
    // Find and update the order
    const order = await Order.findById(order_id);
    
    if (!order) {
      logger.error(`Order not found for payment failure: ${order_id}`);
      return;
    }
    
    // Update order status
    order.paymentResult = {
      id: data.transaction_id || `PAY-${Date.now()}`,
      status: PAYMENT_STATUS.FAILED,
      update_time: new Date().toISOString(),
      email_address: data.email || '',
    };
    
    await order.save();
    logger.info(`Order ${order_id} marked as payment failed via webhook`);
  } catch (error) {
    logger.error(`Error handling payment failure: ${error.message}`);
  }
} 