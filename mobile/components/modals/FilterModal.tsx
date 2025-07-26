import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryModal from './CategoryModal';
import FollowerRangeModal from './FollowerRangeModal';
import PlatformModal from './PlatformModal';
import LanguageModal from './LanguageModal';
import ResponseTimeModal from './ResponseTimeModal';
import GenderAgeModal from './GenderAgeModal';
import RatingModal from './RatingModal';
import RegionModal from './RegionModal';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onClearAll: () => void;
  onApplyFilters: () => void;
  resultCount?: number;
  onCategoryChange?: (categories: string[]) => void;
  selectedCategories?: string[];
  onFollowerRangeChange?: (minFollowers: number, maxFollowers: number) => void;
  followerRange?: { min: number; max: number };
  onPlatformChange?: (platforms: string[]) => void;
  selectedPlatforms?: string[];
  onLanguageChange?: (languages: string[]) => void;
  selectedLanguages?: string[];
  onResponseTimeChange?: (responseTime: string) => void;
  selectedResponseTime?: string;
  onGenderAgeChange?: (gender: string, ageRange: { min: number; max: number }) => void;
  selectedGender?: string;
  selectedAgeRange?: { min: number; max: number };
  onRatingChange?: (selectedRating: number) => void;
  selectedRating?: number;
  onRegionChange?: (states: string[], cities: string[]) => void;
  selectedStates?: string[];
  selectedCities?: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onClearAll,
  onApplyFilters,
  resultCount = 20,
  onCategoryChange,
  selectedCategories = [],
  onFollowerRangeChange,
  followerRange = { min: 5000, max: 800000 },
  onPlatformChange,
  selectedPlatforms = [],
  onLanguageChange,
  selectedLanguages = [],
  onResponseTimeChange,
  selectedResponseTime = '1-2',
  onGenderAgeChange,
  selectedGender = 'male',
  selectedAgeRange = { min: 18, max: 40 },
  onRatingChange,
  selectedRating = 3,
  onRegionChange,
  selectedStates = [],
  selectedCities = []
}) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFollowerRangeModal, setShowFollowerRangeModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showResponseTimeModal, setShowResponseTimeModal] = useState(false);
  const [showGenderAgeModal, setShowGenderAgeModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);

  const filterOptions = [
    { 
      title: 'Categories', 
      subtitle: selectedCategories.length > 0 ? `${selectedCategories.length} selected` : 'All categories',
      onPress: () => setShowCategoryModal(true)
    },
    { 
      title: 'Follower Range', 
      subtitle: `${followerRange.min.toLocaleString()} - ${followerRange.max.toLocaleString()} followers`,
      onPress: () => setShowFollowerRangeModal(true)
    },
    { 
      title: 'Platforms', 
      subtitle: selectedPlatforms.length > 0 ? `${selectedPlatforms.length} selected` : 'All Platforms',
      onPress: () => setShowPlatformModal(true)
    },
    { 
      title: 'Gender & Age Group', 
      subtitle: `${selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)}, ${selectedAgeRange.min}-${selectedAgeRange.max}+`,
      onPress: () => setShowGenderAgeModal(true)
    },
    { 
      title: 'Response Time', 
      subtitle: selectedResponseTime === '1-2' ? 'Quick responder' : `Response in ${selectedResponseTime} Hrs`,
      onPress: () => setShowResponseTimeModal(true)
    },
    { 
      title: 'Language', 
      subtitle: selectedLanguages.length > 0 ? `${selectedLanguages.length} selected` : 'Select language',
      onPress: () => setShowLanguageModal(true)
    },
    { 
      title: 'Region', 
      subtitle: selectedStates.length > 0 ? `${selectedStates.length} states selected` : 'Select state and city',
      onPress: () => setShowRegionModal(true)
    },
    { 
      title: 'Feedback Rating', 
      subtitle: `${selectedRating} stars`,
      onPress: () => setShowRatingModal(true)
    },
  ];

  const handleCategoryApply = (categories: string[]) => {
    onCategoryChange?.(categories);
    setShowCategoryModal(false);
  };

  const handleFollowerRangeApply = (minFollowers: number, maxFollowers: number) => {
    onFollowerRangeChange?.(minFollowers, maxFollowers);
    setShowFollowerRangeModal(false);
  };

  const handlePlatformApply = (platforms: string[]) => {
    onPlatformChange?.(platforms);
    setShowPlatformModal(false);
  };

  const handleLanguageApply = (languages: string[]) => {
    onLanguageChange?.(languages);
    setShowLanguageModal(false);
  };

  const handleResponseTimeApply = (responseTime: string) => {
    onResponseTimeChange?.(responseTime);
    setShowResponseTimeModal(false);
  };

  const handleGenderAgeApply = (gender: string, ageRange: { min: number; max: number }) => {
    onGenderAgeChange?.(gender, ageRange);
    setShowGenderAgeModal(false);
  };

  const handleRatingApply = (selectedRating: number) => {
    onRatingChange?.(selectedRating);
    setShowRatingModal(false);
  };

  const handleRegionApply = (states: string[], cities: string[]) => {
    onRegionChange?.(states, cities);
    setShowRegionModal(false);
  };


  
  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.filterSheet}>
          {/* Header */}
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
            {/* Filter By Section */}
            <Text style={styles.filterByTitle}>FILTER BY</Text>
            
            {/* Filter Options List */}
            {filterOptions.map((option, index) => (
              <View key={option.title}>
                <TouchableOpacity 
                  style={styles.filterOptionRow}
                  activeOpacity={0.7}
                  onPress={option.onPress}
                >
                  <View style={styles.filterOptionContent}>
                    <Text style={styles.filterOptionTitle}>{option.title}</Text>
                    <Text style={styles.filterOptionSubtitle}>{option.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
                {index < filterOptions.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.clearButton} onPress={onClearAll}>
              <Text style={styles.clearButtonText}>Clear all</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.showingButton} onPress={onApplyFilters}>
              <Text style={styles.showingButtonText}>Showing {resultCount}+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <CategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onApplyChanges={handleCategoryApply}
        initialSelectedCategories={selectedCategories}
      />

      {/* Follower Range Modal */}
      <FollowerRangeModal
        visible={showFollowerRangeModal}
        onClose={() => setShowFollowerRangeModal(false)}
        onApplyChanges={handleFollowerRangeApply}
        initialMinFollowers={followerRange.min}
        initialMaxFollowers={followerRange.max}
      />

      {/* Platform Modal */}
      <PlatformModal
        visible={showPlatformModal}
        onClose={() => setShowPlatformModal(false)}
        onApplyChanges={handlePlatformApply}
        initialSelectedPlatforms={selectedPlatforms}
      />

      {/* Language Modal */}
      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onApplyChanges={handleLanguageApply}
        initialSelectedLanguages={selectedLanguages}
      />

      {/* Response Time Modal */}
      <ResponseTimeModal
        visible={showResponseTimeModal}
        onClose={() => setShowResponseTimeModal(false)}
        onApplyChanges={handleResponseTimeApply}
        initialSelectedResponseTime={selectedResponseTime}
      />

      {/* Gender & Age Modal */}
      <GenderAgeModal
        visible={showGenderAgeModal}
        onClose={() => setShowGenderAgeModal(false)}
        onApplyChanges={handleGenderAgeApply}
        initialGender={selectedGender}
        initialAgeRange={selectedAgeRange}
      />

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onApplyChanges={handleRatingApply}
        initialSelectedRating={selectedRating}
      />

      {/* Region Modal */}
      <RegionModal
        visible={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        onApplyChanges={handleRegionApply}
        initialSelectedStates={selectedStates}
        initialSelectedCities={selectedCities}
      />
    </>
  );
};

const styles = StyleSheet.create({
  filterSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  filterContent: {
    flex: 1,
  },
  filterByTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  filterOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  filterOptionContent: {
    flex: 1,
  },
  filterOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  filterOptionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FD5D27',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FD5D27',
    fontWeight: '600',
    fontSize: 16,
  },
  showingButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FD5D27',
    alignItems: 'center',
  },
  showingButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FilterModal; 