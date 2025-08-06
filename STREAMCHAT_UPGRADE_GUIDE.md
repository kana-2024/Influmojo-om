# StreamChat Upgrade Guide - From stream-chat-expo to stream-chat-react-native

## 🎯 Overview

This guide helps you upgrade from the deprecated `stream-chat-expo` package to the modern `stream-chat-react-native` package for Expo SDK 50+ compatibility.

## ✅ Why Upgrade?

- **Deprecated Package**: `stream-chat-expo@0.1.x` is deprecated and not compatible with modern Expo (SDK 50+)
- **Better Support**: `stream-chat-react-native` is actively maintained and supports Expo SDK 50+
- **Improved Performance**: Better React Native integration and performance optimizations
- **Future-Proof**: Compatible with latest React Native and Expo versions

## 🔄 Step-by-Step Upgrade

### 1. Remove Old Package

```bash
cd mobile
npm uninstall stream-chat-expo
```

### 2. Install New Dependencies

```bash
# Install core dependencies with Expo (recommended versions for SDK 53)
npx expo install stream-chat@6.5.2 stream-chat-react-native@6.3.1 react-native-gesture-handler@2.15.0 react-native-reanimated@3.7.0 react-native-safe-area-context@4.7.1
```

**If you encounter peer dependency issues, use:**
```bash
npx expo install stream-chat@6.5.2 stream-chat-react-native@6.3.1 react-native-gesture-handler@2.15.0 react-native-reanimated@3.7.0 react-native-safe-area-context@4.7.1 --legacy-peer-deps
```

### 3. Update Imports

**Before (stream-chat-expo):**
```tsx
import {
  Chat,
  Channel,
  MessageInput,
  MessageList,
  OverlayProvider,
} from 'stream-chat-expo';
```

**After (stream-chat-react-native):**
```tsx
import {
  Chat,
  Channel,
  MessageInput,
  MessageList,
  OverlayProvider,
} from 'stream-chat-react-native';
```

### 4. Update Component Usage

The component usage remains the same, but now uses the modern package:

```tsx
import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  MessageInput,
  MessageList,
  OverlayProvider,
} from 'stream-chat-react-native';

export default function TicketChat({ ticketId, onClose }) {
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);

  // ... initialization logic

  return (
    <SafeAreaView style={styles.container}>
      <OverlayProvider>
        <Chat client={client}>
          <Channel channel={channel}>
            <MessageList />
            <MessageInput />
          </Channel>
        </Chat>
      </OverlayProvider>
    </SafeAreaView>
  );
}
```

## 📦 Package Summary

| Package | Purpose | Version |
|---------|---------|---------|
| `stream-chat` | Core SDK | `6.5.2` |
| `stream-chat-react-native` | React Native UI components | `6.3.1` |
| `react-native-gesture-handler` | Required by chat UI | `2.15.0` |
| `react-native-reanimated` | Required by chat UI | `3.7.0` |
| `react-native-safe-area-context` | Safe area handling | `4.7.1` |

## 🔧 Configuration

### Expo Configuration

Make sure your `app.config.js` includes the necessary plugins:

```javascript
export default {
  expo: {
    // ... other config
    plugins: [
      "./plugins/withGoogleSignIn.js",
      "react-native-reanimated/plugin"
    ],
    // ... rest of config
  }
};
```

### Babel Configuration

Ensure your `babel.config.js` includes the Reanimated plugin:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

## 🧪 Testing

### 1. Test Installation

```bash
cd mobile
npm list stream-chat-react-native
```

### 2. Test Component

```tsx
// Test the updated component
import TicketChat from '../components/TicketChat';

// Use in your app
<TicketChat
  ticketId="123"
  onClose={() => navigation.goBack()}
/>
```

### 3. Test Chat Functionality

- ✅ Initialize StreamChat client
- ✅ Connect user to chat
- ✅ Join ticket channel
- ✅ Send and receive messages
- ✅ Handle errors gracefully

## 🚨 Common Issues & Solutions

### Issue 1: Reanimated Plugin Error

**Error**: `react-native-reanimated/plugin` not found

**Solution**:
```bash
# Reinstall reanimated
npx expo install react-native-reanimated@3.7.0

# Clear cache
npx expo start --clear
```

### Issue 2: Gesture Handler Not Working

**Error**: Gesture handler not responding

**Solution**:
```bash
# Reinstall gesture handler
npx expo install react-native-gesture-handler@2.15.0

# Ensure proper setup in App.js
import 'react-native-gesture-handler';
```

### Issue 3: Safe Area Issues

**Error**: Content not respecting safe areas

**Solution**:
```bash
# Reinstall safe area context
npx expo install react-native-safe-area-context@4.7.1

# Wrap your app with SafeAreaProvider
import { SafeAreaProvider } from 'react-native-safe-area-context';
```

### Issue 4: Peer Dependency Conflicts

**Error**: npm install fails due to peer dependencies

**Solution**:
```bash
# Use legacy peer deps
npx expo install stream-chat@5.19.0 stream-chat-react-native@6.3.1 react-native-gesture-handler@2.15.0 react-native-reanimated@3.7.0 react-native-safe-area-context@4.7.1 --legacy-peer-deps
```

## 📚 Migration Checklist

- [ ] Remove `stream-chat-expo` package
- [ ] Install `stream-chat-react-native` package with latest versions
- [ ] Update all imports from `stream-chat-expo` to `stream-chat-react-native`
- [ ] Add Reanimated plugin to `app.config.js`
- [ ] Test component functionality
- [ ] Update documentation
- [ ] Test on both iOS and Android
- [ ] Verify error handling
- [ ] Test with different screen sizes

## 🎯 Benefits After Upgrade

1. **Better Performance**: Improved React Native integration
2. **Modern Support**: Compatible with latest Expo SDK (53+)
3. **Active Maintenance**: Regularly updated and maintained
4. **Better TypeScript Support**: Enhanced type definitions
5. **Improved UI**: Better native feel and animations

## 📞 Support

If you encounter issues during the upgrade:

1. **Check Documentation**: [StreamChat React Native Docs](https://getstream.io/chat/docs/react-native/)
2. **Community Support**: [StreamChat Community](https://github.com/GetStream/stream-chat-react-native)
3. **Expo Support**: [Expo Documentation](https://docs.expo.dev/)

---

## ✅ Summary

This upgrade ensures your StreamChat integration is:
- ✅ **Future-proof** with modern Expo SDK support
- ✅ **Performance optimized** with better React Native integration
- ✅ **Actively maintained** with regular updates
- ✅ **Type-safe** with improved TypeScript support

The migration is straightforward and maintains the same API while providing better performance and compatibility. 