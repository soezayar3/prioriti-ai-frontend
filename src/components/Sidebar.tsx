"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface AppInfo {
  slug: string;
  name: string;
  icon: string;
  route: string;
  gradient: string;
}

const appRegistry: AppInfo[] = [
  {
    slug: "apps",
    name: "Dashboard",
    icon: "🏠",
    route: "/apps",
    gradient: "from-slate-500 to-slate-600",
  },
  {
    slug: "task-prioritizer",
    name: "Task Prioritizer",
    icon: "✨",
    route: "/apps/task-prioritizer",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    slug: "daily-planner",
    name: "Daily Planner",
    icon: "📅",
    route: "/apps/daily-planner",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    slug: "mood-journal",
    name: "Mood Journal",
    icon: "🌈",
    route: "/apps/mood-journal",
    gradient: "from-amber-400 to-orange-500",
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (route: string) => {
    if (route === "/apps") {
      return pathname === "/apps";
    }
    return pathname.startsWith(route);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border-color)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border-color)" }}
        >
          <h1
            className="text-xl font-bold flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <span>🚀</span>
            <span className="gradient-text">PrioritiAI</span>
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: "var(--text-secondary)" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {appRegistry.map((app) => {
              const active = isActive(app.route);
              return (
                <Link
                  key={app.slug}
                  href={app.route}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                    ${
                      active
                        ? "shadow-sm"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                  `}
                  style={{
                    background: active ? "var(--accent-light)" : "transparent",
                    color: active ? "var(--accent)" : "var(--text-primary)",
                  }}
                >
                  <div
                    className={`
                      w-9 h-9 rounded-lg flex items-center justify-center text-lg
                      ${active ? `bg-gradient-to-br ${app.gradient} shadow-md` : ""}
                    `}
                    style={{
                      background: active ? undefined : "var(--bg-tertiary)",
                    }}
                  >
                    {app.icon}
                  </div>
                  <span
                    className={`font-medium ${active ? "font-semibold" : ""}`}
                  >
                    {app.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Admin Link */}
          {user?.role === "admin" && (
            <div
              className="mt-6 pt-4 border-t"
              style={{ borderColor: "var(--border-color)" }}
            >
              <Link
                href="/admin"
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                  ${
                    pathname === "/admin"
                      ? "shadow-sm"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
                style={{
                  background:
                    pathname === "/admin"
                      ? "var(--accent-light)"
                      : "transparent",
                  color:
                    pathname === "/admin"
                      ? "var(--accent)"
                      : "var(--text-primary)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  🔧
                </div>
                <span className="font-medium">Admin Panel</span>
              </Link>
            </div>
          )}
        </nav>

        {/* User Section */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: "var(--border-color)" }}
        >
          
          <div className="relative" ref={menuRef}>
            <div 
              className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium truncate text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {user?.name || "User"}
                </p>
                {user?.role && (
                  <span
                    className="text-xs px-2 py-0.5 rounded font-medium capitalize"
                    style={{
                      background: "var(--accent-light)",
                      color: "var(--accent)",
                    }}
                  >
                    {user.role}
                  </span>
                )}
              </div>
              {/* Three dots icon */}
              <button
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                style={{ color: "var(--text-secondary)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <circle cx="10" cy="4" r="1.5" />
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="10" cy="16" r="1.5" />
                </svg>
              </button>
            </div>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div 
                className="absolute bottom-full left-0 right-0 mb-2 py-1 rounded-xl shadow-lg border animate-fade-in"
                style={{ 
                  background: "var(--bg-card)", 
                  borderColor: "var(--border-color)" 
                }}
              >
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ color: "var(--text-primary)" }}
                >
                  <span>🚪</span>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
