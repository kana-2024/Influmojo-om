'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import type { StreamChat as StreamChatType } from 'stream-chat';
import { toast } from 'react-hot-toast';

interface StreamChatContextType {
  client: StreamChatType | null;
  isConnected: boolean;
  connectUser: (userId: string, token: string) => Promise<void>;
  disconnectUser: () => Promise<void>;
  joinChannel: (channelId: string) => Promise<any>;
}

const StreamChatContext = createContext<StreamChatContextType | null>(null);

export const useStreamChat = () => {
  const context = useContext(StreamChatContext);
  if (!context) {
    throw new Error('useStreamChat must be used within a StreamChatProvider');
  }
  return context;
};

interface StreamChatProviderProps {
  children: React.ReactNode;
  apiKey: string;
}

export default function StreamChatProvider({ children, apiKey }: StreamChatProviderProps) {
  const [client, setClient] = useState<StreamChatType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectionInProgress = useRef(false);
  const currentUserId = useRef<string | null>(null);

  // Initialize StreamChat client
  useEffect(() => {
    if (!apiKey) {
      // Don't show warning if no API key - this is expected when not authenticated
      return;
    }

    const initClient = async () => {
      try {
        console.log('🔧 Initializing StreamChat client with API key:', apiKey ? 'Present' : 'Missing');
        
        if (!apiKey || apiKey.trim() === '') {
          throw new Error('StreamChat API key is required');
        }
        
        const streamClient = StreamChat.getInstance(apiKey);
        
        if (!streamClient) {
          throw new Error('Failed to create StreamChat client instance');
        }
        
        setClient(streamClient);
        console.log('✅ StreamChat client initialized');
      } catch (error) {
        console.error('❌ Error initializing StreamChat client:', error);
        toast.error('Failed to initialize chat client');
      }
    };

    initClient();

    // Cleanup on unmount
    return () => {
      if (client) {
        client.disconnectUser();
        setIsConnected(false);
        currentUserId.current = null;
        connectionInProgress.current = false;
      }
    };
  }, [apiKey]);

  // Connect user to StreamChat
  const connectUser = async (userId: string, token: string) => {
    if (!client) {
      throw new Error('StreamChat client not initialized');
    }

    // Prevent consecutive calls to connectUser
    if (connectionInProgress.current) {
      console.log('⚠️ Connection already in progress, skipping...');
      return;
    }

    // If already connected to the same user, skip
    if (isConnected && currentUserId.current === userId) {
      console.log('✅ Already connected to user:', userId);
      return;
    }

    // If connected to a different user, disconnect first
    if (isConnected && currentUserId.current !== userId) {
      console.log('🔄 Disconnecting from previous user before connecting to:', userId);
      await disconnectUser();
    }

    try {
      connectionInProgress.current = true;
      
      await client.connectUser(
        {
          id: userId,
          name: userId,
          role: 'admin',
        },
        token
      );
      
      setIsConnected(true);
      currentUserId.current = userId;
      console.log(`✅ User ${userId} connected to StreamChat`);
      toast.success('Connected to chat');
    } catch (error) {
      console.error('❌ Error connecting user to StreamChat:', error);
      toast.error('Failed to connect to chat');
      setIsConnected(false);
      currentUserId.current = null;
      throw error;
    } finally {
      connectionInProgress.current = false;
    }
  };

  // Disconnect user from StreamChat
  const disconnectUser = async () => {
    if (client && isConnected) {
      try {
        await client.disconnectUser();
        setIsConnected(false);
        currentUserId.current = null;
        connectionInProgress.current = false;
        console.log('✅ User disconnected from StreamChat');
      } catch (error) {
        console.error('❌ Error disconnecting user from StreamChat:', error);
      }
    }
  };

  // Join a channel
  const joinChannel = async (channelId: string) => {
    if (!client) {
      throw new Error('StreamChat client not initialized');
    }

    try {
      const channel = client.channel('messaging', channelId);
      await channel.watch();
      console.log(`✅ Joined channel: ${channelId}`);
      return channel;
    } catch (error) {
      console.error('❌ Error joining channel:', error);
      toast.error('Failed to join chat channel');
      throw error;
    }
  };

  const contextValue: StreamChatContextType = {
    client,
    isConnected,
    connectUser,
    disconnectUser,
    joinChannel,
  };

  // If no API key is provided, render children without StreamChat context
  if (!apiKey) {
    return <>{children}</>;
  }

  if (!client) {
    return <div>Loading chat...</div>;
  }

  return (
    <StreamChatContext.Provider value={contextValue}>
      <Chat client={client} theme="str-chat__theme-light">
        {children}
      </Chat>
    </StreamChatContext.Provider>
  );
} 