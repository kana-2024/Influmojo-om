# Influmojo Three-Page Structure

This document outlines the new three-page structure for the Influmojo webapp, designed to provide separate experiences for brands and creators while maintaining a unified landing page.

## Page Structure

### 1. Landing Page (`/landing`)
- **Purpose**: Main entry point for all users
- **Content**: 
  - Hero section explaining the platform
  - How it works section
  - Features for both brands and creators
  - Success stories and testimonials
  - Call-to-action buttons for both user types
- **Navigation**: Uses `MainNavigation` component
- **Target Audience**: New visitors, undecided users

### 2. Brand Home (`/brand-home`)
- **Purpose**: Dedicated page for brand discovery and creator browsing
- **Content**:
  - Creator discovery interface
  - Category browsing (Fashion, Business, Tech, etc.)
  - Platform-specific creator sections (YouTube, Instagram, Facebook)
  - Search and filter functionality
  - Call-to-action for brand signup
- **Navigation**: Uses `MainNavigation` component
- **Target Audience**: Brands looking for creators

### 3. Creator Home (`/creator-home`)
- **Purpose**: Dedicated page for creators to learn about opportunities
- **Content**:
  - How to get started as a creator
  - Featured creators and success stories
  - Trending campaigns and opportunities
  - Benefits of joining the platform
  - Call-to-action for creator signup
- **Navigation**: Uses `MainNavigation` component
- **Target Audience**: Content creators looking for opportunities

## Navigation Component

### MainNavigation (`/components/navigation/MainNavigation.tsx`)
- **Features**:
  - Logo with home navigation
  - Navigation links between the three main pages
  - Login and Get Started buttons
  - Active page highlighting
  - Responsive design

## Key Features

### Shared Elements
- Consistent branding and color scheme
- Unified navigation experience
- Responsive design for all devices
- Orange (#FF6B35) as primary brand color

### Brand Home Features
- Creator discovery with platform filtering
- Category-based browsing
- Creator cards with detailed information
- Search and filter capabilities
- Integration with existing creator API

### Creator Home Features
- Success stories and testimonials
- Trending campaign opportunities
- Platform benefits explanation
- Clear call-to-action for signup

## File Structure

```
webapp/src/app/
├── page.tsx (redirects to /landing)
├── landing/
│   └── page.tsx (Landing Page)
├── brand-home/
│   └── page.tsx (Brand Home)
├── creator-home/
│   └── page.tsx (Creator Home)
└── components/navigation/
    └── MainNavigation.tsx
```

## Routing

- `/` → Redirects to `/landing`
- `/landing` → Landing page
- `/brand-home` → Brand discovery page
- `/creator-home` → Creator opportunities page

## Integration Points

### API Integration
- Creator data fetched from `profileAPI.getCreators()`
- Platform-specific creator filtering
- Real-time data loading with error handling

### Existing Components
- Reuses existing creator card components
- Integrates with existing authentication flow
- Maintains compatibility with dashboard structure

## Design Principles

### User Experience
- Clear separation of concerns between user types
- Intuitive navigation between pages
- Consistent visual language across all pages
- Mobile-first responsive design

### Performance
- Optimized image loading
- Efficient API calls
- Smooth transitions and animations
- Fast page navigation

## Future Enhancements

### Potential Additions
- A/B testing for different page layouts
- Analytics tracking for user behavior
- Personalized content based on user type
- Advanced filtering and search capabilities
- Integration with campaign management system

### Technical Improvements
- Server-side rendering for better SEO
- Progressive Web App features
- Advanced caching strategies
- Performance monitoring and optimization

## Maintenance

### Regular Tasks
- Update creator data and success stories
- Monitor page performance metrics
- A/B test different content variations
- Update navigation based on user feedback

### Content Updates
- Refresh featured creators regularly
- Update success stories and testimonials
- Modify trending campaigns
- Adjust call-to-action messaging

## Support

For questions or issues related to this structure, please refer to:
- Component documentation in `/components/`
- API integration details in `/services/`
- Styling guidelines in `/config/colors.ts`
