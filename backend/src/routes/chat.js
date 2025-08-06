const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/isSuperAdmin');
const asyncHandler = require('../utils/asyncHandler');
const streamService = require('../services/streamService');
const { PrismaClient } = require('../generated/client');

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
 * Chat Routes for StreamChat Integration
 * Handles agent-mediated support conversations
 */

// Get StreamChat token for user
router.get('/token', authenticateJWT, asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const userId = `${user.user_type}-${user.id}`;
    
    console.log(`🔑 Generating StreamChat token for user: ${userId}`);
    
    // Create or get user in StreamChat
    await streamService.createOrGetUser(userId, {
      name: user.name || userId,
      image: user.profile_image_url || null,
      role: user.user_type === 'admin' ? 'admin' : 'user'
    });
    
    // Generate token
    const token = await streamService.generateUserToken(userId);
    
    res.json({
      success: true,
      message: 'StreamChat token generated successfully',
      data: {
        token,
        userId,
        apiKey: process.env.STREAM_API_KEY
      }
    });
  } catch (error) {
    console.error('❌ Error generating StreamChat token:', error);
    res.status(500).json({
      error: 'Failed to generate StreamChat token',
      message: error.message
    });
  }
}));

// Join ticket channel (when user clicks "Contact Support")
router.post('/tickets/:ticketId/join', authenticateJWT, asyncHandler(async (req, res) => {
  try {
    const { ticketId } = req.params;
    const user = req.user;
    const userId = `${user.user_type}-${user.id}`;
    
    console.log(`👤 User ${userId} requesting to join ticket ${ticketId}`);
    
    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: BigInt(ticketId) },
      include: {
        order: {
          include: {
            brand: { include: { user: true } },
            creator: { include: { user: true } }
          }
        },
        agent: true
      }
    });
    
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'No ticket found with this ID'
      });
    }
    
    // Check if user has permission to join this ticket
    const canJoin = await checkUserPermission(user, ticket);
    if (!canJoin) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to join this ticket'
      });
    }
    
    // Get or create StreamChat channel
    let channelId = ticket.stream_channel_id;
    if (!channelId) {
      // Create new channel if it doesn't exist
      channelId = await streamService.createTicketChannel(ticketId, ticket.agent_id.toString());
      
      // Update ticket with channel ID
      await prisma.ticket.update({
        where: { id: BigInt(ticketId) },
        data: { stream_channel_id: channelId }
      });
    }
    
    // Add user to channel
    await streamService.addUserToChannel(channelId, userId);
    
    // Send system message
    await streamService.sendSystemMessage(
      channelId, 
      `${user.name || userId} has joined the support conversation`
    );
    
    res.json({
      success: true,
      message: 'User added to ticket channel successfully',
      data: {
        channelId,
        ticketId,
        userId
      }
    });
  } catch (error) {
    console.error('❌ Error joining ticket channel:', error);
    res.status(500).json({
      error: 'Failed to join ticket channel',
      message: error.message
    });
  }
}));

// Leave ticket channel
router.post('/tickets/:ticketId/leave', authenticateJWT, asyncHandler(async (req, res) => {
  try {
    const { ticketId } = req.params;
    const user = req.user;
    const userId = `${user.user_type}-${user.id}`;
    
    console.log(`👤 User ${userId} requesting to leave ticket ${ticketId}`);
    
    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: BigInt(ticketId) }
    });
    
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'No ticket found with this ID'
      });
    }
    
    if (!ticket.stream_channel_id) {
      return res.status(400).json({
        error: 'No channel found',
        message: 'This ticket does not have an associated chat channel'
      });
    }
    
    // Remove user from channel
    await streamService.removeUserFromChannel(ticket.stream_channel_id, userId);
    
    res.json({
      success: true,
      message: 'User removed from ticket channel successfully',
      data: {
        channelId: ticket.stream_channel_id,
        ticketId,
        userId
      }
    });
  } catch (error) {
    console.error('❌ Error leaving ticket channel:', error);
    res.status(500).json({
      error: 'Failed to leave ticket channel',
      message: error.message
    });
  }
}));

// Get user's active channels
router.get('/channels', authenticateJWT, asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const userId = `${user.user_type}-${user.id}`;
    
    console.log(`📋 Getting channels for user ${userId}`);
    
    const channels = await streamService.getUserChannels(userId);
    
    // Get ticket information for each channel
    const channelsWithTickets = await Promise.all(
      channels.map(async (channel) => {
        const ticketId = channel.data?.ticket_id;
        if (!ticketId) return { ...channel, ticket: null };
        
        const ticket = await prisma.ticket.findUnique({
          where: { id: BigInt(ticketId) },
          include: {
            order: {
              include: {
                brand: { include: { user: true } },
                creator: { include: { user: true } },
                package: true
              }
            },
            agent: true
          }
        });
        
        return {
          ...channel,
          ticket
        };
      })
    );
    
    res.json({
      success: true,
      message: 'User channels retrieved successfully',
      data: {
        channels: channelsWithTickets,
        total: channelsWithTickets.length
      }
    });
  } catch (error) {
    console.error('❌ Error getting user channels:', error);
    res.status(500).json({
      error: 'Failed to get user channels',
      message: error.message
    });
  }
}));

// Get channel information
router.get('/channels/:channelId', authenticateJWT, asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    const user = req.user;
    const userId = `${user.user_type}-${user.id}`;
    
    console.log(`📊 Getting channel info for ${channelId}`);
    
    const channelInfo = await streamService.getChannelInfo(channelId);
    
    // Check if user is a member of this channel
    const isMember = channelInfo.members.some(member => member.user_id === userId);
    if (!isMember && user.user_type !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this channel'
      });
    }
    
    res.json({
      success: true,
      message: 'Channel information retrieved successfully',
      data: channelInfo
    });
  } catch (error) {
    console.error('❌ Error getting channel info:', error);
    res.status(500).json({
      error: 'Failed to get channel information',
      message: error.message
    });
  }
}));

// Helper function to check user permission for ticket
async function checkUserPermission(user, ticket) {
  // Admin users can join any ticket
  if (user.user_type === 'admin') {
    return true;
  }
  
  // Agent users can only join their assigned tickets
  if (user.user_type === 'admin' && ticket.agent_id === user.id) {
    return true;
  }
  
  // Brand users can only join tickets for their orders
  if (user.user_type === 'brand' && ticket.order?.brand?.user_id === user.id) {
    return true;
  }
  
  // Creator users can only join tickets for their orders
  if (user.user_type === 'creator' && ticket.order?.creator?.user_id === user.id) {
    return true;
  }
  
  return false;
}

module.exports = router; 