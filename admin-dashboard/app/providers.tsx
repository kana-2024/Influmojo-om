'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StreamChatProvider from '@/components/StreamChatProvider';
import { streamChatAPI } from '@/lib/api';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [streamApiKey, setStreamApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Get StreamChat API key from environment variables
  useEffect(() => {
    const getStreamApiKey = () => {
      try {
        // Get StreamChat API key from environment variable
        const apiKey = process.env.NEXT_PUBLIC_ADMIN_STREAMCHAT_API_KEY;
        if (apiKey) {
          setStreamApiKey(apiKey);
          console.log('✅ StreamChat API key loaded from environment');
        } else {
          console.error('❌ StreamChat API key not found in environment');
          setStreamApiKey('');
        }
      } catch (error) {
        console.error('❌ Failed to get StreamChat API key:', error);
        setStreamApiKey('');
      } finally {
        setIsLoading(false);
      }
    };

    getStreamApiKey();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
        <Toaster position="top-right" />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StreamChatProvider apiKey={streamApiKey}>
        {children}
      </StreamChatProvider>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
} 