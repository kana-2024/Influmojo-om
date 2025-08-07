import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
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
    <html lang="en">
      <head>
        {/* Google Fonts - Poppins and Alice */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Alice:ital,wght@0,400;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${poppins.variable} font-poppins`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 