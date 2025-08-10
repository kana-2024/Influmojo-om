import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import COLORS from '../../config/colors';

interface FollowerRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyChanges: (minFollowers: number, maxFollowers: number) => void;
  initialMinFollowers?: number;
  initialMaxFollowers?: number;
}

const FollowerRangeModal: React.FC<FollowerRangeModalProps> = ({
  visible,
  onClose,
  onApplyChanges,
  initialMinFollowers = 5000,
  initialMaxFollowers = 800000
}) => {
  const [minFollowers, setMinFollowers] = useState(initialMinFollowers);
  const [maxFollowers, setMaxFollowers] = useState(initialMaxFollowers);
  const [minInput, setMinInput] = useState(initialMinFollowers.toString());
  const [maxInput, setMaxInput] = useState(initialMaxFollowers.toString());

  const minValue = 1000;
  const maxValue = 1000000;

  useEffect(() => {
    setMinFollowers(initialMinFollowers);
    setMaxFollowers(initialMaxFollowers);
    setMinInput(initialMinFollowers.toString());
    setMaxInput(initialMaxFollowers.toString());
  }, [initialMinFollowers, initialMaxFollowers]);

  const handleMinSliderChange = (value: number) => {
    const newValue = Math.min(value, maxFollowers - 1000);
    setMinFollowers(newValue);
    setMinInput(newValue.toString());
  };

  const handleMaxSliderChange = (value: number) => {
    const newValue = Math.max(value, minFollowers + 1000);
    setMaxFollowers(newValue);
    setMaxInput(newValue.toString());
  };

  const handleMinInputChange = (text: string) => {
    setMinInput(text);
    const value = parseInt(text) || 0;
    if (value >= minValue && value <= maxValue && value <= maxFollowers) {
      setMinFollowers(value);
    }
  };

  const handleMaxInputChange = (text: string) => {
    setMaxInput(text);
    const value = parseInt(text) || 0;
    if (value >= minValue && value <= maxValue && value >= minFollowers) {
      setMaxFollowers(value);
    }
  };

  const handleResetToDefaults = () => {
    setMinFollowers(5000);
    setMaxFollowers(800000);
    setMinInput('5000');
    setMaxInput('800000');
  };

  const handleApplyChanges = () => {
    onApplyChanges(minFollowers, maxFollowers);
    onClose();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.followerRangeSheet}>
        {/* Header */}
        <View style={styles.followerRangeHeader}>
          <Text style={styles.followerRangeTitle}>Sort By Follower Range</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.followerRangeContent}>
          {/* Followers Section */}
          <View style={styles.followersSection}>
            <View style={styles.followersHeader}>
              <Text style={styles.followersLabel}>Followers</Text>
              <Text style={styles.followersRange}>1k - 50lkhs</Text>
            </View>
            
            {/* Slider Values Display */}
            <View style={styles.sliderValues}>
              <Text style={styles.sliderValue}>{formatNumber(minFollowers)}</Text>
              <Text style={styles.sliderValue}>{formatNumber(maxFollowers)}</Text>
            </View>
            
            {/* Dual Slider */}
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={minValue}
                maximumValue={maxValue}
                value={minFollowers}
                onValueChange={handleMinSliderChange}
                minimumTrackTintColor="#FD5D27"
                maximumTrackTintColor="#E5E7EB"
                thumbStyle={styles.sliderThumb}
                trackStyle={styles.sliderTrack}
              />
              <Slider
                style={[styles.slider, styles.maxSlider]}
                minimumValue={minValue}
                maximumValue={maxValue}
                value={maxFollowers}
                onValueChange={handleMaxSliderChange}
                minimumTrackTintColor="#FD5D27"
                maximumTrackTintColor="#E5E7EB"
                thumbStyle={styles.sliderThumb}
                trackStyle={styles.sliderTrack}
              />
            </View>
            
            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                value={minInput}
                onChangeText={handleMinInputChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.placeholder}
              />
              <Text style={styles.inputSeparator}>-</Text>
              <TextInput
                style={styles.inputField}
                value={maxInput}
                onChangeText={handleMaxInputChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.placeholder}
              />
            </View>
          </View>
        </View>

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
  followerRangeSheet: {
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
  },
  followerRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  followerRangeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  followerRangeContent: {
    flex: 1,
  },
  followersSection: {
    marginBottom: 24,
  },
  followersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  followersLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  followersRange: {
    fontSize: 14,
    color: '#6B7280',
  },
  sliderValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderValue: {
    fontSize: 14,
    color: '#FD5D27',
    fontWeight: '600',
  },
  sliderContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  maxSlider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  sliderThumb: {
    backgroundColor: '#FD5D27',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#20536d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#FFFFFF', // Changed from '#F5F5F5' to '#FFFFFF'
  },
  inputSeparator: {
    fontSize: 16,
    color: '#6B7280',
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
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FollowerRangeModal; 
