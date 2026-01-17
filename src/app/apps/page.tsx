'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import api, { Feature } from '@/lib/api';

interface AppInfo {
  slug: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  gradient: string;
}

const appRegistry: Record<string, AppInfo> = {
  'task-prioritizer': {
    slug: 'task-prioritizer',
    name: 'Task Prioritizer',
    description: 'AI-powered task prioritization based on your energy level',
    icon: '✨',
    route: '/apps/task-prioritizer',
    gradient: 'from-indigo-500 to-purple-600',
  },
  'daily-planner': {
    slug: 'daily-planner',
    name: 'Daily Planner',
    description: 'AI-generated time-blocked daily schedules',
    icon: '📅',
    route: '/apps/daily-planner',
    gradient: 'from-emerald-500 to-teal-600',
  },
  'meeting-summarizer': {
    slug: 'meeting-summarizer',
    name: 'Meeting Summarizer',
    description: 'Summarize meeting notes with action items',
    icon: '📝',
    route: '#',
    gradient: 'from-pink-400 to-rose-500',
  },
};

export default function AppsPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true);
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
        setIsLoadingFeatures(false);
      } else {
        fetchFeatures();
      }
    }
  }, [isAuthenticated, user]);

  const fetchFeatures = async () => {
    setIsLoadingFeatures(true);
    try {
      const data = await api.getUserFeatures();
      setFeatures(data.features);
    } catch (err: unknown) {
      console.error('Failed to fetch features:', err);
      // If 403, user is pending approval
      if (err instanceof Error && err.message.includes('pending')) {
        setIsPendingApproval(true);
      }
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  if (authLoading || isLoadingFeatures) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isPendingApproval) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">⏳</div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {user?.status === 'rejected' ? 'Account Rejected' : 'Pending Approval'}
          </h1>
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
            {user?.status === 'rejected' 
              ? 'Your account has been rejected. Please contact the administrator for more information.'
              : 'Your account is awaiting approval from an administrator. Please check back later.'}
          </p>
          <button onClick={logout} className="btn-primary">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 border-b" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🚀 PrioritiAI</h1>
        <div className="flex items-center gap-4">
          {user?.role === 'admin' && (
            <Link href="/admin" className="btn-ghost text-sm flex items-center gap-1">
              🔧 Admin
            </Link>
          )}
          <ThemeToggle />
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <span className="text-xs px-2 py-1 rounded font-medium" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>Admin</span>
            )}
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.name}</span>
            <button onClick={logout} className="btn-ghost text-sm">Logout</button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Your AI Productivity Suite</h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Choose an app to boost your productivity with AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const app = appRegistry[feature.slug];
            if (!app) return null;

            const isDisabled = !feature.is_enabled || app.route === '#';
            const isComingSoon = app.route === '#';

            return (
              <Link
                key={feature.id}
                href={isDisabled ? '#' : app.route}
                className={`flex flex-col items-center p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl'}`}
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                onClick={(e) => isDisabled && e.preventDefault()}
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center mb-5 shadow-lg ${!isDisabled ? 'group-hover:scale-110' : ''} transition-transform`}>
                  <span className="text-4xl">{app.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{app.name}</h3>
                <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{app.description}</p>
                
                {/* Status badges */}
                {isComingSoon && (
                  <span className="absolute top-3 right-3 text-xs font-semibold uppercase px-2 py-1 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    Coming Soon
                  </span>
                )}
                {!feature.is_enabled && !isComingSoon && (
                  <span className="absolute top-3 right-3 text-xs font-semibold uppercase px-2 py-1 rounded bg-red-100 text-red-600">
                    Disabled
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
