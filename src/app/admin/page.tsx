'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import CourseList from '@/components/admin/CourseList';
import ModuleList from '@/components/admin/ModuleList';
import LessonList from '@/components/admin/LessonList';
import LessonEditor from '@/components/admin/LessonEditor';
import AnnouncementManager from '@/components/admin/AnnouncementManager';
import UserManager from '@/components/admin/UserManager';
import { Lesson } from '@/types/course';

const AdminPage = () => {
  const { state } = useAuthStore();
  const user = state.user;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  
  // Course management state
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonEditorOpen, setLessonEditorOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  // State for lesson editing
  const [lessons, setLessons] = useState<Lesson[]>([]);

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
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
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
                      if (selectedCourseId) {
                        setSelectedCourseId(selectedCourseId);
                      }
                    }}
                    onCourseUpdated={() => {
                      // Refresh modules if current course was updated
                      if (selectedCourseId) {
                        setSelectedCourseId(selectedCourseId);
                      }
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
                      if (selectedCourseId) {
                        setSelectedModuleId(selectedModuleId);
                      }
                    }}
                    onModuleUpdated={() => {
                      // Refresh lessons if current module was updated
                      if (selectedModuleId) {
                        setSelectedModuleId(selectedModuleId);
                      }
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
                      if (selectedModuleId) {
                        // Force refresh by temporarily clearing the module selection
                        const tempModuleId = selectedModuleId;
                        setSelectedModuleId(null);
                        setTimeout(() => setSelectedModuleId(tempModuleId), 100);
                      }
                    }}
                    onLessonUpdated={() => {}}
                    onEditLesson={handleEditLesson}
                  />
                  
                  {/* Add Lesson Button */}
                  {selectedModuleId && (
                    <div className="p-4 border-t border-gray-700">
                      <button
                        onClick={() => handleCreateLesson(selectedModuleId)}
                        className="w-full bg-accent-primary hover:bg-accent-primary/90 text-black py-2 rounded-md font-medium transition-colors"
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
          
          {activeTab === 'users' && profile.role === 'admin' && (
            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
              <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                <UserManager />
              </div>
            </div>
          )}
        </div>
        
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
    </ProtectedRoute>
  );
};

export default AdminPage;