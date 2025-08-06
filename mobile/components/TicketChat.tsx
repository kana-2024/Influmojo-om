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
  TextInput,
} from 'react-native';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  MessageList,
  OverlayProvider,
} from 'stream-chat-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { streamChatService } from '../services/streamChatService';
import { ticketAPI } from '../services/apiService';

interface TicketChatProps {
  ticketId: string;
  onClose?: () => void;
  navigation?: any;
}

interface ChatState {
  client: StreamChat | null;
  channel: any;
  loading: boolean;
  error: string | null;
}

export default function TicketChat({ ticketId, onClose, navigation }: TicketChatProps) {
  const [chatState, setChatState] = useState<ChatState>({
    client: null,
    channel: null,
    loading: true,
    error: null,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<any>(null);

  // Initialize StreamChat when component mounts
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
        // Reconnect when screen comes into focus
        reconnectIfNeeded();
      }
      return () => {
        // Optional: disconnect when screen goes out of focus
        // cleanup();
      };
    }, [isConnected])
  );

  const initializeChat = async () => {
    try {
      setChatState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log(`🎫 Initializing chat for ticket ${ticketId}...`);

      // Get StreamChat token from backend
      const { token, userId, apiKey } = await streamChatService.getToken();

      // Initialize StreamChat client
      const client = await streamChatService.initialize(apiKey);

      // Connect user
      await streamChatService.connectUser(userId, token);

      // Join ticket channel
      const channelId = await streamChatService.joinTicketChannel(ticketId);

      // Get channel instance
      const channel = await streamChatService.getChannel(channelId);
      channelRef.current = channel;

      setChatState({
        client,
        channel,
        loading: false,
        error: null,
      });
      setIsConnected(true);

      console.log(`✅ Chat initialized for ticket ${ticketId}`);
    } catch (error) {
      console.error('❌ Error initializing chat:', error);
      setChatState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize chat',
      }));
      
      Alert.alert(
        'Chat Error',
        'Failed to initialize chat. Please try again.',
        [
          { text: 'OK', onPress: () => onClose?.() },
        ]
      );
    }
  };

  const reconnectIfNeeded = async () => {
    try {
      if (!streamChatService.isConnected()) {
        console.log('🔄 Reconnecting to StreamChat...');
        await initializeChat();
      }
    } catch (error) {
      console.error('❌ Error reconnecting:', error);
    }
  };

  const cleanup = async () => {
    try {
      if (channelRef.current) {
        // Leave the channel
        await streamChatService.leaveTicketChannel(ticketId);
        channelRef.current = null;
      }
      
      // Disconnect user
      await streamChatService.disconnectUser();
      
      setChatState({
        client: null,
        channel: null,
        loading: false,
        error: null,
      });
      setIsConnected(false);
      
      console.log('🧹 Chat cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      if (!chatState.channel) {
        throw new Error('Channel not available');
      }

      setIsSending(true);
      
      // Extract ticket ID from channel ID
      const ticketId = chatState.channel.id.replace(/^ticket[-_]/, '');
      
      if (!ticketId) {
        throw new Error('Invalid channel ID format');
      }

      // Get current user role
      const currentUser = streamChatService.getCurrentUser();
      const senderRole = (currentUser?.role as 'brand' | 'creator' | 'agent' | 'system') || 'agent';

      // Send message through backend API
      await ticketAPI.sendTicketMessage(ticketId, {
        message_text: message,
        message_type: 'text',
        sender_role: senderRole
      });

      // Clear the input
      setNewMessage('');
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendPress = () => {
    if (newMessage.trim() && !isSending) {
      handleSendMessage(newMessage.trim());
    }
  };

  const handleChannelError = (error: any) => {
    console.error('❌ Channel error:', error);
    setChatState(prev => ({
      ...prev,
      error: 'Channel error occurred',
    }));
  };

  if (chatState.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Connecting to support chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (chatState.error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {chatState.error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={initializeChat}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!chatState.client || !chatState.channel) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Chat not available</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Support Chat</Text>
          <Text style={styles.headerSubtitle}>Ticket #{ticketId}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Interface */}
        <OverlayProvider>
          <Chat client={chatState.client}>
            <Channel
              channel={chatState.channel}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
              <View style={styles.chatContainer}>
                <MessageList />
                {/* Custom Message Input */}
                <View style={styles.messageInputContainer}>
                  <TextInput
                    style={styles.messageInput}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type your message..."
                    multiline
                    maxLength={1000}
                    editable={!isSending}
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, (!newMessage.trim() || isSending) && styles.sendButtonDisabled]}
                    onPress={handleSendPress}
                    disabled={!newMessage.trim() || isSending}
                  >
                    <Text style={styles.sendButtonText}>
                      {isSending ? 'Sending...' : 'Send'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Channel>
          </Chat>
        </OverlayProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  messageInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    fontSize: 16,
    minHeight: 40,
    maxHeight: 150,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.7,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 