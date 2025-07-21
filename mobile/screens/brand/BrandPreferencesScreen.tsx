import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView, StatusBar, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { profileAPI } from '../../services/apiService';

export default function BrandPreferencesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [about, setAbout] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [industries, setIndustries] = useState<string[]>([]);
  const [highlightedIndustries, setHighlightedIndustries] = useState<string[]>([]);
  const [industriesLoading, setIndustriesLoading] = useState(true);

  const LANGUAGES = ['Hindi', 'English', 'Telugu'];

  useEffect(() => {
    loadIndustries();
  }, []);

  // Load industries from API
  const loadIndustries = async () => {
    try {
      setIndustriesLoading(true);
      const response = await profileAPI.getIndustries();
      
      if (response.success && response.data) {
        setIndustries(response.data.industries || []);
        setHighlightedIndustries(response.data.highlighted || []);
      } else {
        console.warn('Failed to load industries, using fallback');
        // Fallback to default industries if API fails
        setIndustries([
          'IT & Technology', 'Entertainment', 'Fashion & Beauty', 'Food & Beverage', 
          'Healthcare', 'Education', 'Finance & Banking', 'Travel & Tourism',
          'Sports & Fitness', 'Automotive', 'Real Estate', 'E-commerce',
          'Manufacturing', 'Media & Advertising', 'Consulting', 'Non-Profit'
        ]);
        setHighlightedIndustries(['IT & Technology', 'Entertainment', 'Fashion & Beauty', 'E-commerce']);
      }
    } catch (error) {
      console.error('Error loading industries:', error);
      // Fallback to default industries if API fails
      setIndustries([
        'IT & Technology', 'Entertainment', 'Fashion & Beauty', 'Food & Beverage', 
        'Healthcare', 'Education', 'Finance & Banking', 'Travel & Tourism',
        'Sports & Fitness', 'Automotive', 'Real Estate', 'E-commerce',
        'Manufacturing', 'Media & Advertising', 'Consulting', 'Non-Profit'
      ]);
      setHighlightedIndustries(['IT & Technology', 'Entertainment', 'Fashion & Beauty', 'E-commerce']);
    } finally {
      setIndustriesLoading(false);
    }
  };

  // Industry selection logic
  const toggleIndustry = (industry: string) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
    } else if (selectedIndustries.length < 5) {
      setSelectedIndustries([...selectedIndustries, industry]);
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

  const removeLanguage = (lang: string) => {
    setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
  };



  // Save preferences to database
  const handleSavePreferences = async () => {
    if (selectedIndustries.length === 0) {
      Alert.alert('Error', 'Please select at least one industry');
      return;
    }

    if (!about.trim()) {
      Alert.alert('Error', 'Please add a brief description about your brand');
      return;
    }

    if (selectedLanguages.length === 0) {
      Alert.alert('Error', 'Please select at least one language');
      return;
    }

    setLoading(true);
    try {
      // Debug: Check if we have a token
      const { getToken } = require('../../services/storage');
      const token = await getToken();
      console.log('🔍 Debug: Token exists:', !!token);
      console.log('🔍 Debug: Token length:', token?.length || 0);
      
      if (!token) {
        console.error('❌ No token found! This is the issue.');
        Alert.alert('Error', 'Authentication token not found. Please try signing in again.');
        setLoading(false);
        return;
      }

      console.log('🔍 Debug: Calling profileAPI.updatePreferences...');
      await profileAPI.updatePreferences({
        categories: selectedIndustries,
        about: about.trim(),
        languages: selectedLanguages,
      });
      
      console.log('🔍 Debug: Selected role:', 'N/A'); // Removed role from debug log

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
        <Text style={styles.title}>Welcome to the brand community!</Text>
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

        {/* Select Industry */}
        <Text style={styles.sectionTitle}>Select Industry</Text>
        <Text style={styles.sectionSubtitle}>
          Minimum one industry and maximum five you can select.
        </Text>
        <View style={styles.industriesBox}>
          {industriesLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading industries...</Text>
            </View>
          ) : (
            <View style={styles.industriesRow}>
              {industries.map((industry) => (
                <TouchableOpacity
                  key={industry}
                  style={[
                    styles.categoryChip,
                    selectedIndustries.includes(industry) && styles.categoryChipSelected,
                    highlightedIndustries.includes(industry) && styles.categoryChipHighlighted
                  ]}
                  onPress={() => toggleIndustry(industry)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedIndustries.includes(industry) && styles.categoryTextSelected,
                      highlightedIndustries.includes(industry) && styles.categoryTextHighlighted
                    ]}
                  >
                    {industry}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <TextInput
          style={styles.aboutInput}
          placeholder="Brief about your brand so that it will help creators to connect with you easily."
          placeholderTextColor="#B0B0B0"
          value={about}
          onChangeText={setAbout}
          multiline
        />



        {/* Languages */}
        <Text style={styles.sectionTitle}>Languages</Text>
        <Text style={styles.sectionSubtitle}>
          Select the languages you want to work with creators in.
        </Text>
        <View style={styles.languageBox}>
          <View style={styles.languageChips}>
            {selectedLanguages.map(lang => (
              <TouchableOpacity
                key={lang}
                style={styles.languageChip}
                onPress={() => removeLanguage(lang)}
                activeOpacity={0.7}
              >
                <Text style={styles.languageText}>{lang}</Text>
                <Ionicons name="close" size={14} color="#6B7280" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity 
            style={[styles.languageDropdown, LANGUAGES.filter(lang => !selectedLanguages.includes(lang)).length === 0 && { opacity: 0.5 }]}
            onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
            activeOpacity={0.7}
            disabled={LANGUAGES.filter(lang => !selectedLanguages.includes(lang)).length === 0}
          >
            <Text style={styles.dropdownText}>
              {LANGUAGES.filter(lang => !selectedLanguages.includes(lang)).length === 0 ? 'All Selected' : 'Add Language'}
            </Text>
            <Ionicons name={showLanguageDropdown ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        {/* Language Dropdown Options */}
        {showLanguageDropdown && (
          <View style={styles.languageOptionsBox}>
            {LANGUAGES.filter(lang => !selectedLanguages.includes(lang)).map(lang => (
              <TouchableOpacity
                key={lang}
                style={styles.languageOption}
                onPress={() => {
                  toggleLanguage(lang);
                  setShowLanguageDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.languageOptionText}>{lang}</Text>
              </TouchableOpacity>
            ))}
            {LANGUAGES.filter(lang => !selectedLanguages.includes(lang)).length === 0 && (
              <View style={styles.languageOption}>
                <Text style={[styles.languageOptionText, { color: '#6B7280' }]}>All languages selected</Text>
              </View>
            )}
          </View>
        )}

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, loading && { opacity: 0.7 }]}
          onPress={handleSavePreferences}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Saving...' : 'Next 1 / 1'}
          </Text>
          {!loading && <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },
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
    backgroundColor: '#FF6B2C', borderRadius: 4, zIndex: 1,
  },
  progressPercent: { alignSelf: 'flex-end', color: '#6B7280', fontSize: 13, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1A1D1F', marginTop: 12, marginBottom: 2 },
  sectionSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  industriesBox: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  industriesRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6,
    margin: 4, borderWidth: 0,
  },
  categoryChipSelected: {
    backgroundColor: '#FF6B2C22', borderColor: '#FF6B2C', borderWidth: 1,
  },
  categoryChipHighlighted: {
    backgroundColor: '#FF6B2C11',
  },
  categoryText: { color: '#1A1D1F', fontSize: 14 },
  categoryTextSelected: { color: '#FF6B2C', fontWeight: '600' },
  categoryTextHighlighted: { color: '#FF6B2C', fontWeight: '500' },
  aboutInput: {
    backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, marginBottom: 8, marginTop: 12, minHeight: 48,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 12,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 48,
  },
  calendarButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageBox: { 
    backgroundColor: '#FFFFFF', 
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
    backgroundColor: '#fff', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    marginLeft: 8,
  },
  dropdownText: { color: '#6B7280', fontSize: 14, marginRight: 8 },
  languageOptionsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    paddingVertical: 4,
  },
  languageOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  languageOptionText: { color: '#1A1D1F', fontSize: 14 },
  nextButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FF6B2C', borderRadius: 8, paddingVertical: 14, marginBottom: 8,
  },
  nextButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  bottomRow: { alignItems: 'center', marginTop: 8 },
  bottomText: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
  loginLink: { color: '#2563EB', fontWeight: '500' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
  },
}); 