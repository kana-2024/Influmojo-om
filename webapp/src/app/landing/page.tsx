'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
      youtube: '▶',
      instagram: '📷',
      facebook: 'f',
      twitter: '🐦',
      tiktok: '🎵'
    };

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
      <div key={creator.id} className="flex-shrink-0 w-80 sm:w-96 lg:w-[420px] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => router.push(`/creator/${creator.id}`)}>
        <div className="relative">
          <Image 
            src={creator.profile_image || creator.profilePicture || "/assets/onboarding1.png"} 
            alt={creator.name || creator.fullName || "Creator"} 
            width={420}
            height={280}
            className="w-full h-60 sm:h-72 lg:h-80 object-cover"
          />
          
          {/* Platform Icon - Top Left */}
          <div className={`absolute top-3 left-3 w-8 h-8 sm:w-10 sm:h-10 ${platformColors[platform as keyof typeof platformColors] || 'bg-gray-500'} rounded-full flex items-center justify-center shadow-sm`}>
            <span className="text-white text-sm sm:text-base font-bold">{platformIcons[platform as keyof typeof platformIcons] || '?'}</span>
          </div>
          
          {/* Content Count - Bottom Left */}
          <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 rounded-lg px-2 py-1 sm:px-3 sm:py-2 flex items-center gap-1">
            <span className="text-gray-600 text-xs sm:text-sm">📷</span>
            <span className="text-gray-700 text-xs sm:text-sm font-medium">5 IMAGES</span>
            <span className="text-red-500 text-xs sm:text-sm">+</span>
          </div>
          
          {/* Heart Icon - Bottom Right */}
          <button 
            className="absolute bottom-3 right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite functionality
            }}
          >
            <span className="text-red-500 text-lg sm:text-xl">❤</span>
          </button>
        </div>
          
        <div className="p-4 sm:p-5 lg:p-6 border-t border-gray-100">
          {/* Creator Name and Description */}
          <div className="mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              {creator.name || creator.fullName || 'Unknown Creator'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {creator.bio || creator.description || 'A Talented Influencer'}
            </p>
          </div>
          
          {/* Rating and Response Time */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`text-lg sm:text-xl ${star <= (creator.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ⭐
                  </span>
                ))}
              </div>
              <span className="text-sm sm:text-base text-gray-600">Response Time: {creator.response_time || '1hr'}</span>
            </div>
            <span className="text-sm sm:text-base font-semibold text-gray-700">
              {formatFollowerCount(getFollowerCount())} Followers
            </span>
          </div>
          
          {/* Content Categories */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
            {getContentCategories().slice(0, 3).map((category: string, index: number) => (
              <span key={index} className="px-2 py-1 sm:px-3 sm:py-2 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full border border-gray-200">
                {category}
              </span>
            ))}
          </div>
          
          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <span>Sep 19, 2018</span>
            <span className="flex items-center gap-1">
              <span className="text-blue-500">♂</span>
              {creator.gender || 'Not specified'}
            </span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image 
                src="/assets/logo/Group.png" 
                alt="Influmojo" 
                width={120} 
                height={40}
                className="h-8 w-auto cursor-pointer"
                onClick={() => router.push('/landing')}
              />
            </div>

            {/* Navigation Links - Matching the screenshot */}
            <div className="hidden md:flex items-center space-x-8">
              <button className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                How it works
              </button>
              <button className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Pricing
              </button>
              <button className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Sign up as brand
              </button>
              <button className="text-orange-500 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                Sign up as Creator
              </button>
              <button className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </button>
            </div>

            {/* Profile Icon - Matching the screenshot */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">👤</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Same as Brand Home */}
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8 w-full max-w-full overflow-hidden">
          {/* Welcome Header */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Discover Amazing Creators</h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with talented content creators across all major social media platforms. 
              Find the perfect match for your brand campaigns.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-full overflow-hidden">
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
                className="block w-full pl-10 pr-3 py-3 border border-orange-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
              />
            </div>
            
            {/* Filter Button */}
            <button className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center flex-shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Categories Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-full overflow-hidden gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex-shrink-0">Categories</h2>
              <button 
                onClick={() => router.push('/dashboard/brand/creators')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0"
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
                className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Fashion Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <Image 
                    src="/assets/fashion.jpg" 
                    alt="Fashion" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Fashion</p>
                  </div>
                </div>
               
                {/* Trainer Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <Image 
                    src="/assets/trainer.jpg" 
                    alt="Trainer" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Trainer</p>
                  </div>
                </div>
               
                {/* Yoga Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <Image 
                    src="/assets/yoga.jpg" 
                    alt="Yoga" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Yoga</p>
                  </div>
                </div>
               
                {/* Business Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <Image 
                    src="/assets/business.jpg" 
                    alt="Business" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Business</p>
                  </div>
                </div>

                {/* Beauty Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <Image 
                    src="/assets/beauty.jpg" 
                    alt="Beauty" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Beauty</p>
                  </div>
                </div>

                {/* Gaming Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">🎮</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Gaming</p>
                  </div>
                </div>

                {/* Travel Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">✈️</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Travel</p>
                  </div>
                </div>

                {/* Food Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">🍕</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Food</p>
                  </div>
                </div>

                {/* Education Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">📚</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Education</p>
                  </div>
                </div>

                {/* Pet Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">🐕</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Pet</p>
                  </div>
                </div>

                {/* Sports & Fitness Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">⚽</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Sports & Fitness</p>
                  </div>
                </div>

                {/* Lifestyle Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">🌟</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Lifestyle</p>
                  </div>
                </div>

                {/* Entertainment Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">🎬</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Entertainment</p>
                  </div>
                </div>

                {/* Tech Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">💻</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Tech</p>
                  </div>
                </div>

                {/* Photography Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">📸</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Photography</p>
                  </div>
                </div>

                {/* Healthcare Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">🏥</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Healthcare</p>
                  </div>
                </div>

                {/* Finance Category */}
                <div className="flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-lg relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">💰</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center text-sm sm:text-base">Finance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* YouTube Creators Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-full overflow-hidden gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex-shrink-0">Youtube Creators</h2>
              <button 
                onClick={() => router.push('/dashboard/brand/creators?platform=youtube')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0"
              >
                View All
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
                className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
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
            <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-full overflow-hidden gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex-shrink-0">Instagram Creators</h2>
              <button 
                onClick={() => router.push('/dashboard/brand/creators?platform=instagram')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0"
              >
                View All
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
                className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
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
            <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-full overflow-hidden gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex-shrink-0">Facebook Creators</h2>
              <button 
                onClick={() => router.push('/dashboard/brand/creators?platform=facebook')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0"
              >
                View All
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
                className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
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

          {/* CTA Section */}
          <div className="text-center py-8 sm:py-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Start Your Campaign?</h2>
            <p className="text-base sm:text-lg text-orange-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join thousands of brands that have successfully collaborated with creators through Influmojo
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <button 
                onClick={() => router.push('/signup-brand')}
                className="bg-white text-orange-600 px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started as Brand
              </button>
              <button 
                onClick={() => router.push('/signup-creator')}
                className="bg-transparent text-white border-2 border-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
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


