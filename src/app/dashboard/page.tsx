'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { ensureProfile } from '@/lib/ensureProfile';
import { supabase } from '@/lib/supabase';
import { BookOpen, Calendar, TrendingUp, Award } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';

const DashboardPage = () => {
  const { state } = useAuthStore();
  const user = state.user;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const didRun = useRef(false)

  useEffect(() => {
    if (!user) return
    if (didRun.current) return
    didRun.current = true

    ;(async () => {
      try {
        // Check for valid session before trying to ensure profile
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
        const session = sessionData?.session

        if (!session?.access_token) {
          console.warn("No session yet, skipping profile ensure for now")
          setLoading(false)
          return
        }
        
        const profile = await ensureProfile(supabase, user)
        setProfile(profile)
      } catch (e) {
        console.error("Failed to ensure profile", e)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, supabase]);

  const fetchProfile = async () => {
    try {
      // Check for valid session before trying to ensure profile
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session?.access_token) {
        console.warn("No session yet, skipping profile ensure for now")
        setLoading(false)
        return
      }
      
      console.log('fetchProfile: Attempting to ensure profile for user:', user?.id);
      const data = await ensureProfile(supabase, user!);
      console.log('fetchProfile: Got profile data:', data);
      setProfile(data);
    } catch (err: any) {
      console.log('fetchProfile: Error caught:', err);
      // If profile doesn't exist, the error is expected
      // Don't log if it's the 'Row not found' error
      if (err?.message?.includes('Row not found') || err?.code === 'DATA_RETURNS_NO_ROWS') {
        console.log('Profile does not exist yet, this is expected for new users');
      } else {
        console.error('Failed to load profile:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock data for dashboard
  const stats = [
    { name: 'Progress', value: '42%', icon: TrendingUp },
    { name: 'Lessons Completed', value: '12', icon: Award },
    { name: 'Current Module', value: 'Basics', icon: BookOpen },
    { name: 'Joined', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A', icon: Calendar },
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex items-center justify-center h-full">
            <div className="text-2xl font-bold text-accent-primary">Loading...</div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome back, {profile?.username || user?.email?.split('@')[0]}!</h1>
            <p className="text-gray-400">Continue your journey in AI coding</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="card p-6 border border-card-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.name}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-full bg-accent-primary/10">
                      <Icon className="text-accent-primary" size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Learning Section */}
          <div className="card p-6 border border-card-border mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Continue Learning</h2>
              <button className="text-accent-primary hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-card-bg rounded-lg border border-card-border hover:border-accent-primary transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-white">Prompting Fundamentals</h3>
                  <p className="text-gray-400 text-sm">Module 1 • Lesson 3</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div className="bg-accent-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm text-gray-400">65%</span>
                  <button className="ml-4 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors">
                    Continue
                  </button>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-card-bg rounded-lg border border-card-border hover:border-accent-primary transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-white">Making Your First Game</h3>
                  <p className="text-gray-400 text-sm">Module 2 • Lesson 1</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div className="bg-accent-primary h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  <span className="text-sm text-gray-400">30%</span>
                  <button className="ml-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="card p-6 border border-card-border">
            <h2 className="text-xl font-bold text-white mb-4">Announcements</h2>
            <div className="space-y-4">
              <div className="p-4 bg-card-bg rounded-lg border border-card-border">
                <h3 className="font-medium text-white">New Module Released: Advanced Prompting</h3>
                <p className="text-gray-400 text-sm mt-2">Check out our latest module on advanced prompting techniques.</p>
                <p className="text-gray-500 text-xs mt-2">Posted 2 days ago</p>
              </div>
              <div className="p-4 bg-card-bg rounded-lg border border-card-border">
                <h3 className="font-medium text-white">Community Challenge: Build an AI Assistant</h3>
                <p className="text-gray-400 text-sm mt-2">Join our monthly challenge and showcase your skills.</p>
                <p className="text-gray-500 text-xs mt-2">Posted 1 week ago</p>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default DashboardPage;