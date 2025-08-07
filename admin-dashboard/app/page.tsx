'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { User } from '@/types';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'token' | 'email'>('token');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('jwtToken');
      if (savedToken) {
        setIsLoading(true);
        try {
          // Get current user
          const userResponse = await authAPI.getCurrentUser();
          if (userResponse.success && userResponse.data?.user) {
            const user = userResponse.data.user;
            
            // Redirect based on user type
            if (user.user_type === 'super_admin') {
              router.push('/super-admin');
            } else if (user.user_type === 'agent') {
              router.push('/agent');
            } else {
              // For other user types, show the main dashboard
              setIsAuthenticated(true);
            }
          } else {
            // Invalid token, remove it
            localStorage.removeItem('jwtToken');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('jwtToken');
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleTokenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      setIsLoading(true);
      try {
        localStorage.setItem('jwtToken', token.trim());
        
        // Get current user to determine redirect
        const userResponse = await authAPI.getCurrentUser();
        if (userResponse.success && userResponse.data?.user) {
          const user = userResponse.data.user;
          toast.success(`Welcome back, ${user.name}!`);
          
          // Redirect based on user type
          if (user.user_type === 'super_admin') {
            router.push('/super-admin');
          } else if (user.user_type === 'agent') {
            router.push('/agent');
          } else {
            // For other user types, show the main dashboard
            setIsAuthenticated(true);
          }
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        console.error('Login failed:', error);
        toast.error('Invalid token. Please try again.');
        localStorage.removeItem('jwtToken');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Please enter a JWT token');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      setIsLoading(true);
      try {
        const response = await authAPI.agentLogin(email.trim(), password.trim());
        if (response.success && response.data?.token) {
          localStorage.setItem('jwtToken', response.data.token);
          toast.success(`Welcome back, ${response.data.user.name}!`);
          router.push('/agent');
        } else {
          throw new Error(response.message || 'Login failed');
        }
      } catch (error) {
        console.error('Email login failed:', error);
        toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Please enter both email and password');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    setToken('');
    setEmail('');
    setPassword('');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Influmojo Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">CRM and Support Management System</p>
          </div>
          
          {/* Login Method Toggle */}
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setLoginMethod('token')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md ${
                loginMethod === 'token'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              JWT Token
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md ${
                loginMethod === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Agent Email
            </button>
          </div>
          
          {loginMethod === 'token' ? (
            <form onSubmit={handleTokenLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">JWT Token</label>
                <textarea
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your JWT token..."
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="agent@influmojo.com"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Agent Login'}
              </button>
            </form>
          )}
          
          {loginMethod === 'token' ? (
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
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800">
                <strong>Agent Login Info:</strong>
              </p>
              <ul className="mt-2 text-sm text-green-700 space-y-1">
                <li>• Use your agent email address</li>
                <li>• Default password: <code className="bg-green-100 px-1 rounded">agent123</code></li>
                <li>• Contact admin to reset password</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // This should only be reached for non-agent, non-super-admin users
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Influmojo Admin Dashboard</h2>
          <p className="text-gray-600">
            Please use the appropriate dashboard for your role:
          </p>
          <div className="mt-6 space-y-4">
            <button
              onClick={() => router.push('/super-admin')}
              className="block w-full max-w-xs mx-auto bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700"
            >
              Super Admin Dashboard
            </button>
            <button
              onClick={() => router.push('/agent')}
              className="block w-full max-w-xs mx-auto bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700"
            >
              Agent Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 