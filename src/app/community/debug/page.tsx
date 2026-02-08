'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { getCommunityDB } from '@/community/db';

const CommunityDebugPage = () => {
  const { state } = useAuthStore();
  const user = state.user;
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDebugInfo = async () => {
      try {
        const db = await getCommunityDB();
        
        // Get basic debug info
        const info: any = {
          dbMode: db.constructor.name,
          currentUserId: user?.id || null,
          timestamp: new Date().toISOString(),
          envVars: {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
            debugCommunity: process.env.DEBUG_COMMUNITY,
          }
        };

        // If it's a local DB, get additional stats
        if (db.constructor.name === 'LocalDB') {
          // Note: This is just mock data since we can't access the private fields directly
          info.localStats = {
            profilesCount: 'N/A - Internal access',
            conversationsCount: 'N/A - Internal access',
            messagesCount: 'N/A - Internal access',
          };
        }

        setDebugInfo(info);
        setLoading(false);
      } catch (err) {
        console.error('[COMMUNITY][DEBUG] Error getting debug info:', err);
        setError('Failed to get debug info: ' + (err as Error).message);
        setLoading(false);
      }
    };

    if (user) {
      getDebugInfo();
    }
  }, [user]);

  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p className="text-gray-300">Debug page only available in development mode</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-accent-primary">Community Debug</h1>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-accent-primary">Community Debug</h1>
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-accent-primary">Community Debug</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-accent-primary">System Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-400">Database Mode</h3>
                <p className="text-white">{debugInfo?.dbMode}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-400">Current User ID</h3>
                <p className="text-white">{debugInfo?.currentUserId || 'None'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-400">Timestamp</h3>
                <p className="text-white">{debugInfo?.timestamp}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-400">Debug Enabled</h3>
                <p className="text-white">{debugInfo?.envVars.debugCommunity || 'false'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-accent-primary">Environment Variables</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">NEXT_PUBLIC_SUPABASE_URL</span>
                <span className="text-white">{debugInfo?.envVars.supabaseUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">DEBUG_COMMUNITY</span>
                <span className="text-white">{debugInfo?.envVars.debugCommunity || 'false'}</span>
              </div>
            </div>
          </div>

          {debugInfo?.localStats && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-accent-primary">Local DB Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium text-gray-400">Profiles</h3>
                  <p className="text-white">{debugInfo.localStats.profilesCount}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-400">Conversations</h3>
                  <p className="text-white">{debugInfo.localStats.conversationsCount}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-400">Messages</h3>
                  <p className="text-white">{debugInfo.localStats.messagesCount}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-accent-primary">Actions</h2>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 border border-accent-primary"
              >
                Refresh Debug Info
              </button>
              <button 
                onClick={() => console.log('[COMMUNITY] Manual debug log')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Trigger Debug Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDebugPage;