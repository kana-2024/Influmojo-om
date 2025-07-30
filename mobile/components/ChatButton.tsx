import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ZohoChatWidget from './ZohoChatWidget';
import COLORS from '../config/colors';

interface ChatButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showBadge?: boolean;
  badgeCount?: number;
  onPress?: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({
  position = 'bottom-right',
  showBadge = false,
  badgeCount = 0,
  onPress
}) => {
  const [showChat, setShowChat] = useState(false);
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setShowChat(true);
    }
  };

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 1000,
    };

    const margin = 20;
    const bottomMargin = Platform.OS === 'ios' ? insets.bottom + margin : margin;

    switch (position) {
      case 'bottom-right':
        return {
          ...baseStyle,
          bottom: bottomMargin,
          right: margin,
        };
      case 'bottom-left':
        return {
          ...baseStyle,
          bottom: bottomMargin,
          left: margin,
        };
      case 'top-right':
        return {
          ...baseStyle,
          top: insets.top + margin,
          right: margin,
        };
      case 'top-left':
        return {
          ...baseStyle,
          top: insets.top + margin,
          left: margin,
        };
      default:
        return {
          ...baseStyle,
          bottom: bottomMargin,
          right: margin,
        };
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.chatButton, getPositionStyle()]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#ffffff" />
        
        {showBadge && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : badgeCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <ZohoChatWidget
        visible={showChat}
        onClose={() => setShowChat(false)}
        onMessageSent={(message) => {
          console.log('Message sent:', message);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ChatButton; 