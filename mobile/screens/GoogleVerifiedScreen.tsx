import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect, useState } from 'react';
import * as apiService from '../services/apiService';

const GoogleVerifiedScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      // Get user profile to determine user type
      const profile = await apiService.authAPI.getUserProfile();
      const userType = profile.user?.userType || profile.user?.user_type || 'creator';
      
      console.log('🔍 GoogleVerifiedScreen: User profile loaded:', {
        userType: userType,
        user: profile.user
      });
      
      // Navigate to appropriate profile setup screen
      if (userType === 'brand') {
        navigation.navigate('BrandProfileSetup');
      } else {
        navigation.navigate('ProfileSetup');
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      // Default to creator profile setup
      navigation.navigate('ProfileSetup');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  }, []);
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>
      {/* Illustration */}
      <Image
        source={require('../assets/06.jpg')}
        style={styles.illustration}
        resizeMode="cover"
      />
      {/* Checkmark */}
      <View style={styles.checkCircle}>
        <Ionicons name="checkmark" size={40} color="#22C55E" />
      </View>
      {/* Success Message */}
      <Text style={styles.title}>Your Google account has been verified.</Text>
      <Text style={styles.description}>
        We have successfully verified your Google account you can now give few personal details to access your dashboard.
      </Text>
      {/* Next Button */}
      <TouchableOpacity 
        style={[styles.nextButton, loading && { opacity: 0.7 }]} 
        onPress={handleNext}
        disabled={loading}
      >
        <Text style={styles.nextText}>{loading ? 'Loading...' : 'Next'}</Text>
        {!loading && <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />}
      </TouchableOpacity>
      {/* Login Link */}
      <TouchableOpacity style={styles.loginRow} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Already have an account ? <Text style={styles.loginLink}>Login here</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingHorizontal: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  illustration: {
    width: 180,
    height: 120,
    marginBottom: 16,
    marginTop: 8,
    resizeMode: 'contain',
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0FCE5',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1D1F',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B2C',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  nextText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loginRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  loginLink: {
    color: '#2563EB',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});

export default GoogleVerifiedScreen; 