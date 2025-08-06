# Influmojo Admin Dashboard Setup

## Overview
This is a modern Next.js TypeScript admin dashboard that replaces the HTML-based admin panel with a much better user experience and comprehensive ticket view functionality.

## Features
- ✅ Modern React/Next.js interface
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Comprehensive ticket view modal
- ✅ Real-time chat functionality
- ✅ Telephony and email integration
- ✅ Agent management
- ✅ Statistics dashboard
- ✅ Responsive design

## Setup Instructions

### 1. Install Dependencies
```bash
cd admin-dashboard
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Access the Dashboard
Open http://localhost:3000 in your browser

### 4. Login
Use the JWT token from your backend:
```bash
cd ../backend
node test-auth.js
```

## Project Structure

```
admin-dashboard/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── LoginForm.tsx        # JWT token login form
│   ├── Dashboard.tsx        # Main dashboard with navigation
│   ├── TicketModal.tsx      # Comprehensive ticket view
│   └── tabs/
│       ├── AgentsTab.tsx    # Agent management
│       ├── TicketsTab.tsx   # Ticket management
│       └── StatisticsTab.tsx # Statistics dashboard
├── lib/
│   └── api.ts              # API utilities and functions
├── types/
│   └── index.ts            # TypeScript type definitions
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── next.config.js          # Next.js configuration
```

## Key Improvements Over HTML Version

### 1. Better User Experience
- Modern, responsive design
- Smooth animations and transitions
- Better loading states
- Toast notifications for feedback

### 2. Enhanced Ticket View
- Full-screen modal with all details
- Real-time chat with message threading
- Integrated communication tools
- Status and priority management
- Agent reassignment

### 3. Type Safety
- Full TypeScript support
- Type-safe API calls
- Better error handling
- IntelliSense support

### 4. Performance
- React Query for caching
- Optimized re-renders
- Lazy loading
- Better state management

### 5. Maintainability
- Component-based architecture
- Reusable components
- Better code organization
- Easier to extend and modify

## API Integration

The dashboard connects to your existing backend API:
- Backend runs on http://localhost:3002
- Next.js proxy handles API calls
- JWT authentication
- Real-time updates

## Next Steps

1. Install dependencies and start the development server
2. Test the login functionality
3. Explore the comprehensive ticket view
4. Test all communication features
5. Customize styling and branding as needed

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000 and 3002 are available
2. **CORS issues**: Next.js proxy should handle this automatically
3. **JWT token**: Generate a fresh token using `node test-auth.js`
4. **API errors**: Check that the backend server is running

### Development Tips

- Use React DevTools for debugging
- Check browser console for errors
- Use TypeScript for better development experience
- Hot reload will update changes automatically 