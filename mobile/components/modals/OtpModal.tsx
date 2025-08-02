import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as apiService from '../../services/apiService';
import COLORS from '../../config/colors';

interface OtpModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  phone: string;
}

const OtpModal: React.FC<OtpModalProps> = ({ visible, onClose, onSuccess, phone }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (visible) {
      sendOtp();
    }
  }, [visible]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const sendOtp = async () => {
    setSendingOtp(true);
    try {
      const result = await apiService.authAPI.sendOTP(phone);
      setTimeLeft(60); // 60 seconds cooldown
      
      // Show OTP in development mode
      if (__DEV__ && result.otp) {
        Alert.alert('OTP Sent', `OTP: ${result.otp}\n\nThis is shown only in development mode.`);
      } else {
        Alert.alert('Success', 'OTP sent successfully!');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.authAPI.verifyOTP(phone, otp);
      Alert.alert('Success', 'Phone number verified successfully!');
      // Call onSuccess with the full result object (contains user data)
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error('Verify OTP error:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOtp('');
    setLoading(false);
    setTimeLeft(0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Verify Phone Number</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.description}>
              We've sent a verification code to {phone}
            </Text>

            {/* OTP Input */}
            <Text style={styles.label}>Enter OTP</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="Enter 6-digit code"
              placeholderTextColor={COLORS.placeholder}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              {timeLeft > 0 ? (
                <Text style={styles.timerText}>Resend in {timeLeft}s</Text>
              ) : (
                <TouchableOpacity onPress={sendOtp} disabled={sendingOtp}>
                  <Text style={styles.resendButton}>
                    {sendingOtp ? 'Sending...' : 'Resend'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, loading && { opacity: 0.7 }]}
              onPress={verifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#f8f4e8" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -200 }, { translateY: -200 }],
    backgroundColor: '#f8f4e8',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D1F',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1D1F',
    marginBottom: 8,
  },
  otpInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendButton: {
    fontSize: 14,
    color: '#f37135',
    fontWeight: '600',
  },
  timerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  verifyButton: {
    backgroundColor: '#FD5D27',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#f8f4e8',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OtpModal; 
