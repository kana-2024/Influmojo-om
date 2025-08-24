'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon as DocumentTextIconOutline,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CloudArrowUpIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { FaInstagram, FaYoutube, FaFacebook, FaTiktok } from 'react-icons/fa';
import { cloudinaryService } from '@/services/cloudinaryService';

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

interface CreatorOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onOrderAction?: () => void;
}

// Helper function to safely convert BigInt values to strings
const safeStringify = (value: unknown): string | number => {
  if (typeof value === 'bigint') {
    return String(value);
  }
  if (value && typeof value === 'object' && value.constructor === Object) {
    // Check if it's a BigInt representation object
    if ('s' in value && 'e' in value && 'd' in value) {
      // This is a BigInt representation, convert it to string
      console.log('🔧 safeStringify: Converting BigInt object:', value);
      return String(value);
    }
    // For other objects, convert to string
    return String(value);
  }
  if (Array.isArray(value)) {
    // For arrays, convert to string representation
    return String(value);
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  // For any other type, convert to string
  return String(value);
};

// Helper function to safely convert any value to a string (for ID fields)
const safeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }
  if (value && typeof value === 'object' && value.constructor === Object) {
    // Check if it's a BigInt representation object
    if ('s' in value && 'e' in value && 'd' in value) {
      return String(value);
    }
  }
  // For any other type, convert to string
  return String(value);
};

// Helper function to safely convert any value to a number (for numeric fields)
const safeNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
  if (typeof value === 'bigint') {
    return Number(String(value));
  }
  if (value && typeof value === 'object' && value.constructor === Object) {
    // Check if it's a BigInt representation object
    if ('s' in value && 'e' in value && 'd' in value) {
      try {
        const sign = (value as { s: number }).s;
        const digits = (value as { d: number[] }).d;
        if (Array.isArray(digits) && digits.length > 0) {
          let number = 0;
          for (let i = 0; i < digits.length; i++) {
            number += digits[i];
          }
          return sign * number;
        }
      } catch (error) {
        console.log('🔧 safeNumber: Error parsing BigInt object:', error);
      }
    }
  }
  // For any other type, try to convert to number
  try {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
};

// Helper function to safely convert price values to numbers
const safePriceConversion = (value: unknown): number => {
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
      const sign = (value as { s: number }).s;
      const digits = (value as { d: number[] }).d;
      
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

export default function CreatorOrderDetailsModal({ isOpen, onClose, orderId, onOrderAction }: CreatorOrderDetailsModalProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasRequestedPriceRevision, setHasRequestedPriceRevision] = useState(false);
  const [priceRevisionAmount, setPriceRevisionAmount] = useState('');

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { ordersAPI } = await import('@/services/apiService');
      const response = await ordersAPI.getOrderDetails(orderId);
      
      console.log('📋 Creator Modal Order details response:', response);
      
      if (response.success && response.data) {
        const orderData = response.data.order || response.data;
        console.log('📋 Creator Modal Raw order data:', orderData);
        
        // Debug: Log all available fields to identify correct field names
        console.log('📋 Creator Modal Available fields:', Object.keys(orderData));
        console.log('📋 Creator Modal Brand info:', orderData.brand);
        console.log('📋 Creator Modal Package info:', orderData.package);
        console.log('📋 Creator Modal Price fields:', {
          package_price: orderData.package_price,
          price: orderData.price,
          amount: orderData.amount,
          total_amount: orderData.total_amount,
          package: orderData.package
        });
        
        // Debug: Check if price is nested in package
        if (orderData.package) {
          console.log('📋 Creator Modal Package price fields:', {
            package_price: orderData.package.price,
            package_amount: orderData.package.amount,
            package_total: orderData.package.total_amount
          });
          
          // Debug: Check package price structure
          if (orderData.package.price) {
            console.log('📋 Creator Modal Package price details:', {
              price: orderData.package.price,
              price_type: typeof orderData.package.price,
              price_keys: orderData.package.price && typeof orderData.package.price === 'object' ? Object.keys(orderData.package.price) : 'not an object'
            });
          }
        }
        
        // Debug: Check total_amount structure
        console.log('📋 Creator Modal Total amount details:', {
          total_amount: orderData.total_amount,
          total_amount_type: typeof orderData.total_amount,
          total_amount_keys: orderData.total_amount && typeof orderData.total_amount === 'object' ? Object.keys(orderData.total_amount) : 'not an object'
        });
        
        // Debug: Test safeStringify function directly
        console.log('📋 Creator Modal safeStringify test:', {
          package_price_raw: orderData.package?.price,
          package_price_converted: safeStringify(orderData.package?.price),
          total_amount_raw: orderData.total_amount,
          total_amount_converted: safeStringify(orderData.total_amount)
        });
        
        // Debug: Test safeStringify with a known BigInt object structure
        const testBigIntObject = {s: 1, e: 5, d: [1,0,0,0,0,0]};
        console.log('📋 Creator Modal safeStringify test case:', {
          test_object: testBigIntObject,
          test_converted: safeStringify(testBigIntObject),
          test_string: String(testBigIntObject)
        });
        
        // Debug: Test String() conversion directly
        console.log('📋 Creator Modal String() conversion test:', {
          package_price_string: String(orderData.package?.price),
          total_amount_string: String(orderData.total_amount),
          package_price_type: typeof orderData.package?.price,
          total_amount_type: typeof orderData.total_amount
        });
        
        // Transform the backend data to match our interface
        const transformedOrder: OrderDetails = {
          id: safeString(orderData.id || orderData.order_id || 'unknown'),
          package: orderData.package || {
            id: safeString(orderData.package_id || orderData.id),
            title: orderData.package_title || orderData.title || 'Package',
            description: orderData.package_description || orderData.description || 'Package description',
                         price: safePriceConversion(orderData.package?.price || orderData.package_price || orderData.price || orderData.amount || 0),
            deliverables: orderData.package_deliverables || orderData.deliverables || [],
            type: orderData.package_type || orderData.type || 'Standard',
            platform: orderData.platform || 'Instagram',
            duration: orderData.duration || '1 day',
            revisions: safeNumber(orderData.revisions || orderData.revision_count || 1)
          },
          collaboration: orderData.collaboration || {
            id: safeString(orderData.collaboration_id || orderData.id),
            status: orderData.status || 'pending',
            started_at: orderData.created_at || orderData.order_date || new Date().toISOString(),
            deadline: orderData.deadline || orderData.estimated_delivery,
            agreed_rate: safePriceConversion(orderData.package?.price || orderData.total_amount || orderData.amount || orderData.package_price || orderData.price || 0),
            currency: orderData.currency || 'USD',
            contract_terms: orderData.contract_terms || orderData.additional_instructions || 'Standard terms'
          },
          brand: orderData.brand || {
            company_name: orderData.brand?.company_name || orderData.brand_name || orderData.company_name || 'Brand',
            location_city: orderData.brand?.location_city || orderData.brand_location_city || orderData.location_city,
            location_state: orderData.brand?.location_state || orderData.brand_location_state || orderData.location_state,
            industry: orderData.brand?.industry || orderData.brand_industry || orderData.industry,
            website_url: orderData.brand?.website_url || orderData.brand_website || orderData.website_url
          },
          creator: orderData.creator || {
            user: {
              name: orderData.creator_name || orderData.creator?.user?.name || orderData.name || 'Creator',
              email: orderData.creator_email || orderData.creator?.user?.email || orderData.email
            },
            location_city: orderData.creator_location_city || orderData.creator?.location_city || orderData.location_city,
            location_state: orderData.creator_location_state || orderData.creator?.location_state || orderData.location_state,
            bio: orderData.creator_bio || orderData.creator?.bio || orderData.bio || 'Creator bio'
          },
          created_at: orderData.created_at || orderData.order_date,
          order_date: orderData.order_date || orderData.created_at,
          status: orderData.status || 'pending',
          delivery_time: safeNumber(orderData.delivery_time || orderData.duration_days || 1),
          additional_instructions: orderData.additional_instructions || orderData.instructions || '',
          references: Array.isArray(orderData.references) ? orderData.references : 
                     (orderData.references ? [orderData.references] : []),
                     total_amount: safePriceConversion(orderData.package?.price || orderData.total_amount || orderData.amount || orderData.package_price || orderData.price || 0),
          currency: orderData.currency || 'USD',
                     quantity: safePriceConversion(orderData.quantity || 1),
          price_revision_amount: safeStringify(orderData.price_revision_amount || 0)
        };
        
        // Debug: Check what safeStringify returned for price fields
        console.log('📋 Creator Modal Transformed price fields:', {
          package_price: transformedOrder.package?.price,
          total_amount: transformedOrder.total_amount,
          agreed_rate: transformedOrder.collaboration?.agreed_rate
        });
        
        // Debug: Check the final orderDetails object
        console.log('📋 Creator Modal Final orderDetails:', {
          id: transformedOrder.id,
          package_price: transformedOrder.package?.price,
          total_amount: transformedOrder.total_amount,
          quantity: transformedOrder.quantity
        });
        
        // Debug: Check what will be displayed in UI
        console.log('📋 Creator Modal UI Display Values:', {
                  price_display: `₹${Number(transformedOrder.package?.price || 0).toLocaleString('en-IN')}`,
        total_display: `₹${Number(transformedOrder.total_amount || 0).toLocaleString('en-IN')}`,
          quantity_display: Number(transformedOrder.quantity || 0)
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
  }, [orderId]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId, fetchOrderDetails]);

  const handleAcceptOrder = async () => {
    if (!orderDetails) return;
    
    if (confirm('Are you sure you want to accept this order?')) {
      try {
        setActionLoading(true);
        const { ordersAPI } = await import('@/services/apiService');
        const response = await ordersAPI.acceptOrder(orderId);
        
        if (response.success) {
          alert('Order accepted successfully! You can now start working on this project.');
          onOrderAction?.();
          onClose();
        } else {
          alert(`Failed to accept order: ${response.message || 'Unknown error'}`);
        }
      } catch (error: unknown) {
        console.error('❌ Error accepting order:', error);
        alert(`Error accepting order: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRejectOrder = async () => {
    if (!orderDetails) return;
    
    const reason = prompt('Please provide a reason for rejecting this order (optional):');
    
    if (confirm('Are you sure you want to reject this order?')) {
      try {
        setActionLoading(true);
        const { ordersAPI } = await import('@/services/apiService');
        const response = await ordersAPI.rejectOrder(orderId, reason || '');
        
        if (response.success) {
          alert('Order rejected successfully.');
          onOrderAction?.();
          onClose();
        } else {
          alert(`Failed to reject order: ${response.message || 'Unknown error'}`);
        }
      } catch (error: unknown) {
        console.error('❌ Error rejecting order:', error);
        alert(`Error rejecting order: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        try {
          // Use the cloudinaryService for proper upload
          const result = await cloudinaryService.uploadFile(file);
          uploadedUrls.push(result.secure_url);
          
          clearInterval(progressInterval);
          setUploadProgress(100);
        } catch (uploadError) {
          clearInterval(progressInterval);
          throw new Error(`Failed to upload ${file.name}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      }

      setUploadedFiles(prev => [...prev, ...uploadedUrls]);
      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('❌ Error uploading files:', error);
      alert(`Error uploading files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitForReview = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file before submitting for review.');
      return;
    }

    if (confirm('Are you sure you want to submit these deliverables for review?')) {
      try {
        setActionLoading(true);
        // Here you would typically send the uploaded files to your backend
        // For now, we'll just show a success message
        alert('Deliverables submitted for review successfully!');
        onOrderAction?.();
        onClose();
      } catch (error) {
        console.error('❌ Error submitting deliverables:', error);
        alert(`Error submitting deliverables: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRequestPriceRevision = async () => {
    if (!priceRevisionAmount.trim()) {
      alert('Please enter a valid amount for the price revision.');
      return;
    }

    if (confirm(`Are you sure you want to request an additional ₹${priceRevisionAmount} for this revision?`)) {
      try {
        setActionLoading(true);
        // Here you would typically send the price revision request to your backend
        // For now, we'll just show a success message
        alert('Price revision request sent to the brand!');
        setHasRequestedPriceRevision(true);
        setPriceRevisionAmount('');
        // Refresh order details to update status
        fetchOrderDetails();
      } catch (error) {
        console.error('❌ Error requesting price revision:', error);
        alert(`Error requesting price revision: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setActionLoading(false);
      }
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
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'ongoing':
        return 'Accepted';
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
                console.log('🔍 Creator Modal JSX Render Values:', {
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

              {/* Creator Update Board */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Creator Update Board</h3>
                <div className="space-y-4">
                  {orderDetails.status === 'pending' || orderDetails.status === 'waiting for approval' ? (
                    <div className="text-yellow-600 text-center">
                      <ClockIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Order Review Required</p>
                      <p className="text-xs text-gray-500 mt-1">Please review the order details below</p>
                    </div>
                  ) : orderDetails.status === 'accepted' || orderDetails.status === 'ongoing' ? (
                    <>
                      <div className="space-y-4">
                     
                      
                      {/* File Upload Section */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
                        <div className="text-center">
                          <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Upload your deliverables</p>
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*,.pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {uploading ? 'Uploading...' : 'Choose Files'}
                          </label>
                        </div>
                        
                        {/* Upload Progress */}
                        {uploading && (
                          <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-center">{uploadProgress}%</p>
                          </div>
                        )}
                      </div>

                      {/* Uploaded Files Display */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-900">Uploaded Files:</h5>
                          {uploadedFiles.map((fileUrl, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                              <span className="text-sm text-gray-600 truncate flex-1">
                                {fileUrl.split('/').pop() || `File ${index + 1}`}
                              </span>
                              <div className="flex items-center gap-2">
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  View
                                </a>
                                <button
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <XCircleIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Submit Button - Directly below the Creator Update Board */}
                      <div className="text-center pt-2">
                        <button
                          onClick={handleSubmitForReview}
                          disabled={actionLoading || uploadedFiles.length === 0}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <DocumentTextIconOutline className="w-4 h-4" />
                          {actionLoading ? 'Submitting...' : 'Submit for Review'}
                        </button>
                        {uploadedFiles.length === 0 && (
                          <p className="text-xs text-gray-500 mt-2">Upload files to enable submission</p>
                        )}
                      </div>
                    </div>
                    </>
                  ) : orderDetails.status === 'revision_requested' ? (
                    <>
                      {/* Revision Request Section */}
                      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                        <h4 className="text-lg font-semibold text-yellow-900 mb-3">Revision Requested</h4>
                        <p className="text-yellow-700 mb-4">
                          The brand has requested revisions. You can resubmit deliverables or request a price adjustment for additional work.
                        </p>
                        
                        {!hasRequestedPriceRevision ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Request Additional Payment (One-time only)
                              </label>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">₹</span>
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={priceRevisionAmount}
                                  onChange={(e) => setPriceRevisionAmount(e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                            
                            <button
                              onClick={handleRequestPriceRevision}
                              disabled={!priceRevisionAmount.trim() || actionLoading}
                              className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <DocumentTextIconOutline className="w-4 h-4" />
                              {actionLoading ? 'Processing...' : 'Request Price Revision'}
                            </button>
                          </div>
                        ) : (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2">
                              <CheckIcon className="w-5 h-5 text-green-600" />
                              <span className="text-green-700 font-medium">
                                Price revision already requested. Waiting for brand response.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* File Upload Section for Revision */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
                        <div className="text-center">
                          <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Upload revised deliverables</p>
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*,.pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="hidden"
                            id="revision-file-upload"
                          />
                          <label
                            htmlFor="revision-file-upload"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {uploading ? 'Uploading...' : 'Choose Files'}
                          </label>
                        </div>
                        
                        {/* Upload Progress */}
                        {uploading && (
                          <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-center">{uploadProgress}%</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Submit Revised Deliverables Button */}
                      <div className="text-center pt-2">
                        <button
                          onClick={handleSubmitForReview}
                          disabled={actionLoading || uploadedFiles.length === 0}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <DocumentTextIconOutline className="w-4 h-4" />
                          {actionLoading ? 'Submitting...' : 'Submit Revised Deliverables'}
                        </button>
                        {uploadedFiles.length === 0 && (
                          <p className="text-xs text-gray-500 mt-2">Upload files to enable submission</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-green-600 text-center">
                      <CheckIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Order Completed</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Section */}
              {orderDetails.status === 'pending' || orderDetails.status === 'waiting for approval' ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Actions</h3>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleAcceptOrder}
                      disabled={actionLoading}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4" />
                      {actionLoading ? 'Processing...' : 'Accept Order'}
                    </button>
                    <button
                      onClick={handleRejectOrder}
                      disabled={actionLoading}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      {actionLoading ? 'Processing...' : 'Reject Order'}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Brand Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Brand Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{orderDetails.brand?.company_name}</h4>
                      <p className="text-sm text-gray-500">{orderDetails.brand?.industry}</p>
                    </div>
                  </div>
                  
                  {orderDetails.brand?.location_city && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {orderDetails.brand.location_city}{orderDetails.brand.location_state ? `, ${orderDetails.brand.location_state}` : ''}
                      </span>
                    </div>
                  )}
                  
                  {orderDetails.brand?.website_url && (
                    <div>
                      <p className="text-sm text-gray-700">{orderDetails.brand.website_url}</p>
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
                          ? 'Pending'
                          : orderDetails.status === 'accepted' || orderDetails.status === 'ongoing'
                          ? 'Accepted'
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
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}