import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView, StatusBar, Platform, Dimensions, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppSelector } from '../../store/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { BottomNavBar, KycModal, AccountModal } from '../../components';
import { useNavigation, useRoute } from '@react-navigation/native';
import CreateCampaignModal from './CreateCampaignModal';
import CreateProjectScreen from './CreateProjectScreen';
import AnimatedModalOverlay from '../../components/AnimatedModalOverlay';
import CustomDropdown from '../../components/CustomDropdown';
import { profileAPI } from '../../services/apiService';

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
  { key: 'Projects', label: 'Projects' },
  { key: 'Kyc', label: 'Kyc' },
  { key: 'Payments', label: 'Payments' },
];

const BrandProfile = () => {
  const user = useAppSelector(state => state.auth.user);
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('Campaigns');
  const navigation = useNavigation();
  const route = useRoute();
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const scrollViewRef = useRef(null);
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);

  useEffect(() => {
    setShowKycModal(false);
    loadBrandProfile();
  }, []);

  // Open KYC modal only if navigation param is set
  useEffect(() => {
    if (route.params && (route.params as any).openModal) {
      if ((route.params as any).openModal === 'kyc') {
        setShowKycModal(true);
      }
      // Optionally, reset the param so it doesn't trigger again
      (route.params as any).openModal = undefined;
    }
  }, [route.params]);

  const loadBrandProfile = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading brand profile...');
      const response = await profileAPI.getBrandProfile();
      
      if (response.success && response.data) {
        const profile = response.data;
        
        // Safely parse JSON fields
        const parsedIndustries = safeParse(profile.industries);
        const parsedLanguages = safeParse(profile.languages);
        const parsedCampaigns = Array.isArray(profile.campaigns) ? profile.campaigns : [];
        const parsedCollaborations = Array.isArray(profile.collaborations) ? profile.collaborations : [];
        
        console.log('🔍 Brand profile loaded successfully:', {
          industries: parsedIndustries,
          languages: parsedLanguages,
          campaigns_count: parsedCampaigns.length,
          collaborations_count: parsedCollaborations.length
        });
        
        setBrandProfile({
          ...profile,
          industries: parsedIndustries,
          languages: parsedLanguages,
          campaigns: parsedCampaigns,
          collaborations: parsedCollaborations
        });
      } else {
        console.warn('❌ Brand profile API failed:', response);
      }
    } catch (error: any) {
      console.error('❌ Error in loadBrandProfile:', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const { width: SCREEN_WIDTH } = Dimensions.get('window');

  // Scroll to bottom when switching to Campaigns, Projects, or Kyc tab
  const handleTabPress = (tabKey: string) => {
    setActiveTab(tabKey);
    if ((tabKey === 'Campaigns' || tabKey === 'Projects' || tabKey === 'Kyc') && scrollViewRef.current) {
      (scrollViewRef.current as any).scrollToEnd({ animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='light-content' backgroundColor='#000' />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        onScroll={event => {
          const y = event.nativeEvent.contentOffset.y;
          setScrolled(y > 10);
        }}
        scrollEventThrottle={16}
      >
        {/* Header with back and menu */}
        <View style={[styles.headerRow, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="arrow-back" size={22} color="#1A1D1F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Brand Profile</Text>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setShowAccountModal(true)}>
            <Ionicons name="ellipsis-vertical" size={22} color="#1A1D1F" />
          </TouchableOpacity>
        </View>
        {/* Cover Image and Avatar */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: (user && (user as any).coverUrl) ? (user as any).coverUrl : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' }} style={styles.coverImage} />
          {/* Avatar and Info Row */}
          <View style={styles.avatarInfoRow}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: (user && (user as any).avatarUrl) ? (user as any).avatarUrl : 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatarImg} />
              <TouchableOpacity style={styles.avatarEditBtn}>
                <Ionicons name="pencil" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
            
          </View>
          {/* Cover camera */}
          <TouchableOpacity style={styles.coverEditBtn}>
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={{ height: 48 }} />
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
          {brandProfile?.date_of_birth && (
            <View style={styles.infoRowIcon}>
              <Ionicons name="calendar-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
              <Text style={styles.infoGray}>
                {new Date(brandProfile.date_of_birth).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          )}
          <View style={styles.infoRowIcon}>
            <Ionicons name="time-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedText}>{brandProfile?.verified ? 'Verified Brand' : 'Unverified Brand'}</Text>
            </View>
            <Text style={[styles.infoGray, { alignSelf: 'center' }]}> • {brandProfile?.company_size || 'Company size not specified'}</Text>
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
                { backgroundColor: index % 2 === 0 ? '#B1E5FC' : '#FFD88D' }
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
        <View style={{ flex: 1, width: '100%', marginBottom: 32 }}>
          {activeTab === 'Campaigns' && (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>There are no Campaigns created yet!</Text>
              <Text style={styles.emptyDesc}>To connect with creators and promote your brand, you need to create campaigns for your marketing needs.</Text>
              <TouchableOpacity style={styles.createPackageBtn} onPress={() => setShowCreateCampaign(true)}>
                <Text style={styles.createPackageBtnText}>Create Campaign</Text>
              </TouchableOpacity>
            </View>
          )}
          {activeTab === 'Projects' && (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>There are no Projects added yet!</Text>
              <Text style={styles.emptyDesc}>To showcase your brand work, you need to add your project files and collaborations.</Text>
              <TouchableOpacity style={styles.createPackageBtn} onPress={() => setShowCreateProject(true)}>
                <Text style={styles.createPackageBtnText}>Add Project</Text>
              </TouchableOpacity>
            </View>
          )}
          {activeTab === 'Kyc' && (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>Your KYC is not verified yet!</Text>
              <Text style={styles.emptyDesc}>To unlock all features and make payments, please verify your business identity by uploading your company documents.</Text>
              <TouchableOpacity style={styles.createPackageBtn} onPress={() => setShowKycModal(true)}>
                <Text style={styles.createPackageBtnText}>Verify Business</Text>
              </TouchableOpacity>
            </View>
          )}
          {activeTab === 'Payments' && (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>No payment information available yet!</Text>
              <Text style={styles.emptyDesc}>Once you start collaborating with creators, your payment details and transactions will appear here.</Text>
              <TouchableOpacity style={styles.createPackageBtn} onPress={() => alert('Add Bank Account')}>
                <Text style={styles.createPackageBtnText}>Add Bank Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals and BottomNavBar */}
      <AnimatedModalOverlay visible={showCreateCampaign}>
        <CreateCampaignModal 
          onClose={() => setShowCreateCampaign(false)} 
        />
      </AnimatedModalOverlay>

      <AnimatedModalOverlay
        visible={showCreateProject}
      >
        <CreateProjectScreen onClose={() => setShowCreateProject(false)} />
      </AnimatedModalOverlay>

      {showKycModal && (
        <Modal visible={showKycModal} transparent animationType="slide" onRequestClose={() => setShowKycModal(false)}>
          <KycModal
            onClose={() => setShowKycModal(false)}
            onBack={() => setShowKycModal(false)}
          />
        </Modal>
      )}
      <AccountModal 
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        user={{
          name: user?.name,
          email: user?.email,
          profile_image_url: user?.profileImage,
          user_type: user?.user_type,
          role_in_organization: brandProfile?.role_in_organization
        }}
      />
      <BottomNavBar navigation={navigation} />
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
  coverContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
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
    borderColor: '#fff',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B2C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
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
    marginBottom: 24,
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
    color: '#fff',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#FF6B2C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createPackageBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BrandProfile; 