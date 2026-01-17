'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.themeToggleWrapper}>
        <ThemeToggle />
      </div>
      
      <div className={styles.hero}>
        <div className={styles.badge}>✨ AI-Powered Productivity</div>
        <h1 className={styles.title}>
          Turn Your <span className="gradient-text">Brain Dump</span> Into
          <br />
          A Prioritized Schedule
        </h1>
        <p className={styles.subtitle}>
          Stop feeling overwhelmed. Just dump all your tasks, tell us your energy level,
          and let AI organize your day for maximum productivity.
        </p>
        
        <div className={styles.cta}>
          <Button size="lg" onClick={() => router.push('/register')}>
            Get Started Free
          </Button>
          <Button variant="secondary" size="lg" onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🧠</span>
            <span>Brain Dump Input</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⚡</span>
            <span>Energy-Aware</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🤖</span>
            <span>AI Prioritization</span>
          </div>
        </div>
      </div>
      
      <div className={styles.demo}>
        <div className={styles.demoCard}>
          <div className={styles.demoHeader}>
            <div className={styles.demoDots}>
              <span></span><span></span><span></span>
            </div>
          </div>
          <div className={styles.demoContent}>
            <div className={styles.demoInput}>
              <p>📝 Fix login bug, buy milk, reply to emails, research project, call mom...</p>
            </div>
            <div className={styles.demoArrow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </div>
            <div className={styles.demoOutput}>
              <div className={styles.demoTask}>
                <span className={styles.taskNum}>1</span>
                <span className={styles.taskBadge} data-priority="high">High</span>
                <span>Fix login bug</span>
              </div>
              <div className={styles.demoTask}>
                <span className={styles.taskNum}>2</span>
                <span className={styles.taskBadge} data-priority="medium">Med</span>
                <span>Reply to emails</span>
              </div>
              <div className={styles.demoTask}>
                <span className={styles.taskNum}>3</span>
                <span className={styles.taskBadge} data-priority="low">Low</span>
                <span>Buy milk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
