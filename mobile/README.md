# Influmojo Mobile App

## Recent Fixes (Latest Update)

### Authentication Issues Fixed

1. **"No token provided" Error**: Fixed authentication flow to properly handle missing tokens
2. **Metro Bundler Error**: Added cache clearing solution for InternalBytecode.js error

### Quick Fix Commands

If you encounter authentication or Metro bundler issues, run these commands:

```bash
# Clear Metro cache and restart
npx expo start --clear

# If that doesn't work, try clearing node_modules
rm -rf node_modules
npm install
npx expo start --clear

# For Windows users
rmdir /s node_modules
npm install
npx expo start --clear
```

### Authentication Flow

The app now properly:
- Checks for stored authentication tokens on startup
- Initializes Redux state with stored user data
- Handles authentication errors gracefully
- Shows appropriate error messages for unauthenticated users

### Error Handling

- **Authentication Required**: Users will see a clear message when authentication is needed
- **Retry Mechanism**: Users can retry failed requests
- **Navigation**: Users can navigate to login screen when needed

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. For Android:
```bash
npx expo run:android
```

4. For iOS:
```bash
npx expo run:ios
```

## Troubleshooting

### Common Issues

1. **Metro Bundler Error**: Clear cache with `npx expo start --clear`
2. **Authentication Issues**: Check if user is properly logged in
3. **Build Errors**: Clear node_modules and reinstall

### Debug Mode

Enable debug logging by setting `__DEV__` to true in the app.

## API Configuration

The app uses the following API endpoints:
- Base URL: `https://fair-legal-gar.ngrok-free.app`
- Authentication: JWT tokens stored in AsyncStorage
- Error Handling: Comprehensive error handling for network issues

## File Structure

```
mobile/
├── screens/           # Screen components
├── components/        # Reusable components
├── services/         # API and utility services
├── store/           # Redux store and slices
├── config/          # Configuration files
└── assets/          # Images and static assets
``` 