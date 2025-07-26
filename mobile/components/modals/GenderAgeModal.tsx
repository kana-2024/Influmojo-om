import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GenderAgeModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyChanges: (gender: string, ageRange: { min: number; max: number }) => void;
  initialGender?: string;
  initialAgeRange?: { min: number; max: number };
}

const GenderAgeModal: React.FC<GenderAgeModalProps> = ({
  visible,
  onClose,
  onApplyChanges,
  initialGender = 'male',
  initialAgeRange = { min: 18, max: 40 }
}) => {
  const [selectedGender, setSelectedGender] = useState<string>(initialGender);
  const [ageRange, setAgeRange] = useState<{ min: number; max: number }>(initialAgeRange);

  const genders = ['Male', 'Female', 'Other'];

  useEffect(() => {
    setSelectedGender(initialGender);
    setAgeRange(initialAgeRange);
  }, [initialGender, initialAgeRange]);

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender.toLowerCase());
  };

  const handleAgeRangeChange = (min: number, max: number) => {
    setAgeRange({ min, max });
  };

  const handleResetToDefaults = () => {
    setSelectedGender('male');
    setAgeRange({ min: 18, max: 40 });
  };

  const handleApplyChanges = () => {
    onApplyChanges(selectedGender, ageRange);
    onClose();
  };

  if (!visible) {
    return null;
  }
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.genderAgeSheet}>
        {/* Header */}
        <View style={styles.genderAgeHeader}>
          <Text style={styles.genderAgeTitle}>Sort by Age & Gender</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.genderAgeContent} showsVerticalScrollIndicator={false}>
          {/* Gender Selection */}
          <View style={styles.genderSection}>
            <View style={styles.genderButtons}>
              {genders.map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderButton,
                    selectedGender === gender.toLowerCase() && styles.genderButtonSelected
                  ]}
                  onPress={() => handleGenderSelect(gender)}
                >
                  <Text style={[
                    styles.genderButtonText,
                    selectedGender === gender.toLowerCase() && styles.genderButtonTextSelected
                  ]}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Age Range Section */}
          <View style={styles.ageSection}>
            <View style={styles.ageHeader}>
              <Text style={styles.ageTitle}>Age range</Text>
              <Text style={styles.ageRangeText}>{ageRange.min}-{ageRange.max}+</Text>
            </View>
            
            {/* Simple Age Range Selector */}
            <View style={styles.ageRangeSelector}>
              <TouchableOpacity
                style={styles.ageOption}
                onPress={() => handleAgeRangeChange(18, 25)}
              >
                <Text style={styles.ageOptionText}>18-25</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ageOption}
                onPress={() => handleAgeRangeChange(26, 35)}
              >
                <Text style={styles.ageOptionText}>26-35</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ageOption}
                onPress={() => handleAgeRangeChange(36, 45)}
              >
                <Text style={styles.ageOptionText}>36-45</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ageOption}
                onPress={() => handleAgeRangeChange(18, 40)}
              >
                <Text style={styles.ageOptionText}>18-40+</Text>
              </TouchableOpacity>
            </View>
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
  genderAgeSheet: {
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
    zIndex: 1000,
  },
  genderAgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  genderAgeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  genderAgeContent: {
    flex: 1,
  },
  genderSection: {
    marginBottom: 24,
  },
  genderButtons: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#007AFF',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  genderButtonTextSelected: {
    color: '#fff',
  },
  ageSection: {
    marginBottom: 16,
  },
  ageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  ageRangeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  ageRangeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ageOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  ageOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
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
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default GenderAgeModal; 