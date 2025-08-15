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
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { FaFacebook, FaYoutube, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { profileAPI } from '@/services/apiService';
import CreatePackageModal from '@/components/CreatePackageModal';
import CreatePortfolioModal from '@/components/CreatePortfolioModal';
import EditPackageModal from '@/components/EditPackageModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
}

// Update the Package interface to match the actual backend structure
interface Package {
  id: string;
  title: string;
  description?: string;
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
  type: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Interface for backend package data structure
interface BackendPackage {
  id?: string;
  title?: string;
  description?: string;
  price?: number | string;
  currency?: string;
  deliverables?: {
    platform?: string;
    content_type?: string;
    quantity?: number;
    revisions?: number;
    duration1?: string;
    duration2?: string;
  };
  platform?: string;
  content_type?: string;
  quantity?: number;
  revisions?: number;
  duration1?: string;
  duration2?: string;
  type?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Update the PortfolioItem interface to match the backend response
interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  media_url: string; // Backend field name
  media_type: string; // Backend field name
  file_size: number; // Backend field name
  mime_type?: string;
  created_at?: string;
  updated_at?: string;
}

interface SocialMediaAccount {
  platform: string;
  username: string;
  follower_count: number;
  engagement_rate: number;
  verified: boolean;
}

interface CreatorProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  coverImage?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  state?: string;
  pincode?: string;
  languages: string[];
  content_categories: string[];
  social_media_accounts: SocialMediaAccount[];
  portfolio_items: PortfolioItem[];
  packages: Package[];
  kyc_status?: string;
  verification_status?: string;
  rating?: number;
  average_response_time?: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon, href: '/dashboard/creator' },
  { id: 'insights', label: 'Insights', icon: ChartBarIcon, href: '/dashboard/creator/insights' },
  { id: 'orders', label: 'Orders', icon: ListBulletIcon, href: '/dashboard/creator/orders' },
  { id: 'profile', label: 'Profile', icon: UserIcon, href: '/dashboard/creator/profile' },
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

// Transform backend data to match frontend expected structure
const transformBackendData = (backendData: Record<string, unknown>): CreatorProfile => {
  const getString = (key: string, fallback = ''): string => {
    const value = backendData[key];
    return typeof value === 'string' ? value : fallback;
  };
  
  const getNumber = (key: string, fallback = 0): number => {
    const value = backendData[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };
  
  const user = backendData.user as Record<string, unknown> | undefined;
  
  // Transform packages to extract fields from deliverables
  const transformPackages = (packages: unknown[]): Package[] => {
    if (!Array.isArray(packages)) return [];
    
    return packages.map(pkg => {
      const backendPkg = pkg as BackendPackage;
      return {
        id: backendPkg.id || '',
        title: backendPkg.title || '',
        description: backendPkg.description || '',
        price: typeof backendPkg.price === 'number' ? backendPkg.price : parseFloat(String(backendPkg.price || '0')),
        currency: backendPkg.currency || 'USD',
        deliverables: {
          platform: backendPkg.deliverables?.platform || backendPkg.platform || '',
          content_type: backendPkg.deliverables?.content_type || backendPkg.content_type || '',
          quantity: backendPkg.deliverables?.quantity || backendPkg.quantity || 1,
          revisions: backendPkg.deliverables?.revisions || backendPkg.revisions || 0,
          duration1: backendPkg.deliverables?.duration1 || backendPkg.duration1 || '1 Minute',
          duration2: backendPkg.deliverables?.duration2 || backendPkg.duration2 || '30 Seconds'
        },
        type: backendPkg.type || 'predefined',
        is_active: backendPkg.is_active !== false,
        created_at: backendPkg.created_at,
        updated_at: backendPkg.updated_at
      };
    });
  };
  
  return {
    id: getString('id') || getString('user_id') || '',
    fullName: getString('fullName') || getString('full_name') || getString('name') || (user ? (user.email as string) || '' : '') || 'Creator Name',
    email: getString('email') || (user ? (user.email as string) || '' : '') || '',
    phone: getString('phone') || (user ? (user.phone as string) || '' : '') || '',
    profilePicture: getString('profilePicture') || getString('profile_picture') || getString('avatar') || '',
    coverImage: getString('coverImage') || getString('cover_image') || '',
    bio: getString('bio') || getString('about') || '',
    dateOfBirth: getString('dateOfBirth') || getString('date_of_birth') || getString('dob') || '',
    gender: getString('gender') || '',
    city: getString('city') || getString('location_city') || getString('address_city') || '',
    state: getString('state') || getString('location_state') || getString('address_state') || '',
    pincode: getString('pincode') || getString('pin_code') || getString('postal_code') || '',
    languages: (backendData.languages as string[]) || (backendData.language as string[]) || [],
    content_categories: (backendData.content_categories as string[]) || (backendData.categories as string[]) || (backendData.interests as string[]) || [],
    social_media_accounts: (backendData.social_media_accounts as SocialMediaAccount[]) || (backendData.social_accounts as SocialMediaAccount[]) || (backendData.platforms as SocialMediaAccount[]) || [],
    portfolio_items: (backendData.portfolio_items as PortfolioItem[]) || (backendData.portfolio as PortfolioItem[]) || (backendData.works as PortfolioItem[]) || [],
    packages: transformPackages(backendData.packages as unknown[] || []),
    kyc_status: getString('kyc_status') || getString('kyc_verified') || '',
    verification_status: getString('verification_status') || getString('verified') || '',
    rating: getNumber('rating') || 0,
    average_response_time: getString('average_response_time') || getString('response_time') || '1HR - 3HR',
  };
};

export default function CreatorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  const [showEditPackage, setShowEditPackage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching creator profile...');
      console.log('🔍 Token from localStorage:', localStorage.getItem('token'));
      
      const response = await profileAPI.getCreatorProfile();
      console.log('🔍 Raw API response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Creator profile fetched successfully:', response.data);
        console.log('🔍 Profile data breakdown:');
        console.log('  - fullName:', response.data.fullName);
        console.log('  - email:', response.data.email);
        console.log('  - phone:', response.data.phone);
        console.log('  - city:', response.data.city);
        console.log('  - state:', response.data.state);
        console.log('  - gender:', response.data.gender);
        console.log('  - languages:', response.data.languages);
        console.log('  - content_categories:', response.data.content_categories);
        console.log('  - social_media_accounts:', response.data.social_media_accounts);
        console.log('  - packages:', response.data.packages);
        console.log('  - portfolio_items:', response.data.portfolio_items);
        console.log('  - rating:', response.data.rating);
        console.log('  - bio:', response.data.bio);
        
        // Log the complete response structure to see actual field names
        console.log('🔍 Complete API response structure:', JSON.stringify(response.data, null, 2));
        console.log('🔍 All available keys:', Object.keys(response.data));
        
        // Transform backend data to match frontend expected structure
        const transformedProfile = transformBackendData(response.data);
        console.log('🔍 Transformed profile data:', transformedProfile);
        
        setProfile(transformedProfile);
      } else {
        console.error('❌ Failed to fetch creator profile:', response.error);
        console.error('❌ Response details:', response);
        setError(response.error || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('❌ Error loading creator profile:', err);
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

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setShowEditPackage(true);
  };

  const handleDeletePackage = (packageId: string) => {
    setDeletingPackageId(packageId);
    setShowDeleteModal(true);
  };

  const handlePackageUpdated = () => {
    fetchProfile();
    setShowEditPackage(false);
    setEditingPackage(null);
  };

  const handlePackageDeleted = async () => {
    if (!deletingPackageId) return;
    
    try {
      await profileAPI.deletePackage(deletingPackageId);
      alert('Package deleted successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Delete package error:', error);
      alert('Failed to delete package. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setDeletingPackageId(null);
    }
  };

  const renderMainContent = () => {
    if (activeTab === 'packages') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Packages</h3>
            <button 
              onClick={() => setShowCreatePackage(true)}
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
                    <h4 className="font-semibold text-gray-900">
                      {pkg.title}
                    </h4>
                    <span className="text-orange-500 font-bold">₹{pkg.price}</span>
                  </div>
                  {pkg.description && (
                    <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span>Duration: {pkg.deliverables.duration1} {pkg.deliverables.duration2}</span>
                    <span>Quantity: {pkg.deliverables.quantity}</span>
                    <span>Revisions: {pkg.deliverables.revisions}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{pkg.deliverables.platform}</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{pkg.deliverables.content_type}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditPackage(pkg)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors"
                    >
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
                onClick={() => setShowCreatePackage(true)}
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
              onClick={() => setShowCreatePortfolio(true)}
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
                  <div className="bg-gray-100 rounded-lg h-32 mb-3 flex items-center justify-center overflow-hidden">
                    {item.media_type === 'image' ? (
                      <img 
                        src={item.media_url} 
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <DocumentTextIcon className={`w-12 h-12 text-gray-400 ${item.media_type === 'image' ? 'hidden' : ''}`} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{item.media_type}</p>
                  <p className="text-gray-500 text-xs">
                    {item.file_size ? (item.file_size / 1024 / 1024).toFixed(2) : 'Unknown'} MB
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio items yet</h3>
              <p className="text-gray-500 mb-4">Add your work to showcase your skills</p>
              <button 
                onClick={() => setShowCreatePortfolio(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Add Portfolio Item
              </button>
            </div>
          )}
        </div>
      );
    }

    // Default dashboard view - EXACTLY matching the screenshot
    return (
      <div className="space-y-6">
        {/* Profile Header - EXACTLY like screenshot */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Large Orange Banner */}
          <div className="relative h-48 bg-gradient-to-r from-orange-500 to-orange-600">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600"></div>
            
            {/* Large Text "KATY INFLUENCER" */}
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wider">
                {profile?.fullName ? `${profile.fullName.toUpperCase()} INFLUENCER` : 'CREATOR INFLUENCER'}
              </h1>
            </div>
            
            {/* Profile Picture overlapping the banner */}
            <div className="absolute -bottom-16 left-8">
              {profile?.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.fullName}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Info Section */}
          <div className="pt-20 pb-6 px-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {/* Name and Verification Badge */}
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile?.fullName || 'Creator Name'}
                  </h2>
                  {profile?.verification_status === 'verified' && (
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
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
                    onClick={() => setShowCreatePackage(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Create Package
                  </button>
                  <button 
                    onClick={() => setShowCreatePortfolio(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Portfolio
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

        {/* Social Media Following - EXACTLY like screenshot */}
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
                : '2.5k'}
            </p>
          </div>
        </div>

        {/* Categories - EXACTLY like screenshot */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          <div className="flex flex-wrap gap-3">
            {profile?.content_categories && profile.content_categories.length > 0 ? (
              profile.content_categories.map((category, index) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    index % 3 === 0 ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                    index % 3 === 1 ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  }`}
                >
                  {category}
                </button>
              ))
            ) : (
              <>
                <button className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200">
                  Beauty
                </button>
                <button className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200">
                  Fashion
                </button>
                <button className="px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 hover:bg-purple-200">
                  Lifestyle
                </button>
              </>
            )}
          </div>
        </div>

        {/* About Me - EXACTLY like screenshot */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">
              {profile?.bio || 
                "Katy is more than just an influencer—she&apos;s a storyteller of style and self-care. With a warm, relatable presence and a strong voice in the digital space, she connects with her audience by celebrating confidence, individuality, and intentional living. she shares daily fashion inspiration, skincare tips, and glimpses into her mindful lifestyle. Her feed is a curated mix of bold outfits, behind-the-scenes moments, and honest product reviews."}
            </p>
          </div>
        </div>

        {/* Personal Details - EXACTLY like screenshot */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile?.gender && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <UserIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium text-gray-900">{profile.gender}</p>
                </div>
              </div>
            )}
            
            {profile?.average_response_time && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ClockIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Response Time</p>
                  <p className="font-medium text-gray-900">{profile.average_response_time}</p>
                </div>
              </div>
            )}
            
            {profile?.email && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email ID</p>
                  <p className="font-medium text-gray-900">{profile.email}</p>
                </div>
              </div>
            )}
            
            {profile?.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <PhoneIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Mobile Number</p>
                  <p className="font-medium text-gray-900">{profile.phone}</p>
                </div>
              </div>
            )}
            
            {profile?.languages && profile.languages.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <LanguageIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Languages</p>
                  <p className="font-medium text-gray-900">{profile.languages.join(', ')}</p>
                </div>
              </div>
            )}
            
            {profile?.city && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPinIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">
                    {profile.city}{profile.state && `, ${profile.state}`}{profile.pincode && ` ${profile.pincode}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
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
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹12,450</p>
              </div>
              <WalletIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Packages Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Packages</h3>
            <button 
              onClick={() => setShowCreatePackage(true)}
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
                    <h4 className="font-semibold text-gray-900">
                      {pkg.title}
                    </h4>
                    <span className="text-orange-500 font-bold">₹{pkg.price}</span>
                  </div>
                  {pkg.description && (
                    <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span>Duration: {pkg.deliverables.duration1} {pkg.deliverables.duration2}</span>
                    <span>Quantity: {pkg.deliverables.quantity}</span>
                    <span>Revisions: {pkg.deliverables.revisions}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{pkg.deliverables.platform}</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{pkg.deliverables.content_type}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditPackage(pkg)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors"
                    >
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
                onClick={() => setShowCreatePackage(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Create Package
              </button>
            </div>
          )}
        </div>

        {/* Portfolio Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Portfolio</h3>
            <button 
              onClick={() => setShowCreatePortfolio(true)}
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
                  <div className="bg-gray-100 rounded-lg h-32 mb-3 flex items-center justify-center overflow-hidden">
                    {item.media_type === 'image' ? (
                      <img 
                        src={item.media_url} 
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <DocumentTextIcon className={`w-12 h-12 text-gray-400 ${item.media_type === 'image' ? 'hidden' : ''}`} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{item.media_type}</p>
                  <p className="text-gray-500 text-xs">
                    {item.file_size ? (item.file_size / 1024 / 1024).toFixed(2) : 'Unknown'} MB
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio items yet</h3>
              <p className="text-gray-500 mb-4">Add your first portfolio item to showcase your work</p>
              <button 
                onClick={() => setShowCreatePortfolio(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Add Portfolio Item
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
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
          <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ShoppingCartIcon className="w-6 h-6" />
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

      {/* Modals */}
      {showCreatePackage && (
        <CreatePackageModal
          isOpen={showCreatePackage}
          onClose={() => setShowCreatePackage(false)}
          onPackageCreated={() => {
            setShowCreatePackage(false);
            fetchProfile(); // Refresh profile to show new package
          }}
        />
      )}

      {showCreatePortfolio && (
        <CreatePortfolioModal
          isOpen={showCreatePortfolio}
          onClose={() => setShowCreatePortfolio(false)}
          onPortfolioCreated={() => {
            setShowCreatePortfolio(false);
            fetchProfile(); // Refresh profile to show new portfolio item
          }}
        />
      )}

      {/* Edit Package Modal */}
      {showEditPackage && editingPackage && (
        <EditPackageModal
          isOpen={showEditPackage}
          onClose={() => {
            setShowEditPackage(false);
            setEditingPackage(null);
          }}
          onPackageUpdated={handlePackageUpdated}
          package={editingPackage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingPackageId(null);
          }}
          onConfirm={handlePackageDeleted}
          title="Delete Package"
          message={`Are you sure you want to delete this package? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="#DC2626"
        />
      )}
    </div>
  );
}
