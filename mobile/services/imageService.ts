import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { cloudinaryService, CloudinaryUploadResponse } from './cloudinaryService';
import { profileAPI } from './apiService';

export interface ImageUploadResult {
  success: boolean;
  coverImageUrl?: string;
  error?: string;
}

export const imageService = {
  /**
   * Pick and upload a cover image
   * @returns Promise with upload result
   */
  pickAndUploadCoverImage: async (): Promise<ImageUploadResult> => {
    try {
      // Pick image using document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'Image selection cancelled' };
      }

      const selectedImage = result.assets[0];
      const imageUri = selectedImage.uri;

      // Upload to Cloudinary
      const cloudinaryResponse = await cloudinaryService.uploadFile(
        selectedImage,
        (progress) => {
          console.log('Upload progress:', progress.percentage);
        }
      );

      if (cloudinaryResponse.secure_url) {
        // Update cover image in backend
        const updateResult = await profileAPI.updateCoverImage({
          cover_image_url: cloudinaryResponse.secure_url
        });

        if (updateResult.success) {
          return { success: true, coverImageUrl: cloudinaryResponse.secure_url };
        } else {
          return { success: false, error: updateResult.message || 'Failed to update cover image' };
        }
      } else {
        return { success: false, error: 'Failed to upload image' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  },

  /**
   * Take a photo and upload as cover image
   * @returns Promise with upload result
   */
  takeAndUploadCoverImage: async (): Promise<ImageUploadResult> => {
    try {
      // For now, we'll use document picker for both gallery and camera
      // In a real app, you would install expo-image-picker for camera functionality
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'Photo selection cancelled' };
      }

      const selectedImage = result.assets[0];
      
      // Upload to Cloudinary
      const cloudinaryResponse = await cloudinaryService.uploadFile(
        selectedImage,
        (progress) => {
          // Progress callback (can be used for UI updates)
        }
      );

      // Update profile with new cover image URL
      const updateResponse = await profileAPI.updateCoverImage({
        cover_image_url: cloudinaryResponse.secure_url
      });

      if (updateResponse.success) {
        return {
          success: true,
          coverImageUrl: cloudinaryResponse.secure_url
        };
      } else {
        return {
          success: false,
          error: updateResponse.message || 'Failed to update profile'
        };
      }

    } catch (error) {
      console.error('Cover photo upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload cover photo'
      };
    }
  },

  /**
   * Show image source options (camera or gallery)
   * @returns Promise with upload result
   */
  showImageSourceOptions: async (): Promise<ImageUploadResult> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Choose Image Source',
        'Select how you want to add a cover image',
        [
          {
            text: 'Select Image',
            onPress: async () => {
              const result = await imageService.pickAndUploadCoverImage();
              resolve(result);
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve({ success: false, error: 'Cancelled' })
          }
        ]
      );
    });
  }
}; 