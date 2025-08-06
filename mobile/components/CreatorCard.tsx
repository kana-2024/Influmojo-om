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
        <View style={styles.imageOverlay} />
        
        {/* Platform Badge */}
        <View style={styles.platformBadge}>
          <Ionicons name={getPlatformIcon(platform)} size={16} color={COLORS.secondary} />
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
            color={isFavorite ? COLORS.secondary : COLORS.secondary} 
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
        <Text style={styles.bioText} numberOfLines={2}>
          {creator.bio || 'A talented creator with amazing content...'}
        </Text>

        {/* Demographics and Response Time in same row */}
        <View style={styles.demographicsRow}>
          <View style={styles.demographicItem}>
            <MaterialIcons name="person-outline" size={14} color={COLORS.secondary} />
            <Text style={styles.demographicText}>
              {creator.gender || 'Not specified'}
            </Text>
          </View>
          <View style={styles.demographicItem}>
            <MaterialIcons name="cake" size={14} color={COLORS.secondary} />
            <Text style={styles.demographicText}>
              {getAgeDisplay()}
            </Text>
          </View>
          <View style={styles.demographicItem}>
            <MaterialIcons name="schedule" size={14} color={COLORS.secondary} />
            <Text style={styles.demographicText}>
              {creator.average_response_time || 'Within 24h'}
            </Text>
          </View>
        </View>

        {/* Platform and Engagement */}
        <View style={styles.engagementRow}>
          <View style={styles.platformInfo}>
            <Ionicons name={getPlatformIcon(platform)} size={16} color={COLORS.secondary} />
            <Text style={styles.platformText}>{platform}</Text>
          </View>
          {creator.social_accounts?.[0]?.engagement_rate && (
            <View style={styles.engagementBadge}>
              <Text style={styles.engagementText}>
                {(parseFloat(creator.social_accounts[0].engagement_rate) * 100).toFixed(1)}% engagement
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5F5F5',
    width: 320,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  platformBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 6,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 6,
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    marginBottom: 12,
  },
  demographicsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  demographicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  demographicText: {
    fontSize: 12,
    color: COLORS.textGray,
    marginLeft: 4,
    flexShrink: 1,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  engagementBadge: {
    backgroundColor: COLORS.chipYellow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  engagementText: {
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: '500',
  },
});

export default CreatorCard; 
