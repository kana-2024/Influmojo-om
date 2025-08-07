import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../store/hooks';
import { streamChatService } from '../../services/streamChatService';
import { ticketAPI } from '../../services/apiService';
import COLORS from '../../config/colors';

interface AgentTicketViewProps {
  navigation: any;
  route: {
    params: {
      ticketId: string;
      orderId?: string;
      orderTitle?: string;
    };
  };
}

interface Message {
  id: string;
  text: string;
  sender_role: 'brand' | 'creator' | 'agent' | 'system';
  sender_name: string;
  timestamp: string;
  created_at: string;
  status?: 'sending' | 'sent' | 'failed';
}

interface AgentStatus {
  is_online: boolean;
  status: 'available' | 'busy' | 'offline' | 'away';
  last_online_at?: string;
  agent_name?: string;
}

interface CannedMessage {
  id: string;
  title: string;
  message: string;
  category: string;
}

interface ChatResponse {
  messages: Message[];
  agent_status: AgentStatus;
  has_older_messages: boolean;
}

const defaultCannedMessages: CannedMessage[] = [
  {
    id: '1',
    title: 'Welcome Message',
    message: 'Hello! Thank you for reaching out. I\'m here to help you with your inquiry. How can I assist you today?',
    category: 'greeting'
  },
  {
    id: '2',
    title: 'Order Status Update',
    message: 'I understand you\'re asking about your order status. Let me check that for you right away.',
    category: 'order'
  },
  {
    id: '3',
    title: 'Payment Confirmation',
    message: 'Your payment has been received and confirmed. Your order is now being processed.',
    category: 'payment'
  },
  {
    id: '4',
    title: 'Issue Resolution',
    message: 'I apologize for the inconvenience. I\'m working to resolve this issue for you as quickly as possible.',
    category: 'support'
  },
  {
    id: '5',
    title: 'Follow-up',
    message: 'I wanted to follow up on our previous conversation. Is there anything else you need assistance with?',
    category: 'follow-up'
  },
  {
    id: '6',
    title: 'Closing Message',
    message: 'Thank you for contacting us. If you have any further questions, please don\'t hesitate to reach out.',
    category: 'closing'
  }
];

export default function AgentTicketView({ navigation, route }: AgentTicketViewProps) {
  const { ticketId, orderId, orderTitle } = route.params;
  const insets = useSafeAreaInsets();
  const user = useAppSelector(state => state.auth.user);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [showCannedMessages, setShowCannedMessages] = useState(false);
  const [filteredCannedMessages, setFilteredCannedMessages] = useState<CannedMessage[]>([]);

  const flatListRef = useRef<FlatList>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const pendingMessageIdsRef = useRef<Set<string>>(new Set());

  // Initialize chat when component mounts
  useEffect(() => {
    initializeChat();
    return () => {
      cleanup();
    };
  }, [ticketId]);

  // Handle focus/blur for navigation
  useFocusEffect(
    React.useCallback(() => {
      if (isConnected) {
        reconnectIfNeeded();
        startPolling();
      }
      return () => {
        stopPolling();
      };
    }, [isConnected])
  );

  // Handle canned messages when typing '/'
  useEffect(() => {
    if (newMessage.startsWith('/')) {
      const searchTerm = newMessage.slice(1).toLowerCase();
      const filtered = defaultCannedMessages.filter(msg => 
        msg.title.toLowerCase().includes(searchTerm) || 
        msg.message.toLowerCase().includes(searchTerm) ||
        msg.category.toLowerCase().includes(searchTerm)
      );
      setFilteredCannedMessages(filtered);
      setShowCannedMessages(filtered.length > 0);
    } else {
      setShowCannedMessages(false);
    }
  }, [newMessage]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get initial messages
      const response = await ticketAPI.getTicketMessages(ticketId);
      
      if (response.success) {
        setMessages(response.data.messages || []);
        setAgentStatus(response.data.agent_status || null);
        setHasOlderMessages(response.data.has_older_messages || false);
        setIsConnected(true);
        
        if (response.data.messages && response.data.messages.length > 0) {
          lastMessageIdRef.current = response.data.messages[response.data.messages.length - 1].id;
        }
      } else {
        setError(response.error || 'Failed to load chat');
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(() => {
      checkForNewMessages();
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const checkForNewMessages = async () => {
    try {
      const response = await ticketAPI.getTicketMessages(ticketId);
      
      if (response.success && response.data.messages) {
        const newMessages = response.data.messages.filter(msg => 
          !messages.some(existingMsg => existingMsg.id === msg.id)
        );
        
        if (newMessages.length > 0) {
          setMessages(prev => [...prev, ...newMessages]);
          lastMessageIdRef.current = newMessages[newMessages.length - 1].id;
        }
      }
    } catch (error) {
      console.error('Error checking for new messages:', error);
    }
  };

  const reconnectIfNeeded = async () => {
    try {
      const response = await ticketAPI.getTicketMessages(ticketId);
      
      if (response.success) {
        setMessages(response.data.messages || []);
        setAgentStatus(response.data.agent_status || null);
        setHasOlderMessages(response.data.has_older_messages || false);
      }
    } catch (error) {
      console.error('Error reconnecting:', error);
    }
  };

  const cleanup = async () => {
    stopPolling();
    setIsConnected(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setShowCannedMessages(false);

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      text: messageText,
      sender_role: 'agent',
      sender_name: user?.name || 'Agent',
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    setSending(true);

    try {
      const response = await ticketAPI.sendTicketMessage(ticketId, {
        message_text: messageText,
        sender_role: 'agent',
        message_type: 'text'
      });
      
      if (response.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, id: response.data?.id || msg.id, status: 'sent' }
            : msg
        ));
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'failed' }
            : msg
        ));
        Alert.alert('Error', response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: 'failed' }
          : msg
      ));
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const loadOlderMessages = async () => {
    if (loadingOlderMessages || !hasOlderMessages) return;

    try {
      setLoadingOlderMessages(true);
      const response = await ticketAPI.getTicketMessages(ticketId, true);
      
      if (response.success && response.data.messages) {
        const olderMessages = response.data.messages.filter(msg => 
          !messages.some(existingMsg => existingMsg.id === msg.id)
        );
        
        if (olderMessages.length > 0) {
          setMessages(prev => [...olderMessages, ...prev]);
          setHasOlderMessages(response.data.has_older_messages || false);
        }
      }
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setLoadingOlderMessages(false);
    }
  };

  const handleCannedMessageSelect = (cannedMessage: CannedMessage) => {
    setNewMessage(cannedMessage.message);
    setShowCannedMessages(false);
  };

  const renderAgentStatus = () => {
    if (!agentStatus) return null;

    const getStatusColor = () => {
      switch (agentStatus.status) {
        case 'available':
          return COLORS.success;
        case 'busy':
          return COLORS.warning;
        case 'away':
          return COLORS.warning;
        case 'offline':
          return COLORS.gray;
        default:
          return COLORS.gray;
      }
    };

    const getStatusText = () => {
      switch (agentStatus.status) {
        case 'available':
          return 'Available';
        case 'busy':
          return 'Busy';
        case 'away':
          return 'Away';
        case 'offline':
          return 'Offline';
        default:
          return 'Unknown';
      }
    };

    return (
      <View style={styles.agentStatusContainer}>
        <View style={styles.agentStatusContent}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.agentStatusText}>
            {agentStatus.agent_name || 'Agent'} - {getStatusText()}
          </Text>
        </View>
      </View>
    );
  };

  const getMessageStyle = (message: Message) => {
    const isOwnMessage = message.sender_role === 'agent';
    
    return {
      container: [
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ],
      bubble: [
        styles.messageBubble,
        isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
      ],
      text: [
        styles.messageText,
        isOwnMessage ? styles.ownMessageText : styles.otherMessageText
      ],
      sender: [
        styles.senderText,
        isOwnMessage ? styles.ownSenderText : styles.otherSenderText
      ],
      time: [
        styles.timeText,
        isOwnMessage ? styles.ownTimeText : styles.otherTimeText
      ]
    };
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const messageStyle = getMessageStyle(item);
    const isSending = item.status === 'sending';
    const isFailed = item.status === 'failed';

    // Helper function to safely format timestamp
    const formatTimestamp = (timestamp: string) => {
      if (!timestamp) return '--:--';
      try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          console.warn('Invalid timestamp:', timestamp);
          return '--:--';
        }
        return date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } catch (error) {
        console.error('Error formatting timestamp:', error);
        return '--:--';
      }
    };

    return (
      <View style={messageStyle.container}>
        <View style={[messageStyle.bubble, isSending && styles.sendingMessage, isFailed && styles.failedMessage]}>
          <View style={styles.messageHeader}>
            <Text style={messageStyle.sender}>{item.sender_name}</Text>
            {isSending && (
              <View style={styles.sendingIndicator}>
                <ActivityIndicator size="small" color={COLORS.secondary} />
                <Text style={styles.sendingText}>Sending...</Text>
              </View>
            )}
            {isFailed && (
              <Text style={styles.failedText}>Failed to send</Text>
            )}
          </View>
          <Text style={messageStyle.text}>{item.text}</Text>
          <Text style={messageStyle.time}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderCannedMessage = ({ item }: { item: CannedMessage }) => (
    <TouchableOpacity
      style={styles.cannedMessageItem}
      onPress={() => handleCannedMessageSelect(item)}
    >
      <View style={styles.cannedMessageHeader}>
        <Text style={styles.cannedMessageTitle}>{item.title}</Text>
        <Text style={styles.cannedMessageCategory}>{item.category}</Text>
      </View>
      <Text style={styles.cannedMessagePreview} numberOfLines={2}>
        {item.message}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeChat}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {orderTitle || `Order #${orderId || ticketId}`}
          </Text>
          <Text style={styles.headerSubtitle}>Agent View</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={renderAgentStatus}
        onEndReached={loadOlderMessages}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loadingOlderMessages ? (
            <View style={styles.loadingOlderContainer}>
              <ActivityIndicator size="small" color={COLORS.secondary} />
              <Text style={styles.loadingOlderText}>Loading older messages...</Text>
            </View>
          ) : null
        }
      />

      {/* Canned Messages Modal */}
      <Modal
        visible={showCannedMessages}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCannedMessages(false)}
      >
        <View style={styles.cannedMessagesOverlay}>
          <View style={styles.cannedMessagesContainer}>
            <View style={styles.cannedMessagesHeader}>
              <Text style={styles.cannedMessagesTitle}>Canned Messages</Text>
              <TouchableOpacity onPress={() => setShowCannedMessages(false)}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredCannedMessages}
              renderItem={renderCannedMessage}
              keyExtractor={(item) => item.id}
              style={styles.cannedMessagesList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message... (type '/' for canned messages)"
            placeholderTextColor={COLORS.textGray}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={newMessage.trim() ? COLORS.white : COLORS.textGray} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  agentStatusContainer: {
    backgroundColor: COLORS.white,
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  agentStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  agentStatusText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  ownMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ownSenderText: {
    color: COLORS.white,
  },
  otherSenderText: {
    color: COLORS.textGray,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.textDark,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
  },
  ownTimeText: {
    color: COLORS.white + '80',
  },
  otherTimeText: {
    color: COLORS.textGray,
  },
  sendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendingText: {
    fontSize: 12,
    color: COLORS.textGray,
    marginLeft: 4,
  },
  failedText: {
    fontSize: 12,
    color: COLORS.error,
  },
  sendingMessage: {
    opacity: 0.7,
  },
  failedMessage: {
    opacity: 0.5,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
    color: COLORS.textDark,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.borderLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textGray,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOlderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingOlderText: {
    fontSize: 14,
    color: COLORS.textGray,
    marginLeft: 8,
  },
  cannedMessagesOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  cannedMessagesContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  cannedMessagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cannedMessagesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  cannedMessagesList: {
    maxHeight: 400,
  },
  cannedMessageItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cannedMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cannedMessageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  cannedMessageCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cannedMessagePreview: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 20,
  },
}); 