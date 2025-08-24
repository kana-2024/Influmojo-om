'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  ShareIcon, 
  BookmarkIcon, 
  StarIcon, 
  ClockIcon,
  ShoppingCartIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { profileAPI } from '@/services/apiService';
import CartService from '@/services/cartService';
import { toast } from 'react-hot-toast';

interface CreatorProfile {
  id: string;
  name: string;
  email?: string;
  profile_image?: string;
  cover_image?: string;
  bio?: string;
  gender?: string;
  date_of_birth?: string;
  location_city?: string;
  location_state?: string;
  city?: string;
  state?: string;
  rating?: number;
  total_collaborations?: number;
  average_response_time?: string;
  content_categories?: string[];
  categories?: string[];
  languages?: string[];
  platform?: string[];
  social_media_accounts?: Array<{
    id: string;
    platform: string;
    username: string;
    follower_count: number;
    engagement_rate: number;
    avg_views: number;
    verified: boolean;
  }>;
  portfolio_items?: Array<{
    id: string;
    title: string;
    description: string;
    media_url: string;
    media_type: string;
    platform: string;
    tags?: string[];
    is_featured: boolean;
  }>;
  packages: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    deliverables: {
      platform?: string;
      content_type?: string;
      quantity?: number;
      revisions?: number;
      duration1?: string;
      duration2?: string;
    };
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
}

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.id as string;
  
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'instagram' | 'tiktok' | 'ugc'>('all');
  const [selectedPackage, setSelectedPackage] = useState<CreatorProfile['packages'][0] | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const fetchCreatorProfile = useCallback(async () => {
    try {
      setLoading(true);
      // For now, we'll use the creators endpoint and find by ID
      // In the future, you might want to create a specific endpoint for individual creator profiles
      const response = await profileAPI.getCreators();
      if (response.success) {
        // Find the specific creator from the response
        const allCreators = [
          ...response.data.youtube,
          ...response.data.instagram,
          ...response.data.facebook,
          ...response.data.twitter,
          ...response.data.tiktok
        ];
        const foundCreator = allCreators.find(c => c.id === creatorId);
        if (foundCreator) {
          // Transform the API data to match our interface
          const transformedCreator: CreatorProfile = {
            ...foundCreator,
            // Map API fields to our interface
            location_city: foundCreator.city,
            location_state: foundCreator.state,
            // Add default packages if none exist
            packages: foundCreator.packages || [
              {
                id: 'default-1',
                type: 'instagram',
                title: 'Instagram Post',
                description: 'Professional Instagram post creation',
                price: 5000,
                currency: 'INR',
                deliverables: {
                  platform: 'instagram',
                  content_type: 'post',
                  quantity: 1,
                  revisions: 2,
                  duration1: '3-5',
                  duration2: 'days'
                },
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]
          };
          setCreator(transformedCreator);
        } else {
          setError('Creator not found');
        }
      } else {
        setError('Failed to fetch creator profile');
      }
    } catch (err) {
      console.error('Error fetching creator profile:', err);
      setError('Failed to fetch creator profile');
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    if (creatorId) {
      fetchCreatorProfile();
    }
  }, [creatorId, fetchCreatorProfile]);

  const handleAddToCart = (pkg: CreatorProfile['packages'][0]) => {
    if (!creator) return;
    
    try {
      CartService.addToCart({
        creatorId: creator.id,
        creatorName: creator.name,
        creatorImage: creator.profile_image,
        packageId: pkg.id,
        packageName: pkg.title,
        packageDescription: pkg.description,
        packagePrice: pkg.price,
        packageDuration: `${pkg.deliverables?.duration1 || ''} ${pkg.deliverables?.duration2 || ''}`,
        platform: pkg.deliverables?.platform || 'Unknown',
        deliveryTime: 7, // Default 7 days
        additionalInstructions: '',
        references: [],
      });
      
      toast.success('Package added to cart successfully!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add package to cart');
    }
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
      default:
        return <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center text-white text-xs font-bold">{platform.charAt(0).toUpperCase()}</div>;
    }
  };

  const filteredPackages = creator?.packages?.filter(pkg => {
    if (activeTab === 'all') return true;
    if (activeTab === 'instagram') return pkg.deliverables?.platform?.toLowerCase() === 'instagram';
    if (activeTab === 'tiktok') return pkg.deliverables?.platform?.toLowerCase() === 'tiktok';
    if (activeTab === 'ugc') return pkg.deliverables?.platform?.toLowerCase() === 'ugc';
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Creator not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              <ShareIcon className="w-5 h-5" />
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              <BookmarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Creator Headline */}
            <div className="bg-white rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {(creator.content_categories || creator.categories)?.join(' - ') || 'Content Creation'} - {creator.bio?.substring(0, 50)}...
              </h1>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <ShareIcon className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <BookmarkIcon className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Media Gallery */}
            <div className="bg-white rounded-lg p-6">
              <div className="grid grid-cols-3 gap-4">
                {creator.portfolio_items && creator.portfolio_items.length > 0 ? (
                  creator.portfolio_items.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={item.media_url || '/assets/onboarding1.png'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {index === 2 && creator.portfolio_items && creator.portfolio_items.length > 3 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <button
                            onClick={() => setShowAllPhotos(true)}
                            className="text-white font-semibold"
                          >
                            Show All Photos
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Fallback images if no portfolio items
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src="/assets/onboarding1.png"
                        alt="Creator content"
                        className="w-full h-full object-cover"
                      />
                      {index === 2 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <button className="text-white font-semibold">
                            Show All Photos
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Creator Profile Summary */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={creator.profile_image || '/assets/onboarding1.png'}
                    alt={creator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{creator.name}</h2>
                    <div className="flex items-center gap-1">
                      <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                      <span className="font-semibold">{creator.rating || '5.0'}</span>
                    </div>
                    <button className="text-orange-500 text-sm hover:underline">
                      {creator.total_collaborations || '38'} Reviews
                    </button>
                  </div>
                  
                  <p className="text-gray-600 mb-3">
                    {(creator.location_city || creator.city) && (creator.location_state || creator.state)
                      ? `${creator.location_city || creator.city}, ${creator.location_state || creator.state}, United States`
                      : 'Location not specified'
                    }
                  </p>
                  
                  {/* Social Media Following */}
                  <div className="flex items-center gap-4">
                    {creator.social_media_accounts?.map((account) => (
                      <button
                        key={account.id}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {getPlatformIcon(account.platform)}
                        <span className="text-sm font-medium">Followers</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Badges */}
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <StarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">{creator.name} is a Top Creator</h4>
                  <p className="text-sm text-green-700">Completed multiple orders and has high ratings</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">{creator.name} Responds Fast</h4>
                  <p className="text-sm text-blue-700">Quick response times to brand inquiries</p>
                </div>
              </div>
            </div>

            {/* About Section */}
            {creator.bio && (
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                <p className="text-gray-700 leading-relaxed">{creator.bio}</p>
              </div>
            )}

            {/* Packages Section */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Packages</h3>
              
              {/* Package Tabs */}
              <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'tiktok', label: 'TikTok' },
                  { id: 'ugc', label: 'UGC' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'all' | 'instagram' | 'tiktok' | 'ugc')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Package List */}
              <div className="space-y-4">
                {filteredPackages.length > 0 ? (
                  filteredPackages.map((pkg) => (
                    <div key={pkg.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <input
                              type="radio"
                              name="selectedPackage"
                              value={pkg.id}
                              onChange={() => setSelectedPackage(pkg)}
                              className="text-orange-500 focus:ring-orange-500"
                            />
                            <h4 className="font-semibold text-gray-900">{pkg.title}</h4>
                                                         <span className="text-2xl font-bold text-orange-600">₹{Number(pkg.price).toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-gray-600 text-sm">{pkg.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No packages available for {activeTab === 'all' ? 'any platform' : activeTab}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Package Selection & Cart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-6">
              {selectedPackage ? (
                <>
                  {/* Selected Package Price */}
                  <div className="text-center mb-6">
                                         <span className="text-4xl font-bold text-orange-600">₹{Number(selectedPackage.price).toLocaleString('en-IN')}</span>
                  </div>
                  
                  {/* Package Type Dropdown */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{selectedPackage.title}</span>
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                  
                  {/* Package Description */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Package Details</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {selectedPackage.description}
                    </p>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(selectedPackage)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Add to Cart
                  </button>
                  
                  {/* Custom Offer Link */}
                  <div className="mt-4 text-center">
                    <button className="text-orange-500 text-sm hover:underline">
                      Can&apos;t find what you need? Send a Custom Offer
                    </button>
                  </div>
                  
                  {/* How it works Link */}
                  <div className="mt-4 text-center">
                    <button className="text-gray-500 text-sm hover:text-gray-700 transition-colors flex items-center justify-center gap-2 mx-auto">
                      <span>?</span>
                      How does it work?
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCartIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a package to view details and add to cart</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* All Photos Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">All Photos</h3>
                  <button
                    onClick={() => setShowAllPhotos(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {creator.portfolio_items?.map((item) => (
                    <div key={item.id} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={item.media_url || '/assets/onboarding1.png'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
