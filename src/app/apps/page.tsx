'use client';

import React from 'react';
import Link from 'next/link';

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
  'mood-journal': {
    slug: 'mood-journal',
    name: 'Mood Journal',
    description: 'AI-powered micro-journaling with mood tracking',
    icon: '🌈',
    route: '/apps/mood-journal',
    gradient: 'from-amber-400 to-orange-500',
  },
};

// All apps available to approved users
const allApps = Object.values(appRegistry);

export default function AppsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Your AI Productivity Suite
          </h2>
          <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Choose an app to boost your productivity with AI
          </p>
        </div>

        {/* App Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allApps.map((app) => {
            const isComingSoon = app.route === '#';

            return (
              <Link
                key={app.slug}
                href={isComingSoon ? '#' : app.route}
                className={`flex flex-col items-center p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${isComingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl'}`}
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                onClick={(e) => isComingSoon && e.preventDefault()}
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center mb-5 shadow-lg ${!isComingSoon ? 'group-hover:scale-110' : ''} transition-transform`}>
                  <span className="text-4xl">{app.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{app.name}</h3>
                <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{app.description}</p>
                
                {isComingSoon && (
                  <span className="absolute top-3 right-3 text-xs font-semibold uppercase px-2 py-1 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    Coming Soon
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
