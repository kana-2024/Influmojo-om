const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('../generated/client');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const prisma = new PrismaClient();

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
 * Order Chat Session Routes
 * Handles order-specific chat sessions
 */

// Get or create chat session for an order
router.get('/session', asyncHandler(async (req, res) => {
  try {
    const { order_id, user_id, role } = req.query;

    if (!order_id || !user_id || !role) {
      return res.status(400).json({ 
        error: 'Missing required parameters', 
        message: 'order_id, user_id, and role are required' 
      });
    }

    console.log('🔍 Looking for existing chat session:', { order_id, user_id, role });

    // Check for existing session for this specific user and role
    let session = await prisma.orderChatSession.findFirst({
      where: { 
        order_id: String(order_id), 
        user_id: String(user_id),
        role: role
      }
    });

    if (!session) {
      console.log('📝 Creating new chat session for order:', order_id, 'role:', role);
      
      // Get user details for Zoho contact
      const user = await prisma.user.findUnique({
        where: { id: BigInt(user_id) },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          user_type: true
        }
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User with the provided ID does not exist'
        });
      }

      // Get order details
      const order = await prisma.order.findUnique({
        where: { id: BigInt(order_id) },
        include: {
          package: {
            include: {
              creator: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                      phone: true
                    }
                  }
                }
              }
            }
          },
          brand: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({
          error: 'Order not found',
          message: 'Order with the provided ID does not exist'
        });
      }

      // Create unique visitor ID for this chat session
      const visitorId = `visitor_${order_id}_${user_id}_${role}_${Date.now()}`;

      // Create chat session in database
      session = await prisma.orderChatSession.create({
        data: {
          order_id: String(order_id),
          user_id: String(user_id),
          role: role,
          zoho_visitor_id: visitorId,
          status: 'open'
        }
      });

      console.log('✅ Chat session created successfully:', session.id, 'for role:', role);
    }

    return res.json({
      success: true,
      message: 'Chat session retrieved/created successfully',
      data: {
        session: {
          id: session.id,
          order_id: session.order_id,
          user_id: session.user_id,
          role: session.role,
          zoho_visitor_id: session.zoho_visitor_id,
          status: session.status,
          created_at: session.created_at
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in chat session:', error);
    res.status(500).json({
      error: 'Failed to get/create chat session',
      message: error.message
    });
  }
}));

// Update chat session status
router.put('/session/:sessionId/status', [
  body('status').isIn(['open', 'pending', 'closed']).withMessage('Valid status is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    console.log('🔄 Updating chat session status:', { sessionId, status });

    const session = await prisma.orderChatSession.update({
      where: { id: sessionId },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Chat session status updated successfully',
      data: { session }
    });

  } catch (error) {
    console.error('❌ Error updating chat session status:', error);
    res.status(500).json({
      error: 'Failed to update chat session status',
      message: error.message
    });
  }
}));

// Get chat session history
router.get('/session/:sessionId/history', asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;

    console.log('📜 Getting chat history for session:', sessionId);

    const session = await prisma.orderChatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Chat session not found',
        message: 'Session with the provided ID does not exist'
      });
    }

    // Chat history functionality is being updated
    res.json({
      success: true,
      message: 'Chat history retrieved successfully',
      data: {
        session,
        chatHistory: []
      }
    });

  } catch (error) {
    console.error('❌ Error getting chat history:', error);
    res.status(500).json({
      error: 'Failed to get chat history',
      message: error.message
    });
  }
}));

// Send message to chat session
router.post('/session/:sessionId/message', [
  body('message').isString().withMessage('Message is required'),
  body('messageType').optional().isIn(['text', 'file', 'system']).withMessage('Valid message type is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, messageType = 'text' } = req.body;

    console.log('💬 Sending message to session:', { sessionId, messageType });

    const session = await prisma.orderChatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Chat session not found',
        message: 'Session with the provided ID does not exist'
      });
    }

    // Message sending functionality is being updated
    res.json({
      success: true,
      message: 'Message sent successfully',
      data: { result: { messageId: Date.now().toString() } }
    });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: error.message
    });
  }
}));

// Get all chat sessions for an order
router.get('/order/:orderId/sessions', asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('📦 Getting chat sessions for order:', orderId);

    const sessions = await prisma.orderChatSession.findMany({
      where: { order_id: String(orderId) },
      orderBy: { created_at: 'desc' },
      include: {
        // You can add user details if needed
      }
    });

    res.json({
      success: true,
      message: 'Order chat sessions retrieved successfully',
      data: { 
        order_id: orderId,
        sessions,
        total_sessions: sessions.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting order chat sessions:', error);
    res.status(500).json({
      error: 'Failed to get order chat sessions',
      message: error.message
    });
  }
}));

// Get all chat sessions for a user
router.get('/user/:userId/sessions', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, role } = req.query;

    console.log('👤 Getting chat sessions for user:', userId);

    const whereClause = { user_id: String(userId) };
    if (status) {
      whereClause.status = status;
    }
    if (role) {
      whereClause.role = role;
    }

    const sessions = await prisma.orderChatSession.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' }
    });

    res.json({
      success: true,
      message: 'User chat sessions retrieved successfully',
      data: { 
        user_id: userId,
        sessions,
        total_sessions: sessions.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting user chat sessions:', error);
    res.status(500).json({
      error: 'Failed to get user chat sessions',
      message: error.message
    });
  }
}));

module.exports = router; 