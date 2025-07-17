import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView, StatusBar, Platform, Dimensions, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppSelector } from '../store/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import BottomNavBar from './BottomNavBar';
import { useNavigation } from '@react-navigation/native';
import CreatePackageScreen from './CreatePackageScreen';
import CreatePortfolioScreen from './CreatePortfolioScreen';
import KycModal from './KycModal';
import AnimatedModalOverlay from '../components/AnimatedModalOverlay';
import CustomDropdown from '../components/CustomDropdown';

const categories = ['Technology', 'Science', 'Training'];
const languages = ['English', 'Hindi', 'Telugu', 'Marathi'];

const SCROLL_THRESHOLD = 40;

const tabList = [
  { key: 'Packages', label: 'Packages' },
  { key: 'Portfolio', label: 'Portfolio' },
  { key: 'Kyc', label: 'Kyc' },
  { key: 'Payments', label: 'Payments' },
];

const Profile = () => {
  const user = useAppSelector(state => state.auth.user);
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('Packages');
  const navigation = useNavigation();
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
  }, []);

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
          <Text style={styles.headerTitle}>My Profile</Text>
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
          <Text style={styles.name}>Mohammed Azhar</Text>
          <View style={styles.infoRowIcon}>
            <MaterialIcons name="female" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <Text style={styles.infoGray}>Male 34</Text>
          </View>
          <View style={styles.infoRowIcon}>
            <Ionicons name="location-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <Text style={styles.infoGray}>Telangana, Hyderabad 500023</Text>
          </View>
          <View style={styles.infoRowIcon}>
            <Ionicons name="language-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <Text style={styles.infoGray}>English, Hindi & Telugu</Text>
          </View>
          <View style={styles.infoRowIcon}>
            <Ionicons name="time-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
            <View style={styles.quickResponderTag}>
              <Text style={styles.quickResponderText}>Quick Responder</Text>
            </View>
            <Text style={[styles.infoGray, { alignSelf: 'center' }]}> • 2-4 hours</Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingValue}>4.5</Text>
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
          {categories.map((cat, index) => (
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
          I'm Mohammed Azhar Uddin, a passionate tech influencer with a sharp eye for innovation and user experience. I specialize in reviewing the latest gadgets, smartphones, apps, and tech accessories—breaking down complex features into simple, honest insights for my audience. Whether it's a deep-dive into performance or hands-on usability, my goal is to help you make informed decisions in today's fast-moving tech world.
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
      <Modal
        visible={showCreatePackage}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreatePackage(false)}
      >
        <AnimatedModalOverlay visible={showCreatePackage} onRequestClose={() => setShowCreatePackage(false)}>
          <CreatePackageScreen onClose={() => setShowCreatePackage(false)} CustomDropdown={CustomDropdown} />
        </AnimatedModalOverlay>
      </Modal>
      <Modal
        visible={showCreatePortfolio}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreatePortfolio(false)}
      >
        <AnimatedModalOverlay visible={showCreatePortfolio} onRequestClose={() => setShowCreatePortfolio(false)}>
          <CreatePortfolioScreen onClose={() => setShowCreatePortfolio(false)} onBack={() => setShowCreatePortfolio(false)} CustomDropdown={CustomDropdown} />
        </AnimatedModalOverlay>
      </Modal>
      <Modal
        visible={showKycModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowKycModal(false)}
      >
        <AnimatedModalOverlay visible={showKycModal} onRequestClose={() => setShowKycModal(false)}>
          <KycModal onClose={() => setShowKycModal(false)} onBack={() => setShowKycModal(false)} onNext={() => setShowKycModal(false)} />
        </AnimatedModalOverlay>
      </Modal>
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff'},
  scrollContent: { paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Dimensions.get('window').width * 0.04, marginTop: Dimensions.get('window').width * 0.06, marginBottom: Dimensions.get('window').width * 0.05  },
  headerIconBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1A1D1F', textAlign: 'center', flex: 1 },
  coverContainer: {
    marginHorizontal: Dimensions.get('window').width * 0.03, marginBottom: Dimensions.get('window').width * 0.04, marginTop: 0, position: 'relative',
    height: Dimensions.get('window').width * 0.32,
  },
  coverImage: {
    width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#FF6B2C',
  },
  coverEditBtn: {
    position: 'absolute', top: 8, right: 16, backgroundColor: '#FF6B2C', borderRadius: 16, padding: 4, zIndex: 2
  },
  avatarInfoRow: {
    position: 'absolute', left: Dimensions.get('window').width * 0.02, right: Dimensions.get('window').width * 0.06, bottom: -Dimensions.get('window').width * 0.17, flexDirection: 'row', alignItems: 'center',
  },
  avatarWrapper: {
    width: Dimensions.get('window').width * 0.24 + 4, height: Dimensions.get('window').width * 0.24 + 4, borderRadius: (Dimensions.get('window').width * 0.24 + 4) / 2, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', elevation: 2, zIndex: 3, marginRight: -((Dimensions.get('window').width * 0.24 + 4) / 2), position: 'relative',
  },
  avatarImg: {
    width: Dimensions.get('window').width * 0.24, height: Dimensions.get('window').width * 0.24, borderRadius: (Dimensions.get('window').width * 0.24) / 2, resizeMode: 'cover',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B2C',
    borderRadius: 12,
    padding: 4,
    zIndex: 4,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 3,
  },
  infoSection: { flex: 1, alignItems: 'flex-start', justifyContent: 'center', marginLeft: '33%', marginTop: '-13%' },
  name: { fontSize: 17, fontWeight: '700', color: '#1A1D1F', marginBottom: 2, textAlign: 'left', alignSelf: 'stretch' },
  email: { fontSize: 13, color: '#6B7280', marginBottom: 2, textAlign: 'left', alignSelf: 'stretch' },
  infoRowIcon: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  infoIcon: { marginRight: 6 },
  infoGray: { fontSize: 13, color: '#B0B0B0', textAlign: 'left', alignSelf: 'stretch' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingValue: { fontSize: 15, fontWeight: '600', color: '#1A1D1F', marginRight: 4 },
  divider: { height: 2, width: '90%', alignSelf: 'center', backgroundColor: '#E5E7EB', marginVertical: 16, marginHorizontal: 0 },
  header: {
    fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 16, marginBottom: 12
  },
  avatarContainer: {
    position: 'absolute', left: 16, bottom: -28, width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', elevation: 2
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 8, borderRadius: 12, padding: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
  },
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 24, marginBottom: 4
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  categoryRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 8 },
  categoryChip: { backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  categoryText: { color: '#1A1D1F', fontSize: 13, fontWeight: '500' },
  aboutText: { fontSize: 14, color: '#6B7280', marginHorizontal: 16, marginBottom: 8, marginTop: 2, lineHeight: 20 },
  tabRow: { flexDirection: 'row', backgroundColor: '#F8F9FB', borderRadius: 12, marginHorizontal: 16, marginTop: 12, marginBottom: 8, padding: 6 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
  tabBtnActive: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, backgroundColor: '#fff', elevation: 1 },
  tabBtnText: { color: '#6B7280', fontWeight: '500', fontSize: 14 },
  tabBtnTextActive: { color: '#FF6B2C', fontWeight: '700', fontSize: 14 },
  emptyState: { alignItems: 'center', marginTop: 32, marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, padding: 24, elevation: 1 },
  emptyTitle: { color: '#1A1D1F', fontWeight: '600', fontSize: 15, textAlign: 'center', marginBottom: 8 },
  emptyDesc: { color: '#6B7280', fontSize: 13, textAlign: 'center' },
  createPackageBtn: {
    marginTop: 18,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#FF6B2C',
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 8,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  createPackageBtnText: {
    color: '#FF6B2C',
    fontWeight: '600',
    fontSize: 15,
  },
  quickResponderTag: {
    backgroundColor: '#FFE5D9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FF6B2C',
  },
  quickResponderText: {
    color: '#FF6B2C',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default Profile; 