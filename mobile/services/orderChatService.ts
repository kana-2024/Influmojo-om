import { ENV } from '../config/env';
import { getToken } from './storage';

/**
 * Order Chat Service
 * Handles order-specific chat sessions with Zoho integration
 */

export interface ChatSession {
  id: string;
  order_id: string;
  user_id: string;
  role: 'brand' | 'influencer';
  zoho_ticket_id: string;
  status: 'open' | 'pending' | 'closed';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  messageType: 'text' | 'file' | 'system';
  sender: string;
  timestamp: string;
}

export interface OrderChatService {
  // Get or create chat session for an order
  getOrCreateSession(orderId: string, userId: string, role: 'brand' | 'influencer'): Promise<ChatSession>;
  
  // Update chat session status
  updateSessionStatus(sessionId: string, status: 'open' | 'pending' | 'closed'): Promise<ChatSession>;
  
  // Get chat session history
  getSessionHistory(sessionId: string, limit?: number): Promise<{
    session: ChatSession;
    chatHistory: ChatMessage[];
  }>;
  
  // Send message to chat session
  sendMessage(sessionId: string, message: string, messageType?: 'text' | 'file' | 'system'): Promise<any>;
  
  // Get all chat sessions for a user
  getUserSessions(userId: string, status?: string): Promise<ChatSession[]>;
  
  // Get all chat sessions for an order
  getOrderSessions(orderId: string): Promise<ChatSession[]>;
  
  // Initialize Zoho chat widget for order
  initializeOrderChat(session: ChatSession, userData: any): Promise<void>;
}

class OrderChatServiceImpl implements OrderChatService {
  private baseUrl = `${ENV.API_BASE_URL}/api/chat`;

  // Helper function to make API requests
  private async apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = await getToken();
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }

  async getOrCreateSession(orderId: string, userId: string, role: 'brand' | 'influencer'): Promise<ChatSession> {
    try {
      const params = new URLSearchParams({
        order_id: orderId,
        user_id: userId,
        role: role
      });

      const response = await this.apiRequest(`/session?${params.toString()}`, {
        method: 'GET'
      });

      return response.data.session;
    } catch (error) {
      console.error('Error getting/creating chat session:', error);
      throw error;
    }
  }

  async updateSessionStatus(sessionId: string, status: 'open' | 'pending' | 'closed'): Promise<ChatSession> {
    try {
      const response = await this.apiRequest(`/session/${sessionId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });

      return response.data.session;
    } catch (error) {
      console.error('Error updating chat session status:', error);
      throw error;
    }
  }

  async getSessionHistory(sessionId: string, limit: number = 50): Promise<{
    session: ChatSession;
    chatHistory: ChatMessage[];
  }> {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      const response = await this.apiRequest(`/session/${sessionId}/history?${params.toString()}`, {
        method: 'GET'
      });

      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  async sendMessage(sessionId: string, message: string, messageType: 'text' | 'file' | 'system' = 'text'): Promise<any> {
    try {
      const response = await this.apiRequest(`/session/${sessionId}/message`, {
        method: 'POST',
        body: JSON.stringify({ message, messageType })
      });

      return response.data.result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string, status?: string): Promise<ChatSession[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const response = await this.apiRequest(`/user/${userId}/sessions?${params.toString()}`, {
        method: 'GET'
      });

      return response.data.sessions;
    } catch (error) {
      console.error('Error getting user chat sessions:', error);
      throw error;
    }
  }

  async getOrderSessions(orderId: string): Promise<ChatSession[]> {
    try {
      const response = await this.apiRequest(`/order/${orderId}/sessions`, {
        method: 'GET'
      });

      return response.data.sessions;
    } catch (error) {
      console.error('Error getting order chat sessions:', error);
      throw error;
    }
  }

  async initializeOrderChat(session: ChatSession, userData: any): Promise<void> {
    try {
      // Import Zoho SalesIQ for React Native
      const { ZohoSalesIQ } = require('react-native-zohosalesiq-mobilisten');
      
      // Check if ZohoSalesIQ is properly imported and available
      if (!ZohoSalesIQ) {
        console.warn('⚠️ ZohoSalesIQ module is not available, using fallback');
        this.initializeOrderChatFallback(session, userData);
        return;
      }

      // Wait for SDK to be ready (retry mechanism)
      let retryCount = 0;
      const maxRetries = 5;
      
      while (retryCount < maxRetries) {
        if (typeof ZohoSalesIQ.setVisitorInfo === 'function' && 
            typeof ZohoSalesIQ.setCustomAction === 'function' && 
            typeof ZohoSalesIQ.showChat === 'function') {
          break;
        }
        
        console.log(`⏳ Waiting for ZohoSalesIQ to be ready... (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        retryCount++;
      }

      // Final check after retries
      if (typeof ZohoSalesIQ.setVisitorInfo !== 'function') {
        console.warn('⚠️ ZohoSalesIQ SDK is not properly initialized, using fallback');
        this.initializeOrderChatFallback(session, userData);
        return;
      }

      if (typeof ZohoSalesIQ.setCustomAction !== 'function') {
        console.warn('⚠️ ZohoSalesIQ.setCustomAction is not available, using fallback');
        this.initializeOrderChatFallback(session, userData);
        return;
      }

      if (typeof ZohoSalesIQ.showChat !== 'function') {
        console.warn('⚠️ ZohoSalesIQ.showChat is not available, using fallback');
        this.initializeOrderChatFallback(session, userData);
        return;
      }
      
      // Create unique email for each order to enable re-identification
      const orderSpecificEmail = this.createOrderSpecificEmail(userData.email, session.order_id);
      
      console.log('🔧 Initializing order-specific chat with email:', orderSpecificEmail);
      console.log('🔧 ZohoSalesIQ object:', typeof ZohoSalesIQ);
      console.log('🔧 Available methods:', Object.keys(ZohoSalesIQ));
      
      // Set visitor information with order-specific email for re-identification
      ZohoSalesIQ.setVisitorInfo({
        name: userData.name || 'User',
        email: orderSpecificEmail, // This enables re-identification per order
        phone: userData.phone || '',
        addInfo: `order_id:${session.order_id} ticket_id:${session.zoho_ticket_id} role:${session.role}`
      });

      // Set custom action for order tracking
      ZohoSalesIQ.setCustomAction(`order_${session.order_id}`);

      // Show chat widget
      ZohoSalesIQ.showChat();

      console.log('✅ Order-specific chat initialized:', {
        orderId: session.order_id,
        email: orderSpecificEmail,
        sessionId: session.id,
        zohoSalesIQAvailable: !!ZohoSalesIQ
      });
    } catch (error) {
      console.error('❌ Error initializing order chat:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Use fallback if Zoho SDK fails
      console.warn('⚠️ Using fallback chat initialization');
      this.initializeOrderChatFallback(session, userData);
    }
  }

  /**
   * Fallback method when Zoho SalesIQ is not available
   */
  private initializeOrderChatFallback(session: ChatSession, userData: any): void {
    try {
      const orderSpecificEmail = this.createOrderSpecificEmail(userData.email, session.order_id);
      
      console.log('🔄 Using fallback chat initialization for order:', session.order_id);
      console.log('📧 Order-specific email:', orderSpecificEmail);
      console.log('🎫 Zoho ticket ID:', session.zoho_ticket_id);
      
      // For now, just log the information
      // In a real implementation, you might want to:
      // 1. Open a web view with Zoho chat
      // 2. Use a different chat solution
      // 3. Show a message to the user
      
      console.log('✅ Fallback chat initialization completed');
      console.log('💡 Note: Zoho SalesIQ SDK is not available. Consider rebuilding the app or checking native dependencies.');
      
    } catch (error) {
      console.error('❌ Error in fallback chat initialization:', error);
    }
  }

  /**
   * Create order-specific email for re-identification
   * This ensures each order gets a separate chat session
   */
  private createOrderSpecificEmail(baseEmail: string, orderId: string): string {
    if (!baseEmail) {
      return `order-${orderId}@influmojo.app`;
    }
    
    // Use email plus addressing for unique identification
    const [localPart, domain] = baseEmail.split('@');
    return `${localPart}+order${orderId}@${domain}`;
  }
}

// Export singleton instance
export const orderChatService = new OrderChatServiceImpl();

/**
 * React Native Hook for Order Chat
 */
export const useOrderChat = () => {
  const openOrderChat = async (orderId: string, userData: any) => {
    try {
      // Get or create chat session
      const session = await orderChatService.getOrCreateSession(
        orderId,
        userData.id.toString(),
        userData.user_type === 'brand' ? 'brand' : 'influencer'
      );

      // Initialize Zoho chat
      await orderChatService.initializeOrderChat(session, userData);

      return session;
    } catch (error) {
      console.error('Error opening order chat:', error);
      throw error;
    }
  };

  const sendOrderMessage = async (sessionId: string, message: string) => {
    try {
      return await orderChatService.sendMessage(sessionId, message);
    } catch (error) {
      console.error('Error sending order message:', error);
      throw error;
    }
  };

  const getOrderChatHistory = async (sessionId: string) => {
    try {
      return await orderChatService.getSessionHistory(sessionId);
    } catch (error) {
      console.error('Error getting order chat history:', error);
      throw error;
    }
  };

  return {
    openOrderChat,
    sendOrderMessage,
    getOrderChatHistory,
    orderChatService
  };
}; 