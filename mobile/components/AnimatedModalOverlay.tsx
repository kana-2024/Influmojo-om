import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Pressable, Modal, Platform } from 'react-native';

interface AnimatedModalOverlayProps {
  visible: boolean;
  onRequestClose?: () => void;
  children: React.ReactNode;
  overlayOpacity?: number;
}

const AnimatedModalOverlay: React.FC<AnimatedModalOverlayProps> = ({
  visible,
  onRequestClose,
  children,
  overlayOpacity = 0.3,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: overlayOpacity,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, overlayOpacity, opacity]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onRequestClose}>
          <Animated.View style={[styles.overlay, { opacity }]} />
        </Pressable>
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
});

export default AnimatedModalOverlay; 