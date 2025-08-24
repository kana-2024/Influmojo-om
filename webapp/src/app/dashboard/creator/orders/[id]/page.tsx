'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  ShoppingCartIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  CloudArrowUpIcon,
  XCircleIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { FaInstagram } from 'react-icons/fa';
import { cloudinaryService, CloudinaryUploadResponse } from '@/services/cloudinaryService';
import { ordersAPI } from '@/services/apiService';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
}

interface OrderDetails {
  id: string;
  package?: {
    id?: string;
    title?: string;
    description?: string;
    price?: number;
    deliverables?: string[];
    type?: string;
    platform?: string;
    duration?: string;
    revisions?: number;
  };
  collaboration?: {
    id: string;
    status: string;
    started_at: string;
    deadline?: string;
    agreed_rate: number;
    currency: string;
    contract_terms?: string;
    brand?: {
      company_name: string;
      location_city?: string;
      location_state?: string;
      industry?: string;
      website_url?: string;
    };
    creator?: {
      user: {
        name: string;
        email?: string;
      };
      location_city?: string;
      location_state?: string;
      bio?: string;
    };
  };
  brand?: {
    company_name: string;
    location_city?: string;
    location_state?: string;
    industry?: string;
    website_url?: string;
  };
  creator?: {
    user: {
      name: string;
      email?: string;
    };
    location_city?: string;
    location_state?: string;
    bio?: string;
  };
  created_at?: string;
  order_date?: string;
  status: string;
  delivery_time?: number;
  additional_instructions?: string;
  references?: string[];
  total_amount?: number;
  currency?: string;
  quantity?: number;
  price_revision_amount?: string | number;
  deliverables?: any[]; // Array of submitted deliverable files
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, href: '/dashboard/creator' },
  { id: 'orderList', label: 'Order List', icon: ListBulletIcon, href: '/dashboard/creator/orders' },
  { id: 'packages', label: 'Packages', icon: CubeIcon, href: '/dashboard/creator' },
  { id: 'portfolio', label: 'Portfolio', icon: BriefcaseIcon, href: '/dashboard/creator' },
  { id: 'reviews', label: 'Reviews', icon: StarIcon, href: '/dashboard/creator' },
  { id: 'chat', label: 'Chat', icon: EnvelopeIcon, href: '/dashboard/creator' },
  { id: 'wallet', label: 'Wallet', icon: WalletIcon, href: '/dashboard/creator' },
  { id: 'helpCenter', label: 'Help Center', icon: DocumentTextIcon, href: '/dashboard/creator' },
  { id: 'privacyPolicy', label: 'Privacy Policy', icon: DocumentTextIcon, href: '/dashboard/creator' },
  { id: 'supportTickets', label: 'Support Tickets', icon: DocumentTextIcon, href: '/dashboard/creator' },
  { id: 'termsOfService', label: 'Terms Of Service', icon: DocumentTextIcon, href: '/dashboard/creator' },
  { id: 'paymentHistory', label: 'Payment History', icon: DocumentTextIcon, href: '/dashboard/creator' },
  { id: 'accountSettings', label: 'Account Settings', icon: UserIcon, href: '/dashboard/creator' },
];

export default function CreatorOrderViewPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Deliverable upload states
  const [uploadedDeliverables, setUploadedDeliverables] = useState<CloudinaryUploadResponse[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [submittingDeliverables, setSubmittingDeliverables] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrderDetails(orderId);
      
      console.log('📋 Order details response:', response);
      
      if (response.success && response.data) {
        const orderData = response.data.order || response.data;
        console.log('📋 Raw order data:', orderData);
        console.log('📋 Deliverables field:', orderData.deliverables);
        console.log('📋 Deliverables type:', typeof orderData.deliverables);
        
        // Transform the backend data to match our interface
        const transformedOrder: OrderDetails = {
          id: String(orderData.id || orderData.order_id || 'unknown'),
          package: orderData.package || {
            title: orderData.package_title || orderData.title || 'Package',
            description: orderData.package_description || orderData.description || 'Package description',
            price: orderData.package_price || orderData.price || 0,
            deliverables: orderData.package_deliverables || orderData.deliverables || [],
            type: orderData.package_type || orderData.type || 'Standard',
            platform: orderData.platform || 'Instagram',
            duration: orderData.duration || '1 day',
            revisions: orderData.revisions || orderData.revision_count || 1
          },
          collaboration: orderData.collaboration || {
            id: orderData.collaboration_id || orderData.id,
            status: orderData.status || 'pending',
            started_at: orderData.created_at || orderData.order_date || new Date().toISOString(),
            deadline: orderData.deadline || orderData.estimated_delivery,
            agreed_rate: orderData.total_amount || orderData.amount || 0,
            currency: orderData.currency || 'USD',
            contract_terms: orderData.contract_terms || orderData.additional_instructions || 'Standard terms'
          },
          brand: orderData.brand || {
            company_name: orderData.brand_name || orderData.company_name || 'Brand',
            location_city: orderData.brand_location_city || orderData.location_city,
            location_state: orderData.brand_location_state || orderData.location_state,
            industry: orderData.brand_industry || orderData.industry,
            website_url: orderData.brand_website || orderData.website_url
          },
          creator: orderData.creator || {
            user: {
              name: orderData.creator_name || orderData.creator?.user?.name || 'Creator',
              email: orderData.creator_email || orderData.creator?.user?.email
            },
            location_city: orderData.creator_location_city || orderData.creator?.location_city,
            location_state: orderData.creator_location_state || orderData.creator?.location_state,
            bio: orderData.creator_bio || orderData.creator?.bio || 'Creator bio'
          },
          created_at: orderData.created_at || orderData.order_date,
          order_date: orderData.order_date || orderData.created_at,
          status: orderData.status || 'pending',
          delivery_time: orderData.delivery_time || orderData.duration_days || 1,
          additional_instructions: orderData.additional_instructions || orderData.instructions || '',
          references: (() => {
            try {
              if (!orderData.references) return [];
              if (typeof orderData.references === 'string') {
                const parsed = JSON.parse(orderData.references);
                return Array.isArray(parsed) ? parsed : [parsed];
              }
              if (Array.isArray(orderData.references)) {
                return orderData.references;
              }
              return [orderData.references];
            } catch (error) {
              console.error('❌ Error parsing references:', error);
              return [];
            }
          })(),
          total_amount: orderData.total_amount || orderData.amount || 0,
          currency: orderData.currency || 'USD',
          quantity: orderData.quantity || 1,
          price_revision_amount: orderData.price_revision_amount || 0,
          deliverables: (() => {
            try {
              if (!orderData.deliverables) return [];
              if (typeof orderData.deliverables === 'string') {
                const parsed = JSON.parse(orderData.deliverables);
                return Array.isArray(parsed) ? parsed : [];
              }
              if (Array.isArray(orderData.deliverables)) {
                return orderData.deliverables;
              }
              return [];
            } catch (error) {
              console.error('❌ Error parsing deliverables:', error);
              return [];
            }
          })()
        };
        
        setOrderDetails(transformedOrder);
      } else {
        console.log('📋 Order not found');
        setError('Order not found');
        setOrderDetails(null);
      }
    } catch (error) {
      console.error('❌ Error fetching order details:', error);
      setError('Failed to load order details');
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const handleAcceptOrder = async () => {
    if (!orderDetails) return;
    
    if (confirm('Are you sure you want to accept this order?')) {
      try {
        const response = await ordersAPI.acceptOrder(orderId);
        
        if (response.success) {
          alert('Order accepted successfully! You can now start working on this project.');
          router.push('/dashboard/creator/orders');
        } else {
          alert(`Failed to accept order: ${response.message || 'Unknown error'}`);
        }
              } catch (error: unknown) {
        console.error('❌ Error accepting order:', error);
        alert(`Error accepting order: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleRejectOrder = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason === null) return; // User cancelled
    
    if (confirm('Are you sure you want to reject this order?')) {
      try {
        const response = await ordersAPI.rejectOrder(orderId, reason || '');
        if (response.success) {
          alert('Order rejected successfully');
          fetchOrder();
        } else {
          alert('Failed to reject order: ' + response.message);
        }
      } catch (error) {
        console.error('Error rejecting order:', error);
        alert('Failed to reject order. Please try again.');
      }
    }
  };

  // Deliverable upload functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingFiles(true);
      
      const uploadedFiles: CloudinaryUploadResponse[] = [];
      
      // Upload each selected file
      for (let i = 0; i < files.length; i++) {
        try {
          console.log('Uploading file:', files[i].name);
          const cloudinaryResponse = await cloudinaryService.uploadFile(files[i]);
          uploadedFiles.push(cloudinaryResponse);
        } catch (error) {
          console.error('Error uploading file:', files[i].name, error);
          alert(`Failed to upload ${files[i].name}. Please try again.`);
        }
      }

      if (uploadedFiles.length > 0) {
        setUploadedDeliverables(prev => [...prev, ...uploadedFiles]);
        alert(`${uploadedFiles.length} file(s) uploaded successfully!`);
      }
      
    } catch (error) {
      console.error('Error selecting files:', error);
      alert('Failed to select files. Please try again.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    if (confirm('Are you sure you want to remove this file?')) {
      setUploadedDeliverables(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmitDeliverables = async () => {
    if (uploadedDeliverables.length === 0) {
      alert('Please upload at least one deliverable before submitting.');
      return;
    }

    try {
      setSubmittingDeliverables(true);
      
      // Prepare deliverable data
      const deliverablesData = uploadedDeliverables.map(file => ({
        url: file.secure_url,
        filename: file.public_id.split('/').pop() || 'file',
        type: file.resource_type,
        size: file.bytes
      }));

      // Submit deliverables via API
      const response = await ordersAPI.submitDeliverables(orderId, deliverablesData);
      
      if (response.success) {
        alert('Deliverables submitted for review!');
        // Clear uploaded files and refresh order details
        setUploadedDeliverables([]);
        fetchOrder();
      } else {
        throw new Error(response.message || 'Failed to submit deliverables');
      }
      
    } catch (error) {
      console.error('Error submitting deliverables:', error);
      alert('Failed to submit deliverables. Please try again.');
    } finally {
      setSubmittingDeliverables(false);
    }
  };


  const handleChat = () => {
    // Handle chat initiation
    alert('Chat feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600">{error}</p>
          <button 
            onClick={() => router.push('/dashboard/creator/orders')}
            className="mt-3 sm:mt-4 bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm sm:text-base"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600">Order not found</p>
          <button 
            onClick={() => router.push('/dashboard/creator/orders')}
            className="mt-3 sm:mt-4 bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm sm:text-base"
          >
            Back to Orders
          </button>
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
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 lg:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs lg:text-sm">in</span>
              </div>
              <span className="text-lg lg:text-xl font-bold text-gray-900">influ mojo</span>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-semibold text-gray-900">Welcome Katy Jordan</h1>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">Welcome Katy Jordan</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Shopping Cart */}
              <div className="relative">
                <ShoppingCartIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <BellIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center">
                  1
                </span>
              </div>
              
              {/* Chat */}
              <div className="relative">
                <ChatBubbleLeftRightIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center">
                  1
                </span>
              </div>
              
              {/* Profile */}
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 lg:py-6">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order View</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Dashboard / Order #{orderDetails.id}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">{orderDetails.package?.platform || 'Instagram'}</p>
                <p className="text-base sm:text-lg font-bold text-gray-900">Order ID: {orderDetails.id}</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Package Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                <FaInstagram className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              
              {/* Order Information */}
              <div className="flex-1 w-full">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-center sm:text-left">{orderDetails.package?.title || 'Package'}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Duration</p>
                    <p className="text-sm sm:text-base font-medium">{orderDetails.package?.duration || '1 day'}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Quantity</p>
                    <p className="text-sm sm:text-base font-medium">{orderDetails.quantity || 1}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Revisions</p>
                    <p className="text-sm sm:text-base font-medium">{orderDetails.package?.revisions || 1}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Created at</p>
                    <p className="text-sm sm:text-base font-medium">{orderDetails.created_at ? new Date(orderDetails.created_at).toLocaleDateString('en-GB') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Status</p>
                    <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${
                      orderDetails.status === 'pending' || orderDetails.status === 'waiting for approval'
                        ? 'bg-yellow-100 text-yellow-600' 
                        : orderDetails.status === 'accepted' || orderDetails.status === 'ongoing'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {orderDetails.status === 'pending' || orderDetails.status === 'waiting for approval' 
                        ? 'Pending' 
                        : orderDetails.status === 'accepted' || orderDetails.status === 'ongoing'
                        ? 'Accepted'
                        : orderDetails.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 text-center sm:text-left">{orderDetails.package?.description || 'Package description'}</p>
                
                <div className="text-center sm:text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">₹{orderDetails.total_amount?.toLocaleString('en-IN') || 0}/-</p>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Details */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">BRAND DETAILS</h3>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Name</p>
                <p className="text-sm sm:text-base font-medium">{orderDetails.brand?.company_name || 'Brand'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Location</p>
                <p className="text-sm sm:text-base font-medium">
                  {orderDetails.brand?.location_city && orderDetails.brand?.location_state 
                    ? `${orderDetails.brand.location_city}, ${orderDetails.brand.location_state}`
                    : 'Location not provided'}
                </p>
              </div>
              {orderDetails.brand?.industry && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Industry</p>
                  <p className="text-sm sm:text-base font-medium">{orderDetails.brand.industry}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Instructions */}
          {orderDetails.additional_instructions && (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">ADDITIONAL INSTRUCTIONS</h3>
              <p className="text-sm sm:text-base text-gray-700">{orderDetails.additional_instructions}</p>
            </div>
          )}

          {/* References */}
          {orderDetails.references && orderDetails.references.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">REFERENCES</h3>
              <div className="space-y-2">
                {orderDetails.references.map((reference: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{reference}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Package Deliverables */}
          {orderDetails.package?.deliverables && orderDetails.package.deliverables.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">PACKAGE DELIVERABLES</h3>
              <div className="space-y-2">
                {orderDetails.package.deliverables.map((deliverable: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{deliverable}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submitted Deliverables */}
          {orderDetails.deliverables && orderDetails.deliverables.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">SUBMITTED DELIVERABLES</h3>
              <div className="space-y-3">
                {orderDetails.deliverables.map((deliverable: any, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PaperClipIcon className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{deliverable.filename || 'File'}</p>
                        <p className="text-xs text-gray-500">
                          {deliverable.type} • {deliverable.size ? Math.round(deliverable.size / 1024) + 'KB' : 'Unknown size'}
                        </p>
                      </div>
                    </div>
                    <a
                      href={deliverable.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creator Update Board */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">CREATOR UPDATE BOARD</h3>
            <div className="text-center py-4">
              {orderDetails.status === 'pending' || orderDetails.status === 'waiting for approval' ? (
                <div className="text-yellow-600">
                  <ClockIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Order Review Required</p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                      onClick={handleAcceptOrder}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={handleRejectOrder}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ) : orderDetails.status === 'accepted' || orderDetails.status === 'ongoing' ? (
                <div className="text-blue-600">
                  <DocumentTextIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Update Deliverables</p>
                  <p className="text-xs text-gray-500 mb-4">Upload your completed work</p>
                  
                  {/* File Upload Section */}
                  <div className="mb-4">
                    <label className="block w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto cursor-pointer">
                      <CloudArrowUpIcon className="w-4 h-4" />
                      {uploadingFiles ? 'Uploading...' : 'Upload Files'}
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="*/*"
                        disabled={uploadingFiles}
                      />
                    </label>
                  </div>

                  {/* Uploaded Files Display */}
                  {uploadedDeliverables.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Uploaded Files:</h4>
                      <div className="space-y-2">
                        {uploadedDeliverables.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <PaperClipIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{file.public_id.split('/').pop()}</span>
                              <span className="text-xs text-gray-500">({Math.round(file.bytes / 1024)}KB)</span>
                            </div>
                            <button
                              onClick={() => handleRemoveDeliverable(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitDeliverables}
                    disabled={uploadedDeliverables.length === 0 || submittingDeliverables}
                    className={`px-6 py-2 rounded-lg flex items-center justify-center gap-2 mx-auto ${
                      uploadedDeliverables.length === 0 || submittingDeliverables
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 transition-colors'
                    }`}
                  >
                    {submittingDeliverables ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Submit for Review
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-green-600">
                  <CheckIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Order Completed</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            {/* Chat Button */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={handleChat}
                className="w-full bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Chat
              </button>
            </div>
            
            {/* Accept/Reject Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleAcceptOrder}
                className="flex-1 bg-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-base sm:text-lg font-semibold"
              >
                <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                Accept
              </button>
              <button
                onClick={handleRejectOrder}
                className="flex-1 bg-red-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-base sm:text-lg font-semibold"
              >
                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
