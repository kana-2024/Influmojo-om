'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import { ticketsAPI, agentsAPI } from '@/lib/api';
import { Ticket, Message, Agent } from '@/types';
import { format } from 'date-fns';
import { 
  ArrowLeft,
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar,
  Send,
  User,
  Package,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Archive,
  Shield,
  Users,
  Building,
  UserCheck,
  Star,
  MapPin,
  Globe,
  Briefcase
} from 'lucide-react';

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const [activeTab, setActiveTab] = useState<'brand' | 'creator'>('brand');
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const queryClient = useQueryClient();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const optimisticMessageIdsRef = useRef<Set<string>>(new Set());

  // Fetch ticket details
  const {
    data: ticketData,
    isLoading: ticketLoading,
    error: ticketError
  } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketsAPI.getById(ticketId),
    enabled: !!ticketId,
  });

  // Fetch ticket messages with real-time updates
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
    error: messagesError
  } = useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: () => ticketsAPI.getMessages(ticketId),
    enabled: !!ticketId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
    refetchIntervalInBackground: true,
  });

  // Monitor connection status based on messages error
  useEffect(() => {
    if (messagesError) {
      setIsConnected(false);
    } else {
      setIsConnected(true);
    }
  }, [messagesError]);

  // Fetch all agents for reassignment
  const {
    data: agentsData,
    isLoading: agentsLoading
  } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentsAPI.getAllAgents(),
  });

  const ticket = ticketData?.data?.ticket;
  const messages = messagesData?.data?.messages || [];
  const agents = agentsData?.data?.agents || [];

  // Combine server messages with optimistic messages
  const allMessages = [...messages, ...optimisticMessages].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.created_at).getTime();
    const dateB = new Date(b.timestamp || b.created_at).getTime();
    return dateA - dateB;
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // Check for new messages and auto-scroll
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.id !== lastMessageId) {
        setLastMessageId(latestMessage.id);
        // Only auto-scroll if user is near the bottom
        if (chatContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
          const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
          if (isNearBottom) {
            setTimeout(scrollToBottom, 100);
            setHasNewMessages(false);
          } else {
            // Show new message indicator if user is not at bottom
            setHasNewMessages(true);
          }
        }
      }
    }
  }, [messages, lastMessageId, scrollToBottom]);

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => ticketsAPI.sendMessage(ticketId, message),
    onSuccess: (response) => {
      setNewMessage('');
      // Remove optimistic message and let the server response take over
      setOptimisticMessages(prev => prev.filter(msg => !optimisticMessageIdsRef.current.has(msg.id)));
      optimisticMessageIdsRef.current.clear();
      refetchMessages();
      toast.success('Message sent successfully');
    },
    onError: (error) => {
      // Remove failed optimistic message
      setOptimisticMessages(prev => prev.filter(msg => !optimisticMessageIdsRef.current.has(msg.id)));
      optimisticMessageIdsRef.current.clear();
      toast.error('Failed to send message');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => ticketsAPI.updateStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: (priority: string) => ticketsAPI.updatePriority(ticketId, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket priority updated');
    },
    onError: () => {
      toast.error('Failed to update priority');
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: tempId,
      ticket_id: ticketId,
      sender_id: 'agent',
      sender: 'agent',
      sender_name: 'Agent',
      sender_role: 'agent',
      text: messageText,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    // Add optimistic message immediately
    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    optimisticMessageIdsRef.current.add(tempId);
    setNewMessage('');
    setIsSending(true);

    // Scroll to bottom for optimistic message
    setTimeout(scrollToBottom, 100);

    try {
      await sendMessageMutation.mutateAsync(messageText);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusUpdate = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  const handlePriorityUpdate = (priority: string) => {
    updatePriorityMutation.mutate(priority);
  };

  const getMessageStyle = (message: Message) => {
    const senderRole = message.sender_role || message.sender || 'unknown';
    
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

  const getSenderDisplayName = (message: Message) => {
    const senderRole = message.sender_role || message.sender || 'unknown';
    
    switch (senderRole) {
      case 'brand':
        return ticket?.order?.brand?.company_name || 'Brand';
      case 'creator':
        return ticket?.order?.creator?.user?.name || 'Creator';
      case 'agent':
        return 'Agent';
      case 'system':
        return 'System';
      default:
        return message.sender_name || 'Unknown';
    }
  };

  // Helper function to filter messages based on active tab
  const getFilteredMessages = () => {
    return allMessages.filter((message) => {
      const senderRole = message.sender_role || message.sender || 'unknown';
      if (activeTab === 'brand') {
        // Show brand messages, agent messages, and system messages
        return senderRole === 'brand' || senderRole === 'agent' || senderRole === 'system';
      } else if (activeTab === 'creator') {
        // Show creator messages, agent messages, and system messages
        return senderRole === 'creator' || senderRole === 'agent' || senderRole === 'system';
      }
      return true;
    });
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  if (ticketLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (ticketError || !ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-500">Ticket not found</p>
          <button
            onClick={() => router.back()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const brand = ticket.order?.brand;
  const creator = ticket.order?.creator;
  const packageInfo = ticket.order?.package;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Ticket #{ticket.id}
                </h1>
                <p className="text-sm text-gray-500">
                  {packageInfo?.title || 'Package'} - {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            
            {/* Status and Priority */}
            <div className="flex items-center space-x-4">
              <select
                value={ticket.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              
              <select
                value={ticket.priority || 'medium'}
                onChange={(e) => handlePriorityUpdate(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Order Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">#{ticket.order?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-medium">{packageInfo?.title || 'N/A'}</span>
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

            {/* Brand Profile */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-4 w-4 mr-2 text-blue-600" />
                Brand Profile
              </h3>
              {brand ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{brand.company_name}</h4>
                      <p className="text-sm text-gray-500">{brand.user?.name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span>{brand.user?.email || 'No email'}</span>
                    </div>
                    {brand.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{brand.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No brand information available</p>
              )}
            </div>

            {/* Creator Profile */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                Creator Profile
              </h3>
              {creator ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{creator.user?.name}</h4>
                      <p className="text-sm text-gray-500">Content Creator</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span>{creator.user?.email || 'No email'}</span>
                    </div>
                    {creator.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{creator.phone}</span>
                      </div>
                    )}
                    {creator.bio && (
                      <div className="pt-2 border-t">
                        <p className="text-gray-600 text-xs">{creator.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No creator information available</p>
              )}
            </div>
          </div>

          {/* Right Side - Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Chat Header with Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex items-center justify-between p-4">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setActiveTab('brand')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'brand'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>{brand?.company_name || 'Brand'}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('creator')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'creator'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4" />
                        <span>{creator?.user?.name || 'Creator'}</span>
                      </div>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MessageSquare className="h-4 w-4" />
                    <span>
                      {getFilteredMessages().length} message{getFilteredMessages().length !== 1 ? 's' : ''}
                    </span>
                    {/* Real-time indicator */}
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                      <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {isConnected ? 'Live' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                className="h-96 overflow-y-auto p-4 space-y-4 scroll-smooth relative"
              >
                {messagesLoading && allMessages.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : getFilteredMessages().length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No messages for {activeTab === 'brand' ? brand?.company_name || 'Brand' : creator?.user?.name || 'Creator'} yet</p>
                    <p className="text-sm text-gray-400">Start the conversation by sending a message</p>
                  </div>
                ) : (
                  getFilteredMessages()
                    .map((message) => {
                      const style = getMessageStyle(message);
                      const senderName = getSenderDisplayName(message);
                      const isOptimistic = message.id.startsWith('temp-');
                      
                      return (
                        <div key={message.id} className={`flex ${style.container} ${isOptimistic ? 'opacity-75' : ''}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${style.bubble} ${isOptimistic ? 'border-dashed' : ''}`}>
                            <div className="flex items-center space-x-2 mb-1">
                              {style.icon}
                              <span className={`text-xs ${style.sender}`}>
                                {senderName}
                                {isOptimistic && <span className="ml-1 text-gray-400">(sending...)</span>}
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
                
                {/* New Message Indicator */}
                {hasNewMessages && (
                  <div className="absolute bottom-4 right-4">
                    <button
                      onClick={() => {
                        scrollToBottom();
                        setHasNewMessages(false);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">New messages</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Type your message to ${activeTab === 'brand' ? brand?.company_name || 'Brand' : creator?.user?.name || 'Creator'}...`}
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
          </div>
        </div>
      </div>
    </div>
  );
} 