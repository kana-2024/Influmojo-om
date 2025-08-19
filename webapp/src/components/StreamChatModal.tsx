'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  PaperAirplaneIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { streamChatService } from '@/services/streamChatService';
import { toast } from 'react-hot-toast';

interface StreamChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  ticketId?: string;
  channelId?: string;
}

interface Message {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  created_at: string;
  type: string;
}

export default function StreamChatModal({ 
  isOpen, 
  onClose, 
  order, 
  ticketId, 
  channelId 
}: StreamChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && order) {
      initializeChat();
    }
  }, [isOpen, order]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      console.log('🔧 Initializing StreamChat for order:', order.id);

      // Get StreamChat token
      const { token, userId, apiKey } = await streamChatService.getToken();
      
      // Initialize StreamChat client
      const client = await streamChatService.initialize(apiKey);
      
      // Connect user
      await streamChatService.connectUser(userId, token);
      
      // First, check if a ticket already exists for this order
      let existingTicketId = ticketId;
      let finalChannelId = channelId;
      
      if (!existingTicketId) {
        try {
          console.log('🔍 Checking for existing ticket for order:', order.id);
          const ticketResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'}/api/crm/tickets/order/${order.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (ticketResponse.ok) {
            const ticketData = await ticketResponse.json();
            if (ticketData.success && ticketData.data.ticket) {
              existingTicketId = ticketData.data.ticket.id;
              finalChannelId = ticketData.data.ticket.stream_channel_id;
              console.log('✅ Found existing ticket:', existingTicketId);
            }
          }
        } catch (error) {
          console.log('Could not fetch existing ticket:', error);
        }
      }
      
      // If no ticket exists, we need to create one first
      if (!existingTicketId) {
        console.log('🆕 No existing ticket found, creating new one...');
        
        // Create a new ticket through the order service
        // This will automatically create a StreamChat channel
        try {
          const createTicketResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'}/api/orders/${order.id}/create-ticket`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (createTicketResponse.ok) {
            const ticketData = await createTicketResponse.json();
            if (ticketData.success) {
              existingTicketId = ticketData.data.ticket.id;
              finalChannelId = ticketData.data.ticket.stream_channel_id;
              console.log('✅ Created new ticket:', existingTicketId);
            }
          }
        } catch (error) {
          console.error('❌ Failed to create ticket:', error);
          throw new Error('Failed to create support ticket. Please try again later.');
        }
      }
      
      // Now join the ticket channel
      if (!finalChannelId && existingTicketId) {
        finalChannelId = await streamChatService.joinTicketChannel(existingTicketId);
      }
      
      if (!finalChannelId) {
        throw new Error('Failed to get chat channel. Please try again.');
      }
      
      // Get the channel
      const channel = await streamChatService.getChannel(finalChannelId);
      
      // Set up message listener
      channel.on('message.new', (event: any) => {
        console.log('📨 New message received:', event);
        const newMsg: Message = {
          id: event.message.id,
          text: event.message.text,
          user: {
            id: event.message.user.id,
            name: event.message.user.name || event.message.user.id,
            image: event.message.user.image
          },
          created_at: event.message.created_at,
          type: event.message.type
        };
        
        setMessages(prev => [...prev, newMsg]);
      });

      // Set up typing indicator
      channel.on('typing.start', (event: any) => {
        if (event.user.id !== userId) {
          setIsTyping(true);
        }
      });

      channel.on('typing.stop', (event: any) => {
        if (event.user.id !== userId) {
          setIsTyping(false);
        }
      });

      // Get existing messages
      const existingMessages = await streamChatService.getMessages(finalChannelId, 50);
      const formattedMessages: Message[] = existingMessages.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        user: {
          id: msg.user.id,
          name: msg.user.name || msg.user.id,
          image: msg.user.image
        },
        created_at: msg.created_at,
        type: msg.type
      }));

      setMessages(formattedMessages);
      setConnected(true);

      // Get agent information
      if (existingTicketId) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'}/api/crm/tickets/${existingTicketId}/agent-status`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const agentData = await response.json();
            if (agentData.success) {
              setAgentInfo(agentData.data.agent);
            }
          }
        } catch (error) {
          console.log('Could not fetch agent info:', error);
        }
      }

      console.log('✅ StreamChat initialized successfully');
      toast.success('Connected to support chat!');

    } catch (error) {
      console.error('❌ Error initializing StreamChat:', error);
      toast.error(error.message || 'Failed to connect to support chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !connected) return;

    try {
      const messageText = newMessage.trim();
      setNewMessage('');

      // Optimistically add message to UI
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        text: messageText,
        user: {
          id: 'current-user',
          name: 'You',
          image: undefined
        },
        created_at: new Date().toISOString(),
        type: 'text'
      };

      setMessages(prev => [...prev, tempMessage]);

      // Send message via StreamChat
      if (channelId) {
        await streamChatService.sendMessage(channelId, messageText);
      }

      console.log('✅ Message sent successfully');

    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleClose = async () => {
    try {
      if (connected && channelId) {
        await streamChatService.leaveTicketChannel(channelId);
      }
      await streamChatService.disconnectUser();
    } catch (error) {
      console.error('Error disconnecting from chat:', error);
    }
    
    setMessages([]);
    setConnected(false);
    setNewMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Support Chat
              </h3>
              <p className="text-sm text-gray-500">
                Order: {order?.package?.title || 'Unknown Package'}
              </p>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 ${connected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Agent Info */}
        {agentInfo && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <span>👨‍💼 Agent:</span>
              <span className="font-medium">{agentInfo.name}</span>
              <span>•</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                agentInfo.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {agentInfo.status}
              </span>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">Connecting to support...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Support Chat</h3>
              <p className="text-gray-500">Start a conversation with our support team</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.user.id === 'current-user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.user.id === 'current-user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium opacity-75">
                      {message.user.name}
                    </span>
                    <span className="text-xs opacity-50">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-500">Agent is typing</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                disabled={!connected || loading}
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !connected || loading}
              className={`px-4 py-2 rounded-lg transition-colors ${
                newMessage.trim() && connected && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          
          {!connected && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>Not connected to chat. Please refresh and try again.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
