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
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../config/colors';
import { useAppSelector } from '../../store/hooks';
import { ticketAPI } from '../../services/apiService';
import { ChatLoader } from '../../components';

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
  status?: 'sending' | 'sent' | 'failed';
  channel_type?: 'brand_agent' | 'creator_agent';
}

interface AgentStatus {
  is_online: boolean;
  status: 'available' | 'busy' | 'offline' | 'away';
  last_online_at?: string;
  agent_name?: string;
}

interface ChatResponse {
  messages: Message[];
  agent_status: AgentStatus;
  has_older_messages: boolean;
}

export default function CreatorChatScreen({ navigation, route }: CreatorChatScreenProps) {
  const { ticketId, orderId, orderTitle } = route.params;
  const insets = useSafeAreaInsets();
  const user = useAppSelector(state => state.auth.user);
  const userType = useAppSelector(state => state.auth.userType);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);

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

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🎫 Initializing creator chat for ticket ${ticketId}...`);

      // Get ticket messages from backend - only creator_agent channel
      const response = await ticketAPI.getTicketMessages(ticketId);
      
      if (response.success) {
        const chatData: ChatResponse = response.data;
        const fetchedMessages = chatData.messages || [];
        
        // Filter messages to only show creator_agent channel messages
        const creatorAgentMessages = fetchedMessages.filter(msg => 
          msg.channel_type === 'creator_agent' || !msg.channel_type // Include legacy messages without channel_type
        );
        
        setMessages(creatorAgentMessages);
        setAgentStatus(chatData.agent_status || null);
        setHasOlderMessages(chatData.has_older_messages || false);
        
        // Store the last message ID for polling
        if (creatorAgentMessages.length > 0) {
          lastMessageIdRef.current = creatorAgentMessages[creatorAgentMessages.length - 1].id;
        }
        
        setIsConnected(true);
        console.log(`✅ Creator chat initialized for ticket ${ticketId}`);
        console.log(`👨‍💼 Agent status:`, chatData.agent_status);
        console.log(`📜 Has older messages:`, chatData.has_older_messages);
        console.log(`💬 Loaded ${creatorAgentMessages.length} creator_agent messages`);
      } else {
        setError(response.error || 'Failed to load messages');
        console.error('❌ Failed to initialize chat:', response.error);
      }
    } catch (error) {
      console.error('❌ Error initializing chat:', error);
      setError('Failed to initialize chat');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    // Clear any existing polling interval
    stopPolling();
    
    // Start polling every 3 seconds for new messages
    pollingIntervalRef.current = setInterval(async () => {
      try {
        await checkForNewMessages();
      } catch (error) {
        console.error('❌ Error during polling:', error);
      }
    }, 3000); // Poll every 3 seconds
    
    console.log('🔄 Started message polling for ticket:', ticketId);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('⏹️ Stopped message polling for ticket:', ticketId);
    }
  };

  const checkForNewMessages = async () => {
    try {
      const response = await ticketAPI.getTicketMessages(ticketId);
      
      if (response.success) {
        const fetchedMessages = response.data.messages || [];
        
        // Filter to only creator_agent channel messages
        const creatorAgentMessages = fetchedMessages.filter(msg => 
          msg.channel_type === 'creator_agent' || !msg.channel_type
        );
        
        // Check if there are new messages
        if (creatorAgentMessages.length > 0) {
          const lastFetchedMessageId = creatorAgentMessages[creatorAgentMessages.length - 1].id;
          
          if (lastMessageIdRef.current !== lastFetchedMessageId) {
            console.log('🆕 New creator_agent messages detected, updating chat...');
            
            // Use functional state update to get the current messages
            setMessages(prevMessages => {
              // Create a Set of current message IDs for efficient lookup
              const currentMessageIds = new Set(prevMessages.map(msg => msg.id));
              
              // Create a Set of current message content for duplicate detection (text + sender_name)
              const currentMessageContent = new Set(
                prevMessages.map(msg => `${msg.text}-${msg.sender_name}`)
              );
              
              // Separate new messages and messages to update
              const newMessages: Message[] = [];
              const updatedMessages = prevMessages.map(existingMsg => {
                // Check if this existing message has a corresponding fetched message by ID
                const fetchedMsgById = creatorAgentMessages.find(fm => fm.id === existingMsg.id);
                if (fetchedMsgById) {
                  // Update the existing message with server data and mark as sent
                  console.log('🔄 Updating existing message by ID:', existingMsg.id);
                  return {
                    ...existingMsg,
                    ...fetchedMsgById,
                    status: 'sent' as const
                  };
                }
                
                // Check if this existing message has a corresponding fetched message by content
                const fetchedMsgByContent = creatorAgentMessages.find(fm => 
                  fm.text === existingMsg.text && 
                  fm.sender_name === existingMsg.sender_name &&
                  Math.abs(new Date(fm.created_at).getTime() - new Date(existingMsg.created_at).getTime()) < 10000 // Within 10 seconds
                );
                if (fetchedMsgByContent && existingMsg.status === 'sending') {
                  // Update the existing message with server data and mark as sent
                  console.log('🔄 Updating existing message by content:', existingMsg.text);
                  return {
                    ...existingMsg,
                    ...fetchedMsgByContent,
                    status: 'sent' as const
                  };
                }
                
                return existingMsg;
              });
              
              // Add truly new messages
              creatorAgentMessages.forEach(fetchedMsg => {
                const messageContentKey = `${fetchedMsg.text}-${fetchedMsg.sender_name}`;
                
                // Check if this message is already in the current state (by ID or content)
                const isDuplicateById = currentMessageIds.has(fetchedMsg.id);
                const isDuplicateByContent = currentMessageContent.has(messageContentKey);
                const isPending = pendingMessageIdsRef.current.has(fetchedMsg.id) || pendingMessageIdsRef.current.has(messageContentKey);
                
                if (!isDuplicateById && !isDuplicateByContent && !isPending) {
                  console.log('📝 Adding new creator_agent message:', fetchedMsg.text);
                  newMessages.push({
                    ...fetchedMsg,
                    status: 'sent' as const
                  });
                } else {
                  console.log('🚫 Skipping duplicate creator_agent message:', fetchedMsg.text, {
                    isDuplicateById,
                    isDuplicateByContent,
                    isPending,
                    messageId: fetchedMsg.id,
                    contentKey: messageContentKey
                  });
                }
              });
              
              if (newMessages.length > 0) {
                // Add only new messages to existing state
                console.log(`📝 Adding ${newMessages.length} new creator_agent messages to chat`);
                lastMessageIdRef.current = lastFetchedMessageId;
                
                // Auto-scroll to bottom if user is near the bottom
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
                
                return [...updatedMessages, ...newMessages];
              } else {
                // If no new messages but we updated existing ones, return updated list
                console.log('🔄 Updated existing creator_agent messages');
                lastMessageIdRef.current = lastFetchedMessageId;
                return updatedMessages;
              }
            });
          }
        } else if (creatorAgentMessages.length === 0 && messages.length > 0) {
          // If no messages returned but we had messages before, something might be wrong
          console.log('⚠️ No creator_agent messages returned from server, but we had messages before');
        }
      }
    } catch (error) {
      console.error('❌ Error checking for new messages:', error);
    }
  };

  const reconnectIfNeeded = async () => {
    try {
      console.log('🔄 Reconnecting to creator chat for ticket:', ticketId);
      
      // Refresh messages when screen comes into focus
      const response = await ticketAPI.getTicketMessages(ticketId);
      if (response.success) {
        const fetchedMessages = response.data.messages || [];
        const creatorAgentMessages = fetchedMessages.filter(msg => 
          msg.channel_type === 'creator_agent' || !msg.channel_type
        );
        
        console.log(`📥 Reconnected: received ${creatorAgentMessages.length} creator_agent messages from server`);
        
        // Merge fetched messages with existing messages to preserve user's own messages
        setMessages(prevMessages => {
          // Create a map of existing messages by ID
          const existingMessagesMap = new Map(prevMessages.map(msg => [msg.id, msg]));
          
          // Add or update messages from server
          creatorAgentMessages.forEach(fetchedMsg => {
            existingMessagesMap.set(fetchedMsg.id, fetchedMsg);
          });
          
          // Convert back to array and sort by timestamp
          const mergedMessages = Array.from(existingMessagesMap.values())
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          console.log(`✅ Reconnect complete: ${mergedMessages.length} total creator_agent messages (${creatorAgentMessages.length} from server + ${prevMessages.length - creatorAgentMessages.length} preserved)`);
          return mergedMessages;
        });
        
        // Update last message ID
        if (creatorAgentMessages.length > 0) {
          const lastMessage = creatorAgentMessages[creatorAgentMessages.length - 1];
          lastMessageIdRef.current = lastMessage.id;
        }
      }
    } catch (error) {
      console.error('❌ Error reconnecting:', error);
    }
  };

  const cleanup = async () => {
    try {
      stopPolling();
      setIsConnected(false);
      console.log('🧹 Creator chat cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately
    setSending(true);

    try {
      const messageData = {
        message_text: messageText,
        sender_role: 'creator' as const,
        channel_type: 'creator_agent' as const,
        message_type: 'text' as const
      };

      console.log('📤 Sending creator_agent message:', messageData);
      const response = await ticketAPI.sendTicketMessage(ticketId, messageData);
      
      if (response.success) {
        console.log('✅ Creator_agent message sent successfully:', response.data);
        const newMsg: Message = {
          id: response.data?.message?.id || `temp-${Date.now()}`,
          text: messageText,
          sender_role: 'creator',
          sender_name: user?.name || 'You',
          timestamp: response.data?.message?.timestamp || new Date().toISOString(),
          created_at: response.data?.message?.created_at || new Date().toISOString(),
          status: 'sent' as const,
          channel_type: 'creator_agent'
        };
        
        // Add message ID to pending set to prevent duplicate addition by polling
        pendingMessageIdsRef.current.add(newMsg.id);
        
        // Also add the content key to prevent duplicates by content
        const contentKey = `${newMsg.text}-${newMsg.sender_name}`;
        pendingMessageIdsRef.current.add(contentKey);
        
        // Add message to local state immediately with 'sent' status
        setMessages(prev => [...prev, newMsg]);
        
        // Update the last message ID for polling
        lastMessageIdRef.current = newMsg.id;
        
        // Remove from pending set after a longer delay to ensure polling has time to process
        setTimeout(() => {
          pendingMessageIdsRef.current.delete(newMsg.id);
          pendingMessageIdsRef.current.delete(contentKey);
          console.log('🗑️ Removed message ID and content key from pending set:', newMsg.id, contentKey);
        }, 5000); // Increased to 5 seconds
        
        // Force refresh the chat to ensure we have the latest data
        setTimeout(() => {
          checkForNewMessages();
        }, 1000);
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        console.error('❌ Creator_agent message send failed:', response);
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending creator_agent message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Restore the message text if sending failed
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const loadOlderMessages = async () => {
    if (loadingOlderMessages || !hasOlderMessages) return;
    
    try {
      setLoadingOlderMessages(true);
      console.log('📜 Loading older creator_agent messages...');
      
      const response = await ticketAPI.getTicketMessages(ticketId, true);
      
      if (response.success) {
        const chatData: ChatResponse = response.data;
        const olderMessages = chatData.messages || [];
        
        // Filter to only creator_agent channel messages
        const olderCreatorAgentMessages = olderMessages.filter(msg => 
          msg.channel_type === 'creator_agent' || !msg.channel_type
        );
        
        // Merge older messages with existing messages
        setMessages(prevMessages => {
          const existingIds = new Set(prevMessages.map(msg => msg.id));
          const newMessages = olderCreatorAgentMessages.filter(msg => !existingIds.has(msg.id));
          return [...newMessages, ...prevMessages].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });
        
        setHasOlderMessages(chatData.has_older_messages || false);
        console.log(`✅ Loaded ${olderCreatorAgentMessages.length} older creator_agent messages`);
      } else {
        console.error('❌ Failed to load older creator_agent messages:', response.error);
      }
    } catch (error) {
      console.error('❌ Error loading older creator_agent messages:', error);
    } finally {
      setLoadingOlderMessages(false);
    }
  };

  const renderAgentStatus = () => {
    if (!agentStatus) return null;

    const getStatusColor = () => {
      switch (agentStatus.status) {
        case 'available': return COLORS.success;
        case 'busy': return COLORS.warning;
        case 'offline': return COLORS.error;
        case 'away': return COLORS.warning;
        default: return COLORS.gray;
      }
    };

    const getStatusText = () => {
      switch (agentStatus.status) {
        case 'available': return 'Online';
        case 'busy': return 'Busy';
        case 'offline': return 'Offline';
        case 'away': return 'Away';
        default: return 'Unknown';
      }
    };

    return (
      <View style={styles.agentStatusContainer}>
        <View style={styles.agentStatusRow}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.agentStatusText}>
            Agent {agentStatus.agent_name || 'Support'} - {getStatusText()}
          </Text>
        </View>
        {agentStatus.status === 'offline' && hasOlderMessages && (
          <TouchableOpacity 
            onPress={loadOlderMessages}
            disabled={loadingOlderMessages}
          >
            <LinearGradient
              colors={COLORS.gradientOrange}
              style={styles.loadOlderButton}
            >
              {loadingOlderMessages ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.loadOlderButtonText}>Load Older Messages</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
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
    const isOwnMessage = item.sender_role === 'creator';
    const isSystem = item.sender_role === 'system';
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
        
        // Check if the timestamp is very recent (within 1 minute)
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) {
          return 'Just now';
        } else if (diffInSeconds < 3600) {
          const diffInMinutes = Math.floor(diffInSeconds / 60);
          return `${diffInMinutes}m ago`;
        } else {
          return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
      } catch (error) {
        console.error('Error formatting timestamp:', error);
        return '--:--';
      }
    };
    
    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View style={messageStyle.container}>
        {isOwnMessage ? (
          <LinearGradient
            colors={COLORS.gradientOrange}
            style={[styles.ownMessageBubble, isSending && styles.sendingMessage, isFailed && styles.failedMessage]}
          >
            <View style={styles.messageHeader}>
              <Text style={messageStyle.sender}>{item.sender_name}</Text>
            </View>
            <Text style={messageStyle.text}>{item.text}</Text>
            <Text style={messageStyle.time}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </LinearGradient>
        ) : (
          <View style={[messageStyle.bubble, isSending && styles.sendingMessage, isFailed && styles.failedMessage]}>
            <View style={styles.messageHeader}>
              <Text style={messageStyle.sender}>{item.sender_name}</Text>
            </View>
            <Text style={messageStyle.text}>{item.text}</Text>
            <Text style={messageStyle.time}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        )}
        {isSending && (
          <ChatLoader type="sending" message="Sending..." />
        )}
        {isFailed && (
          <ChatLoader type="error" message="Failed to send" />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Loading creator chat...</Text>
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
          <TouchableOpacity onPress={initializeChat}>
            <LinearGradient
              colors={COLORS.gradientOrange}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </LinearGradient>
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
          <Text style={styles.headerSubtitle}>Creator Support Chat</Text>
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
            placeholder="Type your message to agent..."
            placeholderTextColor={COLORS.textGray}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <LinearGradient
              colors={COLORS.gradientOrange}
              style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
            >
              {sending ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons name="send" size={20} color={COLORS.primary} />
              )}
            </LinearGradient>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textGray,
  },
  sendingMessage: {
    borderColor: COLORS.textGray,
    borderWidth: 1,
  },
  failedMessage: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sendingText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.secondary,
  },
  failedText: {
    fontSize: 12,
    color: COLORS.error,
  },
  agentStatusContainer: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  agentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  agentStatusText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  loadOlderButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  loadOlderButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
}); 