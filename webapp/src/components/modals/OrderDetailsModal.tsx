'use client';

import React, { useState } from 'react';
import { XMarkIcon, EyeIcon, CheckIcon, XMarkIcon as XIcon, ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    status: string;
    created_at: string;
    accepted_at?: string;
    deliverables_submitted_at?: string;
    expected_delivery?: string;
    total_amount?: number;
    package?: {
      title: string;
      price: number;
      description?: string;
      deliverables: {
        platform: string;
        content_type: string;
        quantity: number;
        revisions: number;
        duration1: string;
        duration2: string;
      };
    };
    brand?: {
      company_name: string;
    };
    creator?: {
      user: {
        name: string;
        email?: string;
      };
    };
    additional_instructions?: string;
    references?: string[];
    deliverables?: Array<{
      filename?: string;
      media_type?: string;
      file_size?: number;
      media_url: string;
    }>;
  };
  onOrderAction: (action: 'accept' | 'reject' | 'revision', revisionRequirements?: string) => void;
}

export default function OrderDetailsModal({ isOpen, onClose, order, onOrderAction }: OrderDetailsModalProps) {
  const [revisionRequirements, setRevisionRequirements] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!isOpen || !order) return null;

  const handleAction = async (action: 'accept' | 'reject' | 'revision') => {
    if (action === 'revision' && !revisionRequirements.trim()) {
      toast.error('Please provide revision requirements');
      return;
    }

    setActionLoading(true);
    try {
      await onOrderAction(action, action === 'revision' ? revisionRequirements : undefined);
      toast.success(`Order ${action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'revision requested'} successfully`);
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
      default:
        return 'bg-gray-100 text-gray-800';
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
              {order.status.toUpperCase()}
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

              {order.deliverables_submitted_at && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Deliverables Submitted</p>
                    <p className="text-xs text-gray-500">{formatDate(order.deliverables_submitted_at)}</p>
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

          {/* Brand Update Board */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Update Board</h3>
            
            {order.deliverables && order.deliverables.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-800">Review Submitted Deliverables</h4>
                
                {order.deliverables.map((deliverable: {
                  filename?: string;
                  media_type?: string;
                  file_size?: number;
                  media_url: string;
                }, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <EyeIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {deliverable.filename || `File ${index + 1}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {deliverable.media_type || 'image'} • {deliverable.file_size ? `${(deliverable.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(deliverable.media_url, '_blank')}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleAction('accept')}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckIcon className="w-5 h-5" />
                    <span>Accept</span>
                  </button>
                  
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <XIcon className="w-5 h-5" />
                    <span>Reject</span>
                  </button>
                  
                  <button
                    onClick={() => setShowRevisionForm(!showRevisionForm)}
                    disabled={actionLoading}
                    className="flex-1 bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                    <span>Revision</span>
                  </button>
                </div>

                {/* Revision Form */}
                {showRevisionForm && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-800 mb-2">Request Revision</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Please provide specific requirements for the revision. The creator will have 24 hours to resubmit.
                      </p>
                      <textarea
                        value={revisionRequirements}
                        onChange={(e) => setRevisionRequirements(e.target.value)}
                        placeholder="Enter detailed revision requirements..."
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-800 mb-2">Upload Reference Files (Optional)</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Upload additional reference files to help clarify your revision requirements.
                      </p>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Upload Reference Files</span>
                      </button>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => setShowRevisionForm(false)}
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAction('revision')}
                        disabled={actionLoading || !revisionRequirements.trim()}
                        className="flex-1 bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Request Revision
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Deliverables Yet</h4>
                <p className="text-gray-500">The creator hasn&apos;t submitted deliverables for review yet.</p>
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
                  ₹{Number(order.package?.price || order.total_amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-gray-900">
                  ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Creator Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Creator Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-medium text-sm">
                    {order.creator?.user?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {order.creator?.user?.name || 'Creator Name'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.creator?.user?.email || 'creator@example.com'}
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
