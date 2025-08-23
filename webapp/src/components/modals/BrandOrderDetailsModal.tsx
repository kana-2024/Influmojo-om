'use client';

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon as DocumentTextIconOutline,
  ChatBubbleLeftRightIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { FaInstagram, FaYoutube, FaFacebook, FaTiktok } from 'react-icons/fa';

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
  price_revision_reason?: string;
}

interface BrandOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

// Helper function to safely convert BigInt values to strings
const safeStringify = (value: any): string | number | any => {
  if (typeof value === 'bigint') {
    return String(value);
  }
  if (value && typeof value === 'object' && value.constructor === Object) {
    // Check if it's a BigInt representation object
    if ('s' in value && 'e' in value && 'd' in value) {
      // This is a BigInt representation, convert it to string
      console.log('🔧 Brand Modal safeStringify: Converting BigInt object:', value);
      return String(value);
    }
    // Handle nested objects recursively
    const result: any = {};
    for (const key in value) {
      result[key] = safeStringify(value[key]);
    }
    return result;
  }
  if (Array.isArray(value)) {
    return value.map(item => safeStringify(item));
  }
  return value;
};

// Helper function to safely convert price values to numbers
const safePriceConversion = (value: any): number => {
  if (value === null || value === undefined) return 0;
  
  // If it's already a number, return it
  if (typeof value === 'number') return value;
  
  // If it's a string, try to convert to number
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
  
  // If it's a BigInt or BigInt object, convert to string then to number
  if (typeof value === 'bigint') {
    return Number(String(value));
  }
  
  // If it's an object with BigInt representation (Decimal.js format)
  if (value && typeof value === 'object' && 's' in value && 'e' in value && 'd' in value) {
    try {
      // This is a Decimal.js BigInt object: {s: 1, e: 4, d: [20000]}
      const sign = value.s;
      const exponent = value.e;
      const digits = value.d;
      
      if (Array.isArray(digits) && digits.length > 0) {
        // Convert digits array to number - the digits array contains the actual number
        // For {s: 1, e: 4, d: [20000]}, the value is simply 20000
        let number = 0;
        for (let i = 0; i < digits.length; i++) {
          number += digits[i];
        }
        return sign * number;
      }
    } catch (error) {
      console.log('🔧 safePriceConversion: Error parsing BigInt object:', error);
    }
  }
  
  // Try to convert to string then to number as last resort
  try {
    const str = String(value);
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
};

export default function BrandOrderDetailsModal({ isOpen, onClose, orderId }: BrandOrderDetailsModalProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionComments, setRevisionComments] = useState('');

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const { ordersAPI } = await import('@/services/apiService');
      const response = await ordersAPI.getOrderDetails(orderId);
      
      console.log('📋 Brand Modal Order details response:', response);
      
      if (response.success && response.data) {
        const orderData = response.data.order || response.data;
        console.log('📋 Brand Modal Raw order data:', orderData);
        
        // Debug: Log all available fields to identify correct field names
        console.log('📋 Brand Modal Available fields:', Object.keys(orderData));
        console.log('📋 Brand Modal Price fields:', {
          package_price: orderData.package_price,
          price: orderData.price,
          amount: orderData.amount,
          total_amount: orderData.total_amount,
          package: orderData.package
        });
        
        // Debug: Check if price is nested in package
        if (orderData.package) {
          console.log('📋 Brand Modal Package price fields:', {
            package_price: orderData.package.price,
            package_amount: orderData.package.amount,
            package_total: orderData.package.total_amount
          });
        }
        
        // Transform the backend data to match our interface
        const transformedOrder: OrderDetails = {
          id: safeStringify(orderData.id || orderData.order_id || 'unknown'),
          package: orderData.package || {
            id: safeStringify(orderData.package_id || orderData.id),
            title: orderData.package_title || orderData.title || 'Package',
            description: orderData.package_description || orderData.description || 'Package description',
            price: safePriceConversion(orderData.package?.price || orderData.package_price || orderData.price || orderData.amount || 0),
            deliverables: orderData.package_deliverables || orderData.deliverables || [],
            type: orderData.package_type || orderData.type || 'Standard',
            platform: orderData.platform || 'Instagram',
            duration: orderData.duration || '1 day',
            revisions: safeStringify(orderData.revisions || orderData.revision_count || 1)
          },
          collaboration: orderData.collaboration || {
            id: safeStringify(orderData.collaboration_id || orderData.id),
            status: orderData.status || 'pending',
            started_at: orderData.created_at || orderData.order_date || new Date().toISOString(),
            deadline: orderData.deadline || orderData.estimated_delivery,
            agreed_rate: safeStringify(orderData.total_amount || orderData.amount || 0),
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
          delivery_time: safeStringify(orderData.delivery_time || orderData.duration_days || 1),
          additional_instructions: orderData.additional_instructions || orderData.instructions || '',
          references: Array.isArray(orderData.references) ? orderData.references : 
                     (orderData.references ? [orderData.references] : []),
          total_amount: safePriceConversion(orderData.total_amount || orderData.amount || orderData.package?.price || orderData.package_price || 0),
          currency: orderData.currency || 'USD',
          quantity: safePriceConversion(orderData.quantity || 1),
          price_revision_amount: safeStringify(orderData.price_revision_amount || 0)
        };
        
        console.log('📋 Brand Modal Transformed order data:', transformedOrder);
        console.log('📋 Brand Modal Package price type:', typeof transformedOrder.package?.price);
        console.log('📋 Brand Modal Total amount type:', typeof transformedOrder.total_amount);
        console.log('📋 Brand Modal Quantity type:', typeof transformedOrder.quantity);
        
        // Debug: Check what safePriceConversion returned for price fields
        console.log('📋 Brand Modal safePriceConversion test:', {
          package_price_raw: orderData.package_price,
          package_price_converted: safePriceConversion(orderData.package_price),
          total_amount_raw: orderData.total_amount,
          total_amount_converted: safePriceConversion(orderData.total_amount)
        });
        
        // Debug: Check if there are other price-related fields
        console.log('📋 Brand Modal All price-related fields:', {
          package_price: orderData.package_price,
          price: orderData.price,
          amount: orderData.amount,
          total_amount: orderData.total_amount,
          package_price_nested: orderData.package?.price,
          package_amount: orderData.package?.amount,
          package_total: orderData.package?.total_amount
        });
        
        // Debug: Check for any field that might contain price data
        const allFields = Object.keys(orderData);
        const priceRelatedFields = allFields.filter(field => 
          field.toLowerCase().includes('price') || 
          field.toLowerCase().includes('amount') || 
          field.toLowerCase().includes('cost') ||
          field.toLowerCase().includes('value')
        );
        console.log('📋 Brand Modal All fields:', allFields);
        console.log('📋 Brand Modal Price-related field names:', priceRelatedFields);
        
        // Debug: Test safePriceConversion with a known BigInt object structure
        const testBigIntObject = {s: 1, e: 5, d: [1,0,0,0,0,0]};
        console.log('📋 Brand Modal safePriceConversion test case:', {
          test_object: testBigIntObject,
          test_converted: safePriceConversion(testBigIntObject),
          test_string: String(testBigIntObject)
        });
        
        // Debug: Test String() conversion directly
        console.log('📋 Brand Modal String() conversion test:', {
          package_price_string: String(orderData.package_price),
          total_amount_string: String(orderData.total_amount),
          package_price_type: typeof orderData.package_price,
          total_amount_type: typeof orderData.total_amount
        });
        
        setOrderDetails(transformedOrder);
        
        // Extract uploaded files if they exist in the order data
        if (orderData.uploaded_files && Array.isArray(orderData.uploaded_files)) {
          setUploadedFiles(orderData.uploaded_files);
        } else if (orderData.deliverables && Array.isArray(orderData.deliverables)) {
          setUploadedFiles(orderData.deliverables);
        }
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

  const handleAcceptDeliverables = async () => {
    if (confirm('Are you sure you want to accept these deliverables? This will mark the order as completed.')) {
      try {
        setActionLoading(true);
        // Here you would typically send the acceptance to your backend
        // For now, we'll just show a success message
        alert('Deliverables accepted successfully! Order marked as completed.');
        // Refresh order details to update status
        fetchOrderDetails();
      } catch (error) {
        console.error('❌ Error accepting deliverables:', error);
        alert(`Error accepting deliverables: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionComments.trim()) {
      alert('Please provide revision comments before submitting.');
      return;
    }

    if (confirm('Are you sure you want to request a revision? This will send the request to the creator.')) {
      try {
        setActionLoading(true);
        // Here you would typically send the revision request to your backend
        // For now, we'll just show a success message
        alert('Revision request sent successfully! The creator will be notified.');
        setShowRevisionModal(false);
        setRevisionComments('');
        // Refresh order details to update status
        fetchOrderDetails();
      } catch (error) {
        console.error('❌ Error requesting revision:', error);
        alert(`Error requesting revision: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleApprovePriceRevision = async () => {
    if (confirm('Are you sure you want to approve the additional payment for this revision?')) {
      try {
        setActionLoading(true);
        // Here you would typically send the approval to your backend
        // For now, we'll just show a success message
        alert('Price revision approved! The creator will be notified and can proceed with the revision work.');
        // Refresh order details to update status
        fetchOrderDetails();
      } catch (error) {
        console.error('❌ Error approving price revision:', error);
        alert(`Error approving price revision: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRejectPriceRevision = async () => {
    if (confirm('Are you sure you want to decline the additional payment for this revision?')) {
      try {
        setActionLoading(true);
        // Here you would typically send the rejection to your backend
        // For now, we'll just show a success message
        alert('Price revision declined. The creator will be notified.');
        // Refresh order details to update status
        fetchOrderDetails();
      } catch (error) {
        console.error('❌ Error rejecting price revision:', error);
        alert(`Error rejecting price revision: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Order #{String(orderDetails?.id || orderId)}
            </h2>
            {orderDetails && (
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails.status)}`}>
                  {getStatusText(orderDetails.status)}
                </span>
                <span className="text-gray-500 text-sm">
                  Created on {formatDate(orderDetails.created_at || '')}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading order details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XMarkIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Order</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchOrderDetails}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : orderDetails ? (
                         <div className="space-y-6">
               {/* Debug: Log values right before JSX rendering */}
               {(() => {
                 console.log('🔍 Brand Modal JSX Render Values:', {
                   quantity: orderDetails.quantity,
                   package_price: orderDetails.package?.price,
                   total_amount: orderDetails.total_amount,
                   quantity_string: String(orderDetails.quantity || 0),
                   price_string: String(orderDetails.package?.price || orderDetails.total_amount || 0),
                   total_string: String(orderDetails.total_amount || 0)
                 });
                 return null;
               })()}
               
               {/* Package Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Package Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${getPlatformColor(orderDetails.package?.platform)} rounded-lg flex items-center justify-center`}>
                      {React.createElement(getPlatformIcon(orderDetails.package?.platform), { className: "w-5 h-5 text-white" })}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{orderDetails.package?.title}</h4>
                      <p className="text-gray-600 text-sm">{orderDetails.package?.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Quantity:</span>
                      <span className="text-sm text-gray-600">{orderDetails.quantity || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Price:</span>
                      <span className="text-sm text-gray-600">₹{safePriceConversion(orderDetails.package?.price || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Total:</span>
                      <span className="text-sm font-bold text-orange-600">₹{safePriceConversion(orderDetails.total_amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {orderDetails.package?.deliverables && orderDetails.package.deliverables.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Deliverables:</h5>
                      <div className="space-y-2">
                        {orderDetails.package.deliverables.map((deliverable: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckIcon className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">{String(deliverable)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Brand Update Board */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Brand Update Board</h3>
                <div className="space-y-4">
                  {orderDetails.status === 'pending' || orderDetails.status === 'waiting for approval' ? (
                    <div className="text-yellow-600 text-center">
                      <ClockIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Waiting for Creator Approval</p>
                      <p className="text-xs text-gray-500 mt-1">Creator is reviewing your order</p>
                    </div>
                  ) : orderDetails.status === 'accepted' || orderDetails.status === 'ongoing' ? (
                    <div className="space-y-4">
                      <div className="text-blue-600 text-center">
                        <DocumentTextIconOutline className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">Creator is Working</p>
                        <p className="text-xs text-gray-500">Your order is being processed</p>
                      </div>
                      
                      {/* Uploaded Files Display (if any) */}
                      {uploadedFiles.length > 0 && (
                        <div className="bg-white p-4 rounded-lg border">
                          <h5 className="font-medium text-gray-900 mb-3">Deliverables Received:</h5>
                          <div className="space-y-2">
                            {uploadedFiles.map((fileUrl, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span className="text-sm text-gray-600 truncate flex-1">
                                  {fileUrl.split('/').pop() || `File ${index + 1}`}
                                </span>
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  View
                                </a>
                              </div>
                            ))}
                          </div>
                          
                          {/* Brand Review Actions */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h6 className="font-medium text-gray-900 mb-3">Review Actions:</h6>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={handleAcceptDeliverables}
                                disabled={actionLoading}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <CheckIcon className="w-4 h-4" />
                                {actionLoading ? 'Processing...' : 'Accept Deliverables'}
                              </button>
                              
                              <button
                                onClick={() => setShowRevisionModal(true)}
                                disabled={actionLoading}
                                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <DocumentTextIconOutline className="w-4 h-4" />
                                Request Revision
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {uploadedFiles.length === 0 && (
                        <div className="text-center text-gray-500">
                          <p className="text-sm">No deliverables uploaded yet</p>
                          <p className="text-xs">Creator will upload files when ready</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-green-600 text-center">
                      <CheckIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Order Completed</p>
                      <p className="text-xs text-gray-500">All deliverables have been received</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Revision Request Section */}
              {orderDetails.status === 'price_revision_pending' && orderDetails.price_revision_amount && (
                <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                  <h3 className="text-xl font-semibold text-orange-900 mb-4">Price Revision Request</h3>
                  <p className="text-orange-700 mb-4">
                    The creator has requested additional payment for the revision work.
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg border border-orange-300 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Additional Amount:</span>
                      <span className="text-lg font-bold text-orange-600">
                        ₹{Number(orderDetails.price_revision_amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                    
                    {orderDetails.price_revision_reason && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Reason: </span>
                        <span className="text-sm text-gray-600">{orderDetails.price_revision_reason}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleApprovePriceRevision}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4" />
                      {actionLoading ? 'Processing...' : 'Approve Payment'}
                    </button>
                    
                    <button
                      onClick={handleRejectPriceRevision}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      {actionLoading ? 'Processing...' : 'Decline Payment'}
                    </button>
                  </div>
                </div>
              )}

              {/* Creator Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Creator Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{orderDetails.creator?.user?.name}</h4>
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

              {/* Order Timeline */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Timeline</h3>
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

              {/* Additional Instructions */}
              {orderDetails.additional_instructions && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Instructions</h3>
                  <p className="text-gray-700">{orderDetails.additional_instructions}</p>
                </div>
              )}

              {/* References */}
              {orderDetails.references && orderDetails.references.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">References</h3>
                  <div className="space-y-2">
                    {orderDetails.references.map((reference: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{String(reference)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        {orderDetails && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                Chat with Creator
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Request Revision</h3>
              <button
                onClick={() => setShowRevisionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="revision-comments" className="block text-sm font-medium text-gray-700 mb-2">
                    Revision Comments
                  </label>
                  <textarea
                    id="revision-comments"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Provide specific feedback for the revision request..."
                    value={revisionComments}
                    onChange={(e) => setRevisionComments(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific about what changes you'd like to see in the deliverables.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRevisionModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestRevision}
                    disabled={actionLoading || !revisionComments.trim()}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-500 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Sending...' : 'Send Revision Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
