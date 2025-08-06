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
      // Get all admin users for round-robin assignment
      const adminUsers = await prisma.user.findMany({
        where: { user_type: 'admin' },
        select: { id: true, name: true, email: true }
      });

      if (adminUsers.length === 0) {
        throw new Error('No admin users available for ticket assignment');
      }

      // Get the last assigned ticket to determine next agent (round-robin)
      const lastTicket = await prisma.ticket.findFirst({
        orderBy: { created_at: 'desc' },
        select: { agent_id: true }
      });

      let nextAgentIndex = 0;
      if (lastTicket) {
        const currentAgentIndex = adminUsers.findIndex(user => user.id === lastTicket.agent_id);
        nextAgentIndex = (currentAgentIndex + 1) % adminUsers.length;
      }

      const assignedAgent = adminUsers[nextAgentIndex];

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

      // Create unified StreamChat channel if not provided
      if (!streamChannelId) {
        try {
          streamChannelId = await streamService.createUnifiedTicketChannel(
            orderId.toString(),
            assignedAgent.id.toString(),
            order.brand.id.toString(),
            order.creator.id.toString()
          );
          console.log(`🎫 Unified StreamChat channel created: ${streamChannelId}`);
        } catch (streamError) {
          console.error('⚠️ Failed to create unified StreamChat channel:', streamError);
          // Continue without StreamChat channel if it fails
          streamChannelId = 'no-channel';
        }
      }

      // Ensure streamChannelId is never null
      const finalStreamChannelId = streamChannelId || 'no-channel';

      // Create the ticket using simple approach
      const ticketData = {
        order_id: BigInt(orderId),
        agent_id: assignedAgent.id,
        stream_channel_id: finalStreamChannelId,
        status: 'open'
      };

      console.log('🎫 Creating ticket with data:', {
        order_id: orderId,
        agent_id: assignedAgent.id.toString(),
        stream_channel_id: ticketData.stream_channel_id,
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

      console.log(`✅ Ticket created for order ${orderId}, assigned to agent ${ticketWithRelations.agent.name}, StreamChat channel: ${finalStreamChannelId}`);
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
  async addMessage(ticketId, senderId, messageText, messageType = 'text', fileUrl = null, fileName = null, senderRole = null) {
    try {
      // Get sender information to determine role if not provided
      let role = senderRole;
      if (!role) {
        const sender = await prisma.user.findUnique({
          where: { id: BigInt(senderId) },
          select: { user_type: true }
        });
        role = sender?.user_type || 'agent';
      }

      const message = await prisma.message.create({
        data: {
          ticket_id: BigInt(ticketId),
          sender_id: BigInt(senderId),
          message_text: messageText,
          message_type: messageType,
          file_url: fileUrl,
          file_name: fileName
        },
        include: {
          sender: { select: { name: true, user_type: true } }
        }
      });

      // Add sender_role to the response
      const messageWithRole = {
        ...message,
        sender_role: role
      };

      console.log(`✅ Message added to ticket ${ticketId} with role ${role}`);
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
  async getTicketMessages(ticketId) {
    try {
      const messages = await prisma.message.findMany({
        where: { ticket_id: BigInt(ticketId) },
        include: {
          sender: { select: { name: true, user_type: true } }
        },
        orderBy: { created_at: 'asc' }
      });

      return messages.map(message => ({
        id: message.id.toString(),
        text: message.message_text,
        sender: message.sender.user_type,
        sender_name: message.sender.name,
        timestamp: message.created_at,
        message_type: message.message_type,
        file_url: message.file_url,
        file_name: message.file_name,
        sender_role: message.sender.user_type // Add sender_role to the response
      }));
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
}

module.exports = new CRMService(); 