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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../store/hooks';
import { ordersAPI } from '../services/apiService';
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

  const renderOrderCard = (order: Order) => {
    const isCreator = userType === 'creator';
    const otherParty = isCreator ? order.brand : order.creator;
    const otherPartyName = isCreator 
      ? (otherParty as any)?.company_name 
      : (otherParty as any)?.user?.name;
    const otherPartyLocation = isCreator 
      ? `${(otherParty as any)?.location_city || ''} ${(otherParty as any)?.location_state || ''}`.trim()
      : '';

    return (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderTypeContainer}>
            <View style={styles.orderTypeIcon}>
              <Ionicons name="film-outline" size={20} color="#E4405F" />
            </View>
            <Text style={styles.orderTypeText}>Instagram Reel</Text>
          </View>
          <Text style={styles.orderId}>Order ID: #{order.id.slice(-6)}</Text>
        </View>

        <Text style={styles.orderTitle}>{order.package.title}</Text>
        
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created at:</Text>
            <Text style={styles.detailValue}>{formatDate(order.created_at)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>1 Min</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>{order.quantity}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Revisions:</Text>
            <Text style={styles.detailValue}>1</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Status:</Text>
            <View style={styles.paymentStatusBadge}>
              <Text style={styles.paymentStatusText}>Paid</Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Description:</Text>
          <Text style={styles.descriptionText}>{order.package.description}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{formatPrice(order.total_amount)}</Text>
        </View>

        {/* Show other party details */}
        {otherParty && (
          <View style={styles.otherPartyContainer}>
            <Text style={styles.otherPartyTitle}>
              {isCreator ? 'BRAND DETAILS:' : 'CREATOR DETAILS:'}
            </Text>
            <View style={styles.otherPartyInfoRow}>
              <Text style={styles.otherPartyInfoLabel}>Name:</Text>
              <Text style={styles.otherPartyInfoValue}>{otherPartyName || 'N/A'}</Text>
            </View>
            {isCreator && otherPartyLocation && (
              <View style={styles.otherPartyInfoRow}>
                <Text style={styles.otherPartyInfoLabel}>Location:</Text>
                <Text style={styles.otherPartyInfoValue}>{otherPartyLocation}</Text>
              </View>
            )}
                         {!isCreator && (otherParty as any)?.user?.email && (
               <View style={styles.otherPartyInfoRow}>
                 <Text style={styles.otherPartyInfoLabel}>Email:</Text>
                 <Text style={styles.otherPartyInfoValue}>{(otherParty as any).user.email}</Text>
               </View>
             )}
          </View>
        )}

        {/* Show action buttons only for creators on pending orders */}
        {isCreator && order.status.toLowerCase() === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={() => handleRejectOrder(order.id)}
            >
              <Ionicons name="close" size={20} color="#f8f4e8" />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => handleAcceptOrder(order.id)}
            >
              <Ionicons name="checkmark" size={20} color="#f8f4e8" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Show status info for brands */}
        {!isCreator && (
          <View style={styles.brandStatusContainer}>
            <Text style={styles.brandStatusText}>
              {order.status.toLowerCase() === 'pending' && 'Waiting for creator to accept'}
              {order.status.toLowerCase() === 'confirmed' && 'Creator has accepted your order'}
              {order.status.toLowerCase() === 'in_progress' && 'Creator is working on your order'}
              {order.status.toLowerCase() === 'completed' && 'Order completed successfully'}
              {order.status.toLowerCase() === 'cancelled' && (
                order.rejection_message || 'Order was cancelled'
              )}
            </Text>
            {/* Show browse other creators link for cancelled orders */}
            {order.status.toLowerCase() === 'cancelled' && (
              <TouchableOpacity 
                style={styles.browseCreatorsButton}
                onPress={() => {
                  // Navigate to creators list or home to browse other creators
                  navigation.navigate('BrandHome');
                }}
              >
                <Text style={styles.browseCreatorsText}>Browse Other Creators</Text>
                <Ionicons name="arrow-forward" size={16} color="#f37135" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Show appealing rejection message for cancelled orders with rejection messages */}
        {order.status.toLowerCase() === 'cancelled' && order.rejection_message && (
          <View style={styles.rejectionMessageContainer}>
            <View style={styles.rejectionMessageHeader}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#f37135" style={{ marginRight: 8 }} />
              <Text style={styles.rejectionMessageTitle}>Rejection Message</Text>
            </View>
            <View style={styles.rejectionMessageCard}>
              <Text style={styles.rejectionMessageText}>{order.rejection_message}</Text>
              <Text style={styles.rejectionMessageOrderId}>Order ID: #{order.id.slice(-6)}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

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
});

export default OrdersScreen; 
