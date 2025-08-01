import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ZohoSalesIQ } from 'react-native-zohosalesiq-mobilisten';
import { useAppSelector } from '../store/hooks';
import { zohoAPI } from '../services/apiService';
import COLORS from '../config/colors';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  agentName?: string;
  messageType?: string;
}

interface ZohoChatWidgetProps {
  visible: boolean;
  onClose: () => void;
  onMessageSent?: (message: any) => void;
  orderInfo?: {
    orderId: string;
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
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const user = useAppSelector(state => state.auth.user);

  // Zoho SalesIQ Configuration
  const zohoConfig = {
    ios: {
      appKey: process.env.EXPO_PUBLIC_ZOHO_IOS_APP_KEY || 'your_ios_app_key',
      accessKey: process.env.EXPO_PUBLIC_ZOHO_IOS_ACCESS_KEY || 'your_ios_access_key'
    },
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

  // Connect to chat when initialized
  useEffect(() => {
    if (isInitialized && visible && !isConnected) {
      connectToChat();
    }
  }, [isInitialized, visible, isConnected]);

  const initializeZohoChat = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('💬 Initializing Zoho SalesIQ for user:', user.id);

      const appKey = Platform.OS === 'ios' ? zohoConfig.ios.appKey : zohoConfig.android.appKey;
      const accessKey = Platform.OS === 'ios' ? zohoConfig.ios.accessKey : zohoConfig.android.accessKey;

      ZohoSalesIQ.initWithCallback(appKey, accessKey, (success) => {
        if (success) {
          console.log('✅ Zoho SalesIQ initialized successfully');
          setIsInitialized(true);
          
          // Hide the launcher completely
          ZohoSalesIQ.Launcher.show(ZohoSalesIQ.Launcher.VisibilityMode.NEVER);
          
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

  const loadChatHistory = async () => {
    if (!orderInfo?.visitorId) {
      console.log('⚠️ No visitor ID available for chat history');
      return;
    }

    setIsLoadingHistory(true);
    try {
      console.log('📜 Loading chat history for visitor:', orderInfo.visitorId);
      
      const response = await zohoAPI.getChatHistory(orderInfo.visitorId, 50);
      
      if (response.success && response.data) {
        console.log('✅ Chat history loaded:', response.data);
        
        // Convert Zoho messages to our Message format
        const historyMessages: Message[] = response.data.messages?.map((msg: any) => ({
          id: msg.message_id || `msg_${Date.now()}_${Math.random()}`,
          text: msg.message || msg.content || '',
          isUser: msg.sender_type === 'visitor' || msg.sender_type === 'user',
          timestamp: new Date(msg.timestamp || msg.created_time || Date.now()),
          agentName: msg.agent_name || msg.sender_name,
          messageType: msg.message_type || 'text'
        })) || [];

        // Sort messages by timestamp
        historyMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        setMessages(historyMessages);
        console.log(`📜 Loaded ${historyMessages.length} messages from history`);
      } else {
        console.log('📜 No chat history found or empty response');
        // Add welcome message if no history
        addWelcomeMessage();
      }
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
      // Add welcome message on error
      addWelcomeMessage();
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: orderInfo 
        ? `Welcome! You're chatting with support about Order #${orderInfo.orderId.slice(-6)}. How can we help you today?`
        : 'Welcome! How can we help you today?',
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  };

  const connectToChat = async () => {
    try {
      console.log('💬 Connecting to chat for order:', orderInfo?.orderId);
      
      // Load chat history first
      await loadChatHistory();
      
      setIsConnected(true);
      console.log('✅ Connected to chat');
      
    } catch (error) {
      console.error('❌ Error connecting to chat:', error);
      Alert.alert('Error', 'Failed to connect to chat. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Send message to Zoho SalesIQ
      if (orderInfo?.visitorId) {
        console.log('📤 Sending message to Zoho:', userMessage.text);
        
        const response = await zohoAPI.sendChatMessage(
          orderInfo.visitorId, 
          userMessage.text, 
          'text'
        );
        
        if (response.success) {
          console.log('✅ Message sent successfully to Zoho');
        } else {
          console.error('❌ Failed to send message to Zoho:', response.message);
        }
      }
      
      // Simulate agent response (you can replace this with real-time message listening)
      setTimeout(() => {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Thank you for your message about Order #${orderInfo?.orderId.slice(-6) || 'your order'}. Our support team will respond shortly.`,
          isUser: false,
          timestamp: new Date(),
          agentName: 'Support Team'
        };
        
        setMessages(prev => [...prev, agentMessage]);
        setIsTyping(false);
        
        // Call onMessageSent callback
        if (onMessageSent) {
          onMessageSent(userMessage);
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      setIsTyping(false);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const closeChat = () => {
    try {
      // Hide the launcher completely
      ZohoSalesIQ.Launcher.show(ZohoSalesIQ.Launcher.VisibilityMode.NEVER);
      
      // Reset state
      setIsConnected(false);
      setMessages([]);
      setInputText('');
      setIsTyping(false);
      setIsLoadingHistory(false);
      
      console.log('✅ Chat closed');
      onClose();
    } catch (error) {
      console.error('❌ Error closing chat:', error);
      onClose();
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.agentMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.agentBubble
      ]}>
        {!item.isUser && item.agentName && (
          <Text style={styles.agentName}>{item.agentName}</Text>
        )}
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : styles.agentMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={styles.messageTime}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeChat}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.agentInfo}>
              <View style={styles.agentAvatar}>
                <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.agentDetails}>
                <Text style={styles.agentName}>
                  {orderInfo ? `Order #${orderInfo.orderId.slice(-6)} Support` : 'Influ Mojo Support'}
                </Text>
                <Text style={styles.agentStatus}>
                  {isLoading ? 'Connecting...' : isConnected ? 'Online' : 'Connecting...'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeChat} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages */}
        <View style={styles.chatContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Connecting to support...</Text>
            </View>
          ) : isLoadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading conversation history...</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              showsVerticalScrollIndicator={false}
            />
          )}
          
          {isTyping && (
            <View style={styles.typingContainer}>
              <Text style={styles.typingText}>Support is typing...</Text>
            </View>
          )}
        </View>

        {/* Input Area */}
        {isConnected && !isLoadingHistory && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() ? '#fff' : '#999'} 
              />
            </TouchableOpacity>
      </View>
        )}
      </KeyboardAvoidingView>
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
  chatContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 10, // Add some padding at the bottom for the input area
  },
  messageContainer: {
    marginBottom: 10,
    alignSelf: 'flex-start', // Align user messages to the left
  },
  userMessage: {
    alignSelf: 'flex-end', // Align user messages to the right
  },
  agentMessage: {
    alignSelf: 'flex-start', // Align agent messages to the left
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 5,
  },
  agentBubble: {
    backgroundColor: '#e0e0e0',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#ffffff',
  },
  agentName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  userMessageText: {
    color: '#ffffff',
  },
  agentMessageText: {
    color: COLORS.textDark,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  typingText: {
    fontSize: 14,
    color: '#555',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    color: COLORS.textDark,
    minHeight: 40,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
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
});

export default ZohoChatWidget; 