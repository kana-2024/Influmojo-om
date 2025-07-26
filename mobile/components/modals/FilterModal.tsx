import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryModal from './CategoryModal';
import FollowerRangeModal from './FollowerRangeModal';
import PlatformModal from './PlatformModal';

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
  selectedPlatforms = []
}) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFollowerRangeModal, setShowFollowerRangeModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);

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
      onPress: () => {
        console.log('Platforms option clicked, setting showPlatformModal to true');
        setShowPlatformModal(true);
      }
    },
    { title: 'Gender & Age Group', subtitle: 'Select age and gender', onPress: () => console.log('Gender & Age Group clicked') },
    { title: 'Response Time', subtitle: 'Quick responder', onPress: () => console.log('Response Time clicked') },
    { title: 'Language', subtitle: 'Select language', onPress: () => console.log('Language clicked') },
    { title: 'Region', subtitle: 'Select state and city', onPress: () => console.log('Region clicked') },
    { title: 'Feedback Rating', subtitle: 'Select rating range', onPress: () => console.log('Feedback Rating clicked') },
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

  console.log('FilterModal render - visible:', visible, 'showPlatformModal:', showPlatformModal);
  
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
                  onPress={() => {
                    console.log('Filter option clicked:', option.title);
                    option.onPress?.();
                  }}
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
        visible={true} // Temporarily always visible for testing
        onClose={() => {
          console.log('Platform modal closing');
          setShowPlatformModal(false);
        }}
        onApplyChanges={handlePlatformApply}
        initialSelectedPlatforms={selectedPlatforms}
      />
      
      {/* Debug: Show platform modal state */}
      {console.log('FilterModal - showPlatformModal state:', showPlatformModal)}
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