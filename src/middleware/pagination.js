/**
 * Pagination Middleware
 * Provides standardized pagination for API responses
 */

/**
 * Add pagination parameters to the request object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const paginate = (req, res, next) => {
  // Extract pagination parameters from query string
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Add pagination parameters to request object
  req.pagination = {
    page,
    limit,
    skip
  };
  
  next();
};

/**
 * Apply pagination to query result
 * @param {Object} model - Mongoose model
 * @param {Object} query - Mongoose query
 * @param {Object} pagination - Pagination parameters
 * @param {Object} options - Additional options (populate, sort, etc.)
 * @returns {Promise<Object>} - Paginated results
 */
const paginateResults = async (model, query = {}, pagination = {}, options = {}) => {
  // Default pagination parameters
  const { page = 1, limit = 10, skip = 0 } = pagination;

  // Build query
  let queryBuilder = model.find(query);

  // Apply population if specified
  if (options.populate) {
    if (Array.isArray(options.populate)) {
      options.populate.forEach(path => {
        queryBuilder = queryBuilder.populate(path);
      });
    } else {
      queryBuilder = queryBuilder.populate(options.populate);
    }
  }

  // Apply sorting
  if (options.sort) {
    queryBuilder = queryBuilder.sort(options.sort);
  } else {
    // Default sort by most recent
    queryBuilder = queryBuilder.sort({ createdAt: -1 });
  }

  // Execute query with pagination
  const items = await queryBuilder
    .skip(skip)
    .limit(limit)
    .exec();

  // Get total count for pagination metadata
  const totalItems = await model.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  // Return paginated results with metadata
  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

module.exports = {
  paginate,
  paginateResults
}; 