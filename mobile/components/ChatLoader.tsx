import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../config/colors';

interface ChatLoaderProps {
  type: 'sending' | 'loading' | 'error';
  message?: string;
}

const ChatLoader: React.FC<ChatLoaderProps> = ({ type, message }) => {
  const getLoaderContent = () => {
    switch (type) {
      case 'sending':
        return {
          icon: <ActivityIndicator size="small" color={COLORS.secondary} />,
          text: message || 'Sending...',
          style: styles.sendingContainer
        };
      case 'loading':
        return {
          icon: <ActivityIndicator size="small" color={COLORS.primary} />,
          text: message || 'Loading...',
          style: styles.loadingContainer
        };
      case 'error':
        return {
          icon: <Ionicons name="alert-circle" size={16} color={COLORS.error} />,
          text: message || 'Error occurred',
          style: styles.errorContainer
        };
      default:
        return {
          icon: <ActivityIndicator size="small" color={COLORS.primary} />,
          text: 'Loading...',
          style: styles.loadingContainer
        };
    }
  };

  const content = getLoaderContent();

  return (
    <View style={[styles.container, content.style]}>
      {content.icon}
      <Text style={styles.text}>{content.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginVertical: 4,
  },
  sendingContainer: {
    backgroundColor: COLORS.backgroundLight,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    backgroundColor: COLORS.backgroundLight,
    alignSelf: 'center',
  },
  errorContainer: {
    backgroundColor: COLORS.error + '20',
    alignSelf: 'center',
  },
  text: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.textGray,
    fontWeight: '500',
  },
});

export default ChatLoader;
