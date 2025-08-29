const http = require('http');

console.log('Testing network connectivity...');

// Test 1: Localhost
const testLocal = () => {
  const req = http.request({
    hostname: 'localhost',
    port: 3002,
    path: '/api/health',
    method: 'GET'
  }, (res) => {
    console.log('✅ Localhost: OK');
  });
  
  req.on('error', (err) => {
    console.log('❌ Localhost: Failed -', err.message);
  });
  
  req.end();
};

// Test 2: Network IP
const testNetwork = () => {
  const req = http.request({
    hostname: '192.168.31.57',
    port: 3002,
    path: '/api/health',
    method: 'GET'
  }, (res) => {
    console.log('✅ Network IP: OK');
  });
  
  req.on('error', (err) => {
    console.log('❌ Network IP: Failed -', err.message);
  });
  
  req.end();
};

testLocal();
setTimeout(testNetwork, 1000); 