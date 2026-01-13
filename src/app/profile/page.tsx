'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/context/AuthContext';
import { updateUserProfile, uploadProfilePicture } from '@/services/profileService';
import { ensureProfile } from '@/lib/ensureProfile';
import { supabase } from '@/lib/supabase';
import { Camera, Edit3, Upload, User } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';

const ProfilePage = () => {
  const router = useRouter();
  const { state } = useAuthStore();
  const user = state.user;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    full_name: '',
    bio: '',
    avatar_url: '',
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

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
      
      setLoading(true);
      const data = await ensureProfile(supabase, user!);
      setProfile(data);
      setEditData({
        username: data.username || '',
        full_name: data.full_name || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
      });
    } catch (err: any) {
      // If profile doesn't exist, the error is expected
      // Don't show error for new users
      if (err?.message?.includes('Row not found') || err?.code === 'DATA_RETURNS_NO_ROWS') {
        console.log('Profile does not exist yet, this is expected for new users');
        // Initialize with user data from auth if profile doesn't exist
        setEditData({
          username: user?.email?.split('@')[0] || '',
          full_name: '',
          bio: '',
          avatar_url: '',
        });
      } else {
        setError('Failed to load profile');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit
      setEditData({
        username: profile?.username || '',
        full_name: profile?.full_name || '',
        bio: profile?.bio || '',
        avatar_url: profile?.avatar_url || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedProfile = await updateUserProfile(user?.id!, editData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setError('');
      
      // Broadcast the username change to other tabs and potentially other users
      if (editData.username && profile?.username !== editData.username) {
        // Store the old username to broadcast
        const oldUsername = profile?.username;
        const newUsername = editData.username;
        
        // Broadcast to other tabs using BroadcastChannel
        const profileChannel = new BroadcastChannel('profile_changes');
        profileChannel.postMessage({
          type: 'USERNAME_CHANGED',
          userId: user?.id,
          oldUsername,
          newUsername,
          timestamp: Date.now()
        });
        profileChannel.close();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Redirect to home page after logout
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
      console.error('Logout error:', err);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    try {
      setUploading(true);
      const avatarUrl = await uploadProfilePicture(user.id, file);
      
      // Update profile with new avatar URL
      const updatedProfile = await updateUserProfile(user.id, { avatar_url: avatarUrl });
      setProfile(updatedProfile);
      setEditData(prev => ({ ...prev, avatar_url: avatarUrl }));
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

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
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#0a0a0a] border border-[#2d2d2d] rounded-2xl p-8 shadow-xl shadow-[#00f3ff]/10">
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#00f3ff] shadow-lg shadow-[#00f3ff]/20"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-4 border-[#00f3ff] shadow-lg shadow-[#00f3ff]/20">
                      <User size={60} className="text-[#00f3ff]" />
                    </div>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-[#00f3ff] text-black p-2 rounded-full shadow-lg hover:bg-[#b36cff] transition-all duration-300"
                      title="Change avatar"
                    >
                      <Camera size={20} />
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                <div className="text-center w-full max-w-md">
                  <div className="mb-4">
                    <label className="text-[#00f3ff] text-sm font-semibold mb-1 block">Username</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="username"
                        value={editData.username}
                        onChange={handleInputChange}
                        className="text-3xl font-bold bg-[#0a0a0a] border-b-2 border-[#00f3ff] focus:outline-none focus:border-[#b36cff] text-white mb-2 p-2 w-full text-center"
                        required
                      />
                    ) : (
                      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#b36cff] mb-2">
                        @{profile?.username}
                      </h1>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label className="text-[#00f3ff] text-sm font-semibold mb-1 block">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="full_name"
                        value={editData.full_name}
                        onChange={handleInputChange}
                        className="text-xl text-gray-300 bg-[#0a0a0a] border-b border-[#b36cff] focus:outline-none focus:border-[#00f3ff] text-center p-1 w-full"
                      />
                    ) : (
                      <p className="text-xl text-gray-300">{profile?.full_name}</p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={handleEditToggle}
                  className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00f3ff] to-[#b36cff] text-black font-bold rounded-lg hover:from-[#b36cff] hover:to-[#00f3ff] transition-all duration-300 shadow-lg shadow-[#00f3ff]/30"
                >
                  {isEditing ? (
                    <>
                      <Upload size={20} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit3 size={20} />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
              
              <div className="mt-8 bg-[#0a0a0a] border border-[#2d2d2d] rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#b36cff]">About</h2>
                  {isEditing && (
                    <span className="text-xs text-[#b36cff] bg-[#1a1a1a] px-2 py-1 rounded">Click to edit</span>
                  )}
                </div>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={editData.bio}
                    onChange={handleInputChange}
                    className="w-full bg-[#0a0a0a] border-2 border-[#00f3ff] rounded-lg p-4 text-white focus:outline-none focus:border-[#b36cff] min-h-[120px] w-full resize-vertical"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-300 text-lg">{profile?.bio || 'No bio yet.'}</p>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#2d2d2d]">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#b36cff] mb-4">Account Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0a0a0a] border border-[#2d2d2d] rounded-xl p-4">
                    <p className="text-[#00f3ff] text-sm font-semibold mb-1">Email</p>
                    <p className="text-white">{profile?.email}</p>
                  </div>
                  <div className="bg-[#0a0a0a] border border-[#2d2d2d] rounded-xl p-4">
                    <p className="text-[#00f3ff] text-sm font-semibold mb-1">Member Since</p>
                    <p className="text-white">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {isEditing && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleSave}
                    disabled={uploading}
                    className="px-8 py-3 bg-gradient-to-r from-[#00f3ff] to-[#b36cff] text-black font-bold rounded-lg hover:from-[#b36cff] hover:to-[#00f3ff] transition-all duration-300 shadow-lg shadow-[#00f3ff]/30 disabled:opacity-50"
                  >
                    {uploading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
              
              {error && (
                <div className="mt-6 p-4 bg-red-900/20 border-2 border-red-700 rounded-xl text-red-300 text-center">
                  {error}
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-[#2d2d2d] flex justify-center">
                <button 
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default ProfilePage;