const cron = require('node-cron');
const { cleanupLogs } = require('../utils/logger');

/**
 * Initialize all application schedulers
 */
const initSchedulers = () => {
  try {
    console.log('Starting application schedulers...');
    
    // Clean up logs weekly (every Sunday at midnight)
    cron.schedule('0 0 * * 0', async () => {
      console.log('Running scheduled log cleanup');
      await cleanupLogs();
    });
    
    // Add more schedulers as needed
    
    console.log('All schedulers initialized successfully');
  } catch (error) {
    console.error('Error initializing schedulers:', error);
  }
};

module.exports = { initSchedulers }; 