'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ShareIcon, 
  BookmarkIcon, 
  StarIcon, 
  ShoppingCartIcon,
  ChevronDownIcon,
  PhotoIcon,
  PlayIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { profileAPI } from '@/services/apiService';
import CartService from '@/services/cartService';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/utils/currency';

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

export default function PublicCreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.id as string;
  

  
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
     const [activeTab, setActiveTab] = useState<'all' | 'instagram' | 'facebook'>('all');
  const [selectedPackage, setSelectedPackage] = useState<CreatorProfile['packages'][0] | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const fetchCreatorProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // First try to get creator profile by ID (public endpoint)
      const profileResponse = await profileAPI.getPublicCreatorProfileById(creatorId);
      
      if (profileResponse.success && profileResponse.data) {
        console.log('✅ Creator profile fetched successfully:', profileResponse.data);
        
        // Transform the API data to match our interface
        const transformedCreator: CreatorProfile = {
          id: profileResponse.data.id || creatorId,
          name: profileResponse.data.name || profileResponse.data.fullName || 'Unknown Creator',
          email: profileResponse.data.email,
          profile_image: profileResponse.data.profile_image || profileResponse.data.profilePicture,
          cover_image: profileResponse.data.cover_image || profileResponse.data.coverImage,
          bio: profileResponse.data.bio || profileResponse.data.description || profileResponse.data.about,
          gender: profileResponse.data.gender,
          date_of_birth: profileResponse.data.date_of_birth || profileResponse.data.dateOfBirth,
          location_city: profileResponse.data.city || profileResponse.data.location_city,
          location_state: profileResponse.data.state || profileResponse.data.location_state,
          city: profileResponse.data.city || profileResponse.data.location_city,
          state: profileResponse.data.state || profileResponse.data.location_state,
          rating: profileResponse.data.rating || 5.0,
          total_collaborations: profileResponse.data.total_collaborations || profileResponse.data.total_orders || 10,
          average_response_time: profileResponse.data.average_response_time || profileResponse.data.response_time || '1HR - 3HR',
          content_categories: profileResponse.data.content_categories || profileResponse.data.categories || ['Content Creator'],
          categories: profileResponse.data.categories || profileResponse.data.content_categories || ['Content Creator'],
          languages: profileResponse.data.languages || ['English'],
          platform: profileResponse.data.platform || [profileResponse.data.primary_platform || 'instagram'],
          social_media_accounts: profileResponse.data.social_media_accounts || profileResponse.data.social_accounts || [],
          portfolio_items: profileResponse.data.portfolio_items || profileResponse.data.portfolio || [],
          packages: profileResponse.data.packages || []
        };
        
        setCreator(transformedCreator);
        
        // Set first package as default selected if packages exist
        if (transformedCreator.packages && transformedCreator.packages.length > 0) {
          setSelectedPackage(transformedCreator.packages[0]);
        }
        
        return;
      }
      
      // Fallback: try to get creator from the creators list (public endpoint)
      console.log('🔄 Fallback: fetching from creators list...');
      const response = await profileAPI.getPublicCreators();
      
      if (response.success && response.data) {
        // Find the specific creator from the response
        const allCreators = [
          ...response.data.youtube || [],
          ...response.data.instagram || [],
          ...response.data.facebook || [],
          ...response.data.twitter || [],
          ...response.data.tiktok || []
        ];
        
        const foundCreator = allCreators.find(c => c.id === creatorId);
        
        if (foundCreator) {
          console.log('✅ Creator found in creators list:', foundCreator);
          
          // Transform the API data to match our interface
          const transformedCreator: CreatorProfile = {
            id: foundCreator.id,
            name: foundCreator.name || foundCreator.fullName || 'Unknown Creator',
            email: foundCreator.email,
            profile_image: foundCreator.profile_image || foundCreator.profilePicture,
            cover_image: foundCreator.cover_image || foundCreator.coverImage,
            bio: foundCreator.bio || foundCreator.description || foundCreator.about,
            gender: foundCreator.gender,
            date_of_birth: foundCreator.date_of_birth || foundCreator.dateOfBirth,
            location_city: foundCreator.city || foundCreator.location_city,
            location_state: foundCreator.state || foundCreator.location_state,
            city: foundCreator.city || foundCreator.location_city,
            state: foundCreator.state || foundCreator.location_state,
            rating: foundCreator.rating || 5.0,
            total_collaborations: foundCreator.total_collaborations || foundCreator.total_orders || 10,
            average_response_time: foundCreator.average_response_time || foundCreator.response_time || '1HR - 3HR',
            content_categories: foundCreator.content_categories || foundCreator.categories || ['Content Creator'],
            categories: foundCreator.categories || foundCreator.content_categories || ['Content Creator'],
            languages: foundCreator.languages || ['English'],
            platform: foundCreator.platform || [foundCreator.primary_platform || 'instagram'],
            social_media_accounts: foundCreator.social_media_accounts || foundCreator.social_accounts || [],
            portfolio_items: foundCreator.portfolio_items || foundCreator.portfolio || [],
            packages: foundCreator.packages || []
          };
          
          setCreator(transformedCreator);
          
          // Set first package as default selected if packages exist
          if (transformedCreator.packages && transformedCreator.packages.length > 0) {
            setSelectedPackage(transformedCreator.packages[0]);
          }
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
        packageCurrency: pkg.currency,
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

     const filteredPackages = creator?.packages?.filter(pkg => {
     if (activeTab === 'all') return true;
     if (activeTab === 'instagram') return pkg.deliverables?.platform?.toLowerCase() === 'instagram';
     if (activeTab === 'facebook') return pkg.deliverables?.platform?.toLowerCase() === 'facebook';
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
                     className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                   >
                     Go Back
                   </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header - EXACTLY like screenshot */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h1 className="text-lg font-medium text-gray-900">
                {creator.content_categories?.[0] || 'Fashion model'} | {creator.content_categories?.[1] || 'Content creator'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ShareIcon className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <BookmarkIcon className="w-4 h-4" />
                <span className="text-sm">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Creator's Visual Portfolio - EXACTLY like screenshot */}
            <div className="bg-white rounded-lg p-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Portfolio Images - Use actual portfolio or placeholder */}
                {creator.portfolio_items && creator.portfolio_items.length > 0 ? (
                  creator.portfolio_items.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={item.media_url || '/assets/onboarding1.png'}
                        alt={item.title || 'Portfolio item'}
                        fill
                        className="object-cover"
                      />
                      {index === 2 && creator.portfolio_items && creator.portfolio_items.length > 3 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <button
                            onClick={() => setShowAllPhotos(true)}
                            className="text-white font-semibold flex items-center gap-2"
                          >
                            <PhotoIcon className="w-5 h-5" />
                            Show All Photos
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Fallback placeholder images matching the screenshot layout
                  [
                    { src: '/assets/onboarding1.png', alt: 'Creator content 1' },
                    { src: '/assets/onboarding1.png', alt: 'Creator content 2' },
                    { src: '/assets/onboarding1.png', alt: 'Creator content 3' }
                  ].map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover"
                      />
                      {index === 2 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <button className="text-white font-semibold flex items-center gap-2">
                            <PhotoIcon className="w-5 h-5" />
                            Show All Photos
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {/* Portfolio Info */}
              {creator.portfolio_items && creator.portfolio_items.length > 0 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    {creator.portfolio_items.length} portfolio item{creator.portfolio_items.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              )}
            </div>

            {/* Creator Profile & Details - EXACTLY like screenshot */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-start gap-4">
                {/* Profile Picture */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={creator.profile_image || '/assets/onboarding1.png'}
                    alt={creator.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Creator Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{creator.name || 'Anastasiia Shchegoleva'}</h2>
                    <div className="flex items-center gap-1">
                      <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                      <span className="font-semibold">{creator.rating || '5.0'}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-600">{creator.total_collaborations || '10'} Reviews</span>
                    </div>
                  </div>
                  
                                     <p className="text-gray-600 mb-3">
                     {(() => {
                       const city = creator.location_city || creator.city;
                       const state = creator.location_state || creator.state;
                       
                       if (city && state) {
                         return `${city}, ${state}`;
                       } else if (city) {
                         return city;
                       } else if (state) {
                         return state;
                       } else {
                         return 'Location not specified';
                       }
                     })()}
                   </p>
                  
                  {/* Social Media Icons with Followers - EXACTLY like screenshot */}
                                     <div className="flex items-center gap-3">
                     {creator.social_media_accounts && creator.social_media_accounts.length > 0 ? (
                       creator.social_media_accounts.slice(0, 3).map((account, index) => (
                         <button 
                           key={account.id || index}
                           className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                         >
                          {account.platform.toLowerCase() === 'instagram' && <PhotoIcon className="w-4 h-4" />}
                          {account.platform.toLowerCase() === 'youtube' && <PlayIcon className="w-4 h-4" />}
                          {account.platform.toLowerCase() === 'tiktok' && <UserIcon className="w-4 h-4" />}
                          {!['instagram', 'youtube', 'tiktok'].includes(account.platform.toLowerCase()) && <UserIcon className="w-4 h-4" />}
                          <span className="text-sm font-medium">
                            {account.follower_count >= 1000000 
                              ? `${(account.follower_count / 1000000).toFixed(1)}M`
                              : account.follower_count >= 1000 
                              ? `${(account.follower_count / 1000).toFixed(1)}K`
                              : account.follower_count
                            } Followers
                          </span>
                        </button>
                      ))
                    ) : (
                                             // Fallback social media buttons
                       <>
                         <button className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                           <PhotoIcon className="w-4 h-4" />
                           <span className="text-sm font-medium">Followers</span>
                         </button>
                         <button className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                           <PlayIcon className="w-4 h-4" />
                           <span className="text-sm font-medium">Followers</span>
                         </button>
                         <button className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                           <UserIcon className="w-4 h-4" />
                           <span className="text-sm font-medium">Followers</span>
                         </button>
                       </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Creator Badge - EXACTLY like screenshot */}
            <div className="bg-white rounded-lg p-6">
                                 <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                     <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                       <StarIcon className="w-6 h-6 text-white" />
                     </div>
                     <div>
                       <h4 className="font-semibold text-orange-900">{creator.name || 'Anastasiia'} is a Top Creator</h4>
                       <p className="text-sm text-orange-700">Top creators have completed multiple orders and have a high rating from brands.</p>
                     </div>
                   </div>
            </div>

            {/* Creator Bio - EXACTLY like screenshot */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
              <p className="text-gray-700 leading-relaxed">
                {creator.bio || `I am a professional model and travel blogger with a passion for exploring stunning destinations around the world and creating high-quality content. Alongside my work in fashion and travel, I am deeply committed to health and fitness, with a strong focus on yoga, pilates, and other sports that inspire a balanced and active lifestyle. Through my platform, I aim to inspire others to live adventurously and maintain well-being, regardless of where their journeys take them.`}
              </p>
            </div>

            {/* Packages Section - EXACTLY like screenshot */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Packages</h3>
              
              {creator.packages && creator.packages.length > 0 ? (
                <>
                  {/* Package Tabs - EXACTLY like screenshot */}
                  <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
                                         {[
                       { id: 'all', label: 'All' },
                       { id: 'instagram', label: 'Instagram' },
                       { id: 'facebook', label: 'Facebook' }
                     ].map((tab) => (
                       <button
                         key={tab.id}
                         onClick={() => setActiveTab(tab.id as 'all' | 'instagram' | 'facebook')}
                         className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                           activeTab === tab.id
                             ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                             : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                         }`}
                       >
                         {tab.label}
                       </button>
                     ))}
                  </div>
                  
                  {/* Package List - EXACTLY like screenshot */}
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
                           checked={selectedPackage?.id === pkg.id}
                           onChange={() => setSelectedPackage(pkg)}
                           className="text-orange-500 focus:ring-orange-500"
                         />
                                <h4 className="font-semibold text-gray-900">{pkg.title}</h4>
                                <span className="text-2xl font-bold text-gray-900">
                                  {formatPrice(pkg.price, pkg.currency)}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm">{pkg.description}</p>
                              
                              {/* Package Details */}
                              {pkg.deliverables && (
                                <div className="mt-2 text-xs text-gray-500 space-y-1">
                                  {pkg.deliverables.platform && (
                                    <div>Platform: {pkg.deliverables.platform}</div>
                                  )}
                                  {pkg.deliverables.content_type && (
                                    <div>Content Type: {pkg.deliverables.content_type}</div>
                                  )}
                                  {pkg.deliverables.quantity && (
                                    <div>Quantity: {pkg.deliverables.quantity}</div>
                                  )}
                                  {pkg.deliverables.revisions && (
                                    <div>Revisions: {pkg.deliverables.revisions}</div>
                                  )}
                                  {(pkg.deliverables.duration1 || pkg.deliverables.duration2) && (
                                    <div>
                                      Duration: {pkg.deliverables.duration1} {pkg.deliverables.duration2}
                                    </div>
                                  )}
                                </div>
                              )}
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
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCartIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No packages available yet</p>
                  <p className="text-sm text-gray-400 mt-1">This creator hasn't published any packages</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Pricing & Call to Action - EXACTLY like screenshot */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-6">
              {selectedPackage ? (
                <>
                  {/* Price Display - EXACTLY like screenshot */}
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(selectedPackage.price, selectedPackage.currency)}
                    </span>
                  </div>
                  
                  {/* Package Selector - EXACTLY like screenshot */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{selectedPackage.title}</span>
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                  
                                     {/* Add to Cart Button - EXACTLY like screenshot */}
                   <button
                     onClick={() => handleAddToCart(selectedPackage)}
                     className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl mb-4"
                   >
                     Add to Cart
                   </button>
                  
                  {/* Custom Offer Link - EXACTLY like screenshot */}
                  <div className="text-center mb-4">
                    <button className="text-gray-700 text-sm hover:underline">
                      Can&apos;t find what you need? Send a Custom Offer
                    </button>
                  </div>
                  
                  {/* How it works Link - EXACTLY like screenshot */}
                  <div className="text-center">
                    <button className="text-gray-500 text-sm hover:text-gray-700 transition-colors flex items-center justify-center gap-2 mx-auto">
                      <span>?</span>
                      How does it work?
                    </button>
                  </div>
                </>
              ) : creator.packages && creator.packages.length > 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCartIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a package to view details and add to cart</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCartIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No packages available</p>
                  <p className="text-sm text-gray-400 mt-1">This creator hasn't published any packages yet</p>
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
                
                {creator.portfolio_items && creator.portfolio_items.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {creator.portfolio_items.map((item) => (
                      <div key={item.id} className="aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={item.media_url || '/assets/onboarding1.png'}
                          alt={item.title || 'Portfolio item'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <PhotoIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No portfolio items available</p>
                    <p className="text-sm text-gray-400 mt-1">This creator hasn't uploaded any portfolio items yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
