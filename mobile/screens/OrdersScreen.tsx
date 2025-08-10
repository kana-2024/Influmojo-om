import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../store/hooks';
import { ordersAPI } from '../services/apiService';
import { ticketAPI } from '../services/apiService';
import COLORS from '../config/colors';
import { BottomNavBar } from '../components';

interface Order {
  id: string;
  package: {
    id: string;
    title: string;
    description: string;
    price: number;
    deliverables: any[];
  };
  brand?: {
    company_name: string;
    location_city?: string;
    location_state?: string;
  };
  creator?: {
    user: {
      name: string;
      email: string;
    };
  };
  created_at: string;
  status: string;
  total_amount: number;
  quantity: number;
  rejection_message?: string;
  // Chat integration fields
  chat_enabled?: boolean;
  chat_session_id?: string;
}

const tabList = [
  { key: 'New', label: 'New' },
  { key: 'Ongoing', label: 'Ongoing' },
  { key: 'Completed', label: 'Completed' },
  { key: 'Cancelled', label: 'Cancelled' },
];

// Utility function to extract package type from package title
const getPackageType = (packageTitle: string) => {
  if (!packageTitle) return 'Package';
  
  // Try to extract the platform and content type from the title
  const title = packageTitle.toLowerCase();
  
  // Check for common platforms
  if (title.includes('instagram')) {
    if (title.includes('reel')) return 'Instagram Reel';
    if (title.includes('story')) return 'Instagram Story';
    if (title.includes('post')) return 'Instagram Post';
    return 'Instagram Content';
  }
  if (title.includes('facebook')) {
    if (title.includes('feed')) return 'Facebook Feed';
    if (title.includes('story')) return 'Facebook Story';
    if (title.includes('post')) return 'Facebook Post';
    return 'Facebook Content';
  }
  if (title.includes('youtube')) {
    if (title.includes('video')) return 'YouTube Video';
    if (title.includes('short')) return 'YouTube Short';
    return 'YouTube Content';
  }
  if (title.includes('tiktok')) return 'TikTok Video';
  if (title.includes('linkedin')) return 'LinkedIn Post';
  if (title.includes('twitter')) return 'Twitter Post';
  
  // If no specific platform found, return the first part of the title
  const words = packageTitle.split(' ');
  return words.length > 0 ? words[0] : 'Package';
};

const OrdersScreen = ({ navigation }: any) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('New');
  const [showChat, setShowChat] = useState(false);
  const [currentOrderChat, setCurrentOrderChat] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const userType = useAppSelector(state => state.auth.userType);
  const userId = useAppSelector(state => state.auth.user?.id);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getOrders();
      
      if (response.success) {
        setOrders(response.orders || []);
      } else {
        throw new Error(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleTabPress = (tabKey: string) => {
    setActiveTab(tabKey);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'ongoing':
      case 'in_progress':
      case 'accepted':
        return '#4CAF50'; // Green for active/accepted
      case 'completed':
        return '#2196F3'; // Blue for completed
      case 'cancelled':
      case 'rejected':
        return '#F44336'; // Red for cancelled/rejected
      case 'pending':
        return '#f37135'; // Brand orange for pending
      case 'review':
        return '#20536d'; // Brand tertiary color for review
      default:
        return '#757575'; // Gray for default
    }
  };

  const getStatusDisplayText = (status: string, rejectionMessage?: string) => {
    const isBrand = userType === 'brand';
    const isCreator = userType === 'creator';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return isBrand ? 'Waiting for Creator Approval' : 'Waiting for Your Approval';
      case 'accepted':
        return isBrand ? 'Accepted by Creator' : 'Accepted by You';
      case 'rejected':
        if (rejectionMessage) {
          return `Rejected: ${rejectionMessage}`;
        }
        return isBrand 
          ? 'Rejected by Creator - Sorry couldn\'t process the order due to unavailability of the creator'
          : 'Rejected by You';
      case 'in_progress':
        return 'In Progress';
      case 'review':
        return 'Under Review';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(0)}/-`;
  };

  const filterOrdersByTab = (orders: Order[], tab: string) => {
    switch (tab) {
      case 'New':
        return orders.filter(order => 
          order.status.toLowerCase() === 'pending'
        );
      case 'Ongoing':
        return orders.filter(order => 
          order.status.toLowerCase() === 'accepted' || 
          order.status.toLowerCase() === 'in_progress' ||
          order.status.toLowerCase() === 'review'
        );
      case 'Completed':
        return orders.filter(order => 
          order.status.toLowerCase() === 'completed'
        );
      case 'Cancelled':
        return orders.filter(order => 
          order.status.toLowerCase() === 'cancelled' ||
          order.status.toLowerCase() === 'rejected'
        );
      default:
        return orders;
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    Alert.alert(
      'Accept Order',
      'Are you sure you want to accept this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: async () => {
            try {
              const response = await ordersAPI.acceptOrder(orderId);
              if (response.success) {
                Alert.alert('Success', 'Order accepted successfully! It has been moved to Ongoing orders.');
                fetchOrders(); // Refresh orders
                // Switch to Ongoing tab after accepting
                setActiveTab('Ongoing');
              } else {
                Alert.alert('Error', response.message || 'Failed to accept order');
              }
            } catch (error) {
              console.error('Error accepting order:', error);
              Alert.alert('Error', 'Failed to accept order');
            }
          }
        }
      ]
    );
  };

  const handleRejectOrder = async (orderId: string) => {
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ordersAPI.rejectOrder(orderId);
              if (response.success) {
                Alert.alert('Success', 'Order rejected successfully!');
                fetchOrders(); // Refresh orders
                
                // If user is brand, show rejection message with options
                if (userType === 'brand') {
                  Alert.alert(
                    'Order Rejected',
                    'Sorry couldn\'t process the order due to unavailability of the creator. Don\'t worry, browse through our creators!',
                    [
                      {
                        text: 'Browse Creators',
                        onPress: () => {
                          // Navigate to home page to browse creators
                          navigation.navigate('BrandHome');
                        }
                      },
                      {
                        text: 'Go to Home',
                        onPress: () => {
                          // Navigate to home page
                          navigation.navigate('BrandHome');
                        }
                      }
                    ]
                  );
                }
              } else {
                Alert.alert('Error', response.message || 'Failed to reject order');
              }
            } catch (error) {
              console.error('Error rejecting order:', error);
              Alert.alert('Error', 'Failed to reject order');
            }
          }
        }
      ]
    );
  };

  // Chat handling functions
  const handleChatPress = async (order: Order) => {
    if (userType !== 'brand' && userType !== 'creator') {
      Alert.alert('Info', 'Chat is only available for brand and creator users');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please log in again.');
      return;
    }

    setChatLoading(true);
    try {
      // Get ticket by order ID (tickets are only created when orders are created)
      const ticketResponse = await ticketAPI.getTicketByOrderId(order.id);
      
      if (ticketResponse.success && ticketResponse.data.ticket) {
        const ticket = ticketResponse.data.ticket;
        
        // Navigate to appropriate chat screen based on user type
        if (userType === 'brand') {
          navigation.navigate('BrandChat', {
            ticketId: ticket.id,
            orderId: order.id,
            orderTitle: order.package.title
          });
        } else if (userType === 'creator') {
          navigation.navigate('CreatorChat', {
            ticketId: ticket.id,
            orderId: order.id,
            orderTitle: order.package.title
          });
        }
      } else {
        Alert.alert('Error', 'No support ticket found for this order. Support tickets are created automatically when orders are placed.');
      }
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

  // Handle order card click to show details
  const handleOrderCardPress = (order: Order) => {
    // Navigate to the separate OrderDetailsScreen
    navigation.navigate('OrderDetails', { orderId: order.id });
  };

  const renderOrderCard = (order: Order) => {
    const isCreator = userType === 'creator';
    const otherParty = isCreator ? order.brand : order.creator;
    const otherPartyName = isCreator 
      ? (otherParty as any)?.company_name 
      : (otherParty as any)?.user?.name;

    // Extract package type from the package title or use a default
    const packageType = getPackageType(order.package.title);

    return (
      <TouchableOpacity 
        key={order.id} 
        style={styles.orderCard}
        onPress={() => handleOrderCardPress(order)}
        activeOpacity={0.8}
      >
        {/* Header Row */}
        <View style={styles.orderCardHeader}>
          <View style={styles.orderCardLeft}>
            <View style={styles.orderTypeIcon}>
              <Ionicons name="film-outline" size={16} color="#E4405F" />
            </View>
            <View style={styles.orderCardInfo}>
              <Text style={styles.orderCardTitle} numberOfLines={1}>
                {order.package.title}
              </Text>
              <Text style={styles.orderCardType}>{packageType}</Text>
            </View>
          </View>
          <View style={styles.orderCardQuantity}>
            <Text style={styles.orderCardQuantityLabel}>Qty</Text>
            <Text style={styles.orderCardQuantityValue}>{order.quantity}</Text>
          </View>
        </View>

        {/* Details Row */}
        <View style={styles.orderCardDetails}>
          <View style={styles.orderCardDetail}>
            <Text style={styles.orderCardDetailLabel}>Amount</Text>
            <Text style={styles.orderCardDetailValue}>{formatPrice(order.total_amount)}</Text>
          </View>

          <View style={styles.orderCardDetail}>
            <Text style={styles.orderCardDetailLabel}>Order ID</Text>
            <Text style={styles.orderCardDetailValue}>#{order.id.slice(-6)}</Text>
          </View>
        </View>

        {/* Footer Row */}
        <View style={styles.orderCardFooter}>
          <View style={styles.orderCardFooterLeft}>
            {otherParty && (
              <Text style={styles.orderCardParty}>
                {isCreator ? 'Brand: ' : 'Creator: '}{otherPartyName || 'N/A'}
              </Text>
            )}
            <Text style={styles.orderCardDate}>• {formatDate(order.created_at)}</Text>
          </View>
        </View>

        {/* Status Row */}
        <View style={styles.orderCardStatusRow}>
          <View style={styles.orderCardStatusContainer}>
            <View style={[styles.orderCardStatusDot, { backgroundColor: getStatusColor(order.status) }]} />
            <Text style={[styles.orderCardStatusText, { color: getStatusColor(order.status) }]}>
              {getStatusDisplayText(order.status, order.rejection_message)}
            </Text>
          </View>
          <View style={styles.orderCardViewDetails}>
            <Text style={styles.orderCardClickText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#20536d" />
          </View>
        </View>



        {/* Contact Support button for creators on ongoing orders */}
        {isCreator && (order.status.toLowerCase() === 'accepted' || order.status.toLowerCase() === 'in_progress' || order.status.toLowerCase() === 'review') && (
          <View style={styles.orderCardActions}>
            <TouchableOpacity 
              style={styles.orderCardContactSupportButton}
              onPress={(e) => {
                e.stopPropagation();
                handleChatPress(order);
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#ffffff" />
              <Text style={styles.orderCardContactSupportText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Browse Creators button for brands on rejected orders */}
        {!isCreator && order.status.toLowerCase() === 'rejected' && (
          <View style={styles.orderCardActions}>
            <TouchableOpacity 
              style={styles.orderCardBrowseCreatorsButton}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('BrandHome');
              }}
            >
              <Ionicons name="people-outline" size={16} color="#ffffff" />
              <Text style={styles.orderCardBrowseCreatorsText}>Browse Creators</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Chat indicator for brand users */}
        {!isCreator && order.chat_enabled && (
          <View style={styles.orderCardChatIndicator}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#20536d" />
            <Text style={styles.orderCardChatText}>Chat Available</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Chat handling functions

  const filteredOrders = filterOrdersByTab(orders, activeTab);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>
          {userType === 'creator' ? 'Orders for your packages' : 'Orders you\'ve placed'}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {tabList.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={activeTab === tab.key ? styles.tabBtnActive : styles.tabBtn}
            onPress={() => handleTabPress(tab.key)}
          >
            <Text style={activeTab === tab.key ? styles.tabBtnTextActive : styles.tabBtnText}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No {activeTab} Orders</Text>
            <Text style={styles.emptySubtitle}>
              {userType === 'creator' 
                ? 'No new orders for your packages'
                : 'No orders in this status'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {filteredOrders.map(renderOrderCard)}
          </View>
        )}
        
        {/* Bottom spacing for navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar 
        navigation={navigation} 
        currentRoute="orders"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE5D9',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textGray,
  },
  tabBtnTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  ordersContainer: {
    padding: 20,
  },
  // New order card styles
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE5D9',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E4405F20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  orderCardInfo: {
    flex: 1,
  },
  orderCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  orderCardType: {
    fontSize: 14,
    color: '#666',
  },
  orderCardQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B0B0B0',
  },
  orderCardQuantityLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  orderCardQuantityValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  orderCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 40,
  },
  orderCardDetail: {
    alignItems: 'flex-start',
  },
  orderCardDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderCardDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 12,
  },
  orderCardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderCardParty: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  orderCardDate: {
    fontSize: 12,
    color: '#666',
  },
  orderCardFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderCardStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  orderCardStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  orderCardStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderCardClickText: {
    fontSize: 12,
    color: '#20536d',
    fontWeight: '500',
  },
  // Missing styles for modal
  paymentStatusBadge: {
    backgroundColor: '#4CAF50', // Green for completed/payment status
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  orderCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  orderCardRejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336', // Red for reject
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  orderCardRejectText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderCardAcceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50', // Green for accept
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  orderCardAcceptText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderCardContactSupportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20536d', // Dark blue for contact support
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  orderCardContactSupportText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderCardBrowseCreatorsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20536d', // Dark blue for browse creators
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  orderCardBrowseCreatorsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderCardChatIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  orderCardChatText: {
    fontSize: 12,
    color: '#20536d',
    fontWeight: '500',
  },
  // New styles for chat button
  brandActionsContainer: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#E0E0E0', // Default background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B0B0B0', // Default border
  },
  chatButtonDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#B0B0B0',
    opacity: 0.7,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#20536d', // Default text color
    marginLeft: 8,
  },
  chatButtonTextDisabled: {
    color: '#999',
  },
  orderCardStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  orderCardViewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default OrdersScreen; 
