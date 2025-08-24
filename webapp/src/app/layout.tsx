import type { Metadata } from 'next';
import { Poppins, Alice } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

// Initialize fonts
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const alice = Alice({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-alice',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Influmojo - Connect with Skilled Influencers',
  description: 'Tap into a pool of talented influencers to bring your projects to life. Collaborate seamlessly and achieve outstanding results.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${alice.variable}`}>
      <head>
        {/* Google Identity Services */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className="font-poppins">
        <Providers>
          {children}
        </Providers>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
} 