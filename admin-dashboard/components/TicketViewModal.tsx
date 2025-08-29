'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ticketsAPI, agentsAPI } from '@/lib/api';
import { Ticket, Message, Agent } from '@/types';
import { format } from 'date-fns';
import { 
  X, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar,
  Send,
  Paperclip,
  User,
  Package,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Archive,
  Shield,
  Users
} from 'lucide-react';
import TicketChat from './TicketChat';

interface TicketViewModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketViewModal({ ticket, isOpen, onClose }: TicketViewModalProps) {
  const [newMessage, setNewMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [showStreamChat, setShowStreamChat] = useState(true); // Default to live chat
  const [activeTab, setActiveTab] = useState<'brand' | 'creator'>('brand'); // New: Tab for separate channels
  const queryClient = useQueryClient();

  // Fetch ticket messages for the active tab
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['ticket-messages', ticket?.id, activeTab],
    queryFn: () => ticketsAPI.getMessages(ticket?.id || '', activeTab === 'brand' ? 'brand_agent' : 'creator_agent'),
    enabled: !!ticket?.id,
  });

  // Fetch all agents for reassignment
  const {
    data: agentsData,
    isLoading: agentsLoading
  } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentsAPI.getAllAgents(),
  });

  const messages = messagesData?.data?.messages || [];
  const agents = agentsData?.data?.agents || [];

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => {
      console.log('🔧 sendMessageMutation.mutationFn called with:', {
        ticketId: ticket?.id,
        message,
        activeTab
      });
      return ticketsAPI.sendMessage(ticket?.id || '', message, activeTab === 'brand' ? 'brand_agent' : 'creator_agent');
    },
    onSuccess: (data) => {
      console.log('✅ Message sent successfully:', data);
      setNewMessage('');
      refetchMessages();
      toast.success('Message sent successfully');
    },
    onError: (error) => {
      console.error('❌ Failed to send message:', error);
      toast.error(`Failed to send message: ${error.message || 'Unknown error'}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => ticketsAPI.updateStatus(ticket?.id || '', status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: (priority: string) => ticketsAPI.updatePriority(ticket?.id || '', priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket priority updated');
    },
    onError: () => {
      toast.error('Failed to update priority');
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 handleSendMessage called:', {
      newMessage,
      newMessageTrimmed: newMessage.trim(),
      newMessageLength: newMessage.length,
      ticketId: ticket?.id,
      activeTab
    });
    
    if (newMessage.trim() && ticket?.id) {
      console.log('📤 Calling sendMessageMutation with:', newMessage.trim());
      sendMessageMutation.mutate(newMessage.trim());
    } else {
      console.log('❌ Message validation failed in handleSendMessage:', {
        hasNewMessage: !!newMessage,
        newMessageTrimmed: newMessage.trim(),
        newMessageTrimmedLength: newMessage.trim().length,
        hasTicketId: !!ticket?.id
      });
    }
  };

  const handleStatusUpdate = (status: string) => {
    if (ticket?.id) {
      updateStatusMutation.mutate(status);
    }
  };

  const handlePriorityUpdate = (priority: string) => {
    if (ticket?.id) {
      updatePriorityMutation.mutate(priority);
    }
  };

  const handleReassign = () => {
    // Reassign functionality removed - not implemented in API
    toast.success('Reassign functionality not implemented');
  };

  const handleCommunication = (type: string, contact: string) => {
    switch (type) {
      case 'call':
        window.open(`tel:${contact}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:${contact}`, '_blank');
        break;
      case 'schedule':
        // Open Google Calendar with pre-filled details
        const event = encodeURIComponent(`Call with ${ticket?.order?.brand?.company_name || 'Brand'} - Ticket #${ticket?.id}`);
        const details = encodeURIComponent(`Support call for order #${ticket?.order?.id}`);
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${event}&details=${details}`, '_blank');
        break;
    }
  };

  // Helper function to get message styling based on sender role
  const getMessageStyle = (message: Message) => {
    const senderRole = message.sender_role || message.sender?.user_type;
    
    switch (senderRole) {
      case 'brand':
        return {
          container: 'justify-start',
          bubble: 'bg-blue-100 text-blue-900 border border-blue-200',
          sender: 'text-blue-700 font-medium'
        };
      case 'creator':
        return {
          container: 'justify-start',
          bubble: 'bg-green-100 text-green-900 border border-green-200',
          sender: 'text-green-700 font-medium'
        };
      case 'agent':
        return {
          container: 'justify-end',
          bubble: 'bg-gray-800 text-white',
          sender: 'text-gray-300 font-medium'
        };
      case 'system':
        return {
          container: 'justify-center',
          bubble: 'bg-yellow-50 text-yellow-800 border border-yellow-200 text-center',
          sender: 'text-yellow-600 font-medium'
        };
      default:
        return {
          container: 'justify-start',
          bubble: 'bg-gray-200 text-gray-900',
          sender: 'text-gray-600 font-medium'
        };
    }
  };

  // Helper function to get sender display name
  const getSenderDisplayName = (message: Message) => {
    const senderRole = message.sender_role || message.sender?.user_type;
    
    switch (senderRole) {
      case 'brand':
        return ticket?.order?.brand?.company_name || 'Brand';
      case 'creator':
        return ticket?.order?.creator?.user?.name || 'Creator';
      case 'agent':
        return ticket?.agent?.name || 'Agent';
      case 'system':
        return 'System';
      default:
        return message.sender_name || message.sender?.name || 'Unknown';
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return 'N/A';
      }
      
      // Check if the timestamp is very recent (within 1 minute)
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) { // Less than 1 hour
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
      return 'N/A';
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Ticket #{ticket.id} - Unified Agent View
            </h2>
            <p className="text-sm text-gray-500">
              Created {ticket.created_at ? format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Ticket Details */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Order Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{ticket.order?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Package:</span>
                    <span className="font-medium">{ticket.order?.package?.title || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                      ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Brand & Creator Information */}
              <div className="space-y-4">
                {/* Brand Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Brand
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{ticket.order?.brand?.company_name || 'N/A'}</div>
                    <div className="text-blue-600">{ticket.order?.brand?.user?.email || 'N/A'}</div>
                  </div>
                </div>

                {/* Creator Information */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Creator
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{ticket.order?.creator?.user?.name || 'N/A'}</div>
                    <div className="text-green-600">{ticket.order?.creator?.user?.email || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Agent Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Assigned Agent
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{ticket.agent?.name || 'N/A'}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.agent?.is_online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.agent?.is_online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{ticket.agent?.email || 'N/A'}</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStatusUpdate('in_progress')}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    Start Working
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('resolved')}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header with Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between p-4">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('brand')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'brand'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Brand Support
                  </button>
                  <button
                    onClick={() => setActiveTab('creator')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'creator'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Creator Support
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {activeTab === 'brand' ? 'Brand-Agent Channel' : 'Creator-Agent Channel'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation with the {activeTab}</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const style = getMessageStyle(message);
                  const senderName = getSenderDisplayName(message);
                  
                  return (
                    <div key={message.id} className={`flex ${style.container}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${style.bubble}`}>
                        <div className={`text-xs ${style.sender} mb-1`}>
                          {senderName}
                        </div>
                        <div className="text-sm">{message.text}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {message.timestamp ? formatTimestamp(message.timestamp) : 'N/A'}
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
                  placeholder={`Send a message to ${activeTab}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 