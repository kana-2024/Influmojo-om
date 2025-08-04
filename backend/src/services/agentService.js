const { PrismaClient } = require('../generated/client');

const prisma = new PrismaClient();

class AgentService {
  /**
   * Create a new agent (admin user)
   * Only accessible by super_admin users
   */
  async createAgent(email, name, createdBySuperAdminId) {
    try {
      // Validate input
      if (!email || !name) {
        throw new Error('Email and name are required');
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('Agent with this email already exists');
      }

      // Create agent user
      const agent = await prisma.user.create({
        data: {
          email,
          name,
          user_type: 'admin',
          status: 'active',
          email_verified: false, // Will need to verify email
          onboarding_completed: false
        }
      });

      console.log(`✅ Agent created: ${agent.name} (${agent.email}) by super admin ${createdBySuperAdminId}`);
      
      return {
        id: agent.id,
        email: agent.email,
        name: agent.name,
        user_type: agent.user_type,
        status: agent.status,
        created_at: agent.created_at
      };
    } catch (error) {
      console.error('❌ Error creating agent:', error);
      throw error;
    }
  }

  /**
   * Get all agents (admin users)
   */
  async getAllAgents() {
    try {
      const agents = await prisma.user.findMany({
        where: { user_type: 'admin' },
        select: {
          id: true,
          email: true,
          name: true,
          user_type: true,
          status: true,
          email_verified: true,
          onboarding_completed: true,
          created_at: true,
          last_login_at: true
        },
        orderBy: { created_at: 'desc' }
      });

      return agents;
    } catch (error) {
      console.error('❌ Error getting agents:', error);
      throw error;
    }
  }

  /**
   * Get agent by ID
   */
  async getAgentById(agentId) {
    try {
      const agent = await prisma.user.findFirst({
        where: { 
          id: BigInt(agentId),
          user_type: 'admin'
        },
        select: {
          id: true,
          email: true,
          name: true,
          user_type: true,
          status: true,
          email_verified: true,
          onboarding_completed: true,
          created_at: true,
          last_login_at: true
        }
      });

      if (!agent) {
        throw new Error('Agent not found');
      }

      return agent;
    } catch (error) {
      console.error('❌ Error getting agent:', error);
      throw error;
    }
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(agentId, status, updatedBySuperAdminId) {
    try {
      const agent = await prisma.user.update({
        where: { 
          id: BigInt(agentId),
          user_type: 'admin' // Ensure we're only updating admin users
        },
        data: { status },
        select: {
          id: true,
          email: true,
          name: true,
          user_type: true,
          status: true,
          updated_at: true
        }
      });

      console.log(`✅ Agent status updated: ${agent.name} (${agent.email}) to ${status} by super admin ${updatedBySuperAdminId}`);
      
      return agent;
    } catch (error) {
      console.error('❌ Error updating agent status:', error);
      throw error;
    }
  }

  /**
   * Delete agent (soft delete by setting status to suspended)
   */
  async deleteAgent(agentId, deletedBySuperAdminId) {
    try {
      const agent = await prisma.user.update({
        where: { 
          id: BigInt(agentId),
          user_type: 'admin'
        },
        data: { status: 'suspended' },
        select: {
          id: true,
          email: true,
          name: true,
          user_type: true,
          status: true,
          updated_at: true
        }
      });

      console.log(`✅ Agent deleted (suspended): ${agent.name} (${agent.email}) by super admin ${deletedBySuperAdminId}`);
      
      return agent;
    } catch (error) {
      console.error('❌ Error deleting agent:', error);
      throw error;
    }
  }

  /**
   * Get agent statistics
   */
  async getAgentStats() {
    try {
      const totalAgents = await prisma.user.count({
        where: { user_type: 'admin' }
      });

      const activeAgents = await prisma.user.count({
        where: { 
          user_type: 'admin',
          status: 'active'
        }
      });

      const suspendedAgents = await prisma.user.count({
        where: { 
          user_type: 'admin',
          status: 'suspended'
        }
      });

      const pendingAgents = await prisma.user.count({
        where: { 
          user_type: 'admin',
          status: 'pending'
        }
      });

      return {
        total: totalAgents,
        active: activeAgents,
        suspended: suspendedAgents,
        pending: pendingAgents
      };
    } catch (error) {
      console.error('❌ Error getting agent stats:', error);
      throw error;
    }
  }
}

module.exports = new AgentService(); 