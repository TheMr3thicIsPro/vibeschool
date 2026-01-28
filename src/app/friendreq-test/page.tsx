'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { getCommunityDB } from '@/community/db';

const FriendRequestTestPage = () => {
  const { state } = useAuthStore();
  const user = state.user;
  const [toUserId, setToUserId] = useState('');
  const [response, setResponse] = useState<string>('');
  const [requests, setRequests] = useState<any>(null);
  const [friends, setFriends] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [db, setDb] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const communityDb = await getCommunityDB();
      setDb(communityDb);
    };
    init();
  }, []);

  const handleSendRequest = async () => {
    if (!toUserId || !user) return;

    try {
      setLoading(true);
      console.log("[FRIENDREQ] send to", toUserId);
      
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId })
      });
      
      const data = await response.json();
      console.log("[FRIENDREQ] response", response.status, data);
      
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[FRIENDREQ] Error sending friend request:', error);
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/friends/requests');
      const data = await response.json();
      setRequests(data);
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[FRIENDREQ] Error getting requests:', error);
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetFriends = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/friends');
      const data = await response.json();
      setFriends(data);
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[FRIENDREQ] Error getting friends:', error);
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Friend Request Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">User Info</h2>
            <div className="mb-4">
              <p className="text-gray-300"><strong>Current User ID:</strong> {user?.id || 'Not logged in'}</p>
              <p className="text-gray-300"><strong>Current Username:</strong> {user?.username || 'Not logged in'}</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">To User ID:</label>
              <input
                type="text"
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                placeholder="Enter user ID to send request to"
                className="w-full bg-gray-700 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
            
            <button
              onClick={handleSendRequest}
              disabled={loading || !toUserId || !user}
              className="w-full py-2 bg-accent-primary text-black rounded-lg hover:bg-accent-primary/90 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'SEND REQUEST'}
            </button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={handleGetRequests}
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
              >
                GET REQUESTS
              </button>
              <button
                onClick={handleGetFriends}
                disabled={loading}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50"
              >
                GET FRIENDS
              </button>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Last Response:</h3>
              <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto max-h-60">
                {response || 'No response yet'}
              </pre>
            </div>
          </div>
        </div>
        
        {requests && (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Recent Requests</h2>
            <div className="overflow-auto">
              <pre className="text-sm">
                {JSON.stringify(requests, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {friends && (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Friends List</h2>
            <div className="overflow-auto">
              <pre className="text-sm">
                {JSON.stringify(friends, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequestTestPage;