const { PrismaClient } = require('../generated/client');
const streamService = require('./streamService');

const prisma = new PrismaClient();

class CRMService {
  /**
   * Create a ticket for an order - ONLY called when order is created
   * This ensures ONE ticket per order for the entire lifecycle
   */
  async createTicket(orderId, streamChannelId = null) {
    try {
      // Get all agent users for round-robin assignment
      const agentUsers = await prisma.user.findMany({
        where: { user_type: 'agent' },
        select: { id: true, name: true, email: true }
      });

      if (agentUsers.length === 0) {
        throw new Error('No agent users available for ticket assignment');
      }

      // Get the last assigned ticket to determine next agent (round-robin)
      const lastTicket = await prisma.ticket.findFirst({
        orderBy: { created_at: 'desc' },
        select: { agent_id: true }
      });

      let nextAgentIndex = 0;
      if (lastTicket) {
        const currentAgentIndex = agentUsers.findIndex(user => user.id === lastTicket.agent_id);
        nextAgentIndex = (currentAgentIndex + 1) % agentUsers.length;
      }

      const assignedAgent = agentUsers[nextAgentIndex];

      // Get order details to extract brand and creator IDs
      const order = await prisma.order.findUnique({
        where: { id: BigInt(orderId) },
        include: {
          brand: { 
            select: { 
              id: true,
              user: { select: { name: true, email: true } }
            } 
          },
          creator: { 
            select: { 
              id: true,
              user: { select: { name: true, email: true } }
            } 
          },
          package: { select: { title: true } }
        }
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Create separate StreamChat channels for brand-agent and creator-agent communication
      let brandAgentChannel = null;
      let creatorAgentChannel = null;
      
      if (!streamChannelId) {
        try {
          const channels = await streamService.createSeparateTicketChannels(
            orderId.toString(),
            assignedAgent.id.toString(),
            order.brand.id.toString(),
            order.creator.id.toString()
          );
          
          brandAgentChannel = channels.brandAgentChannel;
          creatorAgentChannel = channels.creatorAgentChannel;
          
          console.log(`🎫 Separate StreamChat channels created:`);
          console.log(`   - Brand-Agent: ${brandAgentChannel}`);
          console.log(`   - Creator-Agent: ${creatorAgentChannel}`);
        } catch (streamError) {
          console.error('⚠️ Failed to create separate StreamChat channels:', streamError);
          // Continue without StreamChat channels if it fails
          brandAgentChannel = 'no-brand-channel';
          creatorAgentChannel = 'no-creator-channel';
        }
      }

      // Create the ticket with separate channels
      const ticketData = {
        order_id: BigInt(orderId),
        agent_id: assignedAgent.id,
        stream_channel_id: streamChannelId || 'no-channel', // Legacy field
        brand_agent_channel: brandAgentChannel,
        creator_agent_channel: creatorAgentChannel,
        status: 'open'
      };

      console.log('🎫 Creating ticket with data:', {
        order_id: orderId,
        agent_id: assignedAgent.id.toString(),
        brand_agent_channel: ticketData.brand_agent_channel,
        creator_agent_channel: ticketData.creator_agent_channel,
        status: ticketData.status
      });

      const ticket = await prisma.ticket.create({
        data: ticketData
      });

      // Fetch the ticket with all the related data after creation
      const ticketWithRelations = await prisma.ticket.findUnique({
        where: { id: ticket.id },
        include: {
          order: {
            include: {
              brand: {
                include: { user: { select: { name: true, email: true } } }
              },
              creator: {
                include: { user: { select: { name: true, email: true } } }
              },
              package: { select: { title: true } }
            }
          },
          agent: { select: { name: true, email: true } }
        }
      });

      // Send initial system message and agent acknowledgment
      try {
        // Send welcome message
        await this.addMessage(
          ticketWithRelations.id.toString(),
          assignedAgent.id.toString(),
          `🎫 Support ticket #${ticketWithRelations.id} has been created for order #${orderId}.\n\n**Order Details:**\n• Package: ${order.package.title}\n• Brand: ${order.brand.user.name}\n• Creator: ${order.creator.user.name}\n\nAn agent will assist you shortly.`,
          'system',
          null,
          null,
          'system'
        );

        // Send agent acknowledgment message
        await this.addMessage(
          ticketWithRelations.id.toString(),
          assignedAgent.id.toString(),
          `👋 Hello! I'm ${assignedAgent.name}, your assigned support agent. I've received your ticket and will be assisting you with order #${orderId}.\n\nPlease let me know how I can help you today!`,
          'text',
          null,
          null,
          'agent'
        );

        console.log(`✅ Initial messages sent for ticket ${ticketWithRelations.id}`);
      } catch (messageError) {
        console.error('⚠️ Failed to send initial messages:', messageError);
        // Continue even if messages fail
      }

      // Create notification for the assigned agent
      try {
        await prisma.notification.create({
          data: {
            user_id: assignedAgent.id,
            type: 'new_ticket',
            title: 'New Support Ticket Assigned',
            message: `You have been assigned ticket #${ticketWithRelations.id} for order #${orderId}`,
            data: {
              ticket_id: ticketWithRelations.id.toString(),
              order_id: orderId,
              order_title: order.package.title,
              brand_name: order.brand.user.name,
              creator_name: order.creator.user.name
            }
          }
        });
        console.log(`✅ Notification created for agent ${assignedAgent.name}`);
      } catch (notificationError) {
        console.error('⚠️ Failed to create agent notification:', notificationError);
        // Continue even if notification fails
      }

      console.log(`✅ Ticket created for order ${orderId}, assigned to agent ${ticketWithRelations.agent.name}, StreamChat channel: ${ticketWithRelations.stream_channel_id}`);
      return ticketWithRelations;
    } catch (error) {
      console.error('❌ Error creating ticket:', error);
      throw error;
    }
  }

  /**
   * Get ticket by order ID - DO NOT create if doesn't exist
   * Tickets are only created when orders are created
   */
  async getTicketByOrderId(orderId) {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { order_id: BigInt(orderId) },
        include: {
          order: {
            include: {
              brand: {
                include: { user: { select: { name: true, email: true } } }
              },
              creator: {
                include: { user: { select: { name: true, email: true } } }
              },
              package: { select: { title: true } }
            }
          },
          agent: { select: { name: true, email: true } },
          messages: {
            include: {
              sender: { select: { name: true, user_type: true } }
            },
            orderBy: { created_at: 'asc' }
          }
        }
      });

      if (!ticket) {
        console.log(`🎫 No ticket found for order ${orderId} - tickets are only created when orders are created`);
        return null;
      }

      return ticket;
    } catch (error) {
      console.error('❌ Error getting ticket:', error);
      throw error;
    }
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId, status) {
    try {
      const ticket = await prisma.ticket.update({
        where: { id: BigInt(ticketId) },
        data: { status },
        include: {
          order: {
            include: {
              brand: { include: { user: { select: { name: true, email: true } } } },
              creator: { include: { user: { select: { name: true, email: true } } } }
            }
          },
          agent: { select: { name: true, email: true } }
        }
      });

      console.log(`✅ Ticket ${ticketId} status updated to ${status}`);
      return ticket;
    } catch (error) {
      console.error('❌ Error updating ticket status:', error);
      throw error;
    }
  }

  /**
   * Add message to ticket
   */
  async addMessage(ticketId, senderId, messageText, messageType = 'text', fileUrl = null, fileName = null, senderRole = null, channelType = null) {
    try {
      console.log(`📝 Adding message to ticket ${ticketId}:`, {
        senderId,
        messageText: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''),
        messageType,
        senderRole,
        channelType
      });

      // Get sender information to determine role if not provided
      let role = senderRole;
      if (!role) {
        const sender = await prisma.user.findUnique({
          where: { id: BigInt(senderId) },
          select: { user_type: true }
        });
        role = sender?.user_type || 'agent';
      }

      // Determine channel type if not provided
      let finalChannelType = channelType;
      if (!finalChannelType) {
        // Determine channel type based on sender role
        if (role === 'brand') {
          finalChannelType = 'brand_agent';
        } else if (role === 'creator') {
          finalChannelType = 'creator_agent';
        } else if (role === 'agent' || role === 'super_admin') {
          // For agents, default to brand_agent channel
          finalChannelType = 'brand_agent';
        } else {
          finalChannelType = 'system';
        }
      }

      console.log(`🔍 Final message details:`, {
        role,
        finalChannelType,
        ticketId: ticketId.toString()
      });

      const message = await prisma.message.create({
        data: {
          ticket_id: BigInt(ticketId),
          sender_id: BigInt(senderId),
          message_text: messageText,
          message_type: messageType,
          file_url: fileUrl,
          file_name: fileName,
          sender_role: role,
          channel_type: finalChannelType
        },
        include: {
          sender: { select: { name: true, user_type: true } }
        }
      });

      // Add sender_role and channel_type to the response
      const messageWithRole = {
        ...message,
        sender_role: role,
        channel_type: finalChannelType
      };

      console.log(`✅ Message added to ticket ${ticketId} with role ${role} in channel ${finalChannelType}`);
      console.log(`📊 Message details:`, {
        id: message.id.toString(),
        sender_name: message.sender.name,
        sender_type: message.sender.user_type,
        created_at: message.created_at
      });
      
      return messageWithRole;
    } catch (error) {
      console.error('❌ Error adding message:', error);
      throw error;
    }
  }

  /**
   * Get all tickets for an agent
   */
  async getAgentTickets(agentId, status = null) {
    try {
      const whereClause = { agent_id: BigInt(agentId) };
      if (status) {
        whereClause.status = status;
      }

      const tickets = await prisma.ticket.findMany({
        where: whereClause,
        include: {
          order: {
            include: {
              brand: { include: { user: { select: { name: true, email: true } } } },
              creator: { include: { user: { select: { name: true, email: true } } } },
              package: { select: { title: true } }
            }
          },
          messages: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        },
        orderBy: { updated_at: 'desc' }
      });

      return tickets;
    } catch (error) {
      console.error('❌ Error getting agent tickets:', error);
      throw error;
    }
  }

  /**
   * Get all tickets (for admin dashboard)
   */
  async getAllTickets(status = null, limit = 50, offset = 0) {
    try {
      const whereClause = {};
      if (status) {
        whereClause.status = status;
      }

      const tickets = await prisma.ticket.findMany({
        where: whereClause,
        include: {
          order: {
            include: {
              brand: { include: { user: { select: { name: true, email: true } } } },
              creator: { include: { user: { select: { name: true, email: true } } } },
              package: { select: { title: true } }
            }
          },
          agent: { select: { name: true, email: true } },
          messages: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        },
        orderBy: { updated_at: 'desc' },
        take: limit,
        skip: offset
      });

      const total = await prisma.ticket.count({ where: whereClause });

      return { tickets, total };
    } catch (error) {
      console.error('❌ Error getting all tickets:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific ticket
   */
  async getTicketMessages(ticketId, requestingUserId = null, requestingUserType = null, loadOlderMessages = false, channelType = null) {
    try {
      // Get ticket and agent information
      const ticket = await prisma.ticket.findUnique({
        where: { id: BigInt(ticketId) },
        include: {
          agent: { select: { id: true, name: true, user_type: true, is_online: true, last_online_at: true, agent_status: true } }
        }
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      const agent = ticket.agent;
      const isAgentOffline = !agent.is_online || agent.agent_status === 'offline';
      const agentOfflineTime = agent.last_online_at;

      // Determine the cutoff time for messages when agent is offline
      let messageCutoffTime = null;
      if (isAgentOffline && !loadOlderMessages) {
        // When agent is offline and not loading older messages, only show messages up to when agent went offline
        messageCutoffTime = agentOfflineTime || new Date();
      }

      // Build the where clause for messages
      let whereClause = { ticket_id: BigInt(ticketId) };
      
      // If agent is offline and not loading older messages, limit to messages before agent went offline
      if (messageCutoffTime) {
        whereClause.created_at = { lte: messageCutoffTime };
      }

      // Filter by channel type if specified
      if (channelType) {
        whereClause.channel_type = channelType;
      }

      // Get messages for the ticket
      const allMessages = await prisma.message.findMany({
        where: whereClause,
        include: {
          sender: { select: { id: true, name: true, user_type: true } }
        },
        orderBy: { created_at: 'asc' }
      });

      // Helper function to safely format timestamp
      const formatTimestamp = (date) => {
        if (!date) return new Date().toISOString();
        if (date instanceof Date) return date.toISOString();
        if (typeof date === 'string') {
          const parsed = new Date(date);
          return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
        }
        return new Date().toISOString();
      };

      // If no requesting user info provided, return all messages (for backward compatibility)
      if (!requestingUserId || !requestingUserType) {
        console.log('⚠️ No requesting user info provided, returning all messages for ticket:', ticketId);
        return {
          messages: allMessages.map(message => ({
            id: message.id.toString(),
            text: message.message_text,
            sender: message.sender.user_type,
            sender_name: message.sender.name,
            timestamp: formatTimestamp(message.created_at),
            message_type: message.message_type,
            file_url: message.file_url,
            file_name: message.file_name,
            sender_role: message.sender_role || message.sender.user_type,
            channel_type: message.channel_type
          })),
          agent_status: {
            is_online: agent.is_online,
            status: agent.agent_status,
            last_online_at: agent.last_online_at
          },
          has_older_messages: isAgentOffline && !loadOlderMessages
        };
      }

      // Simplified message filtering - agents see all messages, others see their channel
      let filteredMessages = [];
      
      if (requestingUserType === 'agent' || requestingUserType === 'super_admin') {
        // Agents can see all messages from both channels
        filteredMessages = allMessages;
        console.log(`👨‍💼 Agent ${requestingUserId} can see all ${allMessages.length} messages for ticket ${ticketId}`);
      } else {
        // Brands and creators can only see messages from their respective channels
        console.log(`🔍 Filtering messages for ${requestingUserType} ${requestingUserId}`);
        
        // Determine which channel this user should see
        let userChannelType = null;
        if (requestingUserType === 'brand') {
          userChannelType = 'brand_agent';
        } else if (requestingUserType === 'creator') {
          userChannelType = 'creator_agent';
        }
        
        console.log(`🔍 User channel type: ${userChannelType}`);
        
        // Simplified filtering - just filter by channel type
        filteredMessages = allMessages.filter(message => {
          const messageChannelType = message.channel_type;
          const isCorrectChannel = !userChannelType || messageChannelType === userChannelType;
          
          if (!isCorrectChannel) {
            console.log(`🚫 Excluding message ${message.id}: wrong channel (${messageChannelType} vs ${userChannelType})`);
          }
          
          return isCorrectChannel;
        });
        
        console.log(`🔒 ${requestingUserType} ${requestingUserId} can see ${filteredMessages.length}/${allMessages.length} messages for ticket ${ticketId}`);
      }

      return {
        messages: filteredMessages.map(message => ({
          id: message.id.toString(),
          text: message.message_text,
          sender: message.sender.user_type,
          sender_name: message.sender.name,
          timestamp: formatTimestamp(message.created_at),
          message_type: message.message_type,
          file_url: message.file_url,
          file_name: message.file_name,
          sender_role: message.sender_role || message.sender.user_type,
          channel_type: message.channel_type
        })),
        agent_status: {
          is_online: agent.is_online,
          status: agent.agent_status,
          last_online_at: agent.last_online_at
        },
        has_older_messages: isAgentOffline && !loadOlderMessages
      };
    } catch (error) {
      console.error('❌ Error getting ticket messages:', error);
      throw error;
    }
  }

  /**
   * Reassign ticket to different agent
   */
  async reassignTicket(ticketId, newAgentId) {
    try {
      const ticket = await prisma.ticket.update({
        where: { id: BigInt(ticketId) },
        data: { agent_id: BigInt(newAgentId) },
        include: {
          order: {
            include: {
              brand: { include: { user: { select: { name: true, email: true } } } },
              creator: { include: { user: { select: { name: true, email: true } } } }
            }
          },
          agent: { select: { name: true, email: true } }
        }
      });

      console.log(`✅ Ticket ${ticketId} reassigned to agent ${ticket.agent.name}`);
      return ticket;
    } catch (error) {
      console.error('❌ Error reassigning ticket:', error);
      throw error;
    }
  }

  /**
   * Update ticket priority
   */
  async updateTicketPriority(ticketId, priority) {
    try {
      const ticket = await prisma.ticket.update({
        where: { id: BigInt(ticketId) },
        data: { priority },
        include: {
          order: {
            include: {
              brand: { include: { user: { select: { name: true, email: true } } } },
              creator: { include: { user: { select: { name: true, email: true } } } }
            }
          },
          agent: { select: { name: true, email: true } }
        }
      });

      console.log(`✅ Ticket ${ticketId} priority updated to ${priority}`);
      return ticket;
    } catch (error) {
      console.error('❌ Error updating ticket priority:', error);
      throw error;
    }
  }

  /**
   * Update agent online/offline status
   */
  async updateAgentStatus(agentId, status, isOnline = null) {
    try {
      const updateData = {
        agent_status: status,
        ...(isOnline !== null && { is_online: isOnline }),
        ...(isOnline === false && { last_online_at: new Date() })
      };

      const updatedAgent = await prisma.user.update({
        where: { id: BigInt(agentId) },
        data: updateData,
        select: {
          id: true,
          name: true,
          user_type: true,
          is_online: true,
          last_online_at: true,
          agent_status: true
        }
      });

      console.log(`👨‍💼 Agent ${agentId} status updated:`, {
        status: updatedAgent.agent_status,
        is_online: updatedAgent.is_online,
        last_online_at: updatedAgent.last_online_at
      });

      return updatedAgent;
    } catch (error) {
      console.error('❌ Error updating agent status:', error);
      throw error;
    }
  }

  /**
   * Get agent status for a specific ticket
   */
  async getAgentStatus(ticketId) {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: BigInt(ticketId) },
        include: {
          agent: { 
            select: { 
              id: true, 
              name: true, 
              user_type: true, 
              is_online: true, 
              last_online_at: true, 
              agent_status: true 
            } 
          }
        }
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      return {
        is_online: ticket.agent.is_online,
        status: ticket.agent.agent_status,
        last_online_at: ticket.agent.last_online_at,
        agent_name: ticket.agent.name
      };
    } catch (error) {
      console.error('❌ Error getting agent status:', error);
      throw error;
    }
  }
}

module.exports = new CRMService(); 