import 'react-native-url-polyfill/auto';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { registerRootComponent } from 'expo';
import OnboardingScreen1 from './screens/OnboardingScreen1';
import OnboardingScreen2 from './screens/OnboardingScreen2';
import OnboardingScreen3 from './screens/OnboardingScreen3';
import OtpVerificationScreen from './screens/OtpVerificationScreen';
import MobileVerifiedScreen from './screens/MobileVerifiedScreen';
import GoogleVerifiedScreen from './screens/GoogleVerifiedScreen';
import OnboardingStep1 from './screens/OnboardingStep1';
import ObStep2 from './screens/ObStep2';
import Profile from './screens/Profile';
import ObCompleted from './screens/ObCompleted';
import CreatePackageScreen from './screens/CreatePackageScreen';
import * as NavigationBar from 'expo-navigation-bar';
import SplashScreen from './screens/SplashScreen';



if (__DEV__) {
  const { LogBox } = require('react-native');
  LogBox.ignoreLogs(['Require cycle:']);
  
  // Enhanced error logging with stack traces
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
    // This prevents the warning on newer Android versions
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
          >
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="Onboarding1" component={OnboardingScreen1} />
            <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
            <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />
            <Stack.Screen name="OtpVerificationScreen" component={OtpVerificationScreen} />
            <Stack.Screen name="MobileVerifiedScreen" component={MobileVerifiedScreen} />
            <Stack.Screen name="GoogleVerifiedScreen" component={GoogleVerifiedScreen} />
            <Stack.Screen name="OnboardingStep1" component={OnboardingStep1} />
            <Stack.Screen name="ObStep2" component={ObStep2} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="ObCompleted" component={ObCompleted} />
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

// Register the app component
registerRootComponent(App);
