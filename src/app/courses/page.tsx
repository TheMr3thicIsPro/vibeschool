'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Play, Lock, Eye, CheckCircle, Clock } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import { getPublishedCourses, checkLessonAccess } from '@/services/courseService';

const CoursesPage = () => {
  const { state } = useAuthStore();
  const user = state.user;
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>('free');

  useEffect(() => {
    if (user) {
      loadCoursesAndProfile();
    }
  }, [user]);

  const loadCoursesAndProfile = async () => {
    try {
      setLoading(true);
      
      // Get user profile to check plan
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();
        
      if (profile) {
        setUserPlan(profile.plan);
      }
      
      // Get published courses
      const coursesData = await getPublishedCourses(user?.id);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = async (lessonId: string, isPreview: boolean) => {
    if (isPreview) {
      // Preview lessons are always accessible
      window.location.href = `/learn/${lessonId}`;
      return;
    }
    
    // Check if user has access based on their plan
    if (userPlan === 'member') {
      window.location.href = `/learn/${lessonId}`;
      return;
    }
    
    // Check access dynamically
    const accessResult = await checkLessonAccess(user!.id, lessonId);
    if (accessResult.hasAccess) {
      window.location.href = `/learn/${lessonId}`;
    } else {
      alert('You need a membership to access this lesson. Upgrade to unlock all content!');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Courses</h1>
            <p className="text-gray-400">Loading courses...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Courses</h1>
          
          {courses.length === 0 ? (
            <p className="text-gray-400">No courses available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="card p-6 border border-card-border bg-card-bg">
                  <h2 className="text-xl font-bold text-white mb-2">{course.title}</h2>
                  <p className="text-gray-400 mb-4">{course.description}</p>
                  
                  <div className="space-y-3">
                    {course.modules?.map((module: any) => (
                      <div key={module.id} className="border-l-2 border-accent-primary pl-3 py-2">
                        <h3 className="font-medium text-white">{module.title}</h3>
                        
                        <div className="mt-2 space-y-2">
                          {module.lessons?.map((lesson: any) => {
                            const canAccess = lesson.is_preview || userPlan === 'member';
                            
                            return (
                              <div 
                                key={lesson.id} 
                                className={`flex items-center justify-between p-2 rounded ${
                                  canAccess 
                                    ? 'bg-gray-800/50 hover:bg-gray-700/50 cursor-pointer' 
                                    : 'bg-gray-900/50 opacity-60'
                                }`}
                                onClick={() => canAccess && handleLessonClick(lesson.id, lesson.is_preview)}
                              >
                                <div className="flex items-center gap-2">
                                  {lesson.is_preview ? (
                                    <Eye size={16} className="text-blue-400" />
                                  ) : userPlan === 'member' ? (
                                    <Play size={16} className="text-accent-primary" />
                                  ) : (
                                    <Lock size={16} className="text-gray-500" />
                                  )}
                                  <span className="text-sm text-gray-300">{lesson.title}</span>
                                </div>
                                
                                {lesson.is_preview && (
                                  <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">Preview</span>
                                )}
                                
                                {!lesson.is_preview && userPlan === 'member' && (
                                  <CheckCircle size={16} className="text-green-500" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default CoursesPage;