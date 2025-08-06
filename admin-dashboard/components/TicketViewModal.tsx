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
  const queryClient = useQueryClient();

  // Fetch ticket messages
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['ticket-messages', ticket?.id],
    queryFn: () => ticketsAPI.getMessages(ticket?.id || ''),
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
    mutationFn: (message: string) => ticketsAPI.sendMessage(ticket?.id || '', message),
    onSuccess: () => {
      setNewMessage('');
      refetchMessages();
      toast.success('Message sent successfully');
    },
    onError: () => {
      toast.error('Failed to send message');
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

  const reassignTicketMutation = useMutation({
    mutationFn: (agentId: string) => ticketsAPI.reassign(ticket?.id || '', agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket reassigned successfully');
    },
    onError: () => {
      toast.error('Failed to reassign ticket');
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && ticket?.id) {
      sendMessageMutation.mutate(newMessage.trim());
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
    if (selectedAgent && ticket?.id) {
      reassignTicketMutation.mutate(selectedAgent);
      setSelectedAgent('');
    }
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
    const senderRole = message.sender_role || message.sender;
    
    switch (senderRole) {
      case 'brand':
      case 'brand_':
        return {
          container: 'justify-start',
          bubble: 'bg-blue-100 text-blue-900 border border-blue-200',
          sender: 'text-blue-700 font-medium'
        };
      case 'creator':
      case 'creator_':
        return {
          container: 'justify-start',
          bubble: 'bg-green-100 text-green-900 border border-green-200',
          sender: 'text-green-700 font-medium'
        };
      case 'agent':
      case 'agent_':
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
    const senderRole = message.sender_role || message.sender;
    
    switch (senderRole) {
      case 'brand':
      case 'brand_':
        return ticket?.order?.brand?.company_name || 'Brand';
      case 'creator':
      case 'creator_':
        return ticket?.order?.creator?.name || 'Creator';
      case 'agent':
      case 'agent_':
        return ticket?.agent?.name || 'Agent';
      case 'system':
        return 'System';
      default:
        return message.sender_name || 'Unknown';
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
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">${ticket.order?.amount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{ticket.order?.status || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Brand Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Brand Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="font-medium">{ticket.order?.brand?.company_name || 'N/A'}</div>
                  <div className="text-gray-600">{ticket.order?.brand?.user?.name || 'N/A'}</div>
                  <div className="text-gray-600">{ticket.order?.brand?.user?.email || 'N/A'}</div>
                  <div className="text-gray-600">{ticket.order?.brand?.phone || 'N/A'}</div>
                </div>
              </div>

              {/* Creator Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Creator Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="font-medium">{ticket.order?.creator?.name || 'N/A'}</div>
                  <div className="text-gray-600">{ticket.order?.creator?.user?.email || 'N/A'}</div>
                  <div className="text-gray-600">{ticket.order?.creator?.phone || 'N/A'}</div>
                  <div className="text-gray-600">{ticket.order?.creator?.bio || 'N/A'}</div>
                </div>
              </div>

              {/* Communication Options */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Communication Options</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCommunication('call', ticket.order?.brand?.phone || '')}
                    className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Brand
                  </button>
                  <button
                    onClick={() => handleCommunication('email', ticket.order?.brand?.user?.email || '')}
                    className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Brand
                  </button>
                  <button
                    onClick={() => handleCommunication('call', ticket.order?.creator?.phone || '')}
                    className="w-full flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Creator
                  </button>
                  <button
                    onClick={() => handleCommunication('email', ticket.order?.creator?.user?.email || '')}
                    className="w-full flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Creator
                  </button>
                  <button
                    onClick={() => handleCommunication('schedule', '')}
                    className="w-full flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Call
                  </button>
                </div>
              </div>

              {/* Ticket Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Ticket Actions</h3>
                <div className="space-y-3">
                  {/* Status Update */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Priority Update */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={ticket.priority}
                      onChange={(e) => handlePriorityUpdate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Reassign Agent */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reassign Agent</label>
                    <div className="flex space-x-2">
                      <select
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Select Agent</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleReassign}
                        disabled={!selectedAgent}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                      >
                        Reassign
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Unified Chat */}
          <div className="w-2/3 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {showStreamChat ? 'Live Chat' : 'Chat History'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {showStreamChat ? 'Real-time messaging with brand, creator, and agent' : `${messages.length} messages`}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowStreamChat(!showStreamChat)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      showStreamChat 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {showStreamChat ? 'Show History' : 'Live Chat'}
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Content */}
            {showStreamChat ? (
              <div className="flex-1">
                <TicketChat 
                  ticketId={ticket.id} 
                  ticketTitle={`Ticket #${ticket.id}`}
                />
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No messages yet
                    </div>
                  ) : (
                    messages.map((message) => {
                      const messageStyle = getMessageStyle(message);
                      const senderName = getSenderDisplayName(message);
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${messageStyle.container}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${messageStyle.bubble}`}
                          >
                            <div className={`text-sm mb-1 ${messageStyle.sender}`}>
                              {senderName}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                              {message.text}
                            </div>
                            <div className={`text-xs mt-1 ${
                              messageStyle.bubble.includes('text-white') ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {format(new Date(message.timestamp), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message as agent..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sendMessageMutation.isPending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 