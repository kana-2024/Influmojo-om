import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform, Image, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import CustomDropdownDefault from '../../components/CustomDropdown';
import { profileAPI } from '../../services/apiService';
import { cloudinaryService, CloudinaryUploadResponse } from '../../services/cloudinaryService';

interface CreatePortfolioScreenProps {
  onClose: () => void;
  onBack: () => void;
  CustomDropdown?: React.FC<any>;
  onPortfolioCreated?: () => void; // Callback to refresh portfolio
}

const CreatePortfolioScreen: React.FC<CreatePortfolioScreenProps> = ({ onClose, onBack, onPortfolioCreated }) => {
  const insets = useSafeAreaInsets();
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<CloudinaryUploadResponse | null>(null);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['video/*', 'image/*', 'application/zip'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFile(result.assets[0]);
      setProgress(0);
      setUploading(true);
      setUploadedFile(null);
      
      // Upload to Cloudinary
      try {
        const cloudinaryResponse = await cloudinaryService.uploadFile(
          result.assets[0],
          (progress) => {
            setProgress(progress.percentage / 100);
          }
        );
        
        setUploadedFile(cloudinaryResponse);
        setProgress(1);
        setUploading(false);
        
        Alert.alert('Success', 'File uploaded successfully!');
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert('Upload Failed', error.message || 'Failed to upload file. Please try again.');
        setUploading(false);
        setProgress(0);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
    setUploadedFile(null);
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'text'; // Default for documents, archives, etc.
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Save portfolio item to database
  const handleSubmitPortfolio = async () => {
    if (!file || !uploadedFile) {
      Alert.alert('Error', 'Please select and upload a file first');
      return;
    }

    setSaving(true);
    try {
      console.log('Creating portfolio item with data:', {
        mediaUrl: uploadedFile.secure_url,
        mediaType: getFileType(file.mimeType || ''),
        fileName: file.name,
        fileSize: file.size || uploadedFile.bytes,
        mimeType: file.mimeType
      });
      
      await profileAPI.createPortfolio({
        mediaUrl: uploadedFile.secure_url,
        mediaType: getFileType(file.mimeType || ''),
        fileName: file.name,
        fileSize: file.size || uploadedFile.bytes,
        mimeType: file.mimeType
      });

      console.log('Portfolio item created successfully');
      
      Alert.alert('Success', 'Portfolio item created successfully!', [
        { text: 'OK', onPress: () => {
          onClose();
          onPortfolioCreated?.(); // Call the callback to refresh portfolio
        }}
      ]);
    } catch (error) {
      console.error('Create portfolio error:', error);
      Alert.alert('Error', 'Failed to create portfolio item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
      <StatusBar barStyle='light-content' backgroundColor='#000' />
      <View style={[styles.safeArea, { paddingTop: insets.top + 8 }]}> 
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.headerBtn} onPress={onBack}>
              <Ionicons name="arrow-back" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.header}>Create Portfolio</Text>
            <TouchableOpacity style={styles.headerBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Add files */}
          <Text style={styles.addFilesTitle}>Add files</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickFile} activeOpacity={0.8}>
            <Ionicons name="cloud-upload-outline" size={32} color="#1A1D1F" style={{ marginBottom: 8 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 4 }}>
              <Text style={styles.uploadText}>Drag & Drop or </Text>
              <TouchableOpacity onPress={pickFile} activeOpacity={0.7}>
                <Text style={{ color: '#2D5BFF', textDecorationLine: 'underline', fontSize: 15 }}>choose</Text>
              </TouchableOpacity>
              <Text style={styles.uploadText}> file to upload</Text>
            </View>
            <Text style={styles.uploadSubText}>Select zip, image, video</Text>
          </TouchableOpacity>

          {/* File Preview */}
          {file && (
            <View style={styles.filePreviewContainer}>
              <View style={styles.filePreviewHeader}>
                <Text style={styles.filePreviewTitle}>Selected File</Text>
                <TouchableOpacity onPress={removeFile} style={styles.removeBtn}>
                  <Ionicons name="close-circle" size={20} color="#f37135" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.filePreviewContent}>
                {/* File Type Icon or Preview */}
                {uploadedFile && uploadedFile.resource_type === 'image' ? (
                  <Image 
                    source={{ uri: uploadedFile.secure_url }} 
                    style={styles.filePreviewImage}
                    resizeMode="cover"
                  />
                ) : uploadedFile && uploadedFile.resource_type === 'video' ? (
                  <View style={styles.filePreviewImage}>
                    <Ionicons name="play-circle" size={32} color="#f8f4e8" style={styles.videoPlayIcon} />
                    <Image 
                      source={{ uri: uploadedFile.secure_url.replace('/upload/', '/upload/w_100,h_100,c_fill/') }} 
                      style={styles.filePreviewImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <View style={styles.fileTypeIcon}>
                    {getFileType(file.mimeType || '') === 'image' ? (
                      <Ionicons name="image" size={24} color="#2D5BFF" />
                    ) : getFileType(file.mimeType || '') === 'video' ? (
                      <Ionicons name="videocam" size={24} color="#2D5BFF" />
                    ) : (
                      <Ionicons name="document" size={24} color="#2D5BFF" />
                    )}
                  </View>
                )}
                
                {/* File Details */}
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                    {file.name}
                  </Text>
                  <Text style={styles.fileMeta}>
                    {formatFileSize(uploadedFile?.bytes || file.size || 0)} • {getFileType(file.mimeType || '').toUpperCase()}
                  </Text>
                  {uploadedFile && (
                    <Text style={styles.uploadStatus}>✓ Uploaded to Cloudinary</Text>
                  )}
                </View>
              </View>
              
              {/* Upload Progress */}
              {uploading && (
                <View style={styles.uploadProgressSection}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>Uploading...</Text>
                    <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                  </View>
                </View>
              )}
              
              {!uploading && progress >= 1 && (
                <View style={styles.uploadCompleteSection}>
                  <Ionicons name="checkmark-circle" size={20} color="#2DD36F" />
                  <Text style={styles.uploadCompleteText}>Upload Complete</Text>
                </View>
              )}
            </View>
          )}

          {/* Help section */}
          <View style={styles.helpRow}>
            <Ionicons name="help-circle-outline" size={18} color="#6B7280" style={{ marginRight: 6 }} />
            <Text style={styles.helpText}>Still need help?</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitBtn, (!file || !uploadedFile || uploading || saving) && { opacity: 0.7 }]}
              onPress={handleSubmitPortfolio}
              disabled={!file || !uploadedFile || uploading || saving}
            >
              <Text style={styles.submitBtnText}>
                {saving ? 'Saving...' : uploading ? 'Uploading...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  card: {
    flex: 1.2,
    backgroundColor: '#f8f4e8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 0,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
    overflow: 'hidden',
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flex: 2,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A1D1F',
  },
  headerBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  addFilesTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1D1F',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    paddingVertical: 28,
    marginHorizontal: 24,
    marginBottom: 18,
  },
  uploadText: {
    fontSize: 15,
    color: '#1A1D1F',
    marginBottom: 4,
  },
  uploadSubText: {
    fontSize: 13,
    color: '#B0B0B0',
  },
  filePreviewContainer: {
    backgroundColor: '#f8f4e8',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  filePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f4e8',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1D1F',
  },
  removeBtn: {
    padding: 4,
  },
  filePreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  fileTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f8f4e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  filePreviewImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  videoPlayIcon: {
    position: 'absolute',
    zIndex: 1,
  },
  fileDetails: {
    flex: 1,
  },
  fileMimeType: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  uploadProgressSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D5BFF',
  },
  uploadCompleteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  uploadCompleteText: {
    fontSize: 13,
    color: '#2DD36F',
    fontWeight: '500',
  },
  uploadProgressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f4e8',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 18,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1D1F',
  },
  fileMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  uploadStatus: {
    fontSize: 12,
    color: '#2DD36F',
    marginTop: 4,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginTop: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: 5,
    backgroundColor: '#2D5BFF',
    borderRadius: 3,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 18,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 24,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#ffcba9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8f4e8',
  },
  cancelBtnText: {
    color: '#f37135',
    fontWeight: '700',
    fontSize: 16,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#f37135',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#f8f4e8',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CreatePortfolioScreen; 
