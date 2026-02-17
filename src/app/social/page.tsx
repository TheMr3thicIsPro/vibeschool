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
import { MessageCircle, Send, Users, Search, Plus, User, Hash, UserPlus, UserMinus, UserCheck, UserX, UserSearch, MoreVertical, Image as ImageIcon, File as FileIcon, Mic, Paperclip } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import ToastNotification from '@/components/ui/ToastNotification';
import { dedupeAndSortMessages, replaceOptimisticMessage } from '@/utils/messageUtils';
import { getCommunityDB } from '@/community/db';
import { Friend, FriendRequest, Profile } from '@/community/db';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [realtimeStatus, setRealtimeStatus] = useState<'idle'|'subscribed'|'error'|'closed'>('idle');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const lastCreatedAtRef = useRef<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const currentConversationIdRef = useRef<string | null>(null);
  
  // Community features
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [communityDb, setCommunityDb] = useState<any>(null);
  const [showFriendsPanel, setShowFriendsPanel] = useState(false); // Toggle for friends panel
  const [activeCommunityTab, setActiveCommunityTab] = useState<'chat' | 'discover' | 'friends' | 'requests'>('chat'); // Community tab state
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  // Typing indicators
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      // Cleanup typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, []);

  // Handle typing indicators
  useEffect(() => {
    if (!communityDb || !activeConversation || !user) return;
    
    const handleTyping = () => {
      if (!communityDb || !activeConversation || !user) return;
      
      // Send typing indicator
      communityDb.setTypingStatus(activeConversation.id, user.id, true);
      
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set a new timeout to stop typing indicator after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        communityDb.setTypingStatus(activeConversation.id, user.id, false);
      }, 2000);
    };
    
    // Monitor typing in the message input
    const textarea = document.querySelector('textarea[placeholder="Type your message here..."]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.addEventListener('input', handleTyping);
      
      return () => {
        textarea.removeEventListener('input', handleTyping);
        // Cleanup typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        // Make sure to stop typing indicator when leaving
        if (communityDb && activeConversation && user) {
          communityDb.setTypingStatus(activeConversation.id, user.id, false);
        }
      };
    }
  }, [communityDb, activeConversation, user]);

  // Monitor typing indicators from other users
  useEffect(() => {
    if (!communityDb || !activeConversation || !user) return;
    
    const monitorTyping = async () => {
      try {
        const typingUsersList = await communityDb.getTypingUsers(activeConversation.id);
        
        // Update typing users state
        const newTypingUsers: Record<string, boolean> = {};
        typingUsersList.forEach((userId: string) => {
          newTypingUsers[userId] = true;
        });
        setTypingUsers(newTypingUsers);
      } catch (error) {
        console.error('Error getting typing users:', error);
      }
    };
    
    // Update every 2 seconds
    const typingInterval = setInterval(monitorTyping, 2000);
    
    // Initial load
    monitorTyping();
    
    return () => {
      clearInterval(typingInterval);
    };
  }, [communityDb, activeConversation, user]);

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
      
      // Initialize community features
      const communityDb = await getCommunityDB();
      setCommunityDb(communityDb);
      
      // Load friends and friend requests
      if (communityDb) {
        const userFriends = await communityDb.getFriends(user.id);
        setFriends(userFriends);
        
        const userFriendRequests = await communityDb.getFriendRequests(user.id);
        // Filter to show only pending requests
        const pendingRequests = userFriendRequests.filter((req: any) => req.status === 'pending');
        setFriendRequests(pendingRequests);
        
        // Load profiles for friends
        const friendProfiles: Record<string, Profile> = {};
        for (const friend of userFriends) {
          const friendId = friend.friend_id;
          const profile = await communityDb.getProfile(friendId);
          if (profile) {
            friendProfiles[friendId] = profile;
          }
        }
        
        // Also load profiles for friend request users
        for (const request of pendingRequests) {
          const otherUserId = request.sender_id === user?.id ? request.receiver_id : request.sender_id;
          const profile = await communityDb.getProfile(otherUserId);
          if (profile && !friendProfiles[otherUserId]) {
            friendProfiles[otherUserId] = profile;
          }
        }
        
        setProfiles(friendProfiles);
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
      const membersResponse: any = await supabase
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
        .eq('conversation_id', activeConversation.id);
      
      if (membersResponse.error) {
        console.error('loadMessages: Error loading members:', membersResponse.error);
      } else {
        console.log('loadMessages: Got members:', membersResponse.data.length, 'members', membersResponse.data);
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
    if ((!newMessage.trim() && !attachment) || !activeConversation || !user) {
      console.log('handleSendMessage: Message not sent, validation failed:', { hasMessage: !!newMessage.trim(), hasAttachment: !!attachment, hasActiveConversation: !!activeConversation, hasUser: !!user });
      return;
    }

    try {
      // Stop typing indicator
      if (communityDb && activeConversation && user) {
        communityDb.setTypingStatus(activeConversation.id, user.id, false);
      }
      
      // Handle attachment if present
      if (attachment) {
        // Upload file to the attachment API
        const formData = new FormData();
        formData.append('file', attachment);
        formData.append('conversationId', activeConversation.id);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const result = await response.json();
        
        // Send a message with the attachment URL
        if (communityDb) {
          await communityDb.createMessage({
            conversation_id: activeConversation.id,
            sender_id: user.id,
            body: newMessage || `Shared a file: ${attachment.name}`,
            attachment_url: result.url,
            attachment_type: attachment.type,
          });
        }
        
        // Reset attachment
        setAttachment(null);
        
        // Clear file input
        const fileInput = document.getElementById('attachment-input') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        // Create a client-generated ID for optimistic update reconciliation
        const clientGeneratedId = crypto.randomUUID();
        
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
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      
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
        .eq('conversation_id', activeConversation.id);
      
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
        
        // Update messages to reflect the new username
        setMessages(prevMessages => {
          return prevMessages.map(message => {
            if (message.sender_id === event.data.userId) {
              console.log('handleProfileChange: Updating message username', {
                oldUsername: message.username,
                newUsername: event.data.newUsername
              });
              return {
                ...message,
                username: event.data.newUsername
              };
            }
            return message;
          });
        });
        
        console.log('handleProfileChange: Updated both members and messages');
      }
    };
    
    profileChannel.onmessage = handleProfileChange;
    
    // Cleanup
    return () => {
      console.log('Cleaning up profile change listener');
      profileChannel.close();
    };
  }, [members]); // Include members in the dependency array to ensure latest members data
  
  // Subscribe to profile updates in real-time
  useEffect(() => {
    console.log('Setting up real-time profile updates subscription');
    
    const profileUpdatesChannel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload: any) => {
          console.log('Real-time profile update received:', payload);
          
          // Update the members state to reflect the new username
          setMembers(prevMembers => {
            return prevMembers.map(member => {
              if (member.user_id === payload.new.id) {
                console.log('Updating member profile with new data:', {
                  oldUsername: member.profiles?.username,
                  newUsername: payload.new.username
                });
                
                return {
                  ...member,
                  profiles: {
                    ...member.profiles,
                    username: payload.new.username,
                    avatar_url: payload.new.avatar_url
                  }
                };
              }
              return member;
            });
          });
          
          // Update messages to reflect the new username
          setMessages(prevMessages => {
            return prevMessages.map(message => {
              if (message.sender_id === payload.new.id) {
                console.log('Updating message username from real-time profile update', {
                  oldUsername: message.username,
                  newUsername: payload.new.username
                });
                return {
                  ...message,
                  username: payload.new.username,
                  avatar_url: payload.new.avatar_url
                };
              }
              return message;
            });
          });
        }
      )
      .subscribe();
    
    // Cleanup
    return () => {
      console.log('Cleaning up real-time profile updates subscription');
      supabase.removeChannel(profileUpdatesChannel);
    };
  }, []); // Empty dependency array since this subscription should only be set up once

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
              
              <button className="w-full mt-3 flex items-center justify-center gap-2 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors hover-lift border border-accent-primary">
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
                    className="w-full p-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-gray-800 hover-lift"
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

          {/* Main chat area with friends panel and members sidebar */}
          <div className="flex-1 flex">
            {/* Friends Panel - Collapsible */}
            {showFriendsPanel && (
              <div className="w-80 bg-card-bg border-r border-card-border flex flex-col">
                <div className="p-4 border-b border-card-border flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="text-accent-primary" size={20} />
                    Community
                  </h2>
                  <button 
                    onClick={() => setShowFriendsPanel(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <UserX size={20} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-6">
                    {/* Friends Section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-md font-semibold text-white flex items-center gap-2">
                          <UserCheck className="text-accent-primary" size={16} />
                          Friends ({friends.length})
                        </h3>
                        <button 
                          onClick={async () => {
                            // Create a group chat with friends
                            if (communityDb && user) {
                              try {
                                // Create a group conversation
                                const groupConversation = await communityDb.createConversation(true, user.id, 'My Group Chat', []);
                                setConversations(prev => [...prev, groupConversation]);
                                setActiveConversation(groupConversation);
                                setShowFriendsPanel(false); // Close panel after selecting
                              } catch (error) {
                                console.error('Failed to create group chat:', error);
                              }
                            }
                          }}
                          className="text-xs bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary px-2 py-1 rounded"
                        >
                          Create Group
                        </button>
                      </div>
                      <div className="space-y-2">
                        {friends.length > 0 ? (
                          friends.map((friend: any) => {
                            const friendId = friend.friend_id;
                            const profile = profiles[friendId];
                            const displayName = profile?.username || `User ${friendId.substring(0, 8)}`;
                            const displayAvatar = profile?.avatar_url || displayName.charAt(0).toUpperCase();
                            
                            return (
                              <div key={friendId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                  {typeof displayAvatar === 'string' && displayAvatar.startsWith('http') ? (
                                    <img src={displayAvatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <span>{displayAvatar}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-white text-sm">{displayName}</p>
                                  <p className="text-xs text-gray-500">{profile?.display_name || 'Online'}</p>
                                </div>
                                <button 
                                  onClick={async () => {
                                    // Create DM with friend
                                    if (communityDb && user) {
                                      try {
                                        const dmConversation = await createDirectMessageConversation(user.id, friendId);
                                        setConversations(prev => [...prev, dmConversation]);
                                        setActiveConversation(dmConversation);
                                        setShowFriendsPanel(false); // Close panel after selecting
                                      } catch (error) {
                                        console.error('Failed to create DM:', error);
                                      }
                                    }
                                  }}
                                  className="p-1 rounded hover:bg-gray-700"
                                >
                                  <MessageCircle size={16} />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-500 text-sm py-2">No friends yet</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Friend Requests Section */}
                    <div>
                      <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                        <UserPlus className="text-accent-primary" size={16} />
                        Requests ({friendRequests.length})
                      </h3>
                      <div className="space-y-2">
                        {friendRequests.length > 0 ? (
                          friendRequests.map((request: any) => {
                            const isOutgoing = request.sender_id === user?.id;
                            const otherUserId = isOutgoing ? request.receiver_id : request.sender_id;
                            
                            // Get profile from loaded profiles
                            const otherUserProfile = profiles[otherUserId];
                            const displayName = otherUserProfile?.username || `User ${otherUserId.substring(0, 8)}`;
                            const displayAvatar = otherUserProfile?.avatar_url || displayName.charAt(0).toUpperCase();
                            
                            return (
                              <div key={request.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                  {typeof displayAvatar === 'string' && displayAvatar.startsWith('http') ? (
                                    <img src={displayAvatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <span>{displayAvatar}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-white text-sm">{displayName}</p>
                                  <p className="text-xs text-gray-500">{isOutgoing ? 'Sent' : 'Received'}</p>
                                </div>
                                {!isOutgoing && (
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={async () => {
                                        if (communityDb) {
                                          await communityDb.updateFriendRequest(request.id, 'accepted');
                                          // Refresh requests
                                          const updatedRequests = await communityDb.getFriendRequests(user.id);
                                          setFriendRequests(updatedRequests.filter((req: any) => req.status === 'pending'));
                                          // Add to friends list
                                          const newFriend = { user_id: user.id, friend_id: otherUserId, created_at: new Date().toISOString() };
                                          setFriends(prev => [...prev, newFriend]);
                                          
                                          // Add profile to profiles
                                          if (otherUserProfile) {
                                            setProfiles(prev => ({ ...prev, [otherUserId]: otherUserProfile }));
                                          }
                                        }
                                      }}
                                      className="p-1 rounded bg-green-600 hover:bg-green-500"
                                    >
                                      <UserCheck size={14} />
                                    </button>
                                    <button 
                                      onClick={async () => {
                                        if (communityDb) {
                                          await communityDb.updateFriendRequest(request.id, 'declined');
                                          // Refresh requests
                                          const updatedRequests = await communityDb.getFriendRequests(user.id);
                                          setFriendRequests(updatedRequests.filter((req: any) => req.status === 'pending'));
                                        }
                                      }}
                                      className="p-1 rounded bg-red-600 hover:bg-red-500"
                                    >
                                      <UserX size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-500 text-sm py-2">No pending requests</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Add Friend Section */}
                    <div>
                      <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                        <UserSearch className="text-accent-primary" size={16} />
                        Add Friend
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Username"
                          value={searchUsername}
                          onChange={(e) => setSearchUsername(e.target.value)}
                          className="flex-1 bg-gray-800 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary"
                          onKeyPress={async (e) => {
                            if (e.key === 'Enter' && communityDb && searchUsername.trim()) {
                              setLoadingSearch(true);
                              try {
                                const results = await communityDb.searchProfiles(searchUsername.trim());
                                setSearchResults(results);
                              } catch (error) {
                                console.error('Error searching profiles:', error);
                              } finally {
                                setLoadingSearch(false);
                              }
                            }
                          }}
                        />
                        <button 
                          className="px-3 py-2 bg-accent-primary text-white rounded text-sm hover:bg-accent-primary/90 border border-accent-primary"
                          onClick={async () => {
                            if (communityDb && searchUsername.trim()) {
                              setLoadingSearch(true);
                              try {
                                const results = await communityDb.searchProfiles(searchUsername.trim());
                                setSearchResults(results);
                              } catch (error) {
                                console.error('Error searching profiles:', error);
                              } finally {
                                setLoadingSearch(false);
                              }
                            }
                          }}
                        >
                          {loadingSearch ? 'Searching...' : 'Search'}
                        </button>
                      </div>
                      
                      {searchResults.length > 0 && (
                        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                          {searchResults.map((result: any) => {
                            const isAlreadyFriend = friends.some(f => f.friend_id === result.id);
                            const isOwnProfile = result.id === user?.id;
                            const hasSentRequest = friendRequests.some(req => 
                              req.sender_id === user?.id && req.receiver_id === result.id
                            );
                            
                            return (
                              <div key={result.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                  {typeof result.avatar_url === 'string' && result.avatar_url.startsWith('http') ? (
                                    <img src={result.avatar_url} alt={result.username} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <span>{result.username.charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-white text-sm">{result.username}</p>
                                  <p className="text-xs text-gray-500">{result.display_name}</p>
                                </div>
                                {!isAlreadyFriend && !isOwnProfile && !hasSentRequest && (
                                  <button 
                                    onClick={async () => {
                                      if (communityDb && user) {
                                        try {
                                          await communityDb.createFriendRequest(user.id, result.id);
                                          setToastMessage('Friend request sent!');
                                          setShowToast(true);
                                          setTimeout(() => setShowToast(false), 3000);
                                        } catch (error) {
                                          console.error('Error sending friend request:', error);
                                          setToastMessage('Failed to send friend request');
                                          setShowToast(true);
                                          setTimeout(() => setShowToast(false), 3000);
                                        }
                                      }
                                    }}
                                    className="p-1 rounded bg-accent-primary hover:bg-accent-primary/90 mr-1"
                                  >
                                    <UserPlus size={14} />
                                  </button>
                                )}
                                {(isAlreadyFriend || isOwnProfile) && (
                                  <span className="text-xs text-gray-500">
                                    {isOwnProfile ? 'You' : 'Friend'}
                                  </span>
                                )}
                                {hasSentRequest && (
                                  <span className="text-xs text-yellow-500">
                                    Sent
                                  </span>
                                )}
                                {isAlreadyFriend && (
                                  <button 
                                    onClick={async () => {
                                      // Create DM with friend
                                      if (communityDb && user) {
                                        try {
                                          const dmConversation = await createDirectMessageConversation(user.id, result.id);
                                          setConversations(prev => [...prev, dmConversation]);
                                          setActiveConversation(dmConversation);
                                          setShowFriendsPanel(false); // Close panel after selecting
                                        } catch (error) {
                                          console.error('Failed to create DM:', error);
                                        }
                                      }
                                    }}
                                    className="p-1 rounded hover:bg-gray-700"
                                  >
                                    <MessageCircle size={14} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex-1 flex flex-col">
              {/* Community Tab Navigation */}
              <div className="h-16 bg-card-bg border-b border-card-border flex items-center px-6">
                <div className="flex items-center gap-3">
                  {/* Toggle Friends Panel Button */}
                  <button 
                    onClick={() => setShowFriendsPanel(!showFriendsPanel)}
                    className="mr-2 p-2 rounded hover:bg-gray-800"
                    title="Community"
                  >
                    <Users size={20} />
                  </button>
                  
                  {/* Community Tabs */}
                  <div className="flex space-x-1">
                    <button
                      className={`px-3 py-1 rounded-md text-sm ${activeCommunityTab === 'chat' ? 'bg-accent-primary text-white border border-accent-primary' : 'text-gray-400 hover:text-white'}`}
                      onClick={() => setActiveCommunityTab('chat')}
                    >
                      Chat
                    </button>
                    <button
                      className={`px-3 py-1 rounded-md text-sm ${activeCommunityTab === 'discover' ? 'bg-accent-primary text-white border border-accent-primary' : 'text-gray-400 hover:text-white'}`}
                      onClick={() => setActiveCommunityTab('discover')}
                    >
                      Discover
                    </button>
                    <button
                      className={`px-3 py-1 rounded-md text-sm ${activeCommunityTab === 'friends' ? 'bg-accent-primary text-white border border-accent-primary' : 'text-gray-400 hover:text-white'}`}
                      onClick={() => setActiveCommunityTab('friends')}
                    >
                      Friends
                    </button>
                    <button
                      className={`px-3 py-1 rounded-md text-sm ${activeCommunityTab === 'requests' ? 'bg-accent-primary text-white border border-accent-primary' : 'text-gray-400 hover:text-white'}`}
                      onClick={() => setActiveCommunityTab('requests')}
                    >
                      Requests
                    </button>
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

              {/* Tab Content Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeCommunityTab === 'chat' && (
                  <>
                    {messages.map((message, index) => {
                      const isMe = message.sender_id === user?.id;
                      const senderProfile = members.find(member => member.user_id === message.sender_id)?.profiles;
                      const displayName = isMe ? 'You' : message.username || senderProfile?.username || senderProfile?.email?.split('@')[0] || 'Unknown User';
                      const displayAvatar = message.avatar_url || senderProfile?.avatar_url || (message.username?.charAt(0).toUpperCase() || senderProfile?.username?.charAt(0).toUpperCase() || 'M');
                      
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
                            {message.read_at && (
                              <span className="text-xs text-blue-400">
                                ✓✓
                              </span>
                            )}
                          </div>
                          <div className={`mt-1 text-gray-300 bg-gray-800 p-3 rounded-lg max-w-3xl ${
                            message.pending ? 'opacity-60 italic' : ''
                          }`}>
                            {message.is_attachment_upload ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-primary"></div>
                                <span>{message.content}</span>
                              </div>
                            ) : (
                              <>
                                <div>
                                  {message.content}
                                </div>
                                {message.attachment_url && (
                                  <div className="mt-2">
                                    {message.attachment_type?.startsWith('image/') ? (
                                      <img 
                                        src={message.attachment_url} 
                                        alt="Attachment" 
                                        className="max-w-xs max-h-48 rounded-lg border border-gray-700"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.onerror = null; // prevents infinite loop
                                          target.style.display = 'none'; // hide broken image
                                          target.previousElementSibling?.classList.add('text-red-500'); // add error to text
                                        }}
                                      />
                                    ) : (
                                      <a 
                                        href={message.attachment_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                                      >
                                        <FileIcon size={16} />
                                        Download File
                                      </a>
                                    )}
                                  </div>
                                )}
                                {message.pending && <span className="ml-2 text-xs text-gray-400">Sending...</span>}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      )})}
                    <div ref={messagesEndRef} />
                    
                    {/* Typing indicators */}
                    {Object.entries(typingUsers).length > 0 && (
                      <div className="px-4 py-2 text-sm text-gray-400 flex items-center">
                        <div className="flex space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <div 
                              key={i} 
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.1}s` }}
                            ></div>
                          ))}
                        </div>
                        <span className="ml-2">
                          {Object.keys(typingUsers).length === 1 
                            ? 'Someone is typing...' 
                            : `${Object.keys(typingUsers).length} people are typing...`}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {activeCommunityTab === 'discover' && (
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search users by username or display name..."
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                        onKeyPress={async (e) => {
                          if (e.key === 'Enter' && communityDb && searchUsername.trim()) {
                            setLoadingSearch(true);
                            try {
                              const results = await communityDb.searchProfiles(searchUsername.trim());
                              setSearchResults(results);
                            } catch (error) {
                              console.error('Error searching profiles:', error);
                            } finally {
                              setLoadingSearch(false);
                            }
                          }
                        }}
                      />
                    </div>
                    <button 
                      className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 border border-accent-primary"
                      onClick={async () => {
                        if (communityDb && searchUsername.trim()) {
                          setLoadingSearch(true);
                          try {
                            const results = await communityDb.searchProfiles(searchUsername.trim());
                            setSearchResults(results);
                          } catch (error) {
                            console.error('Error searching profiles:', error);
                          } finally {
                            setLoadingSearch(false);
                          }
                        }
                      }}
                    >
                      {loadingSearch ? 'Searching...' : 'Search Users'}
                    </button>
                    
                    <div className="space-y-3">
                      {searchResults.length > 0 ? (
                        searchResults.map((result: any) => {
                          const isAlreadyFriend = friends.some(f => f.friend_id === result.id);
                          const isOwnProfile = result.id === user?.id;
                          const hasSentRequest = friendRequests.some(req => 
                            req.sender_id === user?.id && req.receiver_id === result.id
                          );
                          
                          return (
                            <div key={result.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white font-bold">
                                {typeof result.avatar_url === 'string' && result.avatar_url.startsWith('http') ? (
                                  <img src={result.avatar_url} alt={result.username} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span>{result.username.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{result.username}</p>
                                <p className="text-xs text-gray-400 truncate">{result.display_name}</p>
                              </div>
                              {!isAlreadyFriend && !isOwnProfile && !hasSentRequest && (
                                <button 
                                  onClick={async () => {
                                    if (communityDb && user) {
                                      try {
                                        await communityDb.createFriendRequest(user.id, result.id);
                                        setToastMessage('Friend request sent!');
                                        setShowToast(true);
                                        setTimeout(() => setShowToast(false), 3000);
                                      } catch (error) {
                                        console.error('Error sending friend request:', error);
                                        setToastMessage('Failed to send friend request');
                                        setShowToast(true);
                                        setTimeout(() => setShowToast(false), 3000);
                                      }
                                    }
                                  }}
                                  className="px-3 py-1 bg-accent-primary text-white rounded text-sm hover:bg-accent-primary/90 border border-accent-primary"
                                >
                                  Add Friend
                                </button>
                              )}
                              {isAlreadyFriend && (
                                <button 
                                  onClick={async () => {
                                    // Create DM with friend
                                    if (communityDb && user) {
                                      try {
                                        const dmConversation = await createDirectMessageConversation(user.id, result.id);
                                        setConversations(prev => [...prev, dmConversation]);
                                        setActiveConversation(dmConversation);
                                      } catch (error) {
                                        console.error('Failed to create DM:', error);
                                      }
                                    }
                                  }}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-500"
                                >
                                  Message
                                </button>
                              )}
                              {(isOwnProfile) && (
                                <span className="px-3 py-1 bg-gray-600 text-gray-300 rounded text-sm">
                                  You
                                </span>
                              )}
                              {hasSentRequest && (
                                <span className="px-3 py-1 bg-yellow-600 text-yellow-100 rounded text-sm">
                                  Pending
                                </span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>Search for users to connect with them</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeCommunityTab === 'friends' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Friends ({friends.length})</h2>
                      <button 
                        onClick={async () => {
                          // Create a group chat with friends
                          if (communityDb && user) {
                            try {
                              // Create a group conversation
                              const groupConversation = await communityDb.createConversation(true, user.id, 'My Group Chat', []);
                              setConversations(prev => [...prev, groupConversation]);
                              setActiveConversation(groupConversation);
                            } catch (error) {
                              console.error('Failed to create group chat:', error);
                            }
                          }
                        }}
                        className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 text-sm border border-accent-primary"
                      >
                        Create Group
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {friends.length > 0 ? (
                        friends.map((friend: any) => {
                          const friendId = friend.friend_id;
                          const profile = profiles[friendId];
                          const displayName = profile?.username || `User ${friendId.substring(0, 8)}`;
                          const displayAvatar = profile?.avatar_url || displayName.charAt(0).toUpperCase();
                          
                          return (
                            <div key={friendId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white font-bold">
                                {typeof displayAvatar === 'string' && displayAvatar.startsWith('http') ? (
                                  <img src={displayAvatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span>{displayAvatar}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{displayName}</p>
                                <p className="text-xs text-gray-400 truncate">{profile?.display_name || 'Online'}</p>
                              </div>
                              <button 
                                onClick={async () => {
                                  // Create DM with friend
                                  if (communityDb && user) {
                                    try {
                                      const dmConversation = await createDirectMessageConversation(user.id, friendId);
                                      setConversations(prev => [...prev, dmConversation]);
                                      setActiveConversation(dmConversation);
                                    } catch (error) {
                                      console.error('Failed to create DM:', error);
                                    }
                                  }
                                }}
                                className="px-3 py-1 bg-accent-primary text-white rounded text-sm hover:bg-accent-primary/90 border border-accent-primary"
                              >
                                Message
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                          <p>You don't have any friends yet</p>
                          <p className="text-sm mt-2">Search for users to add friends</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeCommunityTab === 'requests' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Friend Requests</h2>
                    </div>
                    
                    <div className="space-y-3">
                      {friendRequests.length > 0 ? (
                        friendRequests.map((request: any) => {
                          const isOutgoing = request.sender_id === user?.id;
                          const otherUserId = isOutgoing ? request.receiver_id : request.sender_id;
                          
                          // Get profile from loaded profiles
                          const otherUserProfile = profiles[otherUserId];
                          const displayName = otherUserProfile?.username || `User ${otherUserId.substring(0, 8)}`;
                          const displayAvatar = otherUserProfile?.avatar_url || displayName.charAt(0).toUpperCase();
                          
                          return (
                            <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white font-bold">
                                {typeof displayAvatar === 'string' && displayAvatar.startsWith('http') ? (
                                  <img src={displayAvatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span>{displayAvatar}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{displayName}</p>
                                <p className="text-xs text-gray-400 truncate">{isOutgoing ? 'Sent' : 'Received'}</p>
                              </div>
                              {isOutgoing ? (
                                <span className="px-3 py-1 bg-yellow-600 text-yellow-100 rounded text-sm">
                                  Pending
                                </span>
                              ) : (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={async () => {
                                      if (communityDb) {
                                        await communityDb.updateFriendRequest(request.id, 'accepted');
                                        // Refresh requests
                                        const updatedRequests = await communityDb.getFriendRequests(user.id);
                                        setFriendRequests(updatedRequests.filter((req: any) => req.status === 'pending'));
                                        // Add to friends list
                                        const newFriend = { user_id: user.id, friend_id: otherUserId, created_at: new Date().toISOString() };
                                        setFriends(prev => [...prev, newFriend]);
                                        
                                        // Add profile to profiles
                                        if (otherUserProfile) {
                                          setProfiles(prev => ({ ...prev, [otherUserId]: otherUserProfile }));
                                        }
                                      }
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-500"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      if (communityDb) {
                                        await communityDb.updateFriendRequest(request.id, 'declined');
                                        // Refresh requests
                                        const updatedRequests = await communityDb.getFriendRequests(user.id);
                                        setFriendRequests(updatedRequests.filter((req: any) => req.status === 'pending'));
                                      }
                                    }}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <UserPlus className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                          <p>No pending friend requests</p>
                          <p className="text-sm mt-2">Friend requests will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {activeCommunityTab === 'chat' && (
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
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          // Trigger typing indicator manually
                          if (communityDb && activeConversation && user && e.target.value.trim() !== '') {
                            communityDb.setTypingStatus(activeConversation.id, user.id, true);
                                          
                            // Clear any existing timeout
                            if (typingTimeoutRef.current) {
                              clearTimeout(typingTimeoutRef.current);
                            }
                                          
                            // Set a new timeout to stop typing indicator after 2 seconds
                            typingTimeoutRef.current = setTimeout(() => {
                              communityDb.setTypingStatus(activeConversation.id, user.id, false);
                            }, 2000);
                          }
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message here..."
                        className="w-full min-h-12 max-h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent resize-none"
                        rows={1}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="self-end p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
                        onClick={() => {
                          // Trigger file picker
                          document.getElementById('attachment-input')?.click();
                        }}
                      >
                        <Paperclip size={18} />
                        <input
                          id="attachment-input"
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setAttachment(file);
                              // Show a temporary message indicating the file is being uploaded
                              if (file && activeConversation && user) {
                                const tempMessage = {
                                  id: 'temp-' + Date.now(),
                                  conversation_id: activeConversation.id,
                                  sender_id: user.id,
                                  content: `Uploading: ${file.name}`,
                                  created_at: new Date().toISOString(),
                                  is_attachment_upload: true
                                };
                                setMessages(prev => [...prev, tempMessage]);
                              }
                            }
                          }}
                        />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={messageLoading || (!newMessage.trim() && !attachment)}
                        className={`self-end px-4 py-2 rounded-lg flex items-center gap-2 hover-lift ${
                          messageLoading || (!newMessage.trim() && !attachment)
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-accent-primary text-white hover:bg-accent-primary/90'
                        }`}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              )}
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
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                            {member.role}
                          </span>
                          {!isCurrentUser && (
                            <div className="relative">
                              <button 
                                className="p-1 rounded hover:bg-gray-700"
                                onClick={() => {
                                  // Show dropdown menu for block/report options
                                  const dropdown = document.getElementById(`dropdown-${member.user_id}`);
                                  if (dropdown) {
                                    dropdown.classList.toggle('hidden');
                                  }
                                }}
                              >
                                <MoreVertical size={14} />
                              </button>
                              <div 
                                id={`dropdown-${member.user_id}`}
                                className="hidden absolute right-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10"
                              >
                                <div className="py-1">
                                  <button 
                                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-900/50 hover:text-red-400"
                                    onClick={async () => {
                                      if (communityDb && user) {
                                        try {
                                          await communityDb.blockUser(user.id, member.user_id);
                                          setToastMessage('User blocked successfully');
                                          setShowToast(true);
                                          setTimeout(() => setShowToast(false), 3000);
                                        } catch (error) {
                                          console.error('Error blocking user:', error);
                                          setToastMessage('Failed to block user');
                                          setShowToast(true);
                                          setTimeout(() => setShowToast(false), 3000);
                                        }
                                      }
                                    }}
                                  >
                                    Block User
                                  </button>
                                  <button 
                                    className="block w-full text-left px-4 py-2 text-sm text-orange-500 hover:bg-orange-900/50 hover:text-orange-400"
                                    onClick={async () => {
                                      // Prompt for report reason
                                      const reason = prompt('Enter reason for reporting this user:');
                                      if (reason && communityDb && user) {
                                        try {
                                          await communityDb.reportUser(user.id, member.user_id, reason);
                                          setToastMessage('User reported successfully');
                                          setShowToast(true);
                                          setTimeout(() => setShowToast(false), 3000);
                                        } catch (error) {
                                          console.error('Error reporting user:', error);
                                          setToastMessage('Failed to report user');
                                          setShowToast(true);
                                          setTimeout(() => setShowToast(false), 3000);
                                        }
                                      }
                                    }}
                                  >
                                    Report User
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
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