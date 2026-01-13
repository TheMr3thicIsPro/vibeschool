'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { 
  getOrCreateGlobalHelpConversation, 
  getUserConversations, 
  getConversationMessages, 
  sendMessage,
  subscribeToMessages,
  createDirectMessageConversation,
  getUserByUsername,
  checkConversationMembership
} from '@/services/chat/chatService';
import { getConversationMembers } from '@/lib/chatService';
import { ensureProfile } from '@/lib/ensureProfile';
import { supabase } from '@/lib/supabase';
import { MessageCircle, Send, Users, Search, Plus, User, Hash } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import ToastNotification from '@/components/ui/ToastNotification';
import { dedupeAndSortMessages, replaceOptimisticMessage } from '@/utils/messageUtils';

const SocialPage = () => {
  const { state, dispatch } = useAuthStore();
  const { user } = state;
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [realtimeStatus, setRealtimeStatus] = useState<'idle'|'subscribed'|'error'|'closed'>('idle');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const lastCreatedAtRef = useRef<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const currentConversationIdRef = useRef<string | null>(null);

  const didRun = useRef(false)

  useEffect(() => {
    if (!user) return
    if (didRun.current) return
    didRun.current = true

    ;(async () => {
      try {
        // Check for valid session before trying to ensure profile
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
        const session = sessionData?.session

        if (!session?.access_token) {
          console.warn("No session yet, skipping profile ensure for now")
          loadConversations();
          return
        }
        
        const profile = await ensureProfile(supabase, user)
        console.log('SocialPage: Profile ensured, now loading conversations');
        loadConversations();
      } catch (e) {
        console.error("Failed to ensure profile", e)
        // Still try to load conversations even if profile creation fails
        loadConversations();
      }
    })()
  }, [user, supabase]);

  useEffect(() => {
    const activeConversationId = activeConversation?.id ?? null;
    console.log('SocialPage useEffect: Active conversation changed:', activeConversationId);
    
    if (!activeConversationId) return;
    
    // Prevent duplicate setup for same conversation id
    if (currentConversationIdRef.current === activeConversationId) return;
    
    // Update the current conversation id ref
    currentConversationIdRef.current = activeConversationId;
    
    // Load messages for the new conversation
    loadMessages();
  }, [activeConversation?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for user changes to reload conversations and messages
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user?.id]); // Only reload when user ID changes

  // Listen for auth state changes from other tabs
  useEffect(() => {
    const handleAuthStateChange = (event: any) => {
      const { type, email } = event.detail;
      
      if (type === 'AUTH_STATE_CHANGED' && email) {
        setToastMessage(`Account switched to user: ${email}`);
        setShowToast(true);
      } else if (type === 'SIGNED_OUT') {
        setToastMessage('Account signed out from another tab');
        setShowToast(true);
      }
    };

    window.addEventListener('authStateChangeFromOtherTab', handleAuthStateChange);

    return () => {
      window.removeEventListener('authStateChangeFromOtherTab', handleAuthStateChange);
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Cleanup realtime subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      // Cleanup polling
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  // State for session conflict warning
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // Effect to detect session conflicts when user changes
  useEffect(() => {
    if (user) {
      console.log('SocialPage: User changed, user ID:', user.id);
      // Show session warning in development mode
      if (process.env.NODE_ENV === 'development') {
        setShowSessionWarning(true);
        setTimeout(() => setShowSessionWarning(false), 5000); // Hide after 5 seconds
      }
    }
  }, [user?.id]);

  // Helper function to append messages safely with deduplication
  const appendMessagesSafely = useCallback((prevMessages: any[], newMessages: any[]) => {
    // Create a Set of existing message IDs to avoid duplicates
    const existingIds = new Set(prevMessages.map((msg: any) => msg.id));
    
    // Filter out messages that already exist
    const uniqueNewMessages = newMessages.filter((msg: any) => !existingIds.has(msg.id));
    
    if (uniqueNewMessages.length === 0) {
      return prevMessages; // No new messages to add
    }
    
    // Combine and sort by created_at
    const combinedMessages = [...prevMessages, ...uniqueNewMessages];
    return combinedMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, []);

  // Function to fetch latest messages
  const fetchLatestMessages = useCallback(async (conversationId: string) => {
    try {
      let query = supabase
        .from('messages')
        .select('id, conversation_id, sender_id, content, created_at, client_generated_id')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      // If we have a last seen timestamp, only get newer messages
      if (lastCreatedAtRef.current) {
        query = query.gt('created_at', lastCreatedAtRef.current);
      }

      const { data, error } = await query;

      if (error) {
        console.error('fetchLatestMessages: Error fetching messages:', error);
        return [];
      }

      if (data && data.length > 0) {
        // Update lastCreatedAtRef to the newest message
        const newestMessage = data[data.length - 1];
        lastCreatedAtRef.current = newestMessage.created_at;
      }

      return data || [];
    } catch (error) {
      console.error('fetchLatestMessages: Error in catch block:', error);
      return [];
    }
  }, []);

  // Polling effect
  useEffect(() => {
    if (!activeConversation?.id || !user) {
      // Clear polling if no active conversation or user
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    // Clear any existing polling interval
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }

    // Start polling every 3 seconds
    pollRef.current = setInterval(async () => {
      if (!activeConversation?.id) return;
      
      try {
        const newMessages = await fetchLatestMessages(activeConversation.id);
        
        if (newMessages.length > 0) {
          setMessages(prev => {
            const updatedMessages = appendMessagesSafely(prev, newMessages);
            return updatedMessages;
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Every 3 seconds

    // Cleanup on unmount or conversation change
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [activeConversation?.id, user?.id, fetchLatestMessages, appendMessagesSafely]);

  // Update the realtime subscription to use the same appendMessagesSafely function
  useEffect(() => {
    const activeConversationId = activeConversation?.id;
    console.log('SocialPage useEffect: Active conversation changed:', activeConversationId, 'User ID:', user?.id);
    
    if (!user || !activeConversationId) {
      console.log('SocialPage: Missing user or conversation, returning');
      return;
    }
    
    // Clean up any existing subscription
    if (unsubscribeRef.current) {
      console.log('SocialPage: Removing previous subscription for conversation:', activeConversationId);
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    console.log('SocialPage: Setting up new subscription for conversation:', activeConversationId);
    
    // Set status to idle initially
    setRealtimeStatus('idle');
    
    // Subscribe to messages
    const unsubscribe = subscribeToMessages(
      activeConversationId,
      (msg) => {
        console.log('SocialPage: Received message via realtime:', msg);
        
        setMessages(prev => {
          // Use the same deduplication logic as polling
          return appendMessagesSafely(prev, [msg]);
        });
      },
      (status, err) => {
        console.log('SocialPage: Channel status:', status, 'Error:', err);
        // Map the actual Supabase status to our UI status
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('subscribed');
          console.log('SocialPage: Realtime subscription ready');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setRealtimeStatus('error');
          console.log('SocialPage: Realtime subscription error, status:', status);
        } else if (status === 'CLOSED') {
          setRealtimeStatus('closed');
          console.log('SocialPage: Realtime subscription closed');
        }
        
        // Even if realtime has issues, polling will continue to work
        // We don't need to restart polling since it's independent
      }
    );
    
    unsubscribeRef.current = unsubscribe;

    // Cleanup function
    return () => {
      console.log('SocialPage: Cleaning up subscription for conversation:', activeConversationId);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.id, activeConversation?.id, appendMessagesSafely]); // Include appendMessagesSafely in dependencies

  const loadConversations = async () => {
    try {
      console.log('loadConversations: Starting to load conversations...');
      setLoading(true);
      
      // Get global help conversation
      console.log('loadConversations: Fetching global help conversation');
      let globalHelp;
      try {
        globalHelp = await getOrCreateGlobalHelpConversation();
        console.log('loadConversations: Got global help conversation:', globalHelp);
      } catch (err) {
        console.error('loadConversations: Error getting global help conversation:', err);
        // If global help fails, we'll continue with other conversations
        globalHelp = null;
      }
      
      // Get user's other conversations
      if (!user) {
        console.log('loadConversations: No user found, returning');
        return;
      }
      console.log('loadConversations: Fetching user conversations for user:', user.id);
      const userConvos = await getUserConversations(user.id);
      console.log('loadConversations: Got user conversations:', userConvos);
      
      // Combine and set conversations
      let allConversations = [];
      if (globalHelp) {
        allConversations = [globalHelp, ...userConvos];
        console.log('loadConversations: Setting conversations with global help:', allConversations);
      } else {
        allConversations = userConvos;
        console.log('loadConversations: Setting conversations without global help:', allConversations);
      }
      
      setConversations(allConversations);
      
      // Set global help as active by default if available, otherwise use first conversation
      if (globalHelp) {
        console.log('loadConversations: Setting active conversation to global help:', globalHelp);
        setActiveConversation(globalHelp);
      } else if (allConversations.length > 0) {
        console.log('loadConversations: Setting active conversation to first available:', allConversations[0]);
        setActiveConversation(allConversations[0]);
      } else {
        console.log('loadConversations: No conversations available');
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Define loadMessages function outside useEffect
  const loadMessages = async () => {
    if (!activeConversation?.id) {
      console.log('loadMessages: No active conversation, returning');
      setMessages([]);
      return;
    }
    
    console.log('loadMessages: Loading messages for conversation:', activeConversation.id);
    try {
      const messages = await getConversationMessages(activeConversation.id);
      console.log('loadMessages: Got messages:', messages.length, 'messages');
      
      setMessages(messages);
      
      // Update the ref to track the latest message timestamp
      if (messages.length > 0) {
        const latestMessage = messages[messages.length - 1];
        lastCreatedAtRef.current = latestMessage.created_at;
        console.log('loadMessages: Set lastCreatedAtRef to:', latestMessage.created_at);
      }
      
      // Load members for the conversation with proper username sync
      console.log('loadMessages: Loading members for conversation:', activeConversation.id);
      const membersResponse = await supabase
        .from('conversation_members')
        .select(`
          user_id,
          role,
          profiles:user_id (
            username,
            email,
            avatar_url
          )
        `)
        .eq('conversation_id', activeConversation.id)
        .returns<{
          user_id: string;
          role: string;
          profiles: {
            username: string;
            email: string;
            avatar_url: string;
          };
        }[]>();
      
      if (membersResponse.error) {
        console.error('loadMessages: Error loading members:', membersResponse.error);
      } else {
        console.log('loadMessages: Got members:', membersResponse.data.length, 'members');
        setMembers(membersResponse.data);
      }
    } catch (error) {
      console.error('loadMessages: Error loading messages:', error);
    }
  };

  // Load messages when active conversation changes
  useEffect(() => {
    loadMessages();
    
    // Set up periodic refresh of member data to ensure latest usernames are shown
    const memberRefreshInterval = setInterval(() => {
      refreshMembers();
    }, 30000); // Refresh every 30 seconds
    
    // Cleanup interval on unmount or conversation change
    return () => {
      clearInterval(memberRefreshInterval);
    };
  }, [activeConversation?.id]);







  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) {
      console.log('handleSendMessage: Message not sent, validation failed:', { hasMessage: !!newMessage.trim(), hasActiveConversation: !!activeConversation, hasUser: !!user });
      return;
    }

    // Create a client-generated ID for optimistic update reconciliation
    const clientGeneratedId = crypto.randomUUID();
    
    try {
      console.log('handleSendMessage: Attempting to send message:', { userId: user.id, conversationId: activeConversation.id, content: newMessage });
      
      // Create optimistic message
      const optimisticMessage = {
        id: 'optimistic-' + clientGeneratedId,
        conversation_id: activeConversation.id,
        sender_id: user.id,
        content: newMessage,
        created_at: new Date().toISOString(),
        client_generated_id: clientGeneratedId,
        pending: true
      };
      
      // Immediately add optimistic message to UI
      setMessages(prev => {
        console.log('handleSendMessage: Adding optimistic message to UI, previous count:', prev.length);
        const newMessages = [...prev, optimisticMessage];
        console.log('handleSendMessage: Optimistic message added, new count:', newMessages.length);
        return newMessages;
      });
      
      // Clear input immediately
      setNewMessage('');
      
      // Set loading state (only affects button, not message display)
      setMessageLoading(true);
      
      // Check if user is a member of the conversation
      const isMember = await checkConversationMembership(activeConversation.id, user.id);
      console.log('handleSendMessage: User membership check result:', isMember);
      
      if (!isMember) {
        console.log('handleSendMessage: User not a member, ensuring membership via global help API');
        // Ensure membership by calling the global help API again
        await getOrCreateGlobalHelpConversation();
      }
      
      // Send message to Supabase
      const dbMessage = await sendMessage(user.id, activeConversation.id, newMessage, clientGeneratedId);
      console.log('handleSendMessage: Message sent to Supabase, replacing optimistic message with server response:', dbMessage);
      
      // IMMEDIATELY update the UI to replace the optimistic message with the real one
      // This ensures the UI reflects the actual state regardless of real-time delivery
      setMessages(prev => {
        console.log('handleSendMessage: Replacing optimistic message in UI, previous count:', prev.length);
        const updatedMessages = prev.map(msg => {
          if (msg.client_generated_id === clientGeneratedId) {
            console.log('handleSendMessage: Found optimistic message to replace with server response');
            return { ...dbMessage, pending: false };
          }
          return msg;
        });
        console.log('handleSendMessage: Optimistic message replaced, new count:', updatedMessages.length);
        return updatedMessages;
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      
      // Remove the optimistic message when sending fails
      setMessages(prev => {
        console.log('handleSendMessage: Removing failed optimistic message, previous count:', prev.length);
        const filteredMessages = prev.filter(msg => 
          !(msg as any).pending || (msg as any).client_generated_id !== clientGeneratedId
        );
        console.log('handleSendMessage: Failed optimistic message removed, new count:', filteredMessages.length);
        return filteredMessages;
      });
      
      // Show error to user
      setErrorMessage('Message failed to send. Please try again.');
      setTimeout(() => setErrorMessage(null), 3000); // Clear error after 3 seconds
    } finally {
      setMessageLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  // Function to refresh member data to ensure latest usernames are shown
  const refreshMembers = async () => {
    if (!activeConversation?.id) return;
    
    try {
      console.log('refreshMembers: Refreshing member data for conversation:', activeConversation.id);
      const membersResponse = await supabase
        .from('conversation_members')
        .select(`
          user_id,
          role,
          profiles:user_id (
            username,
            email,
            avatar_url
          )
        `)
        .eq('conversation_id', activeConversation.id)
        .returns<{
          user_id: string;
          role: string;
          profiles: {
            username: string;
            email: string;
            avatar_url: string;
          };
        }[]>();
      
      if (membersResponse.error) {
        console.error('refreshMembers: Error refreshing members:', membersResponse.error);
      } else {
        console.log('refreshMembers: Refreshed members:', membersResponse.data.length, 'members');
        setMembers(membersResponse.data);
      }
    } catch (error) {
      console.error('refreshMembers: Unexpected error:', error);
    }
  };

  // Handle username changes broadcast from other tabs
  useEffect(() => {
    console.log('Setting up profile change listener');
    const profileChannel = new BroadcastChannel('profile_changes');
    
    const handleProfileChange = (event: MessageEvent) => {
      console.log('handleProfileChange: Received message from broadcast channel:', event.data);
      if (event.data.type === 'USERNAME_CHANGED' && event.data.userId) {
        console.log('handleProfileChange: Processing username change:', event.data);
        
        // Update the members state to reflect the new username
        setMembers(prevMembers => {
          console.log('handleProfileChange: Updating members with new username', {
            userId: event.data.userId,
            newUsername: event.data.newUsername,
            oldMembers: prevMembers
          });
          
          const updatedMembers = prevMembers.map(member => {
            if (member.user_id === event.data.userId) {
              console.log('handleProfileChange: Found matching member to update', {
                oldUsername: member.profiles?.username,
                newUsername: event.data.newUsername
              });
              
              return {
                ...member,
                profiles: {
                  ...member.profiles,
                  username: event.data.newUsername
                }
              };
            }
            return member;
          });
          
          console.log('handleProfileChange: Updated members result', updatedMembers);
          return updatedMembers;
        });
        
        // Force a re-render to update message display names
        // Since messages display name is calculated based on members, we need to trigger a refresh
        setMessages(prev => [...prev]); // This forces a re-render with new member data
        console.log('handleProfileChange: Forced message re-render');
      }
    };
    
    profileChannel.onmessage = handleProfileChange;
    
    // Cleanup
    return () => {
      console.log('Cleaning up profile change listener');
      profileChannel.close();
    };
  }, [members]); // Include members in the dependency array to ensure latest members data

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex items-center justify-center h-full">
            <div className="text-2xl font-bold text-accent-primary">Loading chat...</div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (!user) {
    // Redirect to login if no user
    return <ProtectedRoute><div>Redirecting...</div></ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <AppShell>
        {/* Session conflict warning banner */}
        {showSessionWarning && (
          <div className="fixed top-16 left-0 right-0 z-50 bg-yellow-900 border-b border-yellow-700 p-2 text-center">
            <p className="text-yellow-200 text-sm">
              Multiple accounts in same browser profile share one session. Use different profiles for isolation.
            </p>
          </div>
        )}
        

        
        <div className="flex h-full bg-background">
          {/* Left sidebar - Conversations list */}
          <div className="w-80 bg-card-bg border-r border-card-border flex flex-col">
            <div className="p-4 border-b border-card-border">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageCircle className="text-accent-primary" size={20} />
                Conversations
              </h2>
            </div>
            
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                />
              </div>
              
              <button className="w-full mt-3 flex items-center justify-center gap-2 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors">
                <Plus size={16} />
                New Conversation
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">Channels</h3>
                <div
                  className={`p-3 rounded-lg cursor-pointer mb-1 flex items-center gap-3 ${
                    activeConversation?.name === 'Global Help'
                      ? 'bg-accent-primary/10 border border-accent-primary'
                      : 'hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    const globalHelp = conversations.find(c => c.name === 'Global Help');
                    setActiveConversation(globalHelp);
                  }}
                >
                  <Hash className="text-accent-primary" size={18} />
                  <div>
                    <p className="font-medium text-white">Global Help</p>
                    <p className="text-xs text-gray-500">General help channel</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2 border-t border-gray-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">Direct Messages</h3>
                <div className="space-y-1">
                  {conversations
                    .filter(c => c.type === 'dm')
                    .map(conversation => (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded-lg cursor-pointer mb-1 flex items-center gap-3 ${
                          activeConversation?.id === conversation.id
                            ? 'bg-accent-primary/10 border border-accent-primary'
                            : 'hover:bg-gray-800'
                        }`}
                        onClick={() => setActiveConversation(conversation)}
                      >
                        <User className="text-gray-400" size={18} />
                        <div>
                          <p className="font-medium text-white">DM</p>
                          <p className="text-xs text-gray-500">Direct message</p>
                        </div>
                      </div>
                    ))}
                  
                  {/* New DM button */}
                  <button 
                    className="w-full p-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-gray-800"
                    onClick={async () => {
                      const username = prompt('Enter username to start a DM with:');
                      if (username && user) {
                        try {
                          const targetUser = await getUserByUsername(username);
                          // The targetUser will have id property from the updated query
                          if (targetUser && targetUser.id !== user.id) {
                            const dmConversation = await createDirectMessageConversation(user.id, targetUser.id);
                            setConversations(prev => [...prev, dmConversation]);
                            setActiveConversation(dmConversation);
                          } else {
                            alert('User not found or cannot message yourself');
                          }
                        } catch (err) {
                          console.error('Failed to create DM:', err);
                          alert('Failed to create DM: ' + (err as Error).message);
                        }
                      }
                    }}
                  >
                    <Plus className="text-gray-400" size={18} />
                    <div>
                      <p className="font-medium text-white">New DM</p>
                      <p className="text-xs text-gray-500">Start a new conversation</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main chat area with members sidebar */}
          <div className="flex-1 flex">
            <div className="flex-1 flex flex-col">
              {/* Chat header */}
              <div className="h-16 bg-card-bg border-b border-card-border flex items-center px-6">
                <div className="flex items-center gap-3">
                  {activeConversation?.name === 'Global Help' ? (
                    <Hash className="text-accent-primary" size={24} />
                  ) : (
                    <User className="text-gray-400" size={24} />
                  )}
                  <div>
                    <h3 className="font-bold text-white">
                      {activeConversation?.name || 'Global Help'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {activeConversation?.name === 'Global Help' 
                        ? 'General help and discussions' 
                        : 'Direct message'}
                    </p>
                  </div>
                </div>
                
                {/* Realtime status indicator */}
                <div className="ml-auto flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    realtimeStatus === 'subscribed' ? 'bg-green-500' : 
                    realtimeStatus === 'error' || realtimeStatus === 'closed' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-xs text-gray-400">
                    {realtimeStatus === 'subscribed' ? 'Connected' : 
                     realtimeStatus === 'error' || realtimeStatus === 'closed' ? 'Reconnecting...' : 'Connecting...'}
                  </span>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => {
                  const isMe = message.sender_id === user?.id;
                  const senderProfile = members.find(member => member.user_id === message.sender_id)?.profiles;
                  const displayName = isMe ? 'You' : senderProfile?.username || senderProfile?.email?.split('@')[0] || `User ${message.sender_id?.slice(0, 8)}`;
                  const displayAvatar = senderProfile?.avatar_url || (senderProfile?.username?.charAt(0).toUpperCase() || 'M');
                  
                  // Log message rendering
                  console.log('SocialPage: Rendering message', index, 'ID:', message.id, 'Content:', message.content, 'Sender:', message.sender_id, 'IsMe:', isMe);
                  
                  return (
                  <div key={message.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      {typeof displayAvatar === 'string' && displayAvatar.startsWith('http') ? (
                        <img src={displayAvatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-accent-primary font-bold">{displayAvatar}</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-white">{displayName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`mt-1 text-gray-300 bg-gray-800 p-3 rounded-lg max-w-3xl ${
                        message.pending ? 'opacity-60 italic' : ''
                      }`}>
                        {message.content}
                        {message.pending && <span className="ml-2 text-xs text-gray-400">Sending...</span>}
                      </div>
                    </div>
                  </div>
                  )})}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="p-4 border-t border-card-border">
                {errorMessage && (
                  <div className="mb-2 p-2 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
                    {errorMessage}
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message here..."
                      className="w-full min-h-12 max-h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent resize-none"
                      rows={1}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={messageLoading || !newMessage.trim()}
                    className={`self-end px-4 py-2 rounded-lg flex items-center gap-2 ${
                      messageLoading || !newMessage.trim()
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-accent-primary text-white hover:bg-accent-primary/90'
                    }`}
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
            
            {/* Members sidebar */}
            <div className="w-80 bg-card-bg border-l border-card-border flex flex-col">
              <div className="p-4 border-b border-card-border">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="text-accent-primary" size={20} />
                  Members ({members.length})
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {members.map((member) => {
                    const isCurrentUser = member.user_id === user?.id;
                    const displayUsername = isCurrentUser ? `${member.profiles?.username} (You)` : member.profiles?.username;
                    const displayAvatar = member.profiles?.avatar_url || (member.profiles?.username?.charAt(0).toUpperCase() || 'M');
                    
                    return (
                      <div key={member.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                          {typeof displayAvatar === 'string' && displayAvatar.startsWith('http') ? (
                            <img src={displayAvatar} alt={displayUsername} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-accent-primary font-bold">{displayAvatar}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{displayUsername}</p>
                          <p className="text-xs text-gray-500 truncate">{member.profiles?.email}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                          {member.role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Toast notification for multi-tab auth changes */}
        <ToastNotification 
          message={toastMessage}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
          onReload={handleReload}
        />
      </AppShell>
    </ProtectedRoute>
  );
};

export default SocialPage;