'use client';

import React from 'react';
import { FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { StarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

interface CreatorCardProps {
  creator: {
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
  };
  onViewProfile: (creatorId: string) => void;
  onAddToCart?: (packageId: string, creatorId: string) => void;
  showAddToCart?: boolean;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ 
  creator, 
  onViewProfile, 
  onAddToCart, 
  showAddToCart = false 
}) => {
  // Get primary social account (Instagram by default, or first available)
  const primarySocial = creator.social_accounts && Array.isArray(creator.social_accounts) ? 
                       creator.social_accounts.find(acc => acc.platform && acc.platform.toLowerCase() === 'instagram') || 
                       creator.social_accounts[0] : null;

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    if (!platform) return <FaInstagram className="w-4 h-4" />;
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case 'instagram': return <FaInstagram className="w-4 h-4" />;
      case 'youtube': return <FaYoutube className="w-4 h-4" />;
      case 'tiktok': return <FaTiktok className="w-4 h-4" />;
      case 'facebook': return <FaFacebook className="w-4 h-4" />;
      case 'twitter': return <FaTwitter className="w-4 h-4" />;
      case 'linkedin': return <FaLinkedin className="w-4 h-4" />;
      default: return <FaInstagram className="w-4 h-4" />;
    }
  };

  // Get platform color
  const getPlatformColor = (platform: string) => {
    if (!platform) return 'text-gray-500';
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case 'instagram': return 'text-pink-500';
      case 'youtube': return 'text-red-500';
      case 'tiktok': return 'text-black';
      case 'facebook': return 'text-blue-500';
      case 'twitter': return 'text-blue-400';
      case 'linkedin': return 'text-blue-600';
      default: return 'text-gray-500';
    }
  };

  // Format follower count
  const formatFollowerCount = (count: number) => {
    if (!count || isNaN(count)) return '0';
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  // Get top 3 categories
  const topCategories = creator.content_categories && Array.isArray(creator.content_categories) ? creator.content_categories.slice(0, 3) : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header with profile image and basic info */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            {creator.profile_image_url ? (
              <img
                src={creator.profile_image_url}
                alt={creator.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-orange-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-lg ${creator.profile_image_url ? 'hidden' : ''}`}>
              {(creator.name && creator.name.charAt(0)) ? creator.name.charAt(0).toUpperCase() : 'C'}
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {creator.name || 'Unknown Creator'}
              </h3>
              {primarySocial?.verified && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            
            {/* Location */}
            {(creator.city || creator.state) && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                <MapPinIcon className="w-4 h-4" />
                <span>{[creator.city, creator.state].filter(Boolean).join(', ')}</span>
              </div>
            )}

            {/* Rating and collaborations */}
            <div className="flex items-center gap-4 text-sm">
              {creator.rating !== undefined && creator.rating !== null && creator.rating !== '' && (
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium text-gray-900">
                    {typeof creator.rating === 'number' 
                      ? creator.rating.toFixed(1) 
                      : parseFloat(String(creator.rating)).toFixed(1)
                    }
                  </span>
                </div>
              )}
              {creator.total_collaborations !== undefined && creator.total_collaborations !== null && creator.total_collaborations !== '' && (
                <span className="text-gray-500">
                  {typeof creator.total_collaborations === 'number' 
                    ? creator.total_collaborations 
                    : parseInt(String(creator.total_collaborations)) || 0
                  } collaborations
                </span>
              )}
            </div>
          </div>

          {/* Response Time */}
          {creator.average_response_time && creator.average_response_time.trim() && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <ClockIcon className="w-4 h-4" />
              <span>{creator.average_response_time}</span>
            </div>
          )}
        </div>
      </div>

      {/* Social Media Stats */}
      {primarySocial && typeof primarySocial === 'object' && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`${getPlatformColor(primarySocial.platform || 'unknown')}`}>
                {getPlatformIcon(primarySocial.platform || 'unknown')}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {primarySocial.platform ? primarySocial.platform.charAt(0).toUpperCase() + primarySocial.platform.slice(1) : 'Unknown Platform'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatFollowerCount(typeof primarySocial.follower_count === 'number' ? primarySocial.follower_count : parseFloat(String(primarySocial.follower_count)) || 0)}
              </div>
              <div className="text-xs text-gray-500">followers</div>
            </div>
          </div>
          {primarySocial.engagement_rate !== undefined && primarySocial.engagement_rate !== null && primarySocial.engagement_rate !== '' && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">
                {typeof primarySocial.engagement_rate === 'number' 
                  ? primarySocial.engagement_rate 
                  : parseFloat(String(primarySocial.engagement_rate)) || 0
                }%
              </span> engagement rate
            </div>
          )}
        </div>
      )}

      {/* Categories */}
      {topCategories && Array.isArray(topCategories) && topCategories.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {topCategories && Array.isArray(topCategories) && topCategories.map((category, index) => (
              <span
                key={category}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  index % 3 === 0 ? 'bg-blue-100 text-blue-800' :
                  index % 3 === 1 ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      {creator.bio && creator.bio.trim() && (
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            {creator.bio}
          </p>
        </div>
      )}

      {/* Packages Preview */}
      {creator.packages && Array.isArray(creator.packages) && creator.packages.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Available Packages</h4>
          <div className="space-y-2">
            {creator.packages && Array.isArray(creator.packages) && creator.packages.slice(0, 2).map((pkg) => (
              <div key={pkg.id || `pkg-${Math.random()}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {pkg.deliverables?.platform || 'Unknown'} {pkg.deliverables?.content_type || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {pkg.deliverables?.duration1 || ''} {pkg.deliverables?.duration2 || ''}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {typeof pkg.deliverables?.quantity === 'number' ? pkg.deliverables.quantity : parseInt(String(pkg.deliverables?.quantity || 0)) || 0} item{(typeof pkg.deliverables?.quantity === 'number' ? pkg.deliverables.quantity : parseInt(String(pkg.deliverables?.quantity || 0)) || 0) > 1 ? 's' : ''} • {typeof pkg.deliverables?.revisions === 'number' ? pkg.deliverables.revisions : parseInt(String(pkg.deliverables?.revisions || 0)) || 0} revision{(typeof pkg.deliverables?.revisions === 'number' ? pkg.deliverables.revisions : parseInt(String(pkg.deliverables?.revisions || 0)) || 0) > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">
                    ₹{typeof pkg.price === 'number' ? pkg.price : parseFloat(String(pkg.price)) || 0}
                  </div>
                  {showAddToCart && onAddToCart && (
                    <button
                      onClick={() => onAddToCart(pkg.id || '', creator.id || '')}
                      className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition-colors"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
            {(creator.packages && creator.packages.length > 2) && (
              <div className="text-center">
                <span className="text-xs text-gray-500">
                  +{creator.packages.length - 2} more packages
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-6 py-4">
        <div className="flex gap-3">
          <button
            onClick={() => onViewProfile(creator.id || '')}
            className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            View Profile
          </button>
          {showAddToCart && creator.packages && creator.packages.length > 0 && (
            <button
              onClick={() => onViewProfile(creator.id || '')}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Browse Packages
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorCard; 