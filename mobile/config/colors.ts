// Color constants for the app
export const COLORS = {
  // Primary colors
  primary: '#ffffff',    // White
  secondary: '#f37135',  // Orange
  
  // Text colors
  textDark: '#1A1D1F',
  textGray: '#6B7280',
  
  // Border and background colors
  borderLight: '#E5E7EB',
  backgroundLight: '#FFFFFF', // Changed from '#F5F5F5' to '#FFFFFF'
  
  // Chip colors (5th and 6th colors)
  chipBlue: '#aad6f3',   // 5th color - Light blue
  chipYellow: '#ffd365', // 6th color - Light yellow
  
  // Placeholder text color
  placeholder: '#9CA3AF',
  
  // Additional colors
  error: '#EF4444',      // Red for errors
  white: '#FFFFFF',      // White
  success: '#10B981',    // Green for success
  warning: '#F59E0B',    // Yellow for warning
  gray: '#6B7280',       // Gray for unknown status
  
  // Gradient colors for buttons
  gradientOrange: ['rgb(254, 143, 0)', 'rgb(252, 82, 19)'] as const, // Primary orange gradient
  
  // Brand tertiary color
  tertiary: '#20536d',
  
  // Legacy colors (keeping for reference)
  legacyChipBlue: '#B1E5FC',
  legacyChipYellow: '#FFD88D',
};

export default COLORS; 