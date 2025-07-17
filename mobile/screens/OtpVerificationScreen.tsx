import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Keyboard, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_ENDPOINTS } from '../config/env';
import * as NavigationBar from 'expo-navigation-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const OTP_LENGTH = 6;
const RESEND_TIME = 30;

const OtpVerificationScreen = ({ navigation, route }: any) => {
  useEffect(() => {
    // NavigationBar.setBackgroundColorAsync('#F8F9FB'); // Removed as per edit hint
    // NavigationBar.setButtonStyleAsync('dark'); // Removed as per edit hint
  }, []);

  const { phone } = route.params;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_TIME);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, idx: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < OTP_LENGTH - 1) {
      // @ts-ignore
      inputRefs.current[idx + 1].focus();
    }
    if (!value && idx > 0) {
      // @ts-ignore
      inputRefs.current[idx - 1].focus();
    }
  };

  const handleVerify = async () => {
    setError('');
    if (otp.some(d => d === '')) {
      setError('Please enter the complete OTP.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp.join('') })
      });
      const data = await response.json();
      if (!response.ok) {
        setLoading(false);
        setError(data.error || 'Invalid OTP.');
        return;
      }
      setLoading(false);
      navigation.navigate('MobileVerifiedScreen');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setTimer(RESEND_TIME);
    try {
      const response = await fetch(API_ENDPOINTS.SEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          setError('Please wait 1 minute before requesting another code.');
          setTimer(60); // Set timer to 60 seconds for rate limit
        } else {
          setError(data.error || 'Failed to resend OTP.');
        }
        return;
      }
      
      // Success - OTP sent
      console.log('OTP resent successfully');
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: '#EFF3F5' }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      enableOnAndroid={true}
      extraScrollHeight={80}
      keyboardShouldPersistTaps="handled"
    >
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
          <TouchableOpacity disabled={timer > 0} onPress={handleResend}>
            <Text style={[styles.resendLink, timer > 0 && { opacity: 0.5 }]}>Resend</Text>
          </TouchableOpacity>
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