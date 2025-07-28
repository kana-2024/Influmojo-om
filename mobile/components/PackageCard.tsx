import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfirmationModal from './modals/ConfirmationModal';
import { profileAPI } from '../services/apiService';
import CartService from '../services/cartService';

interface PackageCardProps {
  item: {
    id: string;
    title?: string;
    platform?: string;
    content_type?: string;
    description?: string;
    duration1?: string;
    quantity?: number;
    revisions?: number;
    price?: number;
  };
  creatorId?: string;
  creatorName?: string;
  creatorImage?: string;
  onEdit?: (item: any) => void;
  onDelete?: () => void;
  onShowOverlay?: (show: boolean) => void;
  readonly?: boolean;
  onAddToCart?: (item: any) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ 
  item, 
  creatorId, 
  creatorName, 
  creatorImage, 
  onEdit, 
  onDelete, 
  onShowOverlay, 
  readonly = false, 
  onAddToCart 
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const title = item.title || `${item.platform?.toUpperCase()} ${item.content_type?.toUpperCase()}`;

  // Get placeholder image URL based on platform
  const getPlaceholderImageUrl = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return 'https://img.icons8.com/color/96/instagram-new.png';
      case 'facebook':
        return 'https://img.icons8.com/color/96/facebook-new.png';
      case 'youtube':
        return 'https://img.icons8.com/color/96/youtube-play.png';
      case 'tiktok':
        return 'https://img.icons8.com/color/96/tiktok.png';
      case 'twitter':
        return 'https://img.icons8.com/color/96/twitter.png';
      case 'linkedin':
        return 'https://img.icons8.com/color/96/linkedin.png';
      case 'pinterest':
        return 'https://img.icons8.com/color/96/pinterest.png';
      case 'snapchat':
        return 'https://img.icons8.com/color/96/snapchat.png';
      case 'telegram':
        return 'https://img.icons8.com/color/96/telegram-app.png';
      case 'whatsapp':
        return 'https://img.icons8.com/color/96/whatsapp.png';
      case 'discord':
        return 'https://img.icons8.com/color/96/discord-new-logo.png';
      case 'reddit':
        return 'https://img.icons8.com/color/96/reddit.png';
      case 'twitch':
        return 'https://img.icons8.com/color/96/twitch.png';
      case 'spotify':
        return 'https://img.icons8.com/color/96/spotify.png';
      case 'apple':
        return 'https://img.icons8.com/color/96/apple-logo.png';
      case 'google':
        return 'https://img.icons8.com/color/96/google-logo.png';
      default:
        return 'https://img.icons8.com/color/96/social-network.png';
    }
  };

  // Get platform icon and color for fallback
  const getPlatformIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return { name: 'logo-instagram', color: '#E4405F' };
      case 'facebook':
        return { name: 'logo-facebook', color: '#1877F2' };
      case 'youtube':
        return { name: 'logo-youtube', color: '#FF0000' };
      case 'tiktok':
        return { name: 'musical-notes', color: '#000000' };
      case 'twitter':
        return { name: 'logo-twitter', color: '#1DA1F2' };
      case 'linkedin':
        return { name: 'logo-linkedin', color: '#0077B5' };
      case 'pinterest':
        return { name: 'logo-pinterest', color: '#E60023' };
      case 'snapchat':
        return { name: 'logo-snapchat', color: '#FFFC00' };
      case 'telegram':
        return { name: 'paper-plane', color: '#0088CC' };
      case 'whatsapp':
        return { name: 'logo-whatsapp', color: '#25D366' };
      case 'discord':
        return { name: 'game-controller', color: '#5865F2' };
      case 'reddit':
        return { name: 'logo-reddit', color: '#FF4500' };
      case 'twitch':
        return { name: 'game-controller', color: '#9146FF' };
      case 'spotify':
        return { name: 'musical-notes', color: '#1DB954' };
      case 'apple':
        return { name: 'logo-apple', color: '#000000' };
      case 'google':
        return { name: 'logo-google', color: '#4285F4' };
      default:
        return { name: 'share-social', color: '#6B7280' };
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await profileAPI.deletePackage(item.id);
      Alert.alert('Success', 'Package deleted successfully!');
      onDelete?.(); // Call the callback to refresh the package list
    } catch (error) {
      console.error('Delete package error:', error);
      Alert.alert('Error', 'Failed to delete package. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleShowDeleteModal = (show: boolean) => {
    setShowDeleteModal(show);
    onShowOverlay?.(show);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAddToCart = () => {
    if (!creatorId || !creatorName) {
      Alert.alert('Error', 'Creator information is missing');
      return;
    }

    try {
      CartService.addToCart({
        creatorId,
        creatorName,
        creatorImage: creatorImage || '',
        packageId: item.id,
        packageName: item.title || `${item.platform?.toUpperCase()} ${item.content_type?.toUpperCase()}`,
        packageDescription: item.description || `I craft eye-catching, scroll-stopping ${item.platform} ${item.content_type} designed to grab attention instantly, boost engagement, and turn viewers into loyal followers and customers.`,
        packagePrice: parseInt(item.price?.toString() || '0'),
        packageDuration: item.duration1 || '1-2 days',
        platform: item.platform || 'Unknown',
      });

      Alert.alert('Success', 'Package added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Failed to add package to cart. Please try again.');
    }
  };
  
  return (
    <View>
      <View style={styles.container}>
        <View style={styles.contentRow}>
          {/* Thumbnail with platform image or icon */}
          <View style={styles.thumbnail}>
            {!imageError ? (
              <Image
                source={{ uri: getPlaceholderImageUrl(item.platform) }}
                style={styles.platformImage}
                onError={handleImageError}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.platformIconContainer, { backgroundColor: getPlatformIcon(item.platform).color + '20' }]}>
                <Ionicons 
                  name={getPlatformIcon(item.platform).name as any} 
                  size={24} 
                  color={getPlatformIcon(item.platform).color} 
                />
              </View>
            )}
            <Text style={styles.platformText}>{item.platform}</Text>
          </View>
          
          {/* Textual content */}
          <View style={styles.textContent}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>
                {title}
              </Text>
              {!readonly && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => onEdit?.(item)}>
                    <Ionicons name="pencil" size={14} color="#B0B0B0" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleShowDeleteModal(true)}>
                    <Ionicons name="trash" size={14} color="#f37135" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <Text style={styles.description}>
              {item.description || `I craft eye-catching, scroll-stopping ${item.platform} ${item.content_type} designed to grab attention instantly, boost engagement, and turn viewers into loyal followers and customers.`}
            </Text>
          </View>
        </View>

        {/* Details row */}
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>
            Duration: <Text style={styles.detailValue}>{item.duration1}</Text>
          </Text>
          <Text style={styles.detailText}>
            Quantity: <Text style={styles.detailValue}>{item.quantity}</Text>
          </Text>
          <Text style={styles.detailText}>
            Revisions : <Text style={styles.detailValue}>{item.revisions}</Text>
          </Text>
        </View>

        {/* Price */}
        <View style={styles.footerRow}>
          <Text style={styles.priceLabel}>Price: </Text>
          <Text style={styles.price}>
            ₹{parseInt(item.price?.toString() || '0').toLocaleString()}/-
          </Text>
        </View>

        {/* Add to Cart Button - Only show in readonly mode */}
        {readonly && (
          <TouchableOpacity 
            style={styles.addToCartButton} 
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Divider */}
      <View style={styles.divider} />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => handleShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Package"
        message={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="#FF3B30"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingHorizontal: 4,
    paddingBottom: 0,
    marginTop: 8,
    marginBottom: 8,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  thumbnail: {
    width: 64,
    height: 64,
    backgroundColor: '#f8f4e8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  platformImage: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  platformIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  platformText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  textContent: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
    marginTop: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#01052D',
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    color: '#949494',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    marginLeft: 74,
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  detailText: {
    color: '#222222',
    fontSize: 12,
    marginRight: 4,
  },
  detailValue: {
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    marginLeft: 74,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  priceLabel: {
    color: '#222222',
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    color: '#2C1909',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginTop: 16,
    marginBottom: 16,
  },
  addToCartButton: {
    backgroundColor: '#f37135',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginLeft: 74,
    marginRight: 16,
  },
  addToCartText: {
    color: '#f8f4e8',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PackageCard; 
