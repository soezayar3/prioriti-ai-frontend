'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Timeline } from '@/components/Timeline';
import { Toast } from '@/components/ui/Toast';
import api, { ScheduledBlock, DailyPlan } from '@/lib/api';

export default function DailyPlannerPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [brainDump, setBrainDump] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [schedule, setSchedule] = useState<ScheduledBlock[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  
  // History state
  const [planHistory, setPlanHistory] = useState<DailyPlan[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DailyPlan | null>(null);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  };

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const data = await api.getDailyPlans();
      setPlanHistory(data.plans);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, fetchHistory]);

  const handleGenerate = async () => {
    if (!brainDump.trim()) return;
    
    setIsGenerating(true);
    setError('');
    setSelectedPlan(null);
    
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
      const today = new Date().toISOString().split('T')[0];
      await api.saveDailyPlan(today, schedule, brainDump);
      showToast('Schedule saved successfully!', 'success');
      fetchHistory();
    } catch (err) {
      console.error('Failed to save plan:', err);
      showToast('Failed to save schedule.', 'error');
    }
  };

  const handleSelectPlan = (plan: DailyPlan) => {
    setSelectedPlan(plan);
    setSchedule(plan.schedule);
    setBrainDump(plan.original_input || '');
    setShowHistory(false);
  };

  const handleNewPlan = () => {
    setSelectedPlan(null);
    setSchedule([]);
    setBrainDump('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="text-lg md:text-xl font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
          <span>📅</span>
          Daily Planner
        </h1>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn-ghost text-sm"
        >
          📜 <span className="hidden sm:inline">History </span>({planHistory.length})
        </button>
      </div>

      <div className="flex relative">
        {/* History Sidebar */}
        <aside className={`fixed top-0 md:top-0 right-0 w-full sm:w-80 h-full border-l overflow-y-auto transition-transform duration-300 z-40 ${showHistory ? 'translate-x-0' : 'translate-x-full'}`} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex justify-between items-center px-5 py-4 border-b sticky top-0" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Plan History</h3>
            <button onClick={() => setShowHistory(false)} className="text-lg opacity-60 hover:opacity-100" style={{ color: 'var(--text-secondary)' }}>✕</button>
          </div>
          
          {isLoadingHistory ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : planHistory.length === 0 ? (
            <p className="text-center p-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No previous plans</p>
          ) : (
            <div className="flex flex-col">
              {planHistory.map((plan) => (
                <div
                  key={plan.id}
                  className={`px-5 py-4 border-b cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedPlan?.id === plan.id ? 'border-l-4 border-l-emerald-500 bg-gray-50 dark:bg-gray-800' : ''}`}
                  style={{ borderColor: 'var(--border-color)' }}
                  onClick={() => handleSelectPlan(plan)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {new Date(plan.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(plan.created_at)}</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                    {plan.original_input?.slice(0, 60) || 'No description'}...
                  </p>
                  <div className="mt-2 text-xs" style={{ color: 'var(--accent)' }}>
                    {plan.schedule.length} blocks
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {schedule.length > 0 || selectedPlan ? (
            <div className="animate-fade-in">
              <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {selectedPlan ? `Schedule for ${new Date(selectedPlan.date).toDateString()}` : 'Your Schedule'}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {schedule.length} time blocks
                  </p>
                </div>
                <div className="flex gap-2">
                  {!selectedPlan && (
                    <button onClick={handleSave} className="btn-secondary flex items-center gap-2">
                      💾 Save
                    </button>
                  )}
                  <button onClick={handleNewPlan} className="btn-secondary">+ New Plan</button>
                </div>
              </div>
              
              <Timeline schedule={schedule} />
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="flex flex-col gap-6 animate-fade-in">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Plan Your Day</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Enter your tasks and let AI create the perfect schedule</p>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg text-center text-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                  {error}
                </div>
              )}

              {/* Brain Dump Input */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Brain Dump</label>
                <textarea
                  value={brainDump}
                  onChange={(e) => setBrainDump(e.target.value)}
                  placeholder="What do you need to get done today? e.g.&#10;- Finish report (2h)&#10;- Call mom&#10;- Review PRs"
                  className="w-full h-40 rounded-xl p-4 resize-none transition-all focus:ring-2 focus:ring-emerald-500 outline-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                />
              </div>

              {/* Time Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !brainDump.trim()}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI is planning your day...
                  </>
                ) : (
                  '✨ Generate Schedule'
                )}
              </button>
            </form>
          )}
        </main>
      </div>

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}
