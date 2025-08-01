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
    zIndex: 1000,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    padding: 16,
    backgroundColor: COLORS.primary,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 10000,
    marginTop: 4,
  },
  dropdownList: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '400',
  },
  selectedOptionText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  noOptionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noOptionsText: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
  },
});

export default CustomDropdown; 
