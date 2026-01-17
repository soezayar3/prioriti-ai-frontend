'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="grid md:grid-cols-2 gap-16 max-w-6xl w-full items-center">
        {/* Hero Content */}
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl font-extrabold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <span className="text-4xl">🚀</span>
            PrioritiAI
          </h1>
          <p className="text-2xl font-semibold" style={{ color: 'var(--accent)' }}>
            Your AI-powered productivity suite
          </p>
          <p className="text-lg leading-relaxed max-w-lg" style={{ color: 'var(--text-secondary)' }}>
            Transform chaos into clarity. Let AI help you prioritize tasks, 
            plan your day, and boost your productivity.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/register" className="btn-primary px-8 py-4 text-lg">
              Get Started Free
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-4 text-lg">
              Sign In
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hidden md:flex justify-center">
          <div className="flex flex-col gap-4" style={{ perspective: '1000px' }}>
            {[
              { icon: '✨', name: 'Task Prioritizer' },
              { icon: '📅', name: 'Daily Planner' },
              { icon: '📝', name: 'Meeting Notes' },
            ].map((item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-4 px-8 py-5 rounded-xl font-medium shadow-lg transition-all hover:translate-x-2"
                style={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  transform: 'rotateY(-5deg) rotateX(5deg)',
                  animation: `slideIn 0.6s ease ${index * 0.1}s forwards`,
                  opacity: index === 0 ? 1 : 0,
                }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(50px) rotateY(-5deg) rotateX(5deg);
          }
          to {
            opacity: 1;
            transform: translateX(0) rotateY(-5deg) rotateX(5deg);
          }
        }
      `}</style>
    </main>
  );
}
