'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { initAuthListener } from '@/lib/authListener';
import { ensureProfile } from '@/lib/ensureProfile';

interface UserState {
  user: any | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_USER'; payload: any }
  | { type: 'SET_SESSION'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: UserState = {
  user: null,
  session: null,
  loading: true,
  error: null,
};

const AuthContext = createContext<{
  state: UserState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => {},
});

const authReducer = (state: UserState, action: Action): UserState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
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

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Initializing auth state');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('AuthProvider: Session found, setting user and session');
          
          // Fetch user profile to get role and plan
          const userId = session.user.id;
          console.log('DEBUG: INITIALIZE_AUTH - Attempting to fetch profile for user:', userId);
          
          try {
            console.log('AuthProvider: About to ensure profile for user:', userId);
            const profile = await ensureProfile(supabase, session.user);
            
            console.log('AuthProvider: Profile ensured result:', { profile });
            
            // Add role and plan to the user object
            const userWithProfile = {
              ...session.user,
              role: profile?.role,
              plan: profile?.plan,
              username: profile?.username
            };
            
            console.log('DEBUG: INITIALIZE_AUTH - Account role and plan:', {
              userId: userId,
              role: profile?.role,
              plan: profile?.plan,
              username: profile?.username
            });
            
            dispatch({ type: 'SET_USER', payload: userWithProfile });
          } catch (profileError) {
            console.error('AuthProvider: Error in profile fetch:', profileError);
            // Still dispatch the user but without role/plan info
            dispatch({ type: 'SET_USER', payload: session.user });
          }
          
          dispatch({ type: 'SET_SESSION', payload: session });
        } else {
          console.log('AuthProvider: No session found');
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('AuthProvider: Error initializing auth:', error);
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Initialize broadcast listener for cross-tab communication
    broadcastListenerRef.current = initAuthListener(dispatch);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state change event:', event, 'User ID:', session?.user?.id);
      
      try {
        switch (event) {
          case 'INITIAL_SESSION':
            console.log('AuthProvider: Handling INITIAL_SESSION event');
            if (session) {
              // Fetch user profile to get role and plan
              const userId = session.user.id;
              console.log('DEBUG: INITIAL_SESSION - Attempting to fetch profile for user:', userId);
              
              try {
                console.log('AuthProvider: About to ensure profile for user:', userId);
                const profile = await ensureProfile(supabase, session.user);
                
                console.log('AuthProvider: Profile ensured result:', { profile });
                
                // Add role and plan to the user object
                const userWithProfile = {
                  ...session.user,
                  role: profile?.role,
                  plan: profile?.plan,
                  username: profile?.username
                };
                
                console.log('DEBUG: INITIAL_SESSION - Account role and plan:', {
                  userId: userId,
                  role: profile?.role,
                  plan: profile?.plan,
                  username: profile?.username
                });
                
                dispatch({ type: 'SET_USER', payload: userWithProfile });
              } catch (profileError) {
                console.error('AuthProvider: Error in profile fetch:', profileError);
                // Still dispatch the user but without role/plan info
                dispatch({ type: 'SET_USER', payload: session.user });
              }
              
              dispatch({ type: 'SET_SESSION', payload: session });
              dispatch({ type: 'SET_LOADING', payload: false });
            }
            break;
            
          case 'SIGNED_IN':
            console.log('AuthProvider: Handling SIGNED_IN event for user:', session?.user?.id);
            if (session?.user) {
              // Check if user ID changed to trigger resubscribe
              if (state.user?.id !== session.user.id) {
                console.log('AuthProvider: User ID changed, updating state');
              }
              
              // Fetch user profile to get role and plan
              const userId = session.user.id;
              console.log('DEBUG: SIGNED_IN - Attempting to fetch profile for user:', userId);
              
              try {
                console.log('AuthProvider: About to ensure profile for user:', userId);
                const profile = await ensureProfile(supabase, session.user);
                
                console.log('AuthProvider: Profile ensured result:', { profile });
                
                // Add role and plan to the user object
                const userWithProfile = {
                  ...session.user,
                  role: profile?.role,
                  plan: profile?.plan,
                  username: profile?.username
                };
                
                console.log('DEBUG: SIGNED_IN - Account role and plan:', {
                  userId: userId,
                  role: profile?.role,
                  plan: profile?.plan,
                  username: profile?.username
                });
                
                dispatch({ type: 'SET_USER', payload: userWithProfile });
              } catch (profileError) {
                console.error('AuthProvider: Error in profile fetch:', profileError);
                // Still dispatch the user but without role/plan info
                dispatch({ type: 'SET_USER', payload: session.user });
              }
              
              dispatch({ type: 'SET_SESSION', payload: session });
              dispatch({ type: 'SET_LOADING', payload: false });
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('AuthProvider: Handling SIGNED_OUT event');
            dispatch({ type: 'RESET' });
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
              // Fetch user profile to get role and plan
              const userId = session.user.id;
              console.log('DEBUG: USER_UPDATED - Attempting to fetch profile for user:', userId);
              
              try {
                console.log('AuthProvider: About to ensure profile for user:', userId);
                const profile = await ensureProfile(supabase, session.user);
                
                console.log('AuthProvider: Profile ensured result:', { profile });
                
                // Add role and plan to the user object
                const userWithProfile = {
                  ...session.user,
                  role: profile?.role,
                  plan: profile?.plan,
                  username: profile?.username
                };
                
                console.log('DEBUG: USER_UPDATED - Account role and plan:', {
                  userId: userId,
                  role: profile?.role,
                  plan: profile?.plan,
                  username: profile?.username
                });
                
                dispatch({ type: 'SET_USER', payload: userWithProfile });
              } catch (profileError) {
                console.error('AuthProvider: Error in profile fetch:', profileError);
                // Still dispatch the user but without role/plan info
                dispatch({ type: 'SET_USER', payload: session.user });
              }
            }
            break;
            
          default:
            console.log('AuthProvider: Unhandled auth event:', event);
        }
      } catch (error) {
        console.error('AuthProvider: Error in auth state change handler:', error);
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
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
  if (!context) {
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