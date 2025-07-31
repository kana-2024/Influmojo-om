import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CartService, { CartItem, CartSummary } from '../../services/cartService';
import { ordersAPI } from '../../services/apiService';

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToProfile?: () => void;
  // Legacy props for backward compatibility
  items?: any[];
  onRemoveItem?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onCheckout?: () => void;
}

const CartModal: React.FC<CartModalProps> = ({
  visible,
  onClose,
  onNavigateToProfile,
  items,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout,
}) => {
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    totalItems: 0,
    totalPrice: 0,
    items: [],
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [lastCheckoutTime, setLastCheckoutTime] = useState(0);

  useEffect(() => {
    // If using legacy items prop, use that instead of CartService
    if (items && items.length > 0) {
      const legacySummary: CartSummary = {
        totalItems: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
        totalPrice: items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0),
        items: items.map(item => ({
          id: item.id,
          creatorId: item.creatorId || '',
          creatorName: item.creatorName || '',
          creatorImage: item.creatorImage,
          packageId: item.packageId || '',
          packageName: item.packageName || '',
          packageDescription: item.packageDescription || '',
          packagePrice: item.price || 0,
          packageDuration: item.duration || '',
          platform: item.platform || '',
          quantity: item.quantity || 1,
          addedAt: new Date()
        }))
      };
      setCartSummary(legacySummary);
    } else {
      // Subscribe to cart changes
      const unsubscribe = CartService.subscribe((summary) => {
        setCartSummary(summary);
      });

      // Get initial cart state
      setCartSummary(CartService.getCartSummary());

      return unsubscribe;
    }
  }, [items]);

  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            if (onRemoveItem) {
              onRemoveItem(itemId);
            } else {
              CartService.removeFromCart(itemId);
            }
          }
        },
      ]
    );
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(itemId, quantity);
    } else {
      CartService.updateQuantity(itemId, quantity);
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear your entire cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => CartService.clearCart()
        },
      ]
    );
  };

  const handleCheckout = async () => {
    // If using legacy checkout callback, use that instead
    if (onCheckout) {
      onCheckout();
      return;
    }
    // Prevent multiple rapid clicks
    const now = Date.now();
    if (checkoutLoading || (now - lastCheckoutTime < 2000)) {
      console.log('🔄 Checkout blocked: Too soon after last attempt or already loading');
      return;
    }

    if (cartSummary.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }

    // Check if user has completed profile setup (for brand users)
    try {
      const { authAPI } = await import('../../services/apiService');
      const profile = await authAPI.getUserProfile();
      const userType = profile.user?.user_type || 'creator';
      
      if (userType === 'brand') {
        // For brand users, check if they have a brand profile
        const { profileAPI } = await import('../../services/apiService');
        try {
          await profileAPI.getBrandProfile();
        } catch (profileError) {
          if (profileError.message?.includes('not found') || profileError.message?.includes('404')) {
            Alert.alert(
              'Profile Setup Required',
              'Please complete your brand profile setup before checkout. You need to provide your company information and preferences.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Complete Profile', 
                  onPress: () => {
                    onClose();
                    if (onNavigateToProfile) {
                      onNavigateToProfile();
                    }
                  }
                }
              ]
            );
            return;
          }
        }
      }
    } catch (error) {
      console.error('Profile check error:', error);
      // Continue with checkout if profile check fails
    }

    setLastCheckoutTime(now);
    setCheckoutLoading(true);

    Alert.alert(
      'Confirm Checkout',
      `Are you sure you want to checkout ${cartSummary.totalItems} items for ₹${cartSummary.totalPrice.toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setCheckoutLoading(false) },
        {
          text: 'Checkout',
          onPress: async () => {
            try {
              // Prepare cart items for checkout
              const cartItems = cartSummary.items.map(item => ({
                packageId: item.packageId,
                creatorId: item.creatorId,
                quantity: item.quantity
              }));

              console.log('🔄 Starting checkout process...');
              console.log('📦 Cart items:', cartItems);
              console.log('💰 Total amount:', cartSummary.totalPrice);

              // Call checkout API
              const response = await ordersAPI.checkoutOrders(cartItems);
              
              console.log('✅ Checkout response:', response);

              if (response.success) {
                Alert.alert(
                  'Checkout Successful!',
                  `Your order has been placed successfully. You can view your orders in the Orders tab.`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Clear cart after successful checkout
                        CartService.clearCart();
                        onClose();
                      }
                    }
                  ]
                );
              } else {
                // Handle specific error cases
                if (response.message?.includes('already exists')) {
                  Alert.alert(
                    'Order Already Exists', 
                    'An order for this package already exists. Please check your orders tab.',
                    [
                      { text: 'View Orders', onPress: () => {
                        // Navigate to orders screen
                        onClose();
                        // You might want to add navigation logic here
                      }},
                      { text: 'OK', style: 'cancel' }
                    ]
                  );
                } else {
                  Alert.alert('Checkout Failed', response.message || 'Failed to process checkout. Please try again.');
                }
              }
            } catch (error) {
              console.error('Checkout error:', error);
              let errorMessage = 'An error occurred during checkout. Please try again.';
              
              // Provide more specific error messages
              if (error.message?.includes('401')) {
                errorMessage = 'Authentication failed. Please log in again.';
              } else if (error.message?.includes('403')) {
                errorMessage = 'Only brands can checkout orders.';
              } else if (error.message?.includes('404')) {
                errorMessage = 'Package not found or inactive.';
              } else if (error.message?.includes('409')) {
                errorMessage = 'An order for this package already exists.';
              } else if (error.message?.includes('500')) {
                errorMessage = 'Server error. Please try again later.';
              } else if (error.message?.includes('Network')) {
                errorMessage = 'Network error. Please check your connection.';
              } else if (error.message?.includes('Brand profile not found')) {
                errorMessage = 'Please complete your brand profile setup before checkout.';
              }
              
              Alert.alert('Checkout Error', errorMessage);
            } finally {
              setCheckoutLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  const groupItemsByCreator = (items: CartItem[]) => {
    const grouped: { [creatorId: string]: CartItem[] } = {};
    items.forEach(item => {
      if (!grouped[item.creatorId]) {
        grouped[item.creatorId] = [];
      }
      grouped[item.creatorId].push(item);
    });
    return grouped;
  };

  if (!visible) {
    return null;
  }

  const groupedItems = groupItemsByCreator(cartSummary.items);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.cartSheet}>
        {/* Header */}
        <View style={styles.cartHeader}>
          <Text style={styles.cartTitle}>Shopping Cart</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.cartContent} showsVerticalScrollIndicator={false}>
          {cartSummary.items.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <Text style={styles.emptyCartSubtext}>Add some packages to get started</Text>
            </View>
          ) : (
            <>
              {/* Cart Items Grouped by Creator */}
              {Object.entries(groupedItems).map(([creatorId, items]) => {
                const firstItem = items[0];
                return (
                  <View key={creatorId} style={styles.creatorGroup}>
                    {/* Creator Header */}
                    <View style={styles.creatorHeader}>
                      <View style={styles.creatorInfo}>
                        {firstItem.creatorImage ? (
                          <Image 
                            source={{ uri: firstItem.creatorImage }} 
                            style={styles.creatorImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.creatorImagePlaceholder}>
                            <Text style={styles.creatorInitial}>
                              {firstItem.creatorName.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <View>
                          <Text style={styles.creatorName}>{firstItem.creatorName}</Text>
                          <Text style={styles.creatorPackages}>{items.length} package{items.length > 1 ? 's' : ''}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.clearCreatorButton}
                        onPress={() => {
                          Alert.alert(
                            'Remove Creator',
                            `Remove all packages from ${firstItem.creatorName}?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'Remove', 
                                style: 'destructive',
                                onPress: () => CartService.clearCreatorItems(creatorId)
                              },
                            ]
                          );
                        }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    {/* Creator's Packages */}
                    {items.map((item) => (
                      <View key={item.id} style={styles.cartItem}>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName}>{item.packageName}</Text>
                          <Text style={styles.itemDescription}>{item.packageDescription}</Text>
                          <View style={styles.itemDetails}>
                            <Text style={styles.itemPlatform}>{item.platform}</Text>
                            <Text style={styles.itemDuration}>{item.packageDuration}</Text>
                          </View>
                          <Text style={styles.itemPrice}>{formatPrice(item.packagePrice)}</Text>
                        </View>
                        <View style={styles.itemActions}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Ionicons name="remove" size={16} color="#FD5D27" />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{item.quantity}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Ionicons name="add" size={16} color="#FD5D27" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveItem(item.id)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        {/* Footer */}
        {cartSummary.items.length > 0 && (
          <View style={styles.cartFooter}>
            <View style={styles.cartSummary}>
              <Text style={styles.summaryText}>Total ({cartSummary.totalItems} items):</Text>
              <Text style={styles.totalPrice}>{formatPrice(cartSummary.totalPrice)}</Text>
            </View>
            <View style={styles.cartActions}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearCart}>
                <Text style={styles.clearButtonText}>Clear Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.checkoutButton, checkoutLoading && { opacity: 0.7 }]} 
                onPress={handleCheckout}
                disabled={checkoutLoading}
              >
                <Text style={styles.checkoutButtonText}>
                  {checkoutLoading ? 'Processing...' : 'Checkout'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  cartSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f4e8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    maxHeight: '80%',
    zIndex: 1000,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  cartContent: {
    flex: 1,
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  creatorGroup: {
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  creatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  creatorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  creatorImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FD5D27',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  creatorInitial: {
    color: '#f8f4e8',
    fontSize: 16,
    fontWeight: '600',
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  creatorPackages: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  clearCreatorButton: {
    padding: 8,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  itemPlatform: {
    fontSize: 12,
    color: '#FD5D27',
    backgroundColor: '#FEF3F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FD5D27',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FD5D27',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f4e8',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f4e8',
  },
  cartFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    marginTop: 16,
  },
  cartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FD5D27',
  },
  cartActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FD5D27',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FD5D27',
    fontWeight: '600',
    fontSize: 16,
  },
  checkoutButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FD5D27',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#f8f4e8',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CartModal; 
