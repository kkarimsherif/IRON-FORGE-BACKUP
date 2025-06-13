const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Custom morgan token for request body
morgan.token('body', (req) => {
  if (req.body && Object.keys(req.body).length) {
    // Mask sensitive data
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '********';
    if (sanitizedBody.cardNumber) sanitizedBody.cardNumber = '********';
    if (sanitizedBody.cvv) sanitizedBody.cvv = '***';
    
    return JSON.stringify(sanitizedBody);
  }
  return '';
});

// Request logger middleware
const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms :body',
  { stream: accessLogStream }
);

module.exports = { requestLogger }; 