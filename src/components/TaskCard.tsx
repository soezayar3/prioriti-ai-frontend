'use client';

import React from 'react';
import { Task } from '@/lib/api';

interface TaskCardProps {
  task: Task;
  index: number;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
}

export function TaskCard({ task, index, onToggleComplete }: TaskCardProps) {
  const priorityColors: Record<string, { bg: string; text: string }> = {
    High: { bg: 'var(--priority-high-bg)', text: 'var(--priority-high)' },
    Medium: { bg: 'var(--priority-medium-bg)', text: 'var(--priority-medium)' },
    Low: { bg: 'var(--priority-low-bg)', text: 'var(--priority-low)' },
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const colors = priorityColors[task.priority] || priorityColors.Medium;

  return (
    <div
      className={`rounded-xl p-5 transition-all animate-fade-in ${task.is_completed ? 'opacity-60' : ''}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          {index + 1}
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: colors.bg, color: colors.text }}
        >
          {task.priority}
        </span>
      </div>

      {/* Content */}
      <div className="flex items-start gap-3">
        <label className="relative cursor-pointer mt-1">
          <input
            type="checkbox"
            checked={task.is_completed}
            onChange={(e) => onToggleComplete(task.id, e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${task.is_completed ? 'border-green-500 bg-green-500' : ''}`}
            style={{ borderColor: task.is_completed ? '#22c55e' : 'var(--border-color)' }}
          >
            {task.is_completed && (
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </label>

        <div className="flex-1">
          <h3
            className={`font-semibold mb-1 ${task.is_completed ? 'line-through' : ''}`}
            style={{ color: 'var(--text-primary)' }}
          >
            {task.title}
          </h3>
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="px-2 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)' }}>
              {task.category}
            </span>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formatTime(task.estimated_minutes)}
            </span>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="mt-3 flex gap-2 items-start">
        <span>💡</span>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {task.reason}
        </p>
      </div>
    </div>
  );
}
