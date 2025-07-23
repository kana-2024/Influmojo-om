import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, Alert } from 'react-native';
import { Feather, Ionicons, Entypo } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNavBar } from '../components';
import { useAppSelector } from '../store/hooks';
import BrandProfile from './brand/BrandProfile';

import { profileAPI } from '../services/apiService';

const HomeScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const activeTab = route?.params?.activeTab || 'home';
  const user = useAppSelector(state => state.auth.user);

  // State for influencers data
  const [influencers, setInfluencers] = useState<any>({
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');


  const categories = ['Fashion', 'Trainer', 'Yoga', 'Business', 'Beauty'];

  // Fetch influencers data
  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching influencers for brand home screen...');
      const response = await profileAPI.getInfluencers();
      
      if (response.success && response.data) {
        console.log('✅ Influencers fetched successfully:', {
          youtube: response.data.youtube?.length || 0,
          instagram: response.data.instagram?.length || 0,
          tiktok: response.data.tiktok?.length || 0,
          twitter: response.data.twitter?.length || 0,
          facebook: response.data.facebook?.length || 0
        });
        
        // Debug: Log the actual data structure
        console.log('🔍 Full response data:', JSON.stringify(response.data, null, 2));
        
        setInfluencers(response.data);
      } else {
        console.error('❌ Failed to fetch influencers:', response.error);
        setError(response.error || 'Failed to fetch influencers');
      }
    } catch (err) {
      console.error('❌ Error fetching influencers:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInfluencerClick = (influencer: any) => {
    console.log('🔍 Influencer clicked:', influencer);
    // Navigate to CreatorProfile in readonly mode with the influencer's ID
    navigation.navigate('CreatorProfile', {
      readonly: true,
      creatorId: influencer.id
    });
  };



  const getFilteredInfluencers = (platform: string) => {
    const platformInfluencers = influencers[platform] || [];
    
    // Apply filters
    let filtered = platformInfluencers;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((inf: any) => 
        inf.content_categories?.includes(selectedCategory)
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
          <Text style={{ marginTop: 16, color: '#666' }}>Loading influencers...</Text>
        </View>
      )}

      {error && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: insets.top + 16, paddingHorizontal: 16 }}>
          <Text style={{ color: '#FF3B30', textAlign: 'center', marginBottom: 16 }}>{error}</Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#FD5D27', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
            onPress={fetchInfluencers}
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
              placeholder="Search Influencers"
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

        {/* YouTube Influencers */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#222222' }}>Youtube Influencers</Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 12, color: '#000' }}>view all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {getFilteredInfluencers('youtube').map((inf: any, index: number) => (
            <TouchableOpacity 
              key={index} 
              style={{ 
                backgroundColor: '#fff', 
                width: 192, 
                borderRadius: 12, 
                marginRight: 16, 
                paddingHorizontal: 12, 
                paddingTop: 96, 
                paddingBottom: 16 
              }}
              onPress={() => handleInfluencerClick(inf)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ 
                  backgroundColor: '#F1F2F4', 
                  width: 24, 
                  height: 6, 
                  borderRadius: 3 
                }} />
                <Entypo name="dots-three-vertical" size={12} color="#000" />
              </View>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#000', marginBottom: 4, textTransform: 'uppercase' }}>
                {inf.name}
              </Text>
              <Text style={{ fontSize: 4, color: '#000', fontWeight: 'bold', marginBottom: 4 }}>
                {inf.bio || 'A talented influencer...'}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 4, color: '#A4A4A4' }}>Response Time: {inf.average_response_time}</Text>
                <View style={{ 
                  backgroundColor: '#F1F2F4', 
                  paddingHorizontal: 8, 
                  paddingVertical: 1, 
                  borderRadius: 12 
                }}>
                  <Text style={{ fontSize: 6, fontWeight: 'bold', color: '#000' }}>
                    {inf.social_accounts?.[0]?.follower_count ? 
                      `${(parseInt(inf.social_accounts[0].follower_count) / 1000).toFixed(1)}K` : 
                      'New'
                    }
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Instagram Influencers */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#222222' }}>Instagram Influencers</Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 12, color: '#000' }}>view all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {getFilteredInfluencers('instagram').map((inf: any, index: number) => (
            <TouchableOpacity 
              key={index} 
              style={{ 
                backgroundColor: '#fff', 
                width: 192, 
                borderRadius: 12, 
                marginRight: 16, 
                paddingHorizontal: 12, 
                paddingTop: 96, 
                paddingBottom: 16 
              }}
              onPress={() => handleInfluencerClick(inf)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ 
                  backgroundColor: '#F1F2F4', 
                  width: 24, 
                  height: 6, 
                  borderRadius: 3 
                }} />
                <Entypo name="dots-three-vertical" size={12} color="#000" />
              </View>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#000', marginBottom: 4, textTransform: 'uppercase' }}>
                {inf.name}
              </Text>
              <Text style={{ fontSize: 4, color: '#000', fontWeight: 'bold', marginBottom: 4 }}>
                {inf.bio || 'A talented influencer...'}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 4, color: '#A4A4A4' }}>Response Time: {inf.average_response_time}</Text>
                <View style={{ 
                  backgroundColor: '#F1F2F4', 
                  paddingHorizontal: 8, 
                  paddingVertical: 1, 
                  borderRadius: 12 
                }}>
                  <Text style={{ fontSize: 6, fontWeight: 'bold', color: '#000' }}>
                    {inf.social_accounts?.[0]?.follower_count ? 
                      `${(parseInt(inf.social_accounts[0].follower_count) / 1000).toFixed(1)}K` : 
                      'New'
                    }
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom spacing for navigation */}
        <View style={{ height: 100 }} />
        </ScrollView>
      )}
      


      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {/* Platform Filter */}
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Platform</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
              {['all', 'youtube', 'instagram'].map((platform) => (
                <TouchableOpacity
                  key={platform}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    marginBottom: 8,
                    backgroundColor: selectedPlatform === platform ? '#FF6B2C' : '#F3F4F6'
                  }}
                  onPress={() => setSelectedPlatform(platform)}
                >
                  <Text style={{ color: selectedPlatform === platform ? '#fff' : '#000' }}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Filter */}
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
              {['all', ...categories].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    marginBottom: 8,
                    backgroundColor: selectedCategory === category ? '#FF6B2C' : '#F3F4F6'
                  }}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={{ color: selectedCategory === category ? '#fff' : '#000' }}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Range Filter */}
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Price Range</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
              {['all', '0-1000', '1000-5000', '500+'].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    marginBottom: 8,
                    backgroundColor: priceRange === range ? '#FF6B2C' : '#F3F4F6'
                  }}
                  onPress={() => setPriceRange(range)}
                >
                  <Text style={{ color: priceRange === range ? '#fff' : '#000' }}>
                    {range === 'all' ? 'All Prices' : `${range}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Apply Filters Button */}
            <TouchableOpacity
              style={{ backgroundColor: '#FF6B2C', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
              onPress={() => setShowFilters(false)}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <BottomNavBar 
        navigation={navigation} 
        currentRoute={activeTab === 'profile' ? 'profile' : 'home'}
        userType={(user?.user_type as 'creator' | 'brand') || 'brand'}
      />
    </SafeAreaView>
  );
};

export default HomeScreen; 