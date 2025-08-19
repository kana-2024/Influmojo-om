import { StreamChat } from 'stream-chat';

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
 * StreamChat Service for Webapp
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'}/api/chat/token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getStoredToken()}`
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
  private getStoredToken(): string | null {
    try {
      return localStorage.getItem('token');
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'}/api/chat/tickets/${ticketId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getStoredToken()}`
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'}/api/chat/tickets/${ticketId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getStoredToken()}`
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

      const channels = await this.client.queryChannels({
        members: { $in: [this.currentUser?.id || ''] }
      });

      const formattedChannels: StreamChatChannel[] = channels.map(channel => ({
        id: channel.id,
        name: channel.data?.name || channel.id,
        members: Object.keys(channel.state.members),
        lastMessageAt: channel.lastMessageAt?.toISOString(),
        createdAt: channel.createdAt?.toISOString()
      }));

      console.log(`✅ Found ${formattedChannels.length} channels`);
      return formattedChannels;
    } catch (error) {
      console.error('❌ Error getting user channels:', error);
      throw error;
    }
  }

  /**
   * Get a specific channel
   */
  async getChannel(channelId: string) {
    try {
      if (!this.client) {
        throw new Error('StreamChat client not initialized');
      }

      console.log(`📺 Getting channel: ${channelId}`);
      const channel = this.client.channel('messaging', channelId);
      await channel.watch();
      
      console.log(`✅ Channel ${channelId} retrieved`);
      return channel;
    } catch (error) {
      console.error('❌ Error getting channel:', error);
      throw error;
    }
  }

  /**
   * Send a message to a channel
   */
  async sendMessage(channelId: string, messageText: string, messageType: 'text' | 'file' | 'system' = 'text') {
    try {
      if (!this.client) {
        throw new Error('StreamChat client not initialized');
      }

      console.log(`💬 Sending message to channel ${channelId}:`, messageText);

      const channel = this.client.channel('messaging', channelId);
      const response = await channel.sendMessage({
        text: messageText,
        type: messageType
      });

      console.log(`✅ Message sent successfully`);
      return response;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get messages from a channel
   */
  async getMessages(channelId: string, limit: number = 50) {
    try {
      if (!this.client) {
        throw new Error('StreamChat client not initialized');
      }

      console.log(`📨 Getting messages from channel ${channelId}, limit: ${limit}`);

      const channel = this.client.channel('messaging', channelId);
      const response = await channel.getMessages({ limit });

      console.log(`✅ Retrieved ${response.messages.length} messages`);
      return response.messages;
    } catch (error) {
      console.error('❌ Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Check if user is connected
   */
  isConnected(): boolean {
    return this.client !== null && this.currentUser !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): StreamChatUser | null {
    return this.currentUser;
  }

  /**
   * Disconnect user
   */
  async disconnectUser(): Promise<void> {
    try {
      if (this.client) {
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
   * Get StreamChat client instance
   */
  getClient(): StreamChat | null {
    return this.client;
  }
}

// Export singleton instance
export const streamChatService = new StreamChatService();
