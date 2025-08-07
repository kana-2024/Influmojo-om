'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { MessageSquare, Clock, CheckCircle, User, LogOut } from 'lucide-react';
import { authAPI, ticketsAPI } from '@/lib/api';
import { User as UserType, Ticket } from '@/types';
import TicketList from '@/components/TicketList';
import { useStreamChatAuth } from '@/hooks/useStreamChatAuth';

export default function AgentDashboard() {
  const [user, setUser] = useState<UserType | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
  });
  
  const router = useRouter();
  const { authenticate: authenticateStreamChat, isConnected: isStreamChatConnected } = useStreamChatAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          router.push('/');
          return;
        }

        // Get current user
        const userResponse = await authAPI.getCurrentUser();
        if (!userResponse.success || !userResponse.data?.user) {
          toast.error('Authentication failed');
          router.push('/');
          return;
        }

        const currentUser = userResponse.data.user;
        
        // Debug: Log the user type
        console.log('🔍 Current user type:', currentUser.user_type);
        console.log('🔍 Full user object:', currentUser);
        
        // Check if user is an agent
        if (currentUser.user_type !== 'agent') {
          toast.error(`Access denied. Agents only. Current user type: ${currentUser.user_type}`);
          router.push('/');
          return;
        }

        setUser(currentUser);
        
        // Load agent's tickets
        await loadAgentTickets();
        
        // Authenticate with StreamChat
        await authenticateStreamChat();
        
      } catch (error) {
        console.error('Auth check failed:', error);
        toast.error('Authentication failed');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]); // Removed authenticateStreamChat from dependencies

  const loadAgentTickets = async () => {
    try {
      const response = await ticketsAPI.getMyTickets();
      if (response.success && response.data?.tickets) {
        const agentTickets = response.data.tickets;
        setTickets(agentTickets);
        
        // Calculate stats
        setStats({
          totalTickets: agentTickets.length,
          openTickets: agentTickets.filter(t => t.status === 'open').length,
          resolvedTickets: agentTickets.filter(t => t.status === 'resolved').length,
        });
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load tickets');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agent dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full ${isStreamChatConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>Agent</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">My Tickets</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalTickets}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Open Tickets</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.openTickets}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Resolved</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.resolvedTickets}</p>
                </div>
              </div>
            </div>
          </div>

          {/* My Tickets Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">My Assigned Tickets</h2>
              <p className="text-sm text-gray-500">Tickets assigned to you for support</p>
            </div>
            <div className="p-6">
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets assigned</h3>
                  <p className="text-gray-500">You don't have any tickets assigned to you at the moment.</p>
                </div>
              ) : (
                <TicketList tickets={tickets} showAgentInfo={false} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 