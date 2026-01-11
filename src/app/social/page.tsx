'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getOrCreateGlobalHelpConversation, 
  getUserConversations, 
  getConversationMessages, 
  sendMessage,
  subscribeToConversation,
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

const SocialPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

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
    console.log('SocialPage useEffect: Active conversation changed:', activeConversation);
    if (activeConversation) {
      loadMessages();
    }
  }, [activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const loadMessages = async () => {
    if (!activeConversation) {
      console.log('loadMessages: No active conversation, returning');
      return;
    }
    
    try {
      console.log('loadMessages: Loading messages for conversation:', activeConversation.id);
      const msgs = await getConversationMessages(activeConversation.id);
      console.log('loadMessages: Got messages:', msgs);
      setMessages(msgs);
      
      // Load members for the conversation
      console.log('loadMessages: Loading members for conversation:', activeConversation.id);
      const convMembers = await getConversationMembers(activeConversation.id);
      console.log('loadMessages: Got members:', convMembers);
      setMembers(convMembers);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  // Stable realtime subscription effect
  useEffect(() => {
    if (!activeConversation?.id) return;
    
    console.log('Realtime subscription: Setting up for conversation:', activeConversation.id);
    
    const unsubscribe = subscribeToConversation(activeConversation.id, (payload) => {
      console.log('Realtime subscription: Received new message via realtime:', payload);
      const newMessage = payload.new;
      
      setMessages(prev => {
        // If the new message has a client_generated_id, it's likely our own message
        if (newMessage.client_generated_id) {
          // Look for an optimistic message with the same client_generated_id to replace it
          const optimisticIndex = prev.findIndex(msg => 
            (msg as any).client_generated_id === newMessage.client_generated_id
          );
          
          if (optimisticIndex !== -1) {
            // Replace the optimistic message with the real DB message
            const updatedMessages = [...prev];
            updatedMessages[optimisticIndex] = newMessage;
            console.log('Realtime subscription: Replaced optimistic message with DB message');
            return updatedMessages;
          }
        }
        
        // Check if this is a truly new message (not already in our state)
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) {
          console.log('Realtime subscription: Duplicate message detected, skipping');
          return prev;
        }
        
        // Add the new message to the list
        console.log('Realtime subscription: Added new message from another user');
        return [...prev, newMessage];
      });
    });

    console.log('Realtime subscription: Established, returning cleanup function');
    
    return () => {
      console.log('Realtime subscription: Cleaning up for conversation:', activeConversation.id);
      unsubscribe?.();
    };
  }, [activeConversation?.id]);

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
        _optimistic: true
      };
      
      // Immediately add optimistic message to UI
      setMessages(prev => [...prev, optimisticMessage]);
      
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
      console.log('handleSendMessage: Message sent to Supabase, replacing optimistic message');
      
      // Replace optimistic message with actual DB message
      setMessages(prev => 
        prev.map(msg => 
          msg.client_generated_id === clientGeneratedId ? dbMessage : msg
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      
      // Remove the optimistic message when sending fails
      setMessages(prev => 
        prev.filter(msg => 
          !(msg as any)._optimistic || (msg as any).client_generated_id !== clientGeneratedId
        )
      );
      
      // Show error to user
      setErrorMessage('Message failed to send. Please try again.');
      setTimeout(() => setErrorMessage(null), 3000); // Clear error after 3 seconds
    } finally {
      setMessageLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  return (
    <ProtectedRoute>
      <AppShell>
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
                    ))
                  }
                  
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
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isMe = message.sender_id === user?.id;
                  const senderProfile = members.find(member => member.user_id === message.sender_id)?.profiles;
                  const displayName = isMe ? 'You' : senderProfile?.username || 'Member';
                  const displayAvatar = senderProfile?.avatar_url || (senderProfile?.username?.charAt(0).toUpperCase() || 'M');
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
                      <div className="mt-1 text-gray-300 bg-gray-800 p-3 rounded-lg max-w-3xl">
                        {message.content}
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
      </AppShell>
    </ProtectedRoute>
  );
};

export default SocialPage;