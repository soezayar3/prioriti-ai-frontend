'use client';

import React from 'react';

export type EnergyLevel = 'low' | 'medium' | 'high';

interface EnergySelectorProps {
  value: EnergyLevel | '';
  onChange: (value: EnergyLevel) => void;
  disabled?: boolean;
}

const energyOptions: { value: EnergyLevel; label: string; icon: string; description: string }[] = [
  { value: 'low', label: 'Low Energy', icon: '🔋', description: 'Tired, need easy tasks' },
  { value: 'medium', label: 'Medium Energy', icon: '⚡', description: 'Balanced productivity' },
  { value: 'high', label: 'High Energy', icon: '🚀', description: 'Ready to tackle anything!' },
];

export function EnergySelector({ value, onChange, disabled }: EnergySelectorProps) {
  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">⚡</span>
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Energy Level</h3>
      </div>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        How are you feeling right now?
      </p>
      <div className="grid grid-cols-3 gap-3">
        {energyOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`p-4 rounded-xl text-center transition-all ${value === option.value ? 'ring-2' : ''}`}
            style={{
              background: value === option.value ? 'var(--accent-light)' : 'var(--bg-tertiary)',
              outline: value === option.value ? '2px solid var(--accent)' : 'none',
              outlineOffset: '2px',
            }}
          >
            <div className="text-2xl mb-2">{option.icon}</div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{option.label}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
