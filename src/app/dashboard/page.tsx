'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { BrainDump } from '@/components/BrainDump';
import { EnergySelector, EnergyLevel } from '@/components/EnergySelector';
import { TaskCard } from '@/components/TaskCard';
import api, { Schedule, Task } from '@/lib/api';
import styles from './page.module.css';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [brainDump, setBrainDump] = useState('');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handlePrioritize = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!brainDump.trim()) {
      setError('Please enter your tasks in the brain dump');
      return;
    }

    if (!energyLevel) {
      setError('Please select your energy level');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await api.prioritize(brainDump, energyLevel);
      setCurrentSchedule(result.schedule);
      setBrainDump('');
      setEnergyLevel('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prioritize tasks');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleComplete = async (taskId: string, isCompleted: boolean) => {
    if (!currentSchedule) return;

    try {
      await api.updateTask(taskId, { isCompleted });
      setCurrentSchedule({
        ...currentSchedule,
        tasks: currentSchedule.tasks.map((task: Task) =>
          task.id === taskId ? { ...task, is_completed: isCompleted } : task
        ),
      });
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleNewSchedule = () => {
    setCurrentSchedule(null);
    setError('');
  };

  if (authLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>✨ PrioritiAI</h1>
        </div>
        <div className={styles.headerRight}>
          <ThemeToggle />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {currentSchedule ? (
          <div className={styles.scheduleView}>
            <div className={styles.scheduleHeader}>
              <div>
                <h2 className={styles.scheduleTitle}>Your Prioritized Schedule</h2>
                <p className={styles.scheduleSubtitle}>
                  {currentSchedule.tasks.length} tasks • {currentSchedule.energy_level} energy
                </p>
              </div>
              <Button variant="secondary" onClick={handleNewSchedule}>
                + New Schedule
              </Button>
            </div>
            
            <div className={styles.taskList}>
              {currentSchedule.tasks.map((task: Task, index: number) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
            
            <div className={styles.progress}>
              <div className={styles.progressInfo}>
                <span>Progress</span>
                <span>
                  {currentSchedule.tasks.filter((t: Task) => t.is_completed).length} / {currentSchedule.tasks.length} completed
                </span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${(currentSchedule.tasks.filter((t: Task) => t.is_completed).length / currentSchedule.tasks.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePrioritize} className={styles.form}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>
                What&apos;s on your mind?
              </h2>
              <p className={styles.formSubtitle}>
                Dump all your tasks below and let AI help you prioritize
              </p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <BrainDump 
              value={brainDump} 
              onChange={setBrainDump}
              disabled={isProcessing}
            />
            
            <EnergySelector 
              value={energyLevel}
              onChange={setEnergyLevel}
              disabled={isProcessing}
            />
            
            <Button 
              type="submit" 
              size="lg" 
              fullWidth 
              isLoading={isProcessing}
            >
              {isProcessing ? 'AI is analyzing your tasks...' : '🚀 Prioritize My Tasks'}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
