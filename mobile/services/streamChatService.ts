import { StreamChat } from 'stream-chat';
import { ticketAPI } from './apiService';

// StreamChat client instance
let chatClient: StreamChat | null = null;

export interface StreamChatUser {
  id: string;
  name: string;
  image?: string;
  role?: string;
}

export interface StreamChatToken {
  token: string;
  userId: string;
  apiKey: string;
}

export interface StreamChatChannel {
  id: string;
  name: string;
  members: string[];
  lastMessageAt?: string;
  createdAt?: string;
}

/**
 * StreamChat Service for React Native
 * Handles agent-mediated support conversations
 */
class StreamChatService {
  private client: StreamChat | null = null;
  private currentUser: StreamChatUser | null = null;

  /**
   * Initialize StreamChat client
   */
  async initialize(apiKey: string): Promise<StreamChat> {
    try {
      console.log('🔧 Initializing StreamChat client...');
      
      this.client = StreamChat.getInstance(apiKey);
      
      console.log('✅ StreamChat client initialized');
      return this.client;
    } catch (error) {
      console.error('❌ Error initializing StreamChat client:', error);
      throw error;
    }
  }

  /**
   * Connect user to StreamChat
   */
  async connectUser(userId: string, token: string): Promise<StreamChatUser> {
    try {
      if (!this.client) {
        throw new Error('StreamChat client not initialized');
      }

      console.log(`👤 Connecting user ${userId} to StreamChat...`);

      const user = await this.client.connectUser(
        { id: userId },
        token
      );

      this.currentUser = {
        id: userId,
        name: (user as any).name || userId,
        image: (user as any).image || undefined,
        role: (user as any).role || 'user'
      };

      console.log(`✅ User ${userId} connected to StreamChat`);
      return this.currentUser;
    } catch (error) {
      console.error('❌ Error connecting user to StreamChat:', error);
      throw error;
    }
  }

  /**
   * Get StreamChat token from backend
   */
  async getToken(): Promise<StreamChatToken> {
    try {
      console.log('🔑 Getting StreamChat token from backend...');

      const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/api/chat/token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getStoredToken()}`
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get StreamChat token');
      }

      const { token, userId, apiKey } = data.data;
      
      console.log(`✅ StreamChat token received for user ${userId}`);
      return { token, userId, apiKey };
    } catch (error) {
      console.error('❌ Error getting StreamChat token:', error);
      throw error;
    }
  }

  /**
   * Get stored token (helper method)
   */
  private async getStoredToken(): Promise<string | null> {
    try {
      const { getToken } = await import('./storage');
      return await getToken();
    } catch (error) {
      console.error('❌ Error getting stored token:', error);
      return null;
    }
  }

  /**
   * Join a ticket channel
   */
  async joinTicketChannel(ticketId: string): Promise<string> {
    try {
      if (!this.client) {
        throw new Error('StreamChat client not initialized');
      }

      console.log(`🎫 Joining ticket channel for ticket ${ticketId}...`);

      const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/api/chat/tickets/${ticketId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getStoredToken()}`
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to join ticket channel');
      }

      const { channelId } = data.data;
      
      console.log(`✅ Joined ticket channel: ${channelId}`);
      return channelId;
    } catch (error) {
      console.error('❌ Error joining ticket channel:', error);
      throw error;
    }
  }

  /**
   * Leave a ticket channel
   */
  async leaveTicketChannel(ticketId: string): Promise<void> {
    try {
      console.log(`👋 Leaving ticket channel for ticket ${ticketId}...`);

      const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/api/chat/tickets/${ticketId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getStoredToken()}`
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to leave ticket channel');
      }

      console.log(`✅ Left ticket channel for ticket ${ticketId}`);
    } catch (error) {
      console.error('❌ Error leaving ticket channel:', error);
      throw error;
    }
  }

  /**
   * Get user's active channels
   */
  async getUserChannels(): Promise<StreamChatChannel[]> {
    try {
      if (!this.client) {
        throw new Error('StreamChat client not initialized');
      }

      console.log('📋 Getting user channels...');

      const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/api/chat/channels`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getStoredToken()}`
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get user channels');
      }

      const channels = data.data.channels.map((channel: any) => ({
        id: channel.id,
        name: channel.name || `Channel ${channel.id}`,
        members: channel.members || [],
        lastMessageAt: channel.last_message_at,
        createdAt: channel.created_at
      }));

      console.log(`✅ Retrieved ${channels.length} channels`);
      return channels;
    } catch (error) {
      console.error('❌ Error getting user channels:', error);
      throw error;
    }
  }

  /**
   * Get channel information
   */
  async getChannelInfo(channelId: string): Promise<any> {
    try {
      if (!this.client) {
        throw new Error('StreamChat client not initialized');
      }

      console.log(`📊 Getting channel info for ${channelId}...`);

      const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/api/chat/channels/${channelId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getStoredToken()}`
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get channel info');
      }

      console.log(`✅ Retrieved channel info for ${channelId}`);
      return data.data;
    } catch (error) {
      console.error('❌ Error getting channel info:', error);
      throw error;
    }
  }

  /**
   * Create or get channel instance
   */
  async getChannel(channelId: string) {
    try {
      if (!this.client) {
        throw new Error('StreamChat client not initialized');
      }

      const channel = this.client.channel('messaging', channelId);
      await channel.watch();
      
      return channel;
    } catch (error) {
      console.error('❌ Error getting channel:', error);
      throw error;
    }
  }

  /**
   * Send message to channel
   */
  async sendMessage(channelId: string, message: string): Promise<any> {
    try {
      if (!this.client) {
        throw new Error('StreamChat client not initialized');
      }

      console.log(`💬 Sending message to channel ${channelId}...`);

      // Extract ticket ID from channel ID (format: ticket-{ticketId} or ticket_{ticketId})
      const ticketId = channelId.replace(/^ticket[-_]/, '');
      
      if (!ticketId) {
        throw new Error('Invalid channel ID format');
      }

      // Send message through backend API
      const response = await ticketAPI.sendTicketMessage(ticketId, {
        message_text: message,
        message_type: 'text',
        sender_role: (this.currentUser?.role as 'brand' | 'creator' | 'agent' | 'system') || 'agent'
      });

      console.log(`✅ Message sent to channel ${channelId}`);
      return response;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Disconnect user from StreamChat
   */
  async disconnectUser(): Promise<void> {
    try {
      if (this.client) {
        console.log('👋 Disconnecting user from StreamChat...');
        await this.client.disconnectUser();
        this.client = null;
        this.currentUser = null;
        console.log('✅ User disconnected from StreamChat');
      }
    } catch (error) {
      console.error('❌ Error disconnecting user:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): StreamChatUser | null {
    return this.currentUser;
  }

  /**
   * Get StreamChat client instance
   */
  getClient(): StreamChat | null {
    return this.client;
  }

  /**
   * Check if user is connected
   */
  isConnected(): boolean {
    return this.client !== null && this.currentUser !== null;
  }
}

// Export singleton instance
export const streamChatService = new StreamChatService();
export default streamChatService; 