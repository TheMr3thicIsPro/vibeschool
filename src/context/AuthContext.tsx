'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, username: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if profile exists, create if it doesn't
        await checkOrCreateProfile(session.user);
      }
      
      setUser(session?.user || null);
      setLoading(false);

      // Listen for auth changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            // Check if profile exists, create if it doesn't
            await checkOrCreateProfile(session.user);
          }
          setUser(session?.user || null);
          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    getSession();
  }, []);

  // Check if user has a profile, create one if it doesn't exist
  const checkOrCreateProfile = async (user: User) => {
    try {
      // Check for valid session before trying to ensure profile
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session?.access_token) {
        console.warn("No session yet, skipping profile ensure for now")
        return
      }
      
      await import('@/lib/profileService').then(module => 
        module.ensureProfile()
      );
    } catch (error) {
      console.error('Error checking/creating profile:', error);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    console.log('AuthContext: signUp called with', { email, username });
    // First, check if username is already taken
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username);

    console.log('AuthContext: existing user check result:', existingUser);
    if (existingUser && existingUser.length > 0) {
      console.log('AuthContext: Username already taken');
      throw new Error('Username already taken');
    }

    console.log('AuthContext: Calling supabase.auth.signUp');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    console.log('AuthContext: signUp result:', { data, error });
    if (error) {
      console.error('AuthContext: signUp error:', error);
      throw error;
    }
    
    // Ensure profile exists after successful signup
    if (data.user) {
      console.log('AuthContext: Ensuring profile for user after signup');
      try {
        await import('@/lib/profileService').then(module => 
          module.ensureProfile()
        );
      } catch (profileError) {
        console.error('Error ensuring profile:', profileError);
        // Don't throw the error as the user is still signed up
      }
    }
    
    console.log('AuthContext: returning signup data:', data);
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // If sign in was successful, ensure profile exists
    if (data.user) {
      try {
        await import('@/lib/profileService').then(module => 
          module.ensureProfile()
        );
      } catch (profileError) {
        console.error('Error ensuring profile:', profileError);
        // Don't throw the error as the user is still signed in
      }
    }
    
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    if (error) throw error;
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}