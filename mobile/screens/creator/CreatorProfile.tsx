import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView, StatusBar, Platform, Dimensions, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppSelector } from '../../store/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { BottomNavBar, KycModal } from '../../components';
import { useNavigation } from '@react-navigation/native';
import CreatePackageScreen from './CreatePackageScreen';
import CreatePortfolioScreen from './CreatePortfolioScreen';
import AnimatedModalOverlay from '../../components/AnimatedModalOverlay';
import CustomDropdown from '../../components/CustomDropdown';
import { profileAPI } from '../../services/apiService';

const categories = ['Technology', 'Science', 'Training'];
const languages = ['English', 'Hindi', 'Telugu', 'Marathi'];

const SCROLL_THRESHOLD = 40;

const tabList = [
  { key: 'Packages', label: 'Packages' },
  { key: 'Portfolio', label: 'Portfolio' },
  { key: 'Kyc', label: 'Kyc' },
  { key: 'Payments', label: 'Payments' },
];

const CreatorProfile = () => {
  const user = useAppSelector(state => state.auth.user);
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('Packages');
  const navigation = useNavigation();
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const scrollViewRef = useRef(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreatorProfile();
  }, []);

  const loadCreatorProfile = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading creator profile...');
      const response = await profileAPI.getCreatorProfile();
      console.log('✅ Creator profile response:', response);
      if (response.success) {
        setCreatorProfile(response.data);
      } else {
        console.error('❌ Creator profile failed:', response.error);
      }
    } catch (error) {
      console.error('❌ Error loading creator profile:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      // Set a default profile to prevent crashes
      setCreatorProfile({
        user: { name: 'User', email: '', phone: '' },
        bio: '',
        location_city: '',
        location_state: '',
        content_categories: [],
        interests: [],
        portfolio_items: [],
        social_media_accounts: []
      });
    } finally {
      setLoading(false);
    }
  };

  const { width: SCREEN_WIDTH } = Dimensions.get('window');

  // Scroll to bottom when switching to Packages, Portfolio, or Kyc tab
  const handleTabPress = (tabKey: string) => {
    setActiveTab(tabKey);
    if ((tabKey === 'Packages' || tabKey === 'Portfolio' || tabKey === 'Kyc') && scrollViewRef.current) {
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
          <Text style={styles.headerTitle}>Creator Profile</Text>
          <TouchableOpacity style={styles.headerIconBtn}>
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
          <Text style={styles.name}>{creatorProfile?.user?.name || user?.name || 'Creator Name'}</Text>
          <View style={styles.infoRowIcon}>
            <MaterialIcons name="female" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <Text style={styles.infoGray}>
              {creatorProfile?.gender || 'Not specified'} {creatorProfile?.date_of_birth ? new Date().getFullYear() - new Date(creatorProfile.date_of_birth).getFullYear() : ''}
            </Text>
          </View>
          {creatorProfile?.date_of_birth && (
            <View style={styles.infoRowIcon}>
              <Ionicons name="calendar-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
              <Text style={styles.infoGray}>
                {new Date(creatorProfile.date_of_birth).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          )}
          <View style={styles.infoRowIcon}>
            <Ionicons name="location-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <Text style={styles.infoGray}>
              {creatorProfile?.location_state ? `${creatorProfile.location_state}, ` : ''}
              {creatorProfile?.location_city || 'City'}{creatorProfile?.location_pincode ? ` ${creatorProfile.location_pincode}` : ''}
            </Text>
          </View>
          <View style={styles.infoRowIcon}>
            <Ionicons name="language-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <Text style={styles.infoGray}>
              {creatorProfile?.interests ? JSON.parse(creatorProfile.interests).join(', ') : 'Languages not specified'}
            </Text>
          </View>
          <View style={styles.infoRowIcon}>
            <Ionicons name="time-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <View style={styles.quickResponderTag}>
              <Text style={styles.quickResponderText}>Quick Responder</Text>
            </View>
            <Text style={[styles.infoGray, { alignSelf: 'center' }]}> • {creatorProfile?.average_response_time || '2-4 hours'}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingValue}>{creatorProfile?.rating || '0.0'}</Text>
            <Ionicons name="star" size={16} color="#FFD600" />
            <Ionicons name="star" size={16} color="#FFD600" />
            <Ionicons name="star" size={16} color="#FFD600" />
            <Ionicons name="star" size={16} color="#FFD600" />
            <Ionicons name="star-half" size={16} color="#FFD600" />
          </View>
        </View>
        <View style={styles.divider} />
        {/* Categories */}
        <TouchableOpacity style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>CATEGORIES</Text>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" style={{ marginBottom: 6 }} />
        </TouchableOpacity>
        <View style={styles.categoryRow}>
          {creatorProfile?.content_categories ? JSON.parse(creatorProfile.content_categories).map((cat: string, index: number) => (
            <View 
              key={cat} 
              style={[
                styles.categoryChip,
                { backgroundColor: index % 2 === 0 ? '#B1E5FC' : '#FFD88D' }
              ]}
            >
              <Text style={[styles.categoryText, { color: '#000' }]}>{cat}</Text>
            </View>
          )) : categories.map((cat, index) => (
            <View 
              key={cat} 
              style={[
                styles.categoryChip,
                { backgroundColor: index % 2 === 0 ? '#B1E5FC' : '#FFD88D' }
              ]}
            >
              <Text style={[styles.categoryText, { color: '#000' }]}>{cat}</Text>
            </View>
          ))}
        </View>
        {/* About */}
        <TouchableOpacity style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" style={{ marginBottom: 6 }} />
        </TouchableOpacity>
        <Text style={styles.aboutText}>
          {creatorProfile?.bio || 'No bio available yet.'}
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
          {activeTab === 'Packages' && (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>There are no Packages has been created yet!</Text>
              <Text style={styles.emptyDesc}>To enjoy the benefits and business you need to add your packages for all your social platforms.</Text>
              <TouchableOpacity style={styles.createPackageBtn} onPress={() => setShowCreatePackage(true)}>
                <Text style={styles.createPackageBtnText}>Create Package</Text>
              </TouchableOpacity>
            </View>
          )}
          {activeTab === 'Portfolio' && (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>There are no Portfolio files added yet!</Text>
              <Text style={styles.emptyDesc}>To showcase your work, you need to add your portfolio files for all your social platforms.</Text>
              <TouchableOpacity style={styles.createPackageBtn} onPress={() => setShowCreatePortfolio(true)}>
                <Text style={styles.createPackageBtnText}>Add Files</Text>
              </TouchableOpacity>
            </View>
          )}
          {activeTab === 'Kyc' && (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>Your KYC is not verified yet!</Text>
              <Text style={styles.emptyDesc}>To unlock all features and receive payments, please verify your identity by uploading your ID proof.</Text>
              <TouchableOpacity style={styles.createPackageBtn} onPress={() => setShowKycModal(true)}>
                <Text style={styles.createPackageBtnText}>Verify ID</Text>
              </TouchableOpacity>
            </View>
          )}
          {activeTab === 'Payments' && (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>No payment information available yet!</Text>
              <Text style={styles.emptyDesc}>Once you start collaborating and earning, your payment details will appear here.</Text>
              <TouchableOpacity style={styles.createPackageBtn} onPress={() => alert('Add Bank Account')}>
                <Text style={styles.createPackageBtnText}>Add Bank Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <AnimatedModalOverlay
        visible={showCreatePackage}
      >
        <CreatePackageScreen onClose={() => setShowCreatePackage(false)} />
      </AnimatedModalOverlay>

      <AnimatedModalOverlay
        visible={showCreatePortfolio}
      >
        <CreatePortfolioScreen onClose={() => setShowCreatePortfolio(false)} onBack={() => setShowCreatePortfolio(false)} />
      </AnimatedModalOverlay>

      <KycModal
        onClose={() => setShowKycModal(false)}
        onBack={() => setShowKycModal(false)}
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
  quickResponderTag: {
    backgroundColor: '#FF6B2C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
  },
  quickResponderText: {
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
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default CreatorProfile; 