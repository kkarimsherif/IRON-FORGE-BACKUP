/**
 * Manual MongoDB Atlas Setup
 * 
 * This script creates a .env file with your MongoDB Atlas connection string.
 * Just edit the values below and run the script with Node.js.
 */

const fs = require('fs');
const path = require('path');

// ============= EDIT THESE VALUES =============
// Your MongoDB Atlas connection string
// Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
const MONGODB_URI = "mongodb+srv://seifeldin2308770:Seifashraf12@cluster0.zwmsdpv.mongodb.net/iron-forge?retryWrites=true&w=majority";

// Generate a random JWT secret or set your own
const JWT_SECRET = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
// ============================================

// Create .env file content
const envContent = `# Server Configuration
PORT=5003
NODE_ENV=development

# MongoDB Atlas Connection String
MONGODB_URI=${MONGODB_URI}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@ironforge.com
`;

// Write to .env file
try {
  fs.writeFileSync(path.join(__dirname, '.env'), envContent);
  console.log('\n✅ .env file created successfully!');
} catch (error) {
  console.error('\n❌ Error creating .env file:', error.message);
}

// Test the connection
async function testConnection() {
  try {
    // Dynamically load environment variables
    require('dotenv').config();
    
    // Test connection
    const mongoose = require('mongoose');
    console.log('\nTesting MongoDB Atlas connection...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('Your application is now ready to store user data in MongoDB Atlas.');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('\n❌ MongoDB connection error:', error.message);
    console.log('\nPlease check your MongoDB Atlas connection string and try again.');
  }
}

// Run the test
testConnection(); 