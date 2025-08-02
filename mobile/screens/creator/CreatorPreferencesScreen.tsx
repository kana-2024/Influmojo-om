import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView, StatusBar, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { profileAPI } from '../../services/apiService';
import { CheckboxItem, SelectionModal } from '../../components';
import COLORS from '../../config/colors';

const CATEGORIES = [
  'Gaming', 'Travel', 'Food', 'Education', 'Pet', 'Beauty',
  'Sports & Fitness', 'Lifestyle', 'Entertainment', 'Fashion',
  'Bloggers / Vloggers', 'Tech', 'Parenting', 'Photography',
  'Healthcare', 'virtual', 'Finance'
];



const LANGUAGES = ['Hindi', 'English', 'Telugu'];

const PLATFORMS = ['Instagram', 'YouTube', 'Facebook', 'TikTok', 'Twitter', 'LinkedIn', 'Snapchat'];

export default function CreatorPreferencesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [about, setAbout] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Category selection logic
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else if (selectedCategories.length < 5) {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Language selection logic
  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  // Platform selection logic
  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };



  // Save preferences to database
  const handleSavePreferences = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one category');
      return;
    }

    if (!about.trim()) {
      Alert.alert('Error', 'Please add a brief description about your work');
      return;
    }

    if (selectedLanguages.length === 0) {
      Alert.alert('Error', 'Please select at least one language');
      return;
    }

    if (selectedPlatforms.length === 0) {
      Alert.alert('Error', 'Please select at least one platform');
      return;
    }

    setLoading(true);
    try {
      await profileAPI.updatePreferences({
        categories: selectedCategories,
        about: about.trim(),
        languages: selectedLanguages,
        platform: selectedPlatforms
      });

      console.log('✅ Preferences saved successfully!');
      Alert.alert('Success', 'Preferences saved successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('ProfileComplete') }
      ]);
    } catch (error) {
      console.error('❌ Save preferences error:', error);
      console.error('❌ Error message:', error.message);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='light-content' backgroundColor='#000' />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top || 20, flexGrow: 1 }
        ]}
        keyboardShouldPersistTaps="handled"
        onScroll={event => {
          const y = event.nativeEvent.contentOffset.y;
          setScrolled(y > 10);
        }}
        scrollEventThrottle={16}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
          </TouchableOpacity>
          <Text style={styles.stepText}>Step 1</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>Welcome to the creator community!</Text>
        <Text style={styles.subtitle}>
          We'll just collect a few essential details for now.{"\n"}
          You can complete your full profile anytime later.
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg} />
          <View style={styles.progressBarFill} />
        </View>
        <Text style={styles.progressPercent}>90%</Text>

        {/* Pick Categories */}
        <Text style={styles.sectionTitle}>Pick categories</Text>
        <Text style={styles.sectionSubtitle}>
          Minimum one category and maximum five you can select.
        </Text>
        <View style={styles.categoriesBox}>
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  selectedCategories.includes(cat) && styles.categoryChipSelected
                ]}
                onPress={() => toggleCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategories.includes(cat) && styles.categoryTextSelected
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <TextInput
          style={styles.aboutInput}
          placeholder="Brief about your work so that it will help brands to connect you easily."
          placeholderTextColor={COLORS.placeholder}
          value={about}
          onChangeText={setAbout}
          multiline
        />



        {/* Languages */}
        <Text style={styles.sectionTitle}>Languages</Text>
        <Text style={styles.sectionSubtitle}>
          Select the languages you can create content in.
        </Text>
        <View style={styles.languageBox}>
          <View style={styles.languageChips}>
            {selectedLanguages.map(lang => (
              <TouchableOpacity
                key={lang}
                style={styles.languageChip}
                onPress={() => toggleLanguage(lang)}
                activeOpacity={0.7}
              >
                <Text style={styles.languageText}>{lang}</Text>
                <Ionicons name="close" size={14} color="#6B7280" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity 
            style={styles.languageDropdown}
            onPress={() => setShowLanguageModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>
              {selectedLanguages.length === 0 ? 'Select Languages' : `${selectedLanguages.length} selected`}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Platforms */}
        <Text style={styles.sectionTitle}>Platforms</Text>
        <Text style={styles.sectionSubtitle}>
          Select the platforms you create content on.
        </Text>
        <View style={styles.languageBox}>
          <View style={styles.languageChips}>
            {selectedPlatforms.map(platform => (
              <TouchableOpacity
                key={platform}
                style={styles.languageChip}
                onPress={() => togglePlatform(platform)}
                activeOpacity={0.7}
              >
                <Text style={styles.languageText}>{platform}</Text>
                <Ionicons name="close" size={14} color="#6B7280" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity 
            style={styles.languageDropdown}
            onPress={() => setShowPlatformModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>
              {selectedPlatforms.length === 0 ? 'Select Platforms' : `${selectedPlatforms.length} selected`}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, loading && { opacity: 0.7 }]}
          onPress={handleSavePreferences}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Saving...' : 'Next 2 / 2'}
          </Text>
          {!loading && <Ionicons name="arrow-forward" size={20} color="#f8f4e8" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      </ScrollView>

      {/* Overlays for modals */}
      {showLanguageModal && (
        <View style={styles.modalOverlay} />
      )}
      {showPlatformModal && (
        <View style={styles.modalOverlay} />
      )}

      {/* Language Selection Modal */}
      <SelectionModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title="Select Languages"
        subtitle="Choose the languages you can create content in."
        options={LANGUAGES}
        selectedOptions={selectedLanguages}
        onToggleOption={toggleLanguage}
      />

      {/* Platform Selection Modal */}
      <SelectionModal
        visible={showPlatformModal}
        onClose={() => setShowPlatformModal(false)}
        title="Select Platforms"
        subtitle="Choose the platforms you create content on."
        options={PLATFORMS}
        selectedOptions={selectedPlatforms}
        onToggleOption={togglePlatform}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f4e8' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15%', marginTop: 16,
  },
  stepText: { fontSize: 18, fontWeight: '500', color: '#1A1D1F', textAlign: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1D1F', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 16, lineHeight: 22 },
  progressBarContainer: { height: 8, width: '100%', marginBottom: 4, position: 'relative' },
  progressBarBg: {
    position: 'absolute', left: 0, top: 0, height: 8, width: '100%',
    backgroundColor: '#E5E7EB', borderRadius: 4,
  },
  progressBarFill: {
    position: 'absolute', left: 0, top: 0, height: 8, width: '90%',
    backgroundColor: '#f37135', borderRadius: 4, zIndex: 1,
  },
  progressPercent: { alignSelf: 'flex-end', color: '#6B7280', fontSize: 13, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1A1D1F', marginTop: 12, marginBottom: 2 },
  sectionSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  categoriesBox: {
    backgroundColor: '#f8f4e8', borderRadius: 12, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  categoriesRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6,
    margin: 4, borderWidth: 1, borderColor: '#E5E7EB',
  },
  categoryChipSelected: {
    backgroundColor: '#FFF3E0', borderColor: '#FD5D27', borderWidth: 1,
  },

  categoryText: { color: '#1A1D1F', fontSize: 14 },
  categoryTextSelected: { color: '#f37135', fontWeight: '600' },

  aboutInput: {
    backgroundColor: '#F5F5F5', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 8, marginTop: 12, minHeight: 48,
  },

  languageBox: { 
    backgroundColor: '#f8f4e8', 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    marginTop: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  languageChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  languageChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 4,
  },
  languageText: { color: '#1A1D1F', fontSize: 14, marginRight: 2 },
  languageDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    marginLeft: 8,
  },
  dropdownText: { color: '#6B7280', fontSize: 14, marginRight: 8 },
  languageOptionsBox: {
    backgroundColor: '#f8f4e8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    marginTop: 12,
    overflow: 'hidden',
  },

  nextButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f37135', borderRadius: 8, paddingVertical: 14, marginBottom: 8,
  },
  nextButtonText: { color: '#f8f4e8', fontWeight: '600', fontSize: 16 },
  bottomRow: { alignItems: 'center', marginTop: 8 },
  bottomText: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
  loginLink: { color: '#2563EB', fontWeight: '500' },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
}); 
