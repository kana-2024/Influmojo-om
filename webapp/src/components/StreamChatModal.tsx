// TEMPORARILY COMMENTED OUT FOR EC2 BUILD - StreamChat functionality will be restored later
/*
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { streamChatService } from '@/services/streamChatService';
import { Message, Order } from '@/types';

interface StreamChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
}

export const StreamChatModal: React.FC<StreamChatModalProps> = ({
  isOpen,
  onClose,
  order
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && order) {
      initializeChat();
    }
  }, [isOpen, order]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      console.log('🚀 Initializing StreamChat...');

      // Get StreamChat token
      const { token, userId, apiKey } = await streamChatService.getToken();
      
      // Initialize StreamChat client
      await streamChatService.initialize(apiKey);
      
      // Connect user
      await streamChatService.connectUser(userId, token);
      
      // Create or join ticket channel
      const channelId = await streamChatService.createTicketChannel(order!.id, order!.package?.title || 'Support Request');
      setChannelId(channelId);
      
      // Get existing messages
      const existingMessages = await streamChatService.getMessages(channelId);
      setMessages(existingMessages.map(msg => ({
        id: msg.id,
        text: msg.text || '',
        user: {
          id: msg.user?.id || 'unknown',
          name: msg.user?.name || 'Unknown User',
          image: msg.user?.image
        },
        created_at: msg.created_at?.toISOString() || new Date().toISOString(),
        type: msg.type || 'text'
      })));

      setConnected(true);
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
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Connecting to chat...</div>
            </div>
          ) : !connected ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Failed to connect to chat</div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.user.id === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.user.id === 'current-user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">
                          {message.user.name}
                        </span>
                        <span className="text-xs opacity-75">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {connected && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
*/

// Placeholder component for now
export const StreamChatModal: React.FC<any> = () => {
  return null;
};
