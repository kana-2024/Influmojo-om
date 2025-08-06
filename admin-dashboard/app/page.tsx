'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import TicketList from '@/components/TicketList';
import { useStreamChatAuth } from '@/hooks/useStreamChatAuth';
import { MessageSquare, Clock, CheckCircle, Users } from 'lucide-react';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('tickets');
  
  const { authenticate: authenticateStreamChat, isConnected: isStreamChatConnected } = useStreamChatAuth();

  useEffect(() => {
    const savedToken = localStorage.getItem('jwtToken');
    if (savedToken) {
      setIsAuthenticated(true);
      // Authenticate with StreamChat when user is already logged in
      authenticateStreamChat();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      localStorage.setItem('jwtToken', token.trim());
      setIsAuthenticated(true);
      toast.success('Login successful!');
      
      // Wait a bit for the token to be set, then authenticate with StreamChat
      setTimeout(async () => {
        try {
          await authenticateStreamChat();
        } catch (error) {
          console.error('Failed to authenticate with StreamChat:', error);
          // Don't show error toast as this is not critical for basic functionality
        }
      }, 100);
    } else {
      toast.error('Please enter a JWT token');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    setToken('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Influmojo Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">CRM and Support Management System</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">JWT Token</label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your JWT token..."
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Sign In
            </button>
          </form>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Need a token?</strong> Follow these steps:
            </p>
            <ol className="mt-2 text-sm text-blue-700 space-y-1">
              <li>1. Navigate to the backend directory: <code className="bg-blue-100 px-1 rounded">cd backend</code></li>
              <li>2. Create a super admin user: <code className="bg-blue-100 px-1 rounded">node create-super-admin.js</code></li>
              <li>3. Copy the JWT token from the output</li>
              <li>4. Paste it in the field above</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Influmojo Admin Dashboard</h1>
              <p className="text-sm text-gray-500">CRM and Support Management</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full ${isStreamChatConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span>{isStreamChatConnected ? 'Chat Connected' : 'Chat Disconnected'}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                  <p className="text-2xl font-semibold text-gray-900">-</p>
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
                  <p className="text-2xl font-semibold text-gray-900">-</p>
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
                  <p className="text-2xl font-semibold text-gray-900">-</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Agents</p>
                  <p className="text-2xl font-semibold text-gray-900">-</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Support Tickets</h2>
              <p className="text-sm text-gray-500">Manage and respond to customer support tickets</p>
            </div>
            <div className="p-6">
              <TicketList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 