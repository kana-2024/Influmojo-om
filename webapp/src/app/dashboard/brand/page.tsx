'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  HomeIcon,
  ListBulletIcon,
  CubeIcon,
  BriefcaseIcon,
  WalletIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ShoppingCartIcon,
  BellIcon,
  StarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PlusIcon,
  LanguageIcon,
  BookmarkIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  GlobeAltIcon,
  XMarkIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { FaFacebook, FaYoutube, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { profileAPI, ordersAPI } from '@/services/apiService';
import { toast } from 'react-hot-toast';
import EditProfileModal from '@/components/EditProfileModal';

import CartModal from '@/components/modals/CartModal';
import CartService from '@/services/cartService';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
}

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  delivery_time: string;
  revisions: number;
  platform: string;
  category: string;
  requirements: string;
  is_active: boolean;
}

interface PortfolioItem {
  id: string;
  mediaUrl: string;
  mediaType: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
}

interface SocialMediaAccount {
  platform: string;
  username: string;
  follower_count: number;
  engagement_rate: number;
  verified: boolean;
}

interface Order {
  id: string;
  title: string;
  creator: {
    name: string;
    platform: string;
  };
  amount: number;
  status: string;
  created_at: string;
}

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
  categories: string[];
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
}

interface BrandProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  coverImage?: string;
  bio?: string;
  businessType?: string;
  websiteUrl?: string;
  role?: string;
  city?: string;
  state?: string;
  pincode?: string;
  languages: string[];
  categories: string[];
  social_media_accounts: SocialMediaAccount[];
  portfolio_items: PortfolioItem[];
  packages: Package[];
  recentOrders?: Order[]; // Recent orders for dashboard preview
  kyc_status?: string;
  verification_status?: string;
  rating?: number;
  average_response_time?: string;
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

// Helper function to format follower count
const formatFollowerCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// Transform backend data to match our interface
const transformBackendData = (backendData: Record<string, unknown>): BrandProfile => {
  const getString = (key: string, fallback = ''): string => {
    const value = backendData[key];
    return typeof value === 'string' ? value : fallback;
  };
  const getNumber = (key: string, fallback = 0): number => {
    const value = backendData[key];
    return typeof value === 'number' ? value : fallback;
  };
  const user = backendData.user as Record<string, unknown> | undefined;
  
  // Log the raw backend data to debug field names
  console.log('🔍 Raw backend data keys:', Object.keys(backendData));
  console.log('🔍 Backend data values:', backendData);
  
  // For brands, we want to prioritize company/brand name over user's personal name
  // Check multiple possible field names for company name
  const companyName = getString('company_name') || 
                     getString('companyName') || 
                     getString('brand_name') || 
                     getString('brandName') ||
                     getString('company') ||
                     getString('brand');
  
  // If company_name is just "Company Name" (placeholder), use personal name instead
  const actualCompanyName = (companyName && companyName !== 'Company Name') ? companyName : '';
  
  const personalName = getString('fullName') || 
                      getString('full_name') || 
                      getString('name') || 
                      (user ? (user.name as string) || '' : '');
  
  // Check multiple possible field names for role - backend uses 'role_in_organization'
  const role = getString('role_in_organization') || 
               getString('role') || 
               getString('job_title') || 
               getString('position') || 
               getString('user_role') ||
               getString('job_role') ||
               getString('designation');
  
  console.log('🔍 Found company name:', companyName);
  console.log('🔍 Actual company name (non-placeholder):', actualCompanyName);
  console.log('🔍 Found personal name:', personalName);
  console.log('🔍 Found role:', role);
  
  return {
    id: getString('id') || getString('user_id') || '',
    // For brands, show company name if available and not placeholder, otherwise fall back to personal name
    fullName: actualCompanyName || personalName || 'Brand Name',
    email: getString('email') || (user ? (user.email as string) || '' : '') || '',
    phone: getString('phone') || (user ? (user.phone as string) || '' : '') || '',
    profilePicture: getString('profilePicture') || getString('profile_picture') || getString('avatar') || '',
    coverImage: getString('coverImage') || getString('cover_image') || '',
    bio: getString('bio') || getString('about') || getString('description') || '',
    businessType: getString('businessType') || getString('business_type') || getString('businessType') || '',
    websiteUrl: getString('websiteUrl') || getString('website_url') || getString('website') || '',
    role: role,
    city: getString('city') || getString('location_city') || getString('address_city') || getString('location_city') || '',
    state: getString('state') || getString('location_state') || getString('address_state') || getString('location_state') || '',
    pincode: getString('pincode') || getString('pin_code') || getString('postal_code') || getString('location_pincode') || '',
    languages: (backendData.languages as string[]) || (backendData.language as string[]) || [],
    categories: (backendData.categories as string[]) || (backendData.industries as string[]) || (backendData.interests as string[]) || (backendData.industries as string[]) || [],
    social_media_accounts: (backendData.social_media_accounts as SocialMediaAccount[]) || (backendData.social_accounts as SocialMediaAccount[]) || (backendData.platforms as SocialMediaAccount[]) || [],
    portfolio_items: (backendData.portfolio_items as PortfolioItem[]) || (backendData.portfolio as PortfolioItem[]) || (backendData.works as PortfolioItem[]) || [],
    packages: (backendData.packages as Package[]) || (backendData.service_packages as Package[]) || [],
    kyc_status: getString('kyc_status') || getString('kyc_verified') || '',
    verification_status: getString('verification_status') || getString('verified') || '',
    rating: getNumber('rating') || 0,
    average_response_time: getString('average_response_time') || getString('response_time') || '1HR - 3HR',
  };
};

export default function BrandDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCartModal, setShowCartModal] = useState(false);

  const [cartItemCount, setCartItemCount] = useState(0);

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

  // State for profile dropdown and notifications
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Sample notification data - in real app, this would come from API
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'verification',
      title: 'Congratulations! Your brand profile has been Verified',
      message: '',
      time: '23 Mins ago',
      icon: 'check',
      color: 'green',
      action: null,
      read: false
    },
    {
      id: 2,
      type: 'order',
      title: 'New Order Request',
      message: '',
      time: '',
      icon: 'order',
      color: 'blue',
      action: { type: 'viewOrder', label: 'View Order', data: { id: 'order123' } },
      read: false
    },
    {
      id: 3,
      type: 'creator',
      title: 'Creator Response',
      message: 'A creator has responded to your campaign...',
      time: '10 Mins ago',
      icon: 'brand',
      color: 'purple',
      action: null,
      percentage: '60%',
      read: false
    }
  ]);


  // Initialize cart service and subscribe to changes
  useEffect(() => {
    CartService.init();
    const unsubscribe = CartService.subscribe((summary) => {
      setCartItemCount(summary.totalItems);
    });
    setCartItemCount(CartService.getCartSummary().totalItems);
    return unsubscribe;
  }, []);

  // Fetch brand profile on component mount
  useEffect(() => {
    fetchProfile();
    fetchCreators();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching brand profile...');
      const token = localStorage.getItem('token');
      console.log('🔍 Token from localStorage:', token ? 'Yes' : 'No');
      if (token) {
        console.log('🔍 Token preview:', token.substring(0, 20) + '...');
      }
      
      // Fetch both profile and orders
      const [profileResponse, ordersResponse] = await Promise.all([
        profileAPI.getBrandProfile(),
        ordersAPI.getBrandOrders()
      ]);
      
      console.log('🔍 Raw profile response:', profileResponse);
      console.log('🔍 Raw orders response:', ordersResponse);
      
      if (profileResponse.success && profileResponse.data) {
        console.log('✅ Brand profile fetched successfully:', profileResponse.data);
        const transformedProfile = transformBackendData(profileResponse.data);
        
        // Add recent orders to the profile
        if (ordersResponse.success && ordersResponse.orders) {
          transformedProfile.recentOrders = ordersResponse.orders.slice(0, 5); // Get last 5 orders
          console.log('✅ Orders fetched successfully:', ordersResponse.orders);
        }
        
        console.log('🔍 Transformed profile data:', transformedProfile);
        setProfile(transformedProfile);
      } else {
        console.error('❌ Failed to fetch brand profile:', profileResponse.error);
        console.error('❌ Response details:', profileResponse);
        setError(profileResponse.error || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('❌ Error loading brand profile:', err);
      console.error('❌ Error details:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreators = async () => {
    try {
      setCreatorsLoading(true);
      setCreatorsError(null);
      
      console.log('🔍 Fetching creators for brand home screen...');
      const response = await profileAPI.getCreators();
      
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

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Clear sessionStorage as well
    sessionStorage.clear();
    // Redirect to login
    router.push('/login');
  };

  // Close profile dropdown and notification popup when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showProfileDropdown && !target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
      if (showNotificationPopup && !target.closest('.notification-popup-container')) {
        setShowNotificationPopup(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showProfileDropdown) {
          setShowProfileDropdown(false);
        }
        if (showNotificationPopup) {
          setShowNotificationPopup(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showProfileDropdown, showNotificationPopup]);

  const handleProfileAction = (action: string) => {
    switch (action) {
      case 'profile':
        setActiveTab('dashboard');
        setShowProfileDropdown(false);
        break;
      case 'edit':
        setShowEditProfileModal(true);
        setShowProfileDropdown(false);
        break;
      case 'logout':
        setShowProfileDropdown(false);
        handleLogout();
        break;
      default:
        break;
    }
  };

  const handleNotificationAction = (action: string, data?: { id: string }) => {
    switch (action) {
      case 'viewOrder':
        console.log('View order clicked:', data);
        // TODO: Navigate to order details
        setShowNotificationPopup(false);
        break;
      case 'seeAll':
        console.log('See all notifications clicked');
        // TODO: Navigate to notifications page
        setShowNotificationPopup(false);
        break;
      default:
        break;
    }
  };

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleSaveProfile = async (profileData: {
    fullName?: string;
    gender?: string;
    state?: string;
    city?: string;
    pincode?: string;
    languages?: string[];
    email?: string;
    phone?: string;
    about?: string;
    bio?: string;
    categories?: string[];
    content_categories?: string[];
    coverImageUrl?: string;
    coverImage?: string;
    profileImageUrl?: string;
    profileImage?: string;
  }) => {
    try {
      console.log('Saving profile data:', profileData);
      
      // Prepare data for API call
      const apiData = {
        fullName: profileData.fullName,
        gender: profileData.gender,
        state: profileData.state,
        city: profileData.city,
        pincode: profileData.pincode,
        languages: profileData.languages,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.about || profileData.bio,
        categories: profileData.categories || profileData.content_categories,
        coverImage: profileData.coverImageUrl || profileData.coverImage,
        profilePicture: profileData.profileImageUrl || profileData.profileImage,
      };

      // Call API to update profile
      const response = await profileAPI.updateProfile(apiData);
      
      if (response.success) {
        // Update local state with the response data
        setProfile(prev => {
          if (!prev) return null;
          return {
            ...prev,
            fullName: profileData.fullName || prev.fullName,
            state: profileData.state || prev.state,
            city: profileData.city || prev.city,
            pincode: profileData.pincode || prev.pincode,
            languages: profileData.languages || prev.languages,
            email: profileData.email || prev.email,
            phone: profileData.phone || prev.phone,
            // Ensure categories are properly mapped
            categories: profileData.categories || profileData.content_categories || prev.categories,
            // Ensure images are properly mapped
            coverImage: profileData.coverImageUrl || profileData.coverImage || prev.coverImage,
            profilePicture: profileData.profileImageUrl || profileData.profileImage || prev.profilePicture,
            // Ensure bio is properly mapped
            bio: profileData.about || profileData.bio || prev.bio,
          };
        });
        
        toast.success('Profile updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
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

      return (
    <div key={creator.id} className="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => router.push(`/dashboard/brand/creator/${creator.id}`)}>
      <div className="relative">
        <img 
          src={creator.profile_image || creator.profilePicture || "/assets/onboarding1.png"} 
          alt={creator.name || creator.fullName || "Creator"} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center hidden">
          <span className="text-6xl">🏔️</span>
        </div>
        {/* Platform Icon */}
        <div className={`absolute top-3 left-3 w-8 h-8 ${platformColors[platform as keyof typeof platformColors] || 'bg-gray-500'} rounded-full flex items-center justify-center`}>
          <span className="text-white text-sm">{platformIcons[platform as keyof typeof platformIcons] || '?'}</span>
        </div>
        {/* Heart Icon */}
        <button 
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Handle favorite functionality
          }}
        >
          <span className="text-red-500 text-lg">❤</span>
        </button>
      </div>
        
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="text-blue-500">♂</span>
              {creator.gender || 'Not specified'}
            </span>
            {creator.age && (
              <span className="flex items-center gap-1">
                <span className="text-yellow-500">🎂</span>
                {creator.age} years old
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="text-gray-500">⏰</span>
              {creator.response_time || 'Within 24h'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-gray-900">{creator.name || creator.fullName || 'Unknown Creator'}</h3>
            {creator.verified && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Verified</span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-2">
            {creator.bio || creator.description || 'Professional content creator'}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-semibold text-gray-900">{formatFollowerCount(getFollowerCount())} followers</span>
              {creator.engagement_rate && (
                <span className="text-gray-500 ml-2">• {creator.engagement_rate}% engagement</span>
              )}
            </div>
            {creator.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">⭐</span>
                <span className="text-sm font-medium">{creator.rating}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {creator.content_categories && Array.isArray(creator.content_categories) && 
              creator.content_categories.slice(0, 2).map((category: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {category}
                </span>
              ))
            }
          </div>
          
          {/* Click indicator */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-center text-orange-500 text-sm font-medium">
              <span>Click to view profile</span>
              <ArrowRightOnRectangleIcon className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    if (activeTab === 'home') {
      return (
        <div className="space-y-8 w-full max-w-full overflow-hidden">
          {/* Welcome Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
            <p className="text-gray-600">Discover amazing creators for your brand</p>
          </div>

          {/* Search and Filter Section - EXACTLY like mobile */}
          <div className="flex gap-3 w-full max-w-full overflow-hidden">
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

          {/* Categories Section - EXACTLY like mobile with ALL categories */}
          <div className="space-y-4">
            <div className="flex justify-between items-center w-full max-w-full overflow-hidden">
              <h2 className="text-xl font-semibold text-gray-900 flex-shrink-0">Categories</h2>
              <button 
                onClick={() => router.push('/dashboard/brand/creators')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0 ml-4"
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
                    container.scrollLeft -= 400;
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
                    container.scrollLeft += 400;
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
                className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                               {/* Fashion Category */}
                <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                  <img 
                    src="/assets/fashion.jpg" 
                    alt="Fashion" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center hidden">
                    <span className="text-2xl">👗</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center">Fashion</p>
                  </div>
                </div>
               
                               {/* Trainer Category */}
                <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                  <img 
                    src="/assets/trainer.jpg" 
                    alt="Trainer" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center hidden">
                    <span className="text-2xl">💪</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center">Trainer</p>
                  </div>
                </div>
               
                               {/* Yoga Category */}
                <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                  <img 
                    src="/assets/yoga.jpg" 
                    alt="Yoga" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center hidden">
                    <span className="text-2xl">🧘</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center">Yoga</p>
                  </div>
                </div>
               
                               {/* Business Category */}
                <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                  <img 
                    src="/assets/business.jpg" 
                    alt="Business" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center hidden">
                    <span className="text-2xl">💼</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center">Business</p>
                  </div>
                </div>

                               {/* Beauty Category */}
                <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                  <img 
                    src="/assets/beauty.jpg" 
                    alt="Beauty" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center hidden">
                    <span className="text-2xl">💄</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <p className="font-semibold text-white text-center">Beauty</p>
                  </div>
                </div>

                             {/* Gaming Category */}
               <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                 <img 
                   src="/assets/fashion.jpg" 
                   alt="Gaming" 
                   className="w-full h-full object-cover"
                   onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     target.style.display = 'none';
                     target.nextElementSibling?.classList.remove('hidden');
                   }}
                 />
                <div className="absolute inset-0 bg-black bg-opacity-20 hidden">
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                    <span className="text-2xl">🎮</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <p className="font-semibold text-white text-center">Gaming</p>
                </div>
              </div>

                             {/* Travel Category */}
               <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                 <img 
                   src="/assets/fashion.jpg" 
                   alt="Travel" 
                   className="w-full h-full object-cover"
                   onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     target.style.display = 'none';
                     target.nextElementSibling?.classList.remove('hidden');
                   }}
                 />
                <div className="absolute inset-0 bg-black bg-opacity-20 hidden">
                  <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <span className="text-2xl">✈️</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <p className="font-semibold text-white text-center">Travel</p>
                </div>
              </div>

              {/* Food Category */}
              <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                <img 
                  src="/assets/fashion.jpg" 
                  alt="Food" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 hidden">
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <span className="text-2xl">🍕</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <p className="font-semibold text-white text-center">Food</p>
                </div>
              </div>

              {/* Education Category */}
              <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                <img 
                  src="/assets/fashion.jpg" 
                  alt="Education" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 hidden">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <p className="font-semibold text-white text-center">Education</p>
                </div>
              </div>

              {/* Pet Category */}
              <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                <img 
                  src="/assets/fashion.jpg" 
                  alt="Pet" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 hidden">
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                     <span className="text-2xl">🐕</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <p className="font-semibold text-white text-center">Pet</p>
                </div>
              </div>

              {/* Sports & Fitness Category */}
              <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                <img 
                  src="/assets/fashion.jpg" 
                  alt="Sports & Fitness" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 hidden">
                  <div className="w-full h-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                    <span className="text-2xl">⚽</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <p className="font-semibold text-white text-center">Sports & Fitness</p>
                </div>
              </div>

              {/* Lifestyle Category */}
              <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                <img 
                  src="/assets/fashion.jpg" 
                  alt="Lifestyle" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 hidden">
                  <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                    <span className="text-2xl">🌟</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <p className="font-semibold text-white text-center">Lifestyle</p>
                </div>
              </div>

              {/* Entertainment Category */}
              <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                <img 
                  src="/assets/fashion.jpg" 
                  alt="Entertainment" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 hidden">
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <p className="font-semibold text-white text-center">Entertainment</p>
                </div>
              </div>

              {/* Tech Category */}
              <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                <img 
                  src="/assets/fashion.jpg" 
                  alt="Tech" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 hidden">
                  <div className="w-full h-full bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center">
                    <span className="text-2xl">💻</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <p className="font-semibold text-white text-center">Tech</p>
                </div>
              </div>

              {/* Photography Category */}
              <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                <img 
                  src="/assets/fashion.jpg" 
                  alt="Photography" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 hidden">
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                    <span className="text-2xl">📸</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <p className="font-semibold text-white text-center">Photography</p>
                </div>
              </div>

              {/* Healthcare Category */}
              <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                <img 
                  src="/assets/fashion.jpg" 
                  alt="Healthcare" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 hidden">
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <span className="text-2xl">🏥</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <p className="font-semibold text-white text-center">Healthcare</p>
                </div>
              </div>

              {/* Finance Category */}
              <div className="flex-shrink-0 w-32 h-32 rounded-lg relative overflow-hidden">
                <img 
                  src="/assets/fashion.jpg" 
                  alt="Finance" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 hidden">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <p className="font-semibold text-white text-center">Finance</p>
                </div>
              </div>
            </div>
              </div>
          </div>

          {/* YouTube Creators Section - EXACTLY like mobile */}
          <div className="space-y-4">
            <div className="flex justify-between items-center w-full max-w-full overflow-hidden">
              <h2 className="text-xl font-semibold text-gray-900 flex-shrink-0">Youtube Creators</h2>
              <button 
                onClick={() => router.push('/dashboard/brand/creators?platform=youtube')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0 ml-4"
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
                    container.scrollLeft -= 400;
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
                    container.scrollLeft += 400;
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
                className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
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

          {/* Instagram Creators Section - EXACTLY like mobile */}
          <div className="space-y-4">
            <div className="flex justify-between items-center w-full max-w-full overflow-hidden">
              <h2 className="text-xl font-semibold text-gray-900 flex-shrink-0">Instagram Creators</h2>
              <button 
                onClick={() => router.push('/dashboard/brand/creators?platform=instagram')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0 ml-4"
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
                    container.scrollLeft -= 400;
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
                    container.scrollLeft += 400;
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
                className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
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

          {/* Facebook Creators Section - EXACTLY like mobile */}
          <div className="space-y-4">
            <div className="flex justify-between items-center w-full max-w-full overflow-hidden">
              <h2 className="text-xl font-semibold text-gray-900 flex-shrink-0">Facebook Creators</h2>
              <button 
                onClick={() => router.push('/dashboard/brand/creators?platform=facebook')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0 ml-4"
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
                    container.scrollLeft -= 400;
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
                    container.scrollLeft += 400;
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
                className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
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
        </div>
      );
    }

    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-6">
           {/* Profile Header - EXACTLY like creator dashboard */}
           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
             <div className="relative">
               {/* Cover Image */}
               <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600"></div>
               
               {/* Profile Picture */}
               <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                 <div className="w-24 h-24 bg-gray-300 rounded-full border-4 border-white flex items-center justify-center overflow-hidden">
                   {profile?.profilePicture ? (
                     <img 
                       src={profile.profilePicture} 
                       alt="Profile" 
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         target.nextElementSibling?.classList.remove('hidden');
                       }}
                     />
                   ) : null}
                   <div className={`w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ${profile?.profilePicture ? 'hidden' : ''}`}>
                     <BuildingOfficeIcon className="w-12 h-12 text-white" />
                </div>
                 </div>
               </div>
             </div>
             
             <div className="pt-16 pb-6 px-6">
               <div className="flex justify-between items-start">
                <div className="flex-1">
                   {/* Brand/Company Name */}
                   <h1 className="text-3xl font-bold text-gray-900 mb-2">
                     {profile?.fullName?.toUpperCase() || 'BRAND NAME'}
                   </h1>
                   
                   {/* Company Type and Role */}
                   <div className="flex items-center gap-4 mb-2">
                     {profile?.businessType && (
                       <span className="text-lg text-gray-600">
                         {profile.businessType} Company
                       </span>
                     )}
                     {profile?.role && (
                       <span className="text-lg text-gray-600">
                         • {profile.role}
                       </span>
                     )}
                   </div>
                   
                   {/* Rating */}
                   {profile?.rating && (
                     <div className="flex items-center gap-2 mb-4">
                       <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                       <span className="text-lg font-semibold text-gray-900">
                         {typeof profile.rating === 'number' ? profile.rating.toFixed(1) : parseFloat(String(profile.rating)).toFixed(1)}
                       </span>
                       <span className="text-gray-600">({profile.rating > 1000 ? formatFollowerCount(profile.rating) : profile.rating} reviews)</span>
                     </div>
                   )}
                   
                   {/* Profile Completion Progress */}
                   <div className="mb-4">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-medium text-gray-700">Complete Your Profile</span>
                       <span className="text-sm text-gray-500">60%</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                       <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                     </div>
                   </div>
                   
                   {/* Action Buttons */}
                   <div className="flex gap-3">
                     <button 
                       onClick={fetchProfile}
                       className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors flex items-center gap-2"
                     >
                       🔄 Refresh Profile
                     </button>
                     <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                       <BookmarkIcon className="w-4 h-4" />
                       Save for later
                     </button>
                     <button className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors flex items-center gap-2">
                       <ShareIcon className="w-4 h-4" />
                       Share Profile
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* Social Media Following - EXACTLY like creator dashboard */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {/* Facebook */}
             <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
               <div className="flex items-center justify-between mb-4">
                 <FaFacebook className="w-8 h-8 text-blue-500" />
                 <button className="text-blue-500 text-sm font-medium hover:underline">Connect</button>
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-1">Facebook Followers</h3>
               <p className="text-2xl font-bold text-gray-900">
                 {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'facebook')?.follower_count 
                   ? formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'facebook')!.follower_count)
                   : '0'}
                  </p>
                </div>

             {/* YouTube */}
             <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
               <div className="flex items-center justify-between mb-4">
                 <FaYoutube className="w-8 h-8 text-red-500" />
                 <button className="text-red-500 text-sm font-medium hover:underline">Connect</button>
              </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-1">Youtube Subscribers</h3>
               <p className="text-2xl font-bold text-gray-900">
                 {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'youtube')?.follower_count 
                   ? formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'youtube')!.follower_count)
                   : '1m'}
               </p>
            </div>

             {/* LinkedIn */}
             <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
               <div className="flex items-center justify-between mb-4">
                 <FaLinkedin className="w-8 h-8 text-blue-600" />
                 <button className="text-blue-600 text-sm font-medium hover:underline">Connect</button>
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-1">LinkedIn Followers</h3>
               <p className="text-2xl font-bold text-gray-900">
                 {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'linkedin')?.follower_count 
                   ? formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'linkedin')!.follower_count)
                   : '2.5k'}
               </p>
             </div>

             {/* Instagram */}
             <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-pink-500">
               <div className="flex items-center justify-between mb-4">
                 <FaInstagram className="w-8 h-8 text-pink-500" />
                 <button className="text-pink-500 text-sm font-medium hover:underline">Connect</button>
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-1">Instagram Followers</h3>
               <p className="text-2xl font-bold text-gray-900">
                 {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'instagram')?.follower_count 
                   ? formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'instagram')!.follower_count)
                   : '15k'}
               </p>
             </div>
           </div>

           {/* Categories - EXACTLY like creator dashboard */}
           <div className="bg-white rounded-lg shadow-sm p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
             <div className="flex flex-wrap gap-3">
               {profile?.categories && profile.categories.length > 0 ? (
                 profile.categories.map((category, index) => (
                   <button
                     key={index}
                     className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors"
                   >
                     {category}
                   </button>
                 ))
               ) : (
                 <>
                   <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors">
                     Fashion
                   </button>
                   <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors">
                     Business
                   </button>
                   <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors">
                     Technology
                   </button>
                   <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors">
                     Lifestyle
                   </button>
                 </>
               )}
             </div>
           </div>

           {/* About Me - EXACTLY like creator dashboard */}
           <div className="bg-white rounded-lg shadow-sm p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">About My Business</h3>
             <p className="text-gray-700 leading-relaxed">
               {profile?.bio || 'We are a dynamic brand focused on creating meaningful connections with our audience through innovative campaigns and authentic partnerships with creators.'}
             </p>
           </div>

           {/* Company Details Grid - All fields collected during onboarding */}
           <div className="bg-white rounded-lg shadow-sm p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {/* Business Type */}
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                 <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                  <div>
                   <p className="text-sm text-gray-500">Business Type</p>
                   <p className="font-medium text-gray-900">{profile?.businessType || 'Not specified'}</p>
                  </div>
               </div>
               
               {/* Role */}
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                 <UserGroupIcon className="w-5 h-5 text-gray-500" />
                 <div>
                   <p className="text-sm text-gray-500">Your Role</p>
                   <p className="font-medium text-gray-900">{profile?.role || 'Not specified'}</p>
                </div>
              </div>
              
               {/* Website */}
               {profile?.websiteUrl && (
                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                   <GlobeAltIcon className="w-5 h-5 text-gray-500" />
                   <div>
                     <p className="text-sm text-gray-500">Website</p>
                     <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                       {profile.websiteUrl}
                     </a>
                   </div>
                 </div>
               )}
               
               {/* Email */}
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                 <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                 <div>
                   <p className="text-sm text-gray-500">Email</p>
                   <p className="font-medium text-gray-900">{profile?.email || 'Not specified'}</p>
                 </div>
               </div>
               
               {/* Phone */}
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                 <PhoneIcon className="w-5 h-5 text-gray-500" />
                 <div>
                   <p className="text-sm text-gray-500">Phone</p>
                   <p className="font-medium text-gray-900">{profile?.phone || 'Not specified'}</p>
                 </div>
               </div>
               
               {/* Languages */}
               {profile?.languages && profile.languages.length > 0 && (
                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                   <LanguageIcon className="w-5 h-5 text-gray-500" />
                   <div>
                     <p className="text-sm text-gray-500">Languages</p>
                     <p className="font-medium text-gray-900">{profile.languages.join(', ')}</p>
                   </div>
                 </div>
               )}
               
               {/* City */}
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                 <MapPinIcon className="w-5 h-5 text-gray-500" />
                 <div>
                   <p className="text-sm text-gray-500">Location</p>
                   <p className="text-gray-900">
                     {profile?.city || 'Not specified'}{profile?.state && `, ${profile.state}`}{profile?.pincode && ` ${profile.pincode}`}
                   </p>
                 </div>
               </div>
             </div>
           </div>

           {/* Stats Cards - EXACTLY like creator dashboard */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                   <p className="text-sm font-medium text-gray-600">Total Orders</p>
                   <p className="text-2xl font-bold text-gray-900">24</p>
                  </div>
                 <ListBulletIcon className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              
             <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                   <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                   <p className="text-2xl font-bold text-gray-900">{profile?.packages?.length || 0}</p>
                  </div>
                 <BriefcaseIcon className="w-8 h-8 text-blue-500" />
                </div>
             </div>
             
             <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Portfolio Items</p>
                   <p className="text-2xl font-bold text-gray-900">{profile?.portfolio_items?.length || 0}</p>
                 </div>
                 <BriefcaseIcon className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-gray-600">Total Spent</p>
                   <p className="text-2xl font-bold text-gray-900">₹12,450</p>
                </div>
                 <WalletIcon className="w-8 h-8 text-purple-500" />
               </div>
                </div>
              </div>
              
           {/* Recent Activity - EXACTLY like creator dashboard */}
           <div className="bg-white rounded-lg shadow-sm p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
             <div className="space-y-4">
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                 <span className="text-sm text-gray-600">New campaign &quot;Instagram Reel Campaign&quot; created</span>
                 <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
               </div>
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                 <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                 <span className="text-sm text-gray-600">Portfolio item &quot;Fashion Shoot&quot; uploaded</span>
                 <span className="text-xs text-gray-400 ml-auto">1 day ago</span>
               </div>
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                 <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                 <span className="text-xs text-gray-400 ml-auto">3 days ago</span>
               </div>
             </div>
            </div>
          </div>
      );
    }

     if (activeTab === 'campaigns') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Campaigns</h3>
            <button 
              onClick={() => alert('Campaign creation coming soon for brands')}
              className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Create Campaign
            </button>
          </div>
          
          {profile?.packages && profile.packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.packages.map((pkg) => (
                <div key={pkg.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{pkg.title}</h4>
                    <span className="text-orange-500 font-bold">₹{Number(pkg.price).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span>{pkg.delivery_time}</span>
                    <span>{pkg.revisions} revisions</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{pkg.platform}</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{pkg.category}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-4">Create your first campaign to start collaborating with creators</p>
              <button 
                onClick={() => alert('Campaign creation coming soon for brands')}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Create Campaign
              </button>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'portfolio') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Portfolio</h3>
            <button 
              onClick={() => alert('Portfolio creation coming soon for brands')}
              className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Portfolio Item
            </button>
          </div>
          
          {profile?.portfolio_items && profile.portfolio_items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.portfolio_items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="bg-gray-100 rounded-lg p-4 mb-3 flex items-center justify-center">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{item.fileName}</h4>
                  <p className="text-gray-600 text-sm mb-2">{item.mediaType}</p>
                  <p className="text-gray-500 text-xs">{(item.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio items yet</h3>
              <p className="text-gray-500 mb-4">Add your first portfolio item to showcase your work</p>
              <button 
                onClick={() => alert('Portfolio creation coming soon for brands')}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Add Portfolio Item
              </button>
            </div>
          )}
        </div>
      );
    }



    if (activeTab === 'profile') {
      return (
        <div className="space-y-6">
          {/* Profile Header - EXACTLY like creator dashboard */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600"></div>
              
              {/* Profile Picture */}
              <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                <div className="w-24 h-24 bg-gray-300 rounded-full border-4 border-white flex items-center justify-center overflow-hidden">
                  {profile?.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ${profile?.profilePicture ? 'hidden' : ''}`}>
                    <BuildingOfficeIcon className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-16 pb-6 px-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Brand/Company Name */}
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile?.fullName?.toUpperCase() || 'BRAND NAME'}
                  </h1>
                  
                  {/* Company Type and Role */}
                  <div className="flex items-center gap-4 mb-2">
                    {profile?.businessType && (
                      <span className="text-lg text-gray-600">
                        {profile.businessType} Company
                      </span>
                    )}
                    {profile?.role && (
                      <span className="text-lg text-gray-600">
                        • {profile.role}
                      </span>
                    )}
                  </div>
                  
                  {/* Rating */}
                  {profile?.rating && (
                    <div className="flex items-center gap-2 mb-4">
                      <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-semibold text-gray-900">
                        {typeof profile.rating === 'number' ? profile.rating.toFixed(1) : parseFloat(String(profile.rating)).toFixed(1)}
                      </span>
                      <span className="text-gray-600">({profile.rating > 1000 ? formatFollowerCount(profile.rating) : profile.rating} reviews)</span>
                    </div>
                  )}
                  
                  {/* Profile Completion Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Complete Your Profile</span>
                      <span className="text-sm text-gray-500">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button 
                      onClick={fetchProfile}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors flex items-center gap-2"
                    >
                      🔄 Refresh Profile
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                      <BookmarkIcon className="w-4 h-4" />
                      Save for later
                    </button>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors flex items-center gap-2">
                      <ShareIcon className="w-4 h-4" />
                      Share Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Following - EXACTLY like creator dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Facebook */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <FaFacebook className="w-8 h-8 text-blue-500" />
                <button className="text-blue-500 text-sm font-medium hover:underline">Connect</button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Facebook Followers</h3>
              <p className="text-2xl font-bold text-gray-900">
                {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'facebook')?.follower_count 
                  ? formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'facebook')!.follower_count)
                  : '0'}
              </p>
            </div>

            {/* YouTube */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <FaYoutube className="w-8 h-8 text-red-500" />
                <button className="text-red-500 text-sm font-medium hover:underline">Connect</button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Youtube Subscribers</h3>
              <p className="text-2xl font-bold text-gray-900">
                {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'youtube')?.follower_count 
                  ? formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'youtube')!.follower_count)
                  : '1m'}
              </p>
            </div>

            {/* LinkedIn */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between mb-4">
                <FaLinkedin className="w-8 h-8 text-blue-600" />
                <button className="text-blue-500 text-sm font-medium hover:underline">Connect</button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">LinkedIn Followers</h3>
              <p className="text-2xl font-bold text-gray-900">
                {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'linkedin')?.follower_count 
                  ? formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'linkedin')!.follower_count)
                  : '2.5k'}
              </p>
            </div>

            {/* Instagram */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-pink-500">
              <div className="flex items-center justify-between mb-4">
                <FaInstagram className="w-8 h-8 text-pink-500" />
                <button className="text-pink-500 text-sm font-medium hover:underline">Connect</button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Instagram Followers</h3>
              <p className="text-2xl font-bold text-gray-900">
                {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'instagram')?.follower_count 
                  ? formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'instagram')!.follower_count)
                  : '1.5k'}
              </p>
            </div>
          </div>

          {/* Categories - EXACTLY like creator dashboard */}
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="flex flex-wrap gap-3">
              {profile?.categories && profile.categories.length > 0 ? (
                profile.categories.map((category, index) => (
            <button 
                    key={index}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors"
            >
                    {category}
            </button>
                ))
              ) : (
                <>
                  <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors">
                    Fashion
                  </button>
                  <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors">
                    Business
                  </button>
                  <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors">
                    Technology
                  </button>
                  <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors">
                    Lifestyle
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* About Me - EXACTLY like creator dashboard */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About My Business</h3>
            <p className="text-gray-700 leading-relaxed">
              {profile?.bio || 'We are a dynamic brand focused on creating meaningful connections with our audience through innovative campaigns and authentic partnerships with creators.'}
            </p>
          </div>

          {/* Company Details Grid - All fields collected during onboarding */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Business Type */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Business Type</p>
                  <p className="font-medium text-gray-900">{profile?.businessType || 'Not specified'}</p>
                </div>
              </div>
              
              {/* Role */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Your Role</p>
                  <p className="font-medium text-gray-900">{profile?.role || 'Not specified'}</p>
                </div>
              </div>
              
              {/* Website */}
              {profile?.websiteUrl && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <GlobeAltIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                      {profile.websiteUrl}
                    </a>
                  </div>
                </div>
              )}
              
              {/* Email */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{profile?.email || 'Not specified'}</p>
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <PhoneIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{profile?.phone || 'Not specified'}</p>
                </div>
              </div>
              
              {/* Languages */}
              {profile?.languages && profile.languages.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <LanguageIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Languages</p>
                    <p className="font-medium text-gray-900">{profile.languages.join(', ')}</p>
                  </div>
                </div>
              )}
              
              {/* City */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPinIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900">
                    {profile?.city || 'Not specified'}{profile?.state && `, ${profile.state}`}{profile?.pincode && ` ${profile.pincode}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards - EXACTLY like creator dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                      </div>
                <ListBulletIcon className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                      <div>
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{profile?.packages?.length || 0}</p>
                </div>
                <BriefcaseIcon className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Portfolio Items</p>
                  <p className="text-2xl font-bold text-gray-900">{profile?.portfolio_items?.length || 0}</p>
                </div>
                <BriefcaseIcon className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">₹12,450</p>
                </div>
                <WalletIcon className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Recent Activity - EXACTLY like creator dashboard */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">New campaign &quot;Instagram Reel Campaign&quot; created</span>
                <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Portfolio item &quot;Fashion Shoot&quot; uploaded</span>
                <span className="text-xs text-gray-400 ml-auto">1 day ago</span>
              </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Order #1234 completed successfully</span>
                <span className="text-xs text-gray-400 ml-auto">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'reviews') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Reviews & Ratings</h3>
          </div>
          
          <div className="text-center py-8">
            <StarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500 mb-4">Reviews from creators will appear here once you start collaborating</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'chat') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Chat with Creators</h3>
          </div>
          
          <div className="text-center py-8">
            <EnvelopeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active chats</h3>
            <p className="text-gray-500 mb-4">Start chatting with creators once you place orders</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'wallet') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Wallet & Payments</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 rounded-lg text-white">
              <h4 className="text-lg font-semibold mb-2">Available Balance</h4>
              <p className="text-3xl font-bold">₹0.00</p>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 rounded-lg text-white">
              <h4 className="text-lg font-semibold mb-2">Total Spent</h4>
              <p className="text-3xl font-bold">₹12,450</p>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-6 rounded-lg text-white">
              <h4 className="text-lg font-semibold mb-2">Pending Amount</h4>
              <p className="text-3xl font-bold">₹0.00</p>
            </div>
          </div>
          
          <div className="text-center py-8">
            <WalletIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transaction history</h3>
            <p className="text-gray-500 mb-4">Your payment history will appear here</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'helpCenter') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Help Center</h3>
          </div>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">How to create a campaign?</h4>
              <p className="text-gray-600 text-sm">Learn the step-by-step process of creating and managing campaigns.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">How to find the right creators?</h4>
              <p className="text-gray-600 text-sm">Discover tips for finding creators that match your brand values.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">Payment and billing</h4>
              <p className="text-gray-600 text-sm">Understand our payment process and billing cycles.</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'privacyPolicy') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Privacy Policy</h3>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              This Privacy Policy describes how Influmojo collects, uses, and protects your personal information.
            </p>
            <p className="text-gray-700 mb-4">
              We are committed to protecting your privacy and ensuring the security of your personal data.
            </p>
            <p className="text-gray-700">
              For detailed information, please contact our support team.
                        </p>
                      </div>
                    </div>
      );
    }

    if (activeTab === 'supportTickets') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
            <button className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors">
              Create Ticket
            </button>
          </div>
          
          <div className="text-center py-8">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
            <p className="text-gray-500 mb-4">Create a ticket if you need assistance</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'termsOfService') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Terms of Service</h3>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              These Terms of Service govern your use of the Influmojo platform and services.
            </p>
            <p className="text-gray-700 mb-4">
              By using our platform, you agree to these terms and conditions.
            </p>
            <p className="text-gray-700">
              For detailed information, please contact our support team.
                      </p>
                    </div>
                  </div>
      );
    }

    if (activeTab === 'paymentHistory') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                </div>
          
              <div className="text-center py-8">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
            <p className="text-gray-500 mb-4">Your payment transactions will appear here</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'accountSettings') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
          </div>
          
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Profile Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={profile?.fullName || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={profile?.email || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={profile?.phone || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={profile?.businessType || ''} />
                </div>
              </div>
              <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors">
                Save Changes
                </button>
              </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Security</h4>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Default home tab content
    return (
      <div className="space-y-6">
        {/* Profile Header - EXACTLY like creator dashboard */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="relative">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600"></div>
            
            {/* Profile Picture */}
            <div className="absolute bottom-0 left-6 transform translate-y-1/2">
              <div className="w-24 h-24 bg-gray-300 rounded-full border-4 border-white flex items-center justify-center overflow-hidden">
                {profile?.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ${profile?.profilePicture ? 'hidden' : ''}`}>
                  <BuildingOfficeIcon className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-16 pb-6 px-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {/* Brand/Company Name */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile?.fullName?.toUpperCase() || 'BRAND NAME'}
                </h1>
                
                {/* Company Type and Role */}
                <div className="flex items-center gap-4 mb-2">
                  {profile?.businessType && (
                    <span className="text-lg text-gray-600">
                      {profile.businessType} Company
                    </span>
                  )}
                  {profile?.role && (
                    <span className="text-lg text-gray-600">
                      • {profile.role}
                    </span>
                  )}
                </div>
                
                {/* Rating */}
                {profile?.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold text-gray-900">
                      {typeof profile.rating === 'number' ? profile.rating.toFixed(1) : parseFloat(String(profile.rating)).toFixed(1)}
                    </span>
                    <span className="text-gray-600">({profile.rating > 1000 ? formatFollowerCount(profile.rating) : profile.rating} reviews)</span>
                  </div>
                )}
                
                {/* Profile Completion Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Complete Your Profile</span>
                    <span className="text-sm text-gray-500">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={fetchProfile}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors flex items-center gap-2"
                  >
                    🔄 Refresh Profile
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                    <BookmarkIcon className="w-4 h-4" />
                    Save for later
                  </button>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors flex items-center gap-2">
                    <ShareIcon className="w-4 h-4" />
                    Share Profile
                  </button>
                </div>
                
                {/* Debug Info Panel - Show current profile data */}
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info - Current Profile Data:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-yellow-700">
                    <p>fullName: {profile?.fullName || 'NOT SET'}</p>
                    <p>email: {profile?.email || 'NOT SET'}</p>
                    <p>phone: {profile?.phone || 'NOT SET'}</p>
                    <p>city: {profile?.city || 'NOT SET'}</p>
                    <p>businessType: {profile?.businessType || 'NOT SET'}</p>
                    <p>role: {profile?.role || 'NOT SET'}</p>
                    <p>websiteUrl: {profile?.websiteUrl || 'NOT SET'}</p>
                    <p>bio: {profile?.bio || 'NOT SET'}</p>
                    <p>languages: {profile?.languages?.join(', ') || 'NOT SET'}</p>
                    <p>categories: {profile?.categories?.join(', ') || 'NOT SET'}</p>
                  </div>
                  
                  {/* Raw Backend Data Debug */}
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <h5 className="text-xs font-semibold text-red-800 mb-2">Raw Backend Data (Check Console for Full Data):</h5>
                    <div className="text-xs text-red-700">
                      <p>Backend Keys: {Object.keys(profile || {}).join(', ')}</p>
                      <p>Check browser console for detailed backend response</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Following - EXACTLY like creator dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Facebook */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <FaFacebook className="w-8 h-8 text-blue-500" />
              <button className="text-blue-500 text-sm font-medium hover:underline">Connect</button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Facebook Followers</h3>
            <p className="text-2xl font-bold text-gray-900">
              {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'facebook')?.follower_count 
                ? formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'facebook')!.follower_count)
                : '0'}
            </p>
          </div>

          {/* YouTube */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <FaYoutube className="w-8 h-8 text-red-500" />
              <button className="text-red-500 text-sm font-medium hover:underline">Connect</button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Youtube Subscribers</h3>
            <p className="text-2xl font-bold text-gray-900">
              {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'youtube')?.follower_count 
                ? formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'youtube')!.follower_count)
                : '1m'}
            </p>
          </div>

          {/* LinkedIn */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <FaLinkedin className="w-8 h-8 text-blue-600" />
              <button className="text-blue-600 text-sm font-medium hover:underline">Connect</button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">LinkedIn Followers</h3>
            <p className="text-2xl font-bold text-gray-900">
              {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'linkedin')?.follower_count 
                ? formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'linkedin')!.follower_count)
                : '2.5k'}
            </p>
          </div>

          {/* Instagram */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-pink-500">
            <div className="flex items-center justify-between mb-4">
              <FaInstagram className="w-8 h-8 text-pink-500" />
              <button className="text-pink-500 text-sm font-medium hover:underline">Connect</button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Instagram Followers</h3>
            <p className="text-2xl font-bold text-gray-900">
              {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'instagram')?.follower_count 
                ? formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'instagram')!.follower_count)
                : '15k'}
            </p>
          </div>
        </div>

        {/* Categories - EXACTLY like creator dashboard */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          <div className="flex flex-wrap gap-3">
            {profile?.categories && profile.categories.length > 0 ? (
              profile.categories.map((category, index) => (
                <button
                  key={index}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors"
                >
                  {category}
                </button>
              ))
            ) : (
              <>
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors">
                  Fashion
                </button>
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors">
                  Business
                </button>
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors">
                  Technology
                </button>
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors">
                  Lifestyle
                </button>
              </>
            )}
          </div>
        </div>

        {/* About Me - EXACTLY like creator dashboard */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About My Business</h3>
          <p className="text-gray-700 leading-relaxed">
            {profile?.bio || 'We are a dynamic brand focused on creating meaningful connections with our audience through innovative campaigns and authentic partnerships with creators.'}
          </p>
        </div>

        {/* Company Details Grid - All fields collected during onboarding */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Business Type */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Business Type</p>
                <p className="font-medium text-gray-900">{profile?.businessType || 'Not specified'}</p>
              </div>
            </div>
            
            {/* Role */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Your Role</p>
                <p className="font-medium text-gray-900">{profile?.role || 'Not specified'}</p>
              </div>
            </div>
            
            {/* Website */}
            {profile?.websiteUrl && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <GlobeAltIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                    {profile.websiteUrl}
                  </a>
                </div>
              </div>
            )}
            
            {/* Email */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <EnvelopeIcon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{profile?.email || 'Not specified'}</p>
              </div>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <PhoneIcon className="w-5 h-5 text-gray-500" />
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{profile?.phone || 'Not specified'}</p>
            </div>
            
            {/* Languages */}
            {profile?.languages && profile.languages.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <LanguageIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Languages</p>
                  <p className="font-medium text-gray-900">{profile.languages.join(', ')}</p>
                </div>
              </div>
            )}
            
            {/* City */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPinIcon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">
                  {profile?.city || 'Not specified'}{profile?.state && `, ${profile.state}`}{profile?.pincode && ` ${profile.pincode}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - EXACTLY like creator dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <ListBulletIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Packages</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.packages?.length || 0}</p>
              </div>
              <CubeIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Items</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.portfolio_items?.length || 0}</p>
              </div>
              <BriefcaseIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹12,450</p>
              </div>
              <WalletIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Recent Activity - EXACTLY like creator dashboard */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New package &quot;Instagram Reel Package&quot; created</span>
              <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Portfolio item &quot;Fashion Shoot&quot; uploaded</span>
              <span className="text-xs text-gray-400 ml-auto">1 day ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Order #1234 completed successfully</span>
              <span className="text-xs text-gray-400 ml-auto">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Brand Dashboard</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowCartModal(true)}
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>
            {/* Notification Bell */}
            <div className="relative notification-popup-container">
              <button 
                onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
              <BellIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
              </span>
            </button>
              
              {/* Notification Popup */}
              {showNotificationPopup && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 text-base">NOTIFICATIONS</h3>
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {notifications.filter(n => !n.read).length.toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Notification Entries */}
                  <div className="py-2 max-h-96 overflow-y-auto">
                    {notifications.map((notification, index) => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                          index < notifications.length - 1 ? 'border-b border-gray-100' : ''
                        } ${!notification.read ? 'bg-blue-50' : ''}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-8 h-8 bg-${notification.color}-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                            {notification.icon === 'check' && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {notification.icon === 'order' && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            )}
                            {notification.icon === 'brand' && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            {notification.message && (
                              <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                            )}
                            <div className="flex justify-between items-center mt-2">
                              {notification.time && (
                                <p className="text-xs text-gray-500">{notification.time}</p>
                              )}
                              {notification.percentage && (
                                <p className="text-xs text-gray-500">{notification.percentage}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          {notification.action && (
                            <button 
                              onClick={() => handleNotificationAction(notification.action.type, notification.action.data)}
                              className="bg-orange-500 text-white text-xs px-3 py-1 rounded hover:bg-orange-600 transition-colors ml-3"
                            >
                              {notification.action.label}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-gray-200">
                    <button 
                      onClick={() => handleNotificationAction('seeAll')}
                      className="w-full text-center text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
                    >
                      See All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Icon */}
            <div className="relative profile-dropdown-container">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <UserIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                1
              </span>
            </button>
              
              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 text-lg">{profile?.fullName || 'Brand'}</h3>
                      <button 
                        onClick={() => setShowProfileDropdown(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
               </div>
                    <p className="text-sm text-gray-600">Brand</p>
               </div>
                  
                  {/* Navigation Options */}
                  <div className="py-2">
                    <button
                      onClick={() => handleProfileAction('profile')}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <UserIcon className="w-5 h-5" />
                      My Profile
                    </button>
                    <button
                      onClick={() => handleProfileAction('edit')}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <PencilIcon className="w-5 h-5" />
                      Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      Log Out
                    </button>
             </div>
                  
                  {/* Profile Completion */}
                  <div className="px-4 py-3 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Complete Your Profile</span>
                      <span className="text-sm text-gray-500">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="px-4 py-3 border-t border-gray-200 space-y-2">
                    <button className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                      <BookmarkIcon className="w-4 h-4" />
                      Save for later
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                      <ShareIcon className="w-4 h-4" />
                      Share Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">i</span>
              </div>
              <span className="text-xl font-bold text-gray-900">influmojo</span>
            </div>
            
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'orderList') {
                      router.push('/dashboard/brand/orders');
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="max-w-full">
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        onSave={handleSaveProfile}
        profile={profile}
      />

    </div>
  );
}
