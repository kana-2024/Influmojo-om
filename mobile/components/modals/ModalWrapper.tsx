import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ModalWrapperProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
  showBackdrop?: boolean;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  visible,
  onClose,
  children,
  animationType = 'slide',
  transparent = true,
  showBackdrop = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default ModalWrapper; 
