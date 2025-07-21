#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Build Optimization Script');
console.log('============================');

// Check for large assets
const assetsDir = path.join(__dirname, '../assets');
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const largeFiles = files.filter(file => {
    const filePath = path.join(assetsDir, file);
    const stats = fs.statSync(filePath);
    return stats.size > 100 * 1024; // Files larger than 100KB
  });
  
  if (largeFiles.length > 0) {
    console.log('⚠️  Large asset files detected:');
    largeFiles.forEach(file => {
      const filePath = path.join(assetsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   ${file}: ${(stats.size / 1024).toFixed(1)}KB`);
    });
    console.log('💡 Consider optimizing these images for faster builds');
  }
}

// Check for console.log statements
const sourceDir = path.join(__dirname, '..');
function findConsoleLogs(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let totalLogs = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      totalLogs += findConsoleLogs(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const logs = (content.match(/console\.log/g) || []).length;
      if (logs > 0) {
        console.log(`   ${fullPath.replace(sourceDir, '')}: ${logs} console.log statements`);
        totalLogs += logs;
      }
    }
  }
  
  return totalLogs;
}

console.log('\n📊 Console.log statements found:');
const totalLogs = findConsoleLogs(sourceDir);
console.log(`   Total: ${totalLogs} console.log statements`);

if (totalLogs > 20) {
  console.log('💡 Consider wrapping console.log statements with __DEV__ checks for production builds');
}

console.log('\n✅ Build optimization check complete!');
console.log('💡 Tips for faster builds:');
console.log('   1. Use __DEV__ checks around console.log statements');
console.log('   2. Optimize large image assets');
console.log('   3. Consider using expo-optimize for asset optimization');
console.log('   4. Use expo build:clean to clear cache if needed'); 