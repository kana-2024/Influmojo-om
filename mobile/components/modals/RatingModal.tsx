import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyChanges: (selectedRating: number) => void;
  initialSelectedRating?: number;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onApplyChanges,
  initialSelectedRating = 3
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(initialSelectedRating);

  useEffect(() => {
    setSelectedRating(initialSelectedRating);
  }, [initialSelectedRating]);

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleResetToDefaults = () => {
    setSelectedRating(3);
  };

  const handleApplyChanges = () => {
    onApplyChanges(selectedRating);
    onClose();
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={styles.star}>
            ★
          </Text>
        ))}
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    );
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
      <View style={styles.ratingSheet}>
        {/* Header */}
        <View style={styles.ratingHeader}>
          <Text style={styles.ratingTitle}>Sort By Rating</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.ratingContent} showsVerticalScrollIndicator={false}>
          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <View style={styles.ratingHeaderRow}>
              <Text style={styles.ratingSectionTitle}>Rating</Text>
            </View>
            
                         {/* Rating Display */}
             <View style={styles.ratingRangeDisplay}>
               <Text style={styles.ratingRangeText}>
                 {selectedRating} stars
               </Text>
             </View>

                         {/* Rating Options */}
             <View style={styles.ratingOptions}>
               {[1, 2, 3, 4, 5].map((rating) => (
                 <TouchableOpacity
                   key={rating}
                   style={[
                     styles.ratingOption,
                     selectedRating === rating && styles.ratingOptionSelected
                   ]}
                   onPress={() => handleRatingSelect(rating)}
                 >
                   {renderStars(rating)}
                   {selectedRating === rating && (
                     <Ionicons name="checkmark" size={20} color="#007AFF" />
                   )}
                 </TouchableOpacity>
               ))}
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
  ratingSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    maxHeight: '80%',
    zIndex: 1000,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  ratingContent: {
    flex: 1,
  },
  ratingSection: {
    marginBottom: 16,
  },
  ratingHeaderRow: {
    marginBottom: 16,
  },
  ratingSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  ratingRangeDisplay: {
    marginBottom: 16,
  },
  ratingRangeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingOptions: {
    gap: 12,
  },
  ratingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#20536d',
    backgroundColor: '#ffffff',
  },
  ratingOptionSelected: {
    backgroundColor: '#ffffff',
    borderColor: '#FD5D27',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 16,
    color: '#FCD34D',
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
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
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default RatingModal; 
