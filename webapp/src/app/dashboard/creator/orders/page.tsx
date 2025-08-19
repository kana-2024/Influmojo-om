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
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ordersAPI } from '@/services/apiService';
import { toast } from 'react-hot-toast';
import CreatorOrderDetailsModal from '@/components/modals/CreatorOrderDetailsModal';

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

export default function CreatorOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('New');
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);

  const tabList = [
    { key: 'New', label: 'New' },
    { key: 'Ongoing', label: 'Ongoing' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Cancelled', label: 'Cancelled' },
  ];

  const handleOrderAction = async (action: 'accept' | 'reject') => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      
      // TODO: Implement order action API calls
      console.log(`🔄 Creator ${action}ing order ${selectedOrder.id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: action === 'accept' ? 'accepted' : 'rejected' }
          : order
      ));
      
      toast.success(`Order ${action === 'accept' ? 'accepted' : 'rejected'} successfully`);
      setShowOrderDetailsModal(false);
    } catch (error) {
      console.error('Order action error:', error);
      toast.error(`Failed to ${action} order`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDeliverables = async (files: File[]) => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      
      // TODO: Implement file upload API calls
      console.log(`🔄 Creator uploading deliverables for order ${selectedOrder.id}`, files);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: 'deliverables_submitted', deliverables_submitted_at: new Date().toISOString() }
          : order
      ));
      
      toast.success('Deliverables uploaded successfully!');
      setShowOrderDetailsModal(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload deliverables');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching creator orders...');
      console.log('🔍 User type from localStorage:', localStorage.getItem('userType'));
      console.log('🔍 User ID from localStorage:', localStorage.getItem('userId'));
      
      const response = await ordersAPI.getCreatorOrders();
      console.log('🔍 Raw API response:', response);
      
      if (response.success && response.orders) {
        console.log('✅ Orders fetched successfully:', response.orders);
        console.log('🔍 Orders count:', response.orders.length);
        console.log('🔍 Orders data:', response.orders);
        
        // Filter orders to only show those where the current user is the creator
        const userType = localStorage.getItem('userType');
        const userId = localStorage.getItem('userId');
        
        if (userType === 'creator' && userId) {
          // Filter orders where creator.user.id matches current user ID
          const filteredOrders = response.orders.filter((order: any) => {
            const orderCreatorId = order.creator?.user?.id || order.creator?.id;
            console.log(`🔍 Comparing order creator ID: ${orderCreatorId} with current user ID: ${userId}`);
            return orderCreatorId === userId;
          });
          
          console.log('🔍 Filtered orders for current creator:', filteredOrders);
          setOrders(filteredOrders);
        } else {
          console.log('⚠️ User type or ID not found, showing all orders');
          setOrders(response.orders);
        }
      } else {
        console.error('❌ Failed to fetch orders:', response.error);
        console.error('❌ Response details:', response);
        setError(response.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('❌ Error loading orders:', err);
      console.error('❌ Error details:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add auto-refresh functionality
  useEffect(() => {
    // Initial fetch
    fetchOrders();
    
    // Set up auto-refresh every 30 seconds to check for new orders
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing orders...');
      fetchOrders();
    }, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Add notification sound and visual indicator for new orders
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  useEffect(() => {
    if (orders.length > lastOrderCount && lastOrderCount > 0) {
      const newOrders = orders.length - lastOrderCount;
      setNewOrderCount(newOrders);
      
      // Show notification toast
      toast.success(`🎉 You have ${newOrders} new order${newOrders > 1 ? 's' : ''}!`);
      
      // Play notification sound if available
      if (typeof window !== 'undefined' && 'Audio' in window) {
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
          audio.play().catch(() => {}); // Ignore errors
        } catch (e) {
          console.log('Audio notification not available');
        }
      }
      
      // Reset after 5 seconds
      setTimeout(() => setNewOrderCount(0), 5000);
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount]);

  const filterOrdersByTab = (orders: Order[], tab: string): Order[] => {
    switch (tab) {
      case 'New':
        return orders.filter(order => 
          order.status.toLowerCase() === 'pending'
        );
      case 'Ongoing':
        return orders.filter(order => 
          order.status.toLowerCase() === 'accepted' || 
          order.status.toLowerCase() === 'in_progress' ||
          order.status.toLowerCase() === 'review'
        );
      case 'Completed':
        return orders.filter(order => 
          order.status.toLowerCase() === 'completed'
        );
      case 'Cancelled':
        return orders.filter(order => 
          order.status.toLowerCase() === 'cancelled' ||
          order.status.toLowerCase() === 'rejected'
        );
      default:
        return orders;
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to accept this order?')) {
      try {
        const response = await ordersAPI.acceptOrder(orderId);
        if (response.success) {
          toast.success('Order accepted successfully! It has been moved to Ongoing orders.');
          fetchOrders(); // Refresh orders
          setActiveTab('Ongoing');
        } else {
          toast.error(response.message || 'Failed to accept order');
        }
      } catch (error) {
        console.error('Error accepting order:', error);
        toast.error('Failed to accept order');
      }
    }
  };

  const handleRejectOrder = async (orderId: string, rejectionMessage?: string) => {
    const message = rejectionMessage || prompt('Please provide a reason for rejection:');
    if (message) {
      try {
        const response = await ordersAPI.rejectOrder(orderId, message);
        if (response.success) {
          toast.success('Order rejected successfully!');
          fetchOrders(); // Refresh orders
        } else {
          toast.error(response.message || 'Failed to reject order');
        }
      } catch (error) {
        console.error('Error rejecting order:', error);
        toast.error('Failed to reject order');
      }
    }
  };

  const handleChatWithAgent = (order: Order) => {
    if (order.ticket_id) {
      setSelectedOrder(order);
      setShowChatModal(true);
    } else {
      toast.error('Support ticket not found for this order');
    }
  };

  const handleViewOrderDetails = (order: Order) => {
    // Navigate to order details page
    router.push(`/dashboard/creator/orders/${order.id}`);
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
      case 'pending': return 'Pending Response';
      case 'accepted': return 'Accepted';
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

  const renderOrderCard = (order: Order) => {
    const isCreator = true; // This is the creator orders page
    const otherParty = order.brand;
    const otherPartyName = otherParty?.company_name || 'Unknown Brand';

    return (
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
            <p className="text-sm text-gray-500">Brand</p>
            <p className="font-medium text-gray-900">{otherPartyName}</p>
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

          {/* Accept/Reject buttons for pending orders */}
          {order.status.toLowerCase() === 'pending' && (
            <>
              <button
                onClick={() => handleAcceptOrder(order.id)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                <CheckIcon className="w-4 h-4" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => handleRejectOrder(order.id)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </>
          )}

          {/* Contact Support button for ongoing orders */}
          {(order.status.toLowerCase() === 'accepted' || 
            order.status.toLowerCase() === 'in_progress' || 
            order.status.toLowerCase() === 'review') && (
            <button
              onClick={() => handleChatWithAgent(order)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>Contact Support</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const filteredOrders = filterOrdersByTab(orders, activeTab);

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
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
                {/* Notification indicator */}
                {newOrderCount > 0 && (
                  <div className="ml-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {newOrderCount} New
                  </div>
                )}
              </div>
            </div>
            {/* Refresh button */}
            <button
              onClick={fetchOrders}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh orders"
            >
              <div className="w-5 h-5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Banner for New Orders */}
      {newOrderCount > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BellIcon className="w-5 h-5 text-orange-600" />
                <span className="text-orange-800 font-medium">
                  🎉 You have {newOrderCount} new order{newOrderCount > 1 ? 's' : ''}!
                </span>
              </div>
              <button
                onClick={() => setNewOrderCount(0)}
                className="text-orange-600 hover:text-orange-800"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabList.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Count */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredOrders.length} Order{filteredOrders.length !== 1 ? 's' : ''} Found
          </h2>
          <div className="flex items-center space-x-2">
            {/* Tab-specific order counts */}
            <div className="flex space-x-1 text-sm text-gray-500">
              {tabList.map((tab) => {
                const tabOrderCount = filterOrdersByTab(orders, tab.key).length;
                return (
                  <span key={tab.key} className={`px-2 py-1 rounded ${
                    activeTab === tab.key ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.label}: {tabOrderCount}
                  </span>
                );
              })}
            </div>
            {/* Manual refresh button */}
            <button
              onClick={fetchOrders}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh orders"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {/* Test notification button (for debugging) */}
            <button
              onClick={() => {
                setNewOrderCount(1);
                toast.success('🎉 Test notification: You have 1 new order!');
              }}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Test notification (debug)"
            >
              Test Notif
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map(renderOrderCard)}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-4">
              {activeTab !== 'New'
                ? `No orders with status "${activeTab}"`
                : 'You haven\'t received any orders yet'
              }
            </p>
            {activeTab !== 'New' && (
              <button
                onClick={() => setActiveTab('New')}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                View New Orders
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chat Modal Placeholder */}
      {showChatModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Support
            </h3>
            <p className="text-gray-600 mb-4">
              Chat with our support agent for order: {selectedOrder.package.title}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowChatModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowChatModal(false);
                  // TODO: Navigate to chat screen
                  toast.success('Opening support chat...');
                }}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Open Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creator Order Details Modal */}
      <CreatorOrderDetailsModal
        isOpen={showOrderDetailsModal}
        onClose={() => setShowOrderDetailsModal(false)}
        order={selectedOrder}
        onUploadDeliverables={handleUploadDeliverables}
        onAcceptOrder={handleOrderAction ? () => handleOrderAction('accept') : undefined}
        onRejectOrder={handleOrderAction ? () => handleOrderAction('reject') : undefined}
      />
    </div>
  );
}
