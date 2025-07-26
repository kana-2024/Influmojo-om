import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  creator: string;
  platform: string;
}

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
  items?: CartItem[];
  onRemoveItem?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onCheckout?: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ 
  visible, 
  onClose, 
  items = [], 
  onRemoveItem, 
  onUpdateQuantity, 
  onCheckout 
}) => {
  const [localItems, setLocalItems] = useState<CartItem[]>(items);

  const handleRemoveItem = (itemId: string) => {
    setLocalItems(prev => prev.filter(item => item.id !== itemId));
    onRemoveItem?.(itemId);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    setLocalItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
    onUpdateQuantity?.(itemId, newQuantity);
  };

  const calculateTotal = () => {
    return localItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Cart</Text>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color="#1A1D1F" />
          </TouchableOpacity>
        </View>

        {/* Cart Items */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {localItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={64} color="#B0B0B0" />
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptyDesc}>Add some creator packages to get started</Text>
            </View>
          ) : (
            <>
              {localItems.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCreator}>{item.creator} • {item.platform}</Text>
                    <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                  </View>
                  
                  <View style={styles.itemActions}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity 
                        style={styles.quantityBtn}
                        onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={16} color="#1A1D1F" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity 
                        style={styles.quantityBtn}
                        onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={16} color="#1A1D1F" />
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.removeBtn}
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF6B2C" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        {/* Footer with Total and Checkout */}
        {localItems.length > 0 && (
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatPrice(calculateTotal())}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.checkoutBtn}
              onPress={onCheckout}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1D1F',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D1F',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1F',
    marginBottom: 4,
  },
  itemCreator: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B2C',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 12,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1F',
    paddingHorizontal: 12,
    minWidth: 30,
    textAlign: 'center',
  },
  removeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D1F',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B2C',
  },
  checkoutBtn: {
    backgroundColor: '#FF6B2C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default CartModal; 