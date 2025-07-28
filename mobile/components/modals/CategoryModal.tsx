import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyChanges: (selectedCategories: string[]) => void;
  initialSelectedCategories?: string[];
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  onClose,
  onApplyChanges,
  initialSelectedCategories = []
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelectedCategories);

  const categories = [
    'Gaming', 'Travel', 'Food', 'Education', 'Pet', 'Beauty',
    'Sports & Fitness', 'Lifestyle', 'Entertainment', 'Fashion',
    'Bloggers / Vloggers', 'Tech', 'Parenting', 'Photography',
    'Healthcare', 'Virtual', 'Finance'
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const handleResetToDefaults = () => {
    setSelectedCategories(['Beauty', 'Lifestyle', 'Entertainment']);
  };

  const handleApplyChanges = () => {
    onApplyChanges(selectedCategories);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.categorySheet}>
        {/* Header */}
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>Sort by Category</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.categoryContent} showsVerticalScrollIndicator={false}>
          {/* Select Category Section */}
          <Text style={styles.selectCategoryTitle}>Select Category</Text>
          
          {/* Categories Grid */}
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTag,
                  selectedCategories.includes(category) && styles.categoryTagSelected
                ]}
                onPress={() => handleCategoryToggle(category)}
              >
                <Text style={[
                  styles.categoryTagText,
                  selectedCategories.includes(category) && styles.categoryTagTextSelected
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetToDefaults}>
            <Text style={styles.resetButtonText}>Reset to defaults</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyChanges}>
            <Text style={styles.applyButtonText}>Apply Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  categorySheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f4e8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  categoryContent: {
    flex: 1,
  },
  selectCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryTagSelected: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  categoryTagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryTagTextSelected: {
    color: '#D97706',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FD5D27',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FD5D27',
    fontWeight: '600',
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FD5D27',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#f8f4e8',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CategoryModal; 
