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
      authChannel.close();
      authListenerInstance = null;
    }
  };

  return authListenerInstance.unsubscribe;
};