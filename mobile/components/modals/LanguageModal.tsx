import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyChanges: (selectedLanguages: string[]) => void;
  initialSelectedLanguages?: string[];
}

const LanguageModal: React.FC<LanguageModalProps> = ({
  visible,
  onClose,
  onApplyChanges,
  initialSelectedLanguages = []
}) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialSelectedLanguages);

  const languages = [
    { id: 'hindi', name: 'Hindi' },
    { id: 'english', name: 'English' },
    { id: 'marathi', name: 'Marathi' },
    { id: 'telugu', name: 'Telugu' },
    { id: 'kannada', name: 'Kannada' },
  ];

  useEffect(() => {
    setSelectedLanguages(initialSelectedLanguages);
  }, [initialSelectedLanguages]);

  const handleLanguageToggle = (languageId: string) => {
    setSelectedLanguages(prev => 
      prev.includes(languageId)
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId]
    );
  };

  const handleChooseAll = () => {
    if (selectedLanguages.length === languages.length) {
      setSelectedLanguages([]);
    } else {
      setSelectedLanguages(languages.map(l => l.id));
    }
  };

  const handleResetToDefaults = () => {
    setSelectedLanguages(['kannada']);
  };

  const handleApplyChanges = () => {
    onApplyChanges(selectedLanguages);
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
      <View style={styles.languageSheet}>
        {/* Header */}
        <View style={styles.languageHeader}>
          <Text style={styles.languageTitle}>Sort by Language</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.languageContent} showsVerticalScrollIndicator={false}>
          {/* Select Language Section */}
          <View style={styles.languageSectionHeader}>
            <Text style={styles.languageSectionTitle}>Select Language</Text>
            <TouchableOpacity onPress={handleChooseAll}>
              <Text style={styles.chooseAllText}>Choose All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Languages List */}
          {languages.map((language) => (
            <TouchableOpacity
              key={language.id}
              style={styles.languageRow}
              onPress={() => handleLanguageToggle(language.id)}
            >
              <Text style={styles.languageName}>{language.name}</Text>
              <View style={[
                styles.checkbox,
                selectedLanguages.includes(language.id) && styles.checkboxSelected
              ]}>
                {selectedLanguages.includes(language.id) && (
                  <Ionicons name="checkmark" size={16} color="#f8f4e8" />
                )}
              </View>
            </TouchableOpacity>
          ))}
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
  languageSheet: {
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
    zIndex: 1000,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  languageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  languageContent: {
    flex: 1,
  },
  languageSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  languageSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  chooseAllText: {
    fontSize: 14,
    color: '#FD5D27',
    fontWeight: '500',
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  languageName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#f8f4e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FD5D27',
    borderColor: '#FD5D27',
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

export default LanguageModal; 
