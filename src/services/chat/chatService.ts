import { supabase } from '@/lib/supabase';

// Get or create global help conversation via API route
export const getOrCreateGlobalHelpConversation = async () => {
  console.log('getOrCreateGlobalHelpConversation: Starting...');
  
  try {
    // Get the session token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('getOrCreateGlobalHelpConversation: Error getting session:', sessionError);
      throw sessionError;
    }
    
    if (!session) {
      console.error('getOrCreateGlobalHelpConversation: No session found');
      throw new Error('No session found');
    }
    
    console.log('getOrCreateGlobalHelpConversation: Session token available, calling API...');
    
    // Call the server action to get or create the global help conversation
    const response = await fetch('/api/conversations/global-help', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    console.log('getOrCreateGlobalHelpConversation: API response status:', response.status);
    console.log('getOrCreateGlobalHelpConversation: API response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('getOrCreateGlobalHelpConversation: API response error text:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      throw new Error(errorData.error || `Failed to get or create global help conversation. Status: ${response.status}`);
    }

    const { conversation, membershipCreated } = await response.json();
    console.log('getOrCreateGlobalHelpConversation: Returning conversation:', conversation);
    console.log('getOrCreateGlobalHelpConversation: Membership created flag:', membershipCreated);
    return conversation;
  } catch (error) {
    console.error('getOrCreateGlobalHelpConversation: Error:', error);
    console.error('getOrCreateGlobalHelpConversation: Error details:', {
      message: (error as any).message,
      stack: (error as any).stack
    });
    throw error;
  }
};

// Get user's conversations (DMs and groups they're part of)
export const getUserConversations = async (userId: string) => {
  console.log('getUserConversations: Fetching conversations for user:', userId);
  
  // First, get the conversation IDs the user is part of
  const { data: memberData, error: memberError } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', userId);

  if (memberError) {
    console.error('getUserConversations: Error fetching member data:', memberError);
    throw memberError;
  }

  if (!memberData || memberData.length === 0) {
    return [];
  }

  // Get the conversation IDs
  const conversationIds = memberData.map(m => m.conversation_id);

  // Now fetch the conversations
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .in('id', conversationIds);

  console.log('getUserConversations: Result', { data, error });
  if (error) {
    console.error('getUserConversations: Error fetching conversations:', error);
    throw error;
  }
  return data;
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId: string, limit = 50, offset = 0) => {
  console.log('getConversationMessages: Fetching messages for conversation:', conversationId);
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  console.log('getConversationMessages: Result', { data, error });
  if (error) {
    console.error('getConversationMessages: Error fetching messages:', error);
    throw error;
  }
  return data ?? [];
};

// Send a message
export const sendMessage = async (userId: string, conversationId: string, content: string, clientGeneratedId?: string) => {
  console.log('sendMessage: Attempting to send message', { userId, conversationId, content, clientGeneratedId });
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      content,
      client_generated_id: clientGeneratedId
    })
    .select('*')
    .single();

  console.log('sendMessage: Result', { data, error });
  if (error) {
    console.error('sendMessage: Error sending message:', error);
    throw error;
  }
  return data;
};

// Create a direct message conversation
export const createDirectMessageConversation = async (userId: string, otherUserId: string) => {
  console.log('createDirectMessageConversation: Creating DM between users:', { userId, otherUserId });
  
  // Check if a DM conversation already exists between these users
  // First get all DM conversations for the current user
  const { data: userDms, error: userDmsError } = await supabase
    .from('conversations')
    .select(`
      id
    `)
    .eq('type', 'dm');

  if (userDmsError) {
    console.error('createDirectMessageConversation: Error fetching user DMs:', userDmsError);
    throw userDmsError;
  }

  // Then check if any of those DMs has both users as members
  let existingConversation = null;
  for (const dm of userDms) {
    const { data: members, error: membersError } = await supabase
      .from('conversation_members')
      .select('user_id')
      .eq('conversation_id', dm.id);
    
    if (!membersError && members) {
      const memberIds = members.map((m: { user_id: string }) => m.user_id);
      if (memberIds.includes(userId) && memberIds.includes(otherUserId) && memberIds.length === 2) {
        existingConversation = dm;
        break;
      }
    }
  }

  console.log('createDirectMessageConversation: Check existing result:', { existingConversation });

  if (existingConversation) {
    console.log('createDirectMessageConversation: Found existing conversation, returning:', existingConversation);
    return existingConversation;
  }

  // Create new DM conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert([{ type: 'dm' }])
    .select()
    .maybeSingle();

  console.log('createDirectMessageConversation: Created new conversation:', { conversation, convError });
  if (convError) {
    console.error('createDirectMessageConversation: Error creating conversation:', convError);
    throw convError;
  }

  // Add both users as members
  const { error: membersError } = await supabase
    .from('conversation_members')
    .insert([
      { conversation_id: conversation.id, user_id: userId },
      { conversation_id: conversation.id, user_id: otherUserId }
    ]);

  console.log('createDirectMessageConversation: Added members:', { membersError });
  if (membersError) {
    console.error('createDirectMessageConversation: Error adding members:', membersError);
    throw membersError;
  }

  console.log('createDirectMessageConversation: Successfully created DM conversation:', conversation);
  return conversation;
};

// Get user by username for DM creation
export const getUserByUsername = async (username: string) => {
  console.log('getUserByUsername: Fetching user with username:', username);
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('username', username)
    .maybeSingle();

  console.log('getUserByUsername: Result:', { data, error });
  if (error) {
    console.error('getUserByUsername: Error fetching user:', error);
    throw error;
  }
  return data;
};

// Check if user is a member of a conversation
export const checkConversationMembership = async (conversationId: string, userId: string) => {
  console.log('checkConversationMembership: Checking if user is member of conversation:', { conversationId, userId });
  const { data, error } = await supabase
    .from('conversation_members')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  console.log('checkConversationMembership: Result:', { data, error });
  if (error) {
    console.error('checkConversationMembership: Error checking membership:', error);
    throw error;
  }
  
  return !!data; // Return true if membership exists, false otherwise
};

// Add reaction to a message
export const addReactionToMessage = async (userId: string, messageId: string, reaction: string) => {
  // Add reaction implementation would go here
  console.log('addReactionToMessage: Adding reaction', { userId, messageId, reaction });
  // This would need a message_reactions table which we haven't created yet
};

// Remove reaction from a message
export const removeReactionFromMessage = async (userId: string, messageId: string, reaction: string) => {
  // Remove reaction implementation would go here
  console.log('removeReactionFromMessage: Removing reaction', { userId, messageId, reaction });
  // This would need a message_reactions table which we haven't created yet
};

// Subscribe to real-time messages in a conversation
export const subscribeToConversation = (
  conversationId: string, 
  callback: (payload: any) => void
) => {
  console.log('subscribeToConversation: Setting up subscription for conversation:', conversationId);
  
  // For real-time subscriptions, we'll use the global supabase client
  // since the subscription needs to persist
  const channelName = `conversation-${conversationId}`;
  const subscription = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log('subscribeToConversation: Received new message via Realtime:', payload);
        callback(payload);
      }
    )
    .subscribe();

  console.log('subscribeToConversation: Subscription established:', subscription);
  return () => {
    console.log('subscribeToConversation: Removing subscription');
    supabase.removeChannel(subscription);
  };
};

// Subscribe to real-time reactions on messages
export const subscribeToReactions = (
  messageId: string, 
  callback: (payload: any) => void
) => {
  // Reaction subscription implementation would go here
  console.log('subscribeToReactions: Setting up subscription for message:', messageId);
  // This would need a message_reactions table which we haven't created yet
};