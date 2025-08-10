import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView, StatusBar, Platform, Dimensions, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateUser } from '../../store/slices/authSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { BottomNavBar, KycModal, AccountModal, PackageCard, CartModal, CartFormModal } from '../../components';
import { useNavigation, useRoute } from '@react-navigation/native';
import CreatePackageScreen from './CreatePackageScreen';
import EditPackageScreen from './EditPackageScreen';
import CreatePortfolioScreen from './CreatePortfolioScreen';
import AnimatedModalOverlay from '../../components/AnimatedModalOverlay';
import CustomDropdown from '../../components/CustomDropdown';
import { profileAPI } from '../../services/apiService';
import { imageService } from '../../services/imageService';
import { setShowCreatePortfolio, setShowKycModal, setShowCreatePackage, setShowEditPackage, resetModals } from '../../store/slices/modalSlice';
import CartService from '../../services/cartService';

const categories = ['Technology', 'Science', 'Training'];
const languages = ['English', 'Hindi', 'Telugu', 'Marathi'];

const SCROLL_THRESHOLD = 40;

import COLORS from '../../config/colors';

// Color constants
const COLORS_LOCAL = {
  primary: COLORS.primary,
  secondary: COLORS.secondary,
  textDark: COLORS.textDark,
  textGray: COLORS.textGray,
  borderLight: COLORS.borderLight,
  backgroundLight: COLORS.backgroundLight
};

const tabList = [
  { key: 'Packages', label: 'Packages' },
  { key: 'Portfolio', label: 'Portfolio' },
];

// Utility to safely parse array from string or return array as-is
const safeParseArray = (value: any): any[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    console.warn('❗Invalid JSON in creator profile:', value);
    return [];
  }
};

const calculateAge = (dateOfBirth: any): number | null => {
  if (!dateOfBirth) return null;
  
  try {
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return null;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch {
    return null;
  }
};

// Helper function to get platform data (icon and color)
const getPlatformData = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return { icon: 'logo-instagram', color: '#E4405F' };
    case 'youtube':
      return { icon: 'logo-youtube', color: '#FF0000' };
    case 'facebook':
      return { icon: 'logo-facebook', color: '#1877F2' };
    case 'tiktok':
      return { icon: 'musical-notes', color: '#000000' };
    case 'twitter':
      return { icon: 'logo-twitter', color: '#1DA1F2' };
    case 'linkedin':
      return { icon: 'logo-linkedin', color: '#0077B5' };
    case 'snapchat':
      return { icon: 'logo-snapchat', color: '#FFFC00' };
    default:
      return { icon: 'share-social', color: '#6B7280' };
  }
};

// Helper function to generate random follower count
const getRandomFollowerCount = () => {
  const counts = ['1.2K', '5.8K', '12.4K', '25.7K', '89.3K', '156K', '234K', '567K', '1.2M', '2.8M'];
  return counts[Math.floor(Math.random() * counts.length)];
};

const CreatorProfile = () => {
  const user = useAppSelector(state => state.auth.user);
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('Packages');
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  
  // Read-only mode detection
  const readonly = (route?.params as any)?.readonly || false;
  const creatorId = (route?.params as any)?.creatorId;
  const platform = (route?.params as any)?.platform || 'instagram';
  const showCreatePortfolio = useAppSelector(state => state.modal.showCreatePortfolio);
  const showCreatePackage = useAppSelector(state => state.modal.showCreatePackage);
  const showEditPackage = useAppSelector(state => state.modal.showEditPackage);
  const scrollViewRef = useRef(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCartFormModal, setShowCartFormModal] = useState(false);
  const [cartFormData, setCartFormData] = useState<any>(null);
  const [coverImageKey, setCoverImageKey] = useState(0); // Cache-busting for cover image



  // Open modals only if navigation param is set
  useEffect(() => {
    if (route.params && (route.params as any).openModal) {
      if ((route.params as any).openModal === 'portfolio') {
        dispatch(setShowCreatePortfolio(true));
      }
      // Optionally, reset the param so it doesn't trigger again
      (route.params as any).openModal = undefined;
    }
  }, [route.params]);

  // Defensive reset on mount - will be called after function declarations

  const loadCreatorProfileForBrand = useCallback(async (creatorId: string, platform: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the API to get a specific creator's profile
      const response = await profileAPI.getCreatorProfileById(creatorId, platform);
      
      if (response.success) {
        const profile = response.data;
        const profileData = {
          ...profile,
          languages: safeParseArray(profile.languages),
          content_categories: safeParseArray(profile.content_categories),
          packages: safeParseArray(profile.packages),
          // Ensure date_of_birth is properly handled
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
        };
        setCreatorProfile(profileData);
      } else {
        setError(response.error || 'Failed to load creator profile');
      }
    } catch (error) {
      console.error('❌ Error loading creator profile for brand:', error);
      setError('Failed to load creator profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadCreatorProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is a brand user and prevent API call
      if (user && (user.user_type === 'brand' || (user as any).userType === 'brand')) {
        console.log('🔍 User is a brand, preventing creator profile API call');
        setLoading(false);
        return;
      }

      // Check if user is authenticated
      if (!user || !user.id) {
        console.log('🔍 User not authenticated, skipping creator profile load');
        setLoading(false);
        return;
      }
      
      const response = await profileAPI.getCreatorProfile();
      console.log('✅ Creator profile response:', response);
      if (response.success) {
        const profile = response.data;
        console.log('🔍 Creator profile data received:', profile);
        console.log('🔍 Packages from API:', profile.packages);
        console.log('🔍 Gender from API:', profile.gender);
        console.log('🔍 Date of birth from API:', profile.date_of_birth);
        console.log('🔍 Languages from API:', profile.languages);
        console.log('🔍 Languages type:', typeof profile.languages);
        console.log('🔍 Languages is array:', Array.isArray(profile.languages));
        console.log('🔍 Content categories from API:', profile.content_categories);
        console.log('🔍 Content categories type:', typeof profile.content_categories);
        console.log('🔍 Content categories is array:', Array.isArray(profile.content_categories));
        
        const profileData = {
          ...profile,
          languages: safeParseArray(profile.languages),
          content_categories: safeParseArray(profile.content_categories),
          packages: safeParseArray(profile.packages),
          // Ensure date_of_birth is properly handled
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
        };
        console.log('🔍 Setting creator profile state:', profileData);
        console.log('🔍 Packages in state:', profileData.packages);
        console.log('🔍 Gender in state:', profileData.gender);
        console.log('🔍 Date of birth in state:', profileData.date_of_birth);
        console.log('🔍 Languages in state:', profileData.languages);
        console.log('🔍 Languages in state type:', typeof profileData.languages);
        console.log('🔍 Languages in state is array:', Array.isArray(profileData.languages));
        console.log('🔍 Content categories in state:', profileData.content_categories);
        setCreatorProfile(profileData);
      } else {
        console.error('❌ Creator profile failed:', response.error);
        setError(response.error || 'Failed to load creator profile');
      }
    } catch (error) {
      console.error('❌ Error loading creator profile:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      // Check if error is due to authentication
      if (error.message && (error.message.includes('No token provided') || error.message.includes('Authentication required'))) {
        console.log('🔍 Authentication error detected, user needs to log in');
        setError('Please log in to view your profile');
        setLoading(false);
        return;
      }
      
      // Check if error is due to user type mismatch
      if (error.message && error.message.includes('User is not a creator')) {
        console.log('🔍 User type mismatch detected, user should be on BrandProfile');
        setLoading(false);
        return;
      }
      
      // Set a default profile to prevent crashes
      setCreatorProfile({
        user: { name: 'User', email: '', phone: '' },
        bio: '',
        location_city: '',
        location_state: '',
        content_categories: [],
        languages: [],
        packages: [],
        portfolio_items: [],
        social_media_accounts: []
      });
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Defensive reset on mount
  useEffect(() => {
    dispatch(resetModals());
    
    // Check if user is a brand and prevent creator profile loading
    // First check the user prop, then check Redux store
    const currentUser = user || null;
    const userType = currentUser?.user_type;
    
    console.log('🔍 CreatorProfile: Current user from props:', currentUser);
    console.log('🔍 CreatorProfile: User type from props:', userType);
    console.log('🔍 CreatorProfile: Readonly mode:', readonly);
    console.log('🔍 CreatorProfile: Creator ID:', creatorId);
    
    // If in readonly mode (brand viewing creator profile), allow it
    if (readonly && creatorId) {
      console.log('🔍 CreatorProfile: Readonly mode detected, loading creator profile for brand view');
      loadCreatorProfileForBrand(creatorId, platform);
      return;
    }
    
    // If user is not authenticated, show error
    if (!currentUser || !currentUser.id) {
      console.log('🔍 CreatorProfile: User not authenticated');
      setError('Please log in to view your profile');
      setLoading(false);
      return;
    }
    
    // Load creator profile if user is authenticated
    if (currentUser && (!userType || userType === 'creator')) {
      console.log('🔍 CreatorProfile: Loading creator profile for authenticated user');
      loadCreatorProfile();
    } else {
      console.log('🔍 CreatorProfile: User is not a creator, skipping profile load');
      setLoading(false);
    }
  }, [user, readonly, creatorId, platform, dispatch]);

  const { width: SCREEN_WIDTH } = Dimensions.get('window');

  // Scroll to bottom when switching to Packages, Portfolio, or Kyc tab
  const handleTabPress = (tabKey: string) => {
    setActiveTab(tabKey);
    if ((tabKey === 'Packages' || tabKey === 'Portfolio' || tabKey === 'Kyc') && scrollViewRef.current) {
      (scrollViewRef.current as any).scrollToEnd({ animated: true });
    }
  };

  // Modal open handlers: only one modal can be open at a time
  const openCreatePortfolio = () => {
    dispatch(setShowCreatePortfolio(true));
  };
  // Modal close handlers
  const closeCreatePortfolio = () => dispatch(setShowCreatePortfolio(false));
  const closeCreatePackage = () => dispatch(setShowCreatePackage(false));
  const closeEditPackage = () => {
    dispatch(setShowEditPackage(false));
    setEditingPackage(null);
  };

  const handleEditPackage = (pkg: any) => {
    setEditingPackage(pkg);
    dispatch(setShowEditPackage(true));
  };

  const handleSaveEditedPackage = async (updatedPackage: any) => {
    try {
      // Update the package in the backend
      const response = await profileAPI.updatePackage(updatedPackage);
      
      if (response.success) {
        // Refresh the profile to get updated data
        await loadCreatorProfile();
        closeEditPackage();
      } else {
        console.error('Failed to update package:', response.message);
      }
    } catch (error) {
      console.error('Error updating package:', error);
    }
  };

  // Modal trigger functions
  const handleKycPress = () => {
    setShowAccountModal(false);
    setShowKycModal(true);
  };

  const handlePaymentsPress = () => {
    setShowAccountModal(false);
    setShowPaymentsModal(true);
  };

  // CartFormModal handlers
  const handleShowCartFormModal = (packageData: any) => {
    setCartFormData(packageData);
    setShowCartFormModal(true);
  };

  const handleCartFormClose = () => {
    setShowCartFormModal(false);
    setCartFormData(null);
  };

  const handleCartFormConfirm = (formData: any) => {
    if (cartFormData) {
      try {
        CartService.addToCart({
          creatorId: cartFormData.creatorId,
          creatorName: cartFormData.creatorName,
          creatorImage: cartFormData.creatorImage || '',
          packageId: cartFormData.item.id,
          packageName: cartFormData.item.title || `${cartFormData.item.platform?.toUpperCase()} ${cartFormData.item.content_type?.toUpperCase()}`,
          packageDescription: cartFormData.item.description || `I craft eye-catching, scroll-stopping ${cartFormData.item.platform} ${cartFormData.item.content_type} designed to grab attention instantly, boost engagement, and turn viewers into loyal followers and customers.`,
          packagePrice: parseInt(cartFormData.item.price?.toString() || '0'),
          packageDuration: cartFormData.item.duration1 || '1-2 days',
          platform: cartFormData.item.platform || 'Unknown',
          deliveryTime: formData.deliveryTime,
          additionalInstructions: formData.additionalInstructions,
          references: formData.references,
        });
        Alert.alert('Success', 'Package added to cart!');
      } catch (error) {
        console.error('Add to cart error:', error);
        Alert.alert('Error', 'Failed to add package to cart. Please try again.');
      }
    }
    
    setShowCartFormModal(false);
    setCartFormData(null);
  };

  // Handle cover image upload
  const handleCoverImageUpload = async () => {
    try {
      const result = await imageService.showImageSourceOptions();
      
      if (result.success && result.coverImageUrl) {
        // Update user's cover image in Redux store
        dispatch(updateUser({ cover_image_url: result.coverImageUrl }));
        // Increment key to force image reload
        setCoverImageKey(prev => prev + 1);
        
        // Refresh the creator profile to get updated data from API
        await loadCreatorProfile();
        
        Alert.alert('Success', 'Cover image updated successfully!');
      } else if (result.error && result.error !== 'Cancelled') {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Cover image upload error:', error);
      Alert.alert('Error', 'Failed to upload cover image. Please try again.');
    }
  };

  // Cart functionality is now handled by CartService

  return (
          <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='#ffffff' />
      
      {/* Show error message for brand users (only when not in readonly mode) */}
      {user && (user.user_type === 'brand' || (user as any).userType === 'brand') && !readonly && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle" size={64} color="#f37135" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1D1F', marginTop: 16, textAlign: 'center' }}>
            Wrong Profile Type
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
            You are registered as a brand. Please use the brand profile instead.
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 16, textAlign: 'center' }}>
            Please go back and select the brand profile.
          </Text>
        </View>
      )}
      
      {/* Regular creator profile content (show for creators OR brands in readonly mode) */}
      {(!user || (user.user_type !== 'brand' && (user as any).userType !== 'brand') || readonly) && (
        <>
          {/* Show loading state while fetching creator profile data */}
          {loading && readonly ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
              <ActivityIndicator size="large" color="#f37135" />
              <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>
                Loading creator profile...
              </Text>
            </View>
          ) : error && readonly ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: 20 }}>
              <Ionicons name="alert-circle" size={64} color="#f37135" />
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1D1F', marginTop: 16, textAlign: 'center' }}>
                Failed to Load Profile
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
                {error}
              </Text>
              <TouchableOpacity 
                style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#f37135', borderRadius: 8 }}
                onPress={() => {
                  setError(null);
                  if (creatorId) {
                    loadCreatorProfileForBrand(creatorId, platform);
                  }
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : !creatorProfile && readonly ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
              <ActivityIndicator size="large" color="#f37135" />
              <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>
                Loading creator profile...
              </Text>
            </View>
          ) : error && !readonly ? (
            // Show authentication error for non-readonly mode
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: 20 }}>
              <Ionicons name="lock-closed" size={64} color="#f37135" />
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1D1F', marginTop: 16, textAlign: 'center' }}>
                Authentication Required
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
                {error}
              </Text>
              <TouchableOpacity 
                style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#f37135', borderRadius: 8 }}
                onPress={() => {
                  setError(null);
                  loadCreatorProfile();
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ marginTop: 12, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'transparent', borderRadius: 8, borderWidth: 1, borderColor: '#f37135' }}
                onPress={() => navigation.navigate('Login' as never)}
              >
                <Text style={{ color: '#f37135', fontSize: 16, fontWeight: '600' }}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Header */}
              <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
                {readonly ? (
                  <TouchableOpacity onPress={() => navigation.navigate('BrandHome' as never)} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.headerButton} />
                )}
                <Text style={styles.headerTitle}>
                  Creator
                </Text>
                {!readonly ? (
                  <TouchableOpacity onPress={() => setShowAccountModal(true)} style={styles.headerButton}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#1A1D1F" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.headerButton} />
                )}
              </View>
              <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}>
                {/* Cover Image and Avatar */}
                <View style={styles.coverContainer}>
                  <Image 
                    key={coverImageKey}
                    source={{ 
                      uri: creatorProfile?.cover_image_url || 
                            creatorProfile?.user?.cover_image_url || 
                            user?.cover_image_url || 
                            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' 
                    }} 
                    style={styles.coverImage}
                  />
                  {/* Avatar and Info Row */}
                  <View style={styles.avatarInfoRow}>
                    <View style={styles.avatarWrapper}>
                      <Image source={{ uri: creatorProfile?.profile_image_url || creatorProfile?.user?.profile_image_url || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatarImg} />
                      {!readonly && (
                        <TouchableOpacity style={styles.avatarEditBtn}>
                          <Ionicons name="pencil" size={12} color="#ffffff" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  {/* Cover camera */}
                  {!readonly && (
                    <TouchableOpacity 
                      style={styles.coverEditBtn}
                      onPress={handleCoverImageUpload}
                    >
                      <Ionicons name="camera" size={18} color="#ffffff" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={{ height: 8 }} />
                {/* User Info */}
                <View style={styles.infoSection}>
                  <Text style={styles.name}>{creatorProfile?.name || creatorProfile?.user?.name || 'Creator Name'}</Text>
                  <View style={styles.infoRowIcon}>
                    <Ionicons name="person-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
                    <Text style={styles.infoGray}>{creatorProfile?.gender || 'Gender not specified'}</Text>
                  </View>
                  <View style={styles.infoRowIcon}>
                    <Ionicons name="calendar-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
                    <Text style={styles.infoGray}>
                      {(() => {
                        const age = calculateAge(creatorProfile?.date_of_birth);
                        return age ? `${age} years old` : 'Age not specified';
                      })()}
                    </Text>
                  </View>
                  <View style={styles.infoRowIcon}>
                    <Ionicons name="location-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
                    <Text style={styles.infoGray}>
                      {creatorProfile?.location_state ? `${creatorProfile.location_state}, ` : ''}
                      {creatorProfile?.location_city || 'City'}
                      {creatorProfile?.location_pincode ? ` ${creatorProfile.location_pincode}` : ''}
                    </Text>
                  </View>
                  <View style={styles.infoRowIcon}>
                    <Ionicons name="language-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
                    <Text style={styles.infoGray}>
                      {creatorProfile?.languages && Array.isArray(creatorProfile.languages) && creatorProfile.languages.length > 0 
                        ? creatorProfile.languages.join(', ') 
                        : 'Languages not specified'}
                    </Text>
                  </View>
                  <View style={styles.ratingRow}>
                    {creatorProfile?.rating && Number(creatorProfile.rating) > 0 ? (
                      <>
                        <Text style={styles.ratingValue}>{Number(creatorProfile.rating).toFixed(1)}</Text>
                        <Ionicons name="star" size={16} color="#FFD600" />
                        <Ionicons name="star" size={16} color="#FFD600" />
                        <Ionicons name="star" size={16} color="#FFD600" />
                        <Ionicons name="star" size={16} color="#FFD600" />
                        <Ionicons name="star" size={16} color="#FFD600" />
                      </>
                    ) : (
                      <>
                        <Text style={styles.ratingValue}>No ratings yet</Text>
                        <Ionicons name="star" size={16} color="#B0B0B0" />
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.divider} />
                {/* Categories */}
                <TouchableOpacity style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>CATEGORIES</Text>
                  {!readonly && (
                    <Ionicons name="chevron-forward" size={18} color="#6B7280" style={{ marginBottom: 6 }} />
                  )}
                </TouchableOpacity>
                <View style={styles.categoryRow}>
                  {creatorProfile?.content_categories?.length > 0 ? creatorProfile.content_categories.map((cat: string, index: number) => (
                    <View 
                      key={cat} 
                      style={[
                        styles.categoryChip,
                        { backgroundColor: index % 2 === 0 ? COLORS.chipBlue : COLORS.chipYellow }
                      ]}
                    >
                      <Text style={[styles.categoryText, { color: '#000' }]}>{cat}</Text>
                    </View>
                  )) : (
                    <View style={styles.categoryChip}>
                      <Text style={[styles.categoryText, { color: '#6B7280' }]}>No categories specified</Text>
                    </View>
                  )}
                </View>
                <View style={styles.divider} />
                {/* Social Media Platforms */}
                <TouchableOpacity style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>SOCIAL MEDIA</Text>
                  {!readonly && (
                    <Ionicons name="chevron-forward" size={18} color="#6B7280" style={{ marginBottom: 6 }} />
                  )}
                </TouchableOpacity>
                <View style={styles.categoryRow}>
                  {creatorProfile?.platform?.length > 0 ? (
                    creatorProfile.platform.map((platform: string, index: number) => {
                      const platformData = getPlatformData(platform);
                      return (
                        <View key={platform} style={styles.socialPlatformCard}>
                          <View style={[styles.platformIconContainer, { backgroundColor: platformData.color + '20' }]}>
                            <Ionicons name={platformData.icon as any} size={20} color={platformData.color} />
                          </View>
                          <Text style={styles.platformName}>{platform}</Text>
                          <Text style={styles.followerCount}>{getRandomFollowerCount()}</Text>
                        </View>
                      );
                    })
                  ) : (
                    // Show default platforms if none selected
                    ['Instagram', 'YouTube', 'Facebook'].map((platform, index) => {
                      const platformData = getPlatformData(platform);
                      return (
                        <View key={platform} style={styles.socialPlatformCard}>
                          <View style={[styles.platformIconContainer, { backgroundColor: platformData.color + '20' }]}>
                            <Ionicons name={platformData.icon as any} size={20} color={platformData.color} />
                          </View>
                          <Text style={styles.platformName}>{platform}</Text>
                          <Text style={styles.followerCount}>{getRandomFollowerCount()}</Text>
                        </View>
                      );
                    })
                  )}
                </View>
                {/* Divider */}
                <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 18, marginHorizontal: 16 }} />
                {/* About */}
                <View style={{ marginHorizontal: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1D1F' }}>About</Text>
                    {!readonly && (
                      <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                    )}
                  </View>
                  <Text style={{ fontSize: 15, color: '#6B7280', lineHeight: 22, marginBottom: 16 }}>{creatorProfile?.bio || 'No bio available yet.'}</Text>
                </View>


                
                {/* Tabs */}
                <View style={styles.tabRow}>
                  {tabList.map(tab => (
                    <TouchableOpacity
                      key={tab.key}
                      style={activeTab === tab.key ? styles.tabBtnActive : styles.tabBtn}
                      onPress={() => handleTabPress(tab.key)}
                    >
                      <Text style={activeTab === tab.key ? styles.tabBtnTextActive : styles.tabBtnText}>{tab.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Tab Content Area */}
                <View style={{ 
                  flex: 1, 
                  width: '100%', 
                  marginBottom: 32,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 107, 44, 0.2)',
                  borderRadius: 12,
                  padding: 16
                }}>
                  {activeTab === 'Packages' && (
                    creatorProfile?.packages?.length > 0 ? (
                      <View style={{ paddingTop: 16, flex: 1 }}>
                        {!readonly && (
                          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24, paddingHorizontal: 16 }}>
                            <TouchableOpacity style={styles.addPortfolioBtn} onPress={() => dispatch(setShowCreatePackage(true))}>
                              <Ionicons name="add" size={20} color="#f37135" />
                              <Text style={styles.addPortfolioBtnText}>Create Package</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        
                        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                          {creatorProfile.packages.map((pkg: any, index: number) => (
                            <PackageCard 
                              key={pkg.id || index} 
                              item={pkg} 
                              creatorId={creatorProfile.id}
                              creatorName={creatorProfile.name || creatorProfile.username}
                              creatorImage={creatorProfile.profile_image}
                              onEdit={handleEditPackage} 
                              onDelete={loadCreatorProfile} 
                              onShowOverlay={setShowDeleteOverlay}
                              readonly={readonly}
                              onAddToCart={readonly ? handleShowCartFormModal : undefined}
                            />
                          ))}
                        </ScrollView>
                      </View>
                    ) : (
                      <View style={styles.emptyState}>
                        <Ionicons name="hourglass-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
                        <Text style={styles.emptyTitle}>There are no Packages has been created yet!</Text>
                        <Text style={styles.emptyDesc}>To enjoy the benefits and brands wants to give business you need to add your packages for all your social platforms.</Text>
                        {!readonly && (
                          <TouchableOpacity style={styles.createPackageBtn} onPress={() => dispatch(setShowCreatePackage(true))}>
                            <Text style={styles.createPackageBtnText}>Create Package</Text>
                            <Ionicons name="arrow-forward" size={16} color="#f37135" />
                          </TouchableOpacity>
                        )}
                      </View>
                    )
                  )}
                  {activeTab === 'Portfolio' && (
                    creatorProfile?.portfolio_items?.length > 0 ? (
                      <View style={{ paddingTop: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 16 }}>
                          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1D1F' }}>Portfolio Items</Text>
                          {!readonly && (
                            <TouchableOpacity style={styles.addPortfolioBtn} onPress={openCreatePortfolio}>
                              <Ionicons name="add" size={20} color="#f37135" />
                              <Text style={styles.addPortfolioBtnText}>Add Files</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        
                        <View style={styles.portfolioGrid}>
                          {/* Display existing portfolio items */}
                          {creatorProfile.portfolio_items.map((item: any, index: number) => (
                            <View key={item.id || index} style={styles.portfolioItem}>
                              {item.media_type === 'image' ? (
                                <Image 
                                  source={{ uri: item.media_url }} 
                                  style={styles.portfolioImage}
                                  resizeMode="cover"
                                />
                              ) : item.media_type === 'video' ? (
                                <View style={styles.portfolioVideoContainer}>
                                  <Image 
                                    source={{ uri: item.media_url.replace('/upload/', '/upload/w_200,h_200,c_fill/') }} 
                                    style={styles.portfolioImage}
                                    resizeMode="cover"
                                  />
                                  <View style={styles.videoOverlay}>
                                    <Ionicons name="play-circle" size={32} color="#ffffff" />
                                  </View>
                                </View>
                              ) : (
                                <View style={styles.portfolioFileContainer}>
                                  <Ionicons name="document" size={32} color="#2D5BFF" />
                                  <Text style={styles.portfolioFileName} numberOfLines={1}>
                                    {item.title || 'Document'}
                                  </Text>
                                </View>
                              )}
                              
                            </View>
                          ))}
                          
                          {/* Show placeholder slots if only 1 item exists */}
                          {creatorProfile.portfolio_items.length === 1 && !readonly && (
                            <>
                              {[1, 2, 3].map((index) => (
                                <TouchableOpacity 
                                  key={`placeholder-${index}`} 
                                  style={styles.portfolioPlaceholder}
                                  onPress={openCreatePortfolio}
                                >
                                  <View style={styles.placeholderContent}>
                                    <Ionicons name="add" size={32} color="#B0B0B0" />
                                    <Text style={styles.placeholderText}>Add File</Text>
                                  </View>
                                </TouchableOpacity>
                              ))}
                            </>
                          )}
                        </View>
                      </View>
                    ) : (
                      <View style={styles.emptyState}>
                        <Ionicons name="hourglass-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
                        <Text style={styles.emptyTitle}>There are no Portfolio files added yet!</Text>
                        <Text style={styles.emptyDesc}>To showcase your work, you need to add your portfolio files for all your social platforms.</Text>
                        {!readonly && (
                          <TouchableOpacity style={styles.createPackageBtn} onPress={openCreatePortfolio}>
                            <Text style={styles.createPackageBtnText}>Add Files</Text>
                            <Ionicons name="arrow-forward" size={16} color="#f37135" />
                          </TouchableOpacity>
                        )}
                      </View>
                    )
                  )}

                </View>
              </ScrollView>
              
              {/* Modals and BottomNavBar remain unchanged */}
              <AnimatedModalOverlay visible={showCreatePortfolio}>
                <CreatePortfolioScreen 
                  onClose={closeCreatePortfolio} 
                  onBack={closeCreatePortfolio}
                  onPortfolioCreated={loadCreatorProfile}
                />
              </AnimatedModalOverlay>
              <Modal 
                visible={showCreatePackage} 
                animationType="slide" 
                presentationStyle="fullScreen"
                onRequestClose={closeCreatePackage}
              >
                <CreatePackageScreen 
                  onClose={closeCreatePackage} 
                  CustomDropdown={CustomDropdown}
                  onPackageCreated={loadCreatorProfile}
                />
              </Modal>
              <Modal 
                visible={showEditPackage} 
                animationType="slide" 
                presentationStyle="fullScreen"
                onRequestClose={closeEditPackage}
              >
                <EditPackageScreen 
                  package={editingPackage}
                  onClose={closeEditPackage}
                  onSave={handleSaveEditedPackage}
                />
              </Modal>

              <Modal visible={showKycModal} transparent animationType="slide" onRequestClose={() => {
                setShowKycModal(false);
                setShowAccountModal(true);
              }}>
                <KycModal 
                  onClose={() => {
                    setShowKycModal(false);
                    setShowAccountModal(true);
                  }} 
                  onBack={() => {
                    setShowKycModal(false);
                    setShowAccountModal(true);
                  }} 
                />
              </Modal>

              <Modal visible={showPaymentsModal} transparent animationType="slide" onRequestClose={() => setShowPaymentsModal(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 24, margin: 20, width: '90%' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1D1F', marginBottom: 16, textAlign: 'center' }}>Payments</Text>
                    <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center' }}>Payment management features will be available soon.</Text>
                    <TouchableOpacity 
                      style={{ backgroundColor: '#f37135', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
                      onPress={() => setShowPaymentsModal(false)}
                    >
                      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {/* Overlays for modals */}
              {showAccountModal && (
                <View style={styles.modalOverlay} />
              )}
              {showKycModal && (
                <View style={styles.modalOverlay} />
              )}
              {showPaymentsModal && (
                <View style={styles.modalOverlay} />
              )}
              {showCreatePortfolio && (
                <View style={styles.modalOverlay} />
              )}
              {showCreatePackage && (
                <View style={styles.modalOverlay} />
              )}
              {showEditPackage && (
                <View style={styles.modalOverlay} />
              )}
              {showDeleteOverlay && (
                <View style={styles.modalOverlay} />
              )}

              <AccountModal 
                visible={showAccountModal}
                onClose={() => setShowAccountModal(false)}
                onKycPress={handleKycPress}
                onPaymentsPress={handlePaymentsPress}
                user={{
                              name: creatorProfile?.name || creatorProfile?.user?.name || user?.name,
                  email: user?.email,
                              profile_image_url: creatorProfile?.profile_image_url || creatorProfile?.user?.profile_image_url || user?.profileImage,
                  user_type: user?.user_type,
                  role_in_organization: creatorProfile?.role_in_organization
                }}
              />
              {/* Show BottomNavBar for creators OR for brands in readonly mode */}
              {(!readonly || (readonly && user && (user.user_type === 'brand' || (user as any).userType === 'brand'))) && (
                <BottomNavBar 
                  navigation={navigation} 
                  currentRoute="home"
                  onCartPress={readonly ? () => setShowCartModal(true) : undefined}
                />
              )}

              {/* Cart Modal - only show in readonly mode for brand users */}
              {readonly && (
                <>
                  <CartModal
                    visible={showCartModal}
                    onClose={() => setShowCartModal(false)}
                  />

                  {/* Overlay for cart modal */}
                  {showCartModal && (
                    <View style={styles.modalOverlay} />
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Cart Form Modal - moved to top level */}
      <CartFormModal
        visible={showCartFormModal}
        onClose={handleCartFormClose}
        onConfirm={handleCartFormConfirm}
        packageInfo={cartFormData ? {
          id: cartFormData.item.id,
          title: cartFormData.item.title || `${cartFormData.item.platform?.toUpperCase()} ${cartFormData.item.content_type?.toUpperCase()}`,
          price: parseInt(cartFormData.item.price?.toString() || '0'),
          platform: cartFormData.item.platform || 'Unknown',
          creatorName: cartFormData.creatorName || 'Unknown Creator',
        } : undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16, // Will be added to insets.top in the component
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1D1F',
    textAlign: 'center',
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  // --- Profile Card Styles ---
  profileCard: { marginTop: 8, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  coverBlock: { height: 90, backgroundColor: '#f37135', borderTopLeftRadius: 16, borderTopRightRadius: 16, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 8, position: 'relative' },
  coverCameraBtn: { backgroundColor: '#ffffff', borderRadius: 16, padding: 4, zIndex: 1 },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: -40, paddingHorizontal: 16 },
  avatarOuterWrapper: { position: 'relative' },
  avatarSpacer: { flex: 1 },
  infoCard: { marginTop: -42, alignItems: 'flex-start', paddingHorizontal: 16, marginLeft: 100, marginBottom: 8 },
  infoNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  infoName: { fontSize: 17, fontWeight: '700', color: '#1A1D1F' },
  infoNameArrow: { marginLeft: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoText: { color: '#6B7280', fontSize: 14 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1D1F',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 24,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 20,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE5D9',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textGray,
  },
  tabBtnTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1F',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  createPackageBtn: {
    flexDirection: 'row',
    height: 36,
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#f37135',
    borderRadius: 18,
    backgroundColor: '#ffffff',
  },
  createPackageBtnText: {
    color: '#f37135',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  addPortfolioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5D9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addPortfolioBtnText: {
    color: '#f37135',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  portfolioItem: {
    width: '48%', // Two items per row
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  portfolioImage: {
    width: '100%',
    height: 150,
  },
  portfolioVideoContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  portfolioFileContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9EB',
    borderRadius: 12,
  },
  portfolioFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5BFF',
    marginTop: 8,
    textAlign: 'center',
  },
  portfolioItemInfo: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  portfolioItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D1F',
    marginBottom: 4,
  },
  portfolioItemDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  portfolioPlaceholder: {
    width: '48%', // Two items per row
    backgroundColor: '#F0F9EB',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  placeholderText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 8,
  },
  socialPlatformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#20536d',
  },
  platformIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1D1F',
    marginRight: 8,
  },
  followerCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  coverContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  avatarInfoRow: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f37135',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  coverEditBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1D1F',
    marginBottom: 8,
  },
  infoRowIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: { marginRight: 8 },
  infoGray: { fontSize: 14, color: '#6B7280' },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1F',
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  platformChip: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#20536d',
  },
});

export default CreatorProfile; 
