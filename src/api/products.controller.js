const Product = require('../models/product.model');

/**
 * Get all products - with filtering, sorting, pagination
 */
exports.getAllProducts = async (req, res, next) => {
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
    let query = Product.find(JSON.parse(queryStr));
    
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
    const products = await query;
    
    // Send response
    res.status(200).json({
      success: true,
      results: products.length,
      data: {
        products
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single product
 */
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'No product found with that ID'
      });
    }
    
    // Calculate price for the user if they're logged in and have a membership
    if (req.user && req.user.membershipType !== 'none') {
      product._doc.memberPrice = product.getPriceForMember(req.user.membershipType);
    }
    
    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new product
 * Access: Admin only
 */
exports.createProduct = async (req, res, next) => {
  try {
    const newProduct = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: {
        product: newProduct
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a product
 * Access: Admin only
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'No product found with that ID'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a product
 * Access: Admin only
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'No product found with that ID'
      });
    }
    
    res.status(204).json({
      success: true,
      data: null
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get featured products
 */
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const products = await Product.find({ featured: true })
      .sort('-ratings.average')
      .limit(limit);
    
    res.status(200).json({
      success: true,
      results: products.length,
      data: {
        products
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get products by category
 */
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    
    res.status(200).json({
      success: true,
      results: products.length,
      data: {
        products
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update product stock
 * Access: Admin only
 */
exports.updateStock = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a quantity'
      });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'No product found with that ID'
      });
    }
    
    // Update quantity
    product.quantity = quantity;
    
    // Update inStock status based on quantity
    product.inStock = quantity > 0;
    
    await product.save();
    
    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (err) {
    next(err);
  }
}; 