'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Toast } from '@/components/ui/Toast';
import api, { JournalEntry } from '@/lib/api';

const moodColors: Record<string, string> = {
  happy: 'bg-yellow-400',
  excited: 'bg-orange-400',
  proud: 'bg-purple-400',
  calm: 'bg-blue-400',
  neutral: 'bg-gray-400',
  tired: 'bg-slate-500',
  anxious: 'bg-amber-500',
  stressed: 'bg-red-400',
  frustrated: 'bg-red-500',
  sad: 'bg-blue-600',
};

const moodEmojis: Record<string, string> = {
  happy: '😊',
  excited: '🎉',
  proud: '💪',
  calm: '😌',
  neutral: '😐',
  tired: '😴',
  anxious: '😰',
  stressed: '😫',
  frustrated: '😤',
  sad: '😢',
};

export default function MoodJournalPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [content, setContent] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  };

  const fetchEntries = useCallback(async () => {
    try {
      const data = await api.getJournalEntries();
      setEntries(data.data);
    } catch (err) {
      console.error('Failed to load entries:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
    }
  }, [isAuthenticated, fetchEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await api.createJournalEntry(content);
      setEntries([result.entry, ...entries]);
      setContent('');
      showToast(
        result.analysis?.summary || 'Entry saved!',
        'success'
      );
    } catch (err) {
      console.error('Failed to save entry:', err);
      showToast('Failed to save entry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteJournalEntry(id);
      setEntries(entries.filter((e) => e.id !== id));
      showToast('Entry deleted', 'info');
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar - Entry Form */}
      <aside className="w-full md:w-96 p-4 md:p-6 border-b md:border-b-0 md:border-r flex flex-col md:h-screen md:sticky md:top-0" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => router.push('/apps')} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <span>←</span> Back
            </button>
            <button onClick={() => router.push('/apps/mood-journal/insights')} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity text-sm">
              📊 Insights
            </button>
          </div>
          <h1 className="text-xl md:text-2xl font-bold mb-2 icon-gradient">🌈 Mood Journal</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Write 1-2 sentences about your day.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Had a long day but finally fixed that bug. Feeling tired but proud."
            className="w-full h-24 md:h-32 rounded-xl p-4 resize-none transition-all focus:ring-2 focus:ring-amber-500 outline-none"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              '✨ Save Entry'
            )}
          </button>
        </form>

        <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Entries */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-6">Recent Entries</h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-gray-300 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <div className="text-5xl mb-4">📝</div>
              <p>No entries yet. Start journaling!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl border transition-all hover:shadow-md"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      {entry.mood_label && (
                        <div className={`w-10 h-10 rounded-full ${moodColors[entry.mood_label] || 'bg-gray-400'} flex items-center justify-center text-xl`}>
                          {moodEmojis[entry.mood_label] || '😐'}
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                          {entry.mood_label || 'Unknown'}
                        </span>
                        {entry.mood_score !== null && (
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Score: {(entry.mood_score * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="opacity-40 hover:opacity-100 text-sm"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <p className="mb-3" style={{ color: 'var(--text-primary)' }}>{entry.content}</p>

                  {entry.entities && (entry.entities.activities?.length > 0 || entry.entities.people?.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {entry.entities.activities?.map((activity, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600">
                          {activity}
                        </span>
                      ))}
                      {entry.entities.people?.map((person, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-600">
                          {person}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
