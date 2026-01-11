'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { initAuthListener } from '@/lib/authListener';

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

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          dispatch({ type: 'SET_USER', payload: session.user });
          dispatch({ type: 'SET_SESSION', payload: session });
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Initialize auth state
    initializeAuth();
    
    // Initialize auth listener
    const cleanup = initAuthListener(dispatch);
    
    // Clean up on unmount
    return () => {
      cleanup();
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