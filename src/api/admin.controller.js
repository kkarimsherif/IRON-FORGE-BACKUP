const User = require('../models/user.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Class = require('../models/class.model');

/**
 * Get dashboard statistics
 */
exports.getDashboard = async (req, res, next) => {
  try {
    // Get current date and date for previous period comparison
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

    // User stats
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    const prevPeriodNewUsers = await User.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    
    // Premium users - those with an active membership
    const premiumUsers = await User.countDocuments({
      membershipType: { $in: ['basic', 'premium', 'platinum'] }
    });
    
    // Order stats
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    const prevPeriodOrders = await Order.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    
    // Revenue stats
    const allRecentOrders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo },
      paymentStatus: 'paid'
    });
    
    const allPrevPeriodOrders = await Order.find({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      paymentStatus: 'paid'
    });
    
    const recentRevenue = allRecentOrders.reduce((total, order) => total + order.totalAmount, 0);
    const prevPeriodRevenue = allPrevPeriodOrders.reduce((total, order) => total + order.totalAmount, 0);
    
    // Product stats
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({
      quantity: { $lt: 10 },
      quantity: { $gt: 0 }
    });
    const outOfStockProducts = await Product.countDocuments({
      $or: [{ inStock: false }, { quantity: 0 }]
    });
    
    // Class stats
    const totalClasses = await Class.countDocuments();
    const upcomingClasses = await Class.countDocuments({
      date: { $gte: new Date() }
    });
    const fullClasses = await Class.countDocuments({
      availableSpots: 0
    });
    
    // Monthly revenue data for charts
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Popular products data
    const popularProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products', 
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          revenue: 1,
          name: { $arrayElemAt: ['$productInfo.name', 0] },
          category: { $arrayElemAt: ['$productInfo.category', 0] }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          new: newUsers,
          newGrowthRate: prevPeriodNewUsers ? ((newUsers - prevPeriodNewUsers) / prevPeriodNewUsers * 100).toFixed(1) : 100,
          premium: premiumUsers
        },
        orders: {
          total: totalOrders,
          recent: recentOrders,
          growth: prevPeriodOrders ? ((recentOrders - prevPeriodOrders) / prevPeriodOrders * 100).toFixed(1) : 100
        },
        revenue: {
          recent: recentRevenue.toFixed(2),
          growth: prevPeriodRevenue ? ((recentRevenue - prevPeriodRevenue) / prevPeriodRevenue * 100).toFixed(1) : 100,
          monthly: monthlyRevenue
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
          popular: popularProducts
        },
        classes: {
          total: totalClasses,
          upcoming: upcomingClasses,
          full: fullClasses
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user management data with pagination and filtering
 */
exports.getUsersAdmin = async (req, res, next) => {
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
    let query = User.find(JSON.parse(queryStr));
    
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
      query = query.select('-password -__v');
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const users = await query;
    const totalCount = await User.countDocuments(JSON.parse(queryStr));
    
    // Send response
    res.status(200).json({
      success: true,
      results: users.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: {
        users
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get sales report with date filters
 */
exports.getSalesReport = async (req, res, next) => {
  try {
    // Default to last 30 days if no dates provided
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    // Set start date to beginning of day
    startDate.setHours(0, 0, 0, 0);
    
    // Get orders within date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'paid'
    }).sort('createdAt');
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((total, order) => total + order.totalAmount, 0);
    
    // Get total orders count
    const totalOrders = orders.length;
    
    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Sales by category
    const salesByCategory = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid'
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $group: {
          _id: { $arrayElemAt: ['$productInfo.category', 0] },
          sales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          quantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { sales: -1 } }
    ]);
    
    // Daily sales for chart
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          revenue: 1,
          name: { $arrayElemAt: ['$productInfo.name', 0] },
          category: { $arrayElemAt: ['$productInfo.category', 0] }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        dateRange: {
          startDate,
          endDate
        },
        summary: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalOrders,
          averageOrderValue: parseFloat(averageOrderValue.toFixed(2))
        },
        salesByCategory,
        dailySales,
        topProducts
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get inventory report
 */
exports.getInventoryReport = async (req, res, next) => {
  try {
    // Get all products with inventory information
    const products = await Product.find()
      .select('name category quantity inStock price discountPercentage')
      .sort('category');
    
    // Calculate inventory value and group by category
    const inventoryByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { 
            $sum: { 
              $multiply: ['$price', '$quantity'] 
            } 
          },
          totalItems: { $sum: '$quantity' },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ['$inStock', false] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Calculate total inventory value and low stock products
    const totalValue = inventoryByCategory.reduce(
      (total, category) => total + category.totalValue, 0
    );
    
    const lowStockProducts = await Product.find({
      quantity: { $gt: 0, $lt: 10 }
    }).select('name category quantity price');
    
    const outOfStockProducts = await Product.find({
      $or: [{ inStock: false }, { quantity: 0 }]
    }).select('name category price');
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalValue: parseFloat(totalValue.toFixed(2)),
          totalProducts: products.length,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length
        },
        inventoryByCategory,
        lowStockProducts,
        outOfStockProducts
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user role or status
 */
exports.updateUserAdmin = async (req, res, next) => {
  try {
    const allowedFields = ['role', 'active', 'membershipType', 'membershipExpiry'];
    
    // Filter out fields that aren't allowed to be updated
    const filteredBody = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });
    
    if (Object.keys(filteredBody).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one valid field to update'
      });
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that ID'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get sales statistics
 */
exports.getSalesStats = async (req, res, next) => {
  try {
    // Default to last 30 days if no dates provided
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    // Set start date to beginning of day
    startDate.setHours(0, 0, 0, 0);
    
    // Get orders within date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'paid'
    }).sort('createdAt');
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((total, order) => total + order.totalAmount, 0);
    
    // Get total orders count
    const totalOrders = orders.length;
    
    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get top selling products
 */
exports.getTopSellingProducts = async (req, res, next) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products', 
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          revenue: 1,
          name: { $arrayElemAt: ['$productInfo.name', 0] },
          category: { $arrayElemAt: ['$productInfo.category', 0] }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: topProducts
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get monthly sales data
 */
exports.getMonthlySales = async (req, res, next) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: monthlySales
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user statistics
 */
exports.getUserStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const membershipStats = await User.aggregate([
      {
        $group: {
          _id: '$membershipType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        newUsers,
        membershipStats
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get new users
 */
exports.getNewUsers = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const newUsers = await User.find({
      createdAt: { $gte: cutoffDate }
    }).sort('-createdAt').select('-password');
    
    res.status(200).json({
      success: true,
      results: newUsers.length,
      data: newUsers
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get low stock products
 */
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    
    const lowStockProducts = await Product.find({
      quantity: { $lt: threshold, $gt: 0 }
    }).sort('quantity');
    
    res.status(200).json({
      success: true,
      results: lowStockProducts.length,
      data: lowStockProducts
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get product stock history
 */
exports.getProductStockHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    // This would require a stock history collection or model
    // For now, just returning a placeholder
    
    res.status(200).json({
      success: true,
      message: 'Stock history feature will be implemented in future updates',
      data: []
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get class statistics
 */
exports.getClassStats = async (req, res, next) => {
  try {
    const totalClasses = await Class.countDocuments();
    
    const upcomingClasses = await Class.countDocuments({
      date: { $gte: new Date() }
    });
    
    const fullClasses = await Class.countDocuments({
      availableSpots: 0
    });
    
    const classesByType = await Class.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalClasses,
        upcomingClasses,
        fullClasses,
        classesByType
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get class attendance
 */
exports.getClassAttendance = async (req, res, next) => {
  try {
    const classes = await Class.find().populate({
      path: 'attendees',
      select: 'name email'
    });
    
    // Transform data to include attendance percentage
    const classAttendance = classes.map(cls => {
      const capacity = cls.capacity || 0;
      const attendees = cls.attendees?.length || 0;
      const attendancePercentage = capacity > 0 ? (attendees / capacity) * 100 : 0;
      
      return {
        _id: cls._id,
        title: cls.title,
        date: cls.date,
        capacity,
        attendees,
        attendancePercentage: attendancePercentage.toFixed(1)
      };
    });
    
    res.status(200).json({
      success: true,
      results: classAttendance.length,
      data: classAttendance
    });
  } catch (err) {
    next(err);
  }
}; 