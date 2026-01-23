'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.status === 'pending' || user.status === 'rejected') {
        setIsPendingApproval(true);
      }
    }
  }, [isAuthenticated, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Pending approval state
  if (isPendingApproval) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="card max-w-md w-full text-center p-8">
          <div className="text-6xl mb-6">{user?.status === 'rejected' ? '❌' : '⏳'}</div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {user?.status === 'rejected' ? 'Access Denied' : 'Pending Approval'}
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {user?.status === 'rejected' 
              ? 'Your account was not approved. Please contact support.'
              : 'Your account is pending admin approval. Please check back later.'
            }
          </p>
          <button onClick={logout} className="btn-primary">Logout</button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile Header */}
      <header 
        className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30 border-b"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{ color: 'var(--text-primary)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span>🚀</span>
          <span className="gradient-text">PrioritiAI</span>
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="md:ml-64">
        {children}
      </main>
    </div>
  );
}
