// TEMPORARILY COMMENTED OUT FOR EC2 BUILD - StreamChat functionality will be restored later
/*
import StreamChat from 'stream-chat';

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

class StreamChatService {
  private client: StreamChat | null = null;
  private currentUser: StreamChatUser | null = null;

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

  async getToken(): Promise<StreamChatToken> {
    try {
      console.log('🔑 Getting StreamChat token from backend...');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/chat/token`, {
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

  private getStoredToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  }

  async createTicketChannel(orderId: string, title: string): Promise<string> {
    try {
      if (!this.client) {
        throw new Error('StreamChat client not initialized');
      }

      console.log(`🎫 Creating ticket channel for order ${orderId}`);

      const channel = this.client.channel('messaging', `ticket-${orderId}`, {
        name: `Support: ${title}`,
        members: [this.currentUser?.id || ''],
        created_by_id: this.currentUser?.id || '',
        custom_type: 'ticket'
      });

      await channel.create();
      
      console.log(`✅ Ticket channel created: ${channel.id}`);
      return channel.id;
    } catch (error) {
      console.error('❌ Error creating ticket channel:', error);
      throw error;
    }
  }

  async joinTicketChannel(channelId: string): Promise<string> {
    try {
      if (!this.client) {
        throw new Error('StreamChat client not initialized');
      }

      console.log(`🚪 Joining ticket channel: ${channelId}`);

      const channel = this.client.channel('messaging', channelId);
      await channel.watch();
      
      console.log(`✅ Joined ticket channel: ${channelId}`);
      return channelId;
    } catch (error) {
      console.error('❌ Error joining ticket channel:', error);
      throw error;
    }
  }

  async leaveTicketChannel(channelId: string): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('StreamChat client not initialized');
      }

      console.log(`🚪 Leaving ticket channel: ${channelId}`);

      const channel = this.client.channel('messaging', channelId);
      await channel.removeMembers([this.currentUser?.id || '']);
      
      console.log(`✅ Left ticket channel: ${channelId}`);
    } catch (error) {
      console.error('❌ Error leaving ticket channel:', error);
      throw error;
    }
  }

  async getUserChannels(): Promise<StreamChatChannel[]> {
    try {
      if (!this.client) {
        throw new Error('StreamChat client not initialized');
      }

      console.log('📺 Getting user channels...');

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

  isConnected(): boolean {
    return this.client !== null && this.currentUser !== null;
  }

  getCurrentUser(): StreamChatUser | null {
    return this.currentUser;
  }

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

  getClient(): StreamChat | null {
    return this.client;
  }
}

export const streamChatService = new StreamChatService();
*/

// Placeholder service for now
export const streamChatService = {
  initialize: async () => Promise.resolve(),
  connectUser: async () => Promise.resolve(),
  getToken: async () => Promise.resolve({ token: '', userId: '', apiKey: '' }),
  createTicketChannel: async () => Promise.resolve(''),
  joinTicketChannel: async () => Promise.resolve(''),
  leaveTicketChannel: async () => Promise.resolve(),
  getUserChannels: async () => Promise.resolve([]),
  getChannel: async () => Promise.resolve(),
  sendMessage: async () => Promise.resolve(),
  getMessages: async () => Promise.resolve([]),
  isConnected: () => false,
  getCurrentUser: () => null,
  disconnectUser: async () => Promise.resolve(),
  getClient: () => null,
};
