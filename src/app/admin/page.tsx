'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import api, { AdminUser } from '@/lib/api';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && user?.role !== 'admin') {
      router.push('/apps');
    }
  }, [isAuthenticated, authLoading, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setErrorMessage(null);
    try {
      const data = await api.adminGetUsers();
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setErrorMessage('Failed to fetch users. Make sure admin RLS policies are configured.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await api.adminUpdateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await api.adminUpdateUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ));
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  // Filter out admin users from management list
  const manageableUsers = users.filter(u => u.role !== 'admin');
  const pendingUsers = manageableUsers.filter(u => u.status === 'pending');
  const approvedUsers = manageableUsers.filter(u => u.status === 'approved');
  const rejectedUsers = manageableUsers.filter(u => u.status === 'rejected');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-4 sticky top-0 z-50 border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/apps" className="text-sm px-2 md:px-3 py-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
            ←<span className="hidden sm:inline"> Apps</span>
          </Link>
          <h1 className="text-base sm:text-xl font-bold" style={{ color: 'var(--accent)' }}>🔧 Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <span className="hidden sm:inline text-sm px-2 py-1 rounded font-medium" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>Admin</span>
          <button onClick={logout} className="btn-ghost text-sm">Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>User Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Approve or reject user registrations</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--warning)' }}>{pendingUsers.length}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Pending</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--success)' }}>{approvedUsers.length}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Approved</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--error)' }}>{rejectedUsers.length}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Rejected</div>
          </div>
        </div>

        {/* Pending Users Section */}
        {pendingUsers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              ⏳ Pending Approval ({pendingUsers.length})
            </h3>
            <div className="space-y-3">
              {pendingUsers.map(u => (
                <UserCard 
                  key={u.id} 
                  user={u} 
                  onUpdateStatus={handleUpdateUserStatus}
                  onUpdateRole={handleUpdateUserRole}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Users */}
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            👥 All Users ({manageableUsers.length})
          </h3>
          {isLoadingUsers ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {manageableUsers.map(u => (
                <UserCard 
                  key={u.id} 
                  user={u} 
                  onUpdateStatus={handleUpdateUserStatus}
                  onUpdateRole={handleUpdateUserRole}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// User Card Component
function UserCard({ 
  user, 
  onUpdateStatus, 
  onUpdateRole 
}: { 
  user: AdminUser;
  onUpdateStatus: (id: string, status: 'pending' | 'approved' | 'rejected') => void;
  onUpdateRole: (id: string, role: 'user' | 'admin') => void;
}) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.name || 'No name'}</span>
          {user.role === 'admin' && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>Admin</span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded ${statusColors[user.status]}`}>
            {user.status}
          </span>
        </div>
        <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          ID: {user.id.slice(0, 8)}... • Joined: {new Date(user.created_at).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {user.status === 'pending' && (
          <>
            <button 
              onClick={() => onUpdateStatus(user.id, 'approved')}
              className="btn-primary text-sm py-1.5 px-3"
            >
              ✓ Approve
            </button>
            <button 
              onClick={() => onUpdateStatus(user.id, 'rejected')}
              className="btn-ghost text-sm py-1.5 px-3 text-red-500"
            >
              ✗ Reject
            </button>
          </>
        )}
        {user.status === 'approved' && (
          <button 
            onClick={() => onUpdateStatus(user.id, 'rejected')}
            className="btn-ghost text-sm py-1.5 px-3"
          >
            Revoke
          </button>
        )}
        {user.status === 'rejected' && (
          <button 
            onClick={() => onUpdateStatus(user.id, 'approved')}
            className="btn-ghost text-sm py-1.5 px-3"
          >
            Approve
          </button>
        )}
        <select
          value={user.role}
          onChange={(e) => onUpdateRole(user.id, e.target.value as 'user' | 'admin')}
          className="text-sm px-2 py-1.5 rounded border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </div>
  );
}
