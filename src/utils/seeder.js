/**
 * Database seeder utility
 * Run with: npm run seed
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');

// Import constants
const { ROLES } = require('../config/constants');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iron-forge', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected for seeding...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@ironforge.com',
    password: 'admin123',
    role: ROLES.ADMIN,
  },
  {
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123',
    role: ROLES.USER,
    membership: {
      type: 'black',
      startDate: new Date(),
      renewalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      active: true,
    },
    bmi: {
      value: '22.5',
      category: 'Normal weight',
      date: new Date(),
    },
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    role: ROLES.USER,
    membership: {
      type: 'basic',
      startDate: new Date(),
      renewalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      active: true,
    },
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    role: ROLES.TRAINER,
  },
];

const products = [
  {
    title: 'Weight Lifting Belt',
    description: 'Professional weight lifting belt for maximum support during heavy lifts.',
    price: 49.99,
    image: 'img/Weight Lifting Belt.avif',
    category: 'equipment',
    quantity: 50,
    featured: true,
  },
  {
    title: 'Lifting Straps',
    description: 'Durable lifting straps to improve grip strength and performance.',
    price: 19.99,
    image: 'img/Lifting Straps.avif',
    category: 'accessories',
    quantity: 100,
  },
  {
    title: 'Whey Protein',
    description: '100% pure whey protein with 24g protein per serving. 30 servings.',
    price: 39.99,
    image: 'img/Whey Protein.png',
    category: 'supplements',
    quantity: 75,
    featured: true,
  },
  {
    title: 'Shaker Bottle',
    description: 'BPA-free 500ml shaker bottle with mixing ball.',
    price: 14.99,
    image: 'img/classic-shaker-500-ml-black.avif',
    category: 'accessories',
    quantity: 200,
  },
  {
    title: 'Iron Forge T-Shirt',
    description: 'Comfortable cotton t-shirt with Iron Forge logo.',
    price: 24.99,
    image: 'img/tshirt.jpg',
    category: 'apparel',
    quantity: 150,
  },
  {
    title: 'Pre-Workout Supplement',
    description: 'Energy-boosting pre-workout formula with caffeine and amino acids.',
    price: 34.99,
    image: 'img/pre-workout.jpg',
    category: 'supplements',
    quantity: 60,
    featured: true,
  },
];

// Import all data
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    
    console.log('Previous data cleared');
    
    // Create users
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);
    
    // Create products
    const createdProducts = await Product.create(products);
    console.log(`${createdProducts.length} products created`);
    
    // Create sample order
    const adminUser = createdUsers[0];
    const sampleOrder = {
      user: adminUser._id,
      items: [
        {
          product: createdProducts[0]._id,
          title: createdProducts[0].title,
          price: createdProducts[0].price,
          quantity: 1,
        },
        {
          product: createdProducts[2]._id,
          title: createdProducts[2].title,
          price: createdProducts[2].price,
          quantity: 2,
        },
      ],
      shippingAddress: {
        firstName: 'Admin',
        lastName: 'User',
        address: '123 Main St',
        city: 'New York',
        postalCode: '10001',
        phone: '555-123-4567',
      },
      paymentMethod: 'credit-card',
      subtotal: createdProducts[0].price + (createdProducts[2].price * 2),
      shippingCost: 15,
      totalAmount: createdProducts[0].price + (createdProducts[2].price * 2) + 15,
      status: 'delivered',
      isPaid: true,
      paidAt: new Date(),
      isDelivered: true,
      deliveredAt: new Date(),
    };
    
    const createdOrder = await Order.create(sampleOrder);
    console.log(`Sample order created: ${createdOrder._id}`);
    
    console.log('Data import complete!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete all data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    
    console.log('All data deleted!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Determine action based on command line argument
if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
} 