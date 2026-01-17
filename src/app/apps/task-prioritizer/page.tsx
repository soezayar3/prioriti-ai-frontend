'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { BrainDump } from '@/components/BrainDump';
import { EnergySelector, EnergyLevel } from '@/components/EnergySelector';
import { TaskCard } from '@/components/TaskCard';
import api, { Schedule, Task } from '@/lib/api';
import styles from './page.module.css';

export default function TaskPrioritizerPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [brainDump, setBrainDump] = useState('');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [scheduleHistory, setScheduleHistory] = useState<Schedule[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const result = await api.getSchedules(20, 0);
      setScheduleHistory(result.schedules);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, fetchHistory]);

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
      // Refresh history to include new schedule
      fetchHistory();
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
      // Update in history too
      setScheduleHistory(prev => prev.map(schedule => 
        schedule.id === currentSchedule.id
          ? {
              ...schedule,
              tasks: schedule.tasks.map(task =>
                task.id === taskId ? { ...task, is_completed: isCompleted } : task
              ),
            }
          : schedule
      ));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleNewSchedule = () => {
    setCurrentSchedule(null);
    setError('');
  };

  const handleSelectSchedule = (schedule: Schedule) => {
    setCurrentSchedule(schedule);
    setShowHistory(false);
  };

  const handleDeleteSchedule = async (scheduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteSchedule(scheduleId);
      setScheduleHistory(prev => prev.filter(s => s.id !== scheduleId));
      if (currentSchedule?.id === scheduleId) {
        setCurrentSchedule(null);
      }
    } catch (err) {
      console.error('Failed to delete schedule:', err);
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
          <Link href="/apps" className={styles.backLink}>
            ← Apps
          </Link>
          <h1 className={styles.logo}>✨ Task Prioritizer</h1>
        </div>
        <div className={styles.headerRight}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHistory(!showHistory)}
            className={styles.historyButton}
          >
            📋 History ({scheduleHistory.length})
          </Button>
          <ThemeToggle />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        {/* History Sidebar */}
        <aside className={`${styles.sidebar} ${showHistory ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3>Task History</h3>
            <button 
              className={styles.closeSidebar} 
              onClick={() => setShowHistory(false)}
            >
              ✕
            </button>
          </div>
          
          {isLoadingHistory ? (
            <div className={styles.sidebarLoading}>
              <div className={styles.spinnerSmall} />
            </div>
          ) : scheduleHistory.length === 0 ? (
            <p className={styles.emptyHistory}>No previous schedules</p>
          ) : (
            <div className={styles.historyList}>
              {scheduleHistory.map((schedule) => {
                const completedCount = schedule.tasks.filter(t => t.is_completed).length;
                const totalCount = schedule.tasks.length;
                
                return (
                  <div
                    key={schedule.id}
                    className={`${styles.historyItem} ${currentSchedule?.id === schedule.id ? styles.historyItemActive : ''}`}
                    onClick={() => handleSelectSchedule(schedule)}
                  >
                    <div className={styles.historyItemHeader}>
                      <span className={styles.historyDate}>
                        {formatDate(schedule.created_at)}
                      </span>
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => handleDeleteSchedule(schedule.id, e)}
                        title="Delete schedule"
                      >
                        🗑
                      </button>
                    </div>
                    <div className={styles.historyMeta}>
                      <span className={styles.energyBadge}>
                        {schedule.energy_level}
                      </span>
                      <span className={styles.taskCount}>
                        {completedCount}/{totalCount} done
                      </span>
                    </div>
                    <p className={styles.historyPreview}>
                      {schedule.brain_dump.slice(0, 60)}...
                    </p>
                    <div className={styles.historyProgress}>
                      <div 
                        className={styles.historyProgressFill}
                        style={{ width: `${(completedCount / totalCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* Main Content */}
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
    </div>
  );
}
