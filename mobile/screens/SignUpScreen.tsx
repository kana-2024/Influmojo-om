import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ENV, API_ENDPOINTS } from '../config/env';

// Test backend connectivity
const testBackendConnection = async () => {
  try {
    console.log('Testing backend health check...');
    const response = await fetch(API_ENDPOINTS.HEALTH);
    console.log('Backend health check response:', response.status);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { StatusBar } from 'react-native';
import googleAuthService from '../services/googleAuth';

// Debug import
console.log('SignUpScreen: googleAuthService imported:', !!googleAuthService);

const SignUpScreen = ({ navigation }: any) => {
  useEffect(() => {
    // NavigationBar.setBackgroundColorAsync('#F8F9FB'); // Removed as per edit hint
    // NavigationBar.setButtonStyleAsync('dark'); // Removed as per edit hint
  }, []);

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleAuth = async () => {
    console.log('=== Google Auth Button Pressed ===');
    console.log('API Base URL:', ENV.API_BASE_URL);
    setWarning('');
    setGoogleLoading(true);
    
    // Test backend connectivity first
    const backendOk = await testBackendConnection();
    console.log('Backend connectivity:', backendOk);
    
    try {
      console.log('Starting Google sign-in process...');
      console.log('googleAuthService imported:', !!googleAuthService);
      const result = await googleAuthService.signIn();
      console.log('Google sign-in result:', result);
      
      if (result.success && result.user) {
        setGoogleLoading(false);
        console.log('Google sign-in successful, navigating to verification...');
        // Navigate to the next screen on successful Google auth
        navigation.navigate('GoogleVerification');
      } else {
        setGoogleLoading(false);
        console.log('Google sign-in failed:', result.error);
        setWarning(result.error || 'Google sign-in failed. Please try again.');
      }
    } catch (error) {
      setGoogleLoading(false);
      console.error('Google sign-in error:', error);
      setWarning(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
    }
  };

  const handleCreateAccount = async () => {
    setWarning('');
    if (!fullName) {
      setError('Field is required');
      return;
    }
    setError('');
    if (!/^\d{10}$/.test(mobile)) {
      setWarning('Please enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);
    
    // Test backend connectivity first
    console.log('Testing backend connectivity...');
    console.log('API URL:', API_ENDPOINTS.SEND_OTP);
    
    try {
      const response = await fetch(API_ENDPOINTS.SEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${mobile}` })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 429) {
          setWarning('Please wait 1 minute before requesting another code.');
        } else {
        setWarning(data.error || 'Failed to send verification code.');
        }
        setLoading(false);
        return;
      }
      setLoading(false);
      navigation.navigate('OtpVerification', { phone: `+91${mobile}` });
    } catch (err) {
      console.error('Network error details:', err);
      setWarning('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='light-content' backgroundColor='#000' />
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: '#F8F9FB' }}
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
          <Text style={styles.title}>Create your Influ Mojo account</Text>
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
              style={[styles.input, { flex: 1, marginLeft: 8 }]}
              placeholder="e.g. 9948425492"
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={setMobile}
            />
          </View>
          <Text style={styles.infoText}>We'll send a one-time OTP to this number for verification</Text>
          {warning ? <Text style={{ color: '#FF3B30', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>{warning}</Text> : null}
          {/* Button and checkbox at the end */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreateAccount}>
            <Text style={styles.createButtonText}>Create account</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
          <View style={styles.checkboxRow}>
            <TouchableOpacity 
              style={[styles.customCheckbox, agreed && styles.customCheckboxChecked]} 
              onPress={() => setAgreed(!agreed)}
            >
              {agreed && <Ionicons name="checkmark" size={16} color="#fff" />}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              By creating an account, you agree to Influmojo's{' '}
              <Text style={styles.link}>Terms</Text> and <Text style={styles.link}>Privacy Policy</Text>.
            </Text>
          </View>
          <TouchableOpacity style={[styles.loginRow, { marginTop: 16 }]} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Already have an account ? <Text style={styles.loginLink}>Login here</Text></Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator size="small" color="#FF6B2C" style={{ marginTop: 8 }} />}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#EFF3F5',
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
    fontWeight: '600',
    color: '#1A1D1F',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1D1F',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  socialText: {
    fontSize: 16,
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
    marginHorizontal: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1D1F',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 8,
    minHeight: 48,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  countryCode: {
    fontSize: 15,
    color: '#1A1D1F',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FC5213',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  createButtonText: {
    color: '#fff',
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
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  customCheckboxChecked: {
    backgroundColor: '#FC5213',
    borderColor: '#FC5213',
  },
  checkboxText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    lineHeight: 18,
  },
  link: {
    color: '#FC5213',
    fontWeight: '500',
  },
  loginRow: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  loginLink: {
    color: '#2563EB',
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginBottom: 8,
  },
});

export default SignUpScreen; 