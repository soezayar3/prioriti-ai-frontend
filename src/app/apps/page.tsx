"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import styles from "./page.module.css";

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

const apps: App[] = [
  {
    id: "task-prioritizer",
    name: "Task Prioritizer",
    description: "AI-powered task prioritization based on your energy level",
    icon: "✨",
    route: "/apps/task-prioritizer",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  // Future apps will be added here
  {
    id: "coming-soon-1",
    name: "Daily Planner",
    description: "AI-generated time-blocked daily schedules",
    icon: "📅",
    route: "#",
    color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
  {
    id: "coming-soon-2",
    name: "Meeting Summarizer",
    description: "Summarize meeting notes with action items",
    icon: "📝",
    route: "#",
    color: "linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)",
  },
];

export default function AppsPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
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
          <h1 className={styles.logo}>🚀 PrioritiAI</h1>
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
        <div className={styles.hero}>
          <h2 className={styles.title}>Your AI Productivity Suite</h2>
          <p className={styles.subtitle}>
            Choose an app to boost your productivity with AI
          </p>
        </div>

        <div className={styles.appsGrid}>
          {apps.map((app) => (
            <Link
              key={app.id}
              href={app.route}
              className={`${styles.appCard} ${app.route === "#" ? styles.disabled : ""}`}
              onClick={(e) => app.route === "#" && e.preventDefault()}
            >
              <div className={styles.appIcon} style={{ background: app.color }}>
                <span>{app.icon}</span>
              </div>
              <div className={styles.appInfo}>
                <h3 className={styles.appName}>{app.name}</h3>
                <p className={styles.appDescription}>{app.description}</p>
              </div>
              {app.route === "#" && (
                <span className={styles.comingSoon}>Coming Soon</span>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
