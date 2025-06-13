/**
 * MongoDB Atlas Setup Script
 * 
 * This script helps you set up MongoDB Atlas connection for your Iron Forge application.
 * Run this script with Node.js to set up your MongoDB Atlas connection.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for MongoDB Atlas credentials
async function promptForCredentials() {
  return new Promise((resolve) => {
    console.log('\n=== MongoDB Atlas Connection Setup ===\n');
    console.log('Please provide your MongoDB Atlas connection details:');
    
    rl.question('Do you have a full connection string? (y/n): ', (hasFullString) => {
      if (hasFullString.toLowerCase() === 'y') {
        rl.question('Enter your full MongoDB Atlas connection string: ', (connectionString) => {
          // Extract database name or use default
          rl.question('Database Name (default: iron-forge): ', (dbName) => {
            const database = dbName || 'iron-forge';
            
            resolve({
              fullConnectionString: connectionString,
              database
            });
          });
        });
      } else {
        rl.question('MongoDB Atlas Username: ', (username) => {
          rl.question('MongoDB Atlas Password: ', (password) => {
            rl.question('MongoDB Atlas Cluster URL (e.g., cluster0.abcde.mongodb.net): ', (cluster) => {
              rl.question('Database Name (default: iron-forge): ', (dbName) => {
                const database = dbName || 'iron-forge';
                
                resolve({
                  username,
                  password,
                  cluster,
                  database
                });
              });
            });
          });
        });
      }
    });
  });
}

// Function to generate JWT secret
function generateJwtSecret() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Function to create .env file
async function createEnvFile(credentials) {
  const jwtSecret = generateJwtSecret();
  
  let connectionString;
  if (credentials.fullConnectionString) {
    // Parse the connection string to ensure it has the right database
    const baseConnectionString = credentials.fullConnectionString.split('?')[0];
    // Remove any database name if present
    const connWithoutDb = baseConnectionString.split('/').slice(0, -1).join('/');
    // Add the chosen database name
    connectionString = `${connWithoutDb}/${credentials.database}?retryWrites=true&w=majority`;
  } else {
    connectionString = `mongodb+srv://${credentials.username}:${credentials.password}@${credentials.cluster}/${credentials.database}?retryWrites=true&w=majority`;
  }
  
  const envContent = `# Server Configuration
PORT=5003
NODE_ENV=development

# MongoDB Atlas Connection String
MONGODB_URI=${connectionString}

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@ironforge.com
`;

  try {
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log('\n✅ .env file created successfully!');
  } catch (error) {
    console.error('\n❌ Error creating .env file:', error.message);
  }
}

// Function to test MongoDB connection
async function testConnection() {
  try {
    // Dynamically load environment variables
    require('dotenv').config();
    
    // Test connection
    const mongoose = require('mongoose');
    console.log('\nTesting MongoDB Atlas connection...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('\n❌ MongoDB connection error:', error.message);
    console.log('\nPlease check your MongoDB Atlas credentials and try again.');
  }
}

// Main function
async function main() {
  console.log('\n=== Iron Forge MongoDB Atlas Setup ===');
  console.log('This script will help you set up MongoDB Atlas for your Iron Forge application.\n');
  
  const credentials = await promptForCredentials();
  await createEnvFile(credentials);
  
  rl.question('\nDo you want to test the connection? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      await testConnection();
    }
    
    console.log('\n=== Setup Complete ===');
    console.log('You can now start your application with:');
    console.log('npm start');
    
    rl.close();
  });
}

// Run the script
main(); 