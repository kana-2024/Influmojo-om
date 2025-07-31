# Orders Feature Implementation

## Overview

This document describes the implementation of the Orders feature for the Influ Mojo mobile app. The feature allows both brands and creators to view their ordered packages with conditional details based on user type.

## Features

### For Creators
- View packages they've ordered from brands
- See brand information (company name, location, industry, website)
- Track order status and timeline
- View package details and deliverables

### For Brands
- View packages ordered from creators
- See creator information (name, location, bio, email)
- Track order status and timeline
- View package details and deliverables

## Implementation Details

### Frontend Components

#### 1. OrdersScreen (`mobile/screens/OrdersScreen.tsx`)
- Main orders listing page
- Shows all orders for the authenticated user
- Conditional rendering based on user type (creator/brand)
- Pull-to-refresh functionality
- Empty state handling
- Navigation to order details

#### 2. OrderDetailsScreen (`mobile/screens/OrderDetailsScreen.tsx`)
- Detailed view of a specific order
- Shows comprehensive order information
- Conditional details based on user type
- Timeline and contract terms display
- Deliverables list

### Backend API

#### 1. Orders Routes (`backend/src/routes/orders.js`)
- `GET /api/orders` - Get all orders for authenticated user
- `GET /api/orders/:orderId` - Get specific order details

#### 2. Database Integration
- Uses existing `Collaboration` and `Package` models
- Filters orders based on user type and relationships
- Includes related data (brand/creator profiles, campaigns)

### Navigation Integration

#### 1. Bottom Navigation Bar
- Orders tab added for creators
- Proper navigation handling for orders screen

#### 2. App Navigation Stack
- OrdersScreen and OrderDetailsScreen added to navigation
- Proper screen registration and routing

## API Endpoints

### GET /api/orders
**Description:** Get all orders for the authenticated user

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "1",
      "package": {
        "id": "1",
        "title": "Package Title",
        "description": "Package description",
        "price": 100.00,
        "deliverables": ["deliverable1", "deliverable2"]
      },
      "collaboration": {
        "id": "1",
        "status": "confirmed",
        "started_at": "2024-01-01T00:00:00Z",
        "deadline": "2024-01-15T00:00:00Z",
        "brand": {
          "company_name": "Brand Name",
          "location_city": "City",
          "location_state": "State"
        }
      },
      "created_at": "2024-01-01T00:00:00Z",
      "status": "confirmed"
    }
  ]
}
```

### GET /api/orders/:orderId
**Description:** Get specific order details

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "1",
    "package": {
      "id": "1",
      "title": "Package Title",
      "description": "Package description",
      "price": 100.00,
      "deliverables": ["deliverable1", "deliverable2"],
      "type": "predefined"
    },
    "collaboration": {
      "id": "1",
      "status": "confirmed",
      "started_at": "2024-01-01T00:00:00Z",
      "deadline": "2024-01-15T00:00:00Z",
      "agreed_rate": 100.00,
      "currency": "USD",
      "contract_terms": "Contract terms here",
      "brand": {
        "company_name": "Brand Name",
        "location_city": "City",
        "location_state": "State",
        "industry": "Technology",
        "website_url": "https://example.com"
      }
    },
    "created_at": "2024-01-01T00:00:00Z",
    "status": "confirmed"
  }
}
```

## Conditional Details

### For Creators (viewing brand information)
- Company name
- Location (city, state)
- Industry
- Website URL

### For Brands (viewing creator information)
- Creator name
- Location (city, state)
- Bio
- Email

## Status Colors

The app uses different colors for order statuses:
- **Pending**: Orange (#FF9800)
- **Confirmed**: Green (#4CAF50)
- **In Progress**: Blue (#2196F3)
- **Completed**: Blue (#2196F3)
- **Cancelled**: Red (#F44336)
- **Refunded**: Gray (#757575)
- **Default**: Gray (#757575)

## Testing

A test script is provided (`test-orders-api.js`) to verify the API endpoints work correctly. To use it:

1. Install dependencies: `npm install node-fetch`
2. Update the `TEST_TOKEN` variable with a valid authentication token
3. Run: `node test-orders-api.js`

## File Structure

```
mobile/
├── screens/
│   ├── OrdersScreen.tsx          # Main orders listing
│   └── OrderDetailsScreen.tsx    # Order details view
├── components/navigation/
│   └── BottomNavBar.tsx          # Updated with orders tab
└── App.tsx                       # Updated navigation stack

backend/
├── src/
│   ├── routes/
│   │   └── orders.js             # Orders API endpoints
│   └── server.js                 # Updated with orders routes
└── prisma/
    └── schema.prisma             # Existing database schema
```

## Usage

1. **For Creators:**
   - Navigate to the Orders tab in the bottom navigation
   - View all packages ordered from brands
   - Tap on an order to see detailed information
   - See brand details and order timeline

2. **For Brands:**
   - Navigate to the Orders tab in the bottom navigation
   - View all packages ordered from creators
   - Tap on an order to see detailed information
   - See creator details and order timeline

## Future Enhancements

- Order status updates
- Order cancellation functionality
- Payment integration
- Order notifications
- Order search and filtering
- Order history and analytics 