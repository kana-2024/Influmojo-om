import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import * as DocumentPicker from 'expo-document-picker';
import { useAppSelector } from '../store/hooks';
import { ordersAPI } from '../services/apiService';
import { ticketAPI } from '../services/apiService';
import COLORS from '../config/colors';
import { ENV } from '../config/env';
import { getToken } from '../services/storage';
import { cloudinaryService, CloudinaryUploadResponse } from '../services/cloudinaryService';

interface OrderDetails {
  id: string;
  package?: {
    id?: string;
    title?: string;
    description?: string;
    price?: number;
    deliverables?: any[];
    type?: string;
  };
  collaboration?: {
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
  created_at?: string;
  order_date?: string;
  status: string;
  delivery_time?: number;
  additional_instructions?: string;
  references?: string[];
  total_amount?: number;
  currency?: string;
  quantity?: number;
  price_revision_amount?: string | number;
  price_revision_reason?: string;
}

const OrderDetailsScreen = ({ route, navigation }: any) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [currentOrderChat, setCurrentOrderChat] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Deliverable upload states
  const [uploadedDeliverables, setUploadedDeliverables] = useState<CloudinaryUploadResponse[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [submittingDeliverables, setSubmittingDeliverables] = useState(false);
  
  // Price revision tracking
  const [hasRequestedPriceRevision, setHasRequestedPriceRevision] = useState(false);
  const [priceRevisionAmount, setPriceRevisionAmount] = useState('');
  
  const userType = useAppSelector(state => state.auth.userType);
  const user = useAppSelector(state => state.auth.user);
  const userId = useAppSelector(state => state.auth.user?.id);
  const { orderId } = route.params;

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    if (orderDetails) {
      fetchTicketId().then((ticketId) => {
        if (ticketId) {
          fetchTicketMessages();
        }
      });
    }
  }, [orderDetails]);

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
      console.log('Fetched order details:', {
        delivery_time: data.data?.order?.delivery_time,
        additional_instructions: data.data?.order?.additional_instructions,
        references: data.data?.order?.references
      });
      
      // Process the order data to ensure proper structure
      const orderData = data.data.order;
      
      // Parse references if it's a JSON string
      if (orderData.references && typeof orderData.references === 'string') {
        try {
          orderData.references = JSON.parse(orderData.references);
        } catch (e) {
          console.warn('Failed to parse references:', e);
          orderData.references = [];
        }
      }
      
      // Ensure references is always an array
      if (!Array.isArray(orderData.references)) {
        orderData.references = orderData.references ? [orderData.references] : [];
      }
      
      setOrderDetails(orderData);
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
      case 'accepted':
      case 'in_progress':
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

  const formatPrice = (price: number | undefined | null, currency: string = 'USD') => {
    if (price === undefined || price === null || isNaN(price)) {
      return `${currency === 'USD' ? '$' : currency}0.00`;
    }
    return `${currency === 'USD' ? '$' : currency}${price.toFixed(2)}`;
  };

  // Ticket and message handling functions
  const fetchTicketId = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${ENV.API_BASE_URL}/api/crm/tickets/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.ticket) {
          setTicketId(data.data.ticket.id);
          return data.data.ticket.id;
        }
      }
    } catch (error) {
      console.error('Error fetching ticket ID:', error);
    }
    return null;
  };

  const fetchTicketMessages = async () => {
    if (!ticketId) return;
    
    setLoadingMessages(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${ENV.API_BASE_URL}/api/crm/tickets/${ticketId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTicketMessages(data.data.messages || []);
        }
      }
    } catch (error) {
      console.error('Error fetching ticket messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendTicketMessage = async (messageText: string, messageType: 'text' | 'system' = 'text') => {
    if (!ticketId) return;
    
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${ENV.API_BASE_URL}/api/crm/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_text: messageText,
          message_type: messageType,
          sender_role: userType,
          channel_type: userType === 'brand' ? 'brand_agent' : 'creator_agent'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh messages after sending
          await fetchTicketMessages();
          return true;
        }
      }
    } catch (error) {
      console.error('Error sending ticket message:', error);
    }
    return false;
  };

  const handleSendUpdate = async () => {
    if (!updateMessage.trim()) {
      Alert.alert('Error', 'Please enter an update message');
      return;
    }

    setSendingUpdate(true);
    try {
      const success = await sendTicketMessage(updateMessage.trim());
      
      if (success) {
        Alert.alert('Success', 'Update sent successfully!');
        setUpdateMessage('');
      } else {
        Alert.alert('Error', 'Failed to send update. Please try again.');
      }
    } catch (error) {
      console.error('Error sending update:', error);
      Alert.alert('Error', 'Failed to send update. Please try again.');
    } finally {
      setSendingUpdate(false);
    }
  };

  // Chat handling functions
  const handleChatPress = async () => {
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
      const ticketResponse = await ticketAPI.getTicketByOrderId(orderId);
      
      if (ticketResponse.success && ticketResponse.data.ticket) {
        const ticket = ticketResponse.data.ticket;
        
        // Navigate to appropriate chat screen based on user type
        if (userType === 'brand') {
          navigation.navigate('BrandChat', {
            ticketId: ticket.id,
            orderId: orderId,
            orderTitle: orderDetails?.package?.title || `Order #${orderId}`
          });
        } else if (userType === 'creator') {
          navigation.navigate('CreatorChat', {
            ticketId: ticket.id,
            orderId: orderId,
            orderTitle: orderDetails?.package?.title || `Order #${orderId}`
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

  // Order acceptance and rejection handlers
  const handleAcceptOrder = async () => {
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
                Alert.alert('Success', 'Order accepted successfully! The order has been moved to ongoing status.');
                // Refresh order details to show updated status and timeline
                fetchOrderDetails();
              } else {
                Alert.alert('Error', response.message || 'Failed to accept order');
              }
            } catch (error) {
              console.error('Error accepting order:', error);
              Alert.alert('Error', 'Failed to accept order. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleRejectOrder = async () => {
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
                // Refresh order details to show updated status
                fetchOrderDetails();
              } else {
                Alert.alert('Error', response.message || 'Failed to reject order');
              }
            } catch (error) {
              console.error('Error rejecting order:', error);
              Alert.alert('Error', 'Failed to reject order. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Deliverable upload functions
  const handleUploadDeliverables = async () => {
    try {
      setUploadingFiles(true);
      
      // Open document picker for multiple files
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Accept all file types
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setUploadingFiles(false);
        return;
      }

      const uploadedFiles: CloudinaryUploadResponse[] = [];
      
      // Upload each selected file
      for (const file of result.assets) {
        try {
          console.log('Uploading file:', file.name);
          const cloudinaryResponse = await cloudinaryService.uploadFile(file);
          uploadedFiles.push(cloudinaryResponse);
        } catch (error) {
          console.error('Error uploading file:', file.name, error);
          Alert.alert('Upload Error', `Failed to upload ${file.name}. Please try again.`);
        }
      }

      if (uploadedFiles.length > 0) {
        setUploadedDeliverables(prev => [...prev, ...uploadedFiles]);
        Alert.alert('Success', `${uploadedFiles.length} file(s) uploaded successfully!`);
      }
      
    } catch (error) {
      console.error('Error selecting files:', error);
      Alert.alert('Error', 'Failed to select files. Please try again.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    Alert.alert(
      'Remove File',
      'Are you sure you want to remove this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setUploadedDeliverables(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const handleSubmitDeliverables = async () => {
    if (uploadedDeliverables.length === 0) {
      Alert.alert('No Files', 'Please upload at least one deliverable before submitting.');
      return;
    }

    try {
      setSubmittingDeliverables(true);
      
      // Prepare deliverable data
      const deliverablesData = uploadedDeliverables.map(file => ({
        url: file.secure_url,
        filename: file.public_id.split('/').pop() || 'file',
        type: file.resource_type,
        size: file.bytes
      }));

      // Submit deliverables via API (you'll need to create this endpoint)
      const response = await fetch(`${ENV.API_BASE_URL}/api/orders/${orderId}/deliverables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          deliverables: deliverablesData
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        Alert.alert('Success', 'Deliverables submitted for review!');
        // Clear uploaded files and refresh order details
        setUploadedDeliverables([]);
        fetchOrderDetails();
      } else {
        throw new Error(result.message || 'Failed to submit deliverables');
      }
      
    } catch (error) {
      console.error('Error submitting deliverables:', error);
      Alert.alert('Error', 'Failed to submit deliverables. Please try again.');
    } finally {
      setSubmittingDeliverables(false);
    }
  };

  const handleRequestPriceRevision = async () => {
    if (!priceRevisionAmount.trim()) {
      Alert.alert('Error', 'Please enter a valid amount for the price revision.');
      return;
    }

    Alert.alert(
      'Request Price Revision',
      `Are you sure you want to request an additional $${priceRevisionAmount} for this revision?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            try {
              // Submit price revision request via API
              const response = await fetch(`${ENV.API_BASE_URL}/api/orders/${orderId}/price-revision`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${await getToken()}`
                },
                body: JSON.stringify({
                  additionalAmount: parseFloat(priceRevisionAmount),
                  reason: 'Additional work required for revision'
                })
              });

              const result = await response.json();
              
              if (response.ok && result.success) {
                Alert.alert('Success', 'Price revision request sent to the brand!');
                setHasRequestedPriceRevision(true);
                setPriceRevisionAmount('');
                fetchOrderDetails(); // Refresh order details
              } else {
                throw new Error(result.message || 'Failed to send price revision request');
              }
              
            } catch (error) {
              console.error('Error requesting price revision:', error);
              Alert.alert('Error', 'Failed to send price revision request. Please try again.');
            }
          }
        }
      ]
    );
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
  const otherParty = isCreator ? orderDetails.brand : orderDetails.creator;
  const orderDate = orderDetails.created_at || orderDetails.order_date;

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
        {(userType === 'brand' || userType === 'creator') && (
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
        {userType !== 'brand' && userType !== 'creator' && <View style={styles.headerSpacer} />}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(orderDetails.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {orderDetails.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.orderDate}>
            Ordered on {orderDate ? formatDate(orderDate) : 'N/A'}
          </Text>
        </View>

        {/* Update Board - Brand Side */}
        {userType === 'brand' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brand Update Board</Text>
            <View style={styles.updateBoardCard}>
              {orderDetails.status === 'pending' ? (
                <View style={styles.waitingApprovalContainer}>
                  <Ionicons name="time-outline" size={48} color="#20536d" />
                  <Text style={styles.waitingApprovalTitle}>Waiting for Creator Approval</Text>
                  <Text style={styles.waitingApprovalDescription}>
                    The creator is reviewing your order requirements. You'll be able to send updates once they approve the order.
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.updateBoardDescription}>
                    Share updates, requirements, or feedback with the creator
                  </Text>
                  
                  <View style={styles.updateInputContainer}>
                    <TextInput
                      style={styles.updateInput}
                      placeholder="Type your update, requirement, or feedback..."
                      placeholderTextColor="#9CA3AF"
                      value={updateMessage}
                      onChangeText={setUpdateMessage}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                    <TouchableOpacity
                      style={[styles.sendUpdateButton, sendingUpdate && styles.sendUpdateButtonDisabled]}
                      onPress={handleSendUpdate}
                      disabled={sendingUpdate}
                    >
                      {sendingUpdate ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Ionicons name="send" size={20} color="#ffffff" />
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* All Updates */}
              {ticketMessages.length > 0 && (
                <View style={styles.updatesContainer}>
                  <Text style={styles.updatesTitle}>Order Updates & Activity</Text>
                  <ScrollView style={styles.updatesList} showsVerticalScrollIndicator={false}>
                    {ticketMessages
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((message, index) => (
                        <View key={index} style={styles.updateCard}>
                          <View style={styles.updateHeader}>
                            <Text style={styles.updateSender}>
                              {message.sender_role === 'brand' ? 'Brand' : 
                               message.sender_role === 'creator' ? 'Creator' : 
                               message.sender_role === 'agent' ? 'Support Agent' : 'System'}
                            </Text>
                            <Text style={styles.updateDate}>
                              {formatDate(message.created_at)}
                            </Text>
                          </View>
                          
                          {/* Regular Update Message */}
                          {message.message_type === 'text' && (
                            <Text style={styles.updateContent}>
                              {message.message_text}
                            </Text>
                          )}
                        </View>
                      ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Update Board - Creator Side */}
        {userType === 'creator' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Creator Update Board</Text>
            <View style={styles.updateBoardCard}>
              {orderDetails.status === 'pending' ? (
                <View style={styles.waitingApprovalContainer}>
                  <Ionicons name="time-outline" size={48} color="#20536d" />
                  <Text style={styles.waitingApprovalTitle}>Order Review Required</Text>
                  <Text style={styles.waitingApprovalDescription}>
                    Please review the order requirements below. You can approve the order or reject it if needed.
                  </Text>
                  
                  {/* Cart Form Details Display for Review (when pending) or Regular Display (when not pending) */}
                  <View style={styles.cartFormDetails}>

                    
                    {/* Delivery Time */}
                    <View style={styles.cartFormItem}>
                      <Ionicons name="time-outline" size={16} color="#20536d" />
                      <Text style={styles.cartFormText}>
                        Delivery Time: {orderDetails.delivery_time !== null && orderDetails.delivery_time !== undefined ? `${orderDetails.delivery_time} days` : 'Not specified'}
                      </Text>
                    </View>

                    {/* Additional Instructions */}
                    <View style={styles.cartFormItem}>
                      <Ionicons name="document-text-outline" size={16} color="#20536d" />
                      <Text style={styles.cartFormText}>
                        Instructions: {orderDetails.additional_instructions && orderDetails.additional_instructions.trim() !== '' ? orderDetails.additional_instructions : 'No additional instructions provided'}
                      </Text>
                    </View>

                    {/* References with Preview */}
                    <View style={styles.cartFormItem}>
                      <Ionicons name="images-outline" size={16} color="#20536d" />
                      <Text style={styles.cartFormText}>
                        References: {(() => {
                          console.log('Debug - orderDetails.references:', orderDetails.references, typeof orderDetails.references);
                          
                          if (!orderDetails.references) {
                            return 'No reference files uploaded';
                          }
                          
                          let referencesArray = orderDetails.references;
                          
                          // If it's a string, try to parse it as JSON
                          if (typeof referencesArray === 'string') {
                            try {
                              referencesArray = JSON.parse(referencesArray);
                            } catch (e) {
                              console.warn('Failed to parse references as JSON:', e);
                              return 'No reference files uploaded';
                            }
                          }
                          
                          // Ensure it's an array
                          if (!Array.isArray(referencesArray)) {
                            referencesArray = [referencesArray];
                          }
                          
                          // Filter out empty or null references
                          referencesArray = referencesArray.filter(ref => ref && ref !== null && ref !== undefined && ref !== '');
                          
                          if (referencesArray.length === 0) {
                            return 'No reference files uploaded';
                          }
                          
                          return `${referencesArray.length} file(s) uploaded`;
                        })()}
                      </Text>
                      
                      {/* Reference Files Preview */}
                      {(() => {
                        if (!orderDetails.references) return null;
                        
                        let referencesArray = orderDetails.references;
                        
                        // If it's a string, try to parse it as JSON
                        if (typeof referencesArray === 'string') {
                          try {
                            referencesArray = JSON.parse(referencesArray);
                          } catch (e) {
                            console.warn('Failed to parse references as JSON for preview:', e);
                            return null;
                          }
                        }
                        
                        // Ensure it's an array
                        if (!Array.isArray(referencesArray)) {
                          referencesArray = [referencesArray];
                        }
                        
                        // Filter out empty or null references
                        referencesArray = referencesArray.filter(ref => ref && ref !== null && ref !== undefined && ref !== '');
                        
                        if (referencesArray.length === 0) return null;
                        
                        return (
                          <View style={styles.referencesPreview}>
                            <Text style={styles.referencesPreviewTitle}>Reference Files:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.referencesScroll}>
                              {referencesArray.map((reference, index) => {
                                const fileName = typeof reference === 'string' 
                                  ? reference.split('/').pop() || `Reference ${index + 1}`
                                  : `Reference ${index + 1}`;
                                
                                const isImage = typeof reference === 'string' && 
                                  /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                                
                                // Check if it's a Cloudinary URL
                                const isCloudinaryUrl = typeof reference === 'string' && 
                                  reference.includes('cloudinary.com');
                                
                                // Get optimized URL for Cloudinary images
                                const getOptimizedUrl = (url: string) => {
                                  if (isCloudinaryUrl && isImage) {
                                    // Extract public ID from Cloudinary URL
                                    const urlParts = url.split('/');
                                    const uploadIndex = urlParts.findIndex(part => part === 'upload');
                                    if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
                                      const publicId = urlParts.slice(uploadIndex + 2).join('/').replace(/\.[^/.]+$/, '');
                                      return cloudinaryService.getOptimizedUrl(publicId, { width: 200, height: 200, quality: 80 });
                                    }
                                  }
                                  return url;
                                };
                                
                                return (
                                  <TouchableOpacity 
                                    key={index} 
                                    style={styles.referenceItem}
                                    onPress={() => {
                                      // Handle reference file preview
                                      if (typeof reference === 'string' && reference.startsWith('http')) {
                                        if (isImage && isCloudinaryUrl) {
                                          // For Cloudinary images, show in a modal or open in browser
                                          Linking.openURL(reference);
                                        } else {
                                          Linking.openURL(reference);
                                        }
                                      } else {
                                        Alert.alert('Reference File', `Opening: ${fileName}`);
                                      }
                                    }}
                                  >
                                    {isImage && isCloudinaryUrl ? (
                                      <Image 
                                        source={{ uri: getOptimizedUrl(reference) }}
                                        style={styles.referenceImage}
                                        resizeMode="cover"
                                        onError={() => {
                                          // Fallback to icon if image fails to load
                                          console.log('Failed to load image:', reference);
                                        }}
                                        onLoadStart={() => {
                                          // Optional: Add loading state if needed
                                        }}
                                      />
                                    ) : (
                                      <View style={styles.referenceIconContainer}>
                                        <Ionicons 
                                          name={isImage ? "image-outline" : "document-outline"} 
                                          size={24} 
                                          color="#20536d" 
                                        />
                                      </View>
                                    )}
                                    <Text style={styles.referenceFileName} numberOfLines={1}>
                                      {fileName}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </ScrollView>
                          </View>
                        );
                      })()}
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.approvalActions}>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={handleAcceptOrder}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                      <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={handleRejectOrder}
                    >
                      <Ionicons name="close-circle-outline" size={20} color="#ffffff" />
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  {/* Creator Deliverable Upload Section */}
                  {(orderDetails.status === 'accepted' || orderDetails.status === 'in_progress') ? (
                    <>
                      <Text style={styles.updateBoardDescription}>
                        Upload your deliverables for brand review
                      </Text>
                      
                      {/* Deliverable Upload Area */}
                      <TouchableOpacity 
                        style={styles.deliverableUploadArea}
                        onPress={handleUploadDeliverables}
                        disabled={uploadingFiles}
                      >
                        {uploadingFiles ? (
                          <ActivityIndicator size="large" color="#20536d" />
                        ) : (
                          <Ionicons name="cloud-upload-outline" size={32} color="#20536d" />
                        )}
                        <Text style={styles.uploadText}>
                          {uploadingFiles ? 'Uploading...' : 'Upload Deliverables'}
                        </Text>
                        <Text style={styles.uploadSubText}>
                          Images, videos, documents, or links
                        </Text>
                      </TouchableOpacity>

                      {/* Uploaded Files Display */}
                      {uploadedDeliverables.length > 0 && (
                        <View style={styles.uploadedFilesContainer}>
                          <Text style={styles.uploadedFilesTitle}>Uploaded Files ({uploadedDeliverables.length})</Text>
                          <FlatList
                            data={uploadedDeliverables}
                            keyExtractor={(item, index) => `${item.public_id}-${index}`}
                            renderItem={({ item, index }) => (
                              <View style={styles.uploadedFileItem}>
                                <View style={styles.fileInfo}>
                                  <Ionicons 
                                    name={
                                      item.resource_type === 'image' ? 'image-outline' :
                                      item.resource_type === 'video' ? 'videocam-outline' :
                                      'document-outline'
                                    }
                                    size={24} 
                                    color="#20536d" 
                                  />
                                  <View style={styles.fileDetails}>
                                    <Text style={styles.fileName} numberOfLines={1}>
                                      {item.public_id.split('/').pop() || 'File'}
                                    </Text>
                                    <Text style={styles.fileSize}>
                                      {(item.bytes / 1024 / 1024).toFixed(2)} MB
                                    </Text>
                                  </View>
                                </View>
                                <TouchableOpacity
                                  style={styles.removeFileButton}
                                  onPress={() => handleRemoveDeliverable(index)}
                                >
                                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                                </TouchableOpacity>
                              </View>
                            )}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                          />
                        </View>
                      )}
                      
                      {/* Submit for Review Button */}
                      <TouchableOpacity 
                        style={[
                          styles.submitReviewButton,
                          (uploadedDeliverables.length === 0 || submittingDeliverables) && styles.submitReviewButtonDisabled
                        ]}
                        onPress={handleSubmitDeliverables}
                        disabled={uploadedDeliverables.length === 0 || submittingDeliverables}
                      >
                        {submittingDeliverables ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                        )}
                        <Text style={styles.submitReviewText}>
                          {submittingDeliverables ? 'Submitting...' : 'Submit for Review'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (orderDetails.status as string) === 'revision_requested' ? (
                    <>
                      {/* Revision Request Section */}
                      <View style={styles.revisionRequestSection}>
                        <Text style={styles.revisionRequestTitle}>Revision Requested</Text>
                        <Text style={styles.revisionRequestDescription}>
                          The brand has requested revisions. You can resubmit deliverables or request a price adjustment for additional work.
                        </Text>
                        
                        {!hasRequestedPriceRevision ? (
                          <View style={styles.priceRevisionContainer}>
                            <Text style={styles.priceRevisionLabel}>Request Additional Payment (One-time only)</Text>
                            <View style={styles.priceInputContainer}>
                              <Text style={styles.currencySymbol}>$</Text>
                              <TextInput
                                style={styles.priceInput}
                                placeholder="0.00"
                                placeholderTextColor="#9CA3AF"
                                value={priceRevisionAmount}
                                onChangeText={setPriceRevisionAmount}
                                keyboardType="numeric"
                              />
                            </View>
                            <TouchableOpacity 
                              style={[
                                styles.priceRevisionButton,
                                !priceRevisionAmount.trim() && styles.priceRevisionButtonDisabled
                              ]}
                              disabled={!priceRevisionAmount.trim()}
                              onPress={handleRequestPriceRevision}
                            >
                              <Ionicons name="cash-outline" size={20} color="#ffffff" />
                              <Text style={styles.priceRevisionText}>Request Price Revision</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={styles.priceRevisionUsedContainer}>
                            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                            <Text style={styles.priceRevisionUsedText}>
                              Price revision already requested. Waiting for brand response.
                            </Text>
                          </View>
                        )}
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.updateBoardDescription}>
                        Share progress updates, questions, or deliverables with the brand
                      </Text>
                      
                      <View style={styles.updateInputContainer}>
                        <TextInput
                          style={styles.updateInput}
                          placeholder="Type your progress update, question, or deliverable..."
                          placeholderTextColor="#9CA3AF"
                          value={updateMessage}
                          onChangeText={setUpdateMessage}
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                        />
                        <TouchableOpacity
                          style={[styles.sendUpdateButton, sendingUpdate && styles.sendUpdateButtonDisabled]}
                          onPress={handleSendUpdate}
                          disabled={sendingUpdate}
                        >
                          {sendingUpdate ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <Ionicons name="send" size={20} color="#ffffff" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </>
              )}

              {/* All Updates and Revision Responses */}
              {ticketMessages.length > 0 && (
                <View style={styles.updatesContainer}>
                  <Text style={styles.updatesTitle}>Order Updates & Activity</Text>
                  <ScrollView style={styles.updatesList} showsVerticalScrollIndicator={false}>
                    {ticketMessages
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((message, index) => (
                        <View key={index} style={styles.updateCard}>
                          <View style={styles.updateHeader}>
                            <Text style={styles.updateSender}>
                              {message.sender_role === 'brand' ? 'Brand' : 
                               message.sender_role === 'creator' ? 'Creator' : 
                               message.sender_role === 'agent' ? 'Support Agent' : 'System'}
                            </Text>
                            <Text style={styles.updateDate}>
                              {formatDate(message.created_at)}
                            </Text>
                          </View>
                          
                          {/* Regular Update Message */}
                          {message.message_type === 'text' && (
                            <Text style={styles.updateContent}>
                              {message.message_text}
                            </Text>
                          )}
                        </View>
                      ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Package Details */}
        {orderDetails.package && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Package Details</Text>
            <View style={styles.packageCard}>
              <Text style={styles.packageTitle}>{orderDetails.package?.title || 'Package Title Not Available'}</Text>
              <Text style={styles.packageDescription}>
                {orderDetails.package?.description || 'Package description not available'}
              </Text>
              {orderDetails.package?.price !== undefined && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Price:</Text>
                  <Text style={styles.priceValue}>
                    {formatPrice(orderDetails.package.price, orderDetails.currency || 'USD')}
                  </Text>
                </View>
              )}
              {orderDetails.total_amount && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Total Amount:</Text>
                  <Text style={styles.priceValue}>
                    {formatPrice(orderDetails.total_amount, orderDetails.currency || 'USD')}
                  </Text>
                </View>
              )}
              {orderDetails.quantity && orderDetails.quantity > 1 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Quantity:</Text>
                  <Text style={styles.priceValue}>{orderDetails.quantity}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Brand Review Section */}
        {userType === 'brand' && (orderDetails.status === 'in_progress' || orderDetails.status === 'review' || orderDetails.status === 'price_revision_pending') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Review Deliverables</Text>
            <View style={styles.updateBoardCard}>
              <Text style={styles.updateBoardDescription}>
                Review the deliverables submitted by the creator
              </Text>

              {/* Deliverables Display Area */}
              <View style={styles.deliverablesReviewSection}>
                <Text style={styles.deliverablesTitle}>Submitted Deliverables</Text>
                {/* Placeholder for deliverables - this would be populated with actual submissions */}
                <View style={styles.deliverablePlaceholder}>
                  <Ionicons name="document-outline" size={32} color="#6B7280" />
                  <Text style={styles.deliverablePlaceholderText}>
                    No deliverables submitted yet
                  </Text>
                </View>
              </View>

              {/* Brand Review Actions */}
              <View style={styles.brandReviewActions}>
                <TouchableOpacity style={styles.approveDeliverableButton}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                  <Text style={styles.approveDeliverableText}>Accept Deliverable</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.requestRevisionButton}>
                  <Ionicons name="refresh-outline" size={20} color="#ffffff" />
                  <Text style={styles.requestRevisionText}>Ask for Revision</Text>
                </TouchableOpacity>
              </View>

              {/* Revision Comments Section */}
              <View style={styles.revisionCommentsSection}>
                <Text style={styles.revisionCommentsTitle}>Revision Comments (Optional)</Text>
                <TextInput
                  style={styles.revisionCommentsInput}
                  placeholder="Provide specific feedback for revisions..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Price Revision Request (if creator requested additional payment) */}
              {orderDetails.status === 'price_revision_pending' && orderDetails.price_revision_amount && (
                <View style={styles.priceRevisionRequestSection}>
                  <Text style={styles.priceRevisionRequestTitle}>Price Revision Request</Text>
                  <Text style={styles.priceRevisionRequestDescription}>
                    The creator has requested additional payment for the revision work.
                  </Text>
                  
                  <View style={styles.priceRevisionDetailsCard}>
                    <View style={styles.priceRevisionDetail}>
                      <Text style={styles.priceRevisionDetailLabel}>Additional Amount:</Text>
                      <Text style={styles.priceRevisionDetailValue}>
                        ${parseFloat(orderDetails.price_revision_amount?.toString() || '0').toFixed(2)}
                      </Text>
                    </View>
                    
                    {orderDetails.price_revision_reason && (
                      <View style={styles.priceRevisionDetail}>
                        <Text style={styles.priceRevisionDetailLabel}>Reason:</Text>
                        <Text style={styles.priceRevisionDetailReason}>
                          {orderDetails.price_revision_reason}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.priceRevisionActions}>
                    <TouchableOpacity style={styles.approvePriceButton}>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                      <Text style={styles.approvePriceText}>Approve Payment</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.rejectPriceButton}>
                      <Ionicons name="close-circle-outline" size={20} color="#ffffff" />
                      <Text style={styles.rejectPriceText}>Decline Payment</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

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
            {/* Order Created */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#007AFF' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Order Created</Text>
                <Text style={styles.timelineDate}>
                  {orderDate ? formatDate(orderDate) : 'N/A'}
                </Text>
              </View>
            </View>
            
            {/* Order Accepted (if status is accepted or later) */}
            {(orderDetails.status === 'accepted' || orderDetails.status === 'in_progress' || orderDetails.status === 'completed') && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: '#4CAF50' }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Order Accepted</Text>
                  <Text style={styles.timelineDate}>
                    Creator accepted the order
                  </Text>
                </View>
              </View>
            )}
            
            {/* Deliverables Due (if order is accepted and has delivery time) */}
            {(orderDetails.status === 'accepted' || orderDetails.status === 'in_progress') && orderDetails.delivery_time && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: '#FF9500' }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Deliverables Due for Review</Text>
                  <Text style={styles.timelineDate}>
                    {(() => {
                      if (!orderDate) return 'N/A';
                      
                      // Calculate submission deadline: delivery_time - 1 day (24 hours before delivery)
                      const submissionDeadline = new Date(orderDate);
                      submissionDeadline.setDate(submissionDeadline.getDate() + orderDetails.delivery_time - 1);
                      
                      return formatDate(submissionDeadline.toISOString());
                    })()}
                  </Text>
                  <Text style={[styles.timelineDate, { color: '#FF9500', fontSize: 12, marginTop: 2, fontWeight: '600' }]}>
                    24 hours before delivery deadline
                  </Text>
                </View>
              </View>
            )}
            
            {/* Expected Delivery */}
            {orderDetails.delivery_time && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, orderDetails.status === 'completed' ? { backgroundColor: '#4CAF50' } : { backgroundColor: '#20536d' }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    {orderDetails.status === 'completed' ? 'Delivered' : 'Expected Delivery'}
                  </Text>
                  <Text style={styles.timelineDate}>
                    {orderDate ? formatDate(new Date(new Date(orderDate).getTime() + orderDetails.delivery_time * 24 * 60 * 60 * 1000).toISOString()) : 'N/A'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Contract Terms */}
        {orderDetails.collaboration?.contract_terms && (
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
        {orderDetails.package?.deliverables && orderDetails.package.deliverables.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deliverables</Text>
            <View style={styles.deliverablesCard}>
              {orderDetails.package?.deliverables?.map((deliverable: any, index: number) => (
                <View key={index} style={styles.deliverableItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#f37135" />
                  <Text style={styles.deliverableText}>{deliverable}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
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
    color: '#ffffff',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  updateBoardCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  updateBoardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  updateInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  updateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#fff',
    marginRight: 8,
    minHeight: 80,
  },
  sendUpdateButton: {
    backgroundColor: '#20536d',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendUpdateButtonDisabled: {
    opacity: 0.7,
  },
  cartFormDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
    paddingTop: 16,
  },
  cartFormTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  cartFormItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cartFormText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  packageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  deliverablesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  waitingApprovalContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  waitingApprovalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#20536d',
    marginTop: 16,
    textAlign: 'center',
  },
  waitingApprovalDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  approvalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '45%',
    justifyContent: 'center',
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '45%',
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  updatesContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
  },
  updatesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  updatesList: {
    maxHeight: 200, // Limit height for scrollable updates
  },
  updateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  updateSender: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  updateDate: {
    fontSize: 10,
    color: '#999',
  },
  updateContent: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  referencesPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
  },
  referencesPreviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  referencesScroll: {
    // Add any specific styles for the ScrollView if needed
  },
  referenceItem: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 15,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 80,
  },
  referenceFileName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  referenceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
  },
  referenceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Deliverable Upload Styles
  deliverableUploadArea: {
    borderWidth: 2,
    borderColor: '#20536d',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    paddingVertical: 32,
    marginVertical: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#20536d',
    marginTop: 8,
  },
  uploadSubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  submitReviewButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitReviewText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Brand Review Styles
  deliverablesReviewSection: {
    marginVertical: 16,
  },
  deliverablesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  deliverablePlaceholder: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    paddingVertical: 24,
  },
  deliverablePlaceholderText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  brandReviewActions: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  approveDeliverableButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  approveDeliverableText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  requestRevisionButton: {
    flex: 1,
    backgroundColor: '#f37135',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  requestRevisionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  revisionCommentsSection: {
    marginTop: 8,
  },
  revisionCommentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  revisionCommentsInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // Price Revision Styles
  revisionRequestSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  revisionRequestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  revisionRequestDescription: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 12,
  },
  priceRevisionButton: {
    backgroundColor: '#20536d',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  priceRevisionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Uploaded Files Styles
  uploadedFilesContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    padding: 12,
  },
  uploadedFilesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  uploadedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  removeFileButton: {
    padding: 4,
  },
  submitReviewButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  // Price Revision Enhanced Styles
  priceRevisionContainer: {
    marginTop: 12,
  },
  priceRevisionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE69C',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  priceRevisionButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  priceRevisionUsedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  priceRevisionUsedText: {
    fontSize: 14,
    color: '#2E7D2E',
    marginLeft: 8,
    flex: 1,
  },
  // Brand Price Revision Review Styles
  priceRevisionRequestSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  priceRevisionRequestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 8,
  },
  priceRevisionRequestDescription: {
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
    marginBottom: 12,
  },
  priceRevisionDetailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priceRevisionDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priceRevisionDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    width: 120,
  },
  priceRevisionDetailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    flex: 1,
  },
  priceRevisionDetailReason: {
    fontSize: 14,
    color: '#1A1A1A',
    flex: 1,
    lineHeight: 20,
  },
  priceRevisionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approvePriceButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  approvePriceText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  rejectPriceButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rejectPriceText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default OrderDetailsScreen; 
