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

  // Get StreamChat API key on component mount and when authentication changes
  useEffect(() => {
    const getStreamApiKey = async () => {
      try {
        // Check if user is authenticated first
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          console.log('⚠️ No JWT token found, skipping StreamChat initialization');
          return;
        }

        console.log('🔑 Attempting to get StreamChat API key...');
        const response = await streamChatAPI.getToken();
        if (response.success && response.data.apiKey) {
          setStreamApiKey(response.data.apiKey);
          console.log('✅ StreamChat API key retrieved successfully');
        } else {
          console.error('❌ Failed to get StreamChat API key:', response.message);
        }
      } catch (error) {
        console.error('❌ Failed to get StreamChat API key:', error);
        // Don't show error toast here as it might be expected when not authenticated
      }
    };

    getStreamApiKey();

    // Listen for authentication changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jwtToken') {
        if (e.newValue) {
          // User logged in, try to get StreamChat API key
          setTimeout(getStreamApiKey, 100);
        } else {
          // User logged out, clear StreamChat API key
          setStreamApiKey('');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StreamChatProvider apiKey={streamApiKey}>
        {children}
      </StreamChatProvider>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
} 