/**
 * Development server script that automatically opens browser
 */
const { spawn } = require('child_process');
const path = require('path');
const open = require('open');

// Kill any existing processes on port 5003
try {
  const platform = process.platform;
  if (platform === 'win32') {
    spawn('cmd', ['/c', 'for /f "tokens=5" %a in (\'netstat -ano ^| findstr :5003\') do taskkill /F /PID %a'], { stdio: 'ignore' });
  } else {
    spawn('sh', ['-c', 'lsof -ti:5003 | xargs kill -9'], { stdio: 'ignore' });
  }
  console.log('Cleaned up any processes using port 5003');
} catch (err) {
  console.log('No processes found using port 5003');
}

// Wait a moment for port to be released
setTimeout(() => {
  // Run nodemon server using npm
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const server = spawn(npmCmd, ['run', 'dev'], { stdio: 'inherit' });
    
  // Wait for server to start before opening browser
  setTimeout(() => {
    console.log('Opening browser at http://localhost:5003');
    // Using the correct open package syntax
    (async () => {
      await open('http://localhost:5003');
      console.log('Browser opened');
    })();
  }, 3000);
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
  });
}, 1000); 