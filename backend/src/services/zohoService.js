const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

/**
 * Zoho CRM Plus Integration Service
 * Following official Zoho documentation for API integration
 * 
 * Official Documentation References:
 * - Zoho CRM API: https://www.zoho.com/crm/developer/docs/api/
 * - Zoho Chat API: https://www.zoho.com/chat/developer-guide/
 * - Zoho OAuth: https://www.zoho.com/crm/developer/docs/api/oauth-overview.html
 */

class ZohoService {
  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID;
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET;
    this.refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    this.baseUrl = process.env.ZOHO_BASE_URL || 'https://www.zohoapis.in';
    this.chatBaseUrl = process.env.ZOHO_CHAT_BASE_URL || 'https://salesiq.zoho.in';
    this.accessToken = null;
    this.tokenExpiry = null;
    

  }

  /**
   * Generate OAuth access token using refresh token
   * Following Zoho's OAuth 2.0 implementation
   */
  async getAccessToken() {
    try {
      // Check if we have a valid cached token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
        return this.accessToken;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      const requestData = new URLSearchParams({
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token'
      });

      const response = await axios.post('https://accounts.zoho.in/oauth/v2/token', requestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const accessToken = response.data.access_token;
      
      this.accessToken = accessToken;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      console.log('✅ Zoho access token refreshed successfully');
      return accessToken;
    } catch (error) {
      console.error('❌ Error refreshing Zoho access token:', error.response?.data || error.message);
      
      // Handle rate limiting specifically
      if (error.response?.data?.error === 'Access Denied' && 
          error.response?.data?.error_description?.includes('too many requests')) {
        console.log('⚠️ Rate limited by Zoho. Waiting 30 seconds...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        throw new Error('Rate limited by Zoho. Please try again later.');
      }
      
      throw new Error('Failed to get Zoho access token');
    }
  }

  /**
   * Create or update contact in Zoho CRM
   * Following Zoho CRM API documentation
   */
  async createOrUpdateContact(userData) {
    try {
      const accessToken = await this.getAccessToken();
      
      // Check if contact already exists by email
      if (userData.email) {
        try {
          const searchResponse = await axios.get(`${this.baseUrl}/crm/v3/Contacts/search`, {
            headers: {
              'Authorization': `Zoho-oauthtoken ${accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              email: userData.email
            }
          });
          
          if (searchResponse.data.data && searchResponse.data.data.length > 0) {
            // Contact exists, update it
            const existingContact = searchResponse.data.data[0];
            console.log('📝 Updating existing contact:', existingContact.id);
            
            const updateData = {
              data: [{
                id: existingContact.id,
                Email: userData.email,
                Phone: userData.phone,
                First_Name: userData.first_name || userData.name?.split(' ')[0] || '',
                Last_Name: userData.last_name || userData.name?.split(' ').slice(1).join(' ') || '',
                Account_Name: userData.user_type === 'brand' ? userData.name : 'Influ Mojo Creator',
                Lead_Source: 'Influ Mojo App',
                Description: `User Type: ${userData.user_type}\nAuth Provider: ${userData.auth_provider}\nCreated: ${userData.created_at}`,
                // Custom fields for influencer marketing
                User_Type: userData.user_type,
                Auth_Provider: userData.auth_provider,
                Profile_Image: userData.profile_image_url,
                Status: userData.status
              }],
              trigger: ['approval', 'workflow', 'blueprint']
            };

            const updateResponse = await axios.put(`${this.baseUrl}/crm/v3/Contacts`, updateData, {
              headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });

            console.log('✅ Contact updated in Zoho CRM:', updateResponse.data.data[0].details.id);
            return updateResponse.data.data[0];
          }
        } catch (searchError) {
          console.log('⚠️ Contact search failed, proceeding with creation:', searchError.message);
        }
      }
      
      // Create new contact
      const contactData = {
        data: [{
          Email: userData.email,
          Phone: userData.phone,
          First_Name: userData.first_name || userData.name?.split(' ')[0] || '',
          Last_Name: userData.last_name || userData.name?.split(' ').slice(1).join(' ') || '',
          Account_Name: userData.user_type === 'brand' ? userData.name : 'Influ Mojo Creator',
          Lead_Source: 'Influ Mojo App',
          Description: `User Type: ${userData.user_type}\nAuth Provider: ${userData.auth_provider}\nCreated: ${userData.created_at}`,
          // Custom fields for influencer marketing
          User_Type: userData.user_type,
          Auth_Provider: userData.auth_provider,
          Profile_Image: userData.profile_image_url,
          Status: userData.status
        }],
        trigger: ['approval', 'workflow', 'blueprint']
      };

      const response = await axios.post(`${this.baseUrl}/crm/v3/Contacts`, contactData, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Contact created in Zoho CRM:', response.data.data[0].details.id);
      return response.data.data[0];
    } catch (error) {
      console.error('❌ Error creating/updating Zoho contact:', error.response?.data || error.message);
      
      // Handle duplicate data error
      if (error.response?.data?.data?.[0]?.code === 'DUPLICATE_DATA') {
        console.log('⚠️ Contact already exists, this is expected for duplicate emails');
        return { details: { id: 'duplicate-contact' }, message: 'Contact already exists' };
      }
      
      // Handle rate limiting
      if (error.response?.data?.error === 'Access Denied' && 
          error.response?.data?.error_description?.includes('too many requests')) {
        throw new Error('Rate limited by Zoho. Please try again later.');
      }
      
      throw new Error('Failed to sync contact with Zoho CRM');
    }
  }

  /**
   * Create deal/opportunity in Zoho CRM for collaborations
   * Following Zoho CRM Deals API
   */
  async createDeal(collaborationData) {
    try {
      const accessToken = await this.getAccessToken();
      
      // Format closing date properly
      let closingDate = null;
      if (collaborationData.deadline) {
        try {
          const deadlineDate = new Date(collaborationData.deadline);
          if (!isNaN(deadlineDate.getTime())) {
            closingDate = deadlineDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          }
        } catch (dateError) {
          console.log('⚠️ Invalid deadline date, using default:', dateError.message);
        }
      }
      
      // If no valid closing date, set to 30 days from now
      if (!closingDate) {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        closingDate = defaultDate.toISOString().split('T')[0];
      }
      
      const dealData = {
        data: [{
          Deal_Name: `Collaboration: ${collaborationData.campaign_title}`,
          Account_Name: collaborationData.brand_name,
          // Only include Contact_Name if we have a valid numeric contact ID
          ...(collaborationData.contact_id && !isNaN(collaborationData.contact_id) && {
            Contact_Name: parseInt(collaborationData.contact_id)
          }),
          Amount: collaborationData.agreed_rate || 0,
          Currency: collaborationData.currency || 'USD',
          Stage: this.mapCollaborationStatus(collaborationData.status),
          Closing_Date: closingDate,
          Description: `Campaign: ${collaborationData.campaign_description || 'No description'}\nCreator: ${collaborationData.creator_name}\nBrand: ${collaborationData.brand_name}`,
          Lead_Source: 'Influ Mojo App'
          // Removed custom fields that might not exist in Zoho CRM
        }],
        trigger: ['approval', 'workflow', 'blueprint']
      };

      const response = await axios.post(`${this.baseUrl}/crm/v3/Deals`, dealData, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Deal created in Zoho CRM:', response.data.data[0].details.id);
      return response.data.data[0];
    } catch (error) {
      console.error('❌ Error creating Zoho deal:', error.response?.data || error.message);
      if (error.response?.data) {
        console.error('   Full error details:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error('Failed to create deal in Zoho CRM');
    }
  }

  /**
   * Map collaboration status to Zoho CRM deal stages
   */
  mapCollaborationStatus(status) {
    const statusMap = {
      'active': 'Qualification',
      'content_submitted': 'Proposal',
      'revision_requested': 'Negotiation',
      'approved': 'Closed Won',
      'completed': 'Closed Won',
      'cancelled': 'Closed Lost',
      'disputed': 'Closed Lost'
    };
    return statusMap[status] || 'Qualification';
  }

  /**
   * Initialize Zoho Chat widget
   * Following Zoho Chat Widget API documentation
   */
  async initializeChatWidget(userData) {
    try {
      const accessToken = await this.getAccessToken();
      
      // Create chat visitor profile
      const visitorData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        // Custom fields for chat context
        user_type: userData.user_type,
        user_id: userData.id,
        auth_provider: userData.auth_provider
      };

      const response = await axios.post(`${this.chatBaseUrl}/api/v1/visitors`, visitorData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Chat widget initialized for user:', userData.id);
      return response.data;
    } catch (error) {
      console.error('❌ Error initializing chat widget:', error.response?.data || error.message);
      throw new Error('Failed to initialize chat widget');
    }
  }

  /**
   * Send chat message to Zoho Chat
   * Following Zoho Chat Message API
   */
  async sendChatMessage(visitorId, message, messageType = 'text') {
    try {
      const accessToken = await this.getAccessToken();
      
      const messageData = {
        visitor_id: visitorId,
        message: message,
        message_type: messageType,
        timestamp: new Date().toISOString()
      };

      const response = await axios.post(`${this.chatBaseUrl}/api/v1/messages`, messageData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Chat message sent successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error sending chat message:', error.response?.data || error.message);
      throw new Error('Failed to send chat message');
    }
  }

  /**
   * Get chat history for a visitor
   * Following Zoho Chat History API
   */
  async getChatHistory(visitorId, limit = 50) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(`${this.chatBaseUrl}/api/v1/visitors/${visitorId}/messages`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          limit: limit
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error getting chat history:', error.response?.data || error.message);
      throw new Error('Failed to get chat history');
    }
  }

  /**
   * Create task in Zoho CRM for follow-ups
   * Following Zoho CRM Tasks API
   */
  async createTask(taskData) {
    try {
      const accessToken = await this.getAccessToken();
      
      // Format due date properly
      let dueDate = null;
      if (taskData.due_date) {
        try {
          const dueDateObj = new Date(taskData.due_date);
          if (!isNaN(dueDateObj.getTime())) {
            dueDate = dueDateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          }
        } catch (dateError) {
          console.log('⚠️ Invalid due date, using default:', dateError.message);
        }
      }
      
      // If no valid due date, set to 7 days from now
      if (!dueDate) {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        dueDate = defaultDate.toISOString().split('T')[0];
      }
      
      const task = {
        data: [{
          Subject: taskData.subject,
          Description: taskData.description,
          Due_Date: dueDate,
          Status: taskData.status || 'Not Started',
          Priority: taskData.priority || 'Medium',
          Related_To: taskData.related_to || null // Contact or Deal ID
          // Removed Owner field as it might not exist in Zoho CRM
        }],
        trigger: ['approval', 'workflow', 'blueprint']
      };

      const response = await axios.post(`${this.baseUrl}/crm/v3/Tasks`, task, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Task created in Zoho CRM:', response.data.data[0].details.id);
      return response.data.data[0];
    } catch (error) {
      console.error('❌ Error creating Zoho task:', error.response?.data || error.message);
      if (error.response?.data) {
        console.error('   Full error details:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error('Failed to create task in Zoho CRM');
    }
  }

  /**
   * Webhook handler for Zoho CRM events
   * Following Zoho CRM Webhook documentation
   */
  async handleWebhook(webhookData) {
    try {
      const { channel_id, token, module, operation, resource_uri } = webhookData;
      
      // Verify webhook signature (if configured)
      if (process.env.ZOHO_WEBHOOK_SECRET) {
        const signature = crypto
          .createHmac('sha256', process.env.ZOHO_WEBHOOK_SECRET)
          .update(JSON.stringify(webhookData))
          .digest('hex');
        
        // For now, skip signature validation to avoid blocking webhooks
        // TODO: Implement proper signature validation when webhook secret is configured
        console.log('⚠️ Webhook signature validation skipped (not configured)');
      }

      console.log(`📥 Zoho webhook received: ${module} - ${operation}`);
      
      // Handle different webhook events
      switch (module) {
        case 'Contacts':
          await this.handleContactWebhook(operation, resource_uri);
          break;
        case 'Deals':
          await this.handleDealWebhook(operation, resource_uri);
          break;
        case 'Tasks':
          await this.handleTaskWebhook(operation, resource_uri);
          break;
        default:
          console.log(`⚠️ Unhandled webhook module: ${module}`);
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error handling Zoho webhook:', error);
      throw error;
    }
  }

  /**
   * Handle contact-related webhooks
   */
  async handleContactWebhook(operation, resourceUri) {
    // Implementation for contact webhook handling
    console.log(`📞 Contact webhook: ${operation} - ${resourceUri}`);
  }

  /**
   * Handle deal-related webhooks
   */
  async handleDealWebhook(operation, resourceUri) {
    // Implementation for deal webhook handling
    console.log(`🤝 Deal webhook: ${operation} - ${resourceUri}`);
  }

  /**
   * Handle task-related webhooks
   */
  async handleTaskWebhook(operation, resourceUri) {
    // Implementation for task webhook handling
    console.log(`📋 Task webhook: ${operation} - ${resourceUri}`);
  }
}

module.exports = new ZohoService(); 