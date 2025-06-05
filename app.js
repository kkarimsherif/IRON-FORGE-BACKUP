const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const scheduler = require('./src/middleware/scheduler');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Global Middlewares

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'difficulty',
      'maxGroupSize',
      'ratingsAverage',
      'ratingsQuantity'
    ]
  })
);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  })
);

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine (for email templates)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection
mongoose.connect(process.env.MONGO_URI, {
    // These options are no longer needed in newer Mongoose versions
    // but keeping them for compatibility
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
})
.then(() => {
  console.log('Successfully connected to MongoDB');
  
  // Initialize scheduler after DB connection is established
  scheduler.initScheduler();
})
.catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Forge-Gym API' });
});

// Routes
app.use('/api/auth', require('./src/api/auth.routes'));
app.use('/api/users', require('./src/api/users.routes'));
app.use('/api/classes', require('./src/api/classes.routes'));
app.use('/api/products', require('./src/api/products.routes'));
app.use('/api/orders', require('./src/api/orders.routes'));
app.use('/api/cart', require('./src/api/cart.routes'));
app.use('/api/admin', require('./src/api/admin.routes'));
app.use('/api/reviews', require('./src/api/reviews.routes'));
app.use('/api/notifications', require('./src/api/notifications.routes'));

// 404 route
app.all('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 