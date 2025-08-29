'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaFacebook, FaYoutube, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';
import { profileAPI } from '@/services/apiService';
import EnvDebug from '@/components/EnvDebug';

interface Creator {
  id: string;
  name: string;
  platform: string;
  profilePicture?: string;
  profile_image?: string;
  fullName?: string;
  followers?: number | string;
  follower_count: number;
  engagement_rate: number;
  verified: boolean;
  rating?: number;
  social_media_accounts?: Array<{
    platform: string;
    follower_count: number;
    engagement_rate?: number;
    avg_views?: number;
    verified?: boolean;
    content_categories?: string[];
  }>;
  gender?: string;
  age?: number;
  response_time?: string;
  bio?: string;
  description?: string;
  content_categories?: string[];
  categories?: string[];
  location?: string;
  price?: number;
}

export default function LandingPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for creators data
  const [creators, setCreators] = useState<{
    youtube: Creator[];
    instagram: Creator[];
    facebook: Creator[];
    twitter: Creator[];
    tiktok: Creator[];
  }>({
    youtube: [],
    instagram: [],
    facebook: [],
    twitter: [],
    tiktok: []
  });
  const [creatorsLoading, setCreatorsLoading] = useState(true);
  const [creatorsError, setCreatorsError] = useState<string | null>(null);

  // Fetch creators on component mount
  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setCreatorsLoading(true);
      setCreatorsError(null);
      
      console.log('🔍 Fetching creators for landing page...');
      const response = await profileAPI.getPublicCreators();
      
      if (response.success && response.data) {
        console.log('✅ Creators fetched successfully:', {
          youtube: response.data.youtube?.length || 0,
          instagram: response.data.instagram?.length || 0,
          facebook: response.data.facebook?.length || 0,
          twitter: response.data.twitter?.length || 0,
          tiktok: response.data.tiktok?.length || 0
        });
        
        setCreators(response.data);
      } else {
        console.error('❌ Failed to fetch creators:', response.error);
        setCreatorsError(response.error || 'Failed to fetch creators');
      }
    } catch (err) {
      console.error('❌ Error loading creators:', err);
      setCreatorsError('Network error occurred');
    } finally {
      setCreatorsLoading(false);
    }
  };

  // Helper function to render creator card
  const renderCreatorCard = (creator: Creator, platform: string) => {
    const platformColors = {
      youtube: 'bg-red-500',
      instagram: 'bg-pink-500',
      facebook: 'bg-blue-500',
      twitter: 'bg-blue-400',
      tiktok: 'bg-black'
    };

    const platformIcons = {
      youtube: FaYoutube,
      instagram: FaInstagram,
      facebook: FaFacebook,
      twitter: FaTwitter,
      tiktok: FaTiktok
    };

    const IconComponent = platformIcons[platform as keyof typeof platformIcons] || FaInstagram;

    // Get follower count for the specific platform
    const getFollowerCount = () => {
      if (creator.social_media_accounts && Array.isArray(creator.social_media_accounts)) {
        const account = creator.social_media_accounts.find((acc: { platform: string; follower_count: number }) => 
          acc.platform?.toLowerCase() === platform.toLowerCase()
        );
        return account?.follower_count || 0;
      }
      return creator.followers || '0';
    };

    const formatFollowerCount = (count: number | string) => {
      const num = typeof count === 'string' ? parseInt(count) : count;
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };

    // Get content categories for the specific platform
    const getContentCategories = () => {
      if (creator.social_media_accounts && Array.isArray(creator.social_media_accounts)) {
        const account = creator.social_media_accounts.find((acc) => 
          acc.platform?.toLowerCase() === platform.toLowerCase()
        );
        return account?.content_categories || creator.content_categories || [];
      }
      return creator.content_categories || [];
    };

    return (
      <div key={creator.id} className="flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-96 xl:w-[400px] 2xl:w-[440px] 3xl:w-[480px] 4xl:w-[520px] bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" onClick={() => router.push(`/creator/${creator.id}?from=landing`)}>
        <div className="relative">
          <Image 
            src={creator.profile_image || creator.profilePicture || "/assets/onboarding1.png"} 
            alt={creator.name || creator.fullName || "Creator"} 
            width={580}
            height={360}
            className="w-full h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 2xl:h-80 3xl:h-88 4xl:h-96 object-cover"
          />
          
          {/* Platform Icon - Top Left (Enhanced) */}
          <div className={`absolute top-3 sm:top-4 left-3 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${platformColors[platform as keyof typeof platformColors] || 'bg-gray-500'} rounded-full flex items-center justify-center shadow-lg border-2 border-white`}>
            <IconComponent className="text-white text-sm sm:text-lg md:text-xl" />
          </div>
          
          {/* Content Count - Bottom Left (Enhanced) */}
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-xl px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-3 flex items-center gap-1 sm:gap-2 shadow-lg border border-gray-100">
            <span className="text-gray-600 text-xs sm:text-sm">📷</span>
            <span className="text-gray-700 text-xs sm:text-sm font-semibold">5 IMAGES</span>
            <span className="text-red-500 text-sm sm:text-lg font-bold">+</span>
          </div>
          
          {/* Heart Icon - Bottom Right (Enhanced) */}
          <button 
            className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-all duration-200 border border-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite functionality
            }}
          >
            <span className="text-red-500 text-lg sm:text-xl md:text-2xl">❤</span>
          </button>
        </div>
          
        <div className="p-2 sm:p-3 md:p-4 lg:p-5">
          {/* Left Content Section */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2 lg:gap-3 mb-2 lg:mb-3">
            <div className="flex-1">
              {/* Creator Name and Description */}
              <div className="mb-1 lg:mb-2">
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 mb-1">
                  {creator.name || creator.fullName || 'Unknown Creator'}
                </h3>
                <p className="text-xs sm:text-sm md:text-base lg:text-base text-gray-600">
                  {creator.bio || creator.description || 'A Talented Influencer'}
                </p>
              </div>
              
              {/* Content Categories */}
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-1 lg:mb-2">
                {getContentCategories().slice(0, 3).map((category: string, index: number) => (
                  <span key={index} className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full border border-gray-200 font-medium">
                    {category}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Right Content Section - Rating and Stats */}
            <div className="flex flex-row lg:flex-col items-start lg:items-end gap-2 lg:gap-3 lg:ml-4">
              {/* Date */}
              <div className="text-left lg:text-right">
                <div className="text-xs sm:text-sm text-gray-500">Sep 19, 2023</div>
              </div>
              
              {/* Category Tag */}
              <div className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {getContentCategories()[0] || 'FASHION'}
              </div>
              
              {/* Star Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`text-sm sm:text-base md:text-lg ${star <= (creator.rating || 3) ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ⭐
                  </span>
                ))}
              </div>
              
              {/* Response Time */}
              <div className="text-left lg:text-right">
                <div className="text-xs sm:text-sm font-semibold text-gray-700">
                  Response Time: <span className="font-bold">{creator.response_time || '1Hr'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EnvDebug />
      {/* Header - Matching the screenshot */}
      <nav className="bg-white shadow-sm border-b">
        <div className="w-[88%] max-w-[1600px] mx-auto content-width-responsive">
                      <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link href="/landing" className="flex items-center hover:opacity-80 transition-opacity">
              <Image 
                src="/assets/logo/Group.png" 
                alt="Influmojo" 
                width={120} 
                height={40}
                className="h-6 sm:h-8 w-auto"
              />
            </Link>

            {/* Navigation Links - Matching the screenshot */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
              <button 
                onClick={() => {
                  // Scroll to how it works section or navigate to dedicated page
                  const howItWorksSection = document.getElementById('how-it-works');
                  if (howItWorksSection) {
                    howItWorksSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium cursor-pointer transition-colors"
              >
                How it works
              </button>
              <button 
                onClick={() => {
                  // Scroll to pricing section or navigate to dedicated page
                  const pricingSection = document.getElementById('pricing');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => {
                  sessionStorage.setItem('selectedUserType', 'brand');
                  router.push('/get-started');
                }}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors"
              >
                Sign up as brand
              </button>
              <button 
                onClick={() => {
                  sessionStorage.setItem('selectedUserType', 'creator');
                  router.push('/get-started');
                }}
                className="text-orange-500 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors"
              >
                Sign up as Creator
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors"
              >
                Login
              </button>
            </div>

            {/* Profile Icon - Matching the screenshot */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">👤</span>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button 
                onClick={() => {
                  const howItWorksSection = document.getElementById('how-it-works');
                  if (howItWorksSection) {
                    howItWorksSection.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                How it works
              </button>
              <button 
                onClick={() => {
                  const pricingSection = document.getElementById('pricing');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => {
                  sessionStorage.setItem('selectedUserType', 'brand');
                  router.push('/get-started');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Sign up as brand
              </button>
              <button 
                onClick={() => {
                  sessionStorage.setItem('selectedUserType', 'creator');
                  router.push('/get-started');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                Sign up as Creator
              </button>
              <button 
                onClick={() => {
                  router.push('/login');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

             {/* Main Content - Same as Brand Home */}
       <main className="w-[88%] max-w-[1600px] mx-auto py-4 sm:py-6 lg:py-8 content-width-responsive">
         <div className="space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10 2xl:space-y-12 3xl:space-y-16 4xl:space-y-20">
          {/* Welcome Header */}
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl 3xl:text-7xl 4xl:text-8xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 xl:mb-6 2xl:mb-8 3xl:mb-10 4xl:mb-12">Discover Amazing Creators</h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl 4xl:text-5xl text-gray-600 w-[88%] max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px] 3xl:max-w-[1400px] 4xl:max-w-[1600px] mx-auto">
              Connect with talented content creators across all major social media platforms. 
              Find the perfect match for your brand campaigns.
            </p>
          </div>

                     {/* Search and Filter Section */}
                       <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 xl:gap-6 2xl:gap-8 3xl:gap-10 4xl:gap-12 w-[88%] max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px] 3xl:max-w-[1400px] 4xl:max-w-[1600px] mx-auto">
            {/* Search Bar */}
            <div className="flex-1 relative min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search Creators"
                className="block w-full pl-10 pr-3 py-2 sm:py-3 lg:py-4 border border-orange-200 rounded-lg text-sm lg:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
              />
            </div>
            
            {/* Filter Button */}
            <button className="px-3 sm:px-4 py-2 sm:py-3 lg:py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center flex-shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

                     {/* Categories Section */}
           <div className="space-y-2 sm:space-y-3 lg:space-y-4">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900 flex-shrink-0">Categories</h2>
              <button 
                onClick={() => router.push('/dashboard/brand/creators')}
                className="bg-orange-500 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg text-sm lg:text-base font-medium hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0"
              >
                View All
              </button>
            </div>
            
            <div className="relative">
              {/* Navigation Buttons */}
              <button 
                onClick={() => {
                  const container = document.getElementById('categories-container');
                  if (container) {
                    container.scrollLeft -= 600;
                  }
                }}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={() => {
                  const container = document.getElementById('categories-container');
                  if (container) {
                    container.scrollLeft += 600;
                  }
                }}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div 
                id="categories-container"
                className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 2xl:gap-8 3xl:gap-10 4xl:gap-12 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Fashion Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <Image 
                    src="/assets/fashion.jpg" 
                    alt="Fashion" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Fashion</p>
                  </div>
                </div>
               
                {/* Trainer Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <Image 
                    src="/assets/trainer.jpg" 
                    alt="Trainer" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base lg:text-lg">Trainer</p>
                  </div>
                </div>
               
                {/* Yoga Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <Image 
                    src="/assets/yoga.jpg" 
                    alt="Yoga" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Yoga</p>
                  </div>
                </div>
               
                {/* Business Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <Image 
                    src="/assets/business.jpg" 
                    alt="Business" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Business</p>
                  </div>
                </div>

                {/* Beauty Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <Image 
                    src="/assets/beauty.jpg" 
                    alt="Beauty" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Beauty</p>
                  </div>
                </div>

                {/* Gaming Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">🎮</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Gaming</p>
                  </div>
                </div>

                {/* Travel Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">✈️</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Travel</p>
                  </div>
                </div>

                {/* Food Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">🍕</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Food</p>
                  </div>
                </div>

                {/* Education Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">📚</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Education</p>
                  </div>
                </div>

                {/* Pet Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">🐕</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Pet</p>
                  </div>
                </div>

                {/* Sports & Fitness Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">⚽</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Sports & Fitness</p>
                  </div>
                </div>

                {/* Lifestyle Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">🌟</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Lifestyle</p>
                  </div>
                </div>

                {/* Entertainment Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">🎬</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Entertainment</p>
                  </div>
                </div>

                {/* Tech Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">💻</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Tech</p>
                  </div>
                </div>

                {/* Photography Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">📸</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Photography</p>
                  </div>
                </div>

                {/* Healthcare Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">🏥</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Healthcare</p>
                  </div>
                </div>

                {/* Finance Category */}
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">💰</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-xs sm:text-sm md:text-base">Finance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

                     {/* YouTube Creators Section */}
                       <div className="space-y-2 sm:space-y-3">
                          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-3">
                                   <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <FaYoutube className="text-white text-sm sm:text-lg" />
                  </div>
                 <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 flex-shrink-0">Youtube Influencers</h2>
               </div>
               <button 
                 onClick={() => router.push('/dashboard/brand/creators?platform=youtube')}
                 className="text-gray-900 hover:text-gray-700 text-sm font-medium transition-colors flex-shrink-0"
               >
                 view all
               </button>
             </div>
            
            <div className="relative">
              {/* Navigation Buttons */}
              <button 
                onClick={() => {
                  const container = document.getElementById('youtube-creators-container');
                  if (container) {
                    container.scrollLeft -= 600;
                  }
                }}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={() => {
                  const container = document.getElementById('youtube-creators-container');
                  if (container) {
                    container.scrollLeft += 600;
                  }
                }}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div 
                id="youtube-creators-container"
                className="flex gap-2 sm:gap-3 md:gap-3 lg:gap-4 xl:gap-6 2xl:gap-8 3xl:gap-10 4xl:gap-12 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {creatorsLoading ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <span className="ml-2 text-gray-600">Loading creators...</span>
                  </div>
                ) : creatorsError ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <span className="text-red-500">Error loading creators: {creatorsError}</span>
                  </div>
                ) : creators.youtube && creators.youtube.length > 0 ? (
                  creators.youtube.map((creator: Creator) => renderCreatorCard(creator, 'youtube'))
                ) : (
                  <div className="flex items-center justify-center w-full py-8">
                    <span className="text-gray-500">No YouTube creators found</span>
                  </div>
                )}
              </div>
            </div>
          </div>

                     {/* Instagram Creators Section */}
           <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-3">
                                   <div className="w-6 h-6 sm:w-8 sm:h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <FaInstagram className="text-white text-sm sm:text-lg" />
                  </div>
                 <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 flex-shrink-0">Instagram Influencers</h2>
               </div>
               <button 
                 onClick={() => router.push('/dashboard/brand/creators?platform=instagram')}
                 className="text-gray-900 hover:text-gray-700 text-sm font-medium transition-colors flex-shrink-0"
               >
                 view all
               </button>
             </div>
            
            <div className="relative">
              {/* Navigation Buttons */}
              <button 
                onClick={() => {
                  const container = document.getElementById('instagram-creators-container');
                  if (container) {
                    container.scrollLeft -= 600;
                  }
                }}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={() => {
                  const container = document.getElementById('instagram-creators-container');
                  if (container) {
                    container.scrollLeft += 600;
                  }
                }}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div 
                id="instagram-creators-container"
                className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {creatorsLoading ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <span className="ml-2 text-gray-600">Loading creators...</span>
                  </div>
                ) : creatorsError ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <span className="text-red-500">Error loading creators: {creatorsError}</span>
                  </div>
                ) : creators.instagram && creators.instagram.length > 0 ? (
                  creators.instagram.map((creator: Creator) => renderCreatorCard(creator, 'instagram'))
                ) : (
                  <div className="flex items-center justify-center w-full py-8">
                    <span className="text-gray-500">No Instagram creators found</span>
                  </div>
                )}
              </div>
            </div>
          </div>

                     {/* Facebook Creators Section */}
           <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-3">
                                   <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <FaFacebook className="text-white text-sm sm:text-lg" />
                  </div>
                 <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 flex-shrink-0">Facebook Influencers</h2>
               </div>
               <button 
                 onClick={() => router.push('/dashboard/brand/creators?platform=facebook')}
                 className="text-gray-900 hover:text-gray-700 text-sm font-medium transition-colors flex-shrink-0"
               >
                 view all
               </button>
             </div>
            
            <div className="relative">
              {/* Navigation Buttons */}
              <button 
                onClick={() => {
                  const container = document.getElementById('facebook-creators-container');
                  if (container) {
                    container.scrollLeft -= 600;
                  }
                }}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={() => {
                  const container = document.getElementById('facebook-creators-container');
                  if (container) {
                    container.scrollLeft += 600;
                  }
                }}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div 
                id="facebook-creators-container"
                className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {creatorsLoading ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <span className="ml-2 text-gray-600">Loading creators...</span>
                  </div>
                ) : creatorsError ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <span className="text-red-500">Error loading creators: {creatorsError}</span>
                  </div>
                ) : creators.facebook && creators.facebook.length > 0 ? (
                  creators.facebook.map((creator: Creator) => renderCreatorCard(creator, 'facebook'))
                ) : (
                  <div className="flex items-center justify-center w-full py-8">
                    <span className="text-gray-500">No Facebook creators found</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div id="how-it-works" className="text-center py-4 sm:py-6 md:py-8 lg:py-12">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 3xl:gap-16 4xl:gap-20 w-[88%] max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] 3xl:max-w-[1600px] 4xl:max-w-[1800px] mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <span className="text-2xl lg:text-3xl">1️⃣</span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">Create Your Profile</h3>
                <p className="text-gray-600 text-sm lg:text-base">Set up your brand or creator profile with your preferences and requirements.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <span className="text-2xl lg:text-3xl">2️⃣</span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">Find Your Match</h3>
                <p className="text-gray-600 text-sm lg:text-base">Discover creators that align with your brand or find campaigns that match your style.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <span className="text-2xl lg:text-3xl">3️⃣</span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">Collaborate & Grow</h3>
                <p className="text-gray-600 text-sm lg:text-base">Start your collaboration and watch your brand or creator career flourish.</p>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div id="pricing" className="text-center py-4 sm:py-6 md:py-8 lg:py-12 bg-gray-50 rounded-2xl">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Simple, Transparent Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 3xl:gap-16 4xl:gap-20 w-[88%] max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] 3xl:max-w-[1600px] 4xl:max-w-[1800px] mx-auto">
              <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 lg:mb-3">For Brands</h3>
                <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">Connect with creators and run successful campaigns</p>
                <ul className="text-left text-gray-600 space-y-2 lg:space-y-3 mb-4 lg:mb-6 text-sm lg:text-base">
                  <li>• Free profile creation</li>
                  <li>• Access to creator database</li>
                  <li>• Campaign management tools</li>
                  <li>• Secure payment processing</li>
                </ul>
                <p className="text-2xl lg:text-3xl font-bold text-orange-600">Commission-based</p>
              </div>
              <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 lg:mb-3">For Creators</h3>
                <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">Monetize your content and grow your audience</p>
                <ul className="text-left text-gray-600 space-y-2 lg:space-y-3 mb-4 lg:mb-6 text-sm lg:text-base">
                  <li>• Free profile creation</li>
                  <li>• Campaign discovery</li>
                  <li>• Portfolio showcase</li>
                  <li>• Direct brand connections</li>
                </ul>
                <p className="text-2xl lg:text-3xl font-bold text-orange-600">100% Free</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-4 sm:py-6 md:py-8 lg:py-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">Ready to Start Your Campaign?</h2>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl 4xl:text-5xl text-orange-100 mb-6 sm:mb-8 lg:mb-10 xl:mb-12 2xl:mb-16 3xl:mb-20 4xl:mb-24 w-[88%] max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px] 3xl:max-w-[1400px] 4xl:max-w-[1600px] mx-auto">
              Join thousands of brands that have successfully collaborated with creators through Influmojo
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center px-4">
              <button 
                onClick={() => {
                  sessionStorage.setItem('selectedUserType', 'brand');
                  router.push('/get-started');
                }}
                className="bg-white text-orange-600 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 lg:py-4 rounded-lg text-sm sm:text-base md:text-lg lg:text-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started as Brand
              </button>
              <button 
                onClick={() => {
                  sessionStorage.setItem('selectedUserType', 'creator');
                  router.push('/get-started');
                }}
                className="bg-transparent text-white border-2 border-white px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 lg:py-4 rounded-lg text-sm sm:text-base md:text-lg lg:text-xl font-semibold hover:bg-white hover:text-orange-600 transition-colors"
              >
                Join as Creator
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


