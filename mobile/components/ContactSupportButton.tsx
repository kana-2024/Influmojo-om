import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { streamChatService } from '../services/streamChatService';
import { apiService } from '../services/apiService';

interface ContactSupportButtonProps {
  ticketId: string;
  orderId?: string;
  style?: any;
  textStyle?: any;
  disabled?: boolean;
}

export default function ContactSupportButton({
  ticketId,
  orderId,
  style,
  textStyle,
  disabled = false,
}: ContactSupportButtonProps) {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleContactSupport = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);
      
      console.log(`🆘 User requesting support for ticket ${ticketId}`);

      // Check if user is authenticated
      const token = await apiService.getAuthToken();
      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please log in to contact support.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => navigation.navigate('Login' as never) },
          ]
        );
        return;
      }

      // Check if ticket exists
      let ticket;
      try {
        const response = await apiService.get(`/crm/tickets/${ticketId}`);
        if (!response.success) {
          throw new Error('Ticket not found');
        }
        ticket = response.data.ticket;
      } catch (error) {
        console.error('❌ Error fetching ticket:', error);
        Alert.alert(
          'Error',
          'Unable to find support ticket. Please try again later.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Navigate to chat screen
      navigation.navigate('TicketChat' as never, {
        ticketId,
        orderId,
        ticket,
      } as never);

    } catch (error) {
      console.error('❌ Error contacting support:', error);
      Alert.alert(
        'Error',
        'Failed to connect to support. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        loading && styles.buttonLoading,
        style,
      ]}
      onPress={handleContactSupport}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#ffffff" />
          <Text style={[styles.buttonText, styles.loadingText, textStyle]}>
            Connecting...
          </Text>
        </View>
      ) : (
        <Text style={[styles.buttonText, textStyle]}>
          Contact Support
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#20536d', // Influmojo tertiary color
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
    opacity: 0.6,
  },
  buttonLoading: {
    backgroundColor: '#20536d',
    opacity: 0.8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
}); 