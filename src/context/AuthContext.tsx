'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
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
  authStatus: 'online' | 'offline' | 'checking';
  offlineRetryCount: number;
}

type Action =
  | { type: 'SET_USER'; payload: any }
  | { type: 'SET_SESSION'; payload: any }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_PROFILE_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROFILE'; payload: any | null }
  | { type: 'SET_AUTH_STATUS'; payload: 'online' | 'offline' | 'checking' }
  | { type: 'INCREMENT_OFFLINE_RETRY' }
  | { type: 'RESET_OFFLINE_RETRY' }
  | { type: 'RESET' };

const initialState: UserState = {
  user: null,
  session: null,
  authLoading: true,
  profileLoading: false,
  error: null,
  profile: null,
  authStatus: 'checking',
  offlineRetryCount: 0,
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
    case 'SET_AUTH_STATUS':
      return { ...state, authStatus: action.payload };
    case 'INCREMENT_OFFLINE_RETRY':
      return { ...state, offlineRetryCount: state.offlineRetryCount + 1 };
    case 'RESET_OFFLINE_RETRY':
      return { ...state, offlineRetryCount: 0 };
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
  const handledEventRef = useRef<{type: string, userId?: string, ts: number} | null>(null); // Moved to top level
  
  // Offline retry management with refs
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initInFlightRef = useRef(false);

  // Initialize auth state on mount
  useEffect(() => {
    let retryTimeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;
    
    const initializeAuth = async (isRetry = false) => {
      // Prevent concurrent initialization
      if (initInFlightRef.current) {
        console.log('[AUTH] init already in flight, skipping');
        return;
      }
      
      if (!isMounted) return;
      
      initInFlightRef.current = true;
      
      console.log('[AUTH] init start', { 
        isRetry, 
        retryCount: retryCountRef.current,
        timestamp: new Date().toISOString()
      });
      
      try {
        // Check reachability FIRST before creating any client
        console.log('[AUTH] supabase url:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        const { testSupabaseReachability } = await import('@/lib/supabase');
        const reachability = await testSupabaseReachability(process.env.NEXT_PUBLIC_SUPABASE_URL!, 3000);
        
        console.log('[AUTH] reachability result', reachability);
        
        if (!reachability.ok) {
          // Mark as offline BEFORE any client creation
          dispatch({ type: 'SET_AUTH_STATUS', payload: 'offline' });
          dispatch({ type: 'SET_ERROR', payload: `Auth offline: ${reachability.error || 'Cannot reach Supabase'}` });
          dispatch({ type: 'SET_AUTH_LOADING', payload: false });
          
          // Schedule retry with exponential backoff (max 5 retries)
          if (retryCountRef.current < 5) {
            retryCountRef.current += 1;
            const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 10000); // Max 10s
            console.log('[AUTH] offline retry scheduled', { 
              attempt: retryCountRef.current, 
              delay,
              nextRetry: new Date(Date.now() + delay).toISOString()
            });
            
            // Clear existing timer first
            if (retryTimerRef.current) {
              clearTimeout(retryTimerRef.current);
            }
            
            retryTimerRef.current = setTimeout(() => {
              if (isMounted) {
                initInFlightRef.current = false; // Reset before retry
                initializeAuth(true);
              }
            }, delay);
          } else {
            console.log('[AUTH] max retry attempts reached, staying offline permanently');
            dispatch({ type: 'SET_ERROR', payload: 'Auth permanently offline: Maximum retry attempts exceeded' });
          }
          
          initInFlightRef.current = false;
          return;
        }
        
        // Online - proceed with auth
        dispatch({ type: 'SET_AUTH_STATUS', payload: 'online' });
        retryCountRef.current = 0; // Reset retry count on successful connection
        
        console.log('[AUTH] getSession start');
        
        // Get client only when online
        const supabase = getSupabaseClient();
        
        // Call supabase.auth.getSession() with timeout 5s
        const sessionResponse: any = await withTimeout(
          supabase.auth.getSession(),
          5000,
          'getSession'
        );
        const { data: { session }, error } = sessionResponse;
        
        if (error) {
          console.error('[AUTH] getSession error', {
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n')[0]
          });
          dispatch({ type: 'SET_ERROR', payload: `Auth error: ${error.message}` });
          dispatch({ type: 'SET_AUTH_LOADING', payload: false });
          return;
        }
        
        console.log('[AUTH] getSession success', { userId: session?.user?.id });
        
        // Set user/session from result
        if (session) {
          dispatch({ type: 'SET_USER', payload: session.user });
          dispatch({ type: 'SET_SESSION', payload: session });
          
          // Kick off profile load in background (do not block authLoading)
          console.log('[AUTH] kicking off profile load');
          void loadProfile(session.user);
        } else {
          console.log('[AUTH] no session found');
        }
        
        // Set authLoading=false ALWAYS
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
        
      } catch (error: any) {
        console.error('[AUTH] init failed', {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n')[0]
        });
        
        // Check for network/DNS errors specifically
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          dispatch({ type: 'SET_AUTH_STATUS', payload: 'offline' });
          dispatch({ type: 'SET_ERROR', payload: 'Network error: Cannot connect to authentication service. Check your internet connection and Supabase configuration.' });
        } else {
          dispatch({ type: 'SET_ERROR', payload: `Auth initialization failed: ${error.message}` });
        }
        
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      } finally {
        // Always reset the init flag
        initInFlightRef.current = false;
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
        
        // Get client for profile loading
        const supabase = getSupabaseClient();
        
        // Race the ensureProfile call against the timeout
        const profile = await Promise.race([
          ensureProfile(supabase, user),
          timeoutPromise
        ]);
        
        // Check if trial has expired for free users
        const isTrialExpired = profile?.plan === 'free' && 
                               profile?.trial_expires_at && 
                               new Date(profile.trial_expires_at) < new Date();
        
        // Update profile with trial status
        const updatedProfile = {
          ...profile,
          isTrialExpired,
          account_locked: profile?.account_locked || isTrialExpired
        };
        
        dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
        
        // Update user with profile info
        const userWithProfile = {
          ...user,
          role: updatedProfile?.role,
          plan: updatedProfile?.plan,
          username: updatedProfile?.username,
          isTrialExpired: updatedProfile?.isTrialExpired,
          account_locked: updatedProfile?.account_locked
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
    const supabase = getSupabaseClient();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (!isMounted) return;
      
      console.log('[AUTH] listener event', { 
        type: event, 
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
      
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
      isMounted = false;
      initInFlightRef.current = false;
      
      // Clear any pending retry timeouts
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
        console.log('[AUTH] cleanup: cleared retry timer');
      }
      
      console.log('[AUTH] cleaning up auth subscription');
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe?.();
        authSubscriptionRef.current = null;
      }
      
      // Clean up broadcast listener
      if (broadcastListenerRef.current) {
        broadcastListenerRef.current();
        broadcastListenerRef.current = null;
      }
      
      // Reset retry count on unmount
      retryCountRef.current = 0;
      console.log('[AUTH] cleanup: reset retry count');
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