'use client';

import React, { useState } from 'react';
import { UserHeader } from './UserHeader';
import { UserSidebar } from './UserSidebar';
import { Menu, X } from 'lucide-react';

interface UserLayoutProps {
  children?: React.ReactNode;
  username: string;
  email: string;
}

export function UserLayout({ children, username, email }: UserLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <UserHeader username={username} email={email} />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <UserSidebar isCollapsed={isSidebarCollapsed} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative flex flex-col w-64 bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <UserSidebar />
            </div>
          </div>
        )}

        {/* Main Content */}
  <main className="flex-1 min-h[calc(100vh-4rem)]">
          {/* Mobile Menu Button */}
          <div className="lg:hidden p-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Page Content */}
          <div className="p-6">
            {children ?? null}
          </div>
        </main>
      </div>
    </div>
  );
}