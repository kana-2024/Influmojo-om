import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView, StatusBar, Platform, Dimensions, Modal, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateUser } from '../../store/slices/authSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { BottomNavBar, AccountModal, CartModal } from '../../components';
import KycModal from '../../components/modals/KycModal';
import { useNavigation, useRoute } from '@react-navigation/native';
import CreateCampaignModal from './CreateCampaignModal';
import CreatePortfolioScreen from '../creator/CreatePortfolioScreen';
import AnimatedModalOverlay from '../../components/AnimatedModalOverlay';
import CustomDropdown from '../../components/CustomDropdown';
import { profileAPI } from '../../services/apiService';
import { imageService } from '../../services/imageService';

// Safe parsing helper
const safeParse = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    console.warn('Invalid JSON:', value);
    return [];
  }
};

const SCROLL_THRESHOLD = 40;

const tabList = [
  { key: 'Campaigns', label: 'Campaigns' },
  { key: 'Portfolio', label: 'Portfolio' },
];

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

const BrandProfile = () => {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('Campaigns');
  const navigation = useNavigation();
  const route = useRoute();
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const scrollViewRef = useRef(null);
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [coverImageKey, setCoverImageKey] = useState(0);

  useEffect(() => {
    loadBrandProfile();
  }, []);

  const handleCartPress = () => {
    setShowCartModal(true);
  };



  const loadBrandProfile = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Check if user is a creator user and prevent API call
      if (user && user.user_type === 'creator') {
        setLoading(false);
        return;
      }
      
      const response = await profileAPI.getBrandProfile();
      
      if (response.success && response.data) {
        const profile = response.data;
        
        // Safely parse JSON fields
        const parsedIndustries = safeParse(profile.industries);
        const parsedLanguages = safeParse(profile.languages);
        const parsedCampaigns = Array.isArray(profile.campaigns) ? profile.campaigns : [];
        const parsedCollaborations = Array.isArray(profile.collaborations) ? profile.collaborations : [];
        
        setBrandProfile({
          ...profile,
          industries: parsedIndustries,
          languages: parsedLanguages,
          campaigns: parsedCampaigns,
          collaborations: parsedCollaborations,
          portfolio_items: profile.portfolio_items || []
        });
      } else {
        console.warn('❌ Brand profile API failed:', response);
      }
    } catch (error: any) {
      console.error('❌ Error in loadBrandProfile:', error?.message || error);
      
      // Check if error is due to user type mismatch
      if (error.message && error.message.includes('User is not a brand')) {
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const { width: SCREEN_WIDTH } = Dimensions.get('window');

  // Scroll to bottom when switching to Campaigns or Portfolio tab
  const handleTabPress = (tabKey: string) => {
    setActiveTab(tabKey);
    if ((tabKey === 'Campaigns' || tabKey === 'Portfolio') && scrollViewRef.current) {
      (scrollViewRef.current as any).scrollToEnd({ animated: true });
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

  // Handle cover image upload
  const handleCoverImageUpload = async () => {
    try {
      const result = await imageService.showImageSourceOptions();
      
      if (result.success && result.coverImageUrl) {
        // Update the user in Redux state with the new cover image URL
        dispatch(updateUser({ cover_image_url: result.coverImageUrl }));
        
        // Update the cover image key to force re-render
        setCoverImageKey(prev => prev + 1);
        
        // Refresh the profile to get updated data
        await loadBrandProfile(true);
        
        Alert.alert('Success', 'Cover image updated successfully!');
      } else if (result.error && result.error !== 'Cancelled') {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('🔍 Cover image upload error:', error);
      Alert.alert('Error', 'Failed to upload cover image. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='#ffffff' />
      
      {/* Show error message for creator users */}
      {user && user.user_type === 'creator' && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle" size={64} color="#f37135" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1D1F', marginTop: 16, textAlign: 'center' }}>
            Wrong Profile Type
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
            You are registered as a creator. Please use the creator profile instead.
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 16, textAlign: 'center' }}>
            Please go back and select the creator profile.
          </Text>
        </View>
      )}
      
             {/* Regular brand profile content */}
       {(!user || user.user_type == 'brand') && (
         <>
           {/* Header - Fixed */}
           <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
             <View style={styles.headerButton} />
             <Text style={styles.headerTitle}>
               Brand
             </Text>
             <TouchableOpacity onPress={() => setShowAccountModal(true)} style={styles.headerButton}>
               <Ionicons name="ellipsis-vertical" size={24} color="#1A1D1F" />
             </TouchableOpacity>
           </View>
           
           <ScrollView
             ref={scrollViewRef}
             contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
             onScroll={event => {
               const y = event.nativeEvent.contentOffset.y;
               setScrolled(y > 10);
             }}
             scrollEventThrottle={16}
           >
        {/* Cover Image and Avatar */}
        <View style={styles.coverContainer}>
          <Image 
            key={coverImageKey}
            source={{ 
              uri: user?.cover_image_url || 
                    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' 
            }} 
            style={styles.coverImage} 
          />
          {/* Avatar and Info Row */}
          <View style={styles.avatarInfoRow}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: (user && (user as any).avatarUrl) ? (user as any).avatarUrl : 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatarImg} />
              <TouchableOpacity style={styles.avatarEditBtn}>
                <Ionicons name="pencil" size={12} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
          </View>
          {/* Cover camera */}
          <TouchableOpacity 
            style={styles.coverEditBtn}
            onPress={handleCoverImageUpload}
          >
            <Ionicons name="camera" size={18} color="#ffffff" />
          </TouchableOpacity>
          
        </View>
        <View style={{ height: 8 }} />
        {/* User Info */}
        <View style={styles.infoSection}>
          <Text style={styles.name}>{brandProfile?.company_name || user?.name || 'Brand Name'}</Text>
          <View style={styles.infoRowIcon}>
            <MaterialIcons name="business" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <Text style={styles.infoGray}>{brandProfile?.industry || 'Industry not specified'}</Text>
          </View>
          <View style={styles.infoRowIcon}>
            <Ionicons name="location-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <Text style={styles.infoGray}>
              {brandProfile?.location_country ? `${brandProfile.location_country}, ` : ''}
              {brandProfile?.location_city || 'City'}
            </Text>
          </View>
          <View style={styles.infoRowIcon}>
            <Ionicons name="language-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <Text style={styles.infoGray}>
              {brandProfile?.languages && brandProfile.languages.length > 0 
                ? brandProfile.languages.join(', ') 
                : 'Languages not specified'}
            </Text>
          </View>
          <View style={styles.infoRowIcon}>
            <Ionicons name="person-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <Text style={styles.infoGray}>
              {brandProfile?.role_in_organization || 'Role not specified'}
            </Text>
          </View>

          <View style={styles.infoRowIcon}>
            <Ionicons name="time-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedText}>{brandProfile?.verified ? 'Verified Brand' : 'Unverified Brand'}</Text>
            </View>
          </View>
          <View style={styles.ratingRow}>
            {brandProfile?.rating && Number(brandProfile.rating) > 0 ? (
              <>
                <Text style={styles.ratingValue}>{Number(brandProfile.rating).toFixed(1)}</Text>
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
        {/* Industries */}
        <TouchableOpacity style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>INDUSTRIES</Text>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" style={{ marginBottom: 6 }} />
        </TouchableOpacity>
        <View style={styles.categoryRow}>
          {brandProfile?.industries && brandProfile.industries.length > 0 ? brandProfile.industries.map((industry: string, index: number) => (
            <View 
              key={industry} 
              style={[
                styles.categoryChip,
                { backgroundColor: index % 2 === 0 ? COLORS.chipBlue : COLORS.chipYellow }
              ]}
            >
              <Text style={[styles.categoryText, { color: '#000' }]}>{industry}</Text>
            </View>
          )) : (
            <View style={styles.categoryChip}>
              <Text style={[styles.categoryText, { color: '#6B7280' }]}>No industries specified</Text>
            </View>
          )}
        </View>
        {/* About */}
        <TouchableOpacity style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" style={{ marginBottom: 6 }} />
        </TouchableOpacity>
        <Text style={styles.aboutText}>
          {brandProfile?.description || 'No description available yet.'}
        </Text>
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
        {/* Tab Content Area - fixed height for smooth switching */}
        <View style={{ 
          flex: 1, 
          width: '100%', 
          marginBottom: 32,
          borderWidth: 1,
          borderColor: 'rgba(255, 107, 44, 0.2)',
          borderRadius: 12,
          padding: 16
        }}>
          {activeTab === 'Campaigns' && (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>There are no Campaigns created yet!</Text>
              <Text style={styles.emptyDesc}>To connect with creators and promote your brand, you need to create campaigns.</Text>
              <TouchableOpacity style={styles.createPackageBtn} onPress={() => setShowCreateCampaign(true)}>
                <Text style={styles.createPackageBtnText}>Create Campaign</Text>
                <Ionicons name="arrow-forward" size={16} color="#f37135" />
              </TouchableOpacity>
            </View>
          )}
          {activeTab === 'Portfolio' && (
            (() => {
              return brandProfile?.portfolio_items?.length > 0;
            })() ? (
              <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1D1F' }}>Portfolio Items</Text>
                  <TouchableOpacity style={styles.addPortfolioBtn} onPress={() => setShowCreatePortfolio(true)}>
                    <Ionicons name="add" size={20} color="#f37135" />
                    <Text style={styles.addPortfolioBtnText}>Add Files</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.portfolioGrid}>
                  {/* Display existing portfolio items */}
                  {brandProfile.portfolio_items.map((item: any, index: number) => (
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
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="hourglass-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>There are no Portfolio files added yet!</Text>
                <Text style={styles.emptyDesc}>To showcase your brand work, you need to add your portfolio files and collaborations.</Text>
                <TouchableOpacity style={styles.createPackageBtn} onPress={() => setShowCreatePortfolio(true)}>
                  <Text style={styles.createPackageBtnText}>Add Files</Text>
                  <Ionicons name="arrow-forward" size={16} color="#f37135" />
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      </ScrollView>

      {/* Modals and BottomNavBar */}
      <AnimatedModalOverlay visible={showCreateCampaign}>
        <CreateCampaignModal 
          onClose={() => setShowCreateCampaign(false)} 
        />
      </AnimatedModalOverlay>

      {/* Cart Modal */}
      <CartModal
        visible={showCartModal}
        onClose={() => setShowCartModal(false)}
        onNavigateToProfile={() => {
          setShowCartModal(false);
          navigation.navigate('BrandProfileSetup');
        }}
      />

      {/* Overlay for cart modal */}
      {showCartModal && (
        <View style={styles.modalOverlay} />
      )}

      <AnimatedModalOverlay
        visible={showCreatePortfolio}
      >
        <CreatePortfolioScreen onClose={() => setShowCreatePortfolio(false)} onBack={() => setShowCreatePortfolio(false)} onPortfolioCreated={() => loadBrandProfile(true)} />
      </AnimatedModalOverlay>

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

      <AccountModal 
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onKycPress={handleKycPress}
        onPaymentsPress={handlePaymentsPress}
        user={{
          name: brandProfile?.company_name || brandProfile?.user?.name || user?.name,
          email: user?.email,
          profile_image_url: brandProfile?.user?.profile_image_url || user?.profileImage,
          user_type: user?.user_type,
          role_in_organization: brandProfile?.role_in_organization
        }}
      />
              <BottomNavBar 
        navigation={navigation} 
        currentRoute="profile"
        onCartPress={handleCartPress}
      />
        </>
      )}
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1A1D1F', textAlign: 'center' },
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
  verifiedTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
});

export default BrandProfile; 
