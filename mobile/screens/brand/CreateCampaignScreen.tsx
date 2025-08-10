import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform, Image, Dimensions, Alert, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import CustomDropdownDefault from '../../components/CustomDropdown';
import { profileAPI } from '../../services/apiService';
import { COLORS } from '../../config/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface CreateCampaignScreenProps {
  onClose: () => void;
  onBack: () => void;
  CustomDropdown?: React.FC<any>;
}

const CreateCampaignScreen: React.FC<CreateCampaignScreenProps> = ({ onClose, onBack, CustomDropdown }) => {
  const insets = useSafeAreaInsets();
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [campaignTitle, setCampaignTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [contentType, setContentType] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [requirements, setRequirements] = useState('');

  const Dropdown = CustomDropdown || CustomDropdownDefault;

  // Dropdown options
  const platforms = ['Instagram', 'Facebook', 'Youtube', 'TikTok', 'Snapchat', 'Twitter'];
  const contentTypes = ['Reel', 'Story', 'Feed post', 'Carousel Post', 'Video', 'Live Stream'];
  const budgetRanges = ['₹5,000 - ₹10,000', '₹10,000 - ₹25,000', '₹25,000 - ₹50,000', '₹50,000 - ₹1,00,000', '₹1,00,000+'];
  const durations = ['1 Week', '2 Weeks', '1 Month', '2 Months', '3 Months', '6 Months'];
  const audienceTypes = ['Teenagers (13-19)', 'Young Adults (20-29)', 'Adults (30-39)', 'Middle-aged (40-49)', 'Seniors (50+)', 'All Ages'];

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

  // Save campaign to database
  const handleSubmitCampaign = async () => {
    if (!campaignTitle.trim()) {
      Alert.alert('Error', 'Please enter a campaign title');
      return;
    }

    if (!platform.trim()) {
      Alert.alert('Error', 'Please select a platform');
      return;
    }

    if (!contentType.trim()) {
      Alert.alert('Error', 'Please select a content type');
      return;
    }

    if (!budget.trim()) {
      Alert.alert('Error', 'Please select a budget range');
      return;
    }

    if (!duration.trim()) {
      Alert.alert('Error', 'Please select a duration');
      return;
    }

    if (!file) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setSaving(true);
    try {
      // In a real app, you would upload the file to a cloud storage service first
      // For now, we'll simulate the upload URL
      const mediaUrl = `https://example.com/uploads/${file.name}`;
      
      await profileAPI.createCampaign({
        title: campaignTitle.trim(),
        description: requirements.trim(),
        budget: budget.trim(),
        duration: duration.trim(),
        requirements: requirements.trim(),
        targetAudience: targetAudience.trim(),
        platform: platform.trim(),
        contentType: contentType.trim()
      });

      Alert.alert('Success', 'Campaign created successfully!', [
        { text: 'OK', onPress: () => onClose() }
      ]);
    } catch (error) {
      console.error('Create campaign error:', error);
      Alert.alert('Error', 'Failed to create campaign. Please try again.');
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
            <Text style={styles.header}>Create Campaign</Text>
            <TouchableOpacity style={styles.headerBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Campaign Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Campaign Title<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={campaignTitle}
                onChangeText={setCampaignTitle}
                placeholder="Enter campaign title"
                placeholderTextColor={COLORS.placeholder}
              />
            </View>

            {/* Platform */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Platform<Text style={styles.required}>*</Text></Text>
              <Dropdown
                value={platform}
                setValue={setPlatform}
                options={platforms}
              />
            </View>

            {/* Content Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Content Type<Text style={styles.required}>*</Text></Text>
              <Dropdown
                value={contentType}
                setValue={setContentType}
                options={contentTypes}
              />
            </View>

            {/* Budget */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Budget Range<Text style={styles.required}>*</Text></Text>
              <Dropdown
                value={budget}
                setValue={setBudget}
                options={budgetRanges}
              />
            </View>

            {/* Duration */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Campaign Duration<Text style={styles.required}>*</Text></Text>
              <Dropdown
                value={duration}
                setValue={setDuration}
                options={durations}
              />
            </View>

            {/* Target Audience */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Target Audience</Text>
              <Dropdown
                value={targetAudience}
                setValue={setTargetAudience}
                options={audienceTypes}
              />
            </View>

            {/* Requirements */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Requirements</Text>
              <TextInput
                style={styles.textArea}
                value={requirements}
                onChangeText={setRequirements}
                placeholder="Describe your campaign requirements..."
                placeholderTextColor={COLORS.placeholder}
                multiline
                numberOfLines={4}
              />
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
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitBtn, (!file || uploading || saving) && { opacity: 0.7 }]}
              onPress={handleSubmitCampaign}
              disabled={!file || uploading || saving}
            >
              <Text style={styles.submitBtnText}>
                {saving ? 'Saving...' : 'Submit'}
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
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 0,
    marginHorizontal: 0,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1D1F',
    marginBottom: 8,
  },
  required: {
    color: '#f37135',
  },
  input: {
    borderWidth: 1,
    borderColor: '#20536d',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1A1D1F',
    backgroundColor: '#FFFFFF', // Changed from '#FAFAFA' to '#FFFFFF'
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#20536d',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1A1D1F',
    backgroundColor: '#FFFFFF', // Changed from '#FAFAFA' to '#FFFFFF'
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addFilesTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1D1F',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#20536d',
    borderRadius: 16,
    backgroundColor: '#FFFFFF', // Changed from '#FAFAFA' to '#FFFFFF'
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#20536d',
    overflow: 'hidden',
  },
  filePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#20536d',
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
  },
  cancelBtnText: {
    color: '#f37135',
    fontWeight: '700',
    fontSize: 16,
  },
  submitBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CreateCampaignScreen; 
