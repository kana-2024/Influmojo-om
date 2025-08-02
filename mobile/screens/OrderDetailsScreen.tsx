import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../store/hooks';
import { ENV } from '../config/env';
import { getToken } from '../services/storage';
import { ordersAPI } from '../services/apiService';
import { orderChatService } from '../services/orderChatService';
import { ZohoChatWidget } from '../components';

interface OrderDetails {
  id: string;
  package: {
    id: string;
    title: string;
    description: string;
    price: number;
    deliverables: any[];
    type: string;
  };
  collaboration: {
    id: string;
    status: string;
    started_at: string;
    deadline?: string;
    agreed_rate: number;
    currency: string;
    contract_terms?: string;
    brand?: {
      company_name: string;
      location_city?: string;
      location_state?: string;
      industry?: string;
      website_url?: string;
    };
    creator?: {
      user: {
        name: string;
        email?: string;
      };
      location_city?: string;
      location_state?: string;
      bio?: string;
    };
  };
  created_at: string;
  status: string;
}

const OrderDetailsScreen = ({ route, navigation }: any) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [currentOrderChat, setCurrentOrderChat] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const userType = useAppSelector(state => state.auth.userType);
  const user = useAppSelector(state => state.auth.user);
  const userId = useAppSelector(state => state.auth.user?.id);
  const { orderId } = route.params;

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrderDetails(data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return `${currency === 'USD' ? '$' : currency}${price.toFixed(2)}`;
  };

  // Chat handling functions
  const handleChatPress = async () => {
    if (userType !== 'brand') {
      Alert.alert('Info', 'Chat is only available for brand users');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please log in again.');
      return;
    }

    setChatLoading(true);
    try {
      // Get user data for chat session
      const userData = {
        id: userId,
        name: user?.name || 'Brand User',
        email: user?.email || '',
        phone: user?.phone || '',
        user_type: userType
      };

      // Get or create order-specific chat session
      const session = await orderChatService.getOrCreateSession(
        orderId,
        userId,
        'brand'
      );

      console.log('✅ Order-specific chat session created/retrieved:', session.id);

      // Initialize Zoho chat with order context
      await orderChatService.initializeOrderChat(session, userData);

      // Update local state to show chat
      setCurrentOrderChat({
        orderId: orderId,
        visitorId: session.zoho_ticket_id,
        sessionId: session.id
      });
      setShowChat(true);

    } catch (error) {
      console.error('Error handling order-specific chat:', error);
      Alert.alert('Error', 'Failed to open order chat. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatClose = () => {
    setShowChat(false);
    setCurrentOrderChat(null);
  };

  const handleChatMessageSent = (message: any) => {
    console.log('Chat message sent:', message);
    // You can add additional logic here if needed
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!orderDetails) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text style={styles.errorTitle}>Order Not Found</Text>
        <Text style={styles.errorSubtitle}>
          The order you're looking for doesn't exist or you don't have permission to view it.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCreator = userType === 'creator';
  const otherParty = isCreator ? orderDetails.collaboration.brand : orderDetails.collaboration.creator;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        {userType === 'brand' && (
          <TouchableOpacity
            style={[
              styles.chatButton,
              chatLoading && styles.chatButtonDisabled
            ]}
            onPress={handleChatPress}
            disabled={chatLoading}
          >
            <Ionicons 
              name="chatbubble-ellipses-outline" 
              size={24} 
              color={chatLoading ? "#999" : "#20536d"} 
            />
          </TouchableOpacity>
        )}
        {userType !== 'brand' && <View style={styles.headerSpacer} />}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(orderDetails.collaboration.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {orderDetails.collaboration.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.orderDate}>
            Ordered on {formatDate(orderDetails.created_at)}
          </Text>
        </View>

        {/* Package Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Details</Text>
          <View style={styles.packageCard}>
            <Text style={styles.packageTitle}>{orderDetails.package.title}</Text>
            <Text style={styles.packageDescription}>
              {orderDetails.package.description}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Price:</Text>
              <Text style={styles.priceValue}>
                {formatPrice(orderDetails.package.price, orderDetails.collaboration.currency)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Agreed Rate:</Text>
              <Text style={styles.priceValue}>
                {formatPrice(orderDetails.collaboration.agreed_rate, orderDetails.collaboration.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Other Party Information */}
        {otherParty && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isCreator ? 'Brand Information' : 'Creator Information'}
            </Text>
            <View style={styles.partyCard}>
              <View style={styles.partyHeader}>
                <Ionicons
                  name={isCreator ? "business-outline" : "person-outline"}
                  size={24}
                  color="#007AFF"
                />
                <Text style={styles.partyName}>
                  {isCreator 
                    ? (otherParty as any).company_name 
                    : (otherParty as any).user?.name
                  }
                </Text>
              </View>
              
              {otherParty.location_city && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    {otherParty.location_city}
                    {otherParty.location_state && `, ${otherParty.location_state}`}
                  </Text>
                </View>
              )}

              {isCreator && (otherParty as any).industry && (
                <View style={styles.infoRow}>
                  <Ionicons name="briefcase-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{(otherParty as any).industry}</Text>
                </View>
              )}

              {isCreator && (otherParty as any).website_url && (
                <View style={styles.infoRow}>
                  <Ionicons name="globe-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{(otherParty as any).website_url}</Text>
                </View>
              )}

              {!isCreator && (otherParty as any).bio && (
                <View style={styles.infoRow}>
                  <Ionicons name="document-text-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{(otherParty as any).bio}</Text>
                </View>
              )}

              {!isCreator && (otherParty as any).user?.email && (
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{(otherParty as any).user.email}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timelineCard}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Order Started</Text>
                <Text style={styles.timelineDate}>
                  {formatDate(orderDetails.collaboration.started_at)}
                </Text>
              </View>
            </View>
            
            {orderDetails.collaboration.deadline && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Deadline</Text>
                  <Text style={styles.timelineDate}>
                    {formatDate(orderDetails.collaboration.deadline)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Contract Terms */}
        {orderDetails.collaboration.contract_terms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contract Terms</Text>
            <View style={styles.termsCard}>
              <Text style={styles.termsText}>
                {orderDetails.collaboration.contract_terms}
              </Text>
            </View>
          </View>
        )}

        {/* Deliverables */}
        {orderDetails.package.deliverables && orderDetails.package.deliverables.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deliverables</Text>
            <View style={styles.deliverablesCard}>
              {orderDetails.package.deliverables.map((deliverable: any, index: number) => (
                <View key={index} style={styles.deliverableItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                  <Text style={styles.deliverableText}>{deliverable}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Zoho Chat Widget */}
      <ZohoChatWidget
        visible={showChat}
        onClose={handleChatClose}
        onMessageSent={handleChatMessageSent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e8',
  },
  header: {
    backgroundColor: '#f8f4e8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f4e8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#f8f4e8',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    margin: 20,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  statusSection: {
    margin: 20,
    marginBottom: 0,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f8f4e8',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  packageCard: {
    backgroundColor: '#f8f4e8',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  partyCard: {
    backgroundColor: '#f8f4e8',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  partyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  partyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  timelineCard: {
    backgroundColor: '#f8f4e8',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: '#666',
  },
  termsCard: {
    backgroundColor: '#f8f4e8',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  deliverablesCard: {
    backgroundColor: '#f8f4e8',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliverableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliverableText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  chatButton: {
    padding: 8,
  },
  chatButtonDisabled: {
    opacity: 0.7,
  },
});

export default OrderDetailsScreen; 
