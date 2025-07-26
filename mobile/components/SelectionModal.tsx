import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 40 }} />
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
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D1F',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 20,
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 16,
    overflow: 'hidden',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  doneButton: {
    backgroundColor: '#FF6B2C',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelectionModal; 