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
  ChartBarIcon,
  BookmarkIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { FaFacebook, FaYoutube, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { profileAPI, ordersAPI } from '@/services/apiService';
import CreatorDiscovery from '@/components/CreatorDiscovery';
import CartModal from '@/components/modals/CartModal';
import CreatorProfileModal from '@/components/modals/CreatorProfileModal';
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
  recentOrders?: any[]; // Recent orders for dashboard preview
  kyc_status?: string;
  verification_status?: string;
  rating?: number;
  average_response_time?: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon, href: '/dashboard/brand' },
  { id: 'insights', label: 'Insights', icon: ChartBarIcon, href: '/dashboard/brand/insights' },
  { id: 'orders', label: 'Orders', icon: ListBulletIcon, href: '/dashboard/brand/orders' },
  { id: 'profile', label: 'Profile', icon: UserIcon, href: '/dashboard/brand/profile' },
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
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showCreatorProfileModal, setShowCreatorProfileModal] = useState(false);

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

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Clear sessionStorage as well
    sessionStorage.clear();
    // Redirect to login
    router.push('/login');
  };

  const renderMainContent = () => {
    if (activeTab === 'home') {
      return (
        <div className="space-y-6">
            {/* Welcome Section - NEW ADDITION */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {profile?.fullName || 'Brand'}! 👋
                  </h2>
                  <p className="text-gray-700">
                    Discover amazing creators to collaborate with and grow your brand presence across all platforms.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats - NEW ADDITION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available Creators</p>
                    <p className="text-2xl font-bold text-gray-900">150+</p>
                  </div>
                  <UserGroupIcon className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Platforms</p>
                    <p className="text-2xl font-bold text-gray-900">6</p>
                  </div>
                  <GlobeAltIcon className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-gray-900">12+</p>
                  </div>
                  <CubeIcon className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Creator Discovery Section - ENHANCED WITH PLATFORM GROUPING */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Discover Creators</h3>
                  <p className="text-gray-600">Find the perfect creators for your next campaign</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Filter by platform, category, and more</span>
                </div>
              </div>
              
        <CreatorDiscovery
                onViewCreatorProfile={(creatorId, creatorData) => {
                  // Open creator profile modal with existing data
                  setSelectedCreatorId(creatorId);
                  setSelectedCreator(creatorData);
                  setShowCreatorProfileModal(true);
                }}
                showAddToCart={true}
              />
            </div>
          </div>
      );
    }

    if (activeTab === 'packages') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Packages</h3>
            <button 
              onClick={() => alert('Package creation coming soon for brands')}
              className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Create Package
            </button>
          </div>
          
          {profile?.packages && profile.packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.packages.map((pkg) => (
                <div key={pkg.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{pkg.title}</h4>
                    <span className="text-orange-500 font-bold">₹{pkg.price}</span>
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
              <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No packages yet</h3>
              <p className="text-gray-500 mb-4">Create your first package to start earning</p>
              <button 
                onClick={() => alert('Package creation coming soon for brands')}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Create Package
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

    if (activeTab === 'orders') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Orders</h3>
            <button 
              onClick={() => router.push('/dashboard/brand/orders')}
              className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              View All Orders
            </button>
          </div>
          
          {/* Recent Orders Preview */}
          <div className="space-y-4">
            {profile?.recentOrders && profile.recentOrders.length > 0 ? (
              profile.recentOrders.slice(0, 3).map((order: any) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {order.package?.title || 'Package Order'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Order #{order.id.slice(-6)} • {order.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">
                        ₹{order.total_amount || order.package?.price || 0}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ListBulletIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-500 mb-4">Start by purchasing packages from creators</p>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Browse Creators
                </button>
              </div>
            )}
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
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <BellIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                12
              </span>
            </button>
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <EnvelopeIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                1
              </span>
            </button>
                         <div className="flex items-center gap-3">
               <div className="text-right">
                 <p className="text-sm font-medium text-gray-900">
                   {profile?.fullName || 'User'}
                 </p>
                 <p className="text-xs text-gray-500">
                   {profile?.email || 'user@example.com'}
                 </p>
               </div>
               <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                 <UserIcon className="w-5 h-5 text-gray-600" />
               </div>
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
                  onClick={() => setActiveTab(item.id)}
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
        <div className="flex-1 p-6">
          {renderMainContent()}
        </div>
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
      />

      {/* Creator Profile Modal */}
      <CreatorProfileModal
        isOpen={showCreatorProfileModal}
        onClose={() => setShowCreatorProfileModal(false)}
        creator={selectedCreator}
      />
    </div>
  );
}
