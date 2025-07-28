import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ResponseTimeModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyChanges: (selectedResponseTime: string) => void;
  initialSelectedResponseTime?: string;
}

const ResponseTimeModal: React.FC<ResponseTimeModalProps> = ({
  visible,
  onClose,
  onApplyChanges,
  initialSelectedResponseTime = '1-2'
}) => {
  const [selectedResponseTime, setSelectedResponseTime] = useState<string>(initialSelectedResponseTime);

  const responseTimes = [
    { id: '1-2', label: 'Response in 1-2 Hrs' },
    { id: '3-6', label: 'Response in 3-6 Hrs' },
    { id: '6-12', label: 'Response in 6-12 Hrs' },
    { id: '12-24', label: 'Response in 12-24 Hrs' },
    { id: 'unavailable', label: 'Response unavailable' },
  ];

  useEffect(() => {
    setSelectedResponseTime(initialSelectedResponseTime);
  }, [initialSelectedResponseTime]);

  const handleResponseTimeSelect = (responseTimeId: string) => {
    setSelectedResponseTime(responseTimeId);
  };

  const handleResetToDefaults = () => {
    setSelectedResponseTime('1-2');
  };

  const handleApplyChanges = () => {
    onApplyChanges(selectedResponseTime);
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
      <View style={styles.responseTimeSheet}>
        {/* Header */}
        <View style={styles.responseTimeHeader}>
          <Text style={styles.responseTimeTitle}>Sort by Response Time</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.responseTimeContent} showsVerticalScrollIndicator={false}>
          {/* Response Time Section */}
          <View style={styles.responseTimeSection}>
            <Text style={styles.responseTimeSectionTitle}>Response Time</Text>
            <Text style={styles.responseTimeSubtitle}>Quick Responder</Text>
          </View>
          
          {/* Response Time Options */}
          {responseTimes.map((responseTime) => (
            <TouchableOpacity
              key={responseTime.id}
              style={[
                styles.responseTimeRow,
                selectedResponseTime === responseTime.id && styles.responseTimeRowSelected
              ]}
              onPress={() => handleResponseTimeSelect(responseTime.id)}
            >
              <Text style={[
                styles.responseTimeLabel,
                selectedResponseTime === responseTime.id && styles.responseTimeLabelSelected
              ]}>
                {responseTime.label}
              </Text>
              {selectedResponseTime === responseTime.id && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
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
  responseTimeSheet: {
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
  responseTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  responseTimeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  responseTimeContent: {
    flex: 1,
  },
  responseTimeSection: {
    marginBottom: 16,
  },
  responseTimeSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  responseTimeSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  responseTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  responseTimeRowSelected: {
    backgroundColor: '#F0F8FF',
  },
  responseTimeLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  responseTimeLabelSelected: {
    color: '#007AFF',
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

export default ResponseTimeModal; 
