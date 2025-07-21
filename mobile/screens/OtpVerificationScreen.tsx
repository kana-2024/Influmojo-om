import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, 
  StatusBar, Image, ActivityIndicator
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import * as apiService from '../services/apiService';
import { OtpCountdownTimer } from '../components';

const RESEND_TIME = 30; // 30 seconds for normal resend

const OtpVerificationScreen = ({ navigation, route }: any) => {
  const { phone, fullName, userType } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    // Start initial timer
    setTimer(RESEND_TIME);
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, idx: number) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await apiService.authAPI.verifyOTP(phone, otpString, fullName, userType);
      
      if (result.success) {
        if (result.user?.user_type === 'brand') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'BrandProfileSetup' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'ProfileSetup' }],
          });
        }
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Prevent multiple rapid clicks
    if (resendLoading || timer > 0 || showCountdown) {
      return;
    }

    setError('');
    setShowCountdown(false);
    setResendLoading(true);
    
    try {
      console.log('🔄 Resending OTP to:', phone);
      const result = await apiService.authAPI.sendOTP(phone);
      
      if (result.success) {
        console.log('✅ OTP resent successfully');
        setTimer(RESEND_TIME);
        if (__DEV__) {
          console.log('OTP resent successfully');
        }
      }
    } catch (err: any) {
      console.error('❌ OTP resend error:', err);
      
      // Handle rate limiting with specific time information
      if (err.message?.includes('429') || err.error === 'Rate limit exceeded') {
        const timeRemaining = err.timeRemaining || err.retryAfter || 60;
        setCountdownSeconds(timeRemaining);
        setShowCountdown(true);
        setError(err.message || `Please wait ${timeRemaining} seconds before requesting another code.`);
      } else {
        setError(err.message || 'Failed to resend OTP.');
        setTimer(RESEND_TIME); // Reset to normal timer
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setTimer(RESEND_TIME);
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: '#EFF3F5' }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      enableOnAndroid={true}
      extraScrollHeight={80}
      keyboardShouldPersistTaps="handled"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#EFF3F5' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#EFF3F5" />
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Verify OTP</Text>
            <View style={{ width: 24 }} />
          </View>
          {/* Illustration */}
          <Image
            source={require('../assets/05.jpg')}
            style={styles.illustration}
            resizeMode="cover"
          />
          {/* Title & Phone */}
          <Text style={styles.title}>Enter the OTP sent to your {'\n'} number</Text>
          <Text style={styles.phone}>{phone}</Text>
          {/* Development notice */}
          <Text style={styles.devNotice}>
             Development: Check console for OTP code
          </Text>
          {/* Timer above OTP row, right-aligned */}
          <View style={styles.timerRow}>
            <Text style={{ color: '#6B7280', fontSize: 16 }}>OTP</Text>
            <Text style={styles.timer}>{`00:${timer.toString().padStart(2, '0')}`}</Text>
          </View>

          {/* OTP Input Row */}
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={ref => { inputRefs.current[idx] = ref; }}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={val => handleOtpChange(val, idx)}
                returnKeyType="next"
                autoFocus={idx === 0}
              />
            ))}
          </View>
          {/* Error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't get the code?</Text>
            {showCountdown ? (
              <OtpCountdownTimer
                initialSeconds={countdownSeconds}
                onComplete={handleCountdownComplete}
                style={{ marginLeft: 8 }}
              />
            ) : (
              <TouchableOpacity 
                disabled={timer > 0 || resendLoading} 
                onPress={handleResend}
                style={{ opacity: (timer > 0 || resendLoading) ? 0.5 : 1 }}
              >
                <Text style={[styles.resendLink, (timer > 0 || resendLoading) && { opacity: 0.5 }]}>
                  {resendLoading ? 'Sending...' : 'Resend'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {/* Verify Button */}
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerify} disabled={loading}>
            <Text style={styles.verifyText}>Verify</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
          {loading && <ActivityIndicator size="small" color="#FF6B2C" style={{ marginTop: 8 }} />}
          {/* Login Link */}
          <TouchableOpacity style={styles.loginRow} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Already have an account ? <Text style={styles.loginLink}>Login here</Text></Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF3F5',
    paddingHorizontal: 24,
    paddingTop: 48,
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
  illustration: {
    width: 180,
    height: 120,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 8,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1A1D1F',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
    lineHeight: 30,
  },
  phone: {
    fontSize: 16,
    color: '#1A1D1F',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  devNotice: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  otpInput: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    fontSize: 22,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  timer: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resendText: {
    color: '#6B7280',
    fontSize: 14,
    marginRight: 4,
  },
  resendLink: {
    color: '#2563EB',
    fontWeight: '500',
    fontSize: 14,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B2C',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  verifyText: {
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
    fontWeight: '500',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 8,
  },
});

export default OtpVerificationScreen; 