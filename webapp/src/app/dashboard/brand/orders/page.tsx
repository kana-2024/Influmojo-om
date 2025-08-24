'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HomeIcon,
  ListBulletIcon,
  CubeIcon,
  BriefcaseIcon,
  WalletIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  StarIcon,
  EnvelopeIcon,
  PencilIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';
import BrandOrderDetailsModal from '@/components/modals/BrandOrderDetailsModal';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
}

interface Order {
  id: string;
  date: string;
  creatorName: string;
  amount: number;
  status: 'Waiting for Approval' | 'Ongoing order' | 'Delivered' | 'Completed' | 'Cancelled';
  created_at: string;
  total_amount: number;
  creator?: {
    user: {
      name: string;
      email: string;
    };
  };
}

const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon, href: '/dashboard/brand' },
  { id: 'dashboard', label: 'Dashboard', icon: CubeIcon, href: '/dashboard/brand' },
  { id: 'campaigns', label: 'Campaigns', icon: BriefcaseIcon, href: '/dashboard/brand/campaigns' },
  { id: 'orderList', label: 'Order List', icon: ListBulletIcon, href: '/dashboard/brand/orders' },
  { id: 'portfolio', label: 'Portfolio', icon: DocumentTextIcon, href: '/dashboard/brand' },
  { id: 'reviews', label: 'Reviews', icon: StarIcon, href: '/dashboard/brand' },
  { id: 'chat', label: 'Chat', icon: EnvelopeIcon, href: '/dashboard/brand' },
  { id: 'wallet', label: 'Wallet', icon: WalletIcon, href: '/dashboard/brand' },
  { id: 'helpCenter', label: 'Help Center', icon: DocumentTextIcon, href: '/dashboard/brand' },
  { id: 'privacyPolicy', label: 'Privacy Policy', icon: DocumentTextIcon, href: '/dashboard/brand' },
  { id: 'supportTickets', label: 'Support Tickets', icon: DocumentTextIcon, href: '/dashboard/brand' },
  { id: 'termsOfService', label: 'Terms Of Service', icon: DocumentTextIcon, href: '/dashboard/brand' },
  { id: 'paymentHistory', label: 'Payment History', icon: DocumentTextIcon, href: '/dashboard/brand' },
  { id: 'accountSettings', label: 'Account Settings', icon: UserIcon, href: '/dashboard/brand' },
];

export default function BrandOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'New' | 'Ongoing' | 'Completed' | 'Cancelled'>('New');
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(4);
  const [totalOrders] = useState(46);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showPeriodFilter, setShowPeriodFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedPeriod] = useState('9 July 2023 - 21 June 2024');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      setLoading(true);
        const { ordersAPI } = await import('@/services/apiService');
        const response = await ordersAPI.getOrders();
      
        console.log('📋 Brand orders response:', response);
      
      if (response.success && response.orders) {
          // Transform the backend data to match our interface
          const transformedOrders: Order[] = response.orders.map((order: {
            id: string;
            created_at?: string;
            order_date?: string;
            creator?: {
              user?: { name: string };
              fullName?: string;
            };
            total_amount?: number;
            amount?: number;
            status: string;
          }) => ({
            id: order.id || `#${order.id}`,
            date: new Date(order.created_at || order.order_date || new Date()).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            creatorName: order.creator?.user?.name || order.creator?.fullName || 'Unknown Creator',
            amount: order.total_amount || order.amount || 0,
            status: order.status === 'pending' ? 'Waiting for Approval' : 
                   order.status === 'accepted' ? 'Ongoing order' :
                   order.status === 'delivered' ? 'Delivered' :
                   order.status === 'completed' ? 'Completed' :
                   order.status === 'cancelled' ? 'Cancelled' : 'Waiting for Approval',
            created_at: order.created_at || order.order_date,
            total_amount: order.total_amount || order.amount || 0,
            creator: order.creator
          }));
          
          setOrders(transformedOrders);
      } else {
          console.log('📋 No orders found or API returned no data');
          setOrders([]);
        }
      } catch (error) {
        console.error('❌ Error fetching brand orders:', error);
        // Show empty state instead of error for better UX
        setOrders([]);
    } finally {
      setLoading(false);
    }
  };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Waiting for Approval':
        return 'bg-red-100 text-red-600';
      case 'Ongoing order':
        return 'bg-orange-100 text-orange-600';
      case 'Delivered':
        return 'bg-blue-100 text-blue-600';
      case 'Completed':
        return 'bg-green-100 text-green-600';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'New') return order.status === 'Waiting for Approval';
    if (activeTab === 'Ongoing') return order.status === 'Ongoing order';
    if (activeTab === 'Completed') return order.status === 'Completed';
    if (activeTab === 'Cancelled') return order.status === 'Cancelled';
    return true;
  });

  const handleViewOrder = (order: Order) => {
    // Open order details modal
    setSelectedOrderId(order.id);
    setShowOrderDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderDetailsModal(false);
    setSelectedOrderId(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { ordersAPI } = await import('@/services/apiService');
      const response = await ordersAPI.getOrders();
      
      if (response.success && response.orders) {
        const transformedOrders: Order[] = response.orders.map((order: {
          id: string;
          created_at?: string;
          order_date?: string;
          creator?: {
            user?: { name: string };
            fullName?: string;
          };
          total_amount?: number;
          amount?: number;
          status: string;
        }) => ({
          id: order.id || `#${order.id}`,
                      date: new Date(order.created_at || order.order_date || new Date()).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          creatorName: order.creator?.user?.name || order.creator?.fullName || 'Unknown Creator',
          amount: order.total_amount || order.amount || 0,
          status: order.status === 'pending' ? 'Waiting for Approval' : 
                 order.status === 'accepted' ? 'Ongoing order' :
                 order.status === 'delivered' ? 'Delivered' :
                 order.status === 'completed' ? 'Completed' :
                 order.status === 'cancelled' ? 'Cancelled' : 'Waiting for Approval',
          created_at: order.created_at || order.order_date,
          total_amount: order.total_amount || order.amount || 0,
          creator: order.creator
        }));
        
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('❌ Error refreshing orders:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleLogout = () => {
    // Handle logout logic
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left Sidebar Navigation */}
      <div className="w-full lg:w-64 bg-white shadow-lg lg:fixed lg:h-full overflow-y-auto z-50 lg:z-auto">
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">in</span>
            </div>
            <span className="text-lg lg:text-xl font-bold text-gray-900">influ mojo</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'orderList';
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="text-sm lg:text-base font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4 lg:relative lg:mx-4 lg:mb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-sm lg:text-base font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 lg:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order List</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Dashboard / Order list</p>
            </div>
              <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-orange-600 disabled:bg-orange-300 transition-colors text-sm sm:text-base"
            >
              {refreshing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 lg:py-6">
          {/* Filters */}
          <div className="bg-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Status Filter */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowStatusFilter(!showStatusFilter)}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors w-full sm:min-w-[200px]"
                >
                  <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">{selectedStatus}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Select order status</div>
                  </div>
                  {showStatusFilter ? (
                    <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 ml-auto" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 ml-auto" />
                  )}
                </button>
                
                {showStatusFilter && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {['All Status', 'Waiting for Approval', 'Ongoing order', 'Delivered', 'Completed', 'Cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setShowStatusFilter(false);
                        }}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 first:rounded-b-lg last:rounded-b-lg text-sm sm:text-base"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
                </div>

              {/* Period Filter */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowPeriodFilter(!showPeriodFilter)}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors w-full sm:min-w-[250px]"
                >
                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">Select Period</div>
                    <div className="text-xs sm:text-sm text-gray-500">{selectedPeriod}</div>
                  </div>
                  {showPeriodFilter ? (
                    <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 ml-auto" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 ml-auto" />
                  )}
                </button>
                    </div>
                  </div>
                </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg mb-4 sm:mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto px-4 sm:px-6">
                {['New', 'Ongoing', 'Completed', 'Cancelled'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'New' | 'Ongoing' | 'Completed' | 'Cancelled')}
                    className={`py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="hidden sm:inline">ID</span>
                        <span className="sm:hidden">ID</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <ChevronUpIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="hidden sm:inline">Date</span>
                        <span className="sm:hidden">Date</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <ChevronUpIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="hidden sm:inline">Creator Name</span>
                        <span className="sm:hidden">Creator</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <ChevronUpIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="hidden sm:inline">Amount</span>
                        <span className="sm:hidden">Amt</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <ChevronUpIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="hidden sm:inline">Status Order</span>
                        <span className="sm:hidden">Status</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <ChevronUpIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                          <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4 px-4">
                            {activeTab === 'New' ? 'No new orders waiting for approval' :
                             activeTab === 'Ongoing' ? 'No ongoing orders' :
                             activeTab === 'Completed' ? 'No completed orders' :
                             activeTab === 'Cancelled' ? 'No cancelled orders' : 'No orders found'}
                          </p>
                    <button
                            onClick={() => router.push('/dashboard/brand')}
                            className="bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm sm:text-base"
                    >
                            Browse Creators
                    </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewOrder(order)}>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {order.date}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {order.creatorName}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          ₹{Number(order.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-lg px-4 sm:px-6 py-3 sm:py-4 mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Showing {filteredOrders.length} from {totalOrders} data
              </div>
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <button className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled={currentPage === 1}>
                  <ChevronDoubleLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled={currentPage === 1}>
                  <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {[1, 2, 3, 4].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled={currentPage === totalPages}>
                  <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled={currentPage === totalPages}>
                  <ChevronDoubleRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
              </div>
            </div>
          </div>
        </div>
      </div>

              {/* Brand Order Details Modal */}
        {showOrderDetailsModal && selectedOrderId && (
          <BrandOrderDetailsModal
            isOpen={showOrderDetailsModal}
            onClose={handleCloseModal}
            orderId={selectedOrderId}
          />
        )}
      </div>
  );
}

