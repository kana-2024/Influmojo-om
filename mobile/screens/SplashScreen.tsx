import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { getToken, getUserData } from '../services/storage';
import { loginSuccess, setUserType } from '../store/slices/authSlice';

// debug logging
console.log('=== SplashScreen Loading ===');
console.log('SplashScreen component is being rendered');

const SplashScreen = ({ navigation }: any) => {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const spinnerAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  
  // Get authentication state from Redux
  const { isAuthenticated, user, userType } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        // Check if we have a stored token
        const token = await getToken();
        const storedUserData = await getUserData();
        console.log('[SplashScreen] Token present:', !!token);
        console.log('[SplashScreen] Stored user data:', !!storedUserData);
        console.log('[SplashScreen] Redux auth state:', { isAuthenticated, userType, user: !!user });
        
        // Determine navigation based on authentication state
        let targetScreen = 'Welcome';
        
        if (token && storedUserData) {
          // Initialize Redux state with stored user data
          if (!isAuthenticated || !user) {
            console.log('[SplashScreen] Initializing Redux state with stored user data');
            dispatch(loginSuccess(storedUserData));
            if (storedUserData.user_type) {
              dispatch(setUserType(storedUserData.user_type));
            }
          }
          
          // User is authenticated, navigate to appropriate profile
          const currentUserType = userType || storedUserData.user_type;
          if (currentUserType === 'brand') {
            targetScreen = 'BrandProfile';
          } else {
            targetScreen = 'CreatorProfile';
          }
          console.log('[SplashScreen] Navigating to authenticated screen:', targetScreen);
        } else {
          // No authentication, go to welcome screen
          console.log('[SplashScreen] No authentication found, navigating to Welcome');
        }
        
        // Animate logo and text in
        Animated.sequence([
          Animated.timing(logoAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0.8, 0.2, 1),
          }),
          Animated.timing(textAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.exp),
          }),
          Animated.timing(spinnerAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start(() => {
          setTimeout(() => {
            navigation.replace(targetScreen as never);
          }, 1500);
        });
      } catch (error) {
        console.error('[SplashScreen] Error checking auth state:', error);
        // Fallback to welcome screen on error
        setTimeout(() => {
          navigation.replace('Welcome');
        }, 1500);
      }
    };

    checkAuthAndNavigate();
  }, [isAuthenticated, user, userType, dispatch]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: logoAnim,
          transform: [
            {
              scale: logoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
            {
              translateY: logoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
          ],
        }}
      >
        <View style={styles.logoContainer}>
          {/* Asset logo (first in row) */}
          <Image 
            source={require('../assets/logo/Asset-23@4x-scaled.png')} 
            style={styles.assetLogo} 
            resizeMode="contain" 
          />
          {/* Group logo (next in row) */}
          <Image 
            source={require('../assets/logo/Group.png')} 
            style={styles.groupLogo} 
            resizeMode="contain" 
          />
        </View>
      </Animated.View>
      <Animated.Text
        style={[
          styles.text,
          {
            opacity: textAnim,
            transform: [
              {
                translateY: textAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        Not Just Collabs. Real Connections.
      </Animated.Text>
      <Animated.View style={{ opacity: spinnerAnim, marginTop: 32 }}>
        <ActivityIndicator size="large" color="#f37135" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e8', // Changed to cream color
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 20,
  },
  assetLogo: {
    width: 180,
    height: 90,
    marginRight: -30,
  },
  groupLogo: {
    width: 120,
    height: 90,
  },
  text: {
    color: '#f37135', // Changed to orange color
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default SplashScreen; 
