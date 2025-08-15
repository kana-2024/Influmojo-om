'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Menu, X, User, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-soft border-b border-borderLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-poppins-bold text-sm">IM</span>
            </div>
            <span className="text-xl font-poppins-bold text-textDark">
              Influmojo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  href="/creators"
                  className="text-textGray hover:text-textDark font-poppins-medium transition-colors"
                >
                  Creators
                </Link>
                <Link
                  href="/packages"
                  className="text-textGray hover:text-textDark font-poppins-medium transition-colors"
                >
                  Packages
                </Link>
                <Link
                  href="/orders"
                  className="text-textGray hover:text-textDark font-poppins-medium transition-colors"
                >
                  Orders
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-textGray hover:text-textDark font-poppins-medium transition-colors">
                    <User size={16} />
                    <span>{user?.name || 'Profile'}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-soft border border-borderLight opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-textGray hover:text-textDark hover:bg-gray-50 transition-colors"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-textGray hover:text-textDark hover:bg-gray-50 transition-colors"
                    >
                      <LogOut size={16} className="inline mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-textGray hover:text-textDark font-poppins-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-textGray hover:text-textDark hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-borderLight">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/creators"
                    className="block px-3 py-2 text-textGray hover:text-textDark font-poppins-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Creators
                  </Link>
                  <Link
                    href="/packages"
                    className="block px-3 py-2 text-textGray hover:text-textDark font-poppins-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Packages
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-3 py-2 text-textGray hover:text-textDark font-poppins-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-textGray hover:text-textDark font-poppins-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-textGray hover:text-textDark font-poppins-medium transition-colors"
                  >
                    <LogOut size={16} className="inline mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-textGray hover:text-textDark font-poppins-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-3 py-2 bg-secondary text-white font-poppins-medium rounded-lg text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 