'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Timeline } from '@/components/Timeline';
import { Toast } from '@/components/ui/Toast';
import api, { ScheduledBlock } from '@/lib/api';

export default function DailyPlannerPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [brainDump, setBrainDump] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [schedule, setSchedule] = useState<ScheduledBlock[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleGenerate = async () => {
    if (!brainDump.trim()) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      const result = await api.generateDailyPlan(brainDump, startTime, endTime);
      setSchedule(result.schedule);
    } catch (err: unknown) {
      console.error('Failed to generate plan:', err);
      setError('Failed to generate schedule. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (schedule.length === 0) return;
    try {
      // Use today's date formatted as YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      await api.saveDailyPlan(today, schedule, brainDump);
      showToast('Schedule saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to save plan:', err);
      showToast('Failed to save schedule.', 'error');
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar - Input */}
      <aside className="w-96 p-6 border-r flex flex-col h-screen sticky top-0 overflow-y-auto" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.push('/apps')} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <span>←</span> Back
            </button>
            <button onClick={() => router.push('/apps/daily-planner/history')} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity text-sm">
              📜 History
            </button>
          </div>
          <h1 className="text-2xl font-bold mb-2 icon-gradient">Daily Planner</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Turn your tasks into a realistic schedule.</p>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {/* Brain Dump Input */}
          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">Brain Dump</label>
            <textarea
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
              placeholder="What do you need to get done today? e.g.&#10;- Finish report (2h)&#10;- Call mom&#10;- Review PRs"
              className="w-full h-48 rounded-xl p-4 resize-none transition-all focus:ring-2 focus:ring-indigo-500 outline-none"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
            />
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !brainDump.trim()}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Planning...
              </>
            ) : (
              '✨ Generate Schedule'
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <div className="flex items-center gap-3">
               <span className="text-xs px-2 py-1 rounded font-medium" style={{ background: 'var(--bg-tertiary)' }}>{user?.role}</span>
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Timeline */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {schedule.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Your Schedule</h2>
                <button onClick={handleSave} className="btn-ghost flex items-center gap-2">
                  💾 Save Plan
                </button>
              </div>
              <Timeline schedule={schedule} />
            </>
          ) : (
             <div className="h-full flex flex-col items-center justify-center opacity-40 mt-20">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-xl font-medium">Ready to plan your day?</p>
              <p className="text-sm max-w-xs text-center mt-2">Enter your tasks and work hours on the left to generate an AI-optimized schedule.</p>
            </div>
          )}
        </div>
      </main>

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}
