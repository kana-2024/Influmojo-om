const http = require('http');

// Test localhost connection
const testLocalhost = () => {
  const req = http.request({
    hostname: 'localhost',
    port: 3002,
    path: '/api/health',
    method: 'GET'
  }, (res) => {
    console.log('✅ Localhost connection successful');
    console.log('Status:', res.statusCode);
    res.on('data', (chunk) => {
      console.log('Response:', chunk.toString());
    });
  });
  
  req.on('error', (err) => {
    console.log('❌ Localhost connection failed:', err.message);
  });
  
  req.end();
};

// Test network connection
const testNetwork = () => {
  const req = http.request({
    hostname: '192.168.31.57',
    port: 3002,
    path: '/api/health',
    method: 'GET'
  }, (res) => {
    console.log('✅ Network connection successful');
    console.log('Status:', res.statusCode);
    res.on('data', (chunk) => {
      console.log('Response:', chunk.toString());
    });
  });
  
  req.on('error', (err) => {
    console.log('❌ Network connection failed:', err.message);
  });
  
  req.end();
};

console.log('Testing backend connections...');
console.log('==============================');

setTimeout(testLocalhost, 1000);
setTimeout(testNetwork, 2000); 