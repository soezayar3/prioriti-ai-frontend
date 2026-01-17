'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/apps');
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
    <main className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>🚀</span>
            PrioritiAI
          </h1>
          <p className={styles.subtitle}>
            Your AI-powered productivity suite
          </p>
          <p className={styles.description}>
            Transform chaos into clarity. Let AI help you prioritize tasks, 
            plan your day, and boost your productivity.
          </p>
          <div className={styles.cta}>
            <Link href="/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.appPreview}>
            <div className={styles.previewCard}>
              <span className={styles.previewIcon}>✨</span>
              <span>Task Prioritizer</span>
            </div>
            <div className={styles.previewCard}>
              <span className={styles.previewIcon}>📅</span>
              <span>Daily Planner</span>
            </div>
            <div className={styles.previewCard}>
              <span className={styles.previewIcon}>📝</span>
              <span>Meeting Notes</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
