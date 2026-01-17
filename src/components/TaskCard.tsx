'use client';

import React from 'react';
import { Task } from '@/lib/api';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  index: number;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
}

export function TaskCard({ task, index, onToggleComplete }: TaskCardProps) {
  const priorityClass = styles[`priority${task.priority}`];
  
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div 
      className={`${styles.card} ${task.is_completed ? styles.completed : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={styles.header}>
        <div className={styles.orderBadge}>{index + 1}</div>
        <span className={`${styles.priorityBadge} ${priorityClass}`}>
          {task.priority}
        </span>
      </div>
      
      <div className={styles.content}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={task.is_completed}
            onChange={(e) => onToggleComplete(task.id, e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.checkmark}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </label>
        
        <div className={styles.taskInfo}>
          <h3 className={styles.title}>{task.title}</h3>
          <div className={styles.meta}>
            <span className={styles.category}>{task.category}</span>
            <span className={styles.time}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formatTime(task.estimated_minutes)}
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.reason}>
        <span className={styles.reasonIcon}>💡</span>
        <p>{task.reason}</p>
      </div>
    </div>
  );
}
