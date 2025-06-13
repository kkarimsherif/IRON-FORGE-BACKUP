const winston = require('winston');
const { createLogger, format, transports } = winston;
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create the logger instance
const logger = createLogger({
  format: logFormat,
  defaultMeta: { service: 'iron-forge-api' },
  transports: [
    // Write to all logs with level 'info' and below to 'combined.log'
    new transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'error' and below to 'error.log'
    new transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Also log to console during development
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    })
  ]
});

// Log database operations
const dbLogger = {
  logQuery: (query, options) => {
    logger.debug('Database Query', {
      query,
      options,
      collection: query.model ? query.model.collection.name : 'unknown'
    });
  },
  
  logError: (error, operation, data) => {
    logger.error('Database Error', {
      operation,
      data,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    });
  },
  
  logSuccess: (operation, result, data) => {
    logger.info('Database Operation Success', {
      operation,
      data,
      result: typeof result === 'object' ? 'object' : result
    });
  }
};

// Create Express middleware for HTTP request logging
const requestLogger = (req, res, next) => {
  // Log request details
  const start = Date.now();
  
  // Log when the request is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    });
  });
  
  next();
};

module.exports = {
  logger,
  dbLogger,
  requestLogger
}; 