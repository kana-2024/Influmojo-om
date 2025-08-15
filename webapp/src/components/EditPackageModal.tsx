'use client';

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { profileAPI } from '@/services/apiService';

interface EditPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackageUpdated: () => void;
  package: {
    id: string;
    title: string;
    description?: string;
    price: number;
    currency: string;
    deliverables: {
      platform: string;
      content_type: string;
      quantity: number;
      revisions: number;
      duration1: string;
      duration2: string;
    };
    type: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  };
}

const platforms = ['Instagram', 'Facebook', 'Youtube', 'Snapchat', 'TikTok', 'Twitter', 'LinkedIn'];
const contentTypes = ['Reel', 'Story', 'Feed post', 'Carousel Post', 'Video', 'Image', 'Article'];
const durations1 = ['1 Minute', '2 Minutes', '3 Minutes', '5 Minutes', '10 Minutes'];
const durations2 = ['30 Seconds', '45 Seconds', '1 Minute', '2 Minutes', '3 Minutes'];

export default function EditPackageModal({ isOpen, onClose, onPackageUpdated, package: pkg }: EditPackageModalProps) {
  // Initialize with empty values first
  const [platform, setPlatform] = useState('');
  const [contentType, setContentType] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [revisions, setRevisions] = useState('0');
  const [duration1, setDuration1] = useState('1 Minute');
  const [duration2, setDuration2] = useState('30 Seconds');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when pkg changes
  useEffect(() => {
    if (pkg && pkg.deliverables) {
      // Handle platform case sensitivity - backend stores in uppercase
      const platformValue = pkg.deliverables.platform || '';
      const normalizedPlatform = platforms.find(p => p.toUpperCase() === platformValue.toUpperCase()) || platformValue;
      
      setPlatform(normalizedPlatform);
      setContentType(pkg.deliverables.content_type || '');
      setQuantity(pkg.deliverables.quantity?.toString() || '1');
      setRevisions(pkg.deliverables.revisions?.toString() || '0');
      setDuration1(pkg.deliverables.duration1 || '1 Minute');
      setDuration2(pkg.deliverables.duration2 || '30 Seconds');
      setPrice(pkg.price?.toString() || '');
      setDescription(pkg.description || '');
    }
  }, [pkg]);

  // Don't render if pkg is not available
  if (!isOpen || !pkg) return null;

  const handleUpdatePackage = async () => {
    if (!platform.trim()) {
      alert('Please select a platform');
      return;
    }

    if (!contentType.trim()) {
      alert('Please select a content type');
      return;
    }

    if (!quantity.trim() || parseInt(quantity) < 1) {
      alert('Please enter a valid quantity');
      return;
    }

    if (!price.trim() || parseFloat(price) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      // Send data in the format expected by the backend
      await profileAPI.updatePackage(pkg.id, {
        platform: platform.trim(),
        content_type: contentType.trim(), // Use content_type as expected by backend
        quantity: quantity.trim(), // Send as string as expected by API
        revisions: revisions.trim(), // Send as string as expected by API
        duration1: duration1.trim(),
        duration2: duration2.trim(),
        price: price.trim(), // Send as string as expected by API
        description: description.trim()
      });

      alert('Package updated successfully!');
      onPackageUpdated();
      onClose();
    } catch (error) {
      console.error('Update package error:', error);
      alert('Failed to update package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-white w-full max-h-[90vh] rounded-t-2xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Package</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform *
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type *
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {contentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Quantity and Revisions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    const newQty = Math.max(1, parseInt(quantity) - 1);
                    setQuantity(newQty.toString());
                  }}
                  className="p-2 hover:bg-gray-100"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="flex-1 text-center border-0 focus:ring-0 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newQty = parseInt(quantity) + 1;
                    setQuantity(newQty.toString());
                  }}
                  className="p-2 hover:bg-gray-100"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revisions
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    const newRev = Math.max(0, parseInt(revisions) - 1);
                    setRevisions(newRev.toString());
                  }}
                  className="p-2 hover:bg-gray-100"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={revisions}
                  onChange={(e) => setRevisions(e.target.value)}
                  min="0"
                  className="flex-1 text-center border-0 focus:ring-0 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newRev = parseInt(revisions) + 1;
                    setRevisions(newRev.toString());
                  }}
                  className="p-2 hover:bg-gray-100"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration 1
              </label>
              <select
                value={duration1}
                onChange={(e) => setDuration1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {durations1.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration 2
              </label>
              <select
                value={duration2}
                onChange={(e) => setDuration2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {durations2.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price in rupees"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your package details, requirements, etc."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdatePackage}
              disabled={loading}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Package'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
