'use client';

import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import CreatorCard from './CreatorCard';

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

interface PlatformCreatorSectionProps {
  platform: string;
  creators: Creator[];
  onCreatorPress: (creator: Creator) => void;
  onViewAllPress: () => void;
  showAddToCart?: boolean;
}

const PlatformCreatorSection: React.FC<PlatformCreatorSectionProps> = ({
  platform,
  creators,
  onCreatorPress,
  onViewAllPress,
  showAddToCart = false,
}) => {
  if (creators.length === 0) return null;

  const getPlatformIcon = (platformName: string) => {
    const platformLower = platformName.toLowerCase();
    switch (platformLower) {
      case 'youtube':
        return (
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">YT</span>
          </div>
        );
      case 'instagram':
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">IG</span>
          </div>
        );
      case 'tiktok':
        return (
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TT</span>
          </div>
        );
      case 'twitter':
        return (
          <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TW</span>
          </div>
        );
      case 'facebook':
        return (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FB</span>
          </div>
        );
      case 'linkedin':
        return (
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">LI</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">{platformName.charAt(0).toUpperCase()}</span>
          </div>
        );
    }
  };



  return (
    <div className="space-y-4">
      {/* Platform Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getPlatformIcon(platform)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {platform} Creators
            </h3>
            <p className="text-sm text-gray-500">
              {creators.length} creator{creators.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        
        {creators.length > 6 && (
          <button
            onClick={onViewAllPress}
            className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            View all
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Creators Grid - Horizontal Scrolling on Mobile, Grid on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.slice(0, 6).map((creator) => (
          <CreatorCard
            key={creator.id}
            creator={creator}
            onViewProfile={() => onCreatorPress(creator)}
            showAddToCart={showAddToCart}
          />
        ))}
      </div>

      {/* Show More Indicator */}
      {creators.length > 6 && (
        <div className="text-center">
          <button
            onClick={onViewAllPress}
            className="text-orange-600 hover:text-orange-700 font-medium text-sm hover:underline"
          >
            +{creators.length - 6} more {platform} creators →
          </button>
        </div>
      )}
    </div>
  );
};

export default PlatformCreatorSection;
