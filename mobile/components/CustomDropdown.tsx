import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Platform, StatusBar, Dimensions, LayoutRectangle, findNodeHandle, UIManager, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomDropdownProps {
  value: string;
  setValue: (value: string) => void;
  options: string[];
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, setValue, options }) => {
  const [open, setOpen] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState<LayoutRectangle | null>(null);
  const buttonRef = useRef<View>(null);

  const openDropdown = () => {
    if (buttonRef.current) {
      const handle = findNodeHandle(buttonRef.current);
      if (handle) {
        UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
          setDropdownLayout({ x: pageX, y: pageY, width, height });
          setOpen(true);
        });
      } else {
        setOpen(true);
      }
    } else {
      setOpen(true);
    }
  };

  const closeDropdown = () => setOpen(false);

  return (
    <>
      <View ref={buttonRef} style={{ marginBottom: 24 }}>
        <TouchableOpacity style={styles.dropdown} onPress={openDropdown} activeOpacity={0.8}>
          <Text style={{ color: value ? '#1A1D1F' : '#B0B0B0', fontSize: 15 }}>{value || 'Select'}</Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#B0B0B0" />
        </TouchableOpacity>
      </View>
      {open && dropdownLayout && (
        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={closeDropdown}
        >
          <Pressable style={styles.modalOverlay} onPress={closeDropdown}>
            <View
              style={[
                styles.dropdownListModal,
                {
                  position: 'absolute',
                  top:
                    (dropdownLayout.y + dropdownLayout.height) -
                    (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0),
                  left: dropdownLayout.x,
                  width: dropdownLayout.width,
                  maxHeight: Dimensions.get('window').height - (dropdownLayout.y + dropdownLayout.height) - 24,
                },
              ]}
            >
              {options.map((opt: string) => (
                <TouchableOpacity key={opt} style={styles.dropdownItem} onPress={() => { setValue(opt); closeDropdown(); }}>
                  <Text style={{ color: '#1A1D1F', fontSize: 15 }}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 0,
    position: 'relative',
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  dropdownListModal: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    zIndex: 10000,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
});

export default CustomDropdown; 