import React, { useState, useRef, useEffect, FC } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomDropdownDefault from '../../components/CustomDropdown';
import { profileAPI } from '../../services/apiService';

const platforms = ['Instagram', 'Facebook', 'Youtube', 'Snapchat'];
const contentTypes = ['Reel', 'Story', 'Feed post', 'Carousel Post'];
const durations1 = ['1 Minute', '2 Minutes', '3 Minutes'];
const durations2 = ['30 Seconds', '45 Seconds', '1 Minute'];

interface CreatePackageScreenProps {
  navigation?: any;
  onClose?: () => void;
  CustomDropdown?: FC<any>;
  onPackageCreated?: () => void;
}

const CreatePackageScreen: React.FC<CreatePackageScreenProps> = ({ navigation, onClose = () => navigation?.goBack?.(), CustomDropdown, onPackageCreated }) => {
  const insets = useSafeAreaInsets();
  useEffect(() => {
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [platform, setPlatform] = useState('Instagram');
  const [contentType, setContentType] = useState('Reel');
  const [quantity, setQuantity] = useState('1');
  const [revisions, setRevisions] = useState('1');
  const [duration1, setDuration1] = useState('1 Minute');
  const [duration2, setDuration2] = useState('30 Seconds');
  const [price, setPrice] = useState('50000');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const Dropdown = CustomDropdown || CustomDropdownDefault;

  // Save package to database
  const handleCreatePackage = async () => {
    if (!platform.trim()) {
      Alert.alert('Error', 'Please select a platform');
      return;
    }

    if (!contentType.trim()) {
      Alert.alert('Error', 'Please select a content type');
      return;
    }

    if (!quantity.trim() || parseInt(quantity) < 1) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (!price.trim() || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      await profileAPI.createPackage({
        platform: platform.trim(),
        contentType: contentType.trim(),
        quantity: quantity.trim(),
        revisions: revisions.trim() || '0',
        duration1: duration1.trim(),
        duration2: duration2.trim(),
        price: price.trim(),
        description: desc.trim()
      });

      Alert.alert('Success', 'Package created successfully!', [
        { text: 'OK', onPress: () => {
          onClose();
          if (onPackageCreated) {
            onPackageCreated();
          }
        }}
      ]);
    } catch (error) {
      console.error('Create package error:', error);
      Alert.alert('Error', 'Failed to create package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
      <StatusBar barStyle='light-content' backgroundColor='#000' />
      <View style={[styles.safeArea, { paddingTop: insets.top + 8 }]}> 
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.headerBtn} onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.header}>Create Package</Text>
            <TouchableOpacity style={styles.headerBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Choose platform */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Choose platform<Text style={styles.required}>*</Text></Text>
              <Dropdown
                value={platform}
                setValue={setPlatform}
                options={platforms}
              />
            </View>

            {/* Select Content type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Content type<Text style={styles.required}>*</Text></Text>
              <Dropdown
                value={contentType}
                setValue={setContentType}
                options={contentTypes}
              />
            </View>

            {/* Quantity */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Quantity<Text style={styles.required}>*</Text></Text>
              <Dropdown
                value={quantity}
                setValue={setQuantity}
                options={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}
              />
            </View>

            {/* Revisions */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Revisions</Text>
              <Dropdown
                value={revisions}
                setValue={setRevisions}
                options={['0', '1', '2', '3', '4', '5']}
              />
            </View>

            {/* Duration */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Duration<Text style={styles.required}>*</Text></Text>
              <View style={styles.durationRow}>
                <View style={styles.durationDropdown}>
                  <Dropdown
                    value={duration1}
                    setValue={setDuration1}
                    options={durations1}
                  />
                </View>
                <View style={styles.durationDropdown}>
                  <Dropdown
                    value={duration2}
                    setValue={setDuration2}
                    options={durations2}
                  />
                </View>
              </View>
            </View>

            {/* Price */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Price (INR)<Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="50000"
                  placeholderTextColor="#B0B0B0"
                />
                <TouchableOpacity style={styles.arrowBtn}>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Brief Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Brief Description</Text>
              <TextInput
                style={styles.textArea}
                value={desc}
                onChangeText={setDesc}
                placeholder="Brief description of your package has to be add here."
                placeholderTextColor="#B0B0B0"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleCreatePackage}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading ? 'Creating...' : 'Submit'}
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
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 24,
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1F',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1D1F',
  },
  arrowBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationDropdown: {
    flex: 1,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1D1F',
    minHeight: 100,
    backgroundColor: '#F5F5F5',
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

export default CreatePackageScreen;
