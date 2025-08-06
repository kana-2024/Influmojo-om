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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { streamChatService } from '../../services/streamChatService';
import { ticketAPI } from '../../services/apiService';
import COLORS from '../../config/colors';

interface CreatorChatScreenProps {
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
}

export default function CreatorChatScreen({ navigation, route }: CreatorChatScreenProps) {
  const { ticketId, orderId, orderTitle } = route.params;
  const insets = useSafeAreaInsets();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

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
      }
      return () => {
        // Optional: disconnect when screen goes out of focus
      };
    }, [isConnected])
  );

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🎫 Initializing creator chat for ticket ${ticketId}...`);

      // Get ticket messages from backend
      const response = await ticketAPI.getTicketMessages(ticketId);
      
      if (response.success) {
        setMessages(response.data.messages || []);
        setIsConnected(true);
        console.log(`✅ Creator chat initialized for ticket ${ticketId}`);
      } else {
        throw new Error(response.error || 'Failed to load messages');
      }
    } catch (error) {
      console.error('❌ Error initializing creator chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize chat');
    } finally {
      setLoading(false);
    }
  };

  const reconnectIfNeeded = async () => {
    try {
      // Refresh messages when screen comes into focus
      const response = await ticketAPI.getTicketMessages(ticketId);
      if (response.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('❌ Error reconnecting:', error);
    }
  };

  const cleanup = async () => {
    try {
      setIsConnected(false);
      console.log('🧹 Creator chat cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      const messageData = {
        message_text: newMessage.trim(),
        sender_role: 'creator' as const,
        message_type: 'text' as const
      };

      const response = await ticketAPI.sendTicketMessage(ticketId, messageData);
      
      if (response.success) {
        const newMsg: Message = {
          id: response.data.message.id,
          text: newMessage.trim(),
          sender_role: 'creator',
          sender_name: 'You',
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getMessageStyle = (message: Message) => {
    const isOwnMessage = message.sender_role === 'creator';
    
    return {
      container: isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
      bubble: isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
      text: isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
      sender: isOwnMessage ? styles.ownMessageSender : styles.otherMessageSender,
      time: isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
    };
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const messageStyle = getMessageStyle(item);
    const isSystem = item.sender_role === 'system';
    
    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View style={messageStyle.container}>
        <View style={messageStyle.bubble}>
          <Text style={messageStyle.sender}>{item.sender_name}</Text>
          <Text style={messageStyle.text}>{item.text}</Text>
          <Text style={messageStyle.time}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

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
          <Text style={styles.headerSubtitle}>Support Chat</Text>
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
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

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
            placeholder="Type your message..."
            placeholderTextColor={COLORS.textGray}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.primary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  messagesContainer: {
    padding: 16,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ownMessageBubble: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
  },
  otherMessageBubble: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  ownMessageText: {
    color: COLORS.primary,
    fontSize: 16,
    lineHeight: 20,
  },
  otherMessageText: {
    color: COLORS.textDark,
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageSender: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.8,
  },
  otherMessageSender: {
    color: COLORS.textGray,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  ownMessageTime: {
    color: COLORS.primary,
    fontSize: 10,
    marginTop: 4,
    opacity: 0.7,
  },
  otherMessageTime: {
    color: COLORS.textGray,
    fontSize: 10,
    marginTop: 4,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessageText: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    color: COLORS.textGray,
    textAlign: 'center',
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
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    color: COLORS.textDark,
  },
  sendButton: {
    backgroundColor: COLORS.secondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textGray,
  },
}); 