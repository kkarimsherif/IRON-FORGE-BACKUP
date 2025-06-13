const User = require('../models/user.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { AppError } = require('../middleware/error.middleware');

/**
 * Get admin dashboard page
 * @route GET /admin-dashboard
 */
exports.getAdminDashboardPage = async (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      throw new AppError('Access denied. Admin privileges required.', 403);
    }

    // Get dashboard statistics
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    // Calculate total revenue
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    res.render('admin-dashboard', {
      title: 'IRON-FORGE | Admin Dashboard',
      user: req.user,
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
}; 