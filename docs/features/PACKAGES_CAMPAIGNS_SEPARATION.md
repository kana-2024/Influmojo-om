# Packages and Campaigns Separation

## Overview

The database schema has been updated to properly separate **Packages** and **Campaigns** as distinct entities with different purposes and workflows.

## Key Changes

### 1. Package Model (Updated)
- **Purpose**: Standalone offerings created by creators that brands can purchase directly
- **Key Fields**:
  - `creator_id`: The creator who created this package
  - `title`, `description`, `price`, `currency`: Package details
  - `deliverables`: JSON array of what's included
  - `is_active`: Whether the package is available for purchase
  - `type`: Package type (predefined/custom)

### 2. Order Model (New)
- **Purpose**: Represents a purchase of a package by a brand
- **Key Fields**:
  - `package_id`: Reference to the purchased package
  - `brand_id`: The brand that purchased the package
  - `creator_id`: The creator who created the package
  - `quantity`, `total_amount`, `currency`: Order details
  - `status`: Order status (pending, confirmed, in_progress, completed, etc.)

### 3. Campaign Model (Unchanged)
- **Purpose**: Brand-initiated projects that creators can apply to
- **Workflow**: Brand creates campaign → Creators apply → Brand selects creators → Collaboration begins

## Workflows

### Package Workflow
1. **Creator creates a package** (`POST /api/packages`)
   - Sets title, description, price, deliverables
   - Package becomes available for purchase

2. **Brand browses packages** (`GET /api/packages`)
   - Can filter by creator, price range, etc.
   - Views package details and creator information

3. **Brand purchases package** (`POST /api/orders/checkout`)
   - Creates an order for the package
   - Order status starts as 'pending'

4. **Order fulfillment**
   - Creator delivers the package contents
   - Order status progresses through: confirmed → in_progress → completed

### Campaign Workflow
1. **Brand creates a campaign** (`POST /api/profile/create-campaign`)
   - Sets requirements, budget, timeline
   - Campaign becomes available for applications

2. **Creators apply to campaign** (`POST /api/profile/apply-campaign`)
   - Submit proposals with rates and portfolio
   - Application status: pending → accepted/rejected

3. **Collaboration begins**
   - Brand selects creators
   - Collaboration is created
   - Content creation and delivery process

## API Endpoints

### Packages
- `GET /api/packages` - Browse all packages
- `GET /api/packages/:id` - Get package details
- `GET /api/packages/my-packages` - Creator's packages (authenticated)
- `POST /api/packages` - Create package (creators only)
- `PUT /api/packages/:id` - Update package (creator only)
- `DELETE /api/packages/:id` - Delete package (creator only)

### Orders
- `GET /api/orders` - Get user's orders (authenticated)
- `GET /api/orders/:id` - Get order details (authenticated)
- `POST /api/orders/checkout` - Create orders from cart (brands only)

### Campaigns (Existing)
- `GET /api/profile/campaigns` - Get campaigns
- `POST /api/profile/create-campaign` - Create campaign (brands only)
- `POST /api/profile/apply-campaign` - Apply to campaign (creators only)

## Database Relationships

### Packages
```
Package → CreatorProfile (creator_id)
Package → Order[] (orders)
```

### Orders
```
Order → Package (package_id)
Order → BrandProfile (brand_id)
Order → CreatorProfile (creator_id)
Order → Payment[] (payments)
Order → Invoice[] (invoices)
```

### Campaigns (Unchanged)
```
Campaign → BrandProfile (brand_id)
Campaign → CampaignApplication[] (applications)
Campaign → Collaboration[] (collaborations)
```

## Benefits of Separation

1. **Clear Purpose**: Packages are for direct purchases, campaigns are for project-based work
2. **Simplified Workflow**: Package purchases don't require application/selection process
3. **Better Tracking**: Orders provide clear purchase history and status tracking
4. **Flexibility**: Creators can offer both packages and apply to campaigns
5. **Scalability**: Each system can evolve independently

## Migration Notes

- Existing packages tied to collaborations have been migrated to the new structure
- New Order model handles package purchases
- Payment and Invoice models now support both orders and collaborations
- Backward compatibility maintained for existing campaign functionality

## Usage Examples

### Creating a Package (Creator)
```javascript
POST /api/packages
{
  "title": "Instagram Story Package",
  "description": "3 Instagram stories with product placement",
  "price": 500,
  "currency": "USD",
  "deliverables": ["3 Instagram stories", "Product placement", "Hashtag suggestions"],
  "type": "predefined"
}
```

### Purchasing a Package (Brand)
```javascript
POST /api/orders/checkout
{
  "cartItems": [
    {
      "packageId": "123",
      "quantity": 1
    }
  ]
}
```

### Creating a Campaign (Brand)
```javascript
POST /api/profile/create-campaign
{
  "title": "Summer Product Launch",
  "description": "Looking for influencers to promote our new summer collection",
  "campaign_type": "sponsored_post",
  "budget_min": 1000,
  "budget_max": 5000,
  "currency": "USD"
}
``` 