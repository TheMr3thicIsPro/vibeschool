'use client';

import React, { useState, useEffect } from 'react';
import { Profile } from '@/community/db';
import { SearchIcon, UserPlusIcon, MailIcon, BanIcon, FlagIcon, MoreHorizontalIcon } from 'lucide-react';
import { useAuthStore } from '@/context/AuthContext';

interface DiscoverTabProps {
  db: any;
  currentUser: any;
}

const DiscoverTab: React.FC<DiscoverTabProps> = ({ db, currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { state } = useAuthStore();
  const user = state.user;

  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.debug('[SEARCH] Executing search for:', searchQuery);
      // Pass currentUser.id to exclude self/friends/pending from results
      const results = await db.searchProfiles(searchQuery, currentUser?.id);
      console.debug('[SEARCH] Results returned:', results.length);
      setSearchResults(results);
    } catch (err) {
      console.error('[COMMUNITY] Error searching profiles:', err);
      setError('Failed to search profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      console.log('[FRIEND REQUEST] sending', { senderId: currentUser.id, receiverId: userId });
      
      // Optimistically update UI
      setSentRequests(prev => new Set(prev).add(userId));
      
      await db.createFriendRequest(currentUser.id, userId);
      
    } catch (err) {
      console.error('[COMMUNITY] Error sending friend request:', err);
      // Revert optimistic update
      setSentRequests(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleMessage = async (otherUserId: string) => {
    try {
      // Create a direct message conversation if it doesn't exist
      const conversations = await db.getConversations(currentUser.id);
      let dmConversation = conversations.find((conv: any) => 
        conv.is_group === false && 
        conv.members && 
        conv.members.some((member: any) => member.user_id === otherUserId)
      );

      if (!dmConversation) {
        dmConversation = await db.createConversation(false, currentUser.id, undefined, [currentUser.id, otherUserId]);
      }

      // Navigate to the conversation
      window.location.href = `/messages?conversation=${dmConversation.id}`;
    } catch (err) {
      console.error('[COMMUNITY] Error creating DM:', err);
    }
  };

  const handleBlock = async (userId: string) => {
    try {
      await db.blockUser(currentUser.id, userId);
      // Update UI to reflect the block
    } catch (err) {
      console.error('[COMMUNITY] Error blocking user:', err);
    }
  };

  const handleReport = async (userId: string) => {
    try {
      // Open report modal or navigate to report form
      alert(`Reporting user ${userId}`);
    } catch (err) {
      console.error('[COMMUNITY] Error reporting user:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
            placeholder="Search users (min 2 chars)..."
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || searchQuery.trim().length < 2}
          className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
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

      {!loading && searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Results</h2>
          {searchResults.map((profile) => (
            <div 
              key={profile.id} 
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white font-bold">
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-white">{profile.display_name}</h3>
                  <p className="text-sm text-gray-400">@{profile.username}</p>
                  <div className="flex items-center mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${profile.is_online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    <span className="text-xs text-gray-500">
                      {profile.is_online ? 'Online' : `Last seen: ${new Date(profile.last_seen_at).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {sentRequests.has(profile.id) ? (
                   <span className="text-xs text-green-500 flex items-center px-2">Request Sent</span>
                ) : (
                  <button
                    onClick={() => handleAddFriend(profile.id)}
                    className="p-2 rounded-full bg-gray-700 hover:bg-accent-primary hover:text-white transition-colors border border-accent-primary"
                    title="Add Friend"
                  >
                    <UserPlusIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleMessage(profile.id)}
                  className="p-2 rounded-full bg-gray-700 hover:bg-blue-600 transition-colors"
                  title="Send Message"
                >
                  <MailIcon className="w-4 h-4" />
                </button>
                
                {/* More options dropdown */}
                <div className="relative group">
                  <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
                    <MoreHorizontalIcon className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 hidden group-hover:block z-10">
                    <button
                      onClick={() => handleBlock(profile.id)}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/50 flex items-center"
                    >
                      <BanIcon className="w-4 h-4 mr-2" />
                      Block User
                    </button>
                    <button
                      onClick={() => handleReport(profile.id)}
                      className="w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-900/50 flex items-center"
                    >
                      <FlagIcon className="w-4 h-4 mr-2" />
                      Report User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && searchQuery && searchResults.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          No users found matching "{searchQuery}"
        </div>
      )}

      {!searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <p>Enter a username or display name to search for users</p>
        </div>
      )}
    </div>
  );
};

export default DiscoverTab;