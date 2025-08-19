'use client';

import React, { useState } from 'react';
import { XMarkIcon, ClockIcon, CheckIcon, XMarkIcon as XIcon, ArrowPathIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface CreatorOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onUploadDeliverables?: (files: File[]) => Promise<void>;
  onAcceptOrder?: () => Promise<void>;
  onRejectOrder?: () => Promise<void>;
}

export default function CreatorOrderDetailsModal({ 
  isOpen, 
  onClose, 
  order, 
  onUploadDeliverables,
  onAcceptOrder,
  onRejectOrder 
}: CreatorOrderDetailsModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  if (!isOpen || !order) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDeliverables = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    if (!onUploadDeliverables) {
      toast.error('Upload functionality not available');
      return;
    }

    setUploading(true);
    try {
      await onUploadDeliverables(uploadedFiles);
      toast.success('Deliverables uploaded successfully!');
      setShowUploadForm(false);
      setUploadedFiles([]);
    } catch (error) {
      toast.error('Failed to upload deliverables');
    } finally {
      setUploading(false);
    }
  };

  const handleOrderAction = async (action: 'accept' | 'reject') => {
    if (action === 'accept' && !onAcceptOrder) {
      toast.error('Accept functionality not available');
      return;
    }
    if (action === 'reject' && !onRejectOrder) {
      toast.error('Reject functionality not available');
      return;
    }

    setActionLoading(true);
    try {
      if (action === 'accept') {
        await onAcceptOrder!();
        toast.success('Order accepted successfully!');
      } else {
        await onRejectOrder!();
        toast.success('Order rejected successfully!');
      }
      onClose();
    } catch (error) {
      toast.error(`Failed to ${action} order`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'revision':
        return 'bg-orange-100 text-orange-800';
      case 'deliverables_submitted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Waiting for Your Approval';
      case 'accepted':
        return 'Order Accepted';
      case 'rejected':
        return 'Order Rejected';
      case 'revision':
        return 'Revision Requested';
      case 'deliverables_submitted':
        return 'Waiting for Brand Approval';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Order Status</h3>
              <p className="text-sm text-gray-600">
                Ordered on {formatDate(order.created_at)}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Order Created</p>
                  <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                </div>
              </div>
              
              {order.status !== 'pending' && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order Accepted</p>
                    <p className="text-xs text-gray-500">
                      {order.accepted_at ? formatDate(order.accepted_at) : 'Invalid Date'}
                    </p>
                  </div>
                </div>
              )}

              {order.status === 'deliverables_submitted' && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Deliverables Submitted</p>
                    <p className="text-xs text-gray-500">
                      {order.deliverables_submitted_at ? formatDate(order.deliverables_submitted_at) : 'Recently'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Expected Delivery</p>
                  <p className="text-xs text-gray-500">
                    {order.expected_delivery ? formatDate(order.expected_delivery) : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Creator Update Board */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Creator Update Board</h3>
            
            {order.status === 'pending' && onAcceptOrder && onRejectOrder && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <ClockIcon className="w-6 h-6 text-blue-600" />
                    <h4 className="text-lg font-medium text-blue-900">Order Review Required</h4>
                  </div>
                  <p className="text-blue-800 mb-4">
                    Please review the order requirements below. You can approve the order or reject it if needed.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Delivery Time: {order.delivery_time || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700">
                        Instructions: {order.additional_instructions || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => handleOrderAction('accept')}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckIcon className="w-5 h-5" />
                      <span>Approve</span>
                    </button>
                    
                    <button
                      onClick={() => handleOrderAction('reject')}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      <XIcon className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {order.status === 'accepted' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckIcon className="w-6 h-6 text-green-600" />
                    <h4 className="text-lg font-medium text-green-900">Order Accepted</h4>
                  </div>
                  <p className="text-green-800">
                    Your order has been accepted. Please upload your deliverables for brand review.
                  </p>
                </div>

                {!showUploadForm ? (
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                  >
                    <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Upload Deliverables</p>
                    <p className="text-gray-500">Images, videos, documents, or links</p>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        className="w-full"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Supported formats: Images, Videos, PDF, Word documents
                      </p>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div>
                        <h4 className="text-md font-medium text-gray-800 mb-3">Uploaded Files ({uploadedFiles.length})</h4>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveFile(index)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <XIcon className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowUploadForm(false)}
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitDeliverables}
                        disabled={uploading || uploadedFiles.length === 0}
                        className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                      >
                        {uploading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <CheckIcon className="w-5 h-5" />
                            <span>Submit for Review</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {order.status === 'deliverables_submitted' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <ClockIcon className="w-6 h-6 text-purple-600" />
                  <h4 className="text-lg font-medium text-purple-900">Waiting for Brand Approval</h4>
                </div>
                <p className="text-purple-800">
                  Your deliverables have been submitted and are currently under review by the brand. You'll be notified once they make a decision.
                </p>
              </div>
            )}

            {order.status === 'revision' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <ArrowPathIcon className="w-6 h-6 text-orange-600" />
                  <h4 className="text-lg font-medium text-orange-900">Revision Requested</h4>
                </div>
                <p className="text-orange-800 mb-3">
                  The brand has requested revisions to your deliverables. Please review the requirements and resubmit within 24 hours.
                </p>
                {order.revision_requirements && (
                  <div className="bg-white rounded-lg p-3">
                    <h5 className="font-medium text-gray-900 mb-2">Revision Requirements:</h5>
                    <p className="text-sm text-gray-700">{order.revision_requirements}</p>
                  </div>
                )}
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Upload Revised Deliverables
                </button>
              </div>
            )}
          </div>

          {/* Package Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Package Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {order.package?.title || 'Package Title'}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {order.package?.description || 'Package description not available'}
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium text-gray-900">
                  ₹{order.package?.price || order.total_amount || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-gray-900">
                  ₹{order.total_amount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Brand Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {order.brand?.company_name?.charAt(0)?.toUpperCase() || 'B'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {order.brand?.company_name || 'Brand Name'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.brand?.location_city || 'Location not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
