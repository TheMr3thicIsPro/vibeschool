import { CommunityDB, Profile, FriendRequest, Friend, Conversation, ConversationMember, Message, Block, Report } from './types';
import { createClient } from '@supabase/supabase-js';

export class SupabaseDB implements CommunityDB {
  private supabase;
  private DEBUG_COMMUNITY = process.env.DEBUG_COMMUNITY === 'true';

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and Anon Key are required');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] getProfile error', error);
      }
      return null;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] getProfile', { userId, profile: data ? 'found' : 'not found' });
    }
    return data as Profile;
  }

  async updateProfile(userId: string, data: Partial<Omit<Profile, 'id' | 'created_at'>>): Promise<Profile> {
    const { data: updatedData, error } = await this.supabase
      .from('profiles')
      .update({
        ...data,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] updateProfile error', error);
      }
      throw error;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] updateProfile', { userId, data });
    }
    return updatedData as Profile;
  }

  async searchProfiles(query: string, excludeUserId?: string): Promise<Profile[]> {
    // Sanitize query to avoid breaking .or() syntax which uses commas as delimiters
    const sanitizedQuery = query.replace(/,/g, ' ').trim();
    console.log('[SEARCH] Searching profiles with query:', sanitizedQuery);
    
    // 1. Search profiles matching query
    const { data: profiles, error } = await this.supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${sanitizedQuery}%,display_name.ilike.%${sanitizedQuery}%`)
      .limit(20);

    if (error) {
      console.error('[SEARCH] Error searching profiles:', error);
      return [];
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('[SEARCH] No profiles found matching query');
      return [];
    }

    // 2. Get current user to filter results
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) {
      console.log('[SEARCH] No authenticated user, returning all matches');
      return profiles as Profile[];
    }
    const currentUserId = user.id;

    // 3. Get existing friends and pending requests to exclude
    const [friends, requests] = await Promise.all([
      this.getFriends(currentUserId),
      this.getFriendRequests(currentUserId)
    ]);

    const friendIds = new Set(friends.map(f => f.friend_id));
    const pendingIds = new Set(requests.map(r => 
      r.sender_id === currentUserId ? r.receiver_id : r.sender_id
    ));

    // 4. Filter results
    const filtered = profiles.filter(p => 
      p.id !== currentUserId && // Exclude self
      !friendIds.has(p.id) &&   // Exclude friends
      !pendingIds.has(p.id)     // Exclude pending requests
    );

    if (this.DEBUG_COMMUNITY) {
      console.log('[SEARCH] Results:', { 
        raw: profiles.length, 
        filtered: filtered.length,
        excluded: profiles.length - filtered.length
      });
    }
    
    return filtered as Profile[];
  }

  // Friend Requests
  async createFriendRequest(senderId: string, receiverId: string): Promise<FriendRequest> {
    console.log('[FRIEND REQUEST] sending', { senderId, receiverId });
    
    const newRequest = {
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'pending',
      // created_at and updated_at are handled by default/triggers or Supabase but we can set them if needed
    };

    const { data, error } = await this.supabase
      .from('friend_requests')
      .insert([newRequest])
      .select()
      .single();

    if (error) {
      console.error('[FRIEND REQUEST] Error creating request:', error);
      throw error;
    }

    console.log('[FRIEND REQUEST] created successfully:', data.id);
    return data as FriendRequest;
  }

  async updateFriendRequest(requestId: string, status: 'accepted' | 'declined' | 'cancelled'): Promise<FriendRequest> {
    console.log('[FRIEND REQUEST] updating', { requestId, status });
    
    const { data, error } = await this.supabase
      .from('friend_requests')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('[FRIEND REQUEST] Error updating request:', error);
      throw error;
    }

    // If accepted, create friendship entries (Mutual)
    if (status === 'accepted' && data) {
      const request = data as FriendRequest;
      const friendEntry1 = {
        user_id: request.sender_id,
        friend_id: request.receiver_id,
      };
      const friendEntry2 = {
        user_id: request.receiver_id,
        friend_id: request.sender_id,
      };

      console.log('[FRIEND REQUEST] Creating mutual friendship entries');
      const { error: friendError } = await this.supabase.from('friends').insert([friendEntry1, friendEntry2]);
      
      if (friendError) {
        console.error('[FRIEND REQUEST] Error creating friends entries:', friendError);
        // In a production app, we should probably revert the request status or use a Postgres function
      }
    }

    return data as FriendRequest;
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const { data, error } = await this.supabase
      .from('friend_requests')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) {
      console.error('[FRIENDS] Error fetching requests:', error);
      return [];
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[FRIENDS] Fetched requests:', { userId, count: data?.length || 0 });
    }
    return data as FriendRequest[];
  }

  // Friends
  async getFriends(userId: string): Promise<Friend[]> {
    // Join with profiles to get friend details
    // Note: This requires a foreign key relationship in Supabase between friends.friend_id and profiles.id
    const { data, error } = await this.supabase
      .from('friends')
      .select('*, friend_details:profiles!friend_id(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('[FRIENDS] Error fetching friends:', error);
      return [];
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[FRIENDS] Fetched friends:', { userId, count: data?.length || 0 });
    }
    return data as Friend[];
  }

  async unfriend(userId: string, friendId: string): Promise<void> {
    console.log('[FRIENDS] Unfriending', { userId, friendId });
    
    const { error } = await this.supabase
      .from('friends')
      .delete()
      .or(`(user_id.eq.${userId},friend_id.eq.${friendId}),(user_id.eq.${friendId},friend_id.eq.${userId})`);

    if (error) {
      console.error('[FRIENDS] Error unfriending:', error);
    }
  }

  // Conversations
  async createConversation(isGroup: boolean, createdBy: string, title?: string, userIds?: string[]): Promise<Conversation> {
    const newConversation = {
      id: crypto.randomUUID(),
      is_group: isGroup,
      title: title || (isGroup ? 'Group Chat' : undefined),
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('conversations')
      .insert([newConversation])
      .select()
      .single();

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] createConversation error', error);
      }
      throw error;
    }

    // Add creator as member
    await this.supabase.from('conversation_members').insert([
      {
        conversation_id: data.id,
        user_id: createdBy,
        role: 'owner',
        joined_at: new Date().toISOString(),
      }
    ]);

    // Add other users if provided
    if (userIds) {
      for (const userId of userIds) {
        if (userId !== createdBy) {
          await this.supabase.from('conversation_members').insert([
            {
              conversation_id: data.id,
              user_id: userId,
              role: 'member',
              joined_at: new Date().toISOString(),
            }
          ]);
        }
      }
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] createConversation', { isGroup, createdBy, title, userIds, conversationId: data.id });
    }
    return data as Conversation;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await this.supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', userId);

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] getConversations error', error);
      }
      return [];
    }

    const conversationIds = data.map(cm => cm.conversation_id);

    const { data: conversations, error: convError } = await this.supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds);

    if (convError) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] getConversations error fetching conversations', convError);
      }
      return [];
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] getConversations', { userId, count: conversations?.length || 0 });
    }
    return conversations as Conversation[];
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] getConversation error', error);
      }
      return null;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] getConversation', { conversationId, found: !!data });
    }
    return data as Conversation;
  }

  async addConversationMember(conversationId: string, userId: string, role: 'owner' | 'admin' | 'member' = 'member'): Promise<void> {
    const { error } = await this.supabase
      .from('conversation_members')
      .insert([
        {
          conversation_id: conversationId,
          user_id: userId,
          role,
          joined_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] addConversationMember error', error);
      }
      throw error;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] addConversationMember', { conversationId, userId, role });
    }
  }

  async removeConversationMember(conversationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('conversation_members')
      .delete()
      .match({ conversation_id: conversationId, user_id: userId });

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] removeConversationMember error', error);
      }
      throw error;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] removeConversationMember', { conversationId, userId });
    }
  }

  async updateConversation(conversationId: string, data: Partial<Omit<Conversation, 'id' | 'created_by' | 'created_at'>>): Promise<void> {
    const { error } = await this.supabase
      .from('conversations')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] updateConversation error', error);
      }
      throw error;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] updateConversation', { conversationId, data });
    }
  }

  // Messages
  async createMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    const newMessage = {
      ...message,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('messages')
      .insert([newMessage])
      .select()
      .single();

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] createMessage error', error);
      }
      throw error;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] createMessage', { conversationId: message.conversation_id, senderId: message.sender_id, messageId: data.id });
    }
    return data as Message;
  }

  async getMessages(conversationId: string, offset: number = 0, limit: number = 50): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] getMessages error', error);
      }
      return [];
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] getMessages', { conversationId, offset, limit, count: data?.length || 0 });
    }
    return data as Message[];
  }

  async updateMessage(messageId: string, body: string): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .update({ 
        body,
        edited_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] updateMessage error', error);
      }
      throw error;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] updateMessage', { messageId, body });
    }
    return data as Message;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] deleteMessage error', error);
      }
      throw error;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] deleteMessage', { messageId });
    }
  }

  // Blocks
  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    const block = {
      blocker_id: blockerId,
      blocked_id: blockedId,
      created_at: new Date().toISOString(),
    };

    const { error } = await this.supabase
      .from('blocks')
      .insert([block]);

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] blockUser error', error);
      }
      throw error;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] blockUser', { blockerId, blockedId });
    }
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const { error } = await this.supabase
      .from('blocks')
      .delete()
      .match({ blocker_id: blockerId, blocked_id: blockedId });

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] unblockUser error', error);
      }
      throw error;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] unblockUser', { blockerId, blockedId });
    }
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('blocks')
      .select('id')
      .match({ blocker_id: blockerId, blocked_id: blockedId })
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] isBlocked error', error);
      }
      return false;
    }

    const isBlocked = !!data;
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] isBlocked', { blockerId, blockedId, isBlocked });
    }
    return isBlocked;
  }

  // Reports
  async reportUser(reporterId: string, reportedUserId: string, reason: string): Promise<Report> {
    const newReport = {
      id: crypto.randomUUID(),
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reason,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('reports')
      .insert([newReport])
      .select()
      .single();

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] reportUser error', error);
      }
      throw error;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] reportUser', { reporterId, reportedUserId, reason });
    }
    return data as Report;
  }

  async reportMessage(reporterId: string, messageId: string, reason: string): Promise<Report> {
    const newReport = {
      id: crypto.randomUUID(),
      reporter_id: reporterId,
      message_id: messageId,
      reason,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('reports')
      .insert([newReport])
      .select()
      .single();

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] reportMessage error', error);
      }
      throw error;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] reportMessage', { reporterId, messageId, reason });
    }
    return data as Report;
  }

  // Typing Indicators (ephemeral, not stored long term)
  setTypingStatus(conversationId: string, userId: string, isTyping: boolean): void {
    // In Supabase mode, we'll use Supabase Realtime for typing indicators
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] setTypingStatus', { conversationId, userId, isTyping });
    }
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    // In Supabase mode, typing indicators would be handled via Realtime subscriptions
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] getTypingUsers', { conversationId });
    }
    return [];
  }

  // Read Receipts
  async markAsRead(conversationId: string, userId: string, lastReadAt: string): Promise<void> {
    const { error } = await this.supabase
      .from('conversation_members')
      .update({ last_read_at: lastReadAt })
      .match({ conversation_id: conversationId, user_id: userId });

    if (error) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] markAsRead error', error);
      }
      throw error;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] markAsRead', { conversationId, userId, lastReadAt });
    }
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    // Get the last read time for this user in this conversation
    const { data: member, error: memberError } = await this.supabase
      .from('conversation_members')
      .select('last_read_at')
      .match({ conversation_id: conversationId, user_id: userId })
      .single();

    if (memberError) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] getUnreadCount error getting member', memberError);
      }
      return 0;
    }

    const lastReadAt = member?.last_read_at ? new Date(member.last_read_at) : new Date(0);

    // Count messages sent after last read time by other users
    const { count, error: countError } = await this.supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .gt('created_at', lastReadAt.toISOString())
      .neq('sender_id', userId) // Don't count own messages as unread
      .is('deleted_at', null);

    if (countError) {
      if (this.DEBUG_COMMUNITY) {
        console.error('[COMMUNITY][SupabaseDB] getUnreadCount error getting count', countError);
      }
      return 0;
    }

    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][SupabaseDB] getUnreadCount', { conversationId, userId, unreadCount: count });
    }
    return count || 0;
  }
}
