'use client';

import React, { useState } from 'react';
import {
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { profileAPI } from '@/services/apiService';
import { toast } from 'react-hot-toast';

interface CreatePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackageCreated: () => void;
}

const platforms = ['Instagram', 'Facebook', 'Youtube', 'Snapchat'];
const contentTypes = ['Reel', 'Story', 'Feed post', 'Carousel Post'];
const durations1 = ['1 Minute', '2 Minutes', '3 Minutes'];
const durations2 = ['30 Seconds', '45 Seconds', '1 Minute'];
const quantities = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const revisionOptions = ['0', '1', '2', '3', '4', '5'];

// Dropdown Component
interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

function Dropdown({ value, onChange, options, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-[#20536d] rounded-lg bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <span className="text-gray-900">{value || placeholder}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreatePackageModal({ isOpen, onClose, onPackageCreated }: CreatePackageModalProps) {
  const [platform, setPlatform] = useState('Instagram');
  const [contentType, setContentType] = useState('Reel');
  const [quantity, setQuantity] = useState('1');
  const [revisions, setRevisions] = useState('1');
  const [duration1, setDuration1] = useState('1 Minute');
  const [duration2, setDuration2] = useState('30 Seconds');
  const [price, setPrice] = useState('50000');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreatePackage = async () => {
    if (!platform.trim()) {
      toast.error('Please select a platform');
      return;
    }

    if (!contentType.trim()) {
      toast.error('Please select a content type');
      return;
    }

    if (!quantity.trim() || parseInt(quantity) < 1) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!price.trim() || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const packageData = {
        platform: platform.trim(),
        contentType: contentType.trim(),
        quantity: parseInt(quantity.trim()),
        revisions: parseInt(revisions.trim()) || 0,
        duration1: duration1.trim(),
        duration2: duration2.trim(),
        price: parseFloat(price.trim()),
        description: description.trim()
      };

      console.log('Creating package with data:', packageData);
      
      const result = await profileAPI.createPackage(packageData);
      
      console.log('Package creation result:', result);

      toast.success('Package created successfully!');
      onPackageCreated();
      onClose();
    } catch (error) {
      console.error('Create package error:', error);
      toast.error('Failed to create package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create Package</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Choose Platform */}
          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              Choose platform<span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={platform}
              onChange={setPlatform}
              options={platforms}
            />
          </div>

          {/* Select Content Type */}
          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              Select Content type<span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={contentType}
              onChange={setContentType}
              options={contentTypes}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              Quantity<span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={quantity}
              onChange={setQuantity}
              options={quantities}
            />
          </div>

          {/* Revisions */}
          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              Revisions
            </label>
            <Dropdown
              value={revisions}
              onChange={setRevisions}
              options={revisionOptions}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              Duration<span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Dropdown
                value={duration1}
                onChange={setDuration1}
                options={durations1}
              />
              <Dropdown
                value={duration2}
                onChange={setDuration2}
                options={durations2}
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              Price (INR)<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="50000"
              className="w-full px-4 py-3 border border-[#20536d] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
            />
          </div>

          {/* Brief Description */}
          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              Brief Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your package has to be add here."
              rows={4}
              className="w-full px-4 py-3 border border-[#20536d] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-base min-h-[100px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-orange-500 text-orange-500 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePackage}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Creating...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
