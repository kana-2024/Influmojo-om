import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/colors';

interface CustomDropdownProps {
  value: string;
  setValue: (value: string) => void;
  options: string[];
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, setValue, options, placeholder = 'Select' }) => {
  const [open, setOpen] = useState(false);

  const openDropdown = () => {
    console.log('Opening dropdown with options:', options, 'length:', options?.length);
    setOpen(true);
  };

  const closeDropdown = () => {
    setOpen(false);
  };

  const handleOptionSelect = (option: string) => {
    console.log('Selected option:', option);
    setValue(option);
    closeDropdown();
  };

  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];
  console.log('Safe options:', safeOptions, 'length:', safeOptions.length);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.dropdown} onPress={openDropdown} activeOpacity={0.8}>
        <Text style={{ color: value ? COLORS.textDark : '#B0B0B0', fontSize: 15 }}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={18} color="#B0B0B0" />
      </TouchableOpacity>
      
      {open && (
        <View style={styles.dropdownContainer}>
          <View style={styles.dropdownList}>
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              {safeOptions.length > 0 ? (
                safeOptions.map((option, index) => (
                  <TouchableOpacity
                    key={`${option}-${index}`}
                    style={styles.optionItem}
                    onPress={() => handleOptionSelect(option)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionText,
                      value === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                    {value === option && (
                      <Ionicons name="checkmark" size={20} color={COLORS.secondary} />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noOptionsContainer}>
                  <Text style={styles.noOptionsText}>No options available</Text>
                  <Text style={styles.noOptionsText}>Options passed: {JSON.stringify(options)}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    position: 'relative',
    zIndex: 9999,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    marginBottom: 0,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 99999,
    marginTop: 4,
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    maxHeight: 200,
  },
  scrollView: {
    maxHeight: 200,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  optionText: {
    fontSize: 15,
    color: '#1A1D1F',
    fontWeight: '400',
  },
  selectedOptionText: {
    color: '#f37135',
    fontWeight: '600',
  },
  noOptionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  noOptionsText: {
    fontSize: 15,
    color: '#B0B0B0',
    textAlign: 'center',
  },
});

export default CustomDropdown; 
