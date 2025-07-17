const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg', 'jpeg', 'gif', 'webp');

// Configure module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for symlinks
config.resolver.enableSymlinks = false;

// Configure transformer
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config; 