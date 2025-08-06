import { StreamChat } from 'stream-chat';
import { apiService } from './apiService';

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
        name: user.name || userId,
        image: user.image || undefined,
        role: user.role || 'user'
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

      const response = await apiService.get('/chat/token');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get StreamChat token');
      }

      const { token, userId, apiKey } = response.data;
      
      console.log(`✅ StreamChat token received for user ${userId}`);
      return { token, userId, apiKey };
    } catch (error) {
      console.error('❌ Error getting StreamChat token:', error);
      throw error;
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

      const response = await apiService.post(`/chat/tickets/${ticketId}/join`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to join ticket channel');
      }

      const { channelId } = response.data;
      
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

      const response = await apiService.post(`/chat/tickets/${ticketId}/leave`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to leave ticket channel');
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

      const response = await apiService.get('/chat/channels');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get user channels');
      }

      const channels = response.data.channels.map((channel: any) => ({
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

      const response = await apiService.get(`/chat/channels/${channelId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get channel info');
      }

      console.log(`✅ Retrieved channel info for ${channelId}`);
      return response.data;
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

      const channel = this.client.channel('messaging', channelId);
      const response = await channel.sendMessage({
        text: message
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