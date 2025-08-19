'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ordersAPI, ticketAPI } from '@/services/apiService';
import { streamChatService } from '@/services/streamChatService';
import { toast } from 'react-hot-toast';
import StreamChatModal from '@/components/StreamChatModal';
import OrderDetailsModal from '@/components/modals/OrderDetailsModal';

interface Order {
  id: string;
  package: {
    id: string;
    title: string;
    description: string;
    price: number;
    deliverables: any[];
  };
  brand?: {
    company_name: string;
    location_city?: string;
    location_state?: string;
  };
  creator?: {
    user: {
      name: string;
      email: string;
    };
  };
  created_at: string;
  status: string;
  total_amount: number;
  quantity: number;
  rejection_message?: string;
  // Chat integration fields
  chat_enabled?: boolean;
  chat_session_id?: string;
  // Ticket information
  ticket_id?: string;
}

interface OrderGroup {
  orderId: string;
  orders: Order[];
  totalAmount: number;
  status: string;
  createdAt: string;
  creatorName: string;
}

export default function BrandOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showChatModal, setShowChatModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching brand orders...');
      const response = await ordersAPI.getBrandOrders();
      
      if (response.success && response.orders) {
        console.log('✅ Orders fetched successfully:', response.orders);
        
        // Use orders directly like mobile
        setOrders(response.orders);
      } else {
        console.error('❌ Failed to fetch orders:', response.error);
        setError(response.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('❌ Error loading orders:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return '#F59E0B'; // Amber
      case 'accepted': return '#10B981'; // Green
      case 'in_progress': return '#3B82F6'; // Blue
      case 'review': return '#8B5CF6'; // Purple
      case 'completed': return '#059669'; // Green
      case 'cancelled': return '#EF4444'; // Red
      case 'rejected': return '#DC2626'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  const getStatusDisplayText = (status: string, rejectionMessage?: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Pending Creator Response';
      case 'accepted': return 'Accepted by Creator';
      case 'in_progress': return 'In Progress';
      case 'review': return 'Under Review';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'rejected': 
        return rejectionMessage ? `Rejected: ${rejectionMessage}` : 'Rejected';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString()}`;
  };

  const handleChatWithCreator = (order: Order) => {
    if (order.chat_enabled && order.chat_session_id) {
      // Navigate to chat screen or open chat modal
      toast.success('Opening chat with creator...');
      // TODO: Implement chat navigation
    } else {
      toast.error('Chat not available for this order');
    }
  };

  const handleOrderAction = async (action: 'accept' | 'reject' | 'revision', revisionRequirements?: string) => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      
      // TODO: Implement order action API calls
      console.log(`🔄 Brand ${action}ing order ${selectedOrder.id}`, { revisionRequirements });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: action === 'accept' ? 'completed' : action === 'reject' ? 'rejected' : 'revision' }
          : order
      ));
      
      toast.success(`Order ${action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'revision requested'} successfully`);
    } catch (error) {
      console.error('Order action error:', error);
      toast.error(`Failed to ${action} order`);
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithAgent = async (order: Order) => {
    try {
      setLoading(true);
      
      console.log(`🆘 User requesting support for order ${order.id}`);

      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to contact support.');
        return;
      }

      // Check if ticket exists for this order
      let ticket;
      try {
        const response = await ticketAPI.getTicketByOrderId(order.id);
        if (response.success) {
          ticket = response.data.ticket;
          console.log('✅ Found existing ticket:', ticket);
        } else {
          console.log('❌ No existing ticket found, will create one');
        }
      } catch (error) {
        console.log('❌ Error fetching ticket, will create one:', error);
      }

      // If no ticket exists, the backend will create one automatically when we join the channel
      if (!ticket) {
        toast.loading('Setting up support chat...');
      }

      // Initialize StreamChat
      try {
        // Get StreamChat token
        const { token: streamToken, userId, apiKey } = await streamChatService.getToken();
        
        // Initialize StreamChat client
        const client = await streamChatService.initialize(apiKey);
        
        // Connect user
        await streamChatService.connectUser(userId, streamToken);
        
        // Get or create ticket channel
        let channelId;
        if (ticket) {
          // Join existing ticket channel
          channelId = await streamChatService.joinTicketChannel(ticket.id);
        } else {
          // Create new ticket and join channel
          // The backend will handle ticket creation automatically
          channelId = await streamChatService.joinTicketChannel(order.id);
        }
        
        // Get the channel
        const channel = await streamChatService.getChannel(channelId);
        
        // Store channel info for chat modal
        order.ticket_id = ticket?.id || order.id; // Use order ID as fallback
        order.chat_session_id = channelId;
        
        setSelectedOrder(order);
        setShowChatModal(true);
        
        toast.dismiss();
        toast.success('Support chat connected successfully!');
        
      } catch (streamError) {
        console.error('❌ StreamChat error:', streamError);
        toast.error('Failed to connect to support chat. Please try again.');
      }
      
    } catch (error) {
      console.error('❌ Error contacting support:', error);
      toast.error('Failed to connect to support. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrderDetails = (order: Order) => {
    // Show order details in a modal instead of navigating
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === selectedStatus.toLowerCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircleIcon className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchOrders}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {['all', 'pending', 'accepted', 'in_progress', 'review', 'completed', 'cancelled', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedStatus === status
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Count */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredOrders.length} Order{filteredOrders.length !== 1 ? 's' : ''} Found
          </h2>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.package.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Order #{order.id.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      {formatPrice(order.total_amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Qty: {order.quantity}
                    </p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Creator</p>
                    <p className="font-medium text-gray-900">
                      {order.creator?.user?.name || 'Unknown Creator'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      />
                      <span className="font-medium text-gray-900">
                        {getStatusDisplayText(order.status, order.rejection_message)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rejection Message */}
                {order.rejection_message && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start space-x-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Order Rejected</p>
                        <p className="text-sm text-red-700">{order.rejection_message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewOrderDetails(order)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>View Details</span>
                  </button>

                  {/* Chat with Creator (if enabled) */}
                  {order.chat_enabled && (
                    <button
                      onClick={() => handleChatWithCreator(order)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      <span>Chat with Creator</span>
                    </button>
                  )}

                  {/* Chat with Agent (always available) */}
                  <button
                    onClick={() => handleChatWithAgent(order)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>Contact Support</span>
                  </button>

                  {/* Browse Creators for rejected orders */}
                  {order.status.toLowerCase() === 'rejected' && (
                    <button
                      onClick={() => router.push('/dashboard/brand')}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Browse Creators</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-4">
              {selectedStatus !== 'all'
                ? `No orders with status "${selectedStatus}"`
                : 'You haven\'t placed any orders yet'
              }
            </p>
            {selectedStatus !== 'all' && (
              <button
                onClick={() => setSelectedStatus('all')}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                View All Orders
              </button>
            )}
          </div>
        )}
      </div>

      {/* StreamChat Modal */}
      {showChatModal && selectedOrder && (
        <StreamChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          order={selectedOrder}
          ticketId={selectedOrder.ticket_id}
          channelId={selectedOrder.chat_session_id}
        />
      )}

      {/* Order Details Modal */}
      {showOrderDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Order Details - {selectedOrder.package.title}
              </h3>
              <button
                onClick={() => setShowOrderDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <span className="ml-2 font-medium">{selectedOrder.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium capitalize">{selectedOrder.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Quantity:</span>
                    <span className="ml-2 font-medium">{selectedOrder.quantity}</span>
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Package Details</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Title:</span>
                    <span className="ml-2 font-medium">{selectedOrder.package.title}</span>
                  </div>
                  {selectedOrder.package.description && (
                    <div>
                      <span className="text-gray-600">Description:</span>
                      <span className="ml-2 font-medium">{selectedOrder.package.description}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <span className="ml-2 font-medium text-orange-600">₹{selectedOrder.package.price}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="ml-2 font-medium text-orange-600">₹{selectedOrder.total_amount}</span>
                  </div>
                </div>
              </div>

              {/* Creator Information */}
              {selectedOrder.creator && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Creator Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{selectedOrder.creator.user.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{selectedOrder.creator.user.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Message */}
              {selectedOrder.rejection_message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Rejection Reason</h4>
                  <p className="text-red-700">{selectedOrder.rejection_message}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowOrderDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetailsModal}
        onClose={() => setShowOrderDetailsModal(false)}
        order={selectedOrder}
        onOrderAction={handleOrderAction}
      />
    </div>
  );
}

