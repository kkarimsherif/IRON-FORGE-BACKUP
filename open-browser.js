/**
 * Simple script to open the browser after starting server
 */
const open = require('open');

console.log('Waiting for server to start...');
setTimeout(async () => {
  console.log('Opening browser at http://localhost:5003');
  try {
    await open('http://localhost:5003');
    console.log('Browser opened successfully');
  } catch (err) {
    console.error('Failed to open browser:', err);
  }
}, 3000); // wait 3 seconds 