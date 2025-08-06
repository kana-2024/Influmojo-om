#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Metro cache issues...');

try {
  // Clear Metro cache
  console.log('Clearing Metro cache...');
  execSync('npx expo start --clear', { stdio: 'inherit' });
} catch (error) {
  console.log('Failed to clear cache with expo, trying alternative methods...');
  
  try {
    // Try clearing node_modules and reinstalling
    console.log('Clearing node_modules...');
    execSync('rm -rf node_modules', { stdio: 'inherit' });
    execSync('npm install', { stdio: 'inherit' });
  } catch (err) {
    console.log('Failed to clear node_modules:', err.message);
  }
  
  try {
    // Clear Metro cache directory
    const metroCachePath = path.join(__dirname, '..', 'node_modules', '.cache');
    if (fs.existsSync(metroCachePath)) {
      console.log('Clearing Metro cache directory...');
      execSync(`rm -rf "${metroCachePath}"`, { stdio: 'inherit' });
    }
  } catch (err) {
    console.log('Failed to clear Metro cache directory:', err.message);
  }
}

console.log('✅ Metro cache fix completed. Please restart your development server.'); 