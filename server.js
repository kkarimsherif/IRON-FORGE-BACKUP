/**
 * IRON FORGE - Fitness Website and E-commerce Platform
 * Main application entry point
 */

// Load environment variables
require('dotenv').config();

// Import application
const app = require('./src/app');

// Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 