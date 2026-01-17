'use client';

import React from 'react';
import styles from './EnergySelector.module.css';

type EnergyLevel = 'low' | 'medium' | 'high';

interface EnergySelectorProps {
  value: EnergyLevel | '';
  onChange: (value: EnergyLevel) => void;
  disabled?: boolean;
}

const energyOptions = [
  {
    value: 'low' as const,
    emoji: '🔋',
    label: 'Low Energy',
    description: 'Tired, need easy tasks',
  },
  {
    value: 'medium' as const,
    emoji: '⚡',
    label: 'Medium Energy',
    description: 'Balanced productivity',
  },
  {
    value: 'high' as const,
    emoji: '🚀',
    label: 'High Energy',
    description: 'Ready to tackle anything!',
  },
];

export function EnergySelector({ value, onChange, disabled }: EnergySelectorProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>⚡</span>
          Energy Level
        </h2>
        <p className={styles.subtitle}>
          How are you feeling right now?
        </p>
      </div>
      <div className={styles.options}>
        {energyOptions.map((option) => (
          <button
            key={option.value}
            className={`${styles.option} ${value === option.value ? styles.selected : ''} ${styles[option.value]}`}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            type="button"
          >
            <span className={styles.emoji}>{option.emoji}</span>
            <span className={styles.label}>{option.label}</span>
            <span className={styles.description}>{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export type { EnergyLevel };
