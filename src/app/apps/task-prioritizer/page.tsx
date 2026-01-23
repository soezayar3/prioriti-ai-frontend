'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BrainDump } from '@/components/BrainDump';
import { EnergySelector, EnergyLevel } from '@/components/EnergySelector';
import { TaskCard } from '@/components/TaskCard';
import api, { Schedule, Task } from '@/lib/api';

export default function TaskPrioritizerPage() {
  const { isAuthenticated } = useAuth();
  
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
      fetchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prioritize tasks');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleComplete = async (taskId: string, isCompleted: boolean) => {
    if (!currentSchedule || !currentSchedule.tasks) return;

    try {
      await api.updateTask(taskId, { isCompleted });
      setCurrentSchedule({
        ...currentSchedule,
        tasks: currentSchedule.tasks.map((task: Task) =>
          task.id === taskId ? { ...task, is_completed: isCompleted } : task
        ),
      });
      setScheduleHistory(prev => prev.map(schedule => 
        schedule.id === currentSchedule.id
          ? {
              ...schedule,
              tasks: (schedule.tasks || []).map(task =>
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="text-lg md:text-xl font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
          <span>✨</span>
          Task Prioritizer
        </h1>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn-ghost text-sm"
        >
          📋 <span className="hidden sm:inline">History </span>({scheduleHistory.length})
        </button>
      </div>

      <div className="flex relative">
        {/* History Sidebar */}
        <aside className={`fixed top-0 md:top-0 right-0 w-full sm:w-80 h-full border-l overflow-y-auto transition-transform duration-300 z-40 ${showHistory ? 'translate-x-0' : 'translate-x-full'}`} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex justify-between items-center px-5 py-4 border-b sticky top-0" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Task History</h3>
            <button onClick={() => setShowHistory(false)} className="text-lg opacity-60 hover:opacity-100" style={{ color: 'var(--text-secondary)' }}>✕</button>
          </div>
          
          {isLoadingHistory ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : scheduleHistory.length === 0 ? (
            <p className="text-center p-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No previous schedules</p>
          ) : (
            <div className="flex flex-col">
              {scheduleHistory.map((schedule) => {
                const completedCount = (schedule.tasks || []).filter(t => t.is_completed).length;
                const totalCount = (schedule.tasks || []).length;
                
                return (
                  <div
                    key={schedule.id}
                    className={`px-5 py-4 border-b cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${currentSchedule?.id === schedule.id ? 'border-l-4 border-l-indigo-500 bg-gray-50 dark:bg-gray-800' : ''}`}
                    style={{ borderColor: 'var(--border-color)' }}
                    onClick={() => handleSelectSchedule(schedule)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(schedule.created_at)}</span>
                      <button
                        className="text-sm opacity-50 hover:opacity-100 p-1"
                        onClick={(e) => handleDeleteSchedule(schedule.id, e)}
                        title="Delete schedule"
                      >
                        🗑
                      </button>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase px-2 py-1 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{schedule.energy_level}</span>
                      <span className="text-xs" style={{ color: 'var(--accent)' }}>{completedCount}/{totalCount} done</span>
                    </div>
                    <p className="text-xs truncate mb-2" style={{ color: 'var(--text-secondary)' }}>{schedule.brain_dump.slice(0, 60)}...</p>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                      <div className="h-full transition-all" style={{ width: `${(completedCount / totalCount) * 100}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {currentSchedule ? (
            <div className="animate-fade-in">
              <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Your Prioritized Schedule</h2>
                  <p className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{(currentSchedule.tasks || []).length} tasks • {currentSchedule.energy_level} energy</p>
                </div>
                <button onClick={handleNewSchedule} className="btn-secondary">+ New Schedule</button>
              </div>
              
              <div className="flex flex-col gap-4 mb-8">
                {(currentSchedule.tasks || []).map((task: Task, index: number) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
              
              <div className="card">
                <div className="flex justify-between text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <span>Progress</span>
                  <span>{(currentSchedule.tasks || []).filter((t: Task) => t.is_completed).length} / {(currentSchedule.tasks || []).length} completed</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                  <div 
                    className="h-full rounded-full transition-all duration-400"
                    style={{ 
                      width: `${((currentSchedule.tasks || []).filter((t: Task) => t.is_completed).length / Math.max((currentSchedule.tasks || []).length, 1)) * 100}%`,
                      background: 'linear-gradient(90deg, var(--accent) 0%, #8b5cf6 100%)'
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePrioritize} className="flex flex-col gap-6 animate-fade-in">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>What&apos;s on your mind?</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Dump all your tasks below and let AI help you prioritize</p>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg text-center text-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                  {error}
                </div>
              )}

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
              
              <button 
                type="submit" 
                disabled={isProcessing}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI is analyzing your tasks...
                  </>
                ) : (
                  '🚀 Prioritize My Tasks'
                )}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
