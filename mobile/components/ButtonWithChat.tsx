import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import COLORS from '../config/colors';

interface ButtonWithChatProps {
  orderInfo?: {
    orderId: string;
    orderNumber?: string;
    orderStatus?: string;
    amount?: number;
    customerName?: string;
  };
  onChatOpened?: (orderInfo?: any) => void;
}

const ButtonWithChat: React.FC<ButtonWithChatProps> = ({ 
  orderInfo, 
  onChatOpened 
}) => {
  const handleChatPress = () => {
    try {
      console.log('🎯 Opening chat...');
      
      // For now, just show a message
      Alert.alert('Chat', 'Chat functionality is currently being updated.');
      
      // Call callback if provided
      if (onChatOpened) {
        onChatOpened(orderInfo);
      }
      
    } catch (error) {
      console.error('❌ Error opening chat:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.chatButton}
      onPress={handleChatPress}
      activeOpacity={0.8}
    >
      <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
      <Text style={styles.chatButtonText}>
        {orderInfo ? `Chat about Order #${orderInfo.orderId.slice(-6)}` : 'Chat with Support'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20536d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 200,
  },
  chatButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ButtonWithChat; 