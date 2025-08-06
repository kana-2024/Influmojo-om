'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Send, MessageSquare, Users, Clock, X, Shield, User, Building, UserCheck } from 'lucide-react';
import { ticketsAPI } from '@/lib/api';

interface TicketChatProps {
  ticketId: string;
  ticketTitle?: string;
  onClose?: () => void;
}

interface Message {
  id: string;
  text: string;
  sender_role?: 'brand' | 'creator' | 'agent' | 'system';
  sender_name: string;
  timestamp: string;
  created_at: string;
}

export default function TicketChat({ ticketId, ticketTitle, onClose }: TicketChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Load messages for the ticket
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await ticketsAPI.getMessages(ticketId);
        
        if (response.success) {
          setMessages(response.data.messages || []);
        } else {
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

    loadMessages();
  }, [ticketId]);

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      
      const response = await ticketsAPI.sendMessage(ticketId, newMessage.trim());
      
      if (response.success) {
        const newMsg: Message = {
          id: response.data.message.id,
          text: newMessage.trim(),
          sender_role: 'agent',
          sender_name: 'You (Agent)',
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        toast.success('Message sent');
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Helper function to get message styling based on sender role
  const getMessageStyle = (message: Message) => {
    const senderRole = message.sender_role || 'unknown';
    
    switch (senderRole) {
      case 'brand':
        return {
          container: 'justify-start',
          bubble: 'bg-blue-100 text-blue-900 border border-blue-200',
          sender: 'text-blue-700 font-medium',
          icon: <Building className="h-3 w-3 text-blue-500" />
        };
      case 'creator':
        return {
          container: 'justify-start',
          bubble: 'bg-green-100 text-green-900 border border-green-200',
          sender: 'text-green-700 font-medium',
          icon: <UserCheck className="h-3 w-3 text-green-500" />
        };
      case 'agent':
        return {
          container: 'justify-end',
          bubble: 'bg-gray-800 text-white',
          sender: 'text-gray-300 font-medium',
          icon: <Shield className="h-3 w-3 text-gray-400" />
        };
      case 'system':
        return {
          container: 'justify-center',
          bubble: 'bg-yellow-50 text-yellow-800 border border-yellow-200 text-center',
          sender: 'text-yellow-600 font-medium',
          icon: <MessageSquare className="h-3 w-3 text-yellow-500" />
        };
      default:
        return {
          container: 'justify-start',
          bubble: 'bg-gray-200 text-gray-900',
          sender: 'text-gray-600 font-medium',
          icon: <User className="h-3 w-3 text-gray-400" />
        };
    }
  };

  // Helper function to get sender display name
  const getSenderDisplayName = (message: Message) => {
    const senderRole = message.sender_role || 'unknown';
    
    switch (senderRole) {
      case 'brand':
        return 'Brand';
      case 'creator':
        return 'Creator';
      case 'agent':
        return 'Agent';
      case 'system':
        return 'System';
      default:
        return message.sender_name || 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <MessageSquare className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">
              {ticketTitle || `Ticket #${ticketId}`}
            </h3>
            <p className="text-sm text-gray-500">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400">Start the conversation by sending a message</p>
          </div>
        ) : (
          messages.map((message) => {
            const style = getMessageStyle(message);
            const isOwnMessage = message.sender_role === 'agent';
            
            return (
              <div key={message.id} className={`flex ${style.container}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${style.bubble}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    {style.icon}
                    <span className={`text-xs ${style.sender}`}>
                      {getSenderDisplayName(message)}
                    </span>
                  </div>
                  <p className="text-sm">{message.text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp || message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 