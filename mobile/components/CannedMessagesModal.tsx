import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../config/colors';

interface CannedMessage {
  id: string;
  title: string;
  message: string;
  category: string;
}

interface CannedMessagesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMessage: (message: string) => void;
}

const CannedMessagesModal: React.FC<CannedMessagesModalProps> = ({
  visible,
  onClose,
  onSelectMessage
}) => {
  const [selectedMessage, setSelectedMessage] = useState<CannedMessage | null>(null);

  // Predefined canned messages for agents
  const cannedMessages: CannedMessage[] = [
    {
      id: '1',
      title: 'Welcome Message',
      message: 'Hello! Thank you for reaching out. I\'m here to help you with your inquiry. How can I assist you today?',
      category: 'greeting'
    },
    {
      id: '2',
      title: 'Order Status Update',
      message: 'I understand you\'re asking about your order status. Let me check that for you right away.',
      category: 'order'
    },
    {
      id: '3',
      title: 'Payment Confirmation',
      message: 'Your payment has been received and confirmed. Your order is now being processed.',
      category: 'payment'
    },
    {
      id: '4',
      title: 'Issue Resolution',
      message: 'I apologize for the inconvenience. I\'m working to resolve this issue for you as quickly as possible.',
      category: 'support'
    },
    {
      id: '5',
      title: 'Follow-up',
      message: 'I wanted to follow up on our previous conversation. Is there anything else you need assistance with?',
      category: 'follow-up'
    },
    {
      id: '6',
      title: 'Closing Message',
      message: 'Thank you for contacting us. If you have any further questions, please don\'t hesitate to reach out.',
      category: 'closing'
    },
    {
      id: '7',
      title: 'Processing Update',
      message: 'Your request is currently being processed. I\'ll keep you updated on the progress.',
      category: 'status'
    },
    {
      id: '8',
      title: 'Escalation Notice',
      message: 'I\'m escalating this issue to our specialized team for further assistance. You\'ll hear from us soon.',
      category: 'escalation'
    }
  ];

  const handleSelectMessage = (message: CannedMessage) => {
    setSelectedMessage(message);
  };

  const handleUseMessage = () => {
    if (selectedMessage) {
      onSelectMessage(selectedMessage.message);
      setSelectedMessage(null);
      onClose();
    }
  };

  const handleCopyMessage = () => {
    if (selectedMessage) {
      // In a real implementation, you'd copy to clipboard
      Alert.alert('Copied', 'Message copied to clipboard');
    }
  };

  const renderCannedMessage = ({ item }: { item: CannedMessage }) => (
    <TouchableOpacity
      style={styles.cannedMessageItem}
      onPress={() => handleSelectMessage(item)}
    >
      <View style={styles.messageHeader}>
        <Text style={styles.messageTitle}>{item.title}</Text>
        <Text style={styles.messageCategory}>{item.category}</Text>
      </View>
      <Text style={styles.messagePreview} numberOfLines={2}>
        {item.message}
      </Text>
    </TouchableOpacity>
  );

  const renderSelectedMessageModal = () => (
    <Modal
      visible={!!selectedMessage}
      animationType="fade"
      transparent
    >
      <View style={styles.messageModalOverlay}>
        <View style={styles.messageModalContent}>
          <View style={styles.messageModalHeader}>
            <Text style={styles.messageModalTitle}>{selectedMessage?.title}</Text>
            <TouchableOpacity onPress={() => setSelectedMessage(null)}>
              <Ionicons name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.messageModalText}>{selectedMessage?.message}</Text>
          
          <View style={styles.messageModalActions}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyMessage}
            >
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.useButton}
              onPress={handleUseMessage}
            >
              <Text style={styles.useButtonText}>Use Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Canned Messages</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={cannedMessages}
            renderItem={renderCannedMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.cannedMessagesList}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
      
      {renderSelectedMessageModal()}
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  cannedMessagesList: {
    padding: 20,
  },
  cannedMessageItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  messageCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  messagePreview: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 20,
  },
  messageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  messageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  messageModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  messageModalText: {
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 24,
    marginBottom: 20,
  },
  messageModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  copyButton: {
    flex: 1,
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyButtonText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
  useButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  useButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CannedMessagesModal; 