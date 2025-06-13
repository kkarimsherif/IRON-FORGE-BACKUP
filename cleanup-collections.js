/**
 * MongoDB Collections Cleanup Script
 * 
 * This script will:
 * 1. Connect to your MongoDB Atlas database
 * 2. List all collections
 * 3. Allow you to remove unnecessary collections
 */

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    return false;
  }
}

// List all collections
async function listCollections() {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nExisting collections:');
    
    if (collections.length === 0) {
      console.log('No collections found in the database.');
      return [];
    }
    
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    return collections.map(collection => collection.name);
  } catch (error) {
    console.error('Error listing collections:', error.message);
    return [];
  }
}

// Remove selected collections
async function removeCollections(collectionsToKeep, allCollections) {
  try {
    const collectionsToRemove = allCollections.filter(collection => !collectionsToKeep.includes(collection));
    
    if (collectionsToRemove.length === 0) {
      console.log('\nNo collections to remove.');
      return;
    }
    
    console.log('\nCollections to be removed:');
    collectionsToRemove.forEach(collection => {
      console.log(`- ${collection}`);
    });
    
    const confirmation = await new Promise(resolve => {
      rl.question('\nAre you sure you want to remove these collections? (yes/no): ', answer => {
        resolve(answer.toLowerCase());
      });
    });
    
    if (confirmation === 'yes' || confirmation === 'y') {
      for (const collection of collectionsToRemove) {
        await mongoose.connection.db.dropCollection(collection);
        console.log(`Removed collection: ${collection}`);
      }
      console.log('\nSelected collections have been removed successfully!');
    } else {
      console.log('\nOperation cancelled. No collections were removed.');
    }
  } catch (error) {
    console.error('Error removing collections:', error.message);
  }
}

// Main function
async function main() {
  console.log('\n=== MongoDB Collections Cleanup ===');
  
  // Connect to MongoDB
  const connected = await connectToMongoDB();
  if (!connected) {
    console.log('Exiting due to connection error.');
    rl.close();
    process.exit(1);
  }
  
  // List all collections
  const allCollections = await listCollections();
  
  if (allCollections.length === 0) {
    console.log('No collections to clean up.');
    await mongoose.connection.close();
    rl.close();
    return;
  }
  
  // Essential collections we should keep
  const essentialCollections = ['users'];
  
  console.log('\nRecommended collections to keep:');
  essentialCollections.forEach(collection => {
    if (allCollections.includes(collection)) {
      console.log(`- ${collection} (essential for user authentication and profiles)`);
    }
  });
  
  // Ask user which collections to keep
  const answer = await new Promise(resolve => {
    rl.question('\nEnter the numbers of collections to KEEP (comma-separated, e.g., 1,3,5) or "essential" to keep only essential collections: ', answer => {
      resolve(answer.trim());
    });
  });
  
  let collectionsToKeep = [];
  
  if (answer.toLowerCase() === 'essential') {
    collectionsToKeep = essentialCollections.filter(collection => allCollections.includes(collection));
    console.log(`\nKeeping essential collections: ${collectionsToKeep.join(', ')}`);
  } else {
    const selectedIndices = answer.split(',').map(num => parseInt(num.trim()) - 1);
    collectionsToKeep = selectedIndices
      .filter(index => index >= 0 && index < allCollections.length)
      .map(index => allCollections[index]);
    
    console.log(`\nKeeping collections: ${collectionsToKeep.join(', ')}`);
  }
  
  // Remove collections
  await removeCollections(collectionsToKeep, allCollections);
  
  // Close connection
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  rl.close();
}

// Run the script
main(); 