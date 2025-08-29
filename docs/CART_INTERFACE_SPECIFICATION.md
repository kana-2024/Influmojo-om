# 🛒 Unified Cart Interface Specification

## 🎯 **Purpose**
This document ensures that both **webapp** and **mobile** apps use identical cart interfaces and functionality, maintaining consistency across platforms.

## 📱 **Platform Compatibility**
- ✅ **Webapp** (React/Next.js)
- ✅ **Mobile** (React Native)
- ✅ **Backend** (Node.js/Express)

## 🔧 **CartItem Interface (Unified)**

```typescript
export interface CartItem {
  id: string;                    // Unique identifier
  creatorId: string;            // Creator's user ID
  creatorName: string;          // Creator's display name
  creatorImage?: string;        // Creator's profile image URL
  
  packageId: string;            // Package ID from backend
  packageName: string;          // Package title/name
  packageDescription: string;   // Package description
  packagePrice: number;         // Price as number
  packageCurrency: string;      // Currency code (INR, USD, etc.)
  packageDuration: string;      // Delivery duration
  platform: string;             // Social media platform
  
  quantity: number;             // Item quantity
  addedAt: Date;               // When item was added
  
  // Form data fields
  deliveryTime?: number;        // Delivery time in days
  additionalInstructions?: string; // Custom instructions
  references?: string[];        // Reference URLs/files
}
```

## 🔄 **Cart Service Methods (Unified)**

### **Core Methods (Both Platforms)**
```typescript
// Add item to cart
addToCart(item: Omit<CartItem, 'id' | 'addedAt' | 'quantity'>): CartSummary

// Remove item from cart
removeFromCart(itemId: string): CartSummary

// Update item quantity
updateQuantity(itemId: string, quantity: number): CartSummary

// Update item details
updateItem(itemId: string, updates: Partial<CartItem>): CartSummary

// Clear entire cart
clearCart(): CartSummary

// Get cart summary
getCartSummary(): CartSummary

// Check if item exists
isItemInCart(packageId: string, creatorId: string): boolean

// Subscribe to changes
subscribe(listener: (cart: CartSummary) => void): () => void
```

### **Persistence Methods (Both Platforms)**
```typescript
// Sync with backend
syncWithBackend(): Promise<void>

// Load from backend
loadFromBackend(): Promise<void>

// Get cart state
getCartState(): CartItem[]

// Restore cart state
restoreCartState(items: CartItem[]): void
```

## 🗄️ **Backend API Endpoints (Unified)**

### **Cart Routes (`/api/cart`)**
```typescript
GET    /api/cart              // Get user's cart
POST   /api/cart/add          // Add item to cart
PUT    /api/cart/update/:id   // Update cart item
DELETE /api/cart/remove/:id   // Remove item from cart
DELETE /api/cart/clear        // Clear entire cart
POST   /api/cart/sync         // Sync frontend cart
```

### **Request/Response Format**
```typescript
// Add to cart request
{
  "packageId": "123",
  "quantity": 2,
  "deliveryTime": 7,
  "additionalInstructions": "Custom instructions",
  "references": ["url1", "url2"]
}

// Cart response
{
  "success": true,
  "cartItems": [CartItem[]]
}
```

## 🔒 **Authentication (Unified)**

### **JWT Token Format**
```typescript
// Both platforms use identical JWT structure
Authorization: Bearer <jwt_token>

// Token payload structure
{
  userId: string,
  user_type: 'brand' | 'creator' | 'admin',
  email: string,
  iat: number,
  exp: number
}
```

### **Storage Methods**
- **Webapp**: `localStorage.getItem('token')`
- **Mobile**: `AsyncStorage.getItem('authToken')`

## 📊 **Data Flow (Unified)**

### **1. Add to Cart Flow**
```
User clicks "Add to Cart" 
    ↓
Frontend adds to local cart (instant)
    ↓
Backend sync (async, optional)
    ↓
Cart persists across sessions
```

### **2. Cart Persistence Flow**
```
User logs in
    ↓
Frontend loads cart from backend
    ↓
Fallback to local storage if backend fails
    ↓
Cart continues working locally
```

### **3. Checkout Flow**
```
User clicks "Checkout"
    ↓
Frontend sends cart items to /api/orders/checkout
    ↓
Backend creates orders + tickets
    ↓
Frontend clears cart
    ↓
Backend cart also cleared
```

## 🚨 **Critical Consistency Rules**

### **1. Field Names Must Match Exactly**
- ✅ `packageCurrency` (not `currency`)
- ✅ `packagePrice` (not `price`)
- ✅ `packageDuration` (not `duration`)
- ✅ `additionalInstructions` (not `instructions`)

### **2. Data Types Must Match**
- ✅ `packagePrice: number` (not string)
- ✅ `quantity: number` (not string)
- ✅ `deliveryTime: number` (not string)
- ✅ `references: string[]` (not object)

### **3. API Endpoints Must Be Identical**
- ✅ Same URL structure
- ✅ Same request/response format
- ✅ Same validation rules
- ✅ Same error handling

## 🧪 **Testing Checklist**

### **Interface Consistency**
- [ ] CartItem interface identical on both platforms
- [ ] All required fields present
- [ ] Data types match exactly
- [ ] Optional fields handled consistently

### **Functionality Consistency**
- [ ] Add to cart works identically
- [ ] Remove from cart works identically
- [ ] Update cart works identically
- [ ] Cart persistence works identically

### **API Consistency**
- [ ] Same endpoints accessible from both platforms
- [ ] Same request/response format
- [ ] Same error handling
- [ ] Same validation rules

## 🔧 **Implementation Notes**

### **Webapp (React/Next.js)**
- Uses `localStorage` for persistence
- Imports from `@/services/cartService`
- Syncs with backend on login/logout

### **Mobile (React Native)**
- Uses `AsyncStorage` for persistence
- Imports from `../services/cartService`
- Syncs with backend on login/logout

### **Backend (Node.js/Express)**
- Provides unified API endpoints
- Handles both platforms identically
- No platform-specific logic

## 📚 **Maintenance Guidelines**

### **When Adding New Fields**
1. Update `CartItem` interface on **both** platforms
2. Update backend transformation logic
3. Update frontend cart service methods
4. Test on both platforms

### **When Changing API Endpoints**
1. Update backend routes
2. Update **both** frontend services
3. Ensure request/response format matches
4. Test on both platforms

### **When Adding New Features**
1. Implement on backend first
2. Implement on **both** frontend platforms
3. Maintain identical functionality
4. Test cross-platform compatibility

---

## 🎯 **Summary**

This specification ensures that:
- ✅ **Webapp and mobile have identical cart functionality**
- ✅ **Both platforms work with the same backend API**
- ✅ **Data structures are consistent across platforms**
- ✅ **User experience is identical regardless of platform**
- ✅ **Maintenance and updates are synchronized**

**Remember**: Any changes to cart functionality must be implemented on **both platforms** to maintain consistency!
