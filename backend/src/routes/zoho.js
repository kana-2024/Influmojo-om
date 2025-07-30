const express = require('express');
const { body, validationResult } = require('express-validator');
const zohoService = require('../services/zohoService');
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
 * Zoho CRM Integration Routes
 * Following RESTful API patterns and Zoho official documentation
 */

// Sync user contact to Zoho CRM
router.post('/sync-contact', [
  body('userData').isObject().withMessage('User data is required'),
  body('userData.email').optional().isEmail().withMessage('Valid email is required'),
  body('userData.phone').optional().isString().withMessage('Phone must be a string'),
  body('userData.name').isString().withMessage('Name is required'),
  body('userData.user_type').isIn(['creator', 'brand', 'admin']).withMessage('Valid user type is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { userData } = req.body;
    
    console.log('🔄 Syncing user contact to Zoho CRM:', userData.id);
    
    const result = await zohoService.createOrUpdateContact(userData);
    
    res.json({
      success: true,
      message: 'Contact synced to Zoho CRM successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error syncing contact to Zoho:', error);
    res.status(500).json({
      error: 'Failed to sync contact to Zoho CRM',
      message: error.message
    });
  }
}));

// Create collaboration deal in Zoho CRM
router.post('/create-deal', [
  body('collaborationData').isObject().withMessage('Collaboration data is required'),
  body('collaborationData.campaign_title').isString().withMessage('Campaign title is required'),
  body('collaborationData.brand_name').isString().withMessage('Brand name is required'),
  body('collaborationData.creator_name').isString().withMessage('Creator name is required'),
  body('collaborationData.agreed_rate').isNumeric().withMessage('Agreed rate is required'),
  body('collaborationData.status').isString().withMessage('Status is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { collaborationData } = req.body;
    
    console.log('🤝 Creating collaboration deal in Zoho CRM:', collaborationData.id);
    
    const result = await zohoService.createDeal(collaborationData);
    
    res.json({
      success: true,
      message: 'Deal created in Zoho CRM successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error creating deal in Zoho:', error);
    res.status(500).json({
      error: 'Failed to create deal in Zoho CRM',
      message: error.message
    });
  }
}));

// Create follow-up task in Zoho CRM
router.post('/create-task', [
  body('taskData').isObject().withMessage('Task data is required'),
  body('taskData.subject').isString().withMessage('Task subject is required'),
  body('taskData.description').isString().withMessage('Task description is required'),
  body('taskData.due_date').isISO8601().withMessage('Valid due date is required'),
  body('taskData.related_to').isString().withMessage('Related entity ID is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { taskData } = req.body;
    
    console.log('📋 Creating task in Zoho CRM:', taskData.subject);
    
    const result = await zohoService.createTask(taskData);
    
    res.json({
      success: true,
      message: 'Task created in Zoho CRM successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error creating task in Zoho:', error);
    res.status(500).json({
      error: 'Failed to create task in Zoho CRM',
      message: error.message
    });
  }
}));

/**
 * Zoho Chat Integration Routes
 * Following Zoho Chat API documentation
 */

// Initialize chat widget for user
router.post('/chat/initialize', [
  body('userData').isObject().withMessage('User data is required'),
  body('userData.name').isString().withMessage('User name is required'),
  body('userData.id').optional().isString().withMessage('User ID must be a string if provided')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { userData } = req.body;
    
    console.log('💬 Initializing chat widget for user:', userData.id);
    
    const result = await zohoService.initializeChatWidget(userData);
    
    res.json({
      success: true,
      message: 'Chat widget initialized successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error initializing chat widget:', error);
    res.status(500).json({
      error: 'Failed to initialize chat widget',
      message: error.message
    });
  }
}));

// Send chat message
router.post('/chat/send-message', [
  body('visitorId').isString().withMessage('Visitor ID is required'),
  body('message').isString().withMessage('Message is required'),
  body('messageType').optional().isIn(['text', 'file', 'image']).withMessage('Valid message type is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { visitorId, message, messageType = 'text' } = req.body;
    
    console.log('💬 Sending chat message for visitor:', visitorId);
    
    const result = await zohoService.sendChatMessage(visitorId, message, messageType);
    
    res.json({
      success: true,
      message: 'Chat message sent successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending chat message:', error);
    res.status(500).json({
      error: 'Failed to send chat message',
      message: error.message
    });
  }
}));

// Get chat history
router.get('/chat/history/:visitorId', asyncHandler(async (req, res) => {
  try {
    const { visitorId } = req.params;
    const { limit = 50 } = req.query;
    
    console.log('📜 Getting chat history for visitor:', visitorId);
    
    const result = await zohoService.getChatHistory(visitorId, parseInt(limit));
    
    res.json({
      success: true,
      message: 'Chat history retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error getting chat history:', error);
    res.status(500).json({
      error: 'Failed to get chat history',
      message: error.message
    });
  }
}));

/**
 * Zoho Webhook Handler
 * Following Zoho Webhook documentation
 */
router.post('/webhook', asyncHandler(async (req, res) => {
  try {
    const webhookData = req.body;
    
    console.log('📥 Zoho webhook received:', webhookData.module, webhookData.operation);
    
    const result = await zohoService.handleWebhook(webhookData);
    
    res.json({
      success: true,
      message: 'Webhook processed successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error processing Zoho webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      message: error.message
    });
  }
}));

/**
 * Zoho Configuration Routes
 */

// Get Zoho configuration status
router.get('/config/status', asyncHandler(async (req, res) => {
  try {
    const config = {
      clientId: !!process.env.ZOHO_CLIENT_ID,
      clientSecret: !!process.env.ZOHO_CLIENT_SECRET,
      refreshToken: !!process.env.ZOHO_REFRESH_TOKEN,
      baseUrl: process.env.ZOHO_BASE_URL || 'https://www.zohoapis.com',
      chatBaseUrl: process.env.ZOHO_CHAT_BASE_URL || 'https://livechat.zoho.com',
      webhookSecret: !!process.env.ZOHO_WEBHOOK_SECRET
    };
    
    const isConfigured = config.clientId && config.clientSecret && config.refreshToken;
    
    res.json({
      success: true,
      configured: isConfigured,
      config: config
    });
  } catch (error) {
    console.error('❌ Error getting Zoho config status:', error);
    res.status(500).json({
      error: 'Failed to get configuration status',
      message: error.message
    });
  }
}));

// Test Zoho connection
router.post('/test-connection', asyncHandler(async (req, res) => {
  try {
    console.log('🔗 Testing Zoho connection...');
    
    // Test access token generation
    const accessToken = await zohoService.getAccessToken();
    
    res.json({
      success: true,
      message: 'Zoho connection test successful',
      data: {
        accessToken: !!accessToken,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Zoho connection test failed:', error);
    res.status(500).json({
      error: 'Zoho connection test failed',
      message: error.message
    });
  }
}));

module.exports = router; 