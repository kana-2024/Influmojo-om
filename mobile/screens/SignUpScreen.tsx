import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ENV, API_ENDPOINTS } from '../config/env';
import { FONTS } from '../config/fonts';
import { COLORS } from '../config/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { StatusBar } from 'react-native';
import googleAuthService from '../services/googleAuth';
import * as apiService from '../services/apiService';

// Test backend connectivity
const testBackendConnection = async () => {
  try {
    console.log('Testing backend connectivity...');
    const response = await fetch(API_ENDPOINTS.LOGIN, { method: 'HEAD' });
    console.log('Backend connectivity test response:', response.status);
    return response.ok;
  } catch (error) {
    console.error('Backend connectivity test failed:', error);
    return false;
  }
};

const SignUpScreen = ({ navigation, route }: any) => {
  useEffect(() => {
    // NavigationBar.setBackgroundColorAsync('#ffffff'); // Removed as per edit hint
    // NavigationBar.setButtonStyleAsync('dark'); // Removed as per edit hint
  }, []);

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const userType = route.params?.userType || 'creator'; // Get user type from navigation params

  const handleGoogleAuth = async () => {
    setWarning('');
    setGoogleLoading(true);
    
    // Test backend connectivity first
    const backendOk = await testBackendConnection();
    
          try {
        const result = await googleAuthService.signIn();
        
        if (result.success && result.user && result.idToken) {
          setGoogleLoading(false);
          
          try {
            // Call backend API with Google ID token for signup
            const apiResult = await apiService.authAPI.googleAuth(result.idToken, true, userType); // isSignup = true, userType
          
          if (apiResult.success) {
            // New user created successfully, proceed to verification
            console.log('[SignUpScreen] Navigating to GoogleVerification');
            navigation.navigate('GoogleVerification');
          } else {
            setWarning(apiResult.error || 'Backend authentication failed. Please try again.');
          }
        } catch (apiError) {
          console.error('Backend API error:', apiError);
          setWarning('Backend authentication failed. Please try again.');
        }
              } else {
          setGoogleLoading(false);
          setWarning(result.error || 'Google sign-in failed. Please try again.');
        }
    } catch (error) {
      setGoogleLoading(false);
      console.error('Google sign-in error:', error);
      setWarning(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
    }
  };

  const handleCreateAccount = async () => {
    // Prevent multiple rapid clicks
    if (buttonDisabled || loading) {
      return;
    }

    // Prevent requests within 2 seconds of each other
    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      console.log('🔄 Request blocked: Too soon after last request');
      return;
    }

    setLastRequestTime(now);
    setButtonDisabled(true);
    setLoading(true);
    setWarning('');
    setError('');

    // Validate inputs
    if (!fullName.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      setButtonDisabled(false);
      return;
    }

    if (!mobile.trim()) {
      setError('Please enter your mobile number');
      setLoading(false);
      setButtonDisabled(false);
      return;
    }

    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      setButtonDisabled(false);
      return;
    }

    try {
      console.log('🔄 Sending OTP request for:', `+91${mobile}`);
      
      // Check if user already exists
      const checkResult = await apiService.authAPI.checkUserExists(`+91${mobile}`);
      
      if (checkResult.exists) {
        setWarning('An account with this phone number already exists. Please log in instead.');
        setLoading(false);
        setButtonDisabled(false);
        return;
      }
      
      // User doesn't exist, proceed with OTP
      const result = await apiService.authAPI.sendOTP(`+91${mobile}`);
      console.log('✅ OTP sent successfully');
      
      setLoading(false);
      setButtonDisabled(false);
      navigation.navigate('OtpVerification', { 
        phone: `+91${mobile}`,
        fullName: fullName.trim(),
        userType: userType
      });
    } catch (err) {
      console.error('❌ OTP request failed:', err);
      if (err.message?.includes('429') || err.error === 'Rate limit exceeded') {
        const timeRemaining = err.timeRemaining || err.retryAfter || 60;
        setWarning(`Please wait ${timeRemaining} seconds before requesting another code.`);
      } else if (err.message?.includes('409')) {
        setWarning('An account with this phone number already exists. Please log in instead.');
      } else {
        setWarning('Network error. Please check your connection and try again.');
      }
      setLoading(false);
      setButtonDisabled(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='light-content' backgroundColor='#000' />
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: '#ffffff' }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
        enableOnAndroid={true}
        extraScrollHeight={80}
        keyboardShouldPersistTaps="handled"
        onScroll={event => {
          const y = event.nativeEvent.contentOffset.y;
          setScrolled(y > 10);
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Sign Up</Text>
            <View style={{ width: 24 }} />
          </View>
          {/* Title */}
          <Text style={styles.title}>Create your <Text style={styles.brandLink}>Influ Mojo</Text> account</Text>
          <Text style={styles.subtitle}>
            Choose your preferred sign-up method below
          </Text>
          {/* Social Buttons */}
          <TouchableOpacity 
            style={[styles.socialButton, googleLoading && styles.socialButtonDisabled]} 
            onPress={handleGoogleAuth}
            disabled={googleLoading}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              {googleLoading ? (
                <ActivityIndicator size="small" color="#4285F4" style={styles.socialIcon} />
              ) : (
                <Ionicons name="logo-google" size={24} color="#4285F4" style={styles.socialIcon} />
              )}
              <Text style={[styles.socialText, { marginLeft: 12 }]}>
                {googleLoading ? 'Opening Google Sign-In...' : 'Sign up with Google'}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Ionicons name="logo-facebook" size={24} color="#1877F2" style={styles.socialIcon} />
              <Text style={[styles.socialText, { marginLeft: 12 }]}>Sign up with Facebook</Text>
            </View>
          </TouchableOpacity>
          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>
          {/* Full Name Input */}
          <Text style={styles.inputLabel}>Full Name*</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. mohammed Azhar Uddin"
            placeholderTextColor={COLORS.placeholder}
            value={fullName}
            onChangeText={setFullName}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {/* Mobile Number Input */}
          <Text style={styles.inputLabel}>Mobile Number*</Text>
          <View style={styles.mobileRow}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCode}>+91</Text>
            </View>
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 8, marginBottom: 0 }]}
              placeholder="e.g. 9948425492"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={setMobile}
            />
          </View>
          <Text style={styles.infoText}>We'll send a one-time OTP to this number for verification</Text>
          {warning ? <Text style={{ color: '#FF3B30', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>{warning}</Text> : null}
          {/* Button and checkbox at the end */}
          <TouchableOpacity onPress={handleCreateAccount}>
            <LinearGradient
              colors={COLORS.gradientOrange}
              style={styles.createButton}
            >
              <Text style={styles.createButtonText}>Create account</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.checkboxRow}>
            <TouchableOpacity 
              style={[styles.customCheckbox, agreed && styles.customCheckboxChecked]} 
              onPress={() => setAgreed(!agreed)}
            >
              {agreed && <Ionicons name="checkmark" size={16} color="#ffffff" />}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              By creating an account, you agree to <Text style={styles.brandLink}>Influmojo</Text>'s{' '}
              <Text style={styles.link}>Terms</Text> and <Text style={styles.link}>Privacy Policy</Text>.
            </Text>
          </View>
          <TouchableOpacity style={[styles.loginRow, { marginTop: 16 }]} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Already have an account ? <Text style={styles.loginLink}>Login here</Text></Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator size="small" color="#f37135" style={{ marginTop: 8 }} />}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 5,                                                           
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20%',
    marginTop: 16,
  },
  topBarTitle: {
    fontSize: 18,
    fontFamily: FONTS.primary.semiBold,
    fontWeight: '600',
    color: '#1A1D1F',
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.secondary.italic,
    fontWeight: '700',
    color: '#1A1D1F',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.primary.regular,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Changed from '#F5F5F5' to '#FFFFFF'
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#20536d',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    justifyContent: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  socialText: {
    fontSize: 16,
    fontFamily: FONTS.primary.medium,
    color: '#1A1D1F',
    fontWeight: '500',
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: FONTS.primary.regular,
    marginHorizontal: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontFamily: FONTS.primary.semiBold,
    fontWeight: '600',
    color: '#1A1D1F',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF', // Changed from '#F5F5F5' to '#FFFFFF'
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#20536d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: FONTS.primary.regular,
    marginBottom: 8,
    minHeight: 48,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  countryCodeBox: {
    backgroundColor: '#FFFFFF', // Changed from '#F5F5F5' to '#FFFFFF'
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#20536d',
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 48,
    justifyContent: 'center',
  },
  countryCode: {
    fontSize: 15,
    fontFamily: FONTS.primary.medium,
    color: '#1A1D1F',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 13,
    fontFamily: FONTS.primary.regular,
    color: '#6B7280',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  createButtonText: {
    color: '#ffffff',
    fontFamily: FONTS.primary.semiBold,
    fontWeight: '600',
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#20536d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  customCheckboxChecked: {
    backgroundColor: '#f37135',
    borderColor: '#f37135',
  },
  checkboxText: {
    fontSize: 13,
    fontFamily: FONTS.primary.regular,
    color: '#6B7280',
    flex: 1,
    lineHeight: 18,
  },
  link: {
    color: '#20536d',
    fontFamily: FONTS.primary.medium,
    fontWeight: '500',
  },
  brandLink: {
    color: '#f37135',
    fontFamily: FONTS.primary.medium,
    fontWeight: '500',
  },
  loginRow: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    fontFamily: FONTS.primary.regular,
    color: '#6B7280',
    textAlign: 'center',
  },
  loginLink: {
    color: '#20536d',
    fontFamily: FONTS.primary.medium,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    fontFamily: FONTS.primary.regular,
    marginBottom: 8,
  },
});

export default SignUpScreen; 
