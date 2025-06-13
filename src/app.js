const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import routes
const indexRoutes = require('./routes/index.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const paymentRoutes = require('./routes/payment.routes');
const cartRoutes = require('./routes/cart.routes');
const apiRoutes = require('./routes/api.routes');

// Import middleware
const { errorHandler } = require('./middleware/error.middleware');
const { requestLogger } = require('./middleware/logger.middleware');
const { checkAuth } = require('./middleware/auth.middleware');

// Import config
const { connectDB } = require('./config/database');
const { initSchedulers } = require('./config/schedulers');

// Create Express app
const app = express();

// Connect to MongoDB
console.log('Connecting to MongoDB...');
connectDB();

// Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(requestLogger); // Log requests
app.use(checkAuth); // Check authentication and make user available to templates

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Set view engine (for EJS templates)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Initialize schedulers
initSchedulers();

module.exports = app; 