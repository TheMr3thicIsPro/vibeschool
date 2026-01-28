'use client';

import React, { useState, useEffect } from 'react';
import { Friend } from '@/community/db';
import { UsersIcon, UserMinusIcon, MailIcon } from 'lucide-react';
import { useAuthStore } from '@/context/AuthContext';

interface FriendsTabProps {
  db: any;
  currentUser: any;
}

const FriendsTab: React.FC<FriendsTabProps> = ({ db, currentUser }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { state } = useAuthStore();
  const user = state.user;

  useEffect(() => {
    const loadFriends = async () => {
      try {
        setLoading(true);
        const friendsList = await db.getFriends(currentUser.id);
        setFriends(friendsList);

        // Fetch profiles for all friends
        const friendProfiles: Record<string, any> = {};
        for (const friend of friendsList) {
          const profile = await db.getProfile(friend.friend_id);
          if (profile) {
            friendProfiles[friend.friend_id] = profile;
          }
        }
        setProfiles(friendProfiles);
        setLoading(false);
      } catch (err) {
        console.error('[COMMUNITY] Error loading friends:', err);
        setError('Failed to load friends');
        setLoading(false);
      }
    };

    if (currentUser) {
      loadFriends();
    }
  }, [db, currentUser]);

  const handleUnfriend = async (friendId: string) => {
    try {
      await db.unfriend(currentUser.id, friendId);
      // Update UI to remove friend
      setFriends(prev => prev.filter(f => f.friend_id !== friendId));
      setProfiles(prev => {
        const newProfiles = {...prev};
        delete newProfiles[friendId];
        return newProfiles;
      });
    } catch (err) {
      console.error('[COMMUNITY] Error unfriending user:', err);
    }
  };

  const handleMessage = async (friendId: string) => {
    try {
      // Create a direct message conversation if it doesn't exist
      const conversations = await db.getConversations(currentUser.id);
      let dmConversation = conversations.find((conv: any) => 
        conv.is_group === false && 
        conv.members && 
        conv.members.some((member: any) => member.user_id === friendId)
      );

      if (!dmConversation) {
        dmConversation = await db.createConversation(false, currentUser.id, undefined, [currentUser.id, friendId]);
      }

      // Navigate to the conversation
      window.location.href = `/messages?conversation=${dmConversation.id}`;
    } catch (err) {
      console.error('[COMMUNITY] Error creating DM:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Friends</h2>
        <span className="bg-accent-primary/20 text-accent-primary px-3 py-1 rounded-full text-sm">
          {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
        </span>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        </div>
      )}

      {!loading && friends.length > 0 && (
        <div className="space-y-4">
          {friends.map((friend) => {
            const profile = profiles[friend.friend_id];
            return (
              <div 
                key={friend.friend_id} 
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white font-bold">
                    {profile?.display_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{profile?.display_name || 'Unknown User'}</h3>
                    <p className="text-sm text-gray-400">@{profile?.username || 'unknown'}</p>
                    <div className="flex items-center mt-1">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${profile?.is_online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                      <span className="text-xs text-gray-500">
                        {profile?.is_online ? 'Online' : `Last seen: ${profile ? new Date(profile.last_seen_at).toLocaleString() : 'N/A'}`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMessage(friend.friend_id)}
                    className="p-2 rounded-full bg-gray-700 hover:bg-blue-600 transition-colors"
                    title="Send Message"
                  >
                    <MailIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUnfriend(friend.friend_id)}
                    className="p-2 rounded-full bg-gray-700 hover:bg-red-600 transition-colors"
                    title="Unfriend"
                  >
                    <UserMinusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && friends.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          <UsersIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p>You don't have any friends yet</p>
          <p className="text-sm mt-2">Search for users to add friends</p>
        </div>
      )}
    </div>
  );
};

export default FriendsTab;