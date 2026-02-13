export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  role: string;
  created_at: string;
  last_seen_at: string;
  is_online: boolean;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Friend {
  user_id: string;
  friend_id: string;
  created_at: string;
  friend_details?: Profile;
}

export interface Conversation {
  id: string;
  is_group: boolean;
  title?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMember {
  conversation_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  last_read_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  attachment_url?: string;
  attachment_type?: string;
  created_at: string;
  edited_at?: string;
  deleted_at?: string;
  client_nonce?: string;
}

export interface Block {
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  message_id?: string;
  reason: string;
  created_at: string;
}

export interface CommunityDB {
  // Profiles
  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, data: Partial<Omit<Profile, 'id' | 'created_at'>>): Promise<Profile>;
  searchProfiles(query: string): Promise<Profile[]>;

  // Friend Requests
  createFriendRequest(requesterId: string, addresseeId: string): Promise<FriendRequest>;
  updateFriendRequest(requestId: string, status: 'accepted' | 'declined' | 'cancelled'): Promise<FriendRequest>;
  getFriendRequests(userId: string): Promise<FriendRequest[]>;

  // Friends
  getFriends(userId: string): Promise<Friend[]>;
  unfriend(userId: string, friendId: string): Promise<void>;

  // Conversations
  createConversation(isGroup: boolean, createdBy: string, title?: string, userIds?: string[]): Promise<Conversation>;
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(conversationId: string): Promise<Conversation | null>;
  addConversationMember(conversationId: string, userId: string, role?: 'owner' | 'admin' | 'member'): Promise<void>;
  removeConversationMember(conversationId: string, userId: string): Promise<void>;
  updateConversation(conversationId: string, data: Partial<Omit<Conversation, 'id' | 'created_by' | 'created_at'>>): Promise<void>;

  // Messages
  createMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message>;
  getMessages(conversationId: string, offset?: number, limit?: number): Promise<Message[]>;
  updateMessage(messageId: string, body: string): Promise<Message>;
  deleteMessage(messageId: string): Promise<void>;

  // Blocks
  blockUser(blockerId: string, blockedId: string): Promise<void>;
  unblockUser(blockerId: string, blockedId: string): Promise<void>;
  isBlocked(blockerId: string, blockedId: string): Promise<boolean>;

  // Reports
  reportUser(reporterId: string, reportedUserId: string, reason: string): Promise<Report>;
  reportMessage(reporterId: string, messageId: string, reason: string): Promise<Report>;

  // Typing Indicators
  setTypingStatus(conversationId: string, userId: string, isTyping: boolean): void;
  getTypingUsers(conversationId: string): Promise<string[]>;

  // Read Receipts
  markAsRead(conversationId: string, userId: string, lastReadAt: string): Promise<void>;
  getUnreadCount(conversationId: string, userId: string): Promise<number>;
}