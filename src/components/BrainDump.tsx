'use client';

import React from 'react';
import styles from './BrainDump.module.css';

interface BrainDumpProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function BrainDump({ value, onChange, disabled }: BrainDumpProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>🧠</span>
          Brain Dump
        </h2>
        <p className={styles.subtitle}>
          Just dump everything on your mind. Don&apos;t worry about order or formatting!
        </p>
      </div>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Example:
- Fix that login bug
- Reply to Sarah's email
- Buy groceries (milk, eggs, bread)
- Research for the new project
- Call mom
- Finish the report by Friday
- Schedule dentist appointment
- Review pull requests..."
        disabled={disabled}
        rows={8}
      />
      <div className={styles.footer}>
        <span className={styles.hint}>
          💡 Tip: Include deadlines, priorities, or any context you remember
        </span>
      </div>
    </div>
  );
}
