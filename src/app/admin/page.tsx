'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import api, { Feature, AdminUser } from '@/lib/api';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [features, setFeatures] = useState<Feature[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userFeatures, setUserFeatures] = useState<Feature[]>([]);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState<'features' | 'users'>('features');

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
      fetchFeatures();
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const fetchFeatures = async () => {
    setIsLoadingFeatures(true);
    try {
      const data = await api.adminGetFeatures();
      setFeatures(data.features);
    } catch (err) {
      console.error('Failed to fetch features:', err);
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await api.adminGetUsers();
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleToggleFeature = async (featureId: number, currentStatus: boolean) => {
    try {
      await api.adminToggleFeature(featureId, !currentStatus);
      setFeatures(prev => prev.map(f => 
        f.id === featureId ? { ...f, is_enabled: !currentStatus } : f
      ));
    } catch (err) {
      console.error('Failed to toggle feature:', err);
    }
  };

  const handleSelectUser = async (userId: number) => {
    try {
      const data = await api.adminGetUser(userId);
      setSelectedUser(data.user);
      setUserFeatures(data.features);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const handleToggleUserFeature = async (featureId: number, currentStatus: boolean) => {
    if (!selectedUser) return;
    try {
      await api.adminToggleUserFeature(selectedUser.id, featureId, !currentStatus);
      setUserFeatures(prev => prev.map(f => 
        f.id === featureId ? { ...f, is_enabled: !currentStatus } : f
      ));
    } catch (err) {
      console.error('Failed to toggle user feature:', err);
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: 'user' | 'admin') => {
    try {
      await api.adminUpdateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (err) {
      console.error('Failed to update user role:', err);
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-4">
          <Link href="/apps" className="text-sm px-3 py-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
            ← Apps
          </Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--accent)' }}>🔧 Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-3">
            <span className="text-sm px-2 py-1 rounded font-medium" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>Admin</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.name}</span>
            <button onClick={logout} className="btn-ghost text-sm">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('features')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'features' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Features
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Users
          </button>
        </div>

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Global Feature Toggles</h2>
            {isLoadingFeatures ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-3 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {features.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{feature.name}</h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                      <code className="text-xs mt-1 inline-block px-2 py-0.5 rounded" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>{feature.slug}</code>
                    </div>
                    <button
                      onClick={() => handleToggleFeature(feature.id, feature.is_enabled)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${feature.is_enabled ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
                    >
                      {feature.is_enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Users List */}
            <div className="card">
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Users</h2>
              {isLoadingUsers ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-3 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u.id)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${selectedUser?.id === u.id ? 'ring-2 ring-indigo-500' : ''}`}
                      style={{ background: 'var(--bg-tertiary)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{u.email}</p>
                        </div>
                        <span 
                          className={`text-xs px-2 py-1 rounded font-medium ${u.role === 'admin' ? 'bg-indigo-500 text-white' : 'bg-gray-400 text-white'}`}
                        >
                          {u.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="card">
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                {selectedUser ? `${selectedUser.name}'s Settings` : 'Select a User'}
              </h2>
              {selectedUser ? (
                <>
                  {/* Role */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Role</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateUserRole(selectedUser.id, 'user')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedUser.role === 'user' ? 'bg-indigo-500 text-white' : 'btn-ghost'}`}
                      >
                        User
                      </button>
                      <button
                        onClick={() => handleUpdateUserRole(selectedUser.id, 'admin')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedUser.role === 'admin' ? 'bg-indigo-500 text-white' : 'btn-ghost'}`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  {/* Feature Overrides */}
                  <div>
                    <h3 className="font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Feature Access</h3>
                    <div className="flex flex-col gap-2">
                      {userFeatures.map((feature) => (
                        <div key={feature.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                          <span style={{ color: 'var(--text-primary)' }}>{feature.name}</span>
                          <button
                            onClick={() => handleToggleUserFeature(feature.id, feature.is_enabled)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-all ${feature.is_enabled ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
                          >
                            {feature.is_enabled ? 'On' : 'Off'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Click on a user to manage their settings</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
