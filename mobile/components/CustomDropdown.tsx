import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Platform, StatusBar, Dimensions, LayoutRectangle, findNodeHandle, UIManager, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomDropdownProps {
  value: string;
  setValue: (value: string) => void;
  options: string[];
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, setValue, options }) => {
  const [open, setOpen] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState<LayoutRectangle | null>(null);
  const buttonRef = useRef<View>(null);
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

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

  const calculateDropdownPosition = () => {
    if (!dropdownLayout) return 0;
    
    const dropdownHeight = Math.min(200, options.length * 44); // 44px per item
    const spaceBelow = screenHeight - (dropdownLayout.y + dropdownLayout.height) - insets.bottom - 20; // 20px buffer
    const spaceAbove = dropdownLayout.y - insets.top - 20; // 20px buffer
    
    // If there's enough space below, show dropdown below
    if (spaceBelow >= dropdownHeight) {
      return dropdownLayout.y + dropdownLayout.height;
    }
    // If there's more space above, show dropdown above
    else if (spaceAbove > spaceBelow) {
      return dropdownLayout.y - dropdownHeight;
    }
    // Otherwise, show below but with reduced height
    else {
      return dropdownLayout.y + dropdownLayout.height;
    }
  };

  const calculateMaxHeight = () => {
    if (!dropdownLayout) return 200;
    
    const spaceBelow = screenHeight - (dropdownLayout.y + dropdownLayout.height) - insets.bottom;
    const spaceAbove = dropdownLayout.y - insets.top;
    
    // If there's enough space below, use full height
    if (spaceBelow >= 200) {
      return 200;
    }
    // If there's more space above, show above with full height
    else if (spaceAbove > spaceBelow) {
      return Math.min(200, spaceAbove - 20); // 20px buffer
    }
    // Otherwise, use available space below
    else {
      return Math.max(100, spaceBelow - 20); // Minimum 100px, 20px buffer
    }
  };

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
                  top: calculateDropdownPosition(),
                  left: dropdownLayout.x,
                  width: dropdownLayout.width,
                  maxHeight: calculateMaxHeight(),
                },
              ]}
            >
              <ScrollView 
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                style={[styles.scrollView, { maxHeight: calculateMaxHeight() }]}
              >
                {options.map((opt: string) => (
                  <TouchableOpacity key={opt} style={styles.dropdownItem} onPress={() => { setValue(opt); closeDropdown(); }}>
                    <Text style={{ color: '#1A1D1F', fontSize: 15 }}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
  scrollView: {
    // maxHeight will be calculated dynamically
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
});

export default CustomDropdown; 