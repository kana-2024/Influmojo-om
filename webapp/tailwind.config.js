/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors from mobile app
        primary: '#f8f4e8',    // Cream
        secondary: '#f37135',  // Orange
        tertiary: '#20536d',   // Tertiary color for buttons and elements
        
        // Text colors
        textDark: '#1A1D1F',
        textGray: '#6B7280',
        
        // Border and background colors
        borderLight: '#E5E7EB',
        backgroundLight: '#F5F5F5',
        
        // Chip colors (5th and 6th colors)
        chipBlue: '#aad6f3',   // 5th color - Light blue
        chipYellow: '#ffd365', // 6th color - Light yellow
        
        // Placeholder text color
        placeholder: '#9CA3AF',
        
        // Additional colors
        error: '#EF4444',      // Red for errors
        white: '#FFFFFF',      // White
        
        // Legacy colors (keeping for reference)
        legacyChipBlue: '#B1E5FC',
        legacyChipYellow: '#FFD88D',
      },
      fontFamily: {
        // Primary Typeface - Poppins (matching mobile exactly)
        'poppins': ['Poppins', 'sans-serif'],
        'poppins-regular': ['Poppins', 'sans-serif'],
        'poppins-medium': ['Poppins', 'sans-serif'],
        'poppins-semibold': ['Poppins', 'sans-serif'],
        'poppins-bold': ['Poppins', 'sans-serif'],
        
        // Secondary Typeface - Alice (italic) - matching mobile
        'alice': ['Alice', 'serif'],
        'alice-italic': ['Alice', 'serif'],
      },
      fontSize: {
        // Font sizes based on mobile app brand guidelines
        'body': '18px',      // 18px for body text (Poppins)
        'caption': '14px',   // 14px for captions (Poppins)
        'title': '20px',     // Main titles
        'subtitle': '16px',  // Subtitles
        'small': '12px',     // Small text
        'large': '24px',     // Large headings
      },
      fontWeight: {
        // Font weights matching mobile app
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
