// Local fonts configuration for Influmojo webapp
// This avoids external font downloads during build process

import localFont from 'next/font/local'

// Alice font (local fallback)
export const aliceFont = localFont({
  src: [
    {
      path: '../../assets/fonts/alice-regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-alice',
  display: 'swap',
})

// Poppins font (local fallback)
export const poppinsFont = localFont({
  src: [
    {
      path: '../../assets/fonts/poppins-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/poppins-medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/poppins-semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/poppins-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-poppins',
  display: 'swap',
})

// Fallback fonts for better performance
export const fallbackFonts = {
  alice: 'Alice, Georgia, serif',
  poppins: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
} 