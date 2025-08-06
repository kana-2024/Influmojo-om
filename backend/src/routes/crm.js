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
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
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
    const userId = req.user?.id;
    const userType = req.user?.user_type;

    console.log('💬 Getting messages for ticket:', ticketId, 'by user:', userId, 'type:', userType);

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User ID not found in token'
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
      userType === 'admin' || 
      userType === 'super_admin' ||
      (userType === 'brand' && ticket.order.brand.user.id === BigInt(userId)) ||
      (userType === 'creator' && ticket.order.creator.user.id === BigInt(userId));

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this ticket'
      });
    }

    const messages = await crmService.getTicketMessages(ticketId);

    res.json({
      success: true,
      message: 'Messages retrieved successfully',
      data: { messages }
    });

  } catch (error) {
    console.error('❌ Error getting ticket messages:', error);
    res.status(500).json({
      error: 'Failed to get messages',
      message: error.message
    });
  }
}));

// Add message to ticket (users can add messages to their own tickets)
router.post('/tickets/:ticketId/messages', [
  body('message_text').isString().withMessage('Message text is required'),
  body('message_type').optional().isIn(['text', 'file', 'system']).withMessage('Valid message type is required'),
  body('file_url').optional().isString().withMessage('File URL must be a string'),
  body('file_name').optional().isString().withMessage('File name must be a string'),
  body('sender_role').optional().isIn(['brand', 'creator', 'agent', 'system']).withMessage('Valid sender role is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message_text, message_type = 'text', file_url, file_name, sender_role } = req.body;
    const userId = req.user?.id;
    const userType = req.user?.user_type;

    console.log('💬 Adding message to ticket:', ticketId, 'with role:', sender_role, 'by user:', userId, 'type:', userType);

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User ID not found in token'
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
      userType === 'admin' || 
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
      if (userType === 'admin' || userType === 'super_admin') {
        finalSenderRole = 'agent';
      } else {
        finalSenderRole = userType;
      }
    }

    const message = await crmService.addMessage(
      ticketId, 
      userId.toString(), // Use authenticated user's ID
      message_text, 
      message_type, 
      file_url, 
      file_name,
      finalSenderRole
    );

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      data: { message }
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
      userType === 'admin' || 
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

module.exports = router; 