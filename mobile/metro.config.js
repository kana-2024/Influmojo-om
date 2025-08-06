const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for Reanimated
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Handle missing files gracefully
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config; 