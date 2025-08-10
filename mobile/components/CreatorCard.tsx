import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../config/colors';

interface CreatorCardProps {
  creator: any;
  platform: string;
  onPress: (creator: any, platform: string) => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, platform, onPress }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const calculateAge = (dateOfBirth: any) => {
    // Handle empty objects, null, undefined, or empty strings
    if (!dateOfBirth || 
        dateOfBirth === '' || 
        dateOfBirth === null || 
        dateOfBirth === undefined ||
        (typeof dateOfBirth === 'object' && Object.keys(dateOfBirth).length === 0)) {
      return 'Age not specified';
    }
    
    try {
      const birthDate = new Date(dateOfBirth);
      if (isNaN(birthDate.getTime())) {
        console.log('🔍 Invalid date format:', dateOfBirth);
        return 'Age not specified';
      }
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Ensure age is a valid number
      if (age < 0 || age > 120) {
        console.log('🔍 Invalid age calculated:', age, 'from date:', dateOfBirth);
        return 'Age not specified';
      }
      
      return `${age} years old`;
    } catch (error) {
      console.log('🔍 Error calculating age from:', dateOfBirth, error);
      return 'Age not specified';
    }
  };

  const getAgeDisplay = () => {
    // First check if age is directly provided
    if (creator.age !== undefined && creator.age !== null && creator.age !== '') {
      return `${creator.age} years old`;
    }
    
    // Then try to calculate from date of birth
    const dateOfBirth = creator.date_of_birth || creator.dateOfBirth || creator.dob;
    if (dateOfBirth) {
      return calculateAge(dateOfBirth);
    }
    
    // Check if age is nested in user object
    if (creator.user && creator.user.age) {
      return `${creator.user.age} years old`;
    }
    
    // Check if date_of_birth is nested in user object
    if (creator.user && creator.user.date_of_birth) {
      return calculateAge(creator.user.date_of_birth);
    }
    
    return 'Age not specified';
  };

  const formatFollowerCount = (followerCount: string) => {
    if (!followerCount) return 'New';
    const count = parseInt(followerCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return 'logo-youtube';
      case 'instagram':
        return 'logo-instagram';
      case 'tiktok':
        return 'logo-tiktok';
      default:
        return 'globe-outline';
    }
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Add API call to save/remove from favorites
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(creator, platform)}
      activeOpacity={0.9}
    >
      {/* Cover Image Container */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ 
            uri: creator.cover_image_url || 
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' 
          }} 
          style={styles.coverImage}
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <View style={styles.imageOverlay}>
          {/* Demographics and Response Time */}
          <View style={styles.overlayContent}>
            <View style={styles.demographicsRow}>
              <View style={styles.demographicItem}>
                <MaterialIcons name="person-outline" size={14} color="#ffffff" />
                <Text style={[styles.demographicText, { color: '#ffffff' }]}>
                  {creator.gender || 'Not specified'}
                </Text>
              </View>
              <View style={styles.demographicItem}>
                <MaterialIcons name="cake" size={14} color="#ffffff" />
                <Text style={[styles.demographicText, { color: '#ffffff' }]}>
                  {getAgeDisplay()}
                </Text>
              </View>
              <View style={styles.demographicItem}>
                <MaterialIcons name="schedule" size={14} color="#ffffff" />
                <Text style={[styles.demographicText, { color: '#ffffff' }]}>
                  {creator.average_response_time || 'Within 24h'}
                </Text>
              </View>
            </View>

            {/* Platform and Engagement */}
            <View style={styles.engagementRow}>
              {/* Removed redundant platform info since we have the badge */}
              {creator.social_accounts?.[0]?.engagement_rate && (
                <View style={[styles.engagementBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={[styles.engagementText, { color: '#ffffff' }]}>
                    {(parseFloat(creator.social_accounts[0].engagement_rate) * 100).toFixed(1)}% engagement
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {/* Platform Badge */}
        <View style={styles.platformBadge}>
          <Ionicons name={getPlatformIcon(platform)} size={20} color="#f37135" />
        </View>
        
        {/* Favorite Button */}
        <TouchableOpacity 
          onPress={handleFavoritePress}
          style={styles.favoriteButton}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={20} 
            color="#f37135"
          />
        </TouchableOpacity>
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Creator Name and Status */}
        <View style={styles.headerRow}>
          <Text style={styles.creatorName} numberOfLines={1}>
            {creator.name || 'Creator Name'}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {formatFollowerCount(creator.social_accounts?.[0]?.follower_count)}
            </Text>
          </View>
        </View>

        {/* Bio */}
        <Text style={styles.bioText} numberOfLines={1} ellipsizeMode="tail">
          {creator.bio || 'A talented creator with amazing content...'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    width: 320,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    overflow: 'hidden',
    borderRadius: 16,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
  },
  overlayContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  platformBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 20,
    padding: 6,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 20,
    padding: 6,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 12,
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: COLORS.chipBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  bioText: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 20,
  },
  demographicsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  demographicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demographicText: {
    fontSize: 12,
    marginLeft: 4,
    flexShrink: 1,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  engagementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  engagementText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default CreatorCard; 
