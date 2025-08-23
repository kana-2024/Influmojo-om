#!/usr/bin/env node

/**
 * Environment Migration Script for Influmojo
 * 
 * This script helps migrate from multiple .env files to the consolidated approach
 * 
 * Usage: node migrate-env.js
 */

const fs = require('fs');
const path = require('path');

// Directories to process
const DIRECTORIES = [
  'backend',
  'mobile', 
  'webapp',
  'admin-dashboard'
];

// Files to backup and remove
const ENV_FILES = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.production'
];

function backupEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Backed up: ${filePath} → ${backupPath}`);
    return backupPath;
  }
  return null;
}

function removeEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🗑️  Removed: ${filePath}`);
    return true;
  }
  return false;
}

function createSymlink(sourcePath, targetPath) {
  try {
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    fs.symlinkSync(sourcePath, targetPath, 'file');
    console.log(`🔗 Created symlink: ${targetPath} → ${sourcePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create symlink ${targetPath}:`, error.message);
    return false;
  }
}

function migrateDirectory(dirPath) {
  console.log(`\n📁 Processing directory: ${dirPath}`);
  
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory doesn't exist: ${dirPath}`);
    return;
  }
  
  let backupCount = 0;
  let removeCount = 0;
  let symlinkCount = 0;
  
  // Process .env files
  for (const envFile of ENV_FILES) {
    const fullPath = path.join(dirPath, envFile);
    
    if (fs.existsSync(fullPath)) {
      // Backup the file
      const backupPath = backupEnvFile(fullPath);
      if (backupPath) backupCount++;
      
      // Remove the original
      if (removeEnvFile(fullPath)) removeCount++;
      
      // Create symlink to root .env (optional)
      const rootEnvPath = path.join(__dirname, '.env');
      if (fs.existsSync(rootEnvPath)) {
        if (createSymlink(rootEnvPath, fullPath)) symlinkCount++;
      }
    }
  }
  
  console.log(`📊 Results for ${dirPath}:`);
  console.log(`   Backed up: ${backupCount} files`);
  console.log(`   Removed: ${removeCount} files`);
  console.log(`   Symlinks created: ${symlinkCount} files`);
}

function createEnvImportFile(dirPath) {
  const importContent = `# This file imports environment variables from the root .env file
# For AWS deployment, use the consolidated approach instead

# Import from root (if using symlinks)
# source ../../.env

# Or copy the relevant variables here
# Example:
# API_URL=\${API_URL}
# GOOGLE_CLIENT_ID=\${GOOGLE_CLIENT_ID}
`;

  const importPath = path.join(dirPath, '.env.import');
  fs.writeFileSync(importPath, importContent);
  console.log(`📝 Created import file: ${importPath}`);
}

function main() {
  console.log('🚀 Starting Environment Migration for Influmojo...\n');
  
  // Check if root .env exists
  const rootEnvPath = path.join(__dirname, '.env');
  if (!fs.existsSync(rootEnvPath)) {
    console.error('❌ Root .env file not found. Please create it first.');
    process.exit(1);
  }
  
  console.log('✅ Root .env file found');
  
  // Process each directory
  for (const dir of DIRECTORIES) {
    migrateDirectory(dir);
    createEnvImportFile(dir);
  }
  
  console.log('\n🎉 Migration Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Review the backup files created');
  console.log('2. Update your applications to use the root .env file');
  console.log('3. For AWS deployment, use setup-aws-params.js');
  console.log('4. Remove backup files once you\'re confident everything works');
  
  console.log('\n⚠️  Important Notes:');
  console.log('- All original .env files have been backed up with .backup.[timestamp]');
  console.log('- Symlinks have been created to the root .env file');
  console.log('- You can remove the symlinks if you prefer direct file copying');
  console.log('- For production, consider using AWS Parameter Store instead');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { migrateDirectory, backupEnvFile, removeEnvFile };
