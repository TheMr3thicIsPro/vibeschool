'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Play, Lock, Eye, CheckCircle, Clock, BookOpen } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import { listCourses, getCourseProgress, checkLessonAccess } from '@/services/courseNavigationService';

const CoursesPage = () => {
  const { state } = useAuthStore();
  const user = state.user;
  const router = useRouter();
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
      const coursesData = await listCourses();
      
      // Add progress to each course
      const coursesWithProgress = [];
      for (const course of coursesData) {
        const progress = await getCourseProgress(user.id, course.id);
        coursesWithProgress.push({ ...course, progress });
      }
      
      setCourses(coursesWithProgress);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  const handleLessonClick = async (lessonId: string, isPreview: boolean) => {
    if (isPreview) {
      // Preview lessons are always accessible
      router.push(`/learn/${lessonId}`);
      return;
    }
    
    // Check if user has access based on their plan
    if (userPlan === 'member') {
      router.push(`/learn/${lessonId}`);
      return;
    }
    
    // Check access dynamically
    const accessResult = await checkLessonAccess(user!.id, lessonId);
    if (accessResult.hasAccess) {
      router.push(`/learn/${lessonId}`);
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
          
          {/* Debug helper */}
          <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
            <p>Debug: Showing {courses.length} published courses (is_published = true)</p>
          </div>
          
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No courses available yet.</p>
              <p className="text-gray-500 mt-2">Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className="card p-6 border border-card-border bg-card-bg hover:border-accent-primary transition-colors cursor-pointer"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-white">{course.title}</h2>
                    {course.progress && (
                      <div className="text-right">
                        <div className="text-sm text-gray-400">{course.progress.progress_percent}%</div>
                        <div className="w-16 bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-accent-primary h-2 rounded-full" 
                            style={{ width: `${course.progress.progress_percent}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{course.modules?.length || 0} modules</span>
                    <span>
                      {course.modules?.reduce((acc: number, module: any) => acc + (module.lessons?.length || 0), 0) || 0} lessons
                    </span>
                  </div>
                  
                  <button className="w-full py-2 bg-accent-primary text-black rounded-lg hover:bg-accent-primary/90 transition-colors font-medium">
                    View Course
                  </button>
                  
                  {/* Preview lessons */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Preview Lessons</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {course.modules?.flatMap((module: any) => 
                        module.lessons?.filter((lesson: any) => lesson.is_preview)
                          .slice(0, 3)
                          .map((lesson: any) => (
                            <div 
                              key={lesson.id} 
                              className="flex items-center gap-2 p-2 rounded bg-gray-800/50 hover:bg-gray-700/50 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLessonClick(lesson.id, lesson.is_preview);
                              }}
                            >
                              <Eye size={14} className="text-blue-400" />
                              <span className="text-xs text-gray-300 truncate">{lesson.title}</span>
                              <span className="text-xs bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded ml-auto">Preview</span>
                            </div>
                          ))
                      ) || (
                        <p className="text-xs text-gray-500">No preview lessons available</p>
                      )}
                    </div>
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