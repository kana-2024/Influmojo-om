export interface CartItem {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorImage?: string;
  packageId: string;
  packageName: string;
  packageDescription: string;
  packagePrice: number;
  packageDuration: string;
  platform: string;
  quantity: number;
  addedAt: Date;
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
  addToCart(item: Omit<CartItem, 'id' | 'addedAt' | 'quantity'>): CartSummary {
    const existingItemIndex = this.items.findIndex(
      cartItem => cartItem.packageId === item.packageId && cartItem.creatorId === item.creatorId
    );

    if (existingItemIndex >= 0) {
      // Item already exists, increase quantity
      this.items[existingItemIndex].quantity += 1;
    } else {
      // Add new item
      const newItem: CartItem = {
        ...item,
        id: `${item.creatorId}-${item.packageId}-${Date.now()}`,
        quantity: 1,
        addedAt: new Date(),
      };
      this.items.push(newItem);
    }

    const summary = this.getCartSummary();
    this.notifyListeners(summary);
    return summary;
  }

  // Add multiple packages from same creator
  addMultiplePackages(creatorId: string, creatorName: string, creatorImage: string, packages: Array<{
    packageId: string;
    packageName: string;
    packageDescription: string;
    packagePrice: number;
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
    return summary;
  }

  // Clear entire cart
  clearCart(): CartSummary {
    this.items = [];
    const summary = this.getCartSummary();
    this.notifyListeners(summary);
    return summary;
  }

  // Clear items from specific creator
  clearCreatorItems(creatorId: string): CartSummary {
    this.items = this.items.filter(item => item.creatorId !== creatorId);
    const summary = this.getCartSummary();
    this.notifyListeners(summary);
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
}

export default CartService.getInstance(); 