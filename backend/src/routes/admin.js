const express = require('express');
const { body, validationResult } = require('express-validator');
const agentController = require('../controllers/agentController');
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
 * Admin Routes
 * All routes require admin authentication (agents and super_admins)
 */

// Apply authentication and admin middleware to all routes
router.use(authenticateJWT);
router.use(isAdmin);

// Agent Management Routes

// Create a new agent
router.post('/agents', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
], validateRequest, agentController.createAgent);

// Get all agents
router.get('/agents', agentController.getAllAgents);

// Get agent statistics
router.get('/agents/stats', agentController.getAgentStats);

// Get agent by ID
router.get('/agents/:agentId', agentController.getAgentById);

// Update agent status
router.put('/agents/:agentId/status', [
  body('status').isIn(['active', 'suspended', 'pending']).withMessage('Valid status is required')
], validateRequest, agentController.updateAgentStatus);

// Delete agent (soft delete)
router.delete('/agents/:agentId', agentController.deleteAgent);

module.exports = router; 