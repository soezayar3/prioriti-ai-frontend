'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapToUser(supabaseUser: SupabaseUser, profile: Profile | null): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profile?.name || supabaseUser.user_metadata?.name || null,
    role: profile?.role || 'user',
    status: profile?.status || 'pending',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initRef = useRef(false);

  // Fetch profile for a user
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // PGRST116 means no rows found - user has no profile yet
        if (error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }
        return null;
      }
      return data;
    } catch (err) {
      console.error('Profile fetch error:', err);
      return null;
    }
  };

  // Load user from session
  const loadUser = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const profile = await fetchProfile(session.user.id);
    setUser(mapToUser(session.user, profile));
    setIsLoading(false);
  };

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initRef.current) return;
    initRef.current = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          loadUser(session);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }
    // onAuthStateChange will handle loading the user
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }

    // Wait for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Manually load user (onAuthStateChange may not fire for email confirmation flows)
    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      setUser(mapToUser(data.user, profile));
    }
    setIsLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      setUser(mapToUser(session.user, profile));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
