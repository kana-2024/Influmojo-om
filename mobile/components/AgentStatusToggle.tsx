import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ticketAPI } from '../services/apiService';
import COLORS from '../config/colors';

interface AgentStatusToggleProps {
  currentStatus?: 'available' | 'busy' | 'offline' | 'away';
  onStatusChange?: (status: 'available' | 'busy' | 'offline' | 'away') => void;
}

const AgentStatusToggle: React.FC<AgentStatusToggleProps> = ({
  currentStatus = 'available',
  onStatusChange
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const updateStatus = async (status: 'available' | 'busy' | 'offline' | 'away') => {
    try {
      setUpdatingStatus(true);
      
      const response = await ticketAPI.updateAgentStatus(status, status !== 'offline');
      
      if (response.success) {
        onStatusChange?.(status);
        setShowStatusModal(false);
        Alert.alert('Success', `Status updated to ${status}`);
      } else {
        Alert.alert('Error', response.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
      Alert.alert('Error', 'Failed to update agent status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return COLORS.success;
      case 'busy':
        return COLORS.warning;
      case 'away':
        return COLORS.warning;
      case 'offline':
        return COLORS.gray;
      default:
        return COLORS.gray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return 'checkmark-circle';
      case 'busy':
        return 'time';
      case 'away':
        return 'pause-circle';
      case 'offline':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'away':
        return 'Away';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const renderStatusModal = () => (
    <Modal
      visible={showStatusModal}
      animationType="fade"
      transparent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Status</Text>
            <TouchableOpacity onPress={() => setShowStatusModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusOptions}>
            {(['available', 'busy', 'away', 'offline'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  currentStatus === status && styles.activeStatusOption
                ]}
                onPress={() => updateStatus(status)}
                disabled={updatingStatus}
              >
                <Ionicons 
                  name={getStatusIcon(status)} 
                  size={20} 
                  color={currentStatus === status ? COLORS.white : getStatusColor(status)} 
                />
                <Text style={[
                  styles.statusOptionText,
                  currentStatus === status && styles.activeStatusOptionText
                ]}>
                  {getStatusText(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowStatusModal(true)}
      >
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(currentStatus) }]} />
        <Text style={styles.statusText}>{getStatusText(currentStatus)}</Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.textGray} />
      </TouchableOpacity>
      
      {renderStatusModal()}
    </>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  statusOptions: {
    gap: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
  },
  activeStatusOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textDark,
    marginLeft: 12,
  },
  activeStatusOptionText: {
    color: COLORS.white,
  },
});

export default AgentStatusToggle; 