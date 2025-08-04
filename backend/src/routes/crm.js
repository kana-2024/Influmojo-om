const express = require('express');
const { body, validationResult } = require('express-validator');
const crmService = require('../services/crmService');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/isSuperAdmin');
const asyncHandler = require('../utils/asyncHandler');

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
 * All routes require authentication and admin privileges
 */

// Apply authentication and admin middleware to all routes
router.use(authenticateJWT);
router.use(isAdmin);

// Create a new ticket for an order
router.post('/tickets', [
  body('order_id').isInt().withMessage('Valid order_id is required'),
  body('stream_channel_id').isString().withMessage('StreamChat channel ID is required')
], validateRequest, asyncHandler(async (req, res) => {
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

// Get ticket by order ID
router.get('/tickets/order/:orderId', asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('🔍 Getting ticket for order:', orderId);

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

// Update ticket status
router.put('/tickets/:ticketId/status', [
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Valid status is required')
], validateRequest, asyncHandler(async (req, res) => {
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

// Add message to ticket
router.post('/tickets/:ticketId/messages', [
  body('sender_id').isInt().withMessage('Valid sender_id is required'),
  body('message_text').isString().withMessage('Message text is required'),
  body('message_type').optional().isIn(['text', 'file', 'system']).withMessage('Valid message type is required'),
  body('file_url').optional().isString().withMessage('File URL must be a string'),
  body('file_name').optional().isString().withMessage('File name must be a string')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { sender_id, message_text, message_type = 'text', file_url, file_name } = req.body;

    console.log('💬 Adding message to ticket:', ticketId);

    const message = await crmService.addMessage(
      ticketId, 
      sender_id, 
      message_text, 
      message_type, 
      file_url, 
      file_name
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

// Get all tickets for an agent
router.get('/agent/:agentId/tickets', asyncHandler(async (req, res) => {
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

// Get all tickets (admin dashboard)
router.get('/tickets', asyncHandler(async (req, res) => {
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

// Reassign ticket to different agent
router.put('/tickets/:ticketId/reassign', [
  body('new_agent_id').isInt().withMessage('Valid new_agent_id is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { new_agent_id } = req.body;

    console.log('🔄 Reassigning ticket:', { ticketId, new_agent_id });

    const ticket = await crmService.reassignTicket(ticketId, new_agent_id);

    res.json({
      success: true,
      message: 'Ticket reassigned successfully',
      data: { ticket }
    });

  } catch (error) {
    console.error('❌ Error reassigning ticket:', error);
    res.status(500).json({
      error: 'Failed to reassign ticket',
      message: error.message
    });
  }
}));

module.exports = router; 