'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { initAuthListener } from '@/lib/authListener';
import { ensureProfile } from '@/lib/ensureProfile';

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms))
  ]) as Promise<T>;
}

interface UserState {
  user: any | null;
  session: any | null;
  authLoading: boolean;
  profileLoading: boolean;
  error: string | null;
  profile: any | null;
}

type Action =
  | { type: 'SET_USER'; payload: any }
  | { type: 'SET_SESSION'; payload: any }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_PROFILE_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROFILE'; payload: any | null }
  | { type: 'RESET' };

const initialState: UserState = {
  user: null,
  session: null,
  authLoading: true,
  profileLoading: false,
  error: null,
  profile: null,
};

const AuthContext = createContext<{ state: UserState; dispatch: React.Dispatch<Action>; } | null>(null);

const authReducer = (state: UserState, action: Action): UserState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.payload };
    case 'SET_PROFILE_LOADING':
      return { ...state, profileLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const authSubscriptionRef = useRef<any>(null);
  const broadcastListenerRef = useRef<(() => void) | null>(null);
  const handlingAuthEventRef = useRef(false); // Prevent duplicate auth event handling

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AUTH INIT start');
      try {
        console.log('AuthProvider: Initializing auth state');
        
        // Call supabase.auth.getSession() with timeout 10s
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          10000,
          'getSession'
        );
        
        // Set user/session from result
        if (session) {
          console.log('AuthProvider: Session found, setting user and session');
          dispatch({ type: 'SET_USER', payload: session.user });
          dispatch({ type: 'SET_SESSION', payload: session });
          
          // Kick off profile load in background (do not block authLoading)
          console.log('AuthProvider: Kicking off profile load in background');
          void loadProfile(session.user);
        } else {
          console.log('AuthProvider: No session found');
        }
        
        // Set authLoading=false ALWAYS in finally
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      } catch (error) {
        console.error('AuthProvider: Error initializing auth:', error);
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      }
    };
    
    // Load profile function that runs in background
    const loadProfile = async (user: any) => {
      if (!user?.id) return;
      
      dispatch({ type: 'SET_PROFILE_LOADING', payload: true });
      try {
        console.log('loadProfile start for user:', user.id);
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout: ensureProfile')), 10000);
        });
        
        // Race the ensureProfile call against the timeout
        const profile = await Promise.race([
          ensureProfile(supabase, user),
          timeoutPromise
        ]);
        
        dispatch({ type: 'SET_PROFILE', payload: profile });
        
        // Update user with profile info
        const userWithProfile = {
          ...user,
          role: profile?.role,
          plan: profile?.plan,
          username: profile?.username
        };
        
        dispatch({ type: 'SET_USER', payload: userWithProfile });
        
        console.log('loadProfile end for user:', user.id);
      } catch (error) {
        console.error('loadProfile error:', error);
        // Still update user even if profile failed
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      } finally {
        dispatch({ type: 'SET_PROFILE_LOADING', payload: false });
      }
    };

    // Initialize broadcast listener for cross-tab communication
    broadcastListenerRef.current = initAuthListener(dispatch);

    // Listen for auth state changes
    const handledEventRef = useRef<{type: string, userId?: string, ts: number} | null>(null);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('onAuthStateChange event type:', event, 'User ID:', session?.user?.id);
      
      // Guard duplicate events using a ref
      const currentUserId = session?.user?.id;
      const now = Date.now();
      
      // ignore duplicate SIGNED_IN fired within 500ms for same userId
      if (handledEventRef.current && 
          handledEventRef.current.type === event && 
          handledEventRef.current.userId === currentUserId && 
          (now - handledEventRef.current.ts) < 500) {
        console.log('AuthProvider: Duplicate event detected, skipping');
        return;
      }
      
      // Prevent duplicate event handling
      if (handlingAuthEventRef.current) {
        console.log('AuthProvider: Auth event already being handled, skipping duplicate');
        return;
      }
      
      handlingAuthEventRef.current = true;
      handledEventRef.current = { type: event, userId: currentUserId, ts: now };
      
      try {
        switch (event) {
          case 'INITIAL_SESSION':
            console.log('AuthProvider: Handling INITIAL_SESSION event');
            if (session) {
              dispatch({ type: 'SET_USER', payload: session.user });
              dispatch({ type: 'SET_SESSION', payload: session });
              
              // Kick off profile load in background
              console.log('AuthProvider: Kicking off profile load in background for INITIAL_SESSION');
              void loadProfile(session.user);
              
              dispatch({ type: 'SET_AUTH_LOADING', payload: false });
            }
            break;
            
          case 'SIGNED_IN':
            console.log('AuthProvider: Handling SIGNED_IN event for user:', session?.user?.id);
            if (session?.user) {
              dispatch({ type: 'SET_USER', payload: session.user });
              dispatch({ type: 'SET_SESSION', payload: session });
              
              // Kick off profile load in background
              console.log('AuthProvider: Kicking off profile load in background for SIGNED_IN');
              void loadProfile(session.user);
              
              dispatch({ type: 'SET_AUTH_LOADING', payload: false });
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('AuthProvider: Handling SIGNED_OUT event');
            dispatch({ type: 'RESET' });
            dispatch({ type: 'SET_AUTH_LOADING', payload: false });
            // Reset the handling flag
            handlingAuthEventRef.current = false;
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('AuthProvider: Handling TOKEN_REFRESHED event');
            if (session) {
              dispatch({ type: 'SET_SESSION', payload: session });
            }
            break;
            
          case 'USER_UPDATED':
            console.log('AuthProvider: Handling USER_UPDATED event');
            if (session?.user) {
              dispatch({ type: 'SET_USER', payload: session.user });
              
              // Kick off profile load in background
              console.log('AuthProvider: Kicking off profile load in background for USER_UPDATED');
              void loadProfile(session.user);
            }
            break;
            
          default:
            console.log('AuthProvider: Unhandled auth event:', event);
        }
      } catch (error) {
        console.error('AuthProvider: Error in auth state change handler:', error);
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      } finally {
        // Always reset the handling flag
        handlingAuthEventRef.current = false;
      }
    });

    authSubscriptionRef.current = subscription;

    // Initialize auth state
    initializeAuth();

    // Clean up on unmount
    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe?.();
        authSubscriptionRef.current = null;
      }
      
      // Clean up broadcast listener
      if (broadcastListenerRef.current) {
        broadcastListenerRef.current();
        broadcastListenerRef.current = null;
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStore = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuthStore must be used within an AuthProvider');
  }
  return context;
};

// Export helper functions for direct access to state
export const useAuthState = () => {
  const { state } = useAuthStore();
  return state;
};

export const useAuthDispatch = () => {
  const { dispatch } = useAuthStore();
  return dispatch;
};