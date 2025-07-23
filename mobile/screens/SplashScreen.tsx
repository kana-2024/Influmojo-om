import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, ActivityIndicator } from 'react-native';
import { getToken } from '../services/storage';
import { authAPI } from '../services/apiService';

// debug logging
console.log('=== SplashScreen Loading ===');
console.log('SplashScreen component is being rendered');

const SplashScreen = ({ navigation }: any) => {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const spinnerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        // Check if user has a valid token
        const token = await getToken();
        
        if (token) {
          // User is logged in, check their profile
          const profile = await authAPI.getUserProfile();
          const userType = profile.user?.user_type || 'creator';
          
          // Navigate to appropriate screen based on user type
          if (userType === 'brand') {
            navigation.replace('Home', { activeTab: 'home' });
          } else {
            navigation.replace('CreatorProfile');
          }
        } else {
          // No token, show welcome screen
          navigation.replace('Welcome');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // On error, show welcome screen
        navigation.replace('Welcome');
      }
    };

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
        checkAuthAndNavigate();
      }, 1500);
    });
  }, []);

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
        <Image source={require('../assets/Asset37.png')} style={styles.logo} resizeMode="contain" />
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
        <ActivityIndicator size="large" color="#fff" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FC5213',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default SplashScreen; 