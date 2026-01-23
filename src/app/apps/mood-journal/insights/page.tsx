'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api, { JournalInsights } from '@/lib/api';

export default function InsightsPage() {
  const { isAuthenticated } = useAuth();

  const [insights, setInsights] = useState<JournalInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    async function fetchInsights() {
      setIsLoading(true);
      try {
        const data = await api.getJournalInsights(month);
        setInsights(data);
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchInsights();
    }
  }, [isAuthenticated, month]);

  const getMoodColor = (score: number) => {
    if (score >= 0.5) return 'text-green-500';
    if (score >= 0) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 0.5) return '😊';
    if (score >= 0) return '😐';
    return '😔';
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <Link 
            href="/apps/mood-journal" 
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: 'var(--text-secondary)' }}
          >
            ←
          </Link>
          <h1 className="text-lg md:text-xl font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <span>📊</span>
            Monthly Insights
          </h1>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
        />
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : !insights || insights.entry_count === 0 ? (
          <div className="text-center py-16 opacity-50">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl">No entries for this month</p>
            <p className="text-sm mt-2">Start journaling to see your mood insights!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card text-center">
                <div className="text-4xl mb-2">{insights.entry_count}</div>
                <div className="text-sm opacity-60">Entries</div>
              </div>
              <div className="card text-center">
                <div className={`text-4xl mb-2 ${getMoodColor(insights.insights?.average_mood || 0)}`}>
                  {getMoodEmoji(insights.insights?.average_mood || 0)}
                </div>
                <div className="text-sm opacity-60">
                  Avg Mood: {((insights.insights?.average_mood || 0) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="card text-center">
                <div className="text-4xl mb-2">
                  {Object.keys(insights.insights?.top_activities || {}).length}
                </div>
                <div className="text-sm opacity-60">Activities Tracked</div>
              </div>
            </div>

            {/* Mood Distribution */}
            {insights.insights?.mood_distribution && Object.keys(insights.insights.mood_distribution).length > 0 && (
              <div className="card">
                <h3 className="text-lg font-bold mb-4">Mood Distribution</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(insights.insights.mood_distribution).map(([mood, count]) => (
                    <div key={mood} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                      <span className="capitalize">{mood}</span>
                      <span className="font-bold" style={{ color: 'var(--accent)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Activities */}
            {insights.insights?.top_activities && Object.keys(insights.insights.top_activities).length > 0 && (
              <div className="card">
                <h3 className="text-lg font-bold mb-4">Top Activities</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(insights.insights.top_activities).map(([activity, count]) => (
                    <span key={activity} className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600">
                      {activity} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Top People */}
            {insights.insights?.top_people && Object.keys(insights.insights.top_people).length > 0 && (
              <div className="card">
                <h3 className="text-lg font-bold mb-4">People Mentioned</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(insights.insights.top_people).map(([person, count]) => (
                    <span key={person} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-600">
                      {person} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
