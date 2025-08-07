const express = require('express');
const { body, validationResult } = require('express-validator');
const crmService = require('../services/crmService');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { isAdmin, hasRole } = require('../middlewares/isSuperAdmin');
const asyncHandler = require('../utils/asyncHandler');
const { PrismaClient } = require('../generated/client');

const prisma = new PrismaClient();

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('❌ Validation failed:', {
      body: req.body,
      errors: errors.array(),
      url: req.url,
      method: req.method
    });
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array(),
      body: req.body
    });
  }
  next();
};

/**
 * CRM Ticket Routes
 * Handles order-specific support tickets with StreamChat integration
 * Routes require authentication, with different access levels for users and admins
 */

// Apply authentication to all routes
router.use(authenticateJWT);

// Create a new ticket for an order (admin only)
router.post('/tickets', [
  body('order_id').isInt().withMessage('Valid order_id is required'),
  body('stream_channel_id').isString().withMessage('StreamChat channel ID is required')
], validateRequest, isAdmin, asyncHandler(async (req, res) => {
  try {
    const { order_id, stream_channel_id } = req.body;

    console.log('🎫 Creating new ticket for order:', order_id);

    const ticket = await crmService.createTicket(order_id, stream_channel_id);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: { ticket }
    });

  } catch (error) {
    console.error('❌ Error creating ticket:', error);
    res.status(500).json({
      error: 'Failed to create ticket',
      message: error.message
    });
  }
}));

// Get messages for a specific ticket (users can access their own tickets)
router.get('/tickets/:ticketId/messages', asyncHandler(async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { loadOlderMessages = false, userId: queryUserId, userType: queryUserType, channelType: queryChannelType } = req.query;
    
    // Use authenticated user info first, fallback to query parameters
    const userId = req.user?.id || queryUserId;
    const userType = req.user?.user_type || queryUserType;

    console.log('💬 Getting messages for ticket:', ticketId, 'by user:', userId, 'type:', userType, 'loadOlderMessages:', loadOlderMessages, 'channelType:', queryChannelType);

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User ID not found in token or query parameters'
      });
    }

    // First, check if the user has access to this ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: BigInt(ticketId) },
      include: {
        order: {
          include: {
            brand: { include: { user: true } },
            creator: { include: { user: true } }
          }
        },
        agent: { select: { id: true, name: true, user_type: true } }
      }
    });

    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'The specified ticket does not exist'
      });
    }

    // Check if user has access to this ticket
    const hasAccess = 
      userType === 'agent' || 
      userType === 'super_admin' ||
      ticket.order.brand.user.id.toString() === userId.toString() ||
      ticket.order.creator.user.id.toString() === userId.toString();

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this ticket'
      });
    }

    // Determine channel type based on user type if not provided
    let finalChannelType = queryChannelType;
    if (!finalChannelType) {
      if (userType === 'brand') {
        finalChannelType = 'brand_agent';
      } else if (userType === 'creator') {
        finalChannelType = 'creator_agent';
      }
      // For agents, don't filter by channel type - they can see all messages
    }

    // Get messages with agent status consideration and channel filtering
    const result = await crmService.getTicketMessages(
      ticketId, 
      userId.toString(), 
      userType, 
      loadOlderMessages === 'true',
      finalChannelType
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error getting ticket messages:', error);
    res.status(500).json({
      error: 'Failed to get ticket messages',
      message: error.message
    });
  }
}));

// Add message to ticket
router.post('/tickets/:ticketId/messages', [
  body('message_text').optional().isString().withMessage('Message text must be a string'),
  body('message').optional().isString().withMessage('Message must be a string'),
  body('message_type').optional().isIn(['text', 'file', 'system']).withMessage('Valid message type is required'),
  body('file_url').optional().isString().withMessage('File URL must be a string'),
  body('file_name').optional().isString().withMessage('File name must be a string'),
  body('sender_role').optional().isIn(['brand', 'creator', 'agent', 'system']).withMessage('Valid sender role is required'),
  body('channel_type').optional().isIn(['brand_agent', 'creator_agent']).withMessage('Valid channel type is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, message_text, message_type = 'text', file_url, file_name, sender_role, channel_type } = req.body;
    const userId = req.user?.id;
    const userType = req.user?.user_type;

    console.log('💬 Adding message to ticket:', ticketId, 'with role:', sender_role, 'channel_type:', channel_type, 'by user:', userId, 'type:', userType);
    console.log('📝 Message data received:', { message, message_text, message_type, sender_role, channel_type });

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User ID not found in token'
      });
    }

    // Get message content from either 'message' or 'message_text' field
    const messageContent = message || message_text;
    
    console.log('🔍 Message content extraction:', {
      message,
      message_text,
      messageContent,
      messageContentType: typeof messageContent,
      messageContentLength: messageContent ? messageContent.length : 0,
      messageContentTrimmed: messageContent ? messageContent.trim().length : 0
    });
    
    // Validate message content
    if (!messageContent || typeof messageContent !== 'string' || messageContent.trim().length === 0) {
      console.error('❌ Message validation failed:', {
        hasMessageContent: !!messageContent,
        messageContentType: typeof messageContent,
        messageContentLength: messageContent ? messageContent.length : 0,
        messageContentTrimmed: messageContent ? messageContent.trim().length : 0
      });
      return res.status(400).json({
        error: 'Invalid message',
        message: 'Message text is required and cannot be empty. Please provide either "message" or "message_text" field.'
      });
    }

    // First, check if the user has access to this ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: BigInt(ticketId) },
      include: {
        order: {
          include: {
            brand: { include: { user: true } },
            creator: { include: { user: true } }
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'No ticket found with this ID'
      });
    }

    // Check if user has access to this ticket
    const hasAccess = 
      userType === 'agent' || 
      userType === 'super_admin' ||
      (userType === 'brand' && ticket.order.brand.user.id === BigInt(userId)) ||
      (userType === 'creator' && ticket.order.creator.user.id === BigInt(userId));

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this ticket'
      });
    }

    // Determine sender role if not provided
    let finalSenderRole = sender_role;
    if (!finalSenderRole) {
      if (userType === 'agent' || userType === 'super_admin') {
        finalSenderRole = 'agent';
      } else {
        finalSenderRole = userType;
      }
    }

    // Determine channel type if not provided
    let finalChannelType = channel_type;
    if (!finalChannelType) {
      if (userType === 'brand') {
        finalChannelType = 'brand_agent';
      } else if (userType === 'creator') {
        finalChannelType = 'creator_agent';
      } else if (userType === 'agent' || userType === 'super_admin') {
        // For agents, default to brand_agent channel
        finalChannelType = 'brand_agent';
      } else {
        finalChannelType = 'brand_agent'; // Default fallback
      }
    }

    const messageData = await crmService.addMessage(
      ticketId, 
      userId.toString(), // Use authenticated user's ID
      messageContent.trim(), 
      message_type, 
      file_url, 
      file_name,
      finalSenderRole,
      finalChannelType
    );

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      data: { message: messageData }
    });

  } catch (error) {
    console.error('❌ Error adding message:', error);
    res.status(500).json({
      error: 'Failed to add message',
      message: error.message
    });
  }
}));

// Get ticket by order ID (users can access their own tickets)
router.get('/tickets/order/:orderId', asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;
    const userType = req.user?.user_type;

    console.log('🔍 Getting ticket for order:', orderId, 'by user:', userId, 'type:', userType);

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User ID not found in token'
      });
    }

    // First, check if the user has access to this order
    const order = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        brand: { include: { user: true } },
        creator: { include: { user: true } }
      }
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with this ID'
      });
    }

    // Check if user has access to this order
    const hasAccess = 
      userType === 'agent' || 
      userType === 'super_admin' ||
      (userType === 'brand' && order.brand.user.id === BigInt(userId)) ||
      (userType === 'creator' && order.creator.user.id === BigInt(userId));

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this ticket'
      });
    }

    const ticket = await crmService.getTicketByOrderId(orderId);

    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'No ticket found for this order'
      });
    }

    res.json({
      success: true,
      message: 'Ticket retrieved successfully',
      data: { ticket }
    });

  } catch (error) {
    console.error('❌ Error getting ticket:', error);
    res.status(500).json({
      error: 'Failed to get ticket',
      message: error.message
    });
  }
}));

// Update ticket status (admin only)
router.put('/tickets/:ticketId/status', [
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Valid status is required')
], validateRequest, isAdmin, asyncHandler(async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    console.log('🔄 Updating ticket status:', { ticketId, status });

    const ticket = await crmService.updateTicketStatus(ticketId, status);

    res.json({
      success: true,
      message: 'Ticket status updated successfully',
      data: { ticket }
    });

  } catch (error) {
    console.error('❌ Error updating ticket status:', error);
    res.status(500).json({
      error: 'Failed to update ticket status',
      message: error.message
    });
  }
}));

// Get all tickets for an agent (admin only)
router.get('/agent/:agentId/tickets', isAdmin, asyncHandler(async (req, res) => {
  try {
    const { agentId } = req.params;
    const { status } = req.query;

    console.log('👤 Getting tickets for agent:', agentId, 'status:', status);

    const tickets = await crmService.getAgentTickets(agentId, status);

    res.json({
      success: true,
      message: 'Agent tickets retrieved successfully',
      data: { 
        agent_id: agentId,
        tickets,
        total_tickets: tickets.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting agent tickets:', error);
    res.status(500).json({
      error: 'Failed to get agent tickets',
      message: error.message
    });
  }
}));

// Get all tickets (admin dashboard - admin only)
router.get('/tickets', isAdmin, asyncHandler(async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    console.log('📊 Getting all tickets:', { status, limit, offset });

    const result = await crmService.getAllTickets(status, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      message: 'Tickets retrieved successfully',
      data: { 
        tickets: result.tickets,
        total: result.total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('❌ Error getting all tickets:', error);
    res.status(500).json({
      error: 'Failed to get tickets',
      message: error.message
    });
  }
}));

// Get tickets assigned to current agent
router.get('/tickets/my', asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.user_type;
    const { view = 'assigned' } = req.query; // 'assigned' or 'overview'

    console.log('🎫 Getting tickets for user:', userId, 'type:', userType, 'view:', view);

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User ID not found in token'
      });
    }

    // Check if user is an agent or super_admin
    if (userType !== 'agent' && userType !== 'super_admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: `Only agents and super admins can access this endpoint. User type: ${userType}`
      });
    }

    // Get tickets based on user type and view preference
    let tickets;
    if (userType === 'super_admin') {
      // Super admins can see all tickets
      tickets = await prisma.ticket.findMany({
        include: {
          order: {
            include: {
              package: true,
              brand: {
                include: {
                  user: true
                }
              },
              creator: {
                include: {
                  user: true
                }
              }
            }
          },
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
              user_type: true
            }
          },
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  user_type: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });
    } else if (userType === 'agent') {
      // Agents can see their assigned tickets or overview of all tickets
      if (view === 'overview') {
        // Show all tickets for overview
        tickets = await prisma.ticket.findMany({
          include: {
            order: {
              include: {
                package: true,
                brand: {
                  include: {
                    user: true
                  }
                },
                creator: {
                  include: {
                    user: true
                  }
                }
              }
            },
            agent: {
              select: {
                id: true,
                name: true,
                email: true,
                user_type: true
              }
            },
            messages: {
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    user_type: true
                  }
                }
              },
              orderBy: {
                created_at: 'desc'
              },
              take: 1
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        });
      } else {
        // Show only assigned tickets (default view)
        tickets = await prisma.ticket.findMany({
          where: {
            agent_id: BigInt(userId)
          },
          include: {
            order: {
              include: {
                package: true,
                brand: {
                  include: {
                    user: true
                  }
                },
                creator: {
                  include: {
                    user: true
                  }
                }
              }
            },
            agent: {
              select: {
                id: true,
                name: true,
                email: true,
                user_type: true
              }
            },
            messages: {
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    user_type: true
                  }
                }
              },
              orderBy: {
                created_at: 'desc'
              },
              take: 1
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        });
      }
    }

    // Transform tickets for response
    const transformedTickets = tickets.map(ticket => ({
      id: ticket.id.toString(),
      order_id: ticket.order_id.toString(),
      agent_id: ticket.agent_id.toString(),
      stream_channel_id: ticket.stream_channel_id,
      status: ticket.status,
      priority: ticket.priority,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      agent: ticket.agent ? {
        id: ticket.agent.id.toString(),
        name: ticket.agent.name,
        email: ticket.agent.email,
        user_type: ticket.agent.user_type
      } : null,
      order: ticket.order ? {
        id: ticket.order.id.toString(),
        package: ticket.order.package ? {
          title: ticket.order.package.title,
          description: ticket.order.package.description,
          price: ticket.order.package.price.toString(),
          currency: ticket.order.package.currency
        } : null,
        brand: ticket.order.brand ? {
          company_name: ticket.order.brand.company_name,
          user: ticket.order.brand.user ? {
            id: ticket.order.brand.user.id.toString(),
            name: ticket.order.brand.user.name,
            email: ticket.order.brand.user.email
          } : null
        } : null,
        creator: ticket.order.creator ? {
          id: ticket.order.creator.id.toString(),
          name: ticket.order.creator.name,
          email: ticket.order.creator.email,
          user: ticket.order.creator.user ? {
            id: ticket.order.creator.user.id.toString(),
            name: ticket.order.creator.user.name,
            email: ticket.order.creator.user.email
          } : null
        } : null
      } : null,
      messages: ticket.messages.map(message => ({
        id: message.id.toString(),
        ticket_id: message.ticket_id.toString(),
        sender_id: message.sender_id.toString(),
        message_text: message.message_text,
        message_type: message.message_type,
        file_url: message.file_url,
        file_name: message.file_name,
        read_at: message.read_at,
        created_at: message.created_at,
        sender: message.sender ? {
          id: message.sender.id.toString(),
          name: message.sender.name,
          user_type: message.sender.user_type
        } : null
      }))
    }));

    res.json({
      success: true,
      message: 'Tickets retrieved successfully',
      data: { 
        tickets: transformedTickets,
        view: view,
        user_type: userType,
        total_tickets: transformedTickets.length,
        view_type: userType === 'super_admin' ? 'all' : (view === 'overview' ? 'overview' : 'assigned')
      }
    });

  } catch (error) {
    console.error('❌ Error getting tickets:', error);
    res.status(500).json({
      error: 'Failed to get tickets',
      message: error.message
    });
  }
}));

// Get a single ticket by ID (admin only)
router.get('/tickets/:ticketId', isAdmin, asyncHandler(async (req, res) => {
  try {
    const { ticketId } = req.params;

    console.log('🎫 Getting ticket by ID:', ticketId);

    const ticket = await prisma.ticket.findUnique({
      where: { id: BigInt(ticketId) },
      include: {
        order: {
          include: {
            brand: { 
              include: { 
                user: true 
              } 
            },
            creator: { 
              include: { 
                user: true 
              } 
            },
            package: true
          }
        },
        agent: true,
        messages: {
          orderBy: {
            created_at: 'asc'
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'No ticket found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Ticket retrieved successfully',
      data: { ticket }
    });

  } catch (error) {
    console.error('❌ Error getting ticket:', error);
    res.status(500).json({
      error: 'Failed to get ticket',
      message: error.message
    });
  }
}));

// Reassign ticket to different agent (admin only)
router.put('/tickets/:ticketId/reassign', [
  body('agent_id').isInt().withMessage('Valid agent_id is required')
], validateRequest, isAdmin, asyncHandler(async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { agent_id } = req.body;

    console.log('🔄 Reassigning ticket:', { ticketId, agent_id });

    const ticket = await crmService.reassignTicket(ticketId, agent_id);

    res.json({
      success: true,
      message: 'Ticket reassigned successfully',
      data: { 
        ticket,
        agent_name: ticket.agent?.name || `Agent ${agent_id}`
      }
    });

  } catch (error) {
    console.error('❌ Error reassigning ticket:', error);
    res.status(500).json({
      error: 'Failed to reassign ticket',
      message: error.message
    });
  }
}));

// Update ticket priority (admin only)
router.put('/tickets/:ticketId/priority', [
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Valid priority is required')
], validateRequest, isAdmin, asyncHandler(async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { priority } = req.body;

    console.log('🎯 Updating ticket priority:', { ticketId, priority });

    const ticket = await crmService.updateTicketPriority(ticketId, priority);

    res.json({
      success: true,
      message: 'Ticket priority updated successfully',
      data: { ticket }
    });

  } catch (error) {
    console.error('❌ Error updating ticket priority:', error);
    res.status(500).json({
      error: 'Failed to update ticket priority',
      message: error.message
    });
  }
}));

// Update agent status (online/offline)
router.put('/agent/status', asyncHandler(async (req, res) => {
  try {
    const { status, isOnline } = req.body;
    const userId = req.user?.id;
    const userType = req.user?.user_type;

    console.log('👨‍💼 Updating agent status:', { userId, userType, status, isOnline });

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User ID not found in token'
      });
    }

    if (userType !== 'agent' && userType !== 'super_admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only agents can update their status'
      });
    }

    if (!status || !['available', 'busy', 'offline', 'away'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: available, busy, offline, away'
      });
    }

    const updatedAgent = await crmService.updateAgentStatus(userId, status, isOnline);

    res.json({
      success: true,
      message: 'Agent status updated successfully',
      data: updatedAgent
    });

  } catch (error) {
    console.error('❌ Error updating agent status:', error);
    res.status(500).json({
      error: 'Failed to update agent status',
      message: error.message
    });
  }
}));

// Get agent status for a specific ticket
router.get('/tickets/:ticketId/agent-status', asyncHandler(async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user?.id;

    console.log('👨‍💼 Getting agent status for ticket:', ticketId, 'by user:', userId);

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User ID not found in token'
      });
    }

    const agentStatus = await crmService.getAgentStatus(ticketId);

    res.json({
      success: true,
      data: agentStatus
    });

  } catch (error) {
    console.error('❌ Error getting agent status:', error);
    res.status(500).json({
      error: 'Failed to get agent status',
      message: error.message
    });
  }
}));

module.exports = router; 