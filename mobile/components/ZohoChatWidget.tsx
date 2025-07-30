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
}

const ZohoChatWidget: React.FC<ZohoChatWidgetProps> = ({
  visible,
  onClose,
  onMessageSent
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const user = useAppSelector(state => state.auth.user);

  // Zoho SalesIQ Configuration
  const zohoConfig = {
    // iOS App Key and Access Key (you'll need to get these from Zoho SalesIQ console)
    ios: {
      appKey: process.env.EXPO_PUBLIC_ZOHO_IOS_APP_KEY || 'your_ios_app_key',
      accessKey: process.env.EXPO_PUBLIC_ZOHO_IOS_ACCESS_KEY || 'your_ios_access_key'
    },
    // Android App Key and Access Key (you'll need to get these from Zoho SalesIQ console)
    android: {
      appKey: process.env.EXPO_PUBLIC_ZOHO_ANDROID_APP_KEY || 'your_android_app_key',
      accessKey: process.env.EXPO_PUBLIC_ZOHO_ANDROID_ACCESS_KEY || 'your_android_access_key'
    }
  };

  // Initialize Zoho SalesIQ when component mounts
  useEffect(() => {
    if (visible && user && !isInitialized) {
      initializeZohoChat();
    }
  }, [visible, user, isInitialized]);

  const initializeZohoChat = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('💬 Initializing Zoho SalesIQ for user:', user.id);

      // Get platform-specific keys
      const appKey = Platform.OS === 'ios' ? zohoConfig.ios.appKey : zohoConfig.android.appKey;
      const accessKey = Platform.OS === 'ios' ? zohoConfig.ios.accessKey : zohoConfig.android.accessKey;

      // Initialize Zoho SalesIQ with callback
      ZohoSalesIQ.initWithCallback(appKey, accessKey, (success) => {
        if (success) {
          console.log('✅ Zoho SalesIQ initialized successfully');
          setIsInitialized(true);
          
          // Show the chat launcher
          ZohoSalesIQ.Launcher.show(ZohoSalesIQ.Launcher.VisibilityMode.ALWAYS);
          
        } else {
          console.error('❌ Failed to initialize Zoho SalesIQ');
          Alert.alert('Error', 'Failed to initialize chat. Please try again.');
        }
        setIsLoading(false);
      });

    } catch (error) {
      console.error('❌ Error initializing Zoho SalesIQ:', error);
      Alert.alert('Error', 'Failed to initialize chat. Please try again.');
      setIsLoading(false);
    }
  };

  const openChat = () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Chat is not initialized yet. Please wait.');
      return;
    }

    try {
      // Open the chat interface
      ZohoSalesIQ.Launcher.show(ZohoSalesIQ.Launcher.VisibilityMode.ALWAYS);
      console.log('✅ Chat launcher shown');
    } catch (error) {
      console.error('❌ Error opening chat:', error);
      Alert.alert('Error', 'Failed to open chat. Please try again.');
    }
  };

  const closeChat = () => {
    try {
      // Close the modal
      console.log('✅ Chat modal closed');
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
                <Text style={styles.agentName}>Influ Mojo Support</Text>
                <Text style={styles.agentStatus}>
                  {isLoading ? 'Connecting...' : 'Ready to chat'}
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
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Connecting to Zoho SalesIQ...</Text>
            </View>
          ) : (
            <View style={styles.chatContainer}>
              <View style={styles.welcomeMessage}>
                <Ionicons name="chatbubble-ellipses" size={48} color={COLORS.primary} />
                <Text style={styles.welcomeTitle}>Chat with Support</Text>
                <Text style={styles.welcomeText}>
                  Get instant help with your orders and inquiries. Our support team is here to assist you 24/7.
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.startChatButton}
                onPress={openChat}
                disabled={!isInitialized}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                <Text style={styles.startChatButtonText}>
                  {isInitialized ? 'Start Chat' : 'Initializing...'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
  agentName: {
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textGray,
  },
  chatContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  welcomeMessage: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startChatButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ZohoChatWidget; 