import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ZohoSalesIQ } from 'react-native-zohosalesiq-mobilisten';
import { useAppSelector } from '../store/hooks';
import COLORS from '../config/colors';

interface ZohoChatWidgetProps {
  visible: boolean;
  onClose: () => void;
  onMessageSent?: (message: any) => void;
  orderInfo?: {
    orderId: string;
    orderNumber?: string;
    orderStatus?: string;
    amount?: number;
    customerName?: string;
    visitorId?: string;
    sessionId?: string;
  };
}

const ZohoChatWidget: React.FC<ZohoChatWidgetProps> = ({
  visible,
  onClose,
  onMessageSent,
  orderInfo
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const user = useAppSelector(state => state.auth.user);

  // Check if Zoho SalesIQ is initialized
  useEffect(() => {
    if (visible) {
      checkZohoInitialization();
    }
  }, [visible]);

  const checkZohoInitialization = () => {
    try {
      // Check if ZohoSalesIQ is available and initialized
      if (ZohoSalesIQ && typeof ZohoSalesIQ.initWithCallback === 'function') {
        console.log('✅ Zoho SalesIQ SDK is available');
        setIsInitialized(true);
      } else {
        console.error('❌ Zoho SalesIQ SDK not available');
        setIsInitialized(false);
      }
    } catch (error) {
      console.error('❌ Error checking Zoho initialization:', error);
      setIsInitialized(false);
    }
  };

  const openZohoNativeChat = async () => {
    try {
      console.log('🎯 Opening Zoho SalesIQ native chat interface');
      
      if (!isInitialized) {
        Alert.alert('Error', 'Zoho SalesIQ is not initialized. Please try again.');
        return;
      }

      setIsLoading(true);
      
      // Set visitor information before showing chat
      if (user) {
        try {
          ZohoSalesIQ.setVisitorAddInfo(
            user.name || 'User',
            user.email || ''
          );
          console.log('✅ Visitor information set for Zoho chat');
        } catch (error) {
          console.error('❌ Error setting visitor info:', error);
        }
      }

      // Generate session and visitor IDs for tracking
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (orderInfo) {
        console.log('📦 Chat context - Order ID:', orderInfo.orderId, 'Session ID:', sessionId, 'Visitor ID:', visitorId);
      }
      
      // Show the Zoho SalesIQ chat interface according to official documentation
      if (ZohoSalesIQ && ZohoSalesIQ.Launcher) {
        console.log('🎯 Showing Zoho SalesIQ launcher');
        
        // Show the Zoho chat interface
        ZohoSalesIQ.Launcher.show(ZohoSalesIQ.Launcher.VisibilityMode.ALWAYS);
        
        // Update orderInfo with session and visitor IDs
        const updatedOrderInfo = {
          ...orderInfo,
          sessionId,
          visitorId
        };
        
        // Call onMessageSent callback if provided
        if (onMessageSent) {
          onMessageSent({
            type: 'chat_opened',
            timestamp: new Date(),
            orderInfo: updatedOrderInfo
          });
        }
        
        console.log('✅ Chat opened with session ID:', sessionId, 'visitor ID:', visitorId);
        
        // Keep the modal open so user can see the chat status
        // User can manually close it when done
        setIsLoading(false);
        
        // Show success message
        Alert.alert(
          'Chat Opened', 
          'Zoho SalesIQ chat has been opened. You can now chat with support.',
          [{ text: 'OK' }]
        );
        
      } else {
        console.error('❌ Zoho SalesIQ Launcher not available');
        Alert.alert('Error', 'Zoho chat interface not available. Please try again.');
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('❌ Error opening Zoho native chat interface:', error);
      Alert.alert('Error', 'Failed to open Zoho chat interface. Please try again.');
      setIsLoading(false);
    }
  };

  const closeChat = () => {
    try {
      // Hide the launcher completely
      if (ZohoSalesIQ && ZohoSalesIQ.Launcher) {
        ZohoSalesIQ.Launcher.show(ZohoSalesIQ.Launcher.VisibilityMode.NEVER);
      }
      
      console.log('✅ Chat closed');
      onClose();
    } catch (error) {
      console.error('❌ Error closing chat:', error);
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeChat}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.agentInfo}>
              <View style={styles.agentAvatar}>
                <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.agentDetails}>
                <Text style={styles.headerAgentName}>
                  {orderInfo ? `Order #${orderInfo.orderId.slice(-6)} Support` : 'Influ Mojo Support'}
                </Text>
                <Text style={styles.agentStatus}>
                  {isInitialized ? 'Ready' : 'Initializing...'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeChat} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.chatContainer}>
            <View style={styles.welcomeSection}>
              <Ionicons name="chatbubbles" size={64} color={COLORS.primary} />
              <Text style={styles.welcomeTitle}>
                {orderInfo ? `Support for Order #${orderInfo.orderId.slice(-6)}` : 'Customer Support'}
              </Text>
              <Text style={styles.welcomeDescription}>
                Get instant help from our support team. Click the button below to start chatting with Zoho SalesIQ.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.zohoChatButton}
              onPress={openZohoNativeChat}
              disabled={!isInitialized || isLoading}
            >
              <Ionicons name="chatbubbles" size={20} color="#fff" />
              <Text style={styles.zohoChatButtonText}>
                {isLoading ? 'Opening Chat...' : isInitialized ? 'Open Zoho Chat' : 'Initializing...'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeChatButton}
              onPress={closeChat}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.textGray} />
              <Text style={styles.closeChatButtonText}>Close</Text>
            </TouchableOpacity>
            
            {orderInfo && (
              <View style={styles.orderInfo}>
                <Text style={styles.orderInfoTitle}>Order Details:</Text>
                <Text style={styles.orderInfoText}>Order ID: {orderInfo.orderId}</Text>
                {orderInfo.orderNumber && (
                  <Text style={styles.orderInfoText}>Order #: {orderInfo.orderNumber}</Text>
                )}
                {orderInfo.orderStatus && (
                  <Text style={styles.orderInfoText}>Status: {orderInfo.orderStatus}</Text>
                )}
                {orderInfo.amount && (
                  <Text style={styles.orderInfoText}>Amount: ₹{orderInfo.amount}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  agentDetails: {
    flex: 1,
  },
  headerAgentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  agentStatus: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  chatContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  welcomeDescription: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  zohoChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20536d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 30,
    minWidth: 200,
  },
  zohoChatButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  orderInfo: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
    maxWidth: 300,
  },
  orderInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  orderInfoText: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 5,
  },
  closeChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.textGray,
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  closeChatButtonText: {
    color: COLORS.textGray,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ZohoChatWidget; 