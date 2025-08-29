# Reanimated Build Fix Guide

## Issue Description
The error `[Reanimated] Babel plugin exception: TypeError: Cannot read properties of undefined (reading 'opts')` occurs when there are conflicts in the Reanimated plugin configuration or version mismatches.

## Root Causes
1. **Duplicate Plugin Configuration**: Reanimated plugin was configured in both `app.config.js` and `babel.config.js`
2. **Version Mismatch**: `stream-chat` version was `^9.14.0` instead of `6.5.2` for mobile compatibility
3. **Cache Issues**: Build cache might contain old configurations

## ✅ Fixed Issues

### 1. Removed Duplicate Plugin Configuration
- **Removed** `"react-native-reanimated/plugin"` from `app.config.js`
- **Kept** `"react-native-reanimated/plugin"` in `babel.config.js` (correct location)

### 2. Updated Stream-Chat Version
- **Changed** `stream-chat` from `^9.14.0` to `6.5.2` in `package.json`
- **Reason**: Mobile compatibility with `stream-chat-react-native@6.3.1` and Expo SDK 53

### 3. Enhanced Metro Configuration
- **Added** platform support in `metro.config.js`
- **Ensures** proper native module resolution

## 🔧 Manual Fix Steps

### Step 1: Clean Installation
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Step 2: Verify Configurations

#### babel.config.js (✅ Correct)
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin'
    ],
  };
};
```

#### app.config.js (✅ Fixed)
```javascript
export default {
  expo: {
    // ... other config
    plugins: [
      "./plugins/withGoogleSignIn.js"
      // Removed: "react-native-reanimated/plugin"
    ],
    // ... rest of config
  }
};
```

#### package.json (✅ Updated)
```json
{
  "dependencies": {
    "react-native-reanimated": "3.7.0",
    "stream-chat": "6.5.2",
    "stream-chat-react-native": "^8.3.2"
  }
}
```

### Step 3: Clear Caches
```bash
npx expo start --clear
npx expo build:clean
```

### Step 4: Rebuild
```bash
eas build --platform android --profile development --clear-cache
```

## 🚀 Automated Fix Script

Run the automated fix script:
```bash
cd mobile
node scripts/fix-reanimated-build.js
```

This script will:
1. Clean `node_modules` and `package-lock.json`
2. Reinstall dependencies with `--legacy-peer-deps`
3. Verify Reanimated version (3.7.0)
4. Check and fix `babel.config.js`
5. Remove Reanimated plugin from `app.config.js`
6. Clean Expo build cache

## 🔍 Troubleshooting

### If Issues Persist

1. **Check Reanimated Version**:
   ```bash
   npm list react-native-reanimated
   ```
   Should show: `react-native-reanimated@3.7.0`

2. **Verify Plugin Configuration**:
   ```bash
   grep -r "react-native-reanimated" .
   ```
   Should only show in `babel.config.js`

3. **Clear All Caches**:
   ```bash
   npx expo start --clear
   npx expo build:clean
   rm -rf .expo
   ```

4. **Check Expo SDK Compatibility**:
   ```bash
   npx expo --version
   ```
   Should be: `53.0.20`

### Common Error Solutions

#### Error: "Cannot read properties of undefined (reading 'opts')"
- **Solution**: Remove Reanimated plugin from `app.config.js`
- **Reason**: Plugin should only be in `babel.config.js`

#### Error: "Module not found"
- **Solution**: Clear Metro cache and restart
- **Command**: `npx expo start --clear`

#### Error: "Peer dependency issues"
- **Solution**: Use `--legacy-peer-deps` flag
- **Command**: `npm install --legacy-peer-deps`

## 📋 Verification Checklist

- [ ] `stream-chat` version is `6.5.2`
- [ ] `react-native-reanimated` version is `3.7.0`
- [ ] Reanimated plugin only in `babel.config.js`
- [ ] Reanimated plugin removed from `app.config.js`
- [ ] Metro config includes platform support
- [ ] All caches cleared
- [ ] Dependencies installed with `--legacy-peer-deps`

## 🎯 Expected Result

After applying these fixes, the EAS build should complete successfully:
```bash
eas build --platform android --profile development
```

The build should show:
```
✅ Build completed successfully
📱 APK generated and ready for download
```

## 📞 Support

If issues persist after following this guide:
1. Check the [Expo Reanimated documentation](https://docs.expo.dev/versions/latest/sdk/reanimated/)
2. Verify [StreamChat React Native compatibility](https://github.com/GetStream/stream-chat-react-native)
3. Review [Expo SDK 53 migration guide](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/) 