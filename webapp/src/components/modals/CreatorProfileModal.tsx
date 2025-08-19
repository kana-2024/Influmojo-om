'use client';

import React, { useState } from 'react';
import { XMarkIcon, StarIcon, MapPinIcon, ClockIcon, UserIcon, CheckBadgeIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import CartFormModal from './CartFormModal';
import CartService from '@/services/cartService';
import { toast } from 'react-hot-toast';

interface Creator {
  id: string;
  name: string;
  email?: string;
  profile_image?: string;
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
  packages: Array<{
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

interface CreatorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator | null;
}

export default function CreatorProfileModal({ isOpen, onClose, creator }: CreatorProfileModalProps) {
  const [showCartForm, setShowCartForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Creator['packages'][0] | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'packages'>('overview');

  const handleAddToCart = (pkg: Creator['packages'][0]) => {
    setSelectedPackage(pkg);
    setShowCartForm(true);
  };

  const handleViewCreatorProfile = () => {
    // This will show the full creator profile view as shown in mobile screenshots
    // The profile should show all details on top and packages/portfolio at the bottom
    console.log('Viewing full creator profile for:', creator?.name);
  };

  const handleFormConfirm = (formData: {
    deliveryTime: number;
    additionalInstructions: string;
    references: string[];
  }) => {
    if (selectedPackage && creator && creator.packages) {
      CartService.addToCart({
        creatorId: creator.id,
        creatorName: creator.name,
        creatorImage: creator.profile_image,
        packageId: selectedPackage.id,
        packageName: selectedPackage.title,
        packageDescription: `${selectedPackage.deliverables.content_type} for ${selectedPackage.deliverables.platform}`,
        packagePrice: selectedPackage.price,
        packageDuration: `${selectedPackage.deliverables.duration1} ${selectedPackage.deliverables.duration2}`,
        platform: selectedPackage.deliverables.platform,
        deliveryTime: formData.deliveryTime,
        additionalInstructions: formData.additionalInstructions,
        references: formData.references,
      });
      
      toast.success('Package added to cart successfully!');
      setShowCartForm(false);
      setSelectedPackage(null);
    }
  };

  const formatFollowerCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case 'youtube':
        return <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">YT</div>;
      case 'instagram':
        return <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">IG</div>;
      case 'tiktok':
        return <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white text-xs font-bold">TT</div>;
      case 'twitter':
        return <div className="w-6 h-6 bg-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">TW</div>;
      case 'facebook':
        return <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">FB</div>;
      case 'linkedin':
        return <div className="w-6 h-6 bg-blue-700 rounded flex items-center justify-center text-white text-xs font-bold">LI</div>;
      default:
        return <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center text-white text-xs font-bold">{platform.charAt(0).toUpperCase()}</div>;
    }
  };

  if (!isOpen || !creator) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Creator Profile</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                      {creator.profile_image ? (
                        <img 
                          src={creator.profile_image} 
                          alt={creator.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-12 h-12 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{creator.name}</h2>
                        {creator.social_accounts?.some(acc => acc.verified) && (
                          <CheckBadgeIcon className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                      
                      {/* Rating */}
                      {creator.rating && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <StarSolidIcon 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(creator.rating!) ? 'text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {typeof creator.rating === 'number' ? creator.rating.toFixed(1) : parseFloat(String(creator.rating)).toFixed(1)}
                          </span>
                          <span className="text-gray-600 text-sm">({creator.total_collaborations || 0} collaborations)</span>
                        </div>
                      )}
                      
                      {/* Location */}
                      {(creator.city || creator.state) && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{[creator.city, creator.state].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { id: 'overview', label: 'Overview' },
                      { id: 'packages', label: 'Packages' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Bio */}
                    {creator.bio && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-medium text-gray-900 mb-2">About</h4>
                        <p className="text-gray-700">{creator.bio}</p>
                      </div>
                    )}

                    {/* Categories */}
                    {creator.content_categories && creator.content_categories.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Content Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {creator.content_categories.map((category, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Media Stats */}
                    {creator.social_accounts && creator.social_accounts.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Social Media</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {creator.social_accounts.map((account, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              {getPlatformIcon(account.platform)}
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}</p>
                                <p className="text-sm text-gray-500">@{account.username}</p>
                                <p className="text-xs text-gray-400">{formatFollowerCount(account.follower_count)} followers • {account.engagement_rate}% engagement</p>
                              </div>
                              {account.verified && (
                                <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Response Time</p>
                        <p className="font-semibold text-gray-900">{creator.average_response_time || '1HR - 3HR'}</p>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <ShoppingCartIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Available Packages</p>
                        <p className="font-semibold text-gray-900">{creator.packages?.length || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <UserIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Collaborations</p>
                        <p className="font-semibold text-gray-900">{creator.total_collaborations || 0}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'packages' && (
                  <div className="space-y-4">
                    {creator.packages && creator.packages.length > 0 ? (
                      creator.packages.map((pkg, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">{pkg.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                {getPlatformIcon(pkg.deliverables.platform)}
                                <span>{pkg.deliverables.content_type}</span>
                                <span>•</span>
                                <span>{pkg.deliverables.quantity} items</span>
                                <span>•</span>
                                <span>{pkg.deliverables.revisions} revisions</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ClockIcon className="w-4 h-4" />
                                <span>Delivery: {pkg.deliverables.duration1} {pkg.deliverables.duration2}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-orange-600">₹{pkg.price}</p>
                              <p className="text-sm text-gray-500">{pkg.currency}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleAddToCart(pkg)}
                            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingCartIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No packages available</h4>
                        <p className="text-gray-500">This creator hasn't published any packages yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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
          creatorName: creator?.name || '',
        } : undefined}
      />
    </>
  );
}
