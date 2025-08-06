const { StreamChat } = require('stream-chat');

// Initialize StreamChat with API credentials
const stream = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

class StreamService {
  /**
   * Create a new ticket channel with agent assigned
   * @param {string} ticketId - The ticket ID
   * @param {string} agentId - The agent ID
   * @returns {Promise<string>} Channel ID
   */
  async createTicketChannel(ticketId, agentId) {
    try {
      console.log(`🎫 Creating StreamChat channel for ticket ${ticketId} with agent ${agentId}`);
      
      const channel = stream.channel('messaging', `ticket-${ticketId}`, {
        name: `Support Ticket #${ticketId}`,
        members: [`agent-${agentId}`],
        created_by_id: `agent-${agentId}`,
        // Set channel data for ticket management
        data: {
          ticket_id: ticketId,
          agent_id: agentId,
          status: 'open',
          created_at: new Date().toISOString()
        }
      });

      await channel.create();
      
      console.log(`✅ StreamChat channel created: ticket-${ticketId}`);
      return `ticket-${ticketId}`;
    } catch (error) {
      console.error('❌ Error creating StreamChat channel:', error);
      throw error;
    }
  }

  /**
   * Create a unified ticket channel with brand, creator, and agent members
   * @param {string} ticketId - The ticket ID
   * @param {string} agentId - The agent ID
   * @param {string} brandId - The brand ID
   * @param {string} creatorId - The creator ID
   * @returns {Promise<string>} Channel ID
   */
  async createUnifiedTicketChannel(ticketId, agentId, brandId, creatorId) {
    try {
      console.log(`🎫 Creating unified StreamChat channel for ticket ${ticketId}`);
      console.log(`👥 Members: agent-${agentId}, brand-${brandId}, creator-${creatorId}`);
      
      const channelId = `ticket_${ticketId}`;
      const channel = stream.channel('messaging', channelId, {
        name: `Ticket #${ticketId}`,
        members: [`agent_${agentId}`, `brand_${brandId}`, `creator_${creatorId}`],
        created_by_id: `agent_${agentId}`,
        // Set channel data for ticket management
        data: {
          ticket_id: ticketId,
          order_id: ticketId, // Assuming ticket ID maps to order ID
          agent_id: agentId,
          brand_id: brandId,
          creator_id: creatorId,
          status: 'open',
          created_at: new Date().toISOString(),
          channel_type: 'ticket_support'
        }
      });

      await channel.create();
      
      // Send initial system message
      await channel.sendMessage({
        text: `Support ticket #${ticketId} has been created. An agent will assist you shortly.`,
        user_id: 'system',
        type: 'system'
      });
      
      console.log(`✅ Unified StreamChat channel created: ${channelId}`);
      return channelId;
    } catch (error) {
      console.error('❌ Error creating unified StreamChat channel:', error);
      throw error;
    }
  }

  /**
   * Generate user token for StreamChat authentication
   * @param {string} userId - The user ID (format: agent-123, brand-456, influencer-789)
   * @returns {Promise<string>} User token
   */
  async generateUserToken(userId) {
    try {
      console.log(`🔑 Generating StreamChat token for user: ${userId}`);
      
      const token = stream.createToken(userId);
      
      console.log(`✅ StreamChat token generated for user: ${userId}`);
      return token;
    } catch (error) {
      console.error('❌ Error generating StreamChat token:', error);
      throw error;
    }
  }

  /**
   * Add user to a ticket channel
   * @param {string} channelId - The channel ID
   * @param {string} userId - The user ID to add
   * @returns {Promise<void>}
   */
  async addUserToChannel(channelId, userId) {
    try {
      console.log(`👤 Adding user ${userId} to channel ${channelId}`);
      
      const channel = stream.channel('messaging', channelId);
      await channel.addMembers([userId]);
      
      // Send a system message when user joins
      await channel.sendMessage({
        text: `${userId} has joined the support conversation`,
        user_id: 'system',
        type: 'system'
      });
      
      console.log(`✅ User ${userId} added to channel ${channelId}`);
    } catch (error) {
      console.error('❌ Error adding user to channel:', error);
      throw error;
    }
  }

  /**
   * Remove user from a ticket channel
   * @param {string} channelId - The channel ID
   * @param {string} userId - The user ID to remove
   * @returns {Promise<void>}
   */
  async removeUserFromChannel(channelId, userId) {
    try {
      console.log(`👤 Removing user ${userId} from channel ${channelId}`);
      
      const channel = stream.channel('messaging', channelId);
      await channel.removeMembers([userId]);
      
      // Send a system message when user leaves
      await channel.sendMessage({
        text: `${userId} has left the support conversation`,
        user_id: 'system',
        type: 'system'
      });
      
      console.log(`✅ User ${userId} removed from channel ${channelId}`);
    } catch (error) {
      console.error('❌ Error removing user from channel:', error);
      throw error;
    }
  }

  /**
   * Get channel information
   * @param {string} channelId - The channel ID
   * @returns {Promise<Object>} Channel information
   */
  async getChannelInfo(channelId) {
    try {
      console.log(`📊 Getting channel info for ${channelId}`);
      
      const channel = stream.channel('messaging', channelId);
      const state = await channel.query({ messages: { limit: 0 } });
      
      return {
        id: channelId,
        members: state.members,
        messages: state.messages,
        lastMessageAt: state.last_message_at,
        createdAt: state.created_at
      };
    } catch (error) {
      console.error('❌ Error getting channel info:', error);
      throw error;
    }
  }

  /**
   * Send system message to channel
   * @param {string} channelId - The channel ID
   * @param {string} message - The system message
   * @returns {Promise<void>}
   */
  async sendSystemMessage(channelId, message) {
    try {
      console.log(`📢 Sending system message to channel ${channelId}: ${message}`);
      
      const channel = stream.channel('messaging', channelId);
      await channel.sendMessage({
        text: message,
        user_id: 'system',
        type: 'system'
      });
      
      console.log(`✅ System message sent to channel ${channelId}`);
    } catch (error) {
      console.error('❌ Error sending system message:', error);
      throw error;
    }
  }

  /**
   * Freeze channel (when ticket is resolved)
   * @param {string} channelId - The channel ID
   * @returns {Promise<void>}
   */
  async freezeChannel(channelId) {
    try {
      console.log(`❄️ Freezing channel ${channelId}`);
      
      const channel = stream.channel('messaging', channelId);
      await channel.update({ frozen: true });
      
      // Send final system message
      await this.sendSystemMessage(channelId, 'This support conversation has been resolved and is now closed.');
      
      console.log(`✅ Channel ${channelId} frozen`);
    } catch (error) {
      console.error('❌ Error freezing channel:', error);
      throw error;
    }
  }

  /**
   * Unfreeze channel (when ticket is reopened)
   * @param {string} channelId - The channel ID
   * @returns {Promise<void>}
   */
  async unfreezeChannel(channelId) {
    try {
      console.log(`🔥 Unfreezing channel ${channelId}`);
      
      const channel = stream.channel('messaging', channelId);
      await channel.update({ frozen: false });
      
      // Send system message
      await this.sendSystemMessage(channelId, 'This support conversation has been reopened.');
      
      console.log(`✅ Channel ${channelId} unfrozen`);
    } catch (error) {
      console.error('❌ Error unfreezing channel:', error);
      throw error;
    }
  }

  /**
   * Get user's channels
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} List of channels
   */
  async getUserChannels(userId) {
    try {
      console.log(`📋 Getting channels for user ${userId}`);
      
      const filter = { members: { $in: [userId] } };
      const sort = [{ last_message_at: -1 }];
      
      const channels = await stream.queryChannels(filter, sort, {
        limit: 50,
        offset: 0
      });
      
      console.log(`✅ Found ${channels.length} channels for user ${userId}`);
      return channels;
    } catch (error) {
      console.error('❌ Error getting user channels:', error);
      throw error;
    }
  }

  /**
   * Create or get user in StreamChat
   * @param {string} userId - The user ID
   * @param {Object} userData - User data (name, image, etc.)
   * @returns {Promise<Object>} User object
   */
  async createOrGetUser(userId, userData = {}) {
    try {
      console.log(`👤 Creating/getting user ${userId} in StreamChat`);
      
      const user = await stream.upsertUser({
        id: userId,
        name: userData.name || userId,
        image: userData.image || null,
        role: userData.role || 'user'
      });
      
      console.log(`✅ User ${userId} created/updated in StreamChat`);
      return user;
    } catch (error) {
      console.error('❌ Error creating/getting user:', error);
      throw error;
    }
  }
}

module.exports = new StreamService(); 