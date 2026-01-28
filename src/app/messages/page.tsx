'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { getCommunityDB, Conversation, Message, FriendRequest, Profile } from '@/community/db';
import { SendIcon, PaperclipIcon, MoreVerticalIcon, UsersIcon, UserIcon, UserPlusIcon, UserCheckIcon, UserXIcon, SearchIcon } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface MessagesPageProps {
  db?: any;
  currentUser?: any;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ db: propDb, currentUser: propUser }) => {
  const { state } = useAuthStore();
  const user = propUser || state.user;
  const [db, setDb] = useState(propDb);
  const [activeTab, setActiveTab] = useState<'messages' | 'friends' | 'requests'>('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Friend request related states
  const [friends, setFriends] = useState<{ user_id: string; friend_id: string; created_at: string; profile?: Profile }[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Initialize db if not passed as prop
  useEffect(() => {
    const init = async () => {
      if (!propDb) {
        try {
          const communityDb = await getCommunityDB();
          setDb(communityDb);
        } catch (err) {
          console.error('[COMMUNITY] Error initializing community DB:', err);
          setError('Failed to initialize community system');
        }
      }
    };

    if (user && !propDb) {
      init();
    } else if (propDb) {
      setDb(propDb);
    }
  }, [user, propDb]);

  // Load conversations when db is ready
  useEffect(() => {
    if (db && user) {
      loadConversations();
    }
  }, [db, user]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation && db && user) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation, db, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load friends and requests when db is ready
  useEffect(() => {
    if (db && user) {
      loadFriendsAndRequests();
    }
  }, [db, user, activeTab]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const convs = await db.getConversations(user.id);
      setConversations(convs);
      setLoading(false);
    } catch (err) {
      console.error('[COMMUNITY] Error loading conversations:', err);
      setError('Failed to load conversations');
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await db.getMessages(conversationId);
      setMessages(msgs);
    } catch (err) {
      console.error('[COMMUNITY] Error loading messages:', err);
      setError('Failed to load messages');
    }
  };

  const loadFriendsAndRequests = async () => {
    if (!db || !user) return;
    
    try {
      // Load friends
      const friendsList = await db.getFriends(user.id);
      const friendsWithProfiles = await Promise.all(
        friendsList.map(async (friend: any) => {
          const profile = await db.getProfile(friend.friend_id);
          return {
            ...friend,
            profile
          };
        })
      );
      setFriends(friendsWithProfiles);

      // Load friend requests
      const requests = await db.getFriendRequests(user.id);
      setFriendRequests(requests);
    } catch (err) {
      console.error('[COMMUNITY] Error loading friends/requests:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !db) return;

    try {
      const message = await db.createMessage({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        body: newMessage.trim(),
      });

      // Add message to local state
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Update conversations list with latest message
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id 
          ? { ...conv, updated_at: message.created_at } 
          : conv
      ));
    } catch (err) {
      console.error('[COMMUNITY] Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartTyping = () => {
    if (!isTyping && activeConversation) {
      setIsTyping(true);
      // In a real implementation, we would send typing indicator via socket
      // For now, just simulate it locally
    }
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      // In a real implementation, we would send typing stop indicator via socket
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Friend request functions
  const handleSearchUsers = async (query: string) => {
    if (!query.trim() || !db) return;
    
    try {
      setSearchLoading(true);
      const results = await db.searchProfiles(query);
      setSearchResults(results.filter((profile: Profile) => profile.id !== user.id));
    } catch (err) {
      console.error('[COMMUNITY] Error searching users:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      console.log("[FRIENDREQ] send to", userId);
      
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: userId })
      });
      
      const data = await response.json();
      console.log("[FRIENDREQ] response", response.status, data);
      
      if (response.ok && data.ok) {
        loadFriendsAndRequests();
        setSearchResults([]); // Clear search results
        setSearchQuery(''); // Clear search query
        
        // Show success toast
        console.log("[FRIENDREQ] request sent successfully");
      } else {
        console.error("[FRIENDREQ] Failed to send request:", data.error);
      }
    } catch (err) {
      console.error('[FRIENDREQ] Error sending friend request:', err);
    }
  };

  const handleUpdateFriendRequest = async (requestId: string, status: 'accepted' | 'declined' | 'cancelled') => {
    try {
      console.log("[FRIENDREQ] update request", { requestId, status });
      
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      console.log("[FRIENDREQ] update response", response.status, data);
      
      if (response.ok && data.ok) {
        loadFriendsAndRequests();
      } else {
        console.error("[FRIENDREQ] Failed to update request:", data.error);
      }
    } catch (err) {
      console.error('[FRIENDREQ] Error updating friend request:', err);
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, message) => {
    const date = formatDate(message.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white flex">
        {/* Conversations List / Friends List / Requests List */}
        <div className="w-1/3 border-r border-gray-700 flex flex-col">
          {/* Tab Navigation */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'messages'
                    ? 'bg-accent-primary text-black'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Messages
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'friends'
                    ? 'bg-accent-primary text-black'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Friends
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors relative ${
                  activeTab === 'requests'
                    ? 'bg-accent-primary text-black'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Requests
                {friendRequests.filter(req => req.addressee_id === user.id && req.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {friendRequests.filter(req => req.addressee_id === user.id && req.status === 'pending').length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'messages' && (
            <>
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
                </div>
              )}
              
              {!loading && (
                <div className="flex-1 overflow-y-auto">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
                        activeConversation?.id === conversation.id ? 'bg-gray-800' : ''
                      }`}
                      onClick={() => setActiveConversation(conversation)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white font-bold">
                          {conversation.title || conversation.is_group ? (
                            <UsersIcon className="w-4 h-4" />
                          ) : (
                            <UserIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {conversation.title || 'Direct Message'}
                          </h3>
                          <p className="text-sm text-gray-400 truncate">
                            {'No messages yet'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {conversation.updated_at ? new Date(conversation.updated_at).toLocaleDateString() : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'friends' && (
            <div className="flex-1 overflow-y-auto">
              {/* Search for friends */}
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers(searchQuery)}
                    className="w-full bg-gray-800 text-white rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => handleSearchUsers(searchQuery)}
                    disabled={searchLoading}
                    className="mt-2 w-full py-2 bg-accent-primary text-black rounded-lg hover:bg-accent-primary/90 disabled:opacity-50"
                  >
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                )}
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-medium mb-2">Search Results</h3>
                  <div className="space-y-2">
                    {searchResults.map((profile) => (
                      <div key={profile.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {profile.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{profile.username}</p>
                            <p className="text-sm text-gray-400">{profile.display_name}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendFriendRequest(profile.id)}
                          className="p-2 bg-accent-primary text-black rounded-full hover:bg-accent-primary/90"
                        >
                          <UserPlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friends list */}
              <div className="p-4">
                <h3 className="font-medium mb-2">Your Friends ({friends.length})</h3>
                {friends.length === 0 ? (
                  <p className="text-gray-500 text-sm">No friends yet. Search for users to add friends!</p>
                ) : (
                  <div className="space-y-2">
                    {friends.map((friend) => (
                      <div key={friend.friend_id} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {friend.profile?.username.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">{friend.profile?.username || 'Unknown User'}</p>
                            <p className="text-sm text-gray-400">{friend.profile?.display_name || 'No display name'}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Friends since {new Date(friend.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-medium mb-2">Friend Requests</h3>
                
                {/* Sent requests */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Sent Requests</h4>
                  {friendRequests.filter(req => req.requester_id === user.id).length === 0 ? (
                    <p className="text-gray-500 text-sm">No sent requests</p>
                  ) : (
                    <div className="space-y-2">
                      {friendRequests
                        .filter(req => req.requester_id === user.id)
                        .map((request) => (
                          <div key={request.id} className="p-2 bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                  {request.addressee_id.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium">User {request.addressee_id.substring(0, 8)}</p>
                                  <p className="text-sm text-gray-400 capitalize">Status: {request.status}</p>
                                </div>
                              </div>
                              {request.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateFriendRequest(request.id, 'cancelled')}
                                  className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                                >
                                  <UserXIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Received requests */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Received Requests</h4>
                  {friendRequests.filter(req => req.addressee_id === user.id && req.status === 'pending').length === 0 ? (
                    <p className="text-gray-500 text-sm">No pending requests</p>
                  ) : (
                    <div className="space-y-2">
                      {friendRequests
                        .filter(req => req.addressee_id === user.id && req.status === 'pending')
                        .map((request) => (
                          <div key={request.id} className="p-2 bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                  {request.requester_id.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium">User {request.requester_id.substring(0, 8)}</p>
                                  <p className="text-sm text-gray-400">Sent {new Date(request.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleUpdateFriendRequest(request.id, 'accepted')}
                                  className="p-1 text-green-500 hover:bg-green-500/20 rounded"
                                >
                                  <UserCheckIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateFriendRequest(request.id, 'declined')}
                                  className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                                >
                                  <UserXIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'messages' && activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white font-bold">
                    {activeConversation.title || activeConversation.is_group ? (
                      <UsersIcon className="w-4 h-4" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {activeConversation.title || 'Direct Message'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {activeConversation.is_group ? 'Group chat' : 'Direct message'}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-700">
                  <MoreVerticalIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className="text-center my-4">
                      <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full">
                        {date}
                      </span>
                    </div>
                    
                    {dateMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user.id
                              ? 'bg-accent-primary text-black'
                              : 'bg-gray-800 text-white'
                          }`}
                        >
                          <p>{message.body}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_id === user.id ? 'text-black/70' : 'text-gray-400'
                            }`}
                          >
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="px-4 py-2 text-sm text-gray-500">
                  {typingUsers.length === 1 ? (
                    <span>{typingUsers[0]} is typing...</span>
                  ) : (
                    <span>{typingUsers.length} people are typing...</span>
                  )}
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-700">
                    <PaperclipIcon className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleStartTyping();
                      }}
                      onKeyDown={handleKeyPress}
                      onBlur={handleStopTyping}
                      placeholder="Type a message..."
                      className="w-full bg-gray-800 text-white rounded-lg py-2 px-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
                      rows={1}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className={`absolute right-3 bottom-2 p-1 rounded-full ${
                        newMessage.trim()
                          ? 'text-accent-primary hover:bg-accent-primary/20'
                          : 'text-gray-500'
                      }`}
                    >
                      <SendIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'messages' ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Conversation Selected</h3>
                <p className="text-gray-500">
                  Select a conversation from the list or start a new one
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'friends' ? (
                    <UserIcon className="w-8 h-8 text-gray-600" />
                  ) : (
                    <UserPlusIcon className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                <h3 className="text-xl font-medium mb-2">
                  {activeTab === 'friends' ? 'Friends' : 'Friend Requests'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'friends' 
                    ? 'Manage your friends and search for new ones' 
                    : 'Manage your friend requests'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MessagesPage;