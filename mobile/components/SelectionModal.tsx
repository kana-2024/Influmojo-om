import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CheckboxItem from './CheckboxItem';

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  options: string[];
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
  maxSelections?: number;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  options,
  selectedOptions,
  onToggleOption,
  maxSelections
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color="#1A1D1F" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
          
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <CheckboxItem
                key={option}
                label={option}
                isSelected={selectedOptions.includes(option)}
                onToggle={() => onToggleOption(option)}
                disabled={maxSelections ? selectedOptions.length >= maxSelections && !selectedOptions.includes(option) : false}
              />
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheet: {
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1D1F',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsContainer: {
    backgroundColor: '#f8f4e8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  footer: {
    paddingTop: 16,
  },
  doneButton: {
    backgroundColor: '#f37135',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#f8f4e8',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelectionModal; 
