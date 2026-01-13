'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';

const AdminPage = () => {
  const { state } = useAuthStore();
  const user = state.user;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
            <p className="text-gray-400">Loading...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (!profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <p className="text-red-300">You do not have permission to access this page.</p>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
          
          <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg w-fit">
            <button 
              onClick={() => setActiveTab('courses')} 
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'courses' ? 'bg-accent-primary text-black' : 'text-gray-300 hover:text-white'}`}
            >
              Manage Courses
            </button>
            <button 
              onClick={() => setActiveTab('announcements')} 
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'announcements' ? 'bg-accent-primary text-black' : 'text-gray-300 hover:text-white'}`}
            >
              Announcements
            </button>
            {profile.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('users')} 
                className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'users' ? 'bg-accent-primary text-black' : 'text-gray-300 hover:text-white'}`}
              >
                User Management
              </button>
            )}
          </div>
          
          {activeTab === 'courses' && (
            <div className="card p-6 border border-card-border">
              <h2 className="text-xl font-bold text-white mb-4">Course Management</h2>
              <p className="text-gray-400">Course management tools coming soon.</p>
              <p className="text-gray-500 text-sm mt-2">Create, edit, and organize courses, modules, and lessons.</p>
            </div>
          )}
          
          {activeTab === 'announcements' && (
            <div className="card p-6 border border-card-border">
              <h2 className="text-xl font-bold text-white mb-4">Manage Announcements</h2>
              <p className="text-gray-400">Create and manage announcements for users.</p>
              <p className="text-gray-500 text-sm mt-2">Announcements will appear on the dashboard for all users.</p>
            </div>
          )}
          
          {activeTab === 'users' && profile.role === 'admin' && (
            <div className="card p-6 border border-card-border">
              <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
              <p className="text-gray-400">Manage user roles and subscriptions.</p>
              <p className="text-gray-500 text-sm mt-2">Search users, assign roles, and manage plans.</p>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default AdminPage;