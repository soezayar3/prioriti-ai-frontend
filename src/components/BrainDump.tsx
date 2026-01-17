'use client';

import React from 'react';

interface BrainDumpProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function BrainDump({ value, onChange, disabled }: BrainDumpProps) {
  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🧠</span>
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Brain Dump</h3>
      </div>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        Just dump everything on your mind. Don&apos;t worry about order or formatting!
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Fix login bug, reply to client emails, buy groceries, prepare presentation for Monday..."
        className="w-full h-32 resize-none"
        style={{ background: 'var(--bg-input)' }}
      />
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        💡 Tip: Include deadlines, priorities, or any context you remember
      </p>
    </div>
  );
}
