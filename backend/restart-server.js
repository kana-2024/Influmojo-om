const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Restarting backend server to apply Zoho service changes...');

// Kill existing Node.js processes (be careful with this in production)
const killProcesses = () => {
  return new Promise((resolve) => {
    const taskkill = spawn('taskkill', ['/F', '/IM', 'node.exe'], { 
      stdio: 'ignore',
      shell: true 
    });
    
    taskkill.on('close', () => {
      console.log('✅ Killed existing Node.js processes');
      resolve();
    });
  });
};

// Start the server
const startServer = () => {
  console.log('🚀 Starting backend server...');
  
  const server = spawn('node', ['src/server.js'], {
    stdio: 'inherit',
    shell: true
  });
  
  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
  });
  
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
  
  return server;
};

// Main restart function
const restartServer = async () => {
  try {
    await killProcesses();
    
    // Wait a moment for processes to fully terminate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    startServer();
    
    console.log('✅ Server restart initiated. Check the server logs for any errors.');
    console.log('💡 You can now test the Zoho chat integration again.');
    
  } catch (error) {
    console.error('❌ Error restarting server:', error);
  }
};

restartServer(); 