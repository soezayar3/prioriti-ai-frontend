'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import api, { DailyPlan } from '@/lib/api';
import { Timeline } from '@/components/Timeline';

export default function HistoryPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<DailyPlan | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await api.getDailyPlans();
        setPlans(data.plans);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar - History List */}
      <aside className="w-96 p-6 border-r flex flex-col h-screen sticky top-0 overflow-y-auto" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="mb-8">
          <button onClick={() => router.push('/apps/daily-planner')} className="flex items-center gap-2 mb-6 opacity-60 hover:opacity-100 transition-opacity">
            <span>←</span> Back to Planner
          </button>
          <h1 className="text-2xl font-bold mb-2 icon-gradient">History</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>View your past daily plans.</p>
        </div>

        <div className="flex-1 space-y-4">
          {loading ? (
             <div className="text-center opacity-50 py-10">Loading history...</div>
          ) : plans.length === 0 ? (
            <div className="text-center opacity-50 py-10">No history found.</div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  selectedPlan?.id === plan.id
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-transparent hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">{new Date(plan.date).toLocaleDateString()}</span>
                  <span className="text-xs opacity-60">
                    {new Date(plan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs opacity-60 line-clamp-2">
                  {plan.original_input}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
           <ThemeToggle />
        </div>
      </aside>

      {/* Main Content - Preview */}
      <main className="flex-1 p-8 overflow-y-auto bg-dots">
        <div className="max-w-2xl mx-auto">
          {selectedPlan ? (
            <>
              <div className="mb-8">
                 <h2 className="text-xl font-bold mb-2">Schedule for {new Date(selectedPlan.date).toDateString()}</h2>
                 <p className="text-sm opacity-60">Created on {new Date(selectedPlan.created_at).toLocaleString()}</p>
              </div>
              <Timeline schedule={selectedPlan.schedule} />
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-40 mt-20">
              <div className="text-6xl mb-4">📜</div>
              <p className="text-xl font-medium">Select a plan to view details</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
