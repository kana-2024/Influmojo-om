'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  HomeIcon,
  ListBulletIcon,
  CubeIcon,
  BriefcaseIcon,
  WalletIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  StarIcon,
  EnvelopeIcon,
  ShoppingCartIcon,
  BellIcon,
  MagnifyingGlassIcon,

  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { FaFacebook, FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import { profileAPI } from '@/services/apiService';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
}

interface Creator {
  id: string;
  name: string;
  platform?: string;
  profilePicture?: string;
  profile_image?: string;
  fullName?: string;
  followers?: number | string;
  follower_count?: number;
  engagement_rate?: number;
  verified?: boolean;
  rating?: number;
  categories?: string[];
  social_media_accounts?: Array<{
    platform: string;
    follower_count: number;
  }>;
  gender?: string;
  age?: number;
  response_time?: string;
  bio?: string;
  description?: string;
  content_categories?: string[];
  location?: string;
  price?: number;
}

const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon, href: '/dashboard/brand' },
  { id: 'dashboard', label: 'Dashboard', icon: CubeIcon, href: '/dashboard/brand' },
  { id: 'campaigns', label: 'Campaigns', icon: BriefcaseIcon, href: '/dashboard/brand/campaigns' },
  { id: 'orderList', label: 'Order List', icon: ListBulletIcon, href: '/dashboard/brand/orders' },
  { id: 'portfolio', label: 'Portfolio', icon: DocumentTextIcon, href: '/dashboard/brand' },
  { id: 'reviews', label: 'Reviews', icon: StarIcon, href: '/dashboard/brand' },
  { id: 'chat', label: 'Chat', icon: EnvelopeIcon, href: '/dashboard/brand' },
  { id: 'wallet', label: 'Wallet', icon: WalletIcon, href: '/dashboard/brand' },
  { id: 'helpCenter', label: 'Help Center', icon: DocumentTextIcon, href: '/dashboard/brand' },
  { id: 'privacyPolicy', label: 'Privacy Policy', icon: DocumentTextIcon, href: '/dashboard/brand' },
  { id: 'supportTickets', label: 'Support Tickets', icon: DocumentTextIcon, href: '/dashboard/brand' },
  { id: 'termsOfService', label: 'Terms Of Service', icon: DocumentTextIcon, href: '/dashboard/brand' },
  { id: 'paymentHistory', label: 'Payment History', icon: DocumentTextIcon, href: '/dashboard/brand' },
  { id: 'accountSettings', label: 'Account Settings', icon: UserIcon, href: '/dashboard/brand' },
];

const filterChips = [
  { label: 'Rising Stars', icon: SparklesIcon, color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Most Viewed', icon: UserGroupIcon, color: 'bg-blue-100 text-blue-700' },
  { label: 'Trending', icon: FireIcon, color: 'bg-orange-100 text-orange-700' },
  { label: 'Under $250', icon: CurrencyDollarIcon, color: 'bg-green-100 text-green-700' },
  { label: 'Fast Turnover', icon: BoltIcon, color: 'bg-purple-100 text-purple-700' },
  { label: 'Top', icon: TrophyIcon, color: 'bg-pink-100 text-pink-700' },
];

export default function CreatorDiscoveryPage() {
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   
  // Get platform from URL search params
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchCategory, setSearchCategory] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [pageTitle, setPageTitle] = useState<string>('All Creators');
  const [pageDescription, setPageDescription] = useState<string>('Hire top influencers across all platforms');

     const applyFilters = useCallback(() => {
     console.log('Applying filters with:', { selectedPlatform, searchCategory, selectedFilters });
     console.log('Total creators:', creators.length);
     console.log('Sample creator platforms:', creators.slice(0, 3).map(c => ({ id: c.id, platform: c.platform, type: typeof c.platform })));
     
     let filtered = [...creators];

         // Platform filter
     if (selectedPlatform !== 'all') {
       console.log(`Filtering by platform: ${selectedPlatform}`);
       const beforeFilter = filtered.length;
       filtered = filtered.filter(creator => {
         const creatorPlatform = creator.platform;
         if (!creatorPlatform || typeof creatorPlatform !== 'string') {
           console.log(`Creator ${creator.id} has invalid platform:`, creatorPlatform);
           return false;
         }
         const matches = creatorPlatform.toLowerCase() === selectedPlatform.toLowerCase();
         console.log(`Creator ${creator.id} platform: ${creatorPlatform}, matches: ${matches}`);
         return matches;
       });
       console.log(`Platform filter: ${beforeFilter} -> ${filtered.length} creators`);
     }

    // Category search
    if (searchCategory.trim()) {
      const searchTerm = searchCategory.toLowerCase();
      filtered = filtered.filter(creator => 
        creator.categories?.some(cat => cat.toLowerCase().includes(searchTerm)) ||
        creator.content_categories?.some(cat => cat.toLowerCase().includes(searchTerm)) ||
        creator.bio?.toLowerCase().includes(searchTerm) ||
        creator.description?.toLowerCase().includes(searchTerm)
      );
    }

         // Additional filters
     if (selectedFilters.includes('Under $250')) {
       filtered = filtered.filter(creator => (creator.price || 0) <= 250);
     }
     if (selectedFilters.includes('Fast Turnover')) {
       filtered = filtered.filter(creator => 
         creator.response_time?.toLowerCase()?.includes('fast') ||
         creator.response_time?.toLowerCase()?.includes('24h')
       );
     }
     if (selectedFilters.includes('Top')) {
       filtered = filtered.filter(creator => creator.verified === true);
     }

    setFilteredCreators(filtered);
  }, [creators, selectedPlatform, searchCategory, selectedFilters]);

  // Get platform from URL search params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const platform = urlParams.get('platform');
    
    if (platform && platform !== 'all') {
      setSelectedPlatform(platform);
      updatePageTitle(platform);
    }
  }, []);

  useEffect(() => {
    fetchCreators();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

    const fetchCreators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await profileAPI.getCreators();
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        // Flatten all creators from different platforms into one array
        const allCreators: Creator[] = [];
        
                 if (response.data.youtube) {
           console.log('YouTube creators:', response.data.youtube);
           const youtubeCreators = response.data.youtube.map((creator: Partial<Creator>) => ({
             ...creator,
             platform: 'youtube'
           }));
           allCreators.push(...youtubeCreators);
         }
         if (response.data.instagram) {
           console.log('Instagram creators:', response.data.instagram);
           const instagramCreators = response.data.instagram.map((creator: Partial<Creator>) => ({
             ...creator,
             platform: 'instagram'
           }));
           allCreators.push(...instagramCreators);
         }
         if (response.data.facebook) {
           console.log('Facebook creators:', response.data.facebook);
           const facebookCreators = response.data.facebook.map((creator: Partial<Creator>) => ({
             ...creator,
             platform: 'facebook'
           }));
           allCreators.push(...facebookCreators);
         }
         if (response.data.twitter) {
           console.log('Twitter creators:', response.data.twitter);
           const twitterCreators = response.data.twitter.map((creator: Partial<Creator>) => ({
             ...creator,
             platform: 'twitter'
           }));
           allCreators.push(...twitterCreators);
         }
         if (response.data.tiktok) {
           console.log('TikTok creators:', response.data.tiktok);
           const tiktokCreators = response.data.tiktok.map((creator: Partial<Creator>) => ({
             ...creator,
             platform: 'tiktok'
           }));
           allCreators.push(...tiktokCreators);
         }
        
                 console.log('All creators:', allCreators);
         console.log('Sample creator platform field:', allCreators[0]?.platform);
         setCreators(allCreators);
      } else {
        setCreators([]);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
      setError('Failed to load creators');
      setCreators([]);
    } finally {
      setLoading(false);
    }
  }

   const handleFilterToggle = (filterLabel: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterLabel) 
        ? prev.filter(f => f !== filterLabel)
        : [...prev, filterLabel]
    );
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleCreatorClick = (creatorId: string) => {
    router.push(`/dashboard/brand/creator/${creatorId}`);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const formatFollowerCount = (count: number | string | undefined): string => {
    if (count === undefined || count === null) return '0';
    const num = typeof count === 'string' ? parseInt(count) || 0 : count;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPlatformIcon = (platform?: string) => {
    if (!platform || typeof platform !== 'string') return FaInstagram;
    switch (platform.toLowerCase()) {
      case 'youtube': return FaYoutube;
      case 'instagram': return FaInstagram;
      case 'facebook': return FaFacebook;
      case 'tiktok': return FaTiktok;
      default: return FaInstagram;
    }
  };

  const getPlatformColor = (platform?: string) => {
    if (!platform || typeof platform !== 'string') return 'bg-gray-500';
    switch (platform.toLowerCase()) {
      case 'youtube': return 'bg-red-500';
      case 'instagram': return 'bg-pink-500';
      case 'facebook': return 'bg-blue-500';
      case 'tiktok': return 'bg-black';
      default: return 'bg-gray-500';
    }
  };

  const updatePageTitle = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        setPageTitle('Hire Creators');
        setPageDescription('Hire top influencers and content creators');
        break;
      case 'instagram':
        setPageTitle('Instagram Creators');
        setPageDescription('Hire top Instagram influencers and content creators');
        break;
      case 'facebook':
        setPageTitle('Facebook Creators');
        setPageDescription('Hire top Facebook influencers and content creators');
        break;
      case 'tiktok':
        setPageTitle('TikTok Creators');
        setPageDescription('Hire top TikTok influencers and content creators');
        break;
      default:
        setPageTitle('All Creators');
        setPageDescription('Hire top influencers across all platforms');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading creators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left Sidebar Navigation */}
      <div className="w-full lg:w-64 bg-white shadow-lg lg:fixed lg:h-full overflow-y-auto z-50 lg:z-auto">
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">in</span>
            </div>
            <span className="text-lg lg:text-xl font-bold text-gray-900">influ mojo</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="text-sm lg:text-base font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4 lg:relative lg:mx-4 lg:mb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-sm lg:text-base font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 lg:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs lg:text-sm">in</span>
              </div>
              <span className="text-lg lg:text-xl font-bold text-gray-900">influ mojo</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Shopping Cart */}
              <div className="relative">
                <ShoppingCartIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <BellIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center">
                  1
                </span>
              </div>
              
              {/* Profile */}
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 lg:py-6">
                     {/* Hero Section */}
           <div className="text-center mb-8">
             <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
               {pageTitle}
             </h1>
             <p className="text-lg text-gray-600 max-w-3xl mx-auto">
               {pageDescription}
             </p>
           </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Platforms</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              {/* Category Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  placeholder="Enter keywords, niches or categories"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Search
                </button>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-3">
              {filterChips.map((chip) => {
                const Icon = chip.icon;
                const isSelected = selectedFilters.includes(chip.label);
                return (
                  <button
                    key={chip.label}
                    onClick={() => handleFilterToggle(chip.label)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                      isSelected 
                        ? chip.color 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Section */}
          <div className="mb-6">
                         <div className="flex items-center justify-between mb-4">
               <div>
                 <h2 className="text-2xl font-bold text-gray-900">
                   {selectedPlatform === 'all' ? 'Featured' : `${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Creators`}
                 </h2>
                 <p className="text-gray-600">
                   {selectedPlatform === 'all' ? 'Hire top influencers across all platforms' : `Top ${selectedPlatform} influencers and content creators`}
                 </p>
               </div>
               <div className="text-sm text-gray-500">
                 {filteredCreators.length} creators found
               </div>
             </div>

            {/* Creator Cards Grid */}
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={fetchCreators}
                  className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredCreators.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No creators found matching your criteria</p>
                <button
                  onClick={() => {
                    setSelectedPlatform('all');
                    setSearchCategory('');
                    setSelectedFilters([]);
                  }}
                  className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCreators.map((creator) => {
                  const PlatformIcon = getPlatformIcon(creator.platform);
                  const platformColor = getPlatformColor(creator.platform);
                  
                  return (
                    <div
                      key={creator.id}
                      onClick={() => handleCreatorClick(creator.id)}
                      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="relative">
                        <Image 
                          src={creator.profile_image || creator.profilePicture || "/assets/onboarding1.png"} 
                          alt={creator.name || creator.fullName || "Creator"} 
                          width={400}
                          height={192}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center hidden">
                          <span className="text-6xl">🏔️</span>
                        </div>
                        
                        {/* Platform Icon */}
                        <div className={`absolute top-3 left-3 w-8 h-8 ${platformColor} rounded-full flex items-center justify-center`}>
                          <PlatformIcon className="w-4 h-4 text-white" />
                        </div>
                        
                                                 {/* Verification Badge */}
                         {creator.verified === true && (
                           <div className="absolute top-3 right-3 bg-black text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                             <TrophyIcon className="w-3 h-3" />
                             Top Creator
                           </div>
                         )}
                        
                        {/* Fast Response Badge */}
                        {creator.response_time?.toLowerCase().includes('fast') && (
                          <div className="absolute top-12 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <BoltIcon className="w-3 h-3" />
                            Responds Fast
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        {/* Creator Info */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 text-sm">
                            {creator.name || creator.fullName || 'Unknown Creator'}
                          </h3>
                          {creator.rating && (
                            <div className="flex items-center gap-1">
                              <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{creator.rating}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Categories */}
                        <p className="text-gray-600 text-xs mb-2">
                          {creator.categories?.slice(0, 2).join(', ') || creator.content_categories?.slice(0, 2).join(', ') || 'Content Creator'}
                        </p>
                        
                        {/* Location */}
                        {creator.location && (
                          <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                            <MapPinIcon className="w-3 h-3" />
                            {creator.location}
                          </div>
                        )}
                        
                        {/* Stats and Price */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs">
                            <span className="font-semibold text-gray-900">
                              {formatFollowerCount(creator.follower_count)} followers
                            </span>
                            {creator.engagement_rate && (
                              <span className="text-gray-500 ml-2">• {creator.engagement_rate}% engagement</span>
                            )}
                          </div>
                          {creator.price && (
                            <div className="text-right">
                              <span className="text-lg font-bold text-orange-600">${creator.price}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
