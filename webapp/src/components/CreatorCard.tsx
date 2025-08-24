'use client';

import React, { useState } from 'react';
import { StarIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import CartService from '@/services/cartService';
import CartFormModal from './modals/CartFormModal';

interface Creator {
  id: string;
  name: string;
  email: string;
  profile_image_url?: string;
  bio?: string;
  city?: string;
  state?: string;
  rating?: number;
  total_collaborations?: number;
  average_response_time?: string;
  content_categories?: string[];
  languages?: string[];
  social_accounts?: Array<{
    platform: string;
    username: string;
    follower_count: number;
    engagement_rate: number;
    verified: boolean;
  }>;
  packages?: Array<{
    id: string;
    title: string;
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
  }>;
}

interface CreatorCardProps {
  creator: Creator;
  onViewProfile: (creatorId: string) => void;
  showAddToCart?: boolean;
}

const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  onViewProfile,
  showAddToCart = false,
}) => {
  const [showCartForm, setShowCartForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    id: string;
    title: string;
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
  } | null>(null);

  // Helper function to format follower count
  const formatFollowerCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Get primary platform and stats
  const primaryPlatform = creator.social_accounts?.[0];
  const hasPackages = creator.packages && creator.packages.length > 0;
  const firstPackage = hasPackages && creator.packages ? creator.packages[0] : null;

  // Handle add to cart with form
  const handleAddToCart = (pkg: {
    id: string;
    title: string;
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
  }) => {
    setSelectedPackage(pkg);
    setShowCartForm(true);
  };

  // Handle form confirmation
  const handleFormConfirm = (formData: {
    deliveryTime: number;
    additionalInstructions: string;
    references: string[];
  }) => {
    if (selectedPackage) {
      CartService.addToCart({
        creatorId: creator.id,
        creatorName: creator.name,
        creatorImage: creator.profile_image_url,
        packageId: selectedPackage.id,
        packageName: selectedPackage.title,
        packageDescription: `${selectedPackage.deliverables.content_type} for ${selectedPackage.deliverables.platform}`,
        packagePrice: selectedPackage.price,
        packageCurrency: selectedPackage.currency,
        packageDuration: `${selectedPackage.deliverables.duration1} ${selectedPackage.deliverables.duration2}`,
        platform: selectedPackage.deliverables.platform,
        deliveryTime: formData.deliveryTime,
        additionalInstructions: formData.additionalInstructions,
        references: formData.references,
      });
      setShowCartForm(false);
      setSelectedPackage(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image Placeholder */}
          <div className="h-24 bg-gradient-to-r from-orange-400 to-orange-600"></div>
          
          {/* Profile Picture */}
          <div className="absolute bottom-0 left-4 transform translate-y-1/2">
            <div className="w-16 h-16 bg-gray-300 rounded-full border-4 border-white flex items-center justify-center overflow-hidden">
              {creator.profile_image_url ? (
                <Image 
                  src={creator.profile_image_url} 
                  alt={creator.name} 
                  fill
                  className="object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-gray-600" />
              )}
            </div>
          </div>

          {/* Platform Badge */}
          {firstPackage && firstPackage.deliverables && firstPackage.deliverables.platform && (
            <div className="absolute top-3 right-3">
              <span className="bg-white text-gray-700 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                {firstPackage.deliverables.platform}
              </span>
            </div>
          )}
        </div>

        {/* Creator Info */}
        <div className="pt-10 px-4 pb-4">
          {/* Name and Rating */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-lg truncate">
              {creator.name}
            </h3>
            {creator.rating && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-700">
                  {typeof creator.rating === 'number' ? creator.rating.toFixed(1) : parseFloat(String(creator.rating)).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Bio */}
          {creator.bio && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {creator.bio}
            </p>
          )}

          {/* Location */}
          {(creator.city || creator.state) && (
            <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
              <MapPinIcon className="w-4 h-4" />
              <span>
                {[creator.city, creator.state].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {/* Social Stats */}
          {primaryPlatform && (
            <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {formatFollowerCount(primaryPlatform.follower_count)}
                </p>
                <p className="text-xs text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {primaryPlatform.engagement_rate}%
                </p>
                <p className="text-xs text-gray-500">Engagement</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {creator.average_response_time || '1HR'}
                </p>
                <p className="text-xs text-gray-500">Response</p>
              </div>
            </div>
          )}

          {/* Categories */}
          {creator.content_categories && creator.content_categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {creator.content_categories.slice(0, 3).map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                >
                  {category}
                </span>
              ))}
              {creator.content_categories.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{creator.content_categories.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Package Info */}
          {hasPackages && firstPackage && (
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">Starting from</span>
                <span className="text-lg font-bold text-orange-600">
                  ₹{Number(firstPackage.price).toLocaleString('en-IN')}
                </span>
              </div>
              
              {/* Package Title and Description */}
              {firstPackage.title && (
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{firstPackage.title}</h4>
                </div>
              )}
              
              {/* Package Details */}
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">      
                <span className="capitalize">{firstPackage.deliverables.content_type}</span>
                <span>•</span>
                <span>{firstPackage.deliverables.quantity} item{firstPackage.deliverables.quantity !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{firstPackage.deliverables.revisions} revision{firstPackage.deliverables.revisions !== 1 ? 's' : ''}</span>       
              </div>
              
              {/* Duration Information */}
              {(firstPackage.deliverables.duration1 || firstPackage.deliverables.duration2) && (
                <div className="text-xs text-gray-500">
                  <span>Duration: </span>
                  <span className="font-medium">
                    {firstPackage.deliverables.duration1}
                    {firstPackage.deliverables.duration2 && ` ${firstPackage.deliverables.duration2}`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onViewProfile(creator.id)}
              className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              View Profile
            </button>
            
            {showAddToCart && hasPackages && firstPackage && (
              <button
                onClick={() => handleAddToCart(firstPackage)}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cart Form Modal */}
      <CartFormModal
        isOpen={showCartForm}
        onClose={() => setShowCartForm(false)}
        onConfirm={handleFormConfirm}
        packageInfo={selectedPackage ? {
          id: selectedPackage.id,
          title: selectedPackage.title,
          price: selectedPackage.price,
          platform: selectedPackage.deliverables.platform,
          creatorName: creator.name,
        } : undefined}
      />
    </>
  );
};

export default CreatorCard; 