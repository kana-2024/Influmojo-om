import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelected: (date: Date) => void;
  currentDate?: Date;
  title?: string;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onDateSelected,
  currentDate = new Date(),
  title = 'Select Date'
}) => {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [tempDate, setTempDate] = useState(currentDate);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && date) {
        setSelectedDate(date);
        onDateSelected(date);
        onClose();
      } else {
        onClose();
      }
    } else {
      // iOS - update temp date for preview
      if (date) {
        setTempDate(date);
      }
    }
  };

  const handleConfirm = () => {
    setSelectedDate(tempDate);
    onDateSelected(tempDate);
    onClose();
  };

  const handleCancel = () => {
    setTempDate(selectedDate);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Date Preview (iOS only) */}
          {Platform.OS === 'ios' && (
            <View style={styles.datePreview}>
              <Text style={styles.datePreviewText}>
                {formatDate(tempDate)}
              </Text>
            </View>
          )}

          {/* Date Picker */}
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()} // Can't select future dates
            minimumDate={new Date(1900, 0, 1)} // Reasonable minimum date
            style={Platform.OS === 'ios' ? styles.iosDatePicker : styles.androidDatePicker}
          />
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? '10%' : 0,
    left: Platform.OS === 'ios' ? '5%' : 0,
    right: Platform.OS === 'ios' ? '5%' : 0,
    backgroundColor: '#f8f4e8',
    borderRadius: Platform.OS === 'ios' ? 16 : 0,
    width: Platform.OS === 'ios' ? '90%' : '100%',
    maxWidth: Platform.OS === 'ios' ? 400 : undefined,
    maxHeight: Platform.OS === 'ios' ? '80%' : undefined,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D1F',
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    padding: 4,
  },
  confirmButtonText: {
    color: '#f37135',
    fontSize: 16,
    fontWeight: '600',
  },
  datePreview: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  datePreviewText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1D1F',
  },
  iosDatePicker: {
    height: 200,
  },
  androidDatePicker: {
    height: 50,
  },
});

export default DatePickerModal; 
