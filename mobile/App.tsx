import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { registerRootComponent } from 'expo';
import WelcomeScreen from './screens/WelcomeScreen';
import UserRoleScreen from './screens/UserRoleScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import OtpVerificationScreen from './screens/OtpVerificationScreen';
import MobileVerifiedScreen from './screens/MobileVerifiedScreen';
import GoogleVerifiedScreen from './screens/GoogleVerifiedScreen';
import CreatorPreferencesScreen from './screens/creator/CreatorPreferencesScreen';
import BrandPreferencesScreen from './screens/brand/BrandPreferencesScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import BrandProfileSetupScreen from './screens/brand/BrandProfileSetupScreen';

import CreatorProfile from './screens/creator/CreatorProfile';
import BrandProfile from './screens/brand/BrandProfile';
import ProfileCompleteScreen from './screens/ProfileCompleteScreen';
import CreatePackageScreen from './screens/creator/CreatePackageScreen';
import * as NavigationBar from 'expo-navigation-bar';
import SplashScreen from './screens/SplashScreen';
import { ENV } from './config/env';



if (__DEV__) {
  const { LogBox } = require('react-native');
  LogBox.ignoreLogs(['Require cycle:']);
  
  // Error logging with stack traces
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError(...args);
    if (args[0]?.includes?.('Cannot read property')) {
      console.log('=== HERMES ERROR DETECTED ===');
      console.log('Error message:', args[0]);
      console.log('Full error args:', args);
      
      // Get stack trace
      const stack = new Error().stack;
      console.log('Stack trace:', stack);
      
      // Log current module info (Hermes compatible)
      console.log('Current module: App.tsx');
      console.log('========================');
    }
  };
  
  // Log module loading
  console.log('App.tsx loading...');
}

// Add debug logging
console.log('=== App.tsx Loading ===');
console.log('App component is being rendered');

const Stack = createNativeStackNavigator();

// Error Boundary Component
class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <Text style={styles.errorSubtext}>Please restart the app.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    // Check if edge-to-edge is enabled before setting background color
    NavigationBar.setButtonStyleAsync('dark');
    
    // Only set background color if edge-to-edge is not enabled
    try {
      NavigationBar.setBackgroundColorAsync('#F8F9FB');
    } catch (error) {
      // Ignore error if edge-to-edge is enabled
      console.log('Background color setting skipped (edge-to-edge enabled)');
    }
  }, []);
  
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="SplashScreen"
            screenOptions={{
              headerShown: false
            }}
            id={undefined}
          >
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="UserRole" component={UserRoleScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
            <Stack.Screen name="MobileVerification" component={MobileVerifiedScreen} />
            <Stack.Screen name="GoogleVerification" component={GoogleVerifiedScreen} />
            <Stack.Screen name="CreatorPreferences" component={CreatorPreferencesScreen} />
            <Stack.Screen name="BrandPreferences" component={BrandPreferencesScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="BrandProfileSetup" component={BrandProfileSetupScreen} />

            <Stack.Screen name="CreatorProfile" component={CreatorProfile} />
            <Stack.Screen name="BrandProfile" component={BrandProfile} />
            <Stack.Screen name="ProfileComplete" component={ProfileCompleteScreen} />
            <Stack.Screen name="CreatePackage" component={CreatePackageScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B2C',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
console.log("🔍 API_BASE_URL:", ENV.API_BASE_URL);
// Register the app component
registerRootComponent(App);
