import { supabase } from './supabase';

let authListenerInstance: { unsubscribe: () => void } | null = null;

const authChannel = new BroadcastChannel('auth');

interface AuthBroadcastMessage {
  type: 'AUTH_STATE_CHANGED' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | 'SIGNED_OUT' | 'INITIAL_SESSION';
  userId?: string | null;
  email?: string | null;
}

export const initAuthListener = (dispatch: React.Dispatch<any>) => {
  // If already initialized, return the existing cleanup function
  if (authListenerInstance) {
    console.log('Auth listener already initialized, returning existing instance');
    return authListenerInstance.unsubscribe;
  }

  console.log('Initializing auth listener');
  
  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state change event:', event, session);
    
    try {
      switch (event) {
        case 'SIGNED_IN':
          if (session?.user) {
            console.log('User signed in:', session.user.id);
            dispatch({ type: 'SET_USER', payload: session.user });
            dispatch({ type: 'SET_SESSION', payload: session });
            dispatch({ type: 'SET_LOADING', payload: false });
            
            // Broadcast to other tabs
            const message: AuthBroadcastMessage = {
              type: 'AUTH_STATE_CHANGED',
              userId: session.user.id,
              email: session.user.email
            };
            authChannel.postMessage(message);
          }
          break;
          
        case 'SIGNED_OUT':
          console.log('User signed out');
          dispatch({ type: 'RESET' });
          
          // Broadcast to other tabs
          const message: AuthBroadcastMessage = {
            type: 'SIGNED_OUT'
          };
          authChannel.postMessage(message);
          break;
          
        case 'TOKEN_REFRESHED':
          if (session) {
            console.log('Token refreshed for user:', session.user?.id);
            dispatch({ type: 'SET_SESSION', payload: session });
            
            // Broadcast to other tabs
            const message: AuthBroadcastMessage = {
              type: 'TOKEN_REFRESHED',
              userId: session.user?.id
            };
            authChannel.postMessage(message);
          }
          break;
          
        case 'USER_UPDATED':
          if (session?.user) {
            console.log('User updated:', session.user.id);
            dispatch({ type: 'SET_USER', payload: session.user });
            
            // Broadcast to other tabs
            const message: AuthBroadcastMessage = {
              type: 'USER_UPDATED',
              userId: session.user.id,
              email: session.user.email
            };
            authChannel.postMessage(message);
          }
          break;
          
        case 'INITIAL_SESSION':
          if (session) {
            console.log('Initial session set:', session.user?.id);
            dispatch({ type: 'SET_USER', payload: session.user });
            dispatch({ type: 'SET_SESSION', payload: session });
            dispatch({ type: 'SET_LOADING', payload: false });
            
            // Broadcast to other tabs if needed
            if (session.user) {
              const message: AuthBroadcastMessage = {
                type: 'AUTH_STATE_CHANGED',
                userId: session.user.id,
                email: session.user.email
              };
              authChannel.postMessage(message);
            }
          }
          break;
          
        default:
          console.log('Unhandled auth event:', event);
      }
    } catch (error) {
      console.error('Error in auth state change handler:', error);
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  });

  // Listen for messages from other tabs
  authChannel.onmessage = (event) => {
    const message: AuthBroadcastMessage = event.data;
    console.log('Received auth message from other tab:', message);
    
    if (message.type === 'SIGNED_OUT') {
      console.log('Other tab signed out, resetting local state');
      dispatch({ type: 'RESET' });
      
      // Show notification to user
      if (typeof window !== 'undefined') {
        // Create a custom event to notify the UI
        window.dispatchEvent(new CustomEvent('authStateChangeFromOtherTab', {
          detail: { type: 'SIGNED_OUT' }
        }));
      }
    } else if (message.type === 'AUTH_STATE_CHANGED') {
      console.log('Other tab changed auth state, updating local state');
      
      // Show notification to user
      if (message.email) {
        if (typeof window !== 'undefined') {
          // Create a custom event to notify the UI
          window.dispatchEvent(new CustomEvent('authStateChangeFromOtherTab', {
            detail: { 
              type: 'AUTH_STATE_CHANGED',
              email: message.email
            }
          }));
        }
      }
    }
  };

  // Store the instance to prevent duplicate registration
  authListenerInstance = {
    unsubscribe: () => {
      console.log('Cleaning up auth listener');
      subscription?.unsubscribe();
      authChannel.close();
      authListenerInstance = null;
    }
  };

  return authListenerInstance.unsubscribe;
};