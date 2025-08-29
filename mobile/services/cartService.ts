export interface CartItem {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorImage?: string;
  packageId: string;
  packageName: string;
  packageDescription: string;
  packagePrice: number;
  packageCurrency: string; // Added to match webapp interface
  packageDuration: string;
  platform: string;
  quantity: number;
  addedAt: Date;
  // Form data fields
  deliveryTime?: number;
  additionalInstructions?: string;
  references?: string[];
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  items: CartItem[];
}

class CartService {
  private static instance: CartService;
  private items: CartItem[] = [];
  private listeners: ((cart: CartSummary) => void)[] = [];

  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  // Add item to cart
  addToCart(item: Omit<CartItem, 'id' | 'addedAt' | 'quantity'> & {
    deliveryTime?: number;
    additionalInstructions?: string;
    references?: string[];
  }): CartSummary {
    const existingItemIndex = this.items.findIndex(
      cartItem => cartItem.packageId === item.packageId && cartItem.creatorId === item.creatorId
    );

    if (existingItemIndex >= 0) {
      // Item already exists, increase quantity
      this.items[existingItemIndex].quantity += 1;
      // Update form data if provided
      if (item.deliveryTime !== undefined) {
        this.items[existingItemIndex].deliveryTime = item.deliveryTime;
      }
      if (item.additionalInstructions !== undefined) {
        this.items[existingItemIndex].additionalInstructions = item.additionalInstructions;
      }
      if (item.references !== undefined) {
        this.items[existingItemIndex].references = item.references;
      }
    } else {
      // Add new item
      const newItem: CartItem = {
        ...item,
        id: `${item.creatorId}-${item.packageId}-${Date.now()}`,
        quantity: 1,
        addedAt: new Date(),
        deliveryTime: item.deliveryTime,
        additionalInstructions: item.additionalInstructions,
        references: item.references || [],
      };
      this.items.push(newItem);
    }

    const summary = this.getCartSummary();
    this.notifyListeners(summary);
    this.saveToAsyncStorage(); // Save to AsyncStorage
    return summary;
  }

  // Add multiple packages from same creator
  addMultiplePackages(creatorId: string, creatorName: string, creatorImage: string, packages: Array<{
    packageId: string;
    packageName: string;
    packageDescription: string;
    packagePrice: number;
    packageCurrency: string; // Added to match webapp interface
    packageDuration: string;
    platform: string;
  }>): CartSummary {
    packages.forEach(pkg => {
      this.addToCart({
        creatorId,
        creatorName,
        creatorImage,
        ...pkg,
      });
    });

    return this.getCartSummary();
  }

  // Remove item from cart
  removeFromCart(itemId: string): CartSummary {
    this.items = this.items.filter(item => item.id !== itemId);
    const summary = this.getCartSummary();
    this.notifyListeners(summary);
    this.saveToAsyncStorage(); // Save to AsyncStorage
    return summary;
  }

  // Update item quantity
  updateQuantity(itemId: string, quantity: number): CartSummary {
    const itemIndex = this.items.findIndex(item => item.id === itemId);
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        this.items.splice(itemIndex, 1);
      } else {
        this.items[itemIndex].quantity = quantity;
      }
    }
    const summary = this.getCartSummary();
    this.notifyListeners(summary);
    this.saveToAsyncStorage(); // Save to AsyncStorage
    return summary;
  }

  // Update cart item details (delivery time, instructions, references)
  updateItem(itemId: string, updates: {
    deliveryTime?: number;
    additionalInstructions?: string;
    references?: string[];
  }): CartSummary {
    const itemIndex = this.items.findIndex(item => item.id === itemId);
    if (itemIndex >= 0) {
      if (updates.deliveryTime !== undefined) {
        this.items[itemIndex].deliveryTime = updates.deliveryTime;
      }
      if (updates.additionalInstructions !== undefined) {
        this.items[itemIndex].additionalInstructions = updates.additionalInstructions;
      }
      if (updates.references !== undefined) {
        this.items[itemIndex].references = updates.references;
      }
      const summary = this.getCartSummary();
      this.notifyListeners(summary);
      this.saveToAsyncStorage(); // Save to AsyncStorage
      return summary;
    }
    return this.getCartSummary();
  }

  // Clear entire cart
  clearCart(): CartSummary {
    this.items = [];
    const summary = this.getCartSummary();
    this.notifyListeners(summary);
    this.saveToAsyncStorage(); // Save to AsyncStorage
    return summary;
  }

  // Clear items from specific creator
  clearCreatorItems(creatorId: string): CartSummary {
    this.items = this.items.filter(item => item.creatorId !== creatorId);
    const summary = this.getCartSummary();
    this.notifyListeners(summary);
    this.saveToAsyncStorage(); // Save to AsyncStorage
    return summary;
  }

  // Get cart summary
  getCartSummary(): CartSummary {
    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = this.items.reduce((sum, item) => sum + (item.packagePrice * item.quantity), 0);
    
    return {
      totalItems,
      totalPrice,
      items: [...this.items],
    };
  }

  // Get items by creator
  getItemsByCreator(creatorId: string): CartItem[] {
    return this.items.filter(item => item.creatorId === creatorId);
  }

  // Check if item is in cart
  isItemInCart(packageId: string, creatorId: string): boolean {
    return this.items.some(item => item.packageId === packageId && item.creatorId === creatorId);
  }

  // Get item quantity
  getItemQuantity(packageId: string, creatorId: string): number {
    const item = this.items.find(item => item.packageId === packageId && item.creatorId === creatorId);
    return item ? item.quantity : 0;
  }

  // Subscribe to cart changes
  subscribe(listener: (cart: CartSummary) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notifyListeners(cart: CartSummary): void {
    this.listeners.forEach(listener => listener(cart));
  }

  // Get cart state (for persistence)
  getCartState(): CartItem[] {
    return [...this.items];
  }

  // Restore cart state (for persistence)
  restoreCartState(items: CartItem[]): void {
    this.items = items.map(item => ({
      ...item,
      addedAt: new Date(item.addedAt),
    }));
    const summary = this.getCartSummary();
    this.notifyListeners(summary);
  }

  // Sync cart with backend (for persistence across sessions)
  async syncWithBackend(): Promise<void> {
    try {
      const cartItems = this.getCartState();
      
      // Call backend sync endpoint
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ cartItems })
      });

      if (!response.ok) {
        throw new Error(`Failed to sync cart: ${response.statusText}`);
      }

      console.log('✅ Cart synced with backend successfully');
    } catch (error) {
      console.error('❌ Failed to sync cart with backend:', error);
      // Don't throw - cart still works locally
    }
  }

  // Load cart from backend (for login)
  async loadFromBackend(): Promise<void> {
    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load cart: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.cartItems) {
        // Restore cart state from backend
        this.restoreCartState(data.cartItems);
        console.log('✅ Cart loaded from backend successfully');
      }
    } catch (error) {
      console.error('❌ Failed to load cart from backend:', error);
      console.log('🔄 Cart will continue with local data');
    }
  }

  // Get auth token from AsyncStorage
  private async getAuthToken(): Promise<string | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  // Save cart to AsyncStorage (mobile equivalent of localStorage)
  private async saveToAsyncStorage(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('influmojo_cart', JSON.stringify(this.items));
    } catch (error) {
      console.error('Failed to save cart to AsyncStorage:', error);
    }
  }

  // Load cart from AsyncStorage (mobile equivalent of localStorage)
  async loadFromAsyncStorage(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const savedCart = await AsyncStorage.getItem('influmojo_cart');
      if (savedCart) {
        const items = JSON.parse(savedCart);
        this.restoreCartState(items);
      }
    } catch (error) {
      console.error('Failed to load cart from AsyncStorage:', error);
    }
  }

  // Initialize cart service with AsyncStorage
  async init(): Promise<void> {
    await this.loadFromAsyncStorage();
  }
}

export default CartService.getInstance(); 