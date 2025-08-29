'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
  CameraIcon,
  LanguageIcon,
  ChartBarIcon,
  BookmarkIcon,
  ShareIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { FaFacebook, FaYoutube, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { profileAPI } from '@/services/apiService';
import { toast } from 'react-hot-toast';
import CreatePackageModal from '@/components/CreatePackageModal';
import CreatePortfolioModal from '@/components/CreatePortfolioModal';
import EditPackageModal from '@/components/EditPackageModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import EditProfileModal from '@/components/EditProfileModal';
import CartModal from '@/components/modals/CartModal';


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
  hasActiveOrders?: boolean; // Added for active orders indicator
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
  hasActiveOrders?: boolean; // Added for active orders indicator
}

// Update the PortfolioItem interface to match the backend response

// ProfileFormData interface for EditProfileModal
interface ProfileFormData {
  fullName: string;
  gender: string;
  state: string;
  city: string;
  pincode: string;
  languages: string[];
  email: string;
  phone: string;
  about: string;
  categories: string[];
  bio?: string;
  content_categories?: string[];
  coverImage?: File | null;
  profileImage?: File | null;
  coverImageUrl?: string;
  profileImageUrl?: string;
  existingCoverImage?: string;
  existingProfilePicture?: string;
}
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

interface ProfileFormData {
  fullName: string;
  gender: string;
  state: string;
  city: string;
  pincode: string;
  languages: string[];
  email: string;
  phone: string;
  about: string;
  bio?: string;
  categories: string[];
  content_categories?: string[];
  coverImageUrl?: string;
  coverImage?: File | null;
  profileImageUrl?: string;
  profileImage?: File | null;
}

// Transform CreatorProfile to ProfileFormData for the EditProfileModal
function transformProfileToFormData(creatorProfile: CreatorProfile | null): ProfileFormData {
  if (!creatorProfile) {
    return {
      fullName: '',
      gender: '',
      state: '',
      city: '',
      pincode: '',
      languages: [],
      email: '',
      phone: '',
      about: '',
      categories: [],
      bio: '',
      content_categories: [],
      coverImageUrl: '',
      profileImageUrl: ''
    };
  }

  return {
    fullName: creatorProfile.fullName || '',
    gender: creatorProfile.gender || '',
    state: creatorProfile.state || '',
    city: creatorProfile.city || '',
    pincode: creatorProfile.pincode || '',
    languages: creatorProfile.languages || [],
    email: creatorProfile.email || '',
    phone: creatorProfile.phone || '',
    about: creatorProfile.bio || '',
    categories: creatorProfile.content_categories || [],
    bio: creatorProfile.bio || '',
    content_categories: creatorProfile.content_categories || [],
    coverImageUrl: creatorProfile.coverImage || '',
    profileImageUrl: creatorProfile.profilePicture || '',
    existingCoverImage: creatorProfile.coverImage || '',
    existingProfilePicture: creatorProfile.profilePicture || ''
  };
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, href: '/dashboard/creator' },
  { id: 'orderList', label: 'Order List', icon: ListBulletIcon, href: '/dashboard/creator/orders' },
  { id: 'packages', label: 'Packages', icon: CubeIcon, href: '/dashboard/creator' },
  { id: 'portfolio', label: 'Portfolio', icon: BriefcaseIcon, href: '/dashboard/creator' },
  { id: 'reviews', label: 'Reviews', icon: StarIcon, href: '/dashboard/creator' },
  { id: 'chat', label: 'Chat', icon: EnvelopeIcon, href: '/dashboard/creator' },
  { id: 'wallet', label: 'Wallet', icon: WalletIcon, href: '/dashboard/creator' },
  { id: 'helpCenter', label: 'Help Center', icon: DocumentTextIcon, href: '/dashboard/creator' },
  { id: 'privacyPolicy', label: 'Privacy Policy', icon: DocumentTextIcon, href: '/dashboard/creator' },
  { id: 'supportTickets', label: 'Support Tickets', icon: DocumentTextIcon, href: '/dashboard/creator' },
  { id: 'termsOfService', label: 'Terms Of Service', icon: DocumentTextIcon, href: '/dashboard/creator' },
  { id: 'paymentHistory', label: 'Payment History', icon: DocumentTextIcon, href: '/dashboard/creator' },
  { id: 'accountSettings', label: 'Account Settings', icon: UserIcon, href: '/dashboard/creator' },
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
  const getString = (key: string, fallback = '', source?: Record<string, unknown>): string => {
    const dataSource = source || backendData;
    const value = dataSource[key];
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
        updated_at: backendPkg.updated_at,
        hasActiveOrders: backendPkg.hasActiveOrders || false // Add hasActiveOrders to the transformed package
      };
    });
  };
  
  // Enhanced name resolution logic
  const resolveFullName = (): string => {
    // Priority 1: Direct profile fields (from mobile signup or profile updates)
    const directName = getString('fullName') || getString('full_name') || getString('name') || getString('display_name') || getString('user_name') || getString('username');
    
    // Priority 2: User object fields (from Google OAuth or other auth providers)
    const userObjectName = user ? (
      getString('name', '', user) || 
      getString('fullName', '', user) || 
      getString('displayName', '', user) ||
      getString('display_name', '', user) ||
      getString('user_name', '', user) ||
      getString('username', '', user) ||
      (getString('given_name', '', user) + ' ' + getString('family_name', '', user)).trim() ||
      getString('first_name', '', user) + ' ' + getString('last_name', '', user) ||
      getString('firstname', '', user) + ' ' + getString('lastname', '', user)
    ) : '';
    
    // Priority 3: Fallback to email-based name or default
    const emailBasedName = getString('email') ? 
      getString('email').split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
    
    // Priority 4: Check for any other name-like fields in the main data
    const otherNameFields = [
      'title', 'label', 'description', 'bio', 'about'
    ].map(field => getString(field)).filter(name => name && name.length < 50); // Filter out very long text
    
    const otherName = otherNameFields.find(name => 
      name && name.split(' ').length <= 4 && /^[a-zA-Z\s]+$/.test(name)
    );
    
    const finalName = directName || userObjectName || emailBasedName || otherName || 'Creator';
    
    // Debug logging for name resolution
    console.log('🔍 Name Resolution Debug:');
    console.log('  - Direct Name:', directName);
    console.log('  - User Object Name:', userObjectName);
    console.log('  - Email-based Name:', emailBasedName);
    console.log('  - Other Name Fields:', otherNameFields);
    console.log('  - Other Name Found:', otherName);
    console.log('  - Final Name:', finalName);
    console.log('  - User object:', user);
    console.log('  - Backend data keys:', Object.keys(backendData));
    if (user) {
      console.log('  - User object keys:', Object.keys(user));
    }
    
    return finalName;
  };
  
  return {
    id: getString('id') || getString('user_id') || '',
    fullName: resolveFullName(),
    email: getString('email') || (user ? (user.email as string) || '' : '') || '',
    phone: getString('phone') || (user ? (user.phone as string) || '' : '') || '',
    profilePicture: getString('profilePicture') || getString('profile_picture') || getString('avatar') || getString('image') || (user ? getString('picture', '', user) : '') || (user ? getString('image', '', user) : '') || '',
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  const [showEditPackage, setShowEditPackage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showCart, setShowCart] = useState(false);

  
  // Sample notification data - in real app, this would come from API
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'verification',
      title: 'Congratulations! Your profile has been Verified',
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
      type: 'brand',
      title: 'Nike Brand',
      message: 'Need an inspirational Instagram reel like...',
      time: '10 Mins ago',
      icon: 'brand',
      color: 'purple',
      action: null,
      percentage: '60%',
      read: false
    }
  ]);

  useEffect(() => {
    fetchProfile();
  }, []);

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
        
        // Log user object if it exists
        if (response.data.user) {
          console.log('🔍 User object keys:', Object.keys(response.data.user));
          console.log('🔍 User object data:', response.data.user);
        }
        
        // Log specific name-related fields
        console.log('🔍 Name-related fields:');
        console.log('  - fullName:', response.data.fullName);
        console.log('  - full_name:', response.data.full_name);
        console.log('  - name:', response.data.name);
        console.log('  - display_name:', response.data.display_name);
        console.log('  - user_name:', response.data.user_name);
        console.log('  - username:', response.data.username);
        if (response.data.user) {
          console.log('  - user.name:', response.data.user.name);
          console.log('  - user.fullName:', response.data.user.fullName);
          console.log('  - user.displayName:', response.data.user.displayName);
          console.log('  - user.given_name:', response.data.user.given_name);
          console.log('  - user.family_name:', response.data.user.family_name);
        }
        
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
    } catch (error: unknown) {
      console.error('Delete package error:', error);
      
      // Check if it's the specific "active orders" error
      if (error instanceof Error && error.message && error.message.includes('active orders')) {
        alert('Cannot delete package with active orders. Please complete or cancel existing orders first.');
      } else {
        alert('Failed to delete package. Please try again.');
      }
    } finally {
      setShowDeleteModal(false);
      setDeletingPackageId(null);
    }
  };

  const handleEditPortfolio = (item: PortfolioItem) => {
    // TODO: Implement portfolio editing functionality
    console.log('Edit portfolio item:', item);
    alert('Portfolio editing functionality coming soon!');
  };

  const handleDeletePortfolio = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this portfolio item? This action cannot be undone.')) {
      try {
        // TODO: Implement portfolio deletion API call
        console.log('Delete portfolio item:', itemId);
        alert('Portfolio deletion functionality coming soon!');
        // await profileAPI.deletePortfolio(itemId);
        // fetchProfile();
      } catch (error) {
        console.error('Delete portfolio error:', error);
        alert('Failed to delete portfolio item. Please try again.');
      }
    }
  };

  const handleProfileAction = (action: string) => {
    switch (action) {
      case 'profile':
        setActiveTab('profile');
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

    const handleSaveProfile = async (profileData: ProfileFormData) => {
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
        content_categories: profileData.categories || profileData.content_categories,
        coverImage: profileData.coverImageUrl || (profileData.coverImage ? profileData.coverImage.name : undefined),
        profilePicture: profileData.profileImageUrl || (profileData.profileImage ? profileData.profileImage.name : undefined),
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
            gender: profileData.gender || prev.gender,
            state: profileData.state || prev.state,
            city: profileData.city || prev.city,
            pincode: profileData.pincode || prev.pincode,
            languages: profileData.languages || prev.languages,
            email: profileData.email || prev.email,
            phone: profileData.phone || prev.phone,
            // Ensure categories are properly mapped
            content_categories: profileData.categories || profileData.content_categories || prev.content_categories,
            // Ensure images are properly mapped - only use string values
            coverImage: profileData.coverImageUrl || (profileData.coverImage ? profileData.coverImage.name : prev.coverImage),
            profilePicture: profileData.profileImageUrl || (profileData.profileImage ? profileData.profileImage.name : prev.profilePicture),
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



  const renderMainContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome {profile?.fullName || 'Creator'}</h1>
          </div>

          {/* Profile Header - EXACTLY like screenshot */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Large Orange Banner */}
            <div className="relative h-48 bg-orange-500">
              {profile?.coverImage && (
                <Image 
                  src={profile.coverImage} 
                  alt="Cover" 
                  fill
                  className="object-cover"
                />
              )}
              {/* Large Text "KATY INFLUENCER" */}
              <div className="absolute inset-0 flex items-center justify-end pr-8 bg-black bg-opacity-30">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wider">
                  {profile?.fullName ? `${profile.fullName.toUpperCase()} CREATOR` : 'CREATOR INFLUENCER'}
                </h1>
              </div>
              
              {/* Profile Picture overlapping the banner */}
              <div className="absolute -bottom-16 left-8">
                <div className="relative">
                {profile?.profilePicture ? (
                  <Image
                    src={profile.profilePicture}
                    alt={profile.fullName}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                  <button 
                    onClick={() => setShowEditProfileModal(true)}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white hover:bg-orange-600 transition-colors"
                  >
                    <CameraIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Profile Info Section */}
            <div className="pt-20 pb-6 px-8">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Name and Verification Badge */}
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile?.fullName ? profile.fullName.toLowerCase() : 'Creator Name'}
                    </h2>
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">★</span>
                      </div>
                  </div>
                  
                  {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-semibold text-gray-900">
                      {profile?.rating ? (typeof profile.rating === 'number' ? profile.rating.toFixed(1) : parseFloat(String(profile.rating)).toFixed(1)) : '4.5'}
                      </span>
                                         <span className="text-gray-600">({profile?.rating && profile.rating > 1000 ? formatFollowerCount(profile.rating) : '2,256'} reviews)</span>
                    </div>
                </div>
                  
                  {/* Profile Completion Progress */}
                <div className="text-right">
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
                  <div className="flex flex-col gap-2">
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

          {/* Social Media Following Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Social Media Following</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Facebook */}
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <FaFacebook className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">Facebook Followers</p>
                {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'facebook') ? (
                  <p className="text-lg font-semibold text-gray-900">
                    {formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'facebook')!.follower_count)}
                  </p>
                ) : (
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors">
                    Connect
                  </button>
                )}
            </div>

            {/* YouTube */}
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <FaYoutube className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">Youtube Subscribers</p>
                {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'youtube') ? (
                  <p className="text-lg font-semibold text-gray-900">
                    {formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'youtube')!.follower_count)}
                  </p>
                ) : (
                  <span className="text-gray-500 text-sm">Not connected</span>
                )}
                </div>
              
              {/* LinkedIn */}
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <FaLinkedin className="w-8 h-8 text-blue-700 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">Linkedin Followers</p>
                {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'linkedin') ? (
                  <p className="text-lg font-semibold text-gray-900">
                    {formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'linkedin')!.follower_count)}
                  </p>
                ) : (
                  <span className="text-gray-500 text-sm">Not connected</span>
                )}
            </div>

            {/* Instagram */}
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <FaInstagram className="w-8 h-8 text-pink-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">Instagram Followers</p>
                {profile?.social_media_accounts?.find(acc => acc.platform.toLowerCase() === 'instagram') ? (
                  <p className="text-lg font-semibold text-gray-900">
                    {formatFollowerCount(profile.social_media_accounts.find(acc => acc.platform.toLowerCase() === 'instagram')!.follower_count)}
                  </p>
                ) : (
                  <span className="text-gray-500 text-sm">Not connected</span>
                )}
                </div>
              </div>
            </div>

          {/* Categories Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="flex flex-wrap gap-3">
              {profile?.content_categories && profile.content_categories.length > 0 ? (
                profile.content_categories.map((category, index) => (
                  <span key={index} className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                    {category}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 italic">No categories specified</span>
              )}
            </div>
          </div>

          {/* About Me Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
            <div className="space-y-3 text-gray-700">
              {profile?.bio ? (
                <p>{profile.bio}</p>
              ) : (
                <p className="text-gray-500 italic">
                  No bio available. Update your profile to add a description about yourself.
                </p>
              )}
              </div>
            </div>

          {/* Personal Details Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile?.gender && (
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium text-gray-900">{profile.gender}</p>
                </div>
              </div>
              )}

              {profile?.average_response_time && (
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-gray-500" />
                <div>
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="font-medium text-gray-900">{profile.average_response_time}</p>
                </div>
              </div>
              )}
              
              {profile?.email && (
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email ID</p>
                    <p className="font-medium text-gray-900">{profile.email}</p>
            </div>
                    </div>
              )}
              
              {profile?.phone && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Mobile Number</p>
                    <p className="font-medium text-gray-900">{profile.phone}</p>
                    </div>
                    </div>
              )}
              
              {profile?.languages && profile.languages.length > 0 && (
                <div className="flex items-center gap-3">
                  <LanguageIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Languages</p>
                    <p className="font-medium text-gray-900">{profile.languages.join(', ')}</p>
                        </div>
                      </div>
                    )}
                    
              {(profile?.city || profile?.state || profile?.pincode) && (
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">
                      {[profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')}
                    </p>
                    </div>
              </div>
            )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h3>
            <div className="space-y-4">
              {/* Review 1 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">SM</span>
            </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Sandeep Maheswari</h4>
                    <p className="text-sm text-gray-600">Head Marketing 24 June 2024</p>
                    </div>
                  </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Exceptional</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Remarkable</span>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Excellent</span>
                </div>
                <p className="text-gray-700 mb-3">
                  &ldquo;Katy delivered exceptional content that exceeded our expectations. Her creativity and attention to detail 
                  made our campaign a huge success. Highly recommended!&rdquo;
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-900 mr-2">3.5</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon 
                        key={star} 
                        className={`w-4 h-4 ${star <= 3 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                ))}
              </div>
              </div>
          </div>

              {/* Review 2 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">RV</span>
              </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Raja Vamshi</h4>
                    <p className="text-sm text-gray-600">Marketing Manager 22 June 2024</p>
              </div>
              </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Exceptional</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Remarkable</span>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Excellent</span>
                </div>
                <p className="text-gray-700 mb-3">
                  &ldquo;Working with Katy was a pleasure. She understood our brand perfectly and created content that resonated 
                  with our target audience. Great communication throughout the project.&rdquo;
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-900 mr-2">3.8</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon 
                        key={star} 
                        className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'packages') {
      return (
        <div className="space-y-6">
          {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome {profile?.fullName || 'Creator'}</h1>
                <div className="text-gray-600">
                  <span className="text-orange-500">Packages List</span> &gt; Packages
          </div>
              </div>
              <div className="flex items-center gap-4">
               
                <div className="relative notification-popup-container">
           
                  
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
                <div className="relative">
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
                          <h3 className="font-bold text-gray-900 text-lg">{profile?.fullName || 'Creator'}</h3>
              <button 
                            onClick={() => setShowProfileDropdown(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                            <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
                        <p className="text-sm text-gray-600">Influencer</p>
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

          {/* Main Content */}
          <div className="bg-gray-50 p-6 rounded-lg">
            {/* Introduction Section */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">List Your Social packages for Start Earning!</h2>
                  <p className="text-gray-600 mb-3">
                    Set your rates, define your deliverables, and let brands know what you offer across Instagram, YouTube, Facebook, and more. We Influmojo charge 15% fees. so make sure you include that in you package.
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">Rate calculator</button>
          </div>
                <button 
                  onClick={() => setShowCreatePackage(true)}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 ml-6"
                >
                  <PlusIcon className="w-5 h-5" />
                  Create Package
                </button>
            </div>
          </div>

            {/* Packages List */}
            {profile?.packages && profile.packages.length > 0 ? (
              <div className="space-y-6">
                {/* Instagram Packages */}
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
            </div>
                    <h3 className="text-lg font-semibold text-gray-900">Instagram Packages</h3>
          </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.packages.filter(pkg => pkg.deliverables.platform.toUpperCase() === 'INSTAGRAM').map((pkg) => (
                      <div key={pkg.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">
                        {/* Platform Icon */}
                        <div className="absolute top-3 right-3 flex gap-2">
                <button
                            onClick={() => handleEditPackage(pkg)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                </button>
                          <button 
                            onClick={() => handleDeletePackage(pkg.id)}
                            disabled={pkg.hasActiveOrders}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title={pkg.hasActiveOrders ? 'Cannot delete package with active orders' : 'Delete package'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                </button>
        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
          </div>
                <div>
                            <h4 className="font-semibold text-gray-900">{pkg.title}</h4>
                </div>
              </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{pkg.description}</p>
                        
                        <div className="space-y-2 mb-4 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Min Duration: {pkg.deliverables.duration1}</span>
                            {pkg.deliverables.duration2 && pkg.deliverables.duration2 !== pkg.deliverables.duration1 && (
                              <span>Max Duration: {pkg.deliverables.duration2}</span>
                            )}
                </div>
                          <div className="flex justify-between">
                            <span>Quantity: {pkg.deliverables.quantity}</span>
                            <span>Revisions: {pkg.deliverables.revisions}</span>
              </div>
                </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-orange-500 font-bold text-lg">₹{pkg.price.toLocaleString('en-IN')}</span>
                          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-2">
                            <ShoppingCartIcon className="w-4 h-4" />
                            Add To Cart
                          </button>
                </div>
              </div>
                    ))}
          </div>
        </div>

                {/* Facebook Packages */}
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
              </div>
                    <h3 className="text-lg font-semibold text-gray-900">Facebook Packages</h3>
            </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.packages.filter(pkg => pkg.deliverables.platform.toUpperCase() === 'FACEBOOK').map((pkg) => (
                      <div key={pkg.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">
                        {/* Platform Icon */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button 
                            onClick={() => handleEditPackage(pkg)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePackage(pkg.id)}
                            disabled={pkg.hasActiveOrders}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title={pkg.hasActiveOrders ? 'Cannot delete package with active orders' : 'Delete package'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
          </div>
          
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
              </div>
              <div>
                            <h4 className="font-semibold text-gray-900">{pkg.title}</h4>
            </div>
          </div>
          
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{pkg.description}</p>
                        
                        <div className="space-y-2 mb-4 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Min Duration: {pkg.deliverables.duration1}</span>
                            {pkg.deliverables.duration2 && pkg.deliverables.duration2 !== pkg.deliverables.duration1 && (
                              <span>Max Duration: {pkg.deliverables.duration2}</span>
                            )}
              </div>
                          <div className="flex justify-between">
                            <span>Quantity: {pkg.deliverables.quantity}</span>
                            <span>Revisions: {pkg.deliverables.revisions}</span>
          </div>
        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-orange-500 font-bold text-lg">₹{pkg.price.toLocaleString('en-IN')}</span>
                          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-2">
                            <ShoppingCartIcon className="w-4 h-4" />
                            Add To Cart
            </button>
          </div>
                  </div>
                    ))}
                  </div>
                  </div>
                  
                {/* YouTube Packages */}
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      </div>
                    <h3 className="text-lg font-semibold text-gray-900">Youtube Packages</h3>
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.packages.filter(pkg => pkg.deliverables.platform.toUpperCase() === 'YOUTUBE').map((pkg) => (
                      <div key={pkg.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">
                        {/* Platform Icon */}
                        <div className="absolute top-3 right-3 flex gap-2">
                    <button 
                      onClick={() => handleEditPackage(pkg)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                            <PencilIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePackage(pkg.id)}
                      disabled={pkg.hasActiveOrders}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title={pkg.hasActiveOrders ? 'Cannot delete package with active orders' : 'Delete package'}
                    >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{pkg.title}</h4>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{pkg.description}</p>
                        
                        <div className="space-y-2 mb-4 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Min Duration: {pkg.deliverables.duration1}</span>
                            {pkg.deliverables.duration2 && pkg.deliverables.duration2 !== pkg.deliverables.duration1 && (
                              <span>Max Duration: {pkg.deliverables.duration2}</span>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span>Quantity: {pkg.deliverables.quantity}</span>
                            <span>Revisions: {pkg.deliverables.revisions}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-orange-500 font-bold text-lg">₹{pkg.price.toLocaleString('en-IN')}</span>
                          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-2">
                            <ShoppingCartIcon className="w-4 h-4" />
                            Add To Cart
                    </button>
                  </div>
                </div>
              ))}
                  </div>
                </div>
            </div>
          ) : (
              <div className="text-center py-12">
                <CubeIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No packages yet</h3>
                <p className="text-gray-500 mb-6">Create your first package to start earning</p>
              <button 
                onClick={() => setShowCreatePackage(true)}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Create Package
              </button>
            </div>
          )}
        </div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {profile.portfolio_items.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Image Container */}
                  <div className="bg-gray-100 rounded-lg aspect-square overflow-hidden relative">
                    {item.media_type === 'image' && item.media_url ? (
                      <Image 
                        src={item.media_url} 
                        alt={item.title}
                        fill
                        className="object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <DocumentTextIcon className="w-8 h-8 text-gray-400 absolute inset-0 m-auto" />
                    )}
                    
                    {/* Edit/Delete Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditPortfolio(item)}
                          className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4 text-white" />
                        </button>
                        <button 
                          onClick={() => handleDeletePortfolio(item.id)}
                          className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
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

    if (activeTab === 'orders') {
      // Redirect to orders page
      router.push('/dashboard/creator/orders');
      return null;
    }

    if (activeTab === 'insights') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Creator Insights</h3>
          <div className="text-center py-8">
            <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Insights Coming Soon</h3>
            <p className="text-gray-500 mb-4">Analytics and performance metrics will be available here</p>
            </div>
            </div>
      );
    }

    if (activeTab === 'profile') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h3>
          <div className="text-center py-8">
            <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Settings Coming Soon</h3>
            <p className="text-gray-500 mb-4">Edit your profile information and preferences</p>
            </div>
          </div>
      );
    }

    // Default dashboard view - redirect to dashboard tab
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Creator Dashboard</h3>
          <p className="text-gray-500 mb-4">Select a tab from the left navigation to get started</p>
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
          <div></div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ShoppingCartIcon className="w-6 h-6" />
            </button>
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
                      See All Notification
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <EnvelopeIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                1
              </span>
            </button>
                         <div className="relative flex items-center gap-3 profile-dropdown-container">
               <div className="text-right">
                 <p className="text-sm font-medium text-gray-900">
                   {profile?.fullName || 'User'}
                 </p>
                 <p className="text-xs text-gray-500">
                   {profile?.email || 'user@example.com'}
                 </p>
               </div>
               <button 
                 onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                 className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
               >
                 <UserIcon className="w-5 h-5 text-gray-600" />
               </button>
               
               {/* Profile Dropdown Menu */}
               {showProfileDropdown && (
                 <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                   {/* Header */}
                   <div className="px-4 py-3 border-b border-gray-200">
                     <div className="flex justify-between items-start">
                       <div>
                         <h3 className="font-semibold text-gray-900 text-base">
                           {profile?.fullName || 'User'}
                         </h3>
                         <p className="text-sm text-gray-500">Creator</p>
               </div>
                       <button
                         onClick={() => setShowProfileDropdown(false)}
                         className="text-gray-400 hover:text-gray-600 transition-colors"
                       >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                       </button>
                     </div>
                   </div>
                   
                   {/* Menu Options */}
                   <div className="py-2">
                     <button
                       onClick={() => handleProfileAction('profile')}
                       className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                     >
                       <UserIcon className="w-5 h-5 text-gray-500" />
                       My Profile
                     </button>
                     <button
                       onClick={() => handleProfileAction('edit')}
                       className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                     >
                       <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                       </svg>
                       Edit Profile
                     </button>
                     <button
                       onClick={() => handleProfileAction('logout')}
                       className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                     >
                       <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-500" />
                       Log Out
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
            <Link href="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 flex items-center justify-center">
                <Image 
                  src="/images/logo1.svg" 
                  alt="Influmojo" 
                  width={32}
                  height={32}
                />
              </div>
              <span className="text-xl font-bold text-gray-900">influmojo</span>
            </Link>
            
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'orderList') {
                      router.push('/dashboard/creator/orders');
                    } else {
                      setActiveTab(item.id);
                    }
                    setShowProfileDropdown(false);
                    setShowNotificationPopup(false);
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
          message={`Are you sure you want to delete this package? This action cannot be undone.

Note: Packages with active orders cannot be deleted. You'll need to complete or cancel existing orders first.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="#DC2626"
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          onSave={(profileData) => {
            handleSaveProfile(profileData);
          }}
          profile={transformProfileToFormData(profile)}
        />
      )}

      {/* Cart Modal */}
      {showCart && (
        <CartModal
          isOpen={showCart}
          onClose={() => setShowCart(false)}
        />
      )}




    </div>
  );
}
