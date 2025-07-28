import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlatformModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyChanges: (selectedPlatforms: string[]) => void;
  initialSelectedPlatforms?: string[];
}

const PlatformModal: React.FC<PlatformModalProps> = ({
  visible,
  onClose,
  onApplyChanges,
  initialSelectedPlatforms = []
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initialSelectedPlatforms);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
    { id: 'twitter', name: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
    { id: 'snapchat', name: 'Snapchat', icon: 'logo-snapchat', color: '#FFFC00' },
    { id: 'youtube', name: 'Youtube', icon: 'logo-youtube', color: '#FF0000' },
  ];

  useEffect(() => {
    setSelectedPlatforms(initialSelectedPlatforms);
  }, [initialSelectedPlatforms]);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleChooseAll = () => {
    if (selectedPlatforms.length === platforms.length) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms(platforms.map(p => p.id));
    }
  };

  const handleResetToDefaults = () => {
    setSelectedPlatforms(['youtube']);
  };

  const handleApplyChanges = () => {
    onApplyChanges(selectedPlatforms);
    onClose();
  };

  const isAllSelected = selectedPlatforms.length === platforms.length;

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
      <View style={styles.platformSheet}>
        {/* Header */}
        <View style={styles.platformHeader}>
          <Text style={styles.platformTitle}>Sort by Platforms</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.platformContent} showsVerticalScrollIndicator={false}>
          {/* Select Social Platform Section */}
          <View style={styles.platformSectionHeader}>
            <Text style={styles.platformSectionTitle}>Select Social Platform</Text>
            <TouchableOpacity onPress={handleChooseAll}>
              <Text style={styles.chooseAllText}>Choose All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Platforms List */}
          {platforms.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={styles.platformRow}
              onPress={() => handlePlatformToggle(platform.id)}
            >
              <View style={styles.platformInfo}>
                <View style={[styles.platformIcon, { backgroundColor: platform.color }]}>
                  <Ionicons name={platform.icon as any} size={20} color="#f8f4e8" />
                </View>
                <Text style={styles.platformName}>{platform.name}</Text>
              </View>
              <View style={[
                styles.checkbox,
                selectedPlatforms.includes(platform.id) && styles.checkboxSelected
              ]}>
                {selectedPlatforms.includes(platform.id) && (
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
  platformSheet: {
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
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  platformTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  platformContent: {
    flex: 1,
  },
  platformSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  platformSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  chooseAllText: {
    fontSize: 14,
    color: '#FD5D27',
    fontWeight: '500',
  },
  platformRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  platformName: {
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

export default PlatformModal; 
