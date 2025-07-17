import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = [
  'Gaming', 'Travel', 'Food', 'Education', 'Pet', 'Beauty',
  'Sports & Fitness', 'Lifestyle', 'Entertainment', 'Fashion',
  'Bloggers / Vloggers', 'Tech', 'Parenting', 'Photography',
  'Healthcare', 'virtual', 'Finance'
];

const HIGHLIGHTED = ['Beauty', 'Lifestyle', 'Entertainment', 'virtual'];

const LANGUAGES = ['Hindi', 'English', 'Telugu'];

export default function CreatorPreferencesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [about, setAbout] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState(LANGUAGES);
  const [scrolled, setScrolled] = useState(false);

  // Category selection logic
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else if (selectedCategories.length < 5) {
      setSelectedCategories([...selectedCategories, cat]);
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
        <Text style={styles.progressPercent}>50%</Text>

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
                  selectedCategories.includes(cat) && styles.categoryChipSelected,
                  HIGHLIGHTED.includes(cat) && styles.categoryChipHighlighted
                ]}
                onPress={() => toggleCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategories.includes(cat) && styles.categoryTextSelected,
                    HIGHLIGHTED.includes(cat) && styles.categoryTextHighlighted
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
          placeholderTextColor="#B0B0B0"
          value={about}
          onChangeText={setAbout}
          multiline
        />

        {/* Languages */}
        <Text style={styles.sectionTitle}>Languages</Text>
        <View style={styles.languageRow}>
          <View style={styles.languageChips}>
            {selectedLanguages.map(lang => (
              <View key={lang} style={styles.languageChip}>
                <Text style={styles.languageText}>{lang}</Text>
                <Ionicons name="close" size={14} color="#6B7280" style={{ marginLeft: 2 }} />
              </View>
            ))}
          </View>
          {/* Placeholder for dropdown */}
          <TouchableOpacity style={styles.languageDropdown}>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate('ProfileSetup')}
        >
          <Text style={styles.nextButtonText}>Next 1 / 1</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
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
    position: 'absolute', left: 0, top: 0, height: 8, width: '50%',
    backgroundColor: '#FF6B2C', borderRadius: 4, zIndex: 1,
  },
  progressPercent: { alignSelf: 'flex-end', color: '#6B7280', fontSize: 13, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1A1D1F', marginTop: 12, marginBottom: 2 },
  sectionSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  categoriesBox: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  categoriesRow: {
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
  languageRow: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  languageChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  languageChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 4,
  },
  languageText: { color: '#1A1D1F', fontSize: 14, marginRight: 2 },
  languageDropdown: {
    backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB',
    padding: 4, marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FF6B2C', borderRadius: 8, paddingVertical: 14, marginBottom: 8,
  },
  nextButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  bottomRow: { alignItems: 'center', marginTop: 8 },
  bottomText: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
  loginLink: { color: '#2563EB', fontWeight: '500' },
}); 