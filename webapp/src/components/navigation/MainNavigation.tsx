'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export default function MainNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { name: 'Home', href: '/landing', current: pathname === '/landing' },
    { name: 'Brand Home', href: '/brand-home', current: pathname === '/brand-home' },
    { name: 'Creator Home', href: '/creator-home', current: pathname === '/creator-home' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Image 
              src="/assets/logo/Group.png" 
              alt="Influmojo" 
              width={120} 
              height={40}
              className="h-8 w-auto cursor-pointer"
              onClick={() => router.push('/landing')}
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/login')}
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Login
            </button>
            <button 
              onClick={() => router.push('/get-started')}
              className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
