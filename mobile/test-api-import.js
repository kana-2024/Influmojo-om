// Simple test to verify API import
const { authAPI } = require('./services/apiService');

console.log('Testing API import...');
console.log('authAPI exists:', !!authAPI);
console.log('authAPI.sendOTP exists:', !!authAPI?.sendOTP);
console.log('authAPI methods:', Object.keys(authAPI || {}));

if (authAPI && authAPI.sendOTP) {
  console.log('✅ API import is working correctly');
} else {
  console.log('❌ API import has issues');
} 