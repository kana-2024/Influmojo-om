import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GoogleVerificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const GoogleVerificationModal: React.FC<GoogleVerificationModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={48} color="#f37135" />
          </View>
          <Text style={styles.title}>Verifying Email</Text>
          <Text style={styles.subtitle}>
            Please wait while we verify your email address with Google...
          </Text>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f37135" />
            <Text style={styles.loadingText}>Verifying...</Text>
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
    transform: [{ translateX: -150 }, { translateY: -100 }],
    backgroundColor: '#f8f4e8',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1D1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#f37135',
    fontWeight: '600',
    marginTop: 12,
  },
});

export default GoogleVerificationModal; 
