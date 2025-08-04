const { PrismaClient } = require('../generated/client');

const prisma = new PrismaClient();

class CRMService {
  /**
   * Create a new ticket for an order with round-robin agent assignment
   */
  async createTicket(orderId, streamChannelId) {
    try {
      // Get all admin users for round-robin assignment
      const adminUsers = await prisma.user.findMany({
        where: { user_type: 'admin' },
        select: { id: true }
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

      const assignedAgentId = adminUsers[nextAgentIndex].id;

      // Create the ticket
      const ticket = await prisma.ticket.create({
        data: {
          order_id: BigInt(orderId),
          agent_id: assignedAgentId,
          stream_channel_id: streamChannelId,
          status: 'open'
        },
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

      console.log(`✅ Ticket created for order ${orderId}, assigned to agent ${ticket.agent.name}`);
      return ticket;
    } catch (error) {
      console.error('❌ Error creating ticket:', error);
      throw error;
    }
  }

  /**
   * Get ticket by order ID
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
  async addMessage(ticketId, senderId, messageText, messageType = 'text', fileUrl = null, fileName = null) {
    try {
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

      console.log(`✅ Message added to ticket ${ticketId}`);
      return message;
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
}

module.exports = new CRMService(); 