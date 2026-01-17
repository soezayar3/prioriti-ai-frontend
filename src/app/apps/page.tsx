'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  gradient: string;
}

const apps: App[] = [
  {
    id: 'task-prioritizer',
    name: 'Task Prioritizer',
    description: 'AI-powered task prioritization based on your energy level',
    icon: '✨',
    route: '/apps/task-prioritizer',
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'coming-soon-1',
    name: 'Daily Planner',
    description: 'AI-generated time-blocked daily schedules',
    icon: '📅',
    route: '#',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'coming-soon-2',
    name: 'Meeting Summarizer',
    description: 'Summarize meeting notes with action items',
    icon: '📝',
    route: '#',
    gradient: 'from-pink-400 to-rose-500',
  },
];

export default function AppsPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 border-b" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🚀 PrioritiAI</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-3">
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
          {apps.map((app) => (
            <Link
              key={app.id}
              href={app.route}
              className={`flex flex-col items-center p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${app.route === '#' ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl'}`}
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              onClick={(e) => app.route === '#' && e.preventDefault()}
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <span className="text-4xl">{app.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{app.name}</h3>
              <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{app.description}</p>
              {app.route === '#' && (
                <span className="absolute top-3 right-3 text-xs font-semibold uppercase px-2 py-1 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                  Coming Soon
                </span>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
