import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authAPI } from '../services/apiService';
import googleAuthService from '../services/googleAuth';
import OtpModal from '../components/modals/OtpModal';

export default function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [error, setError] = useState('');

  // Handle phone login
  const handlePhoneLogin = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Check if user exists
      const formattedPhone = `+91${phone.trim()}`;
      const checkResult = await authAPI.checkUserExists(formattedPhone);
      
      if (checkResult.exists) {
        // User exists, send OTP for login
        setShowOtpModal(true);
      } else {
        // User doesn't exist, navigate to signup
        Alert.alert(
          'Account Not Found',
          'No account found with this phone number. Would you like to create a new account?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Up', onPress: () => navigation.navigate('SignUp') }
          ]
        );
      }
    } catch (error) {
      console.error('Phone login error:', error);
      setError('Failed to verify phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const result = await googleAuthService.signIn();
      
      if (result.success && result.user && result.idToken) {
        // Check if user exists with Google for login
        const apiResult = await authAPI.googleAuth(result.idToken, false, 'creator'); // isSignup = false, userType (not used for login)
        
        if (apiResult.success) {
          // User exists and login successful, navigate to appropriate profile based on user type
          const userType = apiResult.user?.userType || apiResult.user?.user_type || 'creator';
          if (userType === 'brand') {
            navigation.navigate('BrandProfile');
          } else {
            navigation.navigate('CreatorProfile');
          }
        } else {
          setError(apiResult.error || 'Google authentication failed');
        }
      } else {
        setError(result.error || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle OTP verification success
  const handleOtpSuccess = (user: any) => {
    setShowOtpModal(false);
    // Navigate to appropriate profile after successful OTP verification
    const userType = user?.userType || user?.user_type;
    if (userType === 'brand') {
      navigation.navigate('BrandProfile');
    } else {
      navigation.navigate('CreatorProfile');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='#fff' />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.container}>
        {/* Illustrations */}
        <View style={styles.illustrations}>
          <View style={styles.illustrationRow}>
            <View style={[styles.illustration, styles.illustrationHighlighted]}>
              <Ionicons name="people" size={24} color="#FF6B2C" />
            </View>
            <View style={styles.illustration}>
              <Ionicons name="heart" size={24} color="#1A1D1F" />
            </View>
          </View>
          <View style={styles.illustrationRow}>
            <View style={styles.illustration}>
              <Ionicons name="shield-checkmark" size={24} color="#1A1D1F" />
            </View>
            <View style={styles.illustration}>
              <Ionicons name="people-circle" size={24} color="#1A1D1F" />
            </View>
            <View style={[styles.illustration, styles.illustrationHighlighted]}>
              <Ionicons name="analytics" size={24} color="#FF6B2C" />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Log in to continue your influencer journey</Text>

        {/* Phone Number Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mobile Number*</Text>
          <View style={styles.phoneInput}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.phoneInputField}
              placeholder="e.g. 9948425492"
              placeholderTextColor="#B0B0B0"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>We'll send a one-time OTP to this number for verification</Text>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.7 }]}
          onPress={handlePhoneLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>Log In</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or Login with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={[styles.socialButton, googleLoading && { opacity: 0.7 }]}
            onPress={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#1A1D1F" size="small" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#4285F4" />
                <Text style={styles.socialButtonText}>Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupLink}>Sign up here</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlay for OTP Modal */}
      {showOtpModal && (
        <View style={styles.modalOverlay} />
      )}

      {/* OTP Modal */}
      <OtpModal
        visible={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpSuccess}
        phone={`+91${phone}`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  illustrations: {
    alignItems: 'center',
    marginBottom: 40,
  },
  illustrationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  illustration: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  illustrationHighlighted: {
    backgroundColor: '#FFF4ED',
    borderWidth: 2,
    borderColor: '#FF6B2C',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1D1F',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 32,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1F',
    marginBottom: 8,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  countryCode: {
    fontSize: 16,
    color: '#1A1D1F',
    marginRight: 8,
    fontWeight: '500',
  },
  phoneInputField: {
    flex: 1,
    fontSize: 16,
    color: '#1A1D1F',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: '#FF6B2C',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    marginHorizontal: 6,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#1A1D1F',
    marginLeft: 8,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  signupText: {
    fontSize: 16,
    color: '#6B7280',
  },
  signupLink: {
    fontSize: 16,
    color: '#2563EB',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
}); 