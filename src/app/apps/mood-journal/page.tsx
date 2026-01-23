"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Toast } from "@/components/ui/Toast";
import api, { JournalEntry } from "@/lib/api";

const moodColors: Record<string, string> = {
  happy: "bg-yellow-400",
  excited: "bg-orange-400",
  proud: "bg-purple-400",
  calm: "bg-blue-400",
  neutral: "bg-gray-400",
  tired: "bg-slate-500",
  anxious: "bg-amber-500",
  stressed: "bg-red-400",
  frustrated: "bg-red-500",
  sad: "bg-blue-600",
};

const moodEmojis: Record<string, string> = {
  happy: "😊",
  excited: "🎉",
  proud: "💪",
  calm: "😌",
  neutral: "😐",
  tired: "😴",
  anxious: "😰",
  stressed: "😫",
  frustrated: "😤",
  sad: "😢",
};

export default function MoodJournalPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showEntries, setShowEntries] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "info",
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToast({ show: true, message, type });
  };

  const fetchEntries = useCallback(async () => {
    try {
      const data = await api.getJournalEntries();
      setEntries(data.data);
    } catch (err) {
      console.error("Failed to load entries:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      setContent("");
      showToast(result.analysis?.summary || "Entry saved!", "success");
    } catch (err) {
      console.error("Failed to save entry:", err);
      showToast("Failed to save entry", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteJournalEntry(id);
      setEntries(entries.filter((e) => e.id !== id));
      showToast("Entry deleted", "info");
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
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
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Page Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="text-lg md:text-xl font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
          <span>🌈</span>
          Mood Journal
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEntries(!showEntries)}
            className="btn-ghost text-sm"
          >
            📝 <span className="hidden sm:inline">Entries </span>({entries.length})
          </button>
          <button
            onClick={() => router.push('/apps/mood-journal/insights')}
            className="btn-ghost text-sm"
          >
            📊 <span className="hidden sm:inline">Insights</span>
          </button>
        </div>
      </div>

      <div className="flex relative">
        {/* Entries Sidebar */}
        <aside className={`fixed top-0 md:top-0 right-0 w-full sm:w-80 h-full border-l overflow-y-auto transition-transform duration-300 z-40 ${showEntries ? 'translate-x-0' : 'translate-x-full'}`} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex justify-between items-center px-5 py-4 border-b sticky top-0" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Entries</h3>
            <button onClick={() => setShowEntries(false)} className="text-lg opacity-60 hover:opacity-100" style={{ color: 'var(--text-secondary)' }}>✕</button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center p-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No entries yet</p>
          ) : (
            <div className="flex flex-col">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="px-5 py-4 border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {entry.mood_label && (
                        <div className={`w-6 h-6 rounded-full ${moodColors[entry.mood_label] || "bg-gray-400"} flex items-center justify-center text-sm`}>
                          {moodEmojis[entry.mood_label] || "😐"}
                        </div>
                      )}
                      <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                        {entry.mood_label || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(entry.created_at)}</span>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="opacity-40 hover:opacity-100 text-sm"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-fade-in mb-8">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>How are you feeling?</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Write 1-2 sentences about your day and let AI analyze your mood</p>
            </div>

            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Had a long day but finally fixed that bug. Feeling tired but proud."
                className="w-full h-32 rounded-xl p-4 resize-none transition-all focus:ring-2 focus:ring-amber-500 outline-none"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                }}
                maxLength={1000}
              />
              <div className="text-right mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                {content.length}/1000
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing your mood...
                </>
              ) : (
                "✨ Save Entry"
              )}
            </button>
          </form>

          {/* Recent Entries Preview */}
          {entries.length > 0 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Entries</h3>
                <button 
                  onClick={() => setShowEntries(true)}
                  className="text-sm font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  View all →
                </button>
              </div>
              <div className="space-y-4">
                {entries.slice(0, 3).map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl border transition-all hover:shadow-md"
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {entry.mood_label && (
                          <div
                            className={`w-10 h-10 rounded-full ${moodColors[entry.mood_label] || "bg-gray-400"} flex items-center justify-center text-xl`}
                          >
                            {moodEmojis[entry.mood_label] || "😐"}
                          </div>
                        )}
                        <div>
                          <span
                            className="text-sm font-medium capitalize"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {entry.mood_label || "Unknown"}
                          </span>
                          {entry.mood_score !== null && (
                            <div
                              className="text-xs"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Score: {(entry.mood_score * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
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

                    <p className="mb-3" style={{ color: "var(--text-primary)" }}>
                      {entry.content}
                    </p>

                    {entry.entities &&
                      (entry.entities.activities?.length > 0 ||
                        entry.entities.people?.length > 0) && (
                        <div className="flex flex-wrap gap-2">
                          {entry.entities.activities?.map((activity, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600"
                            >
                              {activity}
                            </span>
                          ))}
                          {entry.entities.people?.map((person, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-600"
                            >
                              {person}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
