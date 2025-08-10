# Influmojo Webapp

A modern web application for the Influmojo influencer marketing platform, built with Next.js 14, TypeScript, and Tailwind CSS.

## 🎨 Design System

This webapp follows the same design system as the mobile app:

### Colors

- **Primary**: `#ffffff` (White)
- **Secondary**: `#f37135` (Orange)
- **Tertiary**: `#20536d` (Dark Blue)
- **Text Dark**: `#1A1D1F`
- **Text Gray**: `#6B7280`
- **Chip Blue**: `#aad6f3` (5th color)
- **Chip Yellow**: `#ffd365` (6th color)

### Typography

- **Primary Font**: Poppins (300, 400, 500, 600, 700)
- **Secondary Font**: Alice (italic)
- **Body Text**: 18px
- **Caption**: 14px
- **Title**: 20px
- **Subtitle**: 16px
- **Small**: 12px
- **Large**: 24px

## 🏗️ Project Structure

```
webapp/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── globals.css        # Global styles
│   │   └── providers.tsx      # Global providers
│   ├── components/            # Reusable components
│   │   ├── CreatorCard.tsx    # Creator card component
│   │   ├── PackageCard.tsx    # Package card component
│   │   ├── modals/            # Modal components
│   │   └── navigation/        # Navigation components
│   ├── config/                # Configuration files
│   │   ├── colors.ts          # Color constants
│   │   ├── fonts.ts           # Font configuration
│   │   └── env.ts             # Environment variables
│   ├── services/              # API services
│   │   └── apiService.ts      # API client
│   ├── store/                 # Redux store
│   │   ├── index.ts           # Store configuration
│   │   └── slices/            # Redux slices
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
├── public/                    # Static assets
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm

### Installation

1. **Install dependencies:**

   ```bash
   cd webapp
   yarn install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_API_URL=https://your-api-url.com
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```

3. **Run the development server:**

   ```bash
   yarn dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎯 Features

### Core Features

- **Authentication**: Login, signup, OTP verification
- **User Profiles**: Brand and creator profiles
- **Creator Discovery**: Browse and search creators
- **Package Management**: Create and manage packages
- **Order System**: Place and manage orders
- **Chat Integration**: Real-time messaging
- **Responsive Design**: Mobile-first approach

### Technical Features

- **TypeScript**: Full type safety
- **Redux Toolkit**: State management
- **React Query**: Server state management
- **Framer Motion**: Smooth animations
- **Tailwind CSS**: Utility-first styling
- **Next.js 14**: App router and server components

## 🎨 Component Library

### Core Components

- `CreatorCard`: Display creator information
- `PackageCard`: Display package details
- `ModalWrapper`: Reusable modal component
- `Button`: Styled button components

### Styling Classes

- `.btn-primary`: Primary button style
- `.btn-secondary`: Secondary button style
- `.btn-tertiary`: Tertiary button style
- `.card`: Card container style
- `.input-field`: Input field style
- `.chip-blue`: Blue chip style
- `.chip-yellow`: Yellow chip style

## 🔧 Development

### Code Style

- Use TypeScript for all components
- Follow the existing design system
- Use Tailwind CSS for styling
- Implement responsive design
- Add proper error handling

### State Management

- Use Redux Toolkit for global state
- Use React Query for server state
- Implement proper loading states
- Handle errors gracefully

### API Integration

- All API calls go through `apiService.ts`
- Use proper error handling
- Implement retry logic
- Cache responses appropriately

## 📱 Mobile-First Design

The webapp is designed to be mobile-first, matching the mobile app's user experience:

- **Touch-friendly**: Large touch targets
- **Responsive**: Works on all screen sizes
- **Performance**: Optimized for mobile devices
- **Accessibility**: WCAG compliant

## 🚀 Deployment

### Build for Production

```bash
yarn build
```

### Start Production Server

```bash
yarn start
```

### Environment Variables

Make sure to set the following environment variables in production:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## 🤝 Contributing

1. Follow the existing code structure
2. Use the established design system
3. Write TypeScript for all new code
4. Add proper error handling
5. Test on mobile devices
6. Update documentation

## 📄 License

This project is part of the Influmojo platform.
