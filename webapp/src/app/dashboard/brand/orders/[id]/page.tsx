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
  MapPinIcon,
  DocumentTextIcon as DocumentTextIconOutline
} from '@heroicons/react/24/outline';
import { FaInstagram, FaYoutube, FaFacebook, FaTiktok } from 'react-icons/fa';

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
  deliverables?: Array<{
    filename?: string;
    type?: string;
    size?: number;
    url?: string;
  }>; // Array of submitted deliverable files
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

export default function BrandOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const { ordersAPI } = await import('@/services/apiService');
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

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'waiting for approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
      case 'ongoing':
      case 'ongoing order':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Waiting for Approval';
      case 'accepted':
        return 'Ongoing Order';
      case 'ongoing':
        return 'Ongoing Order';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getPlatformIcon = (platform?: string) => {
    if (!platform) return FaInstagram;
    switch (platform.toLowerCase()) {
      case 'youtube': return FaYoutube;
      case 'instagram': return FaInstagram;
      case 'facebook': return FaFacebook;
      case 'tiktok': return FaTiktok;
      default: return FaInstagram;
    }
  };

  const getPlatformColor = (platform?: string) => {
    if (!platform) return 'bg-pink-500';
    switch (platform.toLowerCase()) {
      case 'youtube': return 'bg-red-500';
      case 'instagram': return 'bg-pink-500';
      case 'facebook': return 'bg-blue-500';
      case 'tiktok': return 'bg-black';
      default: return 'bg-pink-500';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const calculateExpectedDelivery = () => {
    if (!orderDetails?.created_at || !orderDetails?.delivery_time) return 'N/A';
    
    try {
      const orderDate = new Date(orderDetails.created_at);
      const deliveryDate = new Date(orderDate.getTime() + (orderDetails.delivery_time * 24 * 60 * 60 * 1000));
      return formatDate(deliveryDate.toISOString());
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Order</h3>
          <p className="text-gray-600 mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => router.push('/dashboard/brand/orders')}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
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
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
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
              
              {/* Profile */}
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 lg:py-6">
          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Order #{orderDetails.id}
                </h1>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails.status)}`}>
                    {getStatusText(orderDetails.status)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Created on {formatDate(orderDetails.created_at || '')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Chat with Creator
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Package Details */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Package Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${getPlatformColor(orderDetails.package?.platform)} rounded-lg flex items-center justify-center`}>
                      {React.createElement(getPlatformIcon(orderDetails.package?.platform), { className: "w-5 h-5 text-white" })}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{orderDetails.package?.title}</h3>
                      <p className="text-gray-600 text-sm">{orderDetails.package?.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Duration: {orderDetails.package?.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentTextIconOutline className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Revisions: {orderDetails.package?.revisions}</span>
                    </div>
                  </div>

                  {orderDetails.package?.deliverables && orderDetails.package.deliverables.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Deliverables:</h4>
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
                </div>
              </div>

              {/* Additional Instructions */}
              {orderDetails.additional_instructions && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Instructions</h2>
                  <p className="text-gray-700">{orderDetails.additional_instructions}</p>
                </div>
              )}

              {/* References */}
              {orderDetails.references && orderDetails.references.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">References</h2>
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

              {/* Submitted Deliverables */}
              {orderDetails.deliverables && orderDetails.deliverables.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Submitted Deliverables</h2>
                  <div className="space-y-3">
                    {orderDetails.deliverables.map((deliverable, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </div>
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
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded border border-blue-200 hover:border-blue-300"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Right Column */}
            <div className="space-y-6">
              {/* Order Timeline */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Timeline</h2>
                <div className="space-y-4">
                  {/* Order Created */}
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Order Created</p>
                      <p className="text-xs text-gray-500">{formatDate(orderDetails.created_at || '')}</p>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      orderDetails.status === 'pending' || orderDetails.status === 'waiting for approval' 
                        ? 'bg-yellow-500' 
                        : orderDetails.status === 'accepted' || orderDetails.status === 'ongoing'
                        ? 'bg-blue-500'
                        : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {orderDetails.status === 'pending' || orderDetails.status === 'waiting for approval'
                          ? 'Waiting for Creator Approval'
                          : orderDetails.status === 'accepted' || orderDetails.status === 'ongoing'
                          ? 'Order Accepted'
                          : 'Order Status Updated'
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {orderDetails.status === 'pending' || orderDetails.status === 'waiting for approval'
                          ? 'Pending'
                          : orderDetails.status === 'accepted' || orderDetails.status === 'ongoing'
                          ? formatDate(orderDetails.collaboration?.started_at || '')
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Expected Delivery */}
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Expected Delivery</p>
                      <p className="text-xs text-gray-500">{calculateExpectedDelivery()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Creator Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{orderDetails.creator?.user?.name}</h3>
                      <p className="text-sm text-gray-500">{orderDetails.creator?.user?.email}</p>
                    </div>
                  </div>
                  
                  {orderDetails.creator?.location_city && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {orderDetails.creator.location_city}{orderDetails.creator.location_state ? `, ${orderDetails.creator.location_state}` : ''}
                      </span>
                    </div>
                  )}
                  
                  {orderDetails.creator?.bio && (
                    <div>
                      <p className="text-sm text-gray-700">{orderDetails.creator.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{orderDetails.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">{orderDetails.currency} {orderDetails.total_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg text-orange-600">
                      {orderDetails.currency} {orderDetails.total_amount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Brand Update Board */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Brand Update Board</h2>
                <div className="text-center py-4">
                  {orderDetails.status === 'pending' || orderDetails.status === 'waiting for approval' ? (
                    <div className="text-yellow-600">
                      <ClockIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Waiting for Creator Approval</p>
                    </div>
                  ) : orderDetails.status === 'accepted' || orderDetails.status === 'ongoing' ? (
                    <div className="text-gray-600">
                      <DocumentTextIconOutline className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">No Deliverables Yet</p>
                      <p className="text-xs text-gray-500">Creator is working on your order</p>
                    </div>
                  ) : orderDetails.status === 'review' ? (
                    <div className="text-blue-600">
                      <DocumentTextIconOutline className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Deliverables Submitted</p>
                      <p className="text-xs text-gray-500">Review the submitted work</p>
                    </div>
                  ) : (
                    <div className="text-green-600">
                      <CheckIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Order Completed</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
