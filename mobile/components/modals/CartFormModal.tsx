import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { cloudinaryService } from '../../services/cloudinaryService';
import AnimatedModalOverlay from '../AnimatedModalOverlay';

interface CartFormData {
  deliveryTime: number;
  additionalInstructions: string;
  references: string[];
}

interface CartFormModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (formData: CartFormData) => void;
  packageInfo?: {
    id: string;
    title: string;
    price: number;
    platform: string;
    creatorName: string;
  };
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const CartFormModal: React.FC<CartFormModalProps> = ({
  visible,
  onClose,
  onConfirm,
  packageInfo
}) => {
  const insets = useSafeAreaInsets();
  const [deliveryTime, setDeliveryTime] = useState(7);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setDeliveryTime(7);
      setAdditionalInstructions('');
      setReferences([]);
      
      // Start animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      slideAnim.setValue(screenHeight);
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    // Animate out before closing
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleImageUpload = async () => {
    try {
      setUploading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'video/*', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setUploading(false);
        return;
      }

      const uploadedUrls: string[] = [];
      
      for (const asset of result.assets) {
        try {
          const cloudinaryResponse = await cloudinaryService.uploadFile(
            asset,
            (progress) => {
              console.log('Upload progress:', progress.percentage);
            }
          );

          if (cloudinaryResponse.secure_url) {
            uploadedUrls.push(cloudinaryResponse.secure_url);
          }
        } catch (error) {
          console.error('Upload error for asset:', error);
        }
      }

      if (uploadedUrls.length > 0) {
        setReferences(prev => [...prev, ...uploadedUrls]);
        Alert.alert('Success', `${uploadedUrls.length} file(s) uploaded successfully!`);
      } else {
        Alert.alert('Error', 'Failed to upload files. Please try again.');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Error', 'Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveReference = (index: number) => {
    Alert.alert(
      'Remove Reference',
      'Are you sure you want to remove this reference?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setReferences(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const handleConfirm = () => {
    setLoading(true);
    
    const formData: CartFormData = {
      deliveryTime,
      additionalInstructions: additionalInstructions.trim(),
      references
    };

    onConfirm(formData);
    setLoading(false);
  };

  const deliveryTimeOptions = Array.from({ length: 12 }, (_, i) => i + 3); // 3-14 days

  const getFileTypeIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) {
      return 'videocam';
    } else if (['pdf'].includes(extension || '')) {
      return 'document';
    }
    return 'document';
  };

  return (
    <AnimatedModalOverlay
      visible={visible}
      onRequestClose={handleClose}
      overlayOpacity={0.5}
    >
      <View style={styles.overlayContainer}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
            <Text style={styles.title}>Order Details</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Package Info */}
            {packageInfo && (
              <View style={styles.packageInfo}>
                <Text style={styles.packageTitle}>{packageInfo.title}</Text>
                <Text style={styles.packageCreator}>by {packageInfo.creatorName}</Text>
                <Text style={styles.packagePrice}>₹{packageInfo.price.toLocaleString()}</Text>
                <Text style={styles.packagePlatform}>{packageInfo.platform}</Text>
              </View>
            )}

            {/* Delivery Time Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>Delivery Time</Text>
              <Text style={styles.description}>Select your preferred delivery time (3-14 days)</Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.deliveryTimeScroll}
                contentContainerStyle={styles.deliveryTimeScrollContent}
              >
                {deliveryTimeOptions.map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.deliveryTimeOption,
                      deliveryTime === days && styles.deliveryTimeOptionSelected
                    ]}
                    onPress={() => setDeliveryTime(days)}
                  >
                    <Text style={[
                      styles.deliveryTimeText,
                      deliveryTime === days && styles.deliveryTimeTextSelected
                    ]}>
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Additional Instructions */}
            <View style={styles.section}>
              <Text style={styles.label}>Additional Instructions (Optional)</Text>
              <Text style={styles.description}>Provide specific requirements or instructions for your order</Text>
              
              <TextInput
                style={styles.instructionsInput}
                placeholder="Describe your requirements, style preferences, target audience, or any specific instructions..."
                placeholderTextColor="#9CA3AF"
                value={additionalInstructions}
                onChangeText={setAdditionalInstructions}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* References */}
            <View style={styles.section}>
              <Text style={styles.label}>References (Optional)</Text>
              <Text style={styles.description}>Upload images, videos, or documents as references</Text>
              
              {/* Upload Button */}
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleImageUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#FD5D27" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={24} color="#FD5D27" />
                    <Text style={styles.uploadButtonText}>Upload References</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Uploaded References */}
              {references.length > 0 && (
                <View style={styles.referencesContainer}>
                  <Text style={styles.referencesTitle}>Uploaded References ({references.length})</Text>
                  {references.map((url, index) => (
                    <View key={index} style={styles.referenceItem}>
                      <View style={styles.referenceInfo}>
                        <Ionicons 
                          name={getFileTypeIcon(url) as any} 
                          size={20} 
                          color="#6B7280" 
                        />
                        <Text style={styles.referenceText} numberOfLines={1}>
                          Reference {index + 1}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeReferenceButton}
                        onPress={() => handleRemoveReference(index)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Spacer for bottom padding */}
            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Confirm Button - Fixed at bottom */}
          <View style={[styles.confirmButtonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <TouchableOpacity
              style={[styles.confirmButton, loading && { opacity: 0.7 }]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.confirmButtonText}>Add to Cart</Text>
                  <Ionicons name="cart-outline" size={20} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </AnimatedModalOverlay>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    minHeight: '60%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF', // Changed from '#F5F5F5' to '#FFFFFF'
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  packageInfo: {
    backgroundColor: '#ffffff', // Changed from '#F5F5F5' to '#FFFFFF'
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#20536d',
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  packageCreator: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FD5D27',
    marginTop: 4,
  },
  packagePlatform: {
    fontSize: 12,
    color: '#FD5D27',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1F',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  deliveryTimeScroll: {
    flexDirection: 'row',
  },
  deliveryTimeScrollContent: {
    paddingRight: 20,
  },
  deliveryTimeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#20536d',
    backgroundColor: '#ffffff', // Changed from '#F5F5F5' to '#FFFFFF'
    marginRight: 8,
  },
  deliveryTimeOptionSelected: {
    borderColor: '#FD5D27',
    backgroundColor: '#ffffff',
  },
  deliveryTimeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  deliveryTimeTextSelected: {
    color: '#FD5D27',
    fontWeight: '600',
  },
  instructionsInput: {
    backgroundColor: '#ffffff', // Changed from '#F5F5F5' to '#FFFFFF'
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#20536d',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff', // Changed from '#F5F5F5' to '#FFFFFF'
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FD5D27',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FD5D27',
    fontWeight: '500',
  },
  referencesContainer: {
    marginTop: 16,
  },
  referencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  referenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff', // Changed from '#F5F5F5' to '#FFFFFF'
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#20536d',
  },
  referenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  referenceText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  removeReferenceButton: {
    padding: 4,
  },
  confirmButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#ffffff',
  },
  confirmButton: {
    backgroundColor: '#FD5D27',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FD5D27',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default CartFormModal;
