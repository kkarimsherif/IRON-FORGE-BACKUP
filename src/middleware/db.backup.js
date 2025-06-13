const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { logger } = require('./logger');

// Make sure backup directory exists
const backupDir = path.join(process.cwd(), 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

/**
 * Backs up database collections to JSON files
 * @param {Array} collectionNames - Names of collections to backup (empty for all)
 * @returns {Promise<Object>} - Status object with backup details
 */
const backupDatabase = async (collectionNames = []) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database backup failed: MongoDB not connected');
      return {
        success: false,
        error: 'MongoDB not connected',
        timestamp: new Date()
      };
    }

    // Get current timestamp for backup filename
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}`);
    
    // Create backup directory for this backup
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath);
    }

    // Get all collections if none specified
    let collections = collectionNames;
    if (!collections || collections.length === 0) {
      const collectionsInfo = await mongoose.connection.db.listCollections().toArray();
      collections = collectionsInfo.map(c => c.name);
    }

    logger.info(`Starting database backup for collections: ${collections.join(', ')}`);

    // Backup each collection
    const results = {};
    for (const collectionName of collections) {
      try {
        // Get all documents from the collection
        const documents = await mongoose.connection.db.collection(collectionName).find({}).toArray();
        
        // Save to file
        const filePath = path.join(backupPath, `${collectionName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
        
        results[collectionName] = {
          success: true,
          count: documents.length,
          file: filePath
        };
        
        logger.info(`Backed up ${documents.length} documents from ${collectionName}`);
      } catch (err) {
        results[collectionName] = {
          success: false,
          error: err.message
        };
        
        logger.error(`Error backing up collection ${collectionName}: ${err.message}`);
      }
    }

    // Create backup metadata file
    const metadata = {
      timestamp: new Date(),
      collections: results,
      dbName: mongoose.connection.name
    };
    
    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    logger.info(`Database backup completed successfully to ${backupPath}`);
    
    return {
      success: true,
      path: backupPath,
      timestamp: new Date(),
      collections: results
    };
  } catch (error) {
    logger.error(`Database backup failed: ${error.message}`, { error });
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date()
    };
  }
};

/**
 * Restores database collections from a backup
 * @param {String} backupPath - Path to the backup directory
 * @param {Array} collectionNames - Names of collections to restore (empty for all)
 * @returns {Promise<Object>} - Status object with restore details
 */
const restoreDatabase = async (backupPath, collectionNames = []) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database restore failed: MongoDB not connected');
      return {
        success: false,
        error: 'MongoDB not connected',
        timestamp: new Date()
      };
    }

    // Check if backup path exists
    if (!fs.existsSync(backupPath)) {
      logger.error(`Database restore failed: Backup path ${backupPath} does not exist`);
      return {
        success: false,
        error: `Backup path ${backupPath} does not exist`,
        timestamp: new Date()
      };
    }

    // Check for metadata file
    const metadataPath = path.join(backupPath, 'metadata.json');
    if (!fs.existsSync(metadataPath)) {
      logger.error(`Database restore failed: Metadata file not found in ${backupPath}`);
      return {
        success: false,
        error: 'Metadata file not found',
        timestamp: new Date()
      };
    }

    // Read metadata
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Get all collections if none specified
    let collections = collectionNames;
    if (!collections || collections.length === 0) {
      collections = Object.keys(metadata.collections);
    }

    logger.info(`Starting database restore for collections: ${collections.join(', ')}`);

    // Restore each collection
    const results = {};
    for (const collectionName of collections) {
      try {
        // Check if backup file exists for this collection
        const collectionBackupPath = path.join(backupPath, `${collectionName}.json`);
        if (!fs.existsSync(collectionBackupPath)) {
          results[collectionName] = {
            success: false,
            error: `Backup file not found for collection ${collectionName}`
          };
          continue;
        }

        // Read backup data
        const backupData = JSON.parse(fs.readFileSync(collectionBackupPath, 'utf8'));
        if (!Array.isArray(backupData)) {
          results[collectionName] = {
            success: false,
            error: `Invalid backup data for collection ${collectionName}`
          };
          continue;
        }

        // Clear existing data
        await mongoose.connection.db.collection(collectionName).deleteMany({});
        
        // Restore data (if not empty)
        if (backupData.length > 0) {
          await mongoose.connection.db.collection(collectionName).insertMany(backupData);
        }
        
        results[collectionName] = {
          success: true,
          count: backupData.length
        };
        
        logger.info(`Restored ${backupData.length} documents to ${collectionName}`);
      } catch (err) {
        results[collectionName] = {
          success: false,
          error: err.message
        };
        
        logger.error(`Error restoring collection ${collectionName}: ${err.message}`);
      }
    }

    logger.info('Database restore completed');
    
    return {
      success: true,
      path: backupPath,
      timestamp: new Date(),
      collections: results
    };
  } catch (error) {
    logger.error(`Database restore failed: ${error.message}`, { error });
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date()
    };
  }
};

module.exports = {
  backupDatabase,
  restoreDatabase
}; 