'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { ensureProfile } from '@/lib/ensureProfile';
import { supabase } from '@/lib/supabase';
import { BookOpen, Calendar, TrendingUp, Award, Users, Settings } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import { getPublishedCourses, getUserProfile, getLatestAnnouncements } from '@/services/courseService';

const DashboardPage = () => {
  const { state } = useAuthStore();
  const user = state.user;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    progressPercent: 0,
    lessonsCompleted: 0,
    currentModule: 'Start a course',
    joined: 'N/A'
  });
  const [continueLearningItems, setContinueLearningItems] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

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
        
        // Load dashboard data
        await loadDashboardData(profile, user.id);
      } catch (e) {
        console.error("Failed to ensure profile", e)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, supabase]);

  const loadDashboardData = async (profile: any, userId: string) => {
    try {
      // Debug print to show account role and plan
      console.log('DEBUG: Account role and plan:', {
        userId: userId,
        role: profile?.role,
        plan: profile?.plan,
        username: profile?.username
      });
      
      // Load announcements
      const announcementsData = await getLatestAnnouncements(10);
      setAnnouncements(announcementsData);
      
      // Set the joined date
      setDashboardStats(prev => ({
        ...prev,
        joined: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'
      }));
      
      // TODO: Calculate actual progress based on user's lesson completion
      // For now, setting placeholder values
      // In a real implementation, this would involve querying user_lesson_progress
      
      // Calculate progress percentage based on all published lessons the user has access to
      const courses = await getPublishedCourses();
      let totalLessons = 0;
      let completedLessons = 0;
      
      // This would need to be implemented with a query to user_lesson_progress
      // For now, we'll use a placeholder calculation
      
      // Get user's lesson progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', userId);
        
      if (progressData) {
        completedLessons = progressData.filter((p: any) => p.completed).length;
        
        // Count total published lessons
        for (const course of courses) {
          for (const module of course.modules || []) {
            totalLessons += (module.lessons || []).length;
          }
        }
        
        const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        
        setDashboardStats(prev => ({
          ...prev,
          progressPercent,
          lessonsCompleted: completedLessons
        }));
      }
      
      // Get most recently active course/module for "Current Module"
      const { data: recentProgress, error: recentError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);
        
      if (recentProgress && recentProgress.length > 0) {
        const lessonId = recentProgress[0].lesson_id;
        
        // Get the lesson and its module separately
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('modules (title)')
          .eq('id', lessonId)
          .single();
          
        if (lessonData && lessonData.modules && lessonData.modules[0]) {
          const moduleTitle = lessonData.modules[0].title || 'Start a course';
          setDashboardStats(prev => ({
            ...prev,
            currentModule: moduleTitle
          }));
        }
      }
      
      // Get continue learning items (most recently active lessons)
      const { data: continueLearningData, error: continueLearningError } = await supabase
        .from('user_lesson_progress')
        .select(`
          lesson_id,
          last_position_seconds,
          completed,
          updated_at
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(2);
        
      if (continueLearningData) {
        // Get lesson details separately for each item
        const detailedItems = [];
        for (const item of continueLearningData) {
          const { data: lessonDetail, error: lessonError } = await supabase
            .from('lessons')
            .select('id, title, module_id')
            .eq('id', item.lesson_id)
            .single();
            
          if (lessonDetail) {
            // Get module details
            const { data: moduleDetail, error: moduleError } = await supabase
              .from('modules')
              .select('id, title, course_id')
              .eq('id', lessonDetail.module_id)
              .single();
              
            // Get course details
            const { data: courseDetail, error: courseError } = await supabase
              .from('courses')
              .select('id, title')
              .eq('id', moduleDetail?.course_id)
              .single();
              
            detailedItems.push({
              ...item,
              lessons: {
                id: lessonDetail.id,
                title: lessonDetail.title,
                modules: moduleDetail,
                courses: courseDetail
              }
            });
          }
        }
        setContinueLearningItems(detailedItems);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

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
      
      // Reload dashboard data with new profile
      if (user?.id) {
        await loadDashboardData(data, user.id);
      }
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

  // Determine if user is admin or teacher to show admin tab
  const isAdminOrTeacher = profile && (profile.role === 'admin' || profile.role === 'teacher');
  
  // Stats for dashboard
  const stats = [
    { name: 'Progress', value: `${dashboardStats.progressPercent}%`, icon: TrendingUp },
    { name: 'Lessons Completed', value: `${dashboardStats.lessonsCompleted} completed`, icon: Award },
    { name: 'Current Module', value: dashboardStats.currentModule, icon: BookOpen },
    { name: 'Joined', value: dashboardStats.joined, icon: Calendar },
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

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg w-fit">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-accent-primary text-black' : 'text-gray-300 hover:text-white'}`}
            >
              Dashboard
            </button>
            {isAdminOrTeacher && (
              <button 
                onClick={() => setActiveTab('admin')} 
                className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'admin' ? 'bg-accent-primary text-black' : 'text-gray-300 hover:text-white'}`}
              >
                Admin
              </button>
            )}
          </div>
          
          {activeTab === 'dashboard' && (
            <>
              {/* Continue Learning Section */}
              <div className="card p-6 border border-card-border mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Continue Learning</h2>
                  <button className="text-accent-primary hover:underline">View All</button>
                </div>
                
                <div className="space-y-4">
                  {continueLearningItems.length > 0 ? (
                    continueLearningItems.map((item, index) => (
                      <div key={index} className="flex items-center p-4 bg-card-bg rounded-lg border border-card-border hover:border-accent-primary transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{item.lessons?.title || 'Loading...'}</h3>
                          <p className="text-gray-400 text-sm">{item.lessons?.modules?.title || 'Module'} • {item.lessons?.courses?.title || 'Course'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div className="bg-accent-primary h-2 rounded-full" style={{ width: item.completed ? '100%' : `${Math.min(95, Math.floor((item.last_position_seconds || 0) / 100))}%` }}></div>
                          </div>
                          <span className="text-sm text-gray-400">{item.completed ? 'Completed' : `${Math.min(95, Math.floor((item.last_position_seconds || 0) / 100))}%`}</span>
                          <button className="ml-4 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors">
                            Continue
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No ongoing lessons. Start a course to begin learning!</p>
                  )}
                </div>
              </div>

              {/* Announcements */}
              <div className="card p-6 border border-card-border">
                <h2 className="text-xl font-bold text-white mb-4">Announcements</h2>
                <div className="space-y-4">
                  {announcements.length > 0 ? (
                    announcements.map((announcement, index) => (
                      <div key={index} className="p-4 bg-card-bg rounded-lg border border-card-border">
                        <h3 className="font-medium text-white">{announcement.title}</h3>
                        <p className="text-gray-400 text-sm mt-2">{announcement.body}</p>
                        <p className="text-gray-500 text-xs mt-2">Posted {new Date(announcement.created_at).toLocaleDateString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No announcements yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'admin' && isAdminOrTeacher && (
            <div className="card p-6 border border-card-border">
              <h2 className="text-xl font-bold text-white mb-4">Admin Panel</h2>
              <p className="text-gray-400">Admin tools coming soon. Create courses, modules, and manage content.</p>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default DashboardPage;