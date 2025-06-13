/**
 * Port Conflict Resolution Script
 * 
 * This script will:
 * 1. Check if port 5003 is in use
 * 2. Find the process ID using that port
 * 3. Provide commands to kill the process
 */

const { exec } = require('child_process');
const os = require('os');

const PORT = 5003;

// Function to check if running on Windows
function isWindows() {
  return os.platform() === 'win32';
}

// Function to find process using port 5003
function findProcessUsingPort() {
  return new Promise((resolve, reject) => {
    let command;
    if (isWindows()) {
      // Windows command to find process using port
      command = `netstat -ano | findstr :${PORT}`;
    } else {
      // Unix/Linux/Mac command to find process using port
      command = `lsof -i :${PORT} | grep LISTEN`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        if (error.code === 1) {
          // No process found using the port
          resolve(null);
        } else {
          reject(error);
        }
        return;
      }

      if (stderr) {
        reject(new Error(stderr));
        return;
      }

      resolve(stdout);
    });
  });
}

// Function to parse process ID from netstat output
function parseProcessId(output) {
  if (!output) {
    return null;
  }

  try {
    if (isWindows()) {
      // Parse Windows netstat output
      const lines = output.trim().split('\n');
      if (lines.length > 0) {
        const firstLine = lines[0];
        const parts = firstLine.trim().split(/\s+/);
        // PID is the last column in Windows netstat output
        return parts[parts.length - 1];
      }
    } else {
      // Parse Unix/Linux/Mac lsof output
      const lines = output.trim().split('\n');
      if (lines.length > 0) {
        const firstLine = lines[0];
        const parts = firstLine.trim().split(/\s+/);
        // PID is the second column in lsof output
        return parts[1];
      }
    }
  } catch (error) {
    console.error('Error parsing process ID:', error);
  }

  return null;
}

// Main function
async function main() {
  console.log(`\n=== Port ${PORT} Conflict Resolution ===`);
  console.log(`Checking if port ${PORT} is in use...`);

  try {
    const output = await findProcessUsingPort();
    
    if (!output) {
      console.log(`\nPort ${PORT} is not currently in use.`);
      console.log('You can start your application without conflicts.');
      return;
    }

    console.log(`\nPort ${PORT} is currently in use.`);
    console.log('\nProcess details:');
    console.log(output);

    const pid = parseProcessId(output);
    
    if (pid) {
      console.log(`\nProcess ID (PID): ${pid}`);
      
      console.log('\nTo resolve the conflict, you can:');
      
      if (isWindows()) {
        console.log(`1. Run: taskkill /F /PID ${pid}`);
      } else {
        console.log(`1. Run: kill -9 ${pid}`);
      }
      
      console.log('2. Change the port in your .env file');
      console.log('3. Use a different port when starting your application');
      
      console.log('\nOption 1 will kill the process using port 5003.');
      console.log('Option 2 will update your application to use a different port.');
      console.log('Option 3 is a temporary solution for this session only.');
    } else {
      console.log('\nCould not determine the process ID.');
      console.log('Try changing the port in your .env file to resolve the conflict.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the script
main(); 