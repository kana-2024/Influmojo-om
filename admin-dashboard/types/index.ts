export interface User {
  id: string;
  name: string;
  email: string;
  user_type: 'admin' | 'super_admin' | 'brand' | 'creator';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Agent extends User {
  phone?: string;
  specialization?: string;
}

export interface Ticket {
  id: string;
  order_id: string;
  agent_id: string;
  stream_channel_id: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  order?: Order;
  agent?: Agent;
  messages?: Message[];
}

export interface Order {
  id: string;
  package_id: string;
  brand_id: string;
  creator_id: string;
  amount: number;
  quantity: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  created_at: string;
  updated_at: string;
  package?: Package;
  brand?: BrandProfile;
  creator?: CreatorProfile;
}

export interface Package {
  id: string;
  title: string;
  description?: string;
  price: number;
  type: 'predefined' | 'custom';
  created_at: string;
  updated_at: string;
}

export interface BrandProfile {
  id: string;
  user_id: string;
  company_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Message {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender: 'brand' | 'creator' | 'agent' | 'system';
  sender_name: string;
  sender_role?: 'brand' | 'creator' | 'agent' | 'system'; // For unified agent view
  text: string;
  timestamp: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface AgentStats {
  total_agents: number;
  active_agents: number;
  avg_tickets_per_agent: number;
  total_tickets: number;
}

export interface TicketStats {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  avg_resolution_time: number;
} 