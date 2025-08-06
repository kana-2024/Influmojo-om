import axios from 'axios';
import { ApiResponse, PaginatedResponse, Agent, Ticket, Message, AgentStats, TicketStats } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwtToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication
export const authAPI = {
  login: async (token: string) => {
    localStorage.setItem('jwtToken', token);
    return { success: true };
  },
  
  logout: () => {
    localStorage.removeItem('jwtToken');
  },
  
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('jwtToken');
  },
};

// Agents API
export const agentsAPI = {
  getAll: async (): Promise<ApiResponse<{ agents: Agent[] }>> => {
    const response = await api.get('/admin/agents');
    return response.data;
  },
  
  getAllAgents: async (): Promise<ApiResponse<{ agents: Agent[] }>> => {
    const response = await api.get('/admin/agents');
    return response.data;
  },
  
  create: async (agentData: Partial<Agent>): Promise<ApiResponse<{ agent: Agent }>> => {
    const response = await api.post('/admin/agents', agentData);
    return response.data;
  },
  
  update: async (id: string, agentData: Partial<Agent>): Promise<ApiResponse<{ agent: Agent }>> => {
    const response = await api.put(`/admin/agents/${id}`, agentData);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/admin/agents/${id}`);
    return response.data;
  },
  
  getStats: async (): Promise<ApiResponse<AgentStats>> => {
    const response = await api.get('/admin/agents/stats');
    return response.data;
  },
};

// Tickets API
export const ticketsAPI = {
  getAllTickets: async (page: number = 1, limit: number = 10): Promise<ApiResponse<{ tickets: Ticket[]; total: number; limit: number; offset: number }>> => {
    const offset = (page - 1) * limit;
    const response = await api.get('/crm/tickets', { params: { limit, offset } });
    return response.data;
  },
  
  getAll: async (params?: { status?: string; limit?: number; offset?: number }): Promise<ApiResponse<{ tickets: Ticket[]; total: number; limit: number; offset: number }>> => {
    const response = await api.get('/crm/tickets', { params });
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<{ ticket: Ticket }>> => {
    const response = await api.get(`/crm/tickets/${id}`);
    return response.data;
  },
  
  updateStatus: async (id: string, status: string): Promise<ApiResponse<{ ticket: Ticket }>> => {
    const response = await api.put(`/crm/tickets/${id}/status`, { status });
    return response.data;
  },
  
  updatePriority: async (id: string, priority: string): Promise<ApiResponse<{ ticket: Ticket }>> => {
    const response = await api.put(`/crm/tickets/${id}/priority`, { priority });
    return response.data;
  },
  
  reassign: async (id: string, agent_id: string): Promise<ApiResponse<{ ticket: Ticket }>> => {
    const response = await api.put(`/crm/tickets/${id}/reassign`, { agent_id });
    return response.data;
  },
  
  getMessages: async (id: string): Promise<ApiResponse<{ messages: Message[] }>> => {
    const response = await api.get(`/crm/tickets/${id}/messages`);
    return response.data;
  },
  
  sendMessage: async (id: string, message: string): Promise<ApiResponse<{ message: Message }>> => {
    const response = await api.post(`/crm/tickets/${id}/messages`, { message_text: message });
    return response.data;
  },
  
  getStats: async (): Promise<ApiResponse<TicketStats>> => {
    const response = await api.get('/crm/tickets/stats');
    return response.data;
  },
};

// StreamChat API
export const streamChatAPI = {
  getToken: async (): Promise<ApiResponse<{ token: string; userId: string; apiKey: string }>> => {
    const response = await api.get('/chat/token');
    return response.data;
  },
  
  joinTicketChannel: async (ticketId: string): Promise<ApiResponse<{ channelId: string }>> => {
    const response = await api.post(`/chat/tickets/${ticketId}/join`);
    return response.data;
  },
  
  leaveTicketChannel: async (ticketId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post(`/chat/tickets/${ticketId}/leave`);
    return response.data;
  },
  
  getChannels: async (): Promise<ApiResponse<{ channels: any[] }>> => {
    const response = await api.get('/chat/channels');
    return response.data;
  },
  
  getChannelInfo: async (channelId: string): Promise<ApiResponse<{ channel: any }>> => {
    const response = await api.get(`/chat/channels/${channelId}`);
    return response.data;
  },
};

export default api; 