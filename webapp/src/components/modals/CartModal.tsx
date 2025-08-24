'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon, PencilIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import CartService, { CartItem, CartSummary } from '@/services/cartService';
import CartItemEditModal from './CartItemEditModal';
import CheckoutConfirmationModal from './CheckoutConfirmationModal';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile?: () => void;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  onNavigateToProfile,
}) => {
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    totalItems: 0,
    totalPrice: 0,
    items: [],
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [lastCheckoutTime, setLastCheckoutTime] = useState(0);
  const [showCheckoutConfirmation, setShowCheckoutConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Subscribe to cart changes
      const unsubscribe = CartService.subscribe((summary) => {
        setCartSummary(summary);
      });

      // Get initial cart state
      setCartSummary(CartService.getCartSummary());

      return unsubscribe;
    }
  }, [isOpen]);

  const handleRemoveItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      CartService.removeFromCart(itemId);
    }
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    CartService.updateQuantity(itemId, quantity);
  };

  const handleEditItem = (item: CartItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleEditSave = (itemId: string, formData: {
    deliveryTime: number;
    additionalInstructions: string;
    references: string[];
  }) => {
    CartService.updateItem(itemId, formData);
    setShowEditModal(false);
    setEditingItem(null);
    alert('Item updated successfully!');
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      CartService.clearCart();
    }
  };

  const handleCheckout = async () => {
    // Show checkout confirmation first
    setShowCheckoutConfirmation(true);
  };

  const handleConfirmCheckout = async () => {
    // Prevent multiple rapid clicks
    const now = Date.now();
    if (checkoutLoading || (now - lastCheckoutTime < 2000)) {
      console.log('🔄 Checkout blocked: Too soon after last attempt or already loading');
      return;
    }

    if (cartSummary.items.length === 0) {
      alert('Please add items to your cart before checkout.');
      return;
    }

    // Optional: verify profile like mobile before proceeding
    try {
      const { authAPI } = await import('@/services/apiService');
      const profile = await authAPI.getUserProfile();
      const userType = profile?.user?.user_type || 'creator';

      if (userType === 'brand') {
        const { profileAPI } = await import('@/services/apiService');
        try {
          await profileAPI.getBrandProfile();
        } catch (profileError: unknown) {
          const message: string = (profileError as { message?: string })?.message || '';
          if (message.includes('not found') || message.includes('404')) {
            if (confirm('Please complete your brand profile setup before checkout. Go to Profile now?')) {
              onClose();
              if (onNavigateToProfile) onNavigateToProfile();
            }
            return;
          }
        }
      }
    } catch (err) {
      console.error('Profile check error (continuing with checkout):', err);
      // Continue with checkout if profile check fails
    }

            if (confirm(`Are you sure you want to checkout ${cartSummary.totalItems} items for ₹${cartSummary.totalPrice.toLocaleString('en-IN')}?`)) {
      setLastCheckoutTime(now);
      setCheckoutLoading(true);
      
      try {
        // Prepare cart items for checkout
        const cartItems = cartSummary.items.map(item => ({
          packageId: item.packageId,
          creatorId: item.creatorId,
          quantity: item.quantity,
          deliveryTime: item.deliveryTime,
          additionalInstructions: item.additionalInstructions,
          references: item.references
        }));

        console.log('🔄 Starting checkout process...');
        console.log('📦 Cart items:', cartItems);
        console.log('💰 Total amount:', cartSummary.totalPrice);

        // Import ordersAPI dynamically to avoid circular dependencies
        const { ordersAPI } = await import('@/services/apiService');
        
        // Transform cart items to match API format
        const transformedCartItems = cartSummary.items.map(item => ({
          id: item.id,
          package_id: item.packageId,
          creator_id: item.creatorId,
          quantity: item.quantity,
          price: item.packagePrice,
          currency: item.packageCurrency
        }));
        
        // Call real checkout API
        const response = await ordersAPI.checkoutOrders(transformedCartItems);
        
        console.log('✅ Checkout response:', response);

        if (response.success) {
          alert('Checkout Successful! Your order has been placed. You can view it in the Orders tab.');
          CartService.clearCart();
          onClose();
        } else {
          const errMsg = response.message || response.error || 'Failed to process checkout. Please try again.';
          alert(`Checkout Failed: ${errMsg}`);
        }
      } catch (error: unknown) {
        console.error('Checkout error:', error);
        let errorMessage = 'An error occurred during checkout. Please try again.';
        const msg: string = (error as { message?: string })?.message || '';
        if (msg.includes('401')) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (msg.includes('403')) {
          errorMessage = 'Only brands can checkout orders.';
        } else if (msg.includes('404')) {
          errorMessage = 'Package not found or inactive.';
        } else if (msg.includes('409')) {
          errorMessage = 'An order for this package already exists.';
        } else if (msg.includes('No agent users available')) {
          errorMessage = 'No agent users available to assign a support ticket. Please add an agent user on the backend.';
        } else if (msg.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (msg.includes('Network')) {
          errorMessage = 'Network error. Please check your connection.';
        }
        alert(`Checkout Error: ${errorMessage}`);
      } finally {
        setCheckoutLoading(false);
      }
    }
  };

  const formatPrice = (price: number) => {
            return `₹${price.toLocaleString('en-IN')}`;
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

  if (!isOpen) return null;

  const groupedItems = groupItemsByCreator(cartSummary.items);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cartSummary.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500">Add some packages to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items Grouped by Creator */}
                {Object.entries(groupedItems).map(([creatorId, items]) => {
                  const firstItem = items[0];
                  return (
                    <div key={creatorId} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Creator Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-semibold text-sm">
                                {firstItem.creatorName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{firstItem.creatorName}</h4>
                              <p className="text-sm text-gray-500">{items.length} package{items.length > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => CartService.clearCreatorItems(creatorId)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove all packages from this creator"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Creator's Packages */}
                      {items.map((item) => (
                        <div key={item.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 mb-1">{item.packageName}</h5>
                              <p className="text-sm text-gray-600 mb-2">{item.packageDescription}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {item.platform}
                                </span>
                                <span>{item.packageDuration}</span>
                              </div>
                              
                              {/* Form Data Display */}
                              {item.deliveryTime && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                  <span>📅 Delivery: {item.deliveryTime} {item.deliveryTime === 1 ? 'Day' : 'Days'}</span>
                                </div>
                              )}
                              
                              {item.additionalInstructions && (
                                <div className="flex items-start gap-2 text-sm text-gray-500 mb-1">
                                  <span>📝 Instructions: {item.additionalInstructions}</span>
                                </div>
                              )}
                              
                              {item.references && item.references.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                  <span>📎 References: {item.references.length} file{item.references.length > 1 ? 's' : ''}</span>
                                </div>
                              )}
                              
                              <div className="text-lg font-bold text-orange-600">
                                {formatPrice(item.packagePrice)}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 hover:bg-gray-100"
                                >
                                  <MinusIcon className="w-4 h-4 text-gray-600" />
                                </button>
                                <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 hover:bg-gray-100"
                                >
                                  <PlusIcon className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                              
                              {/* Edit Button */}
                              <button
                                onClick={() => handleEditItem(item)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                                title="Edit item details"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              
                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                title="Remove item"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartSummary.items.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold text-gray-900">
                  Total ({cartSummary.totalItems} items): {formatPrice(cartSummary.totalPrice)}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleClearCart}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Clear Cart
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors"
                >
                  {checkoutLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    `Checkout - ₹${cartSummary.totalPrice.toLocaleString('en-IN')}`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <CartItemEditModal
        isOpen={showEditModal}
        onClose={handleEditClose}
        onSave={handleEditSave}
        cartItem={editingItem}
      />

      {/* Checkout Confirmation Modal */}
      <CheckoutConfirmationModal
        isOpen={showCheckoutConfirmation}
        onClose={() => setShowCheckoutConfirmation(false)}
        onConfirm={handleConfirmCheckout}
        cartSummary={cartSummary}
        loading={checkoutLoading}
      />
    </div>
  );
};

export default CartModal;
