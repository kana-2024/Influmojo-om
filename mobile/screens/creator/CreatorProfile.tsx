import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView, StatusBar, Platform, Dimensions, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { BottomNavBar, KycModal, AccountModal, PackageCard, CartModal } from '../../components';
import { useNavigation, useRoute } from '@react-navigation/native';
import CreatePackageScreen from './CreatePackageScreen';
import EditPackageScreen from './EditPackageScreen';
import CreatePortfolioScreen from './CreatePortfolioScreen';
import AnimatedModalOverlay from '../../components/AnimatedModalOverlay';
import CustomDropdown from '../../components/CustomDropdown';
import { profileAPI } from '../../services/apiService';
import { setShowCreatePortfolio, setShowKycModal, setShowCreatePackage, setShowEditPackage, resetModals } from '../../store/slices/modalSlice';

const categories = ['Technology', 'Science', 'Training'];
const languages = ['English', 'Hindi', 'Telugu', 'Marathi'];

const SCROLL_THRESHOLD = 40;

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
  const [cartItems, setCartItems] = useState<any[]>([]);

  console.log('🔍 CreatorProfile component loaded');
  console.log('🔍 Current user:', user);
  console.log('🔍 Route params:', route.params);
  console.log('🔍 Creator profile state:', creatorProfile);
  console.log('🔍 Creator profile gender:', creatorProfile?.gender);
  console.log('🔍 Creator profile date_of_birth:', creatorProfile?.date_of_birth);

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
      console.log('🔍 Loading creator profile for brand view, creator ID:', creatorId, 'platform:', platform);
      
      // Use the API to get a specific creator's profile
      const response = await profileAPI.getCreatorProfileById(creatorId, platform);
      console.log('✅ Creator profile for brand response:', response);
      
      if (response.success) {
        const profile = response.data;
        console.log('🔍 Creator profile for brand data received:', profile);
        console.log('🔍 Packages from API (brand view):', profile.packages);
        console.log('🔍 Gender from API (brand view):', profile.gender);
        console.log('🔍 Date of birth from API (brand view):', profile.date_of_birth);
        const profileData = {
          ...profile,
          languages: safeParseArray(profile.languages),
          content_categories: safeParseArray(profile.content_categories),
          packages: safeParseArray(profile.packages),
          // Ensure date_of_birth is properly handled
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
        };
        console.log('🔍 Setting creator profile state (brand view):', profileData);
        console.log('🔍 Packages in state (brand view):', profileData.packages);
        console.log('🔍 Gender in state (brand view):', profileData.gender);
        console.log('🔍 Date of birth in state (brand view):', profileData.date_of_birth);
        setCreatorProfile(profileData);
      } else {
        console.error('❌ Creator profile for brand failed:', response.error);
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
      console.log('🔍 Loading creator profile...');
      
      // Check if user is a brand user and prevent API call
      if (user && (user.user_type === 'brand' || (user as any).userType === 'brand')) {
        console.log('🔍 User is a brand, preventing creator profile API call');
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
      }
    } catch (error) {
      console.error('❌ Error loading creator profile:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      
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
    
    // Check if user is a brand and prevent creator profile loading (only for non-readonly mode)
    if (userType === 'brand' && !readonly) {
      console.log('🔍 CreatorProfile: User is a brand, should not be on CreatorProfile screen');
      setLoading(false);
      return;
    }
    
    // If user is null, try to get from Redux store
    if (!currentUser) {
      console.log('🔍 CreatorProfile: User is null, checking Redux store...');
      // We'll still try to load the profile, but the API call will fail for brand users
      // and show the error message we added
    }
    
    loadCreatorProfile();
  }, [user, readonly, creatorId, platform, loadCreatorProfile, loadCreatorProfileForBrand]);

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

  // Handle add to cart for readonly mode
  const handleAddToCart = (packageItem: any) => {
    console.log('🔍 Adding package to cart:', packageItem);
    // Add the package to cart items
    const newCartItem = {
      id: packageItem.id || `package_${Date.now()}`,
      name: packageItem.title || `${packageItem.platform} Package`,
      price: packageItem.price || 0,
      quantity: 1,
      creator: creatorProfile?.name || creatorProfile?.user?.name || 'Creator',
      platform: packageItem.platform || 'Unknown'
    };
    
    setCartItems(prev => {
      // Check if item already exists in cart
      const existingItem = prev.find(item => item.id === newCartItem.id);
      if (existingItem) {
        // Update quantity if item exists
        return prev.map(item => 
          item.id === newCartItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item if it doesn't exist
        return [...prev, newCartItem];
      }
    });
    
    Alert.alert(
      'Added to Cart',
      `"${packageItem.title || packageItem.platform} Package" has been added to your cart!`,
      [
        { text: 'Continue Shopping', style: 'default' },
        { text: 'View Cart', style: 'default', onPress: () => setShowCartModal(true) }
      ]
    );
  };

  const handleCartPress = () => {
    setShowCartModal(true);
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateCartQuantity = (itemId: string, quantity: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const handleCheckout = () => {
    // TODO: Implement checkout functionality
    Alert.alert('Checkout', 'Checkout functionality will be implemented soon!');
    setShowCartModal(false);
  };

  return (
          <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='#fff' />
      
      {/* Show error message for brand users (only when not in readonly mode) */}
      {user && (user.user_type === 'brand' || (user as any).userType === 'brand') && !readonly && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle" size={64} color="#FF6B2C" />
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
              <ActivityIndicator size="large" color="#FF6B2C" />
              <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>
                Loading creator profile...
              </Text>
            </View>
          ) : error && readonly ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
              <Ionicons name="alert-circle" size={64} color="#FF6B2C" />
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1D1F', marginTop: 16, textAlign: 'center' }}>
                Failed to Load Profile
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
                {error}
              </Text>
              <TouchableOpacity 
                style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FF6B2C', borderRadius: 8 }}
                onPress={() => {
                  setError(null);
                  if (creatorId) {
                    loadCreatorProfileForBrand(creatorId, platform);
                  }
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : !creatorProfile && readonly ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
              <ActivityIndicator size="large" color="#FF6B2C" />
              <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>
                Loading creator profile...
              </Text>
            </View>
          ) : (
            <>
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: insets.top + 16, paddingBottom: 12, paddingHorizontal: 16 }}>
                {readonly ? (
                  <TouchableOpacity onPress={() => navigation.navigate('BrandHome' as never)} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 32 }} />
                )}
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#1A1D1F', textAlign: 'center' }}>
                  {readonly ? 'Creator Profile' : 'My Profile'}
                </Text>
                {!readonly ? (
                  <TouchableOpacity onPress={() => setShowAccountModal(true)} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#1A1D1F" />
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 32 }} />
                )}
              </View>
              <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                  {/* Cover block */}
                  <View style={styles.coverBlock}>
                    {!readonly && (
                      <TouchableOpacity style={styles.coverCameraBtn}>
                        <Ionicons name="camera" size={18} color="#FF6B2C" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {/* Avatar - left aligned and overlapping cover */}
                  <View style={styles.avatarRow}>
                    <View style={styles.avatarOuterWrapper}>
                      <View style={styles.avatarWrapper}>
                        <Image source={{ uri: creatorProfile?.profile_image_url || creatorProfile?.user?.profile_image_url || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatarImg} />
                      </View>
                      {!readonly && (
                        <TouchableOpacity style={styles.avatarEditBtn}>
                          <Ionicons name="pencil" size={12} color="#fff" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.avatarSpacer} />
                  </View>
                  {/* Info Card - left aligned below avatar */}
                  <View style={styles.infoCard}>
                    <View style={styles.infoNameRow}>
                      <Text style={[styles.infoName, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">{creatorProfile?.name || creatorProfile?.user?.name || 'Creator Name'}</Text>
                      {!readonly && (
                        <Ionicons name="chevron-forward" size={18} color="#1A1D1F" />
                      )}
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="male" size={15} color="#B0B0B0" style={styles.infoIcon} />
                      <Text style={styles.infoText}>{creatorProfile?.gender || 'Not specified'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
                      <Text style={styles.infoText}>
                        {(() => {
                          console.log('🔍 Debug: Calculating age for date_of_birth:', creatorProfile?.date_of_birth);
                          const age = calculateAge(creatorProfile?.date_of_birth);
                          console.log('🔍 Debug: Calculated age:', age);
                          return age ? `${age} years old` : 'Age not specified';
                        })()}
                      </Text>
                    </View>
                    <View style={styles.infoRow}><Ionicons name="location-outline" size={15} color="#B0B0B0" style={styles.infoIcon} /><Text style={styles.infoText}>{creatorProfile?.location_state ? `${creatorProfile.location_state}, ` : ''}{creatorProfile?.location_city || 'City'}{creatorProfile?.location_pincode ? ` ${creatorProfile.location_pincode}` : ''}</Text></View>
                    <View style={styles.infoRow}>
                      <Ionicons name="language-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
                      <Text style={styles.infoText}>
                        {(() => {
                          console.log('🔍 Debug: Languages in render:', creatorProfile?.languages);
                          console.log('🔍 Debug: Languages type in render:', typeof creatorProfile?.languages);
                          console.log('🔍 Debug: Languages is array in render:', Array.isArray(creatorProfile?.languages));
                          console.log('🔍 Debug: Languages length in render:', creatorProfile?.languages?.length);
                          return creatorProfile?.languages && Array.isArray(creatorProfile.languages) && creatorProfile.languages.length > 0 ? creatorProfile.languages.join(', ') : 'Languages not specified';
                        })()}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="star" size={15} color="#FFD600" style={{ marginRight: 4 }} />
                      {(!creatorProfile?.rating || isNaN(Number(creatorProfile.rating)) || Number(creatorProfile.rating) === 0) ? (
                        <Text style={{ color: '#6B7280', fontSize: 14 }}>No ratings yet</Text>
                      ) : (
                        <Text style={{ color: '#6B7280', fontSize: 14 }}>{Number(creatorProfile.rating).toFixed(1)}</Text>
                      )}
                    </View>
                  </View>
                </View>
                {/* Divider */}
                <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 18, marginHorizontal: 16 }} />
                {/* Categories */}
                <View style={{ marginHorizontal: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1D1F' }}>Categories</Text>
                    {!readonly && (
                      <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                    {creatorProfile?.content_categories?.length
                      ? creatorProfile.content_categories.map((cat: string, index: number) => (
                          <View key={cat} style={{ backgroundColor: index % 2 === 0 ? '#B1E5FC' : '#FFD88D', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 }}>
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '500' }}>{cat}</Text>
                          </View>
                        ))
                      : categories.map((cat, index) => (
                          <View key={cat} style={{ backgroundColor: index % 2 === 0 ? '#B1E5FC' : '#FFD88D', paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 }}>
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '500' }}>{cat}</Text>
                          </View>
                        ))}
                  </View>
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
                              <Ionicons name="add" size={20} color="#FF6B2C" />
                              <Text style={styles.addPortfolioBtnText}>Create Package</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        
                        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                          {creatorProfile.packages.map((pkg: any, index: number) => (
                            <PackageCard 
                              key={pkg.id || index} 
                              item={pkg} 
                              onEdit={handleEditPackage} 
                              onDelete={loadCreatorProfile} 
                              onShowOverlay={setShowDeleteOverlay}
                              readonly={readonly}
                              onAddToCart={readonly ? handleAddToCart : undefined}
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
                            <Ionicons name="arrow-forward" size={16} color="#FF6B2C" />
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
                              <Ionicons name="add" size={20} color="#FF6B2C" />
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
                                    <Ionicons name="play-circle" size={32} color="#fff" />
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
                            <Ionicons name="arrow-forward" size={16} color="#FF6B2C" />
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
                  <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, margin: 20, width: '90%' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1D1F', marginBottom: 16, textAlign: 'center' }}>Payments</Text>
                    <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center' }}>Payment management features will be available soon.</Text>
                    <TouchableOpacity 
                      style={{ backgroundColor: '#FF6B2C', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
                      onPress={() => setShowPaymentsModal(false)}
                    >
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Close</Text>
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
                  onCartPress={readonly ? handleCartPress : undefined}
                />
              )}

              {/* Cart Modal - only show in readonly mode for brand users */}
              {readonly && (
                <>
                  <CartModal
                    visible={showCartModal}
                    onClose={() => setShowCartModal(false)}
                    items={cartItems}
                    onRemoveItem={handleRemoveCartItem}
                    onUpdateQuantity={handleUpdateCartQuantity}
                    onCheckout={handleCheckout}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1D1F' },
  // --- Profile Card Styles ---
  profileCard: { marginTop: 8, backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  coverBlock: { height: 90, backgroundColor: '#FF6B2C', borderTopLeftRadius: 16, borderTopRightRadius: 16, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 8 },
  coverCameraBtn: { backgroundColor: '#fff', borderRadius: 16, padding: 4 },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: -40, paddingHorizontal: 16 },
  avatarOuterWrapper: { position: 'relative' },
  avatarWrapper: { borderWidth: 3, borderColor: '#fff', borderRadius: 56, overflow: 'hidden', width: 90, height: 90, backgroundColor: '#eee' },
  avatarImg: { width: 90, height: 90 },
  avatarEditBtn: { position: 'absolute', bottom: 1, left: 6, backgroundColor: '#FF6B2C', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', zIndex: 2 },
  avatarSpacer: { flex: 1 },
  infoCard: { marginTop: -42, alignItems: 'flex-start', paddingHorizontal: 16, marginLeft: 100, marginBottom: 8 },
  infoNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  infoName: { fontSize: 17, fontWeight: '700', color: '#1A1D1F' },
  infoNameArrow: { marginLeft: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoIcon: { marginRight: 8 },
  infoText: { color: '#6B7280', fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FF6B2C',
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
    borderRadius: 8,
    backgroundColor: '#FF6B2C',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabBtnTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
    borderColor: '#FF6B2C',
    borderRadius: 18,
    backgroundColor: '#F8F9FB',
  },
  createPackageBtnText: {
    color: '#FF6B2C',
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
    color: '#FF6B2C',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
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
});

export default CreatorProfile; 