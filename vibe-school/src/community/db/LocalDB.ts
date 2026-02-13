import { CommunityDB, Profile, FriendRequest, Friend, Conversation, ConversationMember, Message, Block, Report } from './types';

interface Data {
  profiles: Profile[];
  friendRequests: FriendRequest[];
  friends: Friend[];
  conversations: Conversation[];
  conversationMembers: ConversationMember[];
  messages: Message[];
  blocks: Block[];
  reports: Report[];
  typingIndicators: Record<string, { userId: string; timestamp: number }[]>;
}

export class LocalDB implements CommunityDB {
  private storageKey = 'vibeschool-community-data';
  private DEBUG_COMMUNITY = process.env.DEBUG_COMMUNITY === 'true';

  constructor() {
    // Initialize with default data if not exists
    this.initStorage();
  }

  private initStorage() {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(this.storageKey)) {
        const defaultData: Data = {
          profiles: [],
          friendRequests: [],
          friends: [],
          conversations: [],
          conversationMembers: [],
          messages: [],
          blocks: [],
          reports: [],
          typingIndicators: {},
        };
        localStorage.setItem(this.storageKey, JSON.stringify(defaultData));
      }
    }
  }

  private getData(): Data {
    if (typeof window === 'undefined') {
      return {
        profiles: [],
        friendRequests: [],
        friends: [],
        conversations: [],
        conversationMembers: [],
        messages: [],
        blocks: [],
        reports: [],
        typingIndicators: {},
      };
    }
    
    const dataStr = localStorage.getItem(this.storageKey);
    if (!dataStr) {
      this.initStorage();
      return this.getData();
    }
    
    try {
      return JSON.parse(dataStr) as Data;
    } catch (error) {
      console.error('[COMMUNITY][LocalDB] Error parsing data:', error);
      this.initStorage();
      return this.getData();
    }
  }

  private setData(data: Data) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
  }

  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    const data = this.getData();
    const profile = data.profiles.find(p => p.id === userId) || null;
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] getProfile', { userId, profile: profile ? 'found' : 'not found' });
    }
    
    return profile;
  }

  async updateProfile(userId: string, data: Partial<Omit<Profile, 'id' | 'created_at'>>): Promise<Profile> {
    const currentData = this.getData();
    const existingIndex = currentData.profiles.findIndex(p => p.id === userId);
    
    if (existingIndex !== -1) {
      currentData.profiles[existingIndex] = {
        ...currentData.profiles[existingIndex],
        ...data,
        last_seen_at: new Date().toISOString(),
      };
    } else {
      const newProfile: Profile = {
        id: userId,
        username: data.username || '',
        display_name: data.display_name || '',
        avatar_url: data.avatar_url,
        role: data.role || 'student',
        created_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        is_online: false,
      };
      currentData.profiles.push(newProfile);
    }
    
    this.setData(currentData);
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] updateProfile', { userId, data });
    }
    
    return currentData.profiles.find(p => p.id === userId)!;
  }

  async searchProfiles(query: string): Promise<Profile[]> {
    const data = this.getData();
    const lowerQuery = query.toLowerCase();
    const results = data.profiles.filter(p => 
      p.username.toLowerCase().includes(lowerQuery) || 
      p.display_name.toLowerCase().includes(lowerQuery)
    );
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] searchProfiles', { query, results: results.length });
    }
    
    return results;
  }

  // Friend Requests
  async createFriendRequest(senderId: string, receiverId: string): Promise<FriendRequest> {
    const currentData = this.getData();
    const newRequest: FriendRequest = {
      id: crypto.randomUUID(),
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    currentData.friendRequests.push(newRequest);
    this.setData(currentData);
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] createFriendRequest', { senderId, receiverId, requestId: newRequest.id });
    }
    
    return newRequest;
  }

  async updateFriendRequest(requestId: string, status: 'accepted' | 'declined' | 'cancelled'): Promise<FriendRequest> {
    const currentData = this.getData();
    const index = currentData.friendRequests.findIndex(r => r.id === requestId);
    
    if (index !== -1) {
      currentData.friendRequests[index].status = status;
      currentData.friendRequests[index].updated_at = new Date().toISOString();
      
      // If accepted, create friendship entries
      if (status === 'accepted') {
        const request = currentData.friendRequests[index];
        const friendEntry1: Friend = {
          user_id: request.sender_id,
          friend_id: request.receiver_id,
          created_at: new Date().toISOString(),
        };
        const friendEntry2: Friend = {
          user_id: request.receiver_id,
          friend_id: request.sender_id,
          created_at: new Date().toISOString(),
        };
        currentData.friends.push(friendEntry1, friendEntry2);
      }
      
      this.setData(currentData);
      
      if (this.DEBUG_COMMUNITY) {
        console.log('[COMMUNITY][LocalDB] updateFriendRequest', { requestId, status });
      }
      
      return currentData.friendRequests[index];
    }
    
    throw new Error('Friend request not found');
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const data = this.getData();
    const requests = data.friendRequests.filter(
      r => r.receiver_id === userId || r.sender_id === userId
    );
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] getFriendRequests', { userId, count: requests.length });
    }
    
    return requests;
  }

  // Friends
  async getFriends(userId: string): Promise<Friend[]> {
    const data = this.getData();
    const friends = data.friends.filter(f => f.user_id === userId);
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] getFriends', { userId, count: friends.length });
    }
    
    return friends;
  }

  async unfriend(userId: string, friendId: string): Promise<void> {
    const currentData = this.getData();
    currentData.friends = currentData.friends.filter(
      f => !(f.user_id === userId && f.friend_id === friendId) ||
           !(f.user_id === friendId && f.friend_id === userId)
    );
    this.setData(currentData);
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] unfriend', { userId, friendId });
    }
  }

  // Conversations
  async createConversation(isGroup: boolean, createdBy: string, title?: string, userIds?: string[]): Promise<Conversation> {
    const currentData = this.getData();
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      is_group: isGroup,
      title: title || (isGroup ? 'Group Chat' : undefined),
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    currentData.conversations.push(newConversation);
    
    // Add creator as member
    const creatorMember: ConversationMember = {
      conversation_id: newConversation.id,
      user_id: createdBy,
      role: 'owner',
      joined_at: new Date().toISOString(),
    };
    currentData.conversationMembers.push(creatorMember);
    
    // Add other users if provided
    if (userIds) {
      for (const userId of userIds) {
        if (userId !== createdBy) {
          const member: ConversationMember = {
            conversation_id: newConversation.id,
            user_id: userId,
            role: 'member',
            joined_at: new Date().toISOString(),
          };
          currentData.conversationMembers.push(member);
        }
      }
    }
    
    this.setData(currentData);
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] createConversation', { isGroup, createdBy, title, userIds, conversationId: newConversation.id });
    }
    
    return newConversation;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const data = this.getData();
    const userConversations = data.conversationMembers
      .filter(cm => cm.user_id === userId)
      .map(cm => cm.conversation_id);
    
    const conversations = data.conversations.filter(c => 
      userConversations.includes(c.id)
    );
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] getConversations', { userId, count: conversations.length });
    }
    
    return conversations;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const data = this.getData();
    const conversation = data.conversations.find(c => c.id === conversationId) || null;
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] getConversation', { conversationId, found: !!conversation });
    }
    
    return conversation;
  }

  async addConversationMember(conversationId: string, userId: string, role: 'owner' | 'admin' | 'member' = 'member'): Promise<void> {
    const currentData = this.getData();
    const existingMember = currentData.conversationMembers.find(
      cm => cm.conversation_id === conversationId && cm.user_id === userId
    );
    
    if (!existingMember) {
      const member: ConversationMember = {
        conversation_id: conversationId,
        user_id: userId,
        role,
        joined_at: new Date().toISOString(),
      };
      currentData.conversationMembers.push(member);
      this.setData(currentData);
      
      if (this.DEBUG_COMMUNITY) {
        console.log('[COMMUNITY][LocalDB] addConversationMember', { conversationId, userId, role });
      }
    }
  }

  async removeConversationMember(conversationId: string, userId: string): Promise<void> {
    const currentData = this.getData();
    currentData.conversationMembers = currentData.conversationMembers.filter(
      cm => !(cm.conversation_id === conversationId && cm.user_id === userId)
    );
    this.setData(currentData);
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] removeConversationMember', { conversationId, userId });
    }
  }

  async updateConversation(conversationId: string, data: Partial<Omit<Conversation, 'id' | 'created_by' | 'created_at'>>): Promise<void> {
    const currentData = this.getData();
    const index = currentData.conversations.findIndex(c => c.id === conversationId);
    
    if (index !== -1) {
      currentData.conversations[index] = {
        ...currentData.conversations[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      this.setData(currentData);
      
      if (this.DEBUG_COMMUNITY) {
        console.log('[COMMUNITY][LocalDB] updateConversation', { conversationId, data });
      }
    }
  }

  // Messages
  async createMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    const currentData = this.getData();
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    currentData.messages.push(newMessage);
    this.setData(currentData);
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] createMessage', { conversationId: message.conversation_id, senderId: message.sender_id, messageId: newMessage.id });
    }
    
    return newMessage;
  }

  async getMessages(conversationId: string, offset: number = 0, limit: number = 50): Promise<Message[]> {
    const data = this.getData();
    const messages = data.messages
      .filter(m => m.conversation_id === conversationId && !m.deleted_at)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(offset, offset + limit);
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] getMessages', { conversationId, offset, limit, count: messages.length });
    }
    
    return messages;
  }

  async updateMessage(messageId: string, body: string): Promise<Message> {
    const currentData = this.getData();
    const index = currentData.messages.findIndex(m => m.id === messageId);
    
    if (index !== -1) {
      currentData.messages[index].body = body;
      currentData.messages[index].edited_at = new Date().toISOString();
      this.setData(currentData);
      
      if (this.DEBUG_COMMUNITY) {
        console.log('[COMMUNITY][LocalDB] updateMessage', { messageId, body });
      }
      
      return currentData.messages[index];
    }
    
    throw new Error('Message not found');
  }

  async deleteMessage(messageId: string): Promise<void> {
    const currentData = this.getData();
    const index = currentData.messages.findIndex(m => m.id === messageId);
    
    if (index !== -1) {
      currentData.messages[index].deleted_at = new Date().toISOString();
      this.setData(currentData);
      
      if (this.DEBUG_COMMUNITY) {
        console.log('[COMMUNITY][LocalDB] deleteMessage', { messageId });
      }
    }
  }

  // Blocks
  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    const currentData = this.getData();
    const existingBlock = currentData.blocks.find(
      b => b.blocker_id === blockerId && b.blocked_id === blockedId
    );
    
    if (!existingBlock) {
      const block: Block = {
        blocker_id: blockerId,
        blocked_id: blockedId,
        created_at: new Date().toISOString(),
      };
      currentData.blocks.push(block);
      this.setData(currentData);
      
      if (this.DEBUG_COMMUNITY) {
        console.log('[COMMUNITY][LocalDB] blockUser', { blockerId, blockedId });
      }
    }
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const currentData = this.getData();
    currentData.blocks = currentData.blocks.filter(
      b => !(b.blocker_id === blockerId && b.blocked_id === blockedId)
    );
    this.setData(currentData);
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] unblockUser', { blockerId, blockedId });
    }
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const data = this.getData();
    const isBlocked = data.blocks.some(
      b => b.blocker_id === blockerId && b.blocked_id === blockedId
    );
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] isBlocked', { blockerId, blockedId, isBlocked });
    }
    
    return isBlocked;
  }

  // Reports
  async reportUser(reporterId: string, reportedUserId: string, reason: string): Promise<Report> {
    const currentData = this.getData();
    const newReport: Report = {
      id: crypto.randomUUID(),
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reason,
      created_at: new Date().toISOString(),
    };
    currentData.reports.push(newReport);
    this.setData(currentData);
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] reportUser', { reporterId, reportedUserId, reason });
    }
    
    return newReport;
  }

  async reportMessage(reporterId: string, messageId: string, reason: string): Promise<Report> {
    const currentData = this.getData();
    const newReport: Report = {
      id: crypto.randomUUID(),
      reporter_id: reporterId,
      message_id: messageId,
      reason,
      created_at: new Date().toISOString(),
    };
    currentData.reports.push(newReport);
    this.setData(currentData);
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] reportMessage', { reporterId, messageId, reason });
    }
    
    return newReport;
  }

  // Typing Indicators
  setTypingStatus(conversationId: string, userId: string, isTyping: boolean): void {
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] setTypingStatus', { conversationId, userId, isTyping });
    }
    
    const data = this.getData();
    const now = Date.now();
    const conversationTyping = data.typingIndicators[conversationId] || [];
    
    if (isTyping) {
      // Add user to typing list
      const existingIndex = conversationTyping.findIndex(t => t.userId === userId);
      if (existingIndex >= 0) {
        conversationTyping[existingIndex].timestamp = now;
      } else {
        conversationTyping.push({ userId, timestamp: now });
      }
    } else {
      // Remove user from typing list
      const existingIndex = conversationTyping.findIndex(t => t.userId === userId);
      if (existingIndex >= 0) {
        conversationTyping.splice(existingIndex, 1);
      }
    }
    
    data.typingIndicators[conversationId] = conversationTyping;
    this.setData(data);
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    const data = this.getData();
    const now = Date.now();
    const fiveSecondsAgo = now - 5000; // Clear typing indicators older than 5 seconds
    
    const conversationTyping = data.typingIndicators[conversationId] || [];
    const recentTyping = conversationTyping.filter(t => t.timestamp > fiveSecondsAgo);
    
    // Update the typing indicators to remove stale entries
    data.typingIndicators[conversationId] = recentTyping;
    this.setData(data);
    
    const userIds = recentTyping.map(t => t.userId);
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] getTypingUsers', { conversationId, userIds });
    }
    return userIds;
  }

  // Read Receipts
  async markAsRead(conversationId: string, userId: string, lastReadAt: string): Promise<void> {
    const currentData = this.getData();
    const memberIndex = currentData.conversationMembers.findIndex(
      cm => cm.conversation_id === conversationId && cm.user_id === userId
    );
    
    if (memberIndex !== -1) {
      currentData.conversationMembers[memberIndex].last_read_at = lastReadAt;
      this.setData(currentData);
      
      if (this.DEBUG_COMMUNITY) {
        console.log('[COMMUNITY][LocalDB] markAsRead', { conversationId, userId, lastReadAt });
      }
    }
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const data = this.getData();
    const member = data.conversationMembers.find(
      cm => cm.conversation_id === conversationId && cm.user_id === userId
    );
    
    const lastReadAt = member?.last_read_at ? new Date(member.last_read_at) : new Date(0);
    
    const unreadCount = data.messages.filter(
      m => m.conversation_id === conversationId &&
           new Date(m.created_at) > lastReadAt &&
           m.sender_id !== userId // Don't count own messages as unread
    ).length;
    
    if (this.DEBUG_COMMUNITY) {
      console.log('[COMMUNITY][LocalDB] getUnreadCount', { conversationId, userId, unreadCount });
    }
    return unreadCount;
  }
}