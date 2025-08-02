import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ZohoSalesIQ } from 'react-native-zohosalesiq-mobilisten';

/**
 * Test Component for Order-Specific Chat Re-identification
 * This component helps validate that each order gets a separate chat session
 */

interface OrderChatTestProps {
  userEmail: string;
  userName: string;
}

const OrderChatTest: React.FC<OrderChatTestProps> = ({ userEmail, userName }) => {
  const [currentOrder, setCurrentOrder] = useState<string>('');

  const testOrderChat = async (orderId: string) => {
    try {
      console.log(`🧪 Testing chat for order: ${orderId}`);
      
      // Create order-specific email for re-identification
      const orderSpecificEmail = createOrderSpecificEmail(userEmail, orderId);
      
      console.log('📧 Order-specific email:', orderSpecificEmail);
      
      // Set visitor information with order-specific email
      ZohoSalesIQ.setVisitorInfo({
        name: userName,
        email: orderSpecificEmail,
        addInfo: `order_id:${orderId} test_mode:true`
      });

      // Set custom action for order tracking
      ZohoSalesIQ.setCustomAction(`order_chat_${orderId}`);

      // Show chat widget
      ZohoSalesIQ.showChat();

      setCurrentOrder(orderId);
      
      Alert.alert(
        'Chat Test Started',
        `Order ${orderId} chat opened with email: ${orderSpecificEmail}\n\nSend a test message, then close the chat and try another order to test re-identification.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('❌ Error testing order chat:', error);
      Alert.alert('Error', 'Failed to open test chat');
    }
  };

  const createOrderSpecificEmail = (baseEmail: string, orderId: string): string => {
    if (!baseEmail) {
      return `test-order-${orderId}@influmojo.app`;
    }
    
    // Use email plus addressing for unique identification
    const [localPart, domain] = baseEmail.split('@');
    return `${localPart}+order${orderId}@${domain}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Chat Re-identification Test</Text>
      <Text style={styles.subtitle}>
        Test that each order gets a separate chat session
      </Text>
      
      <View style={styles.testButtons}>
        <TouchableOpacity
          style={[styles.testButton, currentOrder === '001' && styles.activeButton]}
          onPress={() => testOrderChat('001')}
        >
          <Text style={styles.testButtonText}>Test Order 001</Text>
          <Text style={styles.testButtonEmail}>
            {createOrderSpecificEmail(userEmail, '001')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, currentOrder === '002' && styles.activeButton]}
          onPress={() => testOrderChat('002')}
        >
          <Text style={styles.testButtonText}>Test Order 002</Text>
          <Text style={styles.testButtonEmail}>
            {createOrderSpecificEmail(userEmail, '002')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, currentOrder === '003' && styles.activeButton]}
          onPress={() => testOrderChat('003')}
        >
          <Text style={styles.testButtonText}>Test Order 003</Text>
          <Text style={styles.testButtonEmail}>
            {createOrderSpecificEmail(userEmail, '003')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Test Instructions:</Text>
        <Text style={styles.instructionText}>
          1. Tap "Test Order 001" and send a message{'\n'}
          2. Close the chat{'\n'}
          3. Tap "Test Order 002" and check if you see the previous message{'\n'}
          4. If you see the previous message = ❌ Re-identification not working{'\n'}
          5. If you see a fresh chat = ✅ Re-identification working!
        </Text>
      </View>

      {currentOrder && (
        <View style={styles.currentTest}>
          <Text style={styles.currentTestText}>
            Currently testing: Order {currentOrder}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f4e8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  testButtons: {
    gap: 12,
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#20536d',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#20536d',
  },
  activeButton: {
    backgroundColor: '#f37135',
    borderColor: '#f37135',
  },
  testButtonText: {
    color: '#f8f4e8',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  testButtonEmail: {
    color: '#f8f4e8',
    fontSize: 12,
    opacity: 0.8,
  },
  instructions: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  currentTest: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  currentTestText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
});

export default OrderChatTest; 