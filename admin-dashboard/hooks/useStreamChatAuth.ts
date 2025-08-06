import { useState, useEffect } from 'react';
import { useStreamChat } from '@/components/StreamChatProvider';
import { streamChatAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

export const useStreamChatAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Try to get StreamChat context, but handle case when it's not available
  let streamChatContext;
  try {
    streamChatContext = useStreamChat();
  } catch (error) {
    // StreamChat context not available (no API key or not initialized)
    streamChatContext = null;
  }

  const { connectUser, disconnectUser, isConnected } = streamChatContext || {};

  // Authenticate with StreamChat
  const authenticate = async () => {
    if (!streamChatContext || !connectUser) {
      console.log('⚠️ StreamChat not available - skipping authentication');
      return false;
    }

    if (isConnected) {
      return true;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get StreamChat token from backend
      const response = await streamChatAPI.getToken();
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get StreamChat token');
      }

      const { token, userId, apiKey } = response.data;

      // Connect user to StreamChat
      await connectUser(userId, token);
      
      console.log('✅ StreamChat authentication successful');
      toast.success('Connected to StreamChat');
      
      return true;
    } catch (error) {
      console.error('❌ StreamChat authentication failed:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      toast.error('Failed to connect to StreamChat');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect from StreamChat
  const disconnect = async () => {
    if (!streamChatContext || !disconnectUser) {
      console.log('⚠️ StreamChat not available - skipping disconnect');
      return;
    }

    try {
      await disconnectUser();
      console.log('✅ StreamChat disconnected');
      toast.success('Disconnected from StreamChat');
    } catch (error) {
      console.error('❌ Error disconnecting from StreamChat:', error);
      toast.error('Failed to disconnect from StreamChat');
    }
  };

  return {
    authenticate,
    disconnect,
    isConnected: isConnected || false,
    isLoading,
    error,
  };
}; 