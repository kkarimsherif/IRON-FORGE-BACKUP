const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

// Path to logs directory
const logsDir = path.join(__dirname, '../../logs');

/**
 * Log a message to a file
 * @param {string} message - Message to log
 * @param {string} level - Log level (info, error, warn)
 * @param {string} filename - Log filename (optional)
 */
const logToFile = (message, level = 'info', filename = 'app.log') => {
  try {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Format date for log entry
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    
    // Create log entry
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    // Append to log file
    fs.appendFileSync(path.join(logsDir, filename), logEntry);
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
};

/**
 * Clean up old log files
 * @param {number} days - Number of days to keep logs (default: 7)
 */
const cleanupLogs = async (days = 7) => {
  try {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      return;
    }
    
    // Get all files in logs directory
    const files = fs.readdirSync(logsDir);
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Check each file
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      
      // Get file stats
      const stats = fs.statSync(filePath);
      
      // Check if file is older than cutoff date
      if (stats.mtime < cutoffDate) {
        // Delete file
        fs.unlinkSync(filePath);
        console.log(`Deleted old log file: ${file}`);
      }
    }
    
    console.log('Log cleanup completed');
  } catch (error) {
    console.error('Error cleaning up logs:', error);
  }
};

module.exports = {
  logToFile,
  cleanupLogs,
  
  // Convenience methods
  info: (message, filename) => logToFile(message, 'info', filename),
  error: (message, filename) => logToFile(message, 'error', filename),
  warn: (message, filename) => logToFile(message, 'warn', filename),
  debug: (message, filename) => logToFile(message, 'debug', filename),
}; 