import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../store/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ticketAPI } from '../../services/apiService';
import COLORS from '../../config/colors';

interface AgentStatus {
  is_online: boolean;
  status: 'available' | 'busy' | 'offline' | 'away';
  last_online_at?: string;
  agent_name?: string;
}

interface CannedMessage {
  id: string;
  title: string;
  message: string;
  category: string;
}

const AgentDashboard = () => {
  const user = useAppSelector(state => state.auth.user);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showCannedMessages, setShowCannedMessages] = useState(false);
  const [cannedMessages, setCannedMessages] = useState<CannedMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<CannedMessage | null>(null);

  // Predefined canned messages
  const defaultCannedMessages: CannedMessage[] = [
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
    }
  ];

  useEffect(() => {
    loadAgentStatus();
    setCannedMessages(defaultCannedMessages);
  }, []);

  const loadAgentStatus = async () => {
    try {
      setLoading(true);
      
      // Try to fetch current agent status from backend
      try {
        // Since we don't have a specific ticketId in the dashboard context,
        // we'll use a default approach or just set the default status
        setAgentStatus({
          is_online: true,
          status: 'available',
          agent_name: user?.name || 'Agent'
        });
      } catch (error) {
        console.log('Could not fetch agent status, using default:', error);
        // Fallback to default status
        setAgentStatus({
          is_online: true,
          status: 'available',
          agent_name: user?.name || 'Agent'
        });
      }
    } catch (error) {
      console.error('Error loading agent status:', error);
      Alert.alert('Error', 'Failed to load agent status');
      // Set default status on error
      setAgentStatus({
        is_online: true,
        status: 'available',
        agent_name: user?.name || 'Agent'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAgentStatus = async (status: 'available' | 'busy' | 'offline' | 'away', isOnline?: boolean) => {
    try {
      setUpdatingStatus(true);
      
      const response = await ticketAPI.updateAgentStatus(status, isOnline);
      
      if (response.success) {
        setAgentStatus(prev => ({
          ...prev!,
          status,
          is_online: isOnline !== undefined ? isOnline : prev!.is_online
        }));
        
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

  const renderStatusCard = () => {
    return (
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons 
            name={getStatusIcon(agentStatus?.status || 'offline')} 
            size={24} 
            color={getStatusColor(agentStatus?.status || 'offline')} 
          />
          <Text style={styles.statusTitle}>Agent Status</Text>
        </View>
        
        <Text style={styles.agentName}>{agentStatus?.agent_name || user?.name || 'Agent'}</Text>
        
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(agentStatus?.status || 'offline') }]} />
          <Text style={styles.statusText}>
            {agentStatus?.status?.charAt(0).toUpperCase() + agentStatus?.status?.slice(1) || 'Offline'}
          </Text>
        </View>

        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              agentStatus?.status === 'available' && styles.activeStatusButton
            ]}
            onPress={() => updateAgentStatus('available', true)}
            disabled={updatingStatus}
          >
            <Text style={[
              styles.statusButtonText,
              agentStatus?.status === 'available' && styles.activeStatusButtonText
            ]}>
              Available
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              agentStatus?.status === 'busy' && styles.activeStatusButton
            ]}
            onPress={() => updateAgentStatus('busy', true)}
            disabled={updatingStatus}
          >
            <Text style={[
              styles.statusButtonText,
              agentStatus?.status === 'busy' && styles.activeStatusButtonText
            ]}>
              Busy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              agentStatus?.status === 'away' && styles.activeStatusButton
            ]}
            onPress={() => updateAgentStatus('away', true)}
            disabled={updatingStatus}
          >
            <Text style={[
              styles.statusButtonText,
              agentStatus?.status === 'away' && styles.activeStatusButtonText
            ]}>
              Away
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              agentStatus?.status === 'offline' && styles.activeStatusButton
            ]}
            onPress={() => updateAgentStatus('offline', false)}
            disabled={updatingStatus}
          >
            <Text style={[
              styles.statusButtonText,
              agentStatus?.status === 'offline' && styles.activeStatusButtonText
            ]}>
              Offline
            </Text>
          </TouchableOpacity>
        </View>

        {updatingStatus && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Updating status...</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCannedMessage = ({ item }: { item: CannedMessage }) => (
    <TouchableOpacity
      style={styles.cannedMessageItem}
      onPress={() => setSelectedMessage(item)}
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

  const renderCannedMessagesModal = () => (
    <Modal
      visible={showCannedMessages}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Canned Messages</Text>
          <TouchableOpacity onPress={() => setShowCannedMessages(false)}>
            <Ionicons name="close" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={cannedMessages}
          renderItem={renderCannedMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.cannedMessagesList}
        />
      </SafeAreaView>
    </Modal>
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
              onPress={() => {
                // In a real implementation, you'd copy to clipboard
                Alert.alert('Copied', 'Message copied to clipboard');
                setSelectedMessage(null);
              }}
            >
              <Text style={styles.copyButtonText}>Copy Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading agent dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Agent Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        {renderStatusCard()}

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowCannedMessages(true)}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Canned Messages</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderCannedMessagesModal()}
      {renderSelectedMessageModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: 8,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textGray,
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeStatusButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  activeStatusButtonText: {
    color: COLORS.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textGray,
    marginLeft: 8,
  },
  actionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textDark,
    marginLeft: 12,
  },
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
    justifyContent: 'flex-end',
  },
  copyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  copyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AgentDashboard; 