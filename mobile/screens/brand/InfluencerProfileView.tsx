import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert, StatusBar } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { profileAPI } from '../../services/apiService';

interface InfluencerProfileViewProps {
  navigation: any;
  route: any;
}

// Utility to safely parse array from string or return array as-is
const safeParseArray = (value: any): any[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    console.warn('❗Invalid JSON in influencer profile:', value);
    return [];
  }
};

const InfluencerProfileView = ({ navigation, route }: InfluencerProfileViewProps) => {
  const insets = useSafeAreaInsets();
  const [influencer, setInfluencer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Packages');

  const tabList = [
    { key: 'Packages', label: 'Packages' },
    { key: 'Portfolio', label: 'Portfolio' },
    { key: 'Reviews', label: 'Reviews' },
  ];

  const influencerId = route.params?.influencerId;

  useEffect(() => {
    if (influencerId) {
      fetchInfluencerProfile();
    }
  }, [influencerId]);

  const fetchInfluencerProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching influencer profile for ID:', influencerId);
      const response = await profileAPI.getInfluencerProfile(influencerId);
      
      if (response.success && response.data) {
        console.log('✅ Influencer profile fetched:', response.data);
        const profile = response.data;
        setInfluencer({
          ...profile,
          interests: safeParseArray(profile.interests),
          content_categories: safeParseArray(profile.content_categories),
        });
      } else {
        console.error('❌ Failed to fetch influencer profile:', response.error);
        setError(response.error || 'Failed to fetch influencer profile');
      }
    } catch (err) {
      console.error('❌ Error fetching influencer profile:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (packageData: any) => {
    Alert.alert(
      'Add to Cart',
      `Add "${packageData.title}" to cart for $${packageData.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add to Cart', 
          onPress: () => {
            // TODO: Implement cart functionality
            Alert.alert('Success', 'Package added to cart!');
          }
        }
      ]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#FFD700' : '#C7C7CC'}
        />
      );
    }
    return stars;
  };

  const renderPackages = () => {
    if (!influencer?.packages || influencer.packages.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="package-outline" size={48} color="#C7C7CC" />
          <Text style={styles.emptyStateText}>No packages available</Text>
        </View>
      );
    }

    return influencer.packages.map((pkg: any, index: number) => (
      <View key={index} style={styles.packageCard}>
        <View style={styles.packageHeader}>
          <Text style={styles.packageTitle}>{pkg.title}</Text>
          <Text style={styles.packagePrice}>${pkg.price}</Text>
        </View>
        
        <Text style={styles.packageDescription}>{pkg.description}</Text>
        
        <View style={styles.packageDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{pkg.deliveryTime}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="refresh-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{pkg.revisions} revisions</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(pkg)}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    ));
  };

  const renderPortfolio = () => {
    if (!influencer?.portfolio_items || influencer.portfolio_items.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={48} color="#C7C7CC" />
          <Text style={styles.emptyStateText}>No portfolio items available</Text>
        </View>
      );
    }

    return (
      <View style={styles.portfolioGrid}>
        {influencer.portfolio_items.map((item: any, index: number) => (
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
      </View>
    );
  };

  const renderReviews = () => {
    if (!influencer?.reviews || influencer.reviews.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={48} color="#C7C7CC" />
          <Text style={styles.emptyStateText}>No reviews available</Text>
        </View>
      );
    }

    return influencer.reviews.map((review: any, index: number) => (
      <View key={index} style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewerName}>{review.reviewerName}</Text>
          <View style={styles.reviewRating}>
            {renderStars(review.rating)}
          </View>
        </View>
        <Text style={styles.reviewText}>{review.comment}</Text>
        <Text style={styles.reviewDate}>{review.date}</Text>
      </View>
    ));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading influencer profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchInfluencerProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!influencer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Influencer not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle='dark-content' backgroundColor='#fff' />
      
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: insets.top + 16, paddingBottom: 12, paddingHorizontal: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#1A1D1F', textAlign: 'center' }}>Influencer Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Cover block */}
          <View style={styles.coverBlock}>
            <View style={styles.coverCameraBtn}>
              <Ionicons name="camera" size={18} color="#FF6B2C" />
            </View>
          </View>
          {/* Avatar - left aligned and overlapping cover */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarOuterWrapper}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: influencer?.user?.profile_image_url || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatarImg} />
              </View>
            </View>
            <View style={styles.avatarSpacer} />
          </View>
          {/* Info Card - left aligned below avatar */}
          <View style={styles.infoCard}>
            <View style={styles.infoNameRow}>
              <Text style={[styles.infoName, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">{influencer?.user?.name || 'Influencer Name'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="male" size={15} color="#B0B0B0" style={styles.infoIcon} />
              <Text style={styles.infoText}>{influencer?.gender || 'Not specified'}{influencer?.date_of_birth ? ' ' + (new Date().getFullYear() - new Date(influencer.date_of_birth).getFullYear()) : ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
              <Text style={styles.infoText}>{influencer?.location_state ? `${influencer.location_state}, ` : ''}{influencer?.location_city || 'City'}{influencer?.location_pincode ? ` ${influencer.location_pincode}` : ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="language-outline" size={15} color="#B0B0B0" style={styles.infoIcon} />
              <Text style={styles.infoText}>{influencer?.interests?.length ? influencer.interests.join(', ') : 'Languages not specified'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="star" size={15} color="#FFD600" style={{ marginRight: 4 }} />
              {(!influencer?.rating || isNaN(Number(influencer.rating)) || Number(influencer.rating) === 0) ? (
                <Text style={{ color: '#6B7280', fontSize: 14 }}>No ratings yet</Text>
              ) : (
                <Text style={{ color: '#6B7280', fontSize: 14 }}>{Number(influencer.rating).toFixed(1)}</Text>
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
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            {influencer?.content_categories?.length
              ? influencer.content_categories.map((cat: string, index: number) => (
                  <View key={cat} style={{ backgroundColor: index % 2 === 0 ? '#B1E5FC' : '#FFD88D', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 }}>
                    <Text style={{ color: '#000', fontSize: 14, fontWeight: '500' }}>{cat}</Text>
                  </View>
                ))
              : <Text style={{ color: '#6B7280', fontSize: 14 }}>No categories specified</Text>}
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 18, marginHorizontal: 16 }} />

        {/* About */}
        <View style={{ marginHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1D1F' }}>About</Text>
          </View>
          <Text style={{ fontSize: 15, color: '#6B7280', lineHeight: 22 }}>{influencer?.bio || 'No bio available yet.'}</Text>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 18, marginHorizontal: 16 }} />

        {/* Tabs */}
        <View style={{ flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginHorizontal: 16, marginTop: 8, marginBottom: 16 }}>
          {tabList.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: activeTab === tab.key ? '#fff' : 'transparent', borderWidth: activeTab === tab.key ? 0 : 1, borderColor: activeTab === tab.key ? 'transparent' : '#E5E7EB' }}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={{ fontSize: 15, fontWeight: activeTab === tab.key ? '700' : '500', color: activeTab === tab.key ? '#1A1D1F' : '#6B7280' }}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content Area */}
        <View style={{ flex: 1, width: '100%', marginBottom: 32, alignItems: 'center', justifyContent: 'center' }}>
          {activeTab === 'Packages' && (
            influencer?.packages?.length > 0 ? (
              <View style={{ paddingHorizontal: 16, paddingTop: 16, flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1D1F' }}>Packages</Text>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                  {influencer.packages.map((pkg: any, index: number) => (
                    <View key={pkg.id || index} style={styles.packageCard}>
                      <View style={styles.packageHeader}>
                        <Text style={styles.packageTitle}>{pkg.title}</Text>
                        <Text style={styles.packagePrice}>${pkg.price}</Text>
                      </View>
                      
                      <Text style={styles.packageDescription}>{pkg.description}</Text>
                      
                      <View style={styles.packageDetails}>
                        <View style={styles.detailItem}>
                          <Ionicons name="time-outline" size={16} color="#666" />
                          <Text style={styles.detailText}>{pkg.deliveryTime}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Ionicons name="refresh-outline" size={16} color="#666" />
                          <Text style={styles.detailText}>{pkg.revisions} revisions</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={() => handleAddToCart(pkg)}
                      >
                        <Ionicons name="cart-outline" size={20} color="#fff" />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="package-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>No packages available</Text>
                <Text style={styles.emptyDesc}>This influencer hasn't created any packages yet.</Text>
              </View>
            )
          )}

          {activeTab === 'Portfolio' && (
            influencer?.portfolio_items?.length > 0 ? (
              <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1D1F' }}>Portfolio Items</Text>
                </View>
                
                <View style={styles.portfolioGrid}>
                  {influencer.portfolio_items.map((item: any, index: number) => (
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
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="images-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>No portfolio items available</Text>
                <Text style={styles.emptyDesc}>This influencer hasn't added any portfolio items yet.</Text>
              </View>
            )
          )}

          {activeTab === 'Reviews' && (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={48} color="#B0B0B0" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>No reviews available</Text>
              <Text style={styles.emptyDesc}>This influencer hasn't received any reviews yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  // Profile Card Styles (same as CreatorProfile)
  profileCard: { marginHorizontal: 16, marginTop: 8, backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  coverBlock: { height: 90, backgroundColor: '#FF6B2C', borderTopLeftRadius: 16, borderTopRightRadius: 16, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 8 },
  coverCameraBtn: { backgroundColor: '#fff', borderRadius: 16, padding: 4 },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: -40, paddingHorizontal: 16 },
  avatarOuterWrapper: { position: 'relative' },
  avatarWrapper: { borderWidth: 3, borderColor: '#fff', borderRadius: 56, overflow: 'hidden', width: 90, height: 90, backgroundColor: '#eee' },
  avatarImg: { width: 90, height: 90 },
  avatarSpacer: { flex: 1 },
  infoCard: { marginTop: -42, alignItems: 'flex-start', paddingHorizontal: 16, marginLeft: 100, marginBottom: 8 },
  infoNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  infoName: { fontSize: 17, fontWeight: '700', color: '#1A1D1F' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoIcon: { marginRight: 8 },
  infoText: { color: '#6B7280', fontSize: 14 },
  
  // Package Styles
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B2C',
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  packageDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B2C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addToCartText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  
  // Portfolio Styles
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
  
  // Review Styles
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  
  // Empty State Styles
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
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  
  // Loading and Error Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF6B2C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default InfluencerProfileView; 