'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Send, MessageSquare, Users, Clock, X, Shield, User, Building, UserCheck } from 'lucide-react';
import { ticketsAPI, authAPI } from '@/lib/api';
import { User as UserType, Message as ApiMessage } from '@/types';

interface TicketChatProps {
  ticketId: string;
  ticketTitle?: string;
  onClose?: () => void;
}

interface Message {
  id: string;
  text: string;
  sender_role?: 'brand' | 'creator' | 'agent' | 'system' | 'super_admin';
  sender_name: string;
  timestamp: string;
  created_at: string;
  status?: 'sending' | 'sent' | 'failed';
  channel_type?: 'brand_agent' | 'creator_agent';
  sender?: {
    id: string;
    name: string;
    user_type: string;
  };
}

type ChannelType = 'brand_agent' | 'creator_agent';

export default function TicketChat({ ticketId, ticketTitle, onClose }: TicketChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [activeChannel, setActiveChannel] = useState<ChannelType>('brand_agent');
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const pendingMessageIdsRef = useRef<Set<string>>(new Set());

  // Load current user information
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userResponse = await authAPI.getCurrentUser();
        if (userResponse.success && userResponse.data?.user) {
          setCurrentUser(userResponse.data.user);
        }
      } catch (error) {
        console.error('Failed to load current user:', error);
      }
    };

    loadCurrentUser();
  }, []);

  // Load messages for the ticket
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Convert channel type to activeTab format expected by API
        const activeTab = activeChannel === 'brand_agent' ? 'brand' : 'creator';
        
        console.log('🔄 Loading messages for ticket:', ticketId, 'channel:', activeChannel, 'activeTab:', activeTab, 'currentUser:', currentUser);
        
        // Convert activeTab to the channel type expected by the API
        const channelType = activeTab === 'brand' ? 'brand_agent' : 'creator_agent';
        const response = await ticketsAPI.getMessages(ticketId, channelType);
        
        console.log('📥 Raw API response:', response);
        
        if (response.success && response.data?.messages) {
          console.log('📥 Received messages from API:', response.data.messages);
          
          // Transform API messages to local format
          const transformedMessages: Message[] = response.data.messages.map((msg: any) => ({
            id: msg.id || `temp-${Date.now()}-${Math.random()}`,
            text: msg.text || msg.message_text || '', // Backend returns 'text' field
            sender_role: msg.sender_role || msg.sender || 'unknown',
            sender_name: msg.sender_name || 'Unknown',
            timestamp: msg.timestamp || msg.created_at || new Date().toISOString(),
            created_at: msg.timestamp || msg.created_at || new Date().toISOString(),
            channel_type: msg.channel_type || 'brand_agent',
            sender: msg.sender
          }));
          
          console.log('🔄 Transformed messages:', transformedMessages);
          
          // Filter messages by active channel
          const channelMessages = transformedMessages.filter(msg => 
            msg.channel_type === activeChannel || !msg.channel_type
          );
          
          console.log('🔍 Filtered messages for channel:', activeChannel, 'count:', channelMessages.length);
          console.log('🔍 Channel messages:', channelMessages);
          
          setMessages(channelMessages);
          
          // Store the last message ID for polling
          if (channelMessages.length > 0) {
            lastMessageIdRef.current = channelMessages[channelMessages.length - 1].id;
          }
          
          // Start polling for new messages
          startPolling();
        } else {
          console.error('❌ API response not successful:', response);
          throw new Error(response.message || 'Failed to load messages');
        }
      } catch (error) {
        console.error('❌ Error loading messages:', error);
        setError(error instanceof Error ? error.message : 'Failed to load messages');
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    // Only load messages if we have a current user
    if (currentUser) {
      loadMessages();
    } else {
      console.log('⏳ Waiting for current user to load before loading messages...');
    }
  }, [ticketId, currentUser, activeChannel]);

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
    }, 3000);
    
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
      const userId = currentUser?.id?.toString();
      const userType = currentUser?.user_type;
      
      // Convert channel type to activeTab format expected by API
      const activeTab = activeChannel === 'brand_agent' ? 'brand' : 'creator';
      
      // Convert activeTab to the channel type expected by the API
      const channelType = activeTab === 'brand' ? 'brand_agent' : 'creator_agent';
      const response = await ticketsAPI.getMessages(ticketId, channelType);
      
      if (response.success && response.data?.messages) {
        const fetchedMessages: Message[] = response.data.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.text || msg.message_text || '', // Backend returns 'text' field
          sender_role: msg.sender_role || msg.sender || 'unknown',
          sender_name: msg.sender_name || 'Unknown',
          timestamp: msg.timestamp || msg.created_at || new Date().toISOString(),
          created_at: msg.timestamp || msg.created_at || new Date().toISOString(),
          channel_type: msg.channel_type || 'brand_agent',
          sender: msg.sender
        }));
        
        // Filter messages by active channel
        const channelMessages = fetchedMessages.filter(msg => 
          msg.channel_type === activeChannel || !msg.channel_type
        );
        
        // Check if there are new messages
        if (channelMessages.length > 0) {
          const lastFetchedMessageId = channelMessages[channelMessages.length - 1].id;
          
          if (lastMessageIdRef.current !== lastFetchedMessageId) {
            console.log('🆕 New messages detected, updating chat...');
            
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
                const fetchedMsgById = channelMessages.find(fm => fm.id === existingMsg.id);
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
                const fetchedMsgByContent = channelMessages.find(fm => 
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
              channelMessages.forEach(fetchedMsg => {
                const messageContentKey = `${fetchedMsg.text}-${fetchedMsg.sender_name}`;
                
                // Check if this message is already in the current state (by ID or content)
                const isDuplicateById = currentMessageIds.has(fetchedMsg.id);
                const isDuplicateByContent = currentMessageContent.has(messageContentKey);
                const isPending = pendingMessageIdsRef.current.has(fetchedMsg.id) || pendingMessageIdsRef.current.has(messageContentKey);
                
                if (!isDuplicateById && !isDuplicateByContent && !isPending) {
                  console.log('📝 Adding new message:', fetchedMsg.text);
                  newMessages.push({
                    ...fetchedMsg,
                    status: 'sent' as const
                  });
                } else {
                  console.log('🚫 Skipping duplicate message:', fetchedMsg.text, {
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
                console.log(`📝 Adding ${newMessages.length} new messages to chat`);
                lastMessageIdRef.current = lastFetchedMessageId;
                
                return [...updatedMessages, ...newMessages];
              } else {
                // If no new messages but we updated existing ones, return updated list
                console.log('🔄 Updated existing messages');
                lastMessageIdRef.current = lastFetchedMessageId;
                return updatedMessages;
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking for new messages:', error);
    }
  };

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately
    setIsSending(true);

    try {
      console.log('📤 Sending message to ticket:', ticketId, 'Message:', messageText, 'Channel:', activeChannel, 'CurrentUser:', currentUser);
      
      // Convert channel type to activeTab format expected by API
      const activeTab = activeChannel === 'brand_agent' ? 'brand' : 'creator';
      
      // Convert activeTab to the channel type expected by the API
      const channelType = activeTab === 'brand' ? 'brand_agent' : 'creator_agent';
      const response = await ticketsAPI.sendMessage(ticketId, messageText, channelType);
      
      console.log('📤 Send message response:', response);
      
      if (response.success && response.data?.message) {
        console.log('✅ Message sent successfully:', response.data.message);
        
        const newMsg: Message = {
          id: response.data.message.id || `temp-${Date.now()}`,
          text: messageText,
          sender_role: currentUser?.user_type === 'super_admin' ? 'super_admin' : 'agent',
          sender_name: currentUser?.name || 'Agent',
          timestamp: response.data.message.timestamp || new Date().toISOString(),
          created_at: response.data.message.created_at || new Date().toISOString(),
          status: 'sent' as const,
          channel_type: activeChannel,
          sender: {
            id: currentUser?.id || '',
            name: currentUser?.name || 'Agent',
            user_type: currentUser?.user_type || 'agent'
          }
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
        }, 5000);
        
        // Force refresh the chat to ensure we have the latest data
        setTimeout(() => {
          checkForNewMessages();
        }, 1000);
        
        toast.success('Message sent');
      } else {
        console.error('❌ Message send failed:', response);
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          ticketId,
          currentUser: currentUser?.id,
          userType: currentUser?.user_type,
          channel: activeChannel
        });
      }
      
      // Show more specific error message
      let errorMessage = 'Failed to send message';
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          errorMessage = 'Invalid request. Please check your message format.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.message.includes('403')) {
          errorMessage = 'Access denied. You may not have permission to send messages to this ticket.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Ticket not found. Please refresh the page.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      
      // Restore the message text if sending failed
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  // Handle channel switch
  const handleChannelSwitch = (channel: ChannelType) => {
    setActiveChannel(channel);
    // Clear current messages to reload for the new channel
    setMessages([]);
    lastMessageIdRef.current = null;
  };

  // Helper function to get message styling based on sender role
  const getMessageStyle = (message: Message) => {
    const isOwnMessage = message.sender_role === 'agent' || message.sender_role === 'super_admin';
    
    return {
      container: isOwnMessage ? 'flex justify-end mb-4' : 'flex justify-start mb-4',
      bubble: isOwnMessage 
        ? 'bg-blue-500 text-white rounded-lg rounded-br-none px-4 py-2 max-w-xs'
        : 'bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2 max-w-xs',
      text: isOwnMessage ? 'text-white' : 'text-gray-800',
      sender: isOwnMessage ? 'text-blue-100 text-xs mb-1' : 'text-gray-600 text-xs mb-1',
      time: isOwnMessage ? 'text-blue-100 text-xs mt-1' : 'text-gray-500 text-xs mt-1',
    };
  };

  // Helper function to get sender display name
  const getSenderDisplayName = (message: Message) => {
    if (message.sender_role === 'agent' || message.sender_role === 'super_admin') {
      return 'Agent';
    } else if (message.sender_role === 'brand') {
      return 'Brand';
    } else if (message.sender_role === 'creator') {
      return 'Creator';
    } else if (message.sender_role === 'system') {
      return 'System';
    } else {
      return message.sender_name || 'Unknown';
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '--:--';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
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
      return '--:--';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          <div>
            <h3 className="font-semibold text-gray-900">{ticketTitle || `Ticket #${ticketId}`}</h3>
            <p className="text-sm text-gray-500">Support Chat</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Channel Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => handleChannelSwitch('brand_agent')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeChannel === 'brand_agent'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building className="inline h-4 w-4 mr-2" />
          Brand Channel
        </button>
        <button
          onClick={() => handleChannelSwitch('creator_agent')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeChannel === 'creator_agent'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <User className="inline h-4 w-4 mr-2" />
          Creator Channel
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No messages in this channel yet.</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const messageStyle = getMessageStyle(message);
            const isSystem = message.sender_role === 'system';
            
            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {message.text}
                  </div>
                </div>
              );
            }

            return (
              <div key={message.id} className={messageStyle.container}>
                <div className={messageStyle.bubble}>
                  <div className={messageStyle.sender}>
                    {getSenderDisplayName(message)}
                  </div>
                  <div className={messageStyle.text}>
                    {message.text}
                  </div>
                  <div className={messageStyle.time}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Type your message to ${activeChannel === 'brand_agent' ? 'brand' : 'creator'}...`}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className={`px-4 py-2 rounded-lg font-medium ${
              !newMessage.trim() || isSending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 