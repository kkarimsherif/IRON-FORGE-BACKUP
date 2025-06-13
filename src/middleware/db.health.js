const mongoose = require('mongoose');

/**
 * Database Health Check
 * Checks if the MongoDB connection is healthy and returns stats
 */
const checkDatabaseHealth = async () => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return {
        status: 'error',
        connection: false,
        message: 'Database disconnected',
        readyState: mongoose.connection.readyState
      };
    }

    // Get connection statistics
    const stats = await mongoose.connection.db.stats();

    // Get collection information
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Check for each model
    const modelCounts = {};
    for (const collection of collectionNames) {
      try {
        // Handle model name conversion (collection names are usually plural and lowercase)
        // This is a simplification and might need adjustment
        const count = await mongoose.connection.db.collection(collection).countDocuments();
        modelCounts[collection] = count;
      } catch (err) {
        modelCounts[collection] = 'Error counting';
      }
    }

    return {
      status: 'ok',
      connection: true,
      message: 'Database connected',
      readyState: mongoose.connection.readyState,
      dbName: mongoose.connection.name,
      collections: collectionNames,
      counts: modelCounts,
      stats: {
        dbSize: (stats.dataSize / (1024 * 1024)).toFixed(2) + ' MB',
        documents: stats.objects,
        collections: stats.collections
      }
    };
  } catch (error) {
    console.error('Database health check error:', error);
    return {
      status: 'error',
      connection: false,
      message: `Database health check failed: ${error.message}`,
      error: error.toString()
    };
  }
};

module.exports = { checkDatabaseHealth }; 