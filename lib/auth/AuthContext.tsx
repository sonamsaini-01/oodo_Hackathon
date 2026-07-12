
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { UserRole } from '@/lib/permissions/permissions';

interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  employee_code?: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  department_id?: string;
  job_title?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, organizationCode: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, organizationCode: string) => {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return { error: signUpError };
    }

    if (authData.user) {
      // Get organization id by code
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('code', organizationCode)
        .single();

      if (orgData) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            organization_id: orgData.id,
            full_name: fullName,
            email,
            role: 'employee',
          });

        if (profileError) {
          return { error: profileError };
        }
      } else {
        return { error: new Error('Invalid organization code') };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const refreshSession = async () => {
    await supabase.auth.refreshSession();
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      }

      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      });

      setIsLoading(false);

      return () => {
        listener.subscription.unsubscribe();
      };
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

