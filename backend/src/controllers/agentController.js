const agentService = require('../services/agentService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Create a new agent
 * POST /admin/agents
 * Body: { email, name }
 */
const createAgent = asyncHandler(async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Validate name length
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        error: 'Invalid name length',
        message: 'Name must be between 2 and 100 characters'
      });
    }

    const agent = await agentService.createAgent(email, name, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: { agent }
    });

  } catch (error) {
    console.error('❌ Error in createAgent controller:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Agent already exists',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to create agent',
      message: error.message
    });
  }
});

/**
 * Get all agents
 * GET /admin/agents
 */
const getAllAgents = asyncHandler(async (req, res) => {
  try {
    const agents = await agentService.getAllAgents();

    res.json({
      success: true,
      message: 'Agents retrieved successfully',
      data: { 
        agents,
        total: agents.length
      }
    });

  } catch (error) {
    console.error('❌ Error in getAllAgents controller:', error);
    res.status(500).json({
      error: 'Failed to get agents',
      message: error.message
    });
  }
});

/**
 * Get agent by ID
 * GET /admin/agents/:agentId
 */
const getAgentById = asyncHandler(async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!agentId) {
      return res.status(400).json({
        error: 'Missing agent ID',
        message: 'Agent ID is required'
      });
    }

    const agent = await agentService.getAgentById(agentId);

    res.json({
      success: true,
      message: 'Agent retrieved successfully',
      data: { agent }
    });

  } catch (error) {
    console.error('❌ Error in getAgentById controller:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Agent not found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to get agent',
      message: error.message
    });
  }
});

/**
 * Update agent status
 * PUT /admin/agents/:agentId/status
 * Body: { status }
 */
const updateAgentStatus = asyncHandler(async (req, res) => {
  try {
    const { agentId } = req.params;
    const { status } = req.body;

    // Validate required fields
    if (!agentId) {
      return res.status(400).json({
        error: 'Missing agent ID',
        message: 'Agent ID is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        error: 'Missing status',
        message: 'Status is required'
      });
    }

    // Validate status values
    const validStatuses = ['active', 'suspended', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: active, suspended, pending'
      });
    }

    const agent = await agentService.updateAgentStatus(agentId, status, req.user.id);

    res.json({
      success: true,
      message: 'Agent status updated successfully',
      data: { agent }
    });

  } catch (error) {
    console.error('❌ Error in updateAgentStatus controller:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Agent not found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to update agent status',
      message: error.message
    });
  }
});

/**
 * Delete agent (soft delete)
 * DELETE /admin/agents/:agentId
 */
const deleteAgent = asyncHandler(async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!agentId) {
      return res.status(400).json({
        error: 'Missing agent ID',
        message: 'Agent ID is required'
      });
    }

    const agent = await agentService.deleteAgent(agentId, req.user.id);

    res.json({
      success: true,
      message: 'Agent deleted successfully',
      data: { agent }
    });

  } catch (error) {
    console.error('❌ Error in deleteAgent controller:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Agent not found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to delete agent',
      message: error.message
    });
  }
});

/**
 * Get agent statistics
 * GET /admin/agents/stats
 */
const getAgentStats = asyncHandler(async (req, res) => {
  try {
    const stats = await agentService.getAgentStats();

    res.json({
      success: true,
      message: 'Agent statistics retrieved successfully',
      data: { stats }
    });

  } catch (error) {
    console.error('❌ Error in getAgentStats controller:', error);
    res.status(500).json({
      error: 'Failed to get agent statistics',
      message: error.message
    });
  }
});

module.exports = {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgentStatus,
  deleteAgent,
  getAgentStats
}; 