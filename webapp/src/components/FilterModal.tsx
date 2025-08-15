'use client';

import React, { useState } from 'react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: CreatorFilters) => void;
  currentFilters: CreatorFilters;
}

export interface CreatorFilters {
  platforms: string[];
  categories: string[];
  followerRange: { min: number; max: number };
  priceRange: string;
  location: string;
  verifiedOnly: boolean;
  hasPackages: boolean;
}

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'youtube', name: 'YouTube', icon: '🎥' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'twitter', name: 'Twitter', icon: '🐦' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
];

const categories = [
  'Fashion & Beauty',
  'Technology',
  'Food & Cooking',
  'Travel',
  'Fitness & Health',
  'Entertainment',
  'Business',
  'Education',
  'Lifestyle',
  'Gaming',
  'Sports',
  'Art & Design',
  'Music',
  'Comedy',
  'Parenting',
  'Pet Care',
];

const priceRanges = [
  { id: 'all', label: 'All Prices' },
  { id: '0-1000', label: '₹0 - ₹1,000' },
  { id: '1000-5000', label: '₹1,000 - ₹5,000' },
  { id: '5000-10000', label: '₹5,000 - ₹10,000' },
  { id: '10000-50000', label: '₹10,000 - ₹50,000' },
  { id: '50000+', label: '₹50,000+' },
];

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<CreatorFilters>(currentFilters);

  const handlePlatformToggle = (platform: string) => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleFollowerRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    setFilters(prev => ({
      ...prev,
      followerRange: {
        ...prev.followerRange,
        [type]: numValue
      }
    }));
  };

  const handlePriceRangeChange = (priceRange: string) => {
    setFilters(prev => ({
      ...prev,
      priceRange
    }));
  };

  const handleLocationChange = (location: string) => {
    setFilters(prev => ({
      ...prev,
      location
    }));
  };

  const handleVerifiedToggle = () => {
    setFilters(prev => ({
      ...prev,
      verifiedOnly: !prev.verifiedOnly
    }));
  };

  const handleHasPackagesToggle = () => {
    setFilters(prev => ({
      ...prev,
      hasPackages: !prev.hasPackages
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters: CreatorFilters = {
      platforms: [],
      categories: [],
      followerRange: { min: 0, max: 10000000 },
      priceRange: 'all',
      location: '',
      verifiedOnly: false,
      hasPackages: false,
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.platforms.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.followerRange.min > 0 || filters.followerRange.max < 10000000) count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.location) count++;
    if (filters.verifiedOnly) count++;
    if (filters.hasPackages) count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <FunnelIcon className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900">Filter Creators</h2>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                  {getActiveFiltersCount()} active
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-6">
              {/* Platforms */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Platforms</h3>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <label
                      key={platform.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={filters.platforms.includes(platform.id)}
                        onChange={() => handlePlatformToggle(platform.id)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-2xl">{platform.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{platform.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Content Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Follower Range */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Follower Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
                    <input
                      type="number"
                      value={filters.followerRange.min || ''}
                      onChange={(e) => handleFollowerRangeChange('min', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
                    <input
                      type="number"
                      value={filters.followerRange.max || ''}
                      onChange={(e) => handleFollowerRangeChange('max', e.target.value)}
                      placeholder="10M"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="grid grid-cols-2 gap-3">
                  {priceRanges.map((range) => (
                    <label
                      key={range.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange === range.id}
                        onChange={() => handlePriceRangeChange(range.id)}
                        className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  placeholder="Enter city or state"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Additional Filters */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Filters</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filters.verifiedOnly}
                      onChange={handleVerifiedToggle}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-900">Verified creators only</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filters.hasPackages}
                      onChange={handleHasPackagesToggle}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-900">Has available packages</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset All
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
