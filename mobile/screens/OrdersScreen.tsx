import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../store/hooks';
import { ordersAPI } from '../services/apiService';
import { BottomNavBar, ZohoChatWidget } from '../components';

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
  zoho_visitor_id?: string;
  chat_session_id?: string;
}

// Color constants
const COLORS = {
  primary: '#f8f4e8',    // Cream
  secondary: '#f37135',  // Orange
  textDark: '#1A1D1F',
  textGray: '#6B7280',
  borderLight: '#E5E7EB',
  backgroundLight: '#F5F5F5'
};

const tabList = [
  { key: 'New', label: 'New' },
  { key: 'Ongoing', label: 'Ongoing' },
  { key: 'Completed', label: 'Completed' },
  { key: 'Cancelled', label: 'Cancelled' },
];

const OrdersScreen = ({ navigation }: any) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('New');
  const [showChat, setShowChat] = useState(false);
  const [currentOrderChat, setCurrentOrderChat] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState(false);
  
  // New state for order details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  const userType = useAppSelector(state => state.auth.userType);
  const user = useAppSelector(state => state.auth.user);

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
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      case 'pending':
      case 'new':
        return '#FF9800';
      default:
        return '#757575';
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
          order.status.toLowerCase() === 'pending' || 
          order.status.toLowerCase() === 'new'
        );
      case 'Ongoing':
        return orders.filter(order => 
          order.status.toLowerCase() === 'confirmed' || 
          order.status.toLowerCase() === 'in_progress'
        );
      case 'Completed':
        return orders.filter(order => 
          order.status.toLowerCase() === 'completed'
        );
      case 'Cancelled':
        return orders.filter(order => 
          order.status.toLowerCase() === 'cancelled'
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
                Alert.alert('Success', 'Order accepted successfully!');
                fetchOrders(); // Refresh orders
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

  // Render order details modal
  const renderOrderDetailsModal = () => {
    if (!selectedOrder) return null;

    const isCreator = userType === 'creator';
    const otherParty = isCreator ? selectedOrder.brand : selectedOrder.creator;
    const otherPartyName = isCreator 
      ? (otherParty as any)?.company_name 
      : (otherParty as any)?.user?.name;
    const otherPartyLocation = isCreator 
      ? `${(otherParty as any)?.location_city || ''} ${(otherParty as any)?.location_state || ''}`.trim()
      : '';

    return (
      <Modal
        visible={showOrderDetails}
        transparent
        animationType="slide"
        onRequestClose={handleCloseOrderDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={handleCloseOrderDetails} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {/* Order Header */}
              <View style={styles.modalOrderHeader}>
                <View style={styles.modalOrderTypeContainer}>
                  <View style={styles.modalOrderTypeIcon}>
                    <Ionicons name="film-outline" size={20} color="#E4405F" />
                  </View>
                  <Text style={styles.modalOrderTypeText}>Instagram Reel</Text>
                </View>
                <Text style={styles.modalOrderId}>Order ID: #{selectedOrder.id.slice(-6)}</Text>
              </View>

              {/* Order Title */}
              <Text style={styles.modalOrderTitle}>{selectedOrder.package.title}</Text>

              {/* Order Details */}
              <View style={styles.modalOrderDetails}>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Created at:</Text>
                  <Text style={styles.modalDetailValue}>{formatDate(selectedOrder.created_at)}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Duration:</Text>
                  <Text style={styles.modalDetailValue}>1 Min</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Quantity:</Text>
                  <Text style={styles.modalDetailValue}>{selectedOrder.quantity}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Revisions:</Text>
                  <Text style={styles.modalDetailValue}>1</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                    <Text style={styles.statusText}>{selectedOrder.status}</Text>
                  </View>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Payment Status:</Text>
                  <View style={styles.paymentStatusBadge}>
                    <Text style={styles.paymentStatusText}>Paid</Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={styles.modalDescriptionContainer}>
                <Text style={styles.modalDescriptionLabel}>Description:</Text>
                <Text style={styles.modalDescriptionText}>{selectedOrder.package.description}</Text>
              </View>

              {/* Price */}
              <View style={styles.modalPriceContainer}>
                <Text style={styles.modalPriceText}>{formatPrice(selectedOrder.total_amount)}</Text>
              </View>

              {/* Other Party Details */}
              {otherParty && (
                <View style={styles.modalOtherPartyContainer}>
                  <Text style={styles.modalOtherPartyTitle}>
                    {isCreator ? 'BRAND DETAILS:' : 'CREATOR DETAILS:'}
                  </Text>
                  <View style={styles.modalOtherPartyInfoRow}>
                    <Text style={styles.modalOtherPartyInfoLabel}>Name:</Text>
                    <Text style={styles.modalOtherPartyInfoValue}>{otherPartyName || 'N/A'}</Text>
                  </View>
                  {isCreator && otherPartyLocation && (
                    <View style={styles.modalOtherPartyInfoRow}>
                      <Text style={styles.modalOtherPartyInfoLabel}>Location:</Text>
                      <Text style={styles.modalOtherPartyInfoValue}>{otherPartyLocation}</Text>
                    </View>
                  )}
                  {!isCreator && (otherParty as any)?.user?.email && (
                    <View style={styles.modalOtherPartyInfoRow}>
                      <Text style={styles.modalOtherPartyInfoLabel}>Email:</Text>
                      <Text style={styles.modalOtherPartyInfoValue}>{(otherParty as any).user.email}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Action buttons for creators on pending orders */}
              {isCreator && selectedOrder.status.toLowerCase() === 'pending' && (
                <View style={styles.modalActionButtons}>
                  <TouchableOpacity 
                    style={styles.modalRejectButton}
                    onPress={() => handleRejectOrder(selectedOrder.id)}
                  >
                    <Ionicons name="close" size={20} color="#f8f4e8" />
                    <Text style={styles.modalRejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.modalAcceptButton}
                    onPress={() => handleAcceptOrder(selectedOrder.id)}
                  >
                    <Ionicons name="checkmark" size={20} color="#f8f4e8" />
                    <Text style={styles.modalAcceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Chat button for brand users */}
              {!isCreator && (
                <View style={styles.modalBrandActionsContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.modalChatButton,
                      chatLoading && styles.modalChatButtonDisabled
                    ]}
                    onPress={() => handleChatPressFromDetails(selectedOrder)}
                    disabled={chatLoading}
                  >
                    <Ionicons 
                      name="chatbubble-ellipses-outline" 
                      size={20} 
                      color={chatLoading ? "#999" : "#20536d"} 
                    />
                    <Text style={[
                      styles.modalChatButtonText,
                      chatLoading && styles.modalChatButtonTextDisabled
                    ]}>
                      {chatLoading ? 'Opening Chat...' : 'Chat with Support'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Chat handling functions
  const handleChatPress = async (order: Order) => {
    if (userType !== 'brand') {
      Alert.alert('Info', 'Chat is only available for brand users');
      return;
    }

    setChatLoading(true);
    try {
      // Check if chat is already enabled for this order
      const chatResponse = await ordersAPI.getOrderChat(order.id);
      
      if (chatResponse.success && chatResponse.chat.enabled) {
        // Chat is already enabled, show chat widget
        setCurrentOrderChat({
          orderId: order.id,
          visitorId: chatResponse.chat.visitor_id,
          sessionId: chatResponse.chat.session_id
        });
        setShowChat(true);
      } else {
        // Chat is not enabled, enable it first
        const enableResponse = await ordersAPI.enableOrderChat(order.id);
        
        if (enableResponse.success) {
          setCurrentOrderChat({
            orderId: order.id,
            visitorId: enableResponse.chat.visitor_id,
            sessionId: enableResponse.chat.session_id
          });
          setShowChat(true);
          // Refresh orders to update chat status
          fetchOrders();
        } else {
          Alert.alert('Error', 'Failed to enable chat for this order');
        }
      }
    } catch (error) {
      console.error('Error handling chat:', error);
      Alert.alert('Error', 'Failed to open chat. Please try again.');
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
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Handle chat button press from order details modal
  const handleChatPressFromDetails = async (order: Order) => {
    if (userType !== 'brand') {
      Alert.alert('Info', 'Chat is only available for brand users');
      return;
    }

    setChatLoading(true);
    try {
      // Check if chat is already enabled for this order
      const chatResponse = await ordersAPI.getOrderChat(order.id);
      
      if (chatResponse.success && chatResponse.chat.enabled) {
        // Chat is already enabled, show chat widget
        setCurrentOrderChat({
          orderId: order.id,
          visitorId: chatResponse.chat.visitor_id,
          sessionId: chatResponse.chat.session_id
        });
        setShowChat(true);
        // Close the order details modal when opening chat
        setShowOrderDetails(false);
      } else {
        // Chat is not enabled, enable it first
        const enableResponse = await ordersAPI.enableOrderChat(order.id);
        
        if (enableResponse.success) {
          setCurrentOrderChat({
            orderId: order.id,
            visitorId: enableResponse.chat.visitor_id,
            sessionId: enableResponse.chat.session_id
          });
          setShowChat(true);
          // Close the order details modal when opening chat
          setShowOrderDetails(false);
          // Refresh orders to update chat status
          fetchOrders();
        } else {
          Alert.alert('Error', 'Failed to enable chat for this order');
        }
      }
    } catch (error) {
      console.error('Error handling chat:', error);
      Alert.alert('Error', 'Failed to open chat. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  // Close order details modal
  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const renderOrderCard = (order: Order) => {
    const isCreator = userType === 'creator';
    const otherParty = isCreator ? order.brand : order.creator;
    const otherPartyName = isCreator 
      ? (otherParty as any)?.company_name 
      : (otherParty as any)?.user?.name;

    return (
      <TouchableOpacity 
        key={order.id} 
        style={styles.orderCard}
        onPress={() => handleOrderCardPress(order)}
        activeOpacity={0.8}
      >
        {/* Order Header */}
        <View style={styles.orderCardHeader}>
          <View style={styles.orderTypeContainer}>
            <View style={styles.orderTypeIcon}>
              <Ionicons name="film-outline" size={16} color="#E4405F" />
            </View>
            <Text style={styles.orderTypeText}>Instagram Reel</Text>
          </View>
          <Text style={styles.orderId}>#{order.id.slice(-6)}</Text>
        </View>

        {/* Order Title */}
        <Text style={styles.orderCardTitle} numberOfLines={2}>
          {order.package.title}
        </Text>

        {/* Basic Details Row */}
        <View style={styles.orderCardDetails}>
          <View style={styles.orderCardDetailItem}>
            <Text style={styles.orderCardDetailLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          <View style={styles.orderCardDetailItem}>
            <Text style={styles.orderCardDetailLabel}>Quantity</Text>
            <Text style={styles.orderCardDetailValue}>{order.quantity}</Text>
          </View>
          <View style={styles.orderCardDetailItem}>
            <Text style={styles.orderCardDetailLabel}>Price</Text>
            <Text style={styles.orderCardDetailValue}>{formatPrice(order.total_amount)}</Text>
          </View>
        </View>

        {/* Other Party Info */}
        {otherParty && (
          <View style={styles.orderCardParty}>
            <Text style={styles.orderCardPartyLabel}>
              {isCreator ? 'Brand:' : 'Creator:'}
            </Text>
            <Text style={styles.orderCardPartyName} numberOfLines={1}>
              {otherPartyName || 'N/A'}
            </Text>
          </View>
        )}

        {/* Date */}
        <Text style={styles.orderCardDate}>{formatDate(order.created_at)}</Text>

        {/* Action buttons for creators on pending orders */}
        {isCreator && order.status.toLowerCase() === 'pending' && (
          <View style={styles.orderCardActions}>
            <TouchableOpacity 
              style={styles.orderCardRejectButton}
              onPress={(e) => {
                e.stopPropagation();
                handleRejectOrder(order.id);
              }}
            >
              <Ionicons name="close" size={16} color="#f8f4e8" />
              <Text style={styles.orderCardRejectText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.orderCardAcceptButton}
              onPress={(e) => {
                e.stopPropagation();
                handleAcceptOrder(order.id);
              }}
            >
              <Ionicons name="checkmark" size={16} color="#f8f4e8" />
              <Text style={styles.orderCardAcceptText}>Accept</Text>
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

      {/* Zoho Chat Widget */}
      <ZohoChatWidget
        visible={showChat}
        onClose={handleChatClose}
        onMessageSent={handleChatMessageSent}
        orderInfo={currentOrderChat}
      />

      {/* Order Details Modal */}
      {renderOrderDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e8',
  },
  header: {
    backgroundColor: '#f8f4e8',
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
    borderColor: COLORS.borderLight,
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
    backgroundColor: '#f8f4e8',
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
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  orderCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderCardDetailItem: {
    alignItems: 'center',
  },
  orderCardDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderCardDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  orderCardParty: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCardPartyLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  orderCardPartyName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    flex: 1,
  },
  orderCardDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  orderCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  orderCardRejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  orderCardRejectText: {
    color: '#f8f4e8',
    fontSize: 12,
    fontWeight: '600',
  },
  orderCardAcceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  orderCardAcceptText: {
    color: '#f8f4e8',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#f8f4e8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  modalOrderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOrderTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E4405F20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  modalOrderTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalOrderId: {
    fontSize: 14,
    color: '#666',
  },
  modalOrderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  modalOrderDetails: {
    marginBottom: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalDetailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  modalDescriptionContainer: {
    marginBottom: 16,
  },
  modalDescriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  modalDescriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalPriceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalPriceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modalOtherPartyContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  modalOtherPartyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  modalOtherPartyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalOtherPartyInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalOtherPartyInfoValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modalRejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  modalRejectButtonText: {
    color: '#f8f4e8',
    fontSize: 16,
    fontWeight: '600',
  },
  modalAcceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  modalAcceptButtonText: {
    color: '#f8f4e8',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBrandActionsContainer: {
    marginBottom: 16,
  },
  modalChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20536d',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  modalChatButtonDisabled: {
    backgroundColor: '#999',
  },
  modalChatButtonText: {
    color: '#f8f4e8',
    fontSize: 16,
    fontWeight: '600',
  },
  modalChatButtonTextDisabled: {
    color: '#CCC',
  },
  orderCard: {
    backgroundColor: '#f8f4e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  orderTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  orderId: {
    fontSize: 14,
    color: '#666',
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  orderDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f8f4e8',
  },
  paymentStatusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f8f4e8',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  priceContainer: {
    marginBottom: 16,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f37135',
  },
  otherPartyContainer: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
  },
  otherPartyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  otherPartyInfoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  otherPartyInfoLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  otherPartyInfoValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8f4e8',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8f4e8',
  },
  brandStatusContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  brandStatusText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  browseCreatorsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f8f4e8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f37135',
  },
  browseCreatorsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f37135',
    marginRight: 8,
  },
  // Rejection message styles
  rejectionMessageContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
  },
  rejectionMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rejectionMessageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  rejectionMessageCard: {
    backgroundColor: '#f8f4e8',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f37135',
  },
  rejectionMessageText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  rejectionMessageOrderId: {
    fontSize: 12,
    color: '#9CA3AF',
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
});

export default OrdersScreen; 
