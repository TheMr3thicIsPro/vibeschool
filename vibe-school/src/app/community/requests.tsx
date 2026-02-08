'use client';

import React, { useState, useEffect } from 'react';
import { FriendRequest } from '@/community/db';
import { CheckIcon, XIcon, UserXIcon } from 'lucide-react';
import { useAuthStore } from '@/context/AuthContext';

interface RequestsTabProps {
  db: any;
  currentUser: any;
}

const RequestsTab: React.FC<RequestsTabProps> = ({ db, currentUser }) => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { state } = useAuthStore();
  const user = state.user;

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const requestsList = await db.getFriendRequests(currentUser.id);
        // Filter to only show pending requests
        const pendingRequests = requestsList.filter((req: any) => req.status === 'pending');
        setRequests(pendingRequests);

        // Fetch profiles for all requesters/addressees
        const requestProfiles: Record<string, any> = {};
        for (const request of pendingRequests) {
          const otherUserId = request.requester_id === currentUser.id 
            ? request.addressee_id 
            : request.requester_id;
          const profile = await db.getProfile(otherUserId);
          if (profile) {
            requestProfiles[otherUserId] = profile;
          }
        }
        setProfiles(requestProfiles);
        setLoading(false);
      } catch (err) {
        console.error('[COMMUNITY] Error loading friend requests:', err);
        setError('Failed to load friend requests');
        setLoading(false);
      }
    };

    if (currentUser) {
      loadRequests();
    }
  }, [db, currentUser]);

  const handleAcceptRequest = async (requestId: string, requesterId: string) => {
    try {
      await db.updateFriendRequest(requestId, 'accepted');
      // Update UI to remove request
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      console.error('[COMMUNITY] Error accepting friend request:', err);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await db.updateFriendRequest(requestId, 'declined');
      // Update UI to remove request
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      console.error('[COMMUNITY] Error declining friend request:', err);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await db.updateFriendRequest(requestId, 'cancelled');
      // Update UI to remove request
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      console.error('[COMMUNITY] Error cancelling friend request:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Friend Requests</h2>
        <span className="bg-accent-primary/20 text-accent-primary px-3 py-1 rounded-full text-sm">
          {requests.length} {requests.length === 1 ? 'request' : 'requests'}
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

      {!loading && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((request) => {
            const isOutgoing = request.requester_id === currentUser.id;
            const otherUserId = isOutgoing ? request.addressee_id : request.requester_id;
            const profile = profiles[otherUserId];
            
            return (
              <div 
                key={request.id} 
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white font-bold">
                    {profile?.display_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      {profile?.display_name || 'Unknown User'} 
                      {isOutgoing ? ' (Sent)' : ' (Received)'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      @{profile?.username || 'unknown'} • {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {isOutgoing ? (
                    <button
                      onClick={() => handleCancelRequest(request.id)}
                      className="p-2 rounded-full bg-gray-700 hover:bg-red-600 transition-colors"
                      title="Cancel Request"
                    >
                      <UserXIcon className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAcceptRequest(request.id, request.requester_id)}
                        className="p-2 rounded-full bg-gray-700 hover:bg-green-600 transition-colors"
                        title="Accept Request"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="p-2 rounded-full bg-gray-700 hover:bg-red-600 transition-colors"
                        title="Decline Request"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && requests.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          <UserXIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p>No pending friend requests</p>
          <p className="text-sm mt-2">Friend requests will appear here</p>
        </div>
      )}
    </div>
  );
};

export default RequestsTab;