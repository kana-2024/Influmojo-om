import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, Alert, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNavBar, CreatorSection, CartModal, FilterModal } from '../../components';
import { useAppSelector } from '../../store/hooks';
import BrandProfile from './BrandProfile';
import { profileAPI } from '../../services/apiService';

const BrandHome = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const activeTab = route?.params?.activeTab || 'home';
  const user = useAppSelector(state => state.auth.user);

  // State for creators data
  const [creators, setCreators] = useState<any>({
    youtube: [],
    instagram: [],
    tiktok: [],
    twitter: [],
    facebook: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [followerRange, setFollowerRange] = useState({ min: 5000, max: 800000 });
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);


  const categories = ['Fashion', 'Trainer', 'Yoga', 'Business', 'Beauty'];
  const platforms = ['youtube', 'instagram', 'tiktok', 'twitter', 'facebook'];

  // Fetch creators data
  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching creators for brand home screen...');
      const response = await profileAPI.getCreators();
      
      if (response.success && response.data) {
        console.log('✅ Creators fetched successfully:', {
          youtube: response.data.youtube?.length || 0,
          instagram: response.data.instagram?.length || 0,
          tiktok: response.data.tiktok?.length || 0,
          twitter: response.data.twitter?.length || 0,
          facebook: response.data.facebook?.length || 0
        });
        
        // Debug: Log the actual data structure
        console.log('🔍 Full response data:', JSON.stringify(response.data, null, 2));
        
        setCreators(response.data);
      } else {
        console.error('❌ Failed to fetch creators:', response.error);
        setError(response.error || 'Failed to fetch creators');
      }
    } catch (err) {
      console.error('❌ Error loading creators:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatorClick = (creator: any, platform: string) => {
    console.log('🔍 Creator clicked:', creator, 'from platform:', platform);
    // Navigate to CreatorProfile in readonly mode with the creator's ID and platform
    navigation.navigate('CreatorProfile', {
      readonly: true,
      creatorId: creator.id,
      platform: platform
    });
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



  const getFilteredCreators = (platform: string) => {
    const platformCreators = creators[platform] || [];
    
    // Apply filters
    let filtered = platformCreators;
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((creator: any) => 
        creator.content_categories?.some((category: string) => selectedCategories.includes(category))
      );
    }
    
    if (followerRange.min > 5000 || followerRange.max < 800000) {
      filtered = filtered.filter((creator: any) => {
        const creatorFollowers = creator.followers_count || 0;
        return creatorFollowers >= followerRange.min && creatorFollowers <= followerRange.max;
      });
    }
    
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter((creator: any) => 
        selectedPlatforms.includes(creator.platform?.toLowerCase())
      );
    }
    
    if (priceRange !== 'all') {
      // TODO: Implement price range filtering based on package prices
    }
    
    return filtered;
  };

  // If activeTab is profile, show BrandProfile
  if (activeTab === 'profile') {
    return <BrandProfile />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F7FF' }}>
      {loading && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: insets.top + 16 }}>
          <ActivityIndicator size="large" color="#FD5D27" />
          <Text style={{ marginTop: 16, color: '#666' }}>Loading creators...</Text>
        </View>
      )}

      {error && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: insets.top + 16, paddingHorizontal: 16 }}>
          <Text style={{ color: '#FF3B30', textAlign: 'center', marginBottom: 16 }}>{error}</Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#FD5D27', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
            onPress={fetchCreators}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: insets.top + 16 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity style={{ padding: 4, marginRight: 16 }}>
            <Ionicons name="menu" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000', flex: 1 }}>Welcome</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={{ padding: 4 }}>
              <Ionicons name="mail-outline" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4 }}>
              <Ionicons name="notifications-outline" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4 }}>
              <Feather name="shopping-cart" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search + Filter */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <View style={{ 
            flex: 1, 
            backgroundColor: '#fff', 
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingHorizontal: 12, 
            paddingVertical: 8, 
            borderRadius: 8 
          }}>
            <Feather name="search" size={16} color="#C6C6C6" />
                         <TextInput
               placeholder="Search Creators"
               placeholderTextColor="#C6C6C6"
               style={{ marginLeft: 8, flex: 1, fontSize: 14, color: '#000' }}
             />
          </View>
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#FD5D27', 
              padding: 8, 
              borderRadius: 12 
            }}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#484848' }}>Categories</Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 9, color: '#000' }}>view all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {categories.map((cat, index) => (
            <View key={index} style={{ alignItems: 'center', marginRight: 12 }}>
              <View style={{ 
                width: 67, 
                height: 78, 
                borderRadius: 8, 
                borderWidth: 1, 
                borderColor: '#E9E9E9', 
                backgroundColor: '#fff',
                marginBottom: 4 
              }} />
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#01052D' }}>{cat}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Platform Creator Sections */}
        {platforms.map((platform) => (
          <CreatorSection
            key={platform}
            platform={platform}
            creators={getFilteredCreators(platform)}
            onCreatorPress={handleCreatorClick}
            onViewAllPress={() => {
              // TODO: Navigate to platform-specific view all screen
              console.log(`View all ${platform} creators`);
            }}
          />
        ))}

        {/* Bottom spacing for navigation */}
        <View style={{ height: 100 }} />
        </ScrollView>
      )}
      


      {/* Overlay for filter modal */}
      {showFilters && (
        <View style={styles.modalOverlay} />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onClearAll={() => {
          setSelectedPlatform('all');
          setSelectedCategories([]);
          setFollowerRange({ min: 5000, max: 800000 });
          setSelectedPlatforms([]);
          setPriceRange('all');
        }}
        onApplyFilters={() => setShowFilters(false)}
        onCategoryChange={setSelectedCategories}
        selectedCategories={selectedCategories}
        onFollowerRangeChange={(min, max) => setFollowerRange({ min, max })}
        followerRange={followerRange}
        onPlatformChange={setSelectedPlatforms}
        selectedPlatforms={selectedPlatforms}
        resultCount={20}
      />

      {/* Cart Modal */}
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

      {/* Bottom Navigation Bar */}
      <BottomNavBar 
        navigation={navigation} 
        currentRoute={activeTab === 'profile' ? 'profile' : 'home'}
        onCartPress={handleCartPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
    justifyContent: 'flex-end',
  },
});

export default BrandHome; 