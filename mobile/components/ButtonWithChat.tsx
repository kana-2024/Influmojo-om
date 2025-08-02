import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ZohoSalesIQ } from 'react-native-zohosalesiq-mobilisten';
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
      console.log('🎯 Opening Zoho SalesIQ chat...');
      
      // Set order context if available
      if (orderInfo) {
        console.log('📦 Setting order context:', orderInfo);
        
        // Set custom fields for order context
        try {
          ZohoSalesIQ.setCustomField('order_id', orderInfo.orderId);
          if (orderInfo.orderNumber) {
            ZohoSalesIQ.setCustomField('order_number', orderInfo.orderNumber);
          }
          if (orderInfo.orderStatus) {
            ZohoSalesIQ.setCustomField('order_status', orderInfo.orderStatus);
          }
          if (orderInfo.amount) {
            ZohoSalesIQ.setCustomField('order_amount', orderInfo.amount.toString());
          }
          console.log('✅ Order context set in Zoho SalesIQ');
        } catch (error) {
          console.error('❌ Error setting order context:', error);
        }
      }
      
      // Show the chat using the simplified method
      ZohoSalesIQ.showChat();
      console.log('✅ Zoho SalesIQ chat opened');
      
      // Call callback if provided
      if (onChatOpened) {
        onChatOpened(orderInfo);
      }
      
    } catch (error) {
      console.error('❌ Error opening Zoho SalesIQ chat:', error);
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