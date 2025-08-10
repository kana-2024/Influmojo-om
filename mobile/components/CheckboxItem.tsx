import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxItemProps {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({ 
  label, 
  isSelected, 
  onToggle, 
  disabled = false 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.disabled
      ]}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[
        styles.checkbox,
        isSelected && styles.checkboxSelected,
        disabled && styles.checkboxDisabled
      ]}>
        {isSelected && (
          <Ionicons 
            name="checkmark" 
            size={16} 
            color={disabled ? "#9CA3AF" : "#ffffff"} 
          />
        )}
      </View>
      <Text style={[
        styles.label,
        isSelected && styles.labelSelected,
        disabled && styles.labelDisabled
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
  },
  disabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#f37135',
    borderColor: '#f37135',
  },
  checkboxDisabled: {
    backgroundColor: '#ffffff',
    borderColor: '#D1D5DB',
  },
  label: {
    fontSize: 14,
    color: '#1A1D1F',
    flex: 1,
  },
  labelSelected: {
    fontWeight: '500',
    color: '#f37135',
  },
  labelDisabled: {
    color: '#9CA3AF',
  },
});

export default CheckboxItem; 
