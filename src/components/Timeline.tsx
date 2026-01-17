import React from 'react';
import { ScheduledBlock } from '@/lib/api';

interface TimelineProps {
  schedule: ScheduledBlock[];
}

export const Timeline: React.FC<TimelineProps> = ({ schedule }) => {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>
        No schedule generated yet.
      </div>
    );
  }

  const getTypeStyle = (type: ScheduledBlock['type']) => {
    switch (type) {
      case 'focus':
        return 'border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10';
      case 'meeting':
        return 'border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-900/10';
      case 'break':
        return 'border-l-4 border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10 opacity-80';
      case 'routine':
        return 'border-l-4 border-gray-400 bg-gray-50/50 dark:bg-gray-800/10';
      default:
        return 'border-l-4 border-gray-400 bg-gray-50/50 dark:bg-gray-800/10';
    }
  };

  return (
    <div className="relative pl-6 border-l" style={{ borderColor: 'var(--border-color)' }}>
      {schedule.map((block, index) => (
        <div key={index} className="mb-6 relative">
          {/* Time Dot */}
          <div 
            className="absolute -left-[29.5px] top-4 w-4 h-4 rounded-full border-4" 
            style={{ 
              borderColor: 'var(--bg-primary)', 
              background: block.type === 'focus' ? 'var(--accent)' : 'var(--text-secondary)' 
            }} 
          />
          
          {/* Content Card */}
          <div className={`p-4 rounded-lg shadow-sm ${getTypeStyle(block.type)}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
              <span className="font-mono text-sm font-semibold opacity-70" style={{ color: 'var(--text-primary)' }}>
                {block.time}
              </span>
              <span className="uppercase text-[10px] tracking-wider font-bold opacity-60 px-2 py-0.5 rounded border border-current">
                {block.type}
              </span>
            </div>
            <h3 className="font-medium text-lg" style={{ color: 'var(--text-primary)' }}>
              {block.activity}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
};
