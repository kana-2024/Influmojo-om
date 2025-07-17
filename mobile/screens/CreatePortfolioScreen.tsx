import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import CustomDropdownDefault from '../components/CustomDropdown';

interface CreatePortfolioScreenProps {
  onClose: () => void;
  onBack: () => void;
  CustomDropdown?: React.FC<any>;
}

const CreatePortfolioScreen: React.FC<CreatePortfolioScreenProps> = ({ onClose, onBack }) => {
  const insets = useSafeAreaInsets();
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

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
      simulateUpload();
    }
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('zip')) return 'archive';
    return 'document';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Simulate upload progress
  const simulateUpload = () => {
    let prog = 0;
    const interval = setInterval(() => {
      prog += 0.1;
      setProgress(Math.min(prog, 1));
      if (prog >= 1) {
        clearInterval(interval);
        setUploading(false);
      }
    }, 400);
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
                  <Ionicons name="close-circle" size={20} color="#FF6B2C" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.filePreviewContent}>
                {/* File Type Icon */}
                <View style={styles.fileTypeIcon}>
                  {getFileType(file.mimeType || '') === 'image' ? (
                    <Ionicons name="image" size={24} color="#2D5BFF" />
                  ) : getFileType(file.mimeType || '') === 'video' ? (
                    <Ionicons name="videocam" size={24} color="#2D5BFF" />
                  ) : getFileType(file.mimeType || '') === 'archive' ? (
                    <Ionicons name="archive" size={24} color="#2D5BFF" />
                  ) : (
                    <Ionicons name="document" size={24} color="#2D5BFF" />
                  )}
                </View>
                
                {/* File Details */}
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                    {file.name}
                  </Text>
                  <Text style={styles.fileMeta}>
                    {formatFileSize(file.size || 0)} • {getFileType(file.mimeType || '').toUpperCase()}
                  </Text>
                  {file.mimeType && (
                    <Text style={styles.fileMimeType}>{file.mimeType}</Text>
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
            <TouchableOpacity style={styles.submitBtn} disabled={!file || uploading}>
              <Text style={styles.submitBtnText}>Submit</Text>
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
    backgroundColor: '#fff',
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
    backgroundColor: '#F8F9FB',
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
    backgroundColor: '#F3F7FF',
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
    backgroundColor: '#F3F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    backgroundColor: '#F3F7FF',
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
    backgroundColor: '#FFF4F0',
  },
  cancelBtnText: {
    color: '#FF6B2C',
    fontWeight: '700',
    fontSize: 16,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#FF6B2C',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CreatePortfolioScreen; 