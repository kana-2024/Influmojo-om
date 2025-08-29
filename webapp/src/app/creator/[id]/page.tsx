'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShareIcon, 
  BookmarkIcon, 
  StarIcon, 
  ShoppingCartIcon,
  ChevronDownIcon,
  PhotoIcon,
  PlayIcon,
  UserIcon,
  XMarkIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { FaInstagram, FaYoutube, FaFacebook } from 'react-icons/fa';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
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
  const searchParams = useSearchParams();
  const creatorId = params.id as string;
  const fromLanding = searchParams.get('from') === 'landing';
  
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'instagram' | 'facebook' | 'youtube'>('all');
  const [selectedPackage, setSelectedPackage] = useState<CreatorProfile['packages'][0] | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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
           ...response.data.twitter || []
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
    
    // If coming from landing page, show signup modal instead of adding to cart
    if (fromLanding) {
      setShowSignupModal(true);
      return;
    }
    
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

  const handleSignupAsBrand = () => {
    sessionStorage.setItem('selectedUserType', 'brand');
    router.push('/get-started');
  };

  const handleLoginAsBrand = () => {
    router.push('/login');
  };

  const handleContactCreator = () => {
    if (fromLanding) {
      setShowSignupModal(true);
      return;
    }
    setShowContactModal(true);
  };

  const handleShareProfile = () => {
    setShowShareModal(true);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <FaInstagram className="w-4 h-4" />;
      case 'youtube':
        return <FaYoutube className="w-4 h-4" />;
      case 'facebook':
        return <FaFacebook className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'youtube':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'facebook':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const filteredPackages = creator?.packages?.filter(pkg => {
    if (activeTab === 'all') return true;
    return pkg.deliverables?.platform?.toLowerCase() === activeTab.toLowerCase();
  }) || [];

  const availablePlatforms = Array.from(new Set(
    creator?.packages?.map(pkg => pkg.deliverables?.platform?.toLowerCase()).filter((platform): platform is string => Boolean(platform)) || []
  ));

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
      {/* Landing Page Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/landing" className="flex items-center hover:opacity-80 transition-opacity">
              <Image 
                src="/assets/logo/Group.png" 
                alt="Influmojo" 
                width={120} 
                height={40}
                className="h-8 w-auto"
              />
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                How it works
              </button>
              <button className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Pricing
              </button>
              <button 
                onClick={() => router.push('/get-started')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign up as brand
              </button>
              <button 
                onClick={() => router.push('/signup-creator')}
                className="text-orange-500 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign up as Creator
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </button>
            </div>

            {/* Profile Icon */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">👤</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Creator's Visual Portfolio - Enhanced */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                {/* Portfolio Images - Use actual portfolio or placeholder */}
                {creator.portfolio_items && creator.portfolio_items.length > 0 ? (
                  creator.portfolio_items.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                      <Image
                        src={item.media_url || '/assets/onboarding1.png'}
                        alt={item.title || 'Portfolio item'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {index === 2 && creator.portfolio_items && creator.portfolio_items.length > 3 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center group-hover:bg-opacity-60 transition-all duration-300">
                          <button
                            onClick={() => setShowAllPhotos(true)}
                            className="text-white font-semibold flex items-center gap-2"
                          >
                            <PhotoIcon className="w-5 h-5" />
                            +{creator.portfolio_items.length - 3} More
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
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {index === 2 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center group-hover:bg-opacity-60 transition-all duration-300">
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

            {/* Creator Profile & Details - Enhanced */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
                  
                  <p className="text-gray-600 mb-3 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
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
                  
                  {/* Social Media Icons with Followers - Enhanced */}
                  <div className="flex items-center gap-3">
                    {creator.social_media_accounts && creator.social_media_accounts.length > 0 ? (
                      creator.social_media_accounts.slice(0, 3).map((account, index) => (
                        <button 
                          key={account.id || index}
                          className={`flex items-center gap-2 px-3 py-2 ${getPlatformColor(account.platform)} text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-md`}
                        >
                          {getPlatformIcon(account.platform)}
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
                         <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-md">
                           <FaInstagram className="w-4 h-4" />
                           <span className="text-sm font-medium">Instagram</span>
                         </button>
                         <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-md">
                           <FaYoutube className="w-4 h-4" />
                           <span className="text-sm font-medium">YouTube</span>
                         </button>
                         <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-md">
                           <FaFacebook className="w-4 h-4" />
                           <span className="text-sm font-medium">Facebook</span>
                         </button>
                       </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isFavorite 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isFavorite ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleShareProfile}
                    className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all duration-200"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleContactCreator}
                    className="p-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-all duration-200"
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Top Creator Badge - Enhanced */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <StarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-orange-900">{creator.name || 'Anastasiia'} is a Top Creator</h4>
                  <p className="text-sm text-orange-700">Top creators have completed multiple orders and have a high rating from brands.</p>
                </div>
              </div>
            </div>

            {/* Creator Bio - Enhanced */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
              <p className="text-gray-700 leading-relaxed">
                {creator.bio || `I am a professional model and travel blogger with a passion for exploring stunning destinations around the world and creating high-quality content. Alongside my work in fashion and travel, I am deeply committed to health and fitness, with a strong focus on yoga, pilates, and other sports that inspire a balanced and active lifestyle. Through my platform, I aim to inspire others to live adventurously and maintain well-being, regardless of where their journeys take them.`}
              </p>
              
              {/* Content Categories */}
              {creator.content_categories && creator.content_categories.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Content Categories:</h4>
                  <div className="flex flex-wrap gap-2">
                    {creator.content_categories.map((category, index) => (
                      <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Packages Section - Enhanced */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Packages</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4" />
                  <span>Average delivery: 3-5 days</span>
                </div>
              </div>
              
              {creator.packages && creator.packages.length > 0 ? (
                <>
                  {/* Package Tabs - Enhanced */}
                  <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
                    {[
                      { id: 'all', label: 'All', count: creator.packages.length },
                      ...availablePlatforms.map(platform => ({
                        id: platform,
                        label: platform.charAt(0).toUpperCase() + platform.slice(1),
                        count: creator.packages.filter(pkg => 
                          pkg.deliverables?.platform?.toLowerCase() === platform
                        ).length
                      }))
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                            : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                        }`}
                      >
                        {tab.label}
                        <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Package List - Enhanced */}
                  <div className="space-y-4">
                    {filteredPackages.length > 0 ? (
                      filteredPackages.map((pkg) => (
                        <div key={pkg.id} className="border border-gray-200 rounded-xl p-4 hover:border-orange-200 transition-all duration-200 hover:shadow-md">
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
                              <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
                              
                              {/* Package Details Grid */}
                              {pkg.deliverables && (
                                <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                                  {pkg.deliverables.platform && (
                                    <div className="flex items-center gap-2">
                                      <GlobeAltIcon className="w-4 h-4" />
                                      <span>{pkg.deliverables.platform}</span>
                                    </div>
                                  )}
                                  {pkg.deliverables.content_type && (
                                    <div className="flex items-center gap-2">
                                      <PhotoIcon className="w-4 h-4" />
                                      <span>{pkg.deliverables.content_type}</span>
                                    </div>
                                  )}
                                  {pkg.deliverables.quantity && (
                                    <div className="flex items-center gap-2">
                                      <CheckCircleIcon className="w-4 h-4" />
                                      <span>{pkg.deliverables.quantity} items</span>
                                    </div>
                                  )}
                                  {pkg.deliverables.revisions && (
                                    <div className="flex items-center gap-2">
                                      <ExclamationTriangleIcon className="w-4 h-4" />
                                      <span>{pkg.deliverables.revisions} revisions</span>
                                    </div>
                                  )}
                                  {(pkg.deliverables.duration1 || pkg.deliverables.duration2) && (
                                    <div className="flex items-center gap-2 col-span-2">
                                      <CalendarIcon className="w-4 h-4" />
                                      <span>
                                        Duration: {pkg.deliverables.duration1} {pkg.deliverables.duration2}
                                      </span>
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
                        <ShoppingCartIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No packages available for {activeTab === 'all' ? 'any platform' : activeTab}</p>
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

          {/* Right Column - Pricing & Call to Action - Enhanced */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
              {selectedPackage ? (
                <>
                  {/* Price Display - Enhanced */}
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(selectedPackage.price, selectedPackage.currency)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">One-time payment</p>
                  </div>
                  
                  {/* Package Selector - Enhanced Functional Dropdown */}
                  <div className="mb-6">
                    <div className="relative">
                      <button
                        onClick={() => setShowPackageDropdown(!showPackageDropdown)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <span className="font-medium text-gray-900">{selectedPackage.title}</span>
                        <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                          showPackageDropdown ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {showPackageDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          {filteredPackages.map((pkg) => (
                            <button
                              key={pkg.id}
                              onClick={() => {
                                setSelectedPackage(pkg);
                                setShowPackageDropdown(false);
                              }}
                              className={`w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                selectedPackage?.id === pkg.id ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                              }`}
                            >
                              <div className="font-medium">{pkg.title}</div>
                              <div className="text-sm text-gray-500">
                                {formatPrice(pkg.price, pkg.currency)}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Package Summary */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Package includes:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedPackage.deliverables?.platform && (
                        <li className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span>{selectedPackage.deliverables.platform} content</span>
                        </li>
                      )}
                      {selectedPackage.deliverables?.content_type && (
                        <li className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span>{selectedPackage.deliverables.content_type}</span>
                        </li>
                      )}
                      {selectedPackage.deliverables?.quantity && (
                        <li className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span>{selectedPackage.deliverables.quantity} items</span>
                        </li>
                      )}
                      {selectedPackage.deliverables?.revisions && (
                        <li className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span>{selectedPackage.deliverables.revisions} revisions included</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Add to Cart Button - Enhanced */}
                  <button
                    onClick={() => handleAddToCart(selectedPackage)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl mb-4"
                  >
                    <ShoppingCartIcon className="w-5 h-5 inline mr-2" />
                    Add to Cart
                  </button>
                  
                  {/* Custom Offer Link - Enhanced */}
                  <div className="text-center mb-4">
                    <button className="text-gray-700 text-sm hover:text-orange-600 transition-colors">
                      Can&apos;t find what you need? Send a Custom Offer
                    </button>
                  </div>
                  
                  {/* How it works Link - Enhanced */}
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
            <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">All Photos</h3>
                  <button
                    onClick={() => setShowAllPhotos(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                {creator.portfolio_items && creator.portfolio_items.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {creator.portfolio_items.map((item) => (
                      <div key={item.id} className="aspect-square rounded-xl overflow-hidden">
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

      {/* Contact Creator Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                  <ChatBubbleLeftIcon className="h-6 w-6 text-orange-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Contact {creator.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-6">
                  Send a message to discuss collaboration opportunities or ask questions about their services.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/dashboard/brand/messages')}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Send Message
                  </button>
                  
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                
                <button
                  onClick={() => setShowContactModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Profile Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                  <ShareIcon className="h-6 w-6 text-orange-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Share {creator.name}&apos;s Profile
                </h3>
                
                <p className="text-sm text-gray-600 mb-6">
                  Share this creator&apos;s profile with your team or on social media.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Profile link copied to clipboard!');
                      setShowShareModal(false);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Copy Link
                  </button>
                  
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                
                <button
                  onClick={() => setShowShareModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal for Landing Page Users */}
      {showSignupModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                  <ShoppingCartIcon className="h-6 w-6 text-orange-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to collaborate with {creator.name}?
                </h3>
                
                <p className="text-sm text-gray-600 mb-6">
                  To add packages to your cart and start collaborating with creators, you need to create a brand account.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleSignupAsBrand}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Sign up as Brand
                  </button>
                  
                  <button
                    onClick={handleLoginAsBrand}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Already have an account? Login
                  </button>
                </div>
                
                <button
                  onClick={() => setShowSignupModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showPackageDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowPackageDropdown(false)}
        />
      )}
    </div>
  );
}
