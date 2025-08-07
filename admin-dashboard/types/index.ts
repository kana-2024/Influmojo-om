export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  user_type: 'super_admin' | 'agent' | 'brand' | 'creator';
  profile_image_url?: string;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  last_login_at?: string;
}

export interface Agent {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  user_type: 'agent';
  status: 'active' | 'suspended' | 'pending';
  assigned_tickets_count?: number;
  created_at: string;
  last_login_at?: string;
  is_online?: boolean;
  agent_status?: 'available' | 'busy' | 'offline' | 'away';
}

export interface Ticket {
  id: string;
  order_id: string;
  agent_id: string;
  stream_channel_id: string;
  brand_agent_channel?: string;
  creator_agent_channel?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  agent?: Agent;
  order?: {
    id: string;
    package?: {
      title: string;
    };
    brand?: {
      company_name: string;
      phone?: string;
      user?: {
        name: string;
        email?: string;
        phone?: string;
      };
    };
    creator?: {
      user?: {
        name: string;
        email?: string;
        phone?: string;
      };
      phone?: string;
      bio?: string;
    };
  };
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
  message_text: string;
  message_type: 'text' | 'file' | 'system';
  file_url?: string;
  file_name?: string;
  read_at?: string;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    user_type: string;
  };
  sender_role?: 'brand' | 'creator' | 'agent' | 'system';
  channel_type?: 'brand_agent' | 'creator_agent';
  sender_name?: string;
  timestamp?: string;
  text?: string; // Backend returns 'text' field for message content
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AgentStats {
  total_agents: number;
  active_agents: number;
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
}

export interface TicketStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
} 