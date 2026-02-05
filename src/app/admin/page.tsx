'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import AppShell from '@/components/layout/AppShell';
import CourseList from '@/components/admin/CourseList';
import ModuleList from '@/components/admin/ModuleList';
import LessonList from '@/components/admin/LessonList';
import LessonEditor from '@/components/admin/LessonEditor';
import AnnouncementManager from '@/components/admin/AnnouncementManager';
import UserManager from '@/components/admin/UserManager';
import { Lesson } from '@/types/course';
// Add Challenges manager import
import ChallengeManager from '@/components/admin/ChallengeManager';
import LessonReviewsAdmin from '@/components/admin/LessonReviewsAdmin';

const AdminPage = () => {
  const { state } = useAuthStore();
  const user = state.user;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  
  // Add state for password protection
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(true);
  
  // Check if password is correct (hardcoded for now)
  const checkPassword = () => {
    if (password === '0026') {
      setShowPasswordInput(false);
    } else {
      alert('Incorrect password');
    }
  };
  
  // Course management state
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonEditorOpen, setLessonEditorOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  // State for lesson editing
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Add debug prints to track course creation
  useEffect(() => {
    console.log('DEBUG: Admin page rendered, activeTab:', activeTab);
    console.log('DEBUG: Selected IDs - Course:', selectedCourseId, 'Module:', selectedModuleId, 'Lesson:', selectedLessonId);
  }, [activeTab, selectedCourseId, selectedModuleId, selectedLessonId]);

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
      
      // Debug print to show account role and plan
      console.log('DEBUG: Admin page - Account role and plan:', {
        userId: user.id,
        role: data?.role,
        plan: data?.plan,
        username: data?.username
      });
      
      // TEMPORARY: Update role to admin if not already set (for debugging purposes)
      if (data?.role !== 'admin' && data?.role !== 'teacher') {
        console.log('DEBUG: User does not have admin/teacher role. Showing role update option.');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Temporary function to update user role to admin (for debugging)
  const updateRoleToAdmin = async () => {
    if (!user || !profile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Refresh the profile
      fetchProfile();
      alert('Role updated to admin. Please refresh the page.');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error updating role');
    }
  };

  const handleCreateLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setEditingLesson(null);
    setLessonEditorOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonEditorOpen(true);
  };

  const handleLessonSaved = (lesson: Lesson) => {
    // Update the selected lesson if it was edited
    if (selectedLessonId === lesson.id) {
      setSelectedLessonId(lesson.id);
    }
  };

  const handleLessonCreated = (lesson: Lesson) => {
    // Select the newly created lesson
    setSelectedLessonId(lesson.id);
  };
  
  // Function to trigger refresh of public UI
  const triggerPublicUIRefresh = () => {
    // In a real app, this would call router.refresh or similar
    // For now, we'll rely on the client-side cache invalidation
    console.log('Triggering public UI refresh');
    
    // We could potentially use router.refresh() if needed
    // router.refresh();
  };

  if (loading) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
          <p className="text-gray-400">Loading...</p>
        </div>
      </AppShell>
    );
  }

  // Allow access if user has admin/teacher role OR if we're in development mode allowing role updates
  const hasAdminAccess = profile && (profile.role === 'admin' || profile.role === 'teacher');
  
  // If user doesn't have proper role, show a message with option to update role (temporary for debugging)
  if (!hasAdminAccess) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-4">
            <p className="text-yellow-300">You do not have admin access yet. Your role is: {profile?.role || 'not set'}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={updateRoleToAdmin}
              className="px-4 py-2 bg-accent-primary text-white rounded-md font-medium hover:bg-accent-primary/90 transition-colors border border-accent-primary"
            >
              Grant Admin Access (Temporary)
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {showPasswordInput ? (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-screen">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Admin Panel Access</h1>
            <p className="text-gray-300 mb-6 text-center">Enter the admin password to continue</p>
            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
              <button
                onClick={checkPassword}
                className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white py-3 rounded-md font-medium transition-colors hover-lift border border-accent-primary"
              >
                Enter Admin Panel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
          
          <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg w-fit">
            <button 
              onClick={() => {
                setActiveTab('courses');
                // Reset selection when switching tabs
                setSelectedCourseId(null);
                setSelectedModuleId(null);
                setSelectedLessonId(null);
              }}
              className={`px-4 py-2 rounded-md transition-colors hover-lift ${activeTab === 'courses' ? 'bg-accent-primary text-white border border-accent-primary' : 'text-gray-300 hover:text-white'}`}
            >
              Manage Courses
            </button>
            <button 
              onClick={() => setActiveTab('announcements')} 
              className={`px-4 py-2 rounded-md transition-colors hover-lift ${activeTab === 'announcements' ? 'bg-accent-primary text-white border border-accent-primary' : 'text-gray-300 hover:text-white'}`}
            >
              Announcements
            </button>
            {profile?.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('challenges')} 
                className={`px-4 py-2 rounded-md transition-colors hover-lift ${activeTab === 'challenges' ? 'bg-accent-primary text-white border border-accent-primary' : 'text-gray-300 hover:text-white'}`}
              >
                Challenges
              </button>
            )}
            {profile?.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('reviews')} 
                className={`px-4 py-2 rounded-md transition-colors hover-lift ${activeTab === 'reviews' ? 'bg-accent-primary text-white border border-accent-primary' : 'text-gray-300 hover:text-white'}`}
              >
                Lesson Reviews
              </button>
            )}
            {profile?.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('users')} 
                className={`px-4 py-2 rounded-md transition-colors hover-lift ${activeTab === 'users' ? 'bg-accent-primary text-white border border-accent-primary' : 'text-gray-300 hover:text-white'}`}
              >
                User Management
              </button>
            )}
          </div>
          
          {activeTab === 'courses' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Course management interface */}
              <div className="flex-1 flex gap-4">
                {/* Course List Column */}
                <div className="w-1/3 flex flex-col">
                  <CourseList 
                    selectedCourseId={selectedCourseId}
                    onSelectCourse={(id) => {
                      setSelectedCourseId(id);
                      setSelectedModuleId(null);
                      setSelectedLessonId(null);
                    }}
                    onCourseCreated={() => {
                      // Refresh the course list when a new course is created
                      console.log('DEBUG: Course created, triggering refresh');
                      if (selectedCourseId) {
                        setSelectedCourseId(selectedCourseId);
                      }
                    }}
                    onCourseUpdated={() => {
                      // Refresh modules if current course was updated
                      console.log('DEBUG: Course updated, triggering refresh');
                      if (selectedCourseId) {
                        setSelectedCourseId(selectedCourseId);
                      }
                      
                      // Trigger public UI refresh after course update
                      triggerPublicUIRefresh();
                    }}
                  />
                </div>
                
                {/* Module List Column */}
                <div className="w-1/3 flex flex-col">
                  <ModuleList 
                    courseId={selectedCourseId}
                    selectedModuleId={selectedModuleId}
                    onSelectModule={(id) => {
                      setSelectedModuleId(id);
                      setSelectedLessonId(null);
                    }}
                    onModuleCreated={() => {
                      // Refresh the module list when a new module is created
                      console.log('DEBUG: Module created, triggering refresh');
                      if (selectedCourseId) {
                        setSelectedModuleId(selectedModuleId);
                      }
                    }}
                    onModuleUpdated={() => {
                      // Refresh lessons if current module was updated
                      console.log('DEBUG: Module updated, triggering refresh');
                      if (selectedModuleId) {
                        setSelectedModuleId(selectedModuleId);
                      }
                      
                      // Trigger public UI refresh after module update
                      triggerPublicUIRefresh();
                    }}
                  />
                </div>
                
                {/* Lesson List Column */}
                <div className="w-1/3 flex flex-col">
                  <LessonList 
                    moduleId={selectedModuleId}
                    selectedLessonId={selectedLessonId}
                    onSelectLesson={(id) => setSelectedLessonId(id)}
                    onLessonCreated={() => {
                      // Refresh lessons when a new lesson is created
                      console.log('DEBUG: Lesson created, triggering refresh');
                      if (selectedModuleId) {
                        // Force refresh by temporarily clearing the module selection
                        const tempModuleId = selectedModuleId;
                        setSelectedModuleId(null);
                        setTimeout(() => setSelectedModuleId(tempModuleId), 100);
                      }
                      
                      // Trigger public UI refresh after lesson creation
                      triggerPublicUIRefresh();
                    }}
                    onLessonUpdated={() => {}}
                    onEditLesson={handleEditLesson}
                  />
                  
                  {/* Add Lesson Button */}
                  {selectedModuleId && (
                    <div className="p-4 border-t border-gray-700">
                      <button
                        onClick={() => handleCreateLesson(selectedModuleId)}
                        className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white py-2 rounded-md font-medium transition-colors hover-lift border border-accent-primary"
                      >
                        + Add Lesson
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'announcements' && (
            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-xl font-bold text-white mb-4">Manage Announcements</h2>
              <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                <AnnouncementManager />
              </div>
            </div>
          )}
          
          {activeTab === 'challenges' && profile?.role === 'admin' && (
            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-xl font-bold text-white mb-4">Manage Challenges</h2>
              <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg overflow-auto min-h-0">
                <ChallengeManager />
              </div>
            </div>
          )}
          {activeTab === 'reviews' && profile?.role === 'admin' && (
            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-xl font-bold text-white mb-4">Lesson Reviews</h2>
              <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg overflow-auto min-h-0">
                <LessonReviewsAdmin />
              </div>
            </div>
          )}
          
          {activeTab === 'users' && profile?.role === 'admin' && (
            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
              <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                <UserManager />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Lesson Editor Modal */}
      {lessonEditorOpen && (
        <LessonEditor
          lesson={editingLesson}
          moduleId={selectedModuleId}
          onSave={handleLessonSaved}
          onCreate={handleLessonCreated}
          onClose={() => {
            setLessonEditorOpen(false);
            setEditingLesson(null);
          }}
        />
      )}
    </AppShell>
  );
};

export default AdminPage;