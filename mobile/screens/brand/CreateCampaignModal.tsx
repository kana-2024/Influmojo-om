import React, { useState, useRef, useEffect, FC } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, StatusBar, Platform, Pressable, Dimensions, LayoutRectangle, findNodeHandle, UIManager, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomDropdownDefault from '../../components/CustomDropdown';
import { profileAPI } from '../../services/apiService';
import COLORS from '../../config/colors';

const campaignTypes = ['Brand Awareness', 'Product Launch', 'Lead Generation', 'Sales Promotion', 'Event Promotion'];
const platforms = ['Instagram', 'Facebook', 'Youtube', 'TikTok', 'LinkedIn', 'Twitter'];
const durations = ['1 Week', '2 Weeks', '1 Month', '2 Months', '3 Months', '6 Months'];
const budgets = ['₹10,000 - ₹25,000', '₹25,000 - ₹50,000', '₹50,000 - ₹1,00,000', '₹1,00,000 - ₹2,50,000', '₹2,50,000+'];
const targetAudiences = ['Gen Z (18-24)', 'Millennials (25-40)', 'Gen X (41-56)', 'Baby Boomers (57+)', 'All Ages'];

interface CreateCampaignModalProps {
  onClose?: () => void;
  onBack?: () => void;
  CustomDropdown?: FC<any>;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ onClose, onBack, CustomDropdown }) => {
  const insets = useSafeAreaInsets();
  useEffect(() => {
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [campaignType, setCampaignType] = useState('Brand Awareness');
  const [platform, setPlatform] = useState('Instagram');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('₹25,000 - ₹50,000');
  const [duration, setDuration] = useState('1 Month');
  const [requirements, setRequirements] = useState('');
  const [targetAudience, setTargetAudience] = useState('Millennials (25-40)');
  const [loading, setLoading] = useState(false);

  const Dropdown = CustomDropdown || CustomDropdownDefault;

  // Save campaign to database
  const handleCreateCampaign = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a campaign title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a campaign description');
      return;
    }

    if (!requirements.trim()) {
      Alert.alert('Error', 'Please enter campaign requirements');
      return;
    }

    setLoading(true);
    try {
      await profileAPI.createCampaign({
        title: title.trim(),
        description: description.trim(),
        budget: budget.trim(),
        duration: duration.trim(),
        requirements: requirements.trim(),
        targetAudience: targetAudience.trim()
      });

      Alert.alert('Success', 'Campaign created successfully!', [
        { text: 'OK', onPress: () => onClose?.() }
      ]);
    } catch (error) {
      console.error('Create campaign error:', error);
      Alert.alert('Error', 'Failed to create campaign. Please try again.');
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
            <Text style={styles.header}>Create Campaign</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.form}
            showsVerticalScrollIndicator={false}
            bounces={false}
            onScroll={event => {
              const y = event.nativeEvent.contentOffset.y;
              setScrolled(y > 10);
            }}
            scrollEventThrottle={16}
          >
            <Text style={styles.label}>Campaign Type*</Text>
            <Dropdown value={campaignType} setValue={setCampaignType} options={campaignTypes} />

            <Text style={styles.label}>Platform*</Text>
            <Dropdown value={platform} setValue={setPlatform} options={platforms} />

            <Text style={styles.label}>Campaign Title*</Text>
                        <TextInput
              style={styles.input}
              value={title} 
              onChangeText={setTitle}
              placeholder="Enter your campaign title"
              placeholderTextColor={COLORS.placeholder}
            />

            <Text style={styles.label}>Campaign Description*</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Describe your campaign goals and objectives"
              placeholderTextColor={COLORS.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Budget Range*</Text>
            <Dropdown value={budget} setValue={setBudget} options={budgets} />

            <Text style={styles.label}>Campaign Duration*</Text>
            <Dropdown value={duration} setValue={setDuration} options={durations} />

            <Text style={styles.label}>Target Audience*</Text>
            <Dropdown value={targetAudience} setValue={setTargetAudience} options={targetAudiences} />

            <Text style={styles.label}>Requirements*</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Describe what you're looking for from creators (content type, style, deliverables, etc.)"
              placeholderTextColor={COLORS.placeholder}
              value={requirements}
              onChangeText={setRequirements}
              multiline
            />

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                onPress={handleCreateCampaign}
                disabled={loading}
              >
                <Text style={styles.submitBtnText}>
                  {loading ? 'Creating...' : 'Create Campaign'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  card: {
    flex: 1.2,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 0,
    marginHorizontal: 0,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    marginBottom: 8,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#20536d',
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1D1F',
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1D1F',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#20536d',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1D1F',
    backgroundColor: '#FFFFFF', // Changed from '#F5F5F5' to '#FFFFFF'
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#20536d',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#f37135',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default CreateCampaignModal; 
