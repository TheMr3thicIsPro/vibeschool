'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Play, Lock, Eye, CheckCircle, ChevronRight, BookOpen, Clock } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import { getCourse, getNextLesson, getResumeLesson, checkLessonAccess } from '@/services/courseNavigationService';

interface CourseModule {
  id: string;
  title: string;
  order_index: number;
  lessons: CourseLesson[];
}

interface CourseLesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_preview: boolean;
  is_published: boolean;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  is_published: boolean;
  created_at: string;
  modules: CourseModule[];
  progress?: {
    total_lessons: number;
    completed_lessons: number;
    progress_percent: number;
    last_accessed_lesson_id: string | null;
  };
}

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const { state } = useAuthStore();
  const user = state.user;
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [resumeLesson, setResumeLesson] = useState<CourseLesson | null>(null);
  const [nextLesson, setNextLesson] = useState<CourseLesson | null>(null);

  useEffect(() => {
    if (user && courseId) {
      loadCourseData();
    }
  }, [user, courseId]);

  const loadCourseData = async () => {
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
      
      // Get course details
      const courseData = await getCourse(courseId, user.id);
      
      // Check if course exists and is published
      if (!courseData || !courseData.is_published) {
        console.error('Course not found or not published');
        return;
      }
      
      setCourse(courseData as CourseDetail);
      
      // Get resume and next lessons
      const [resumeData, nextData] = await Promise.all([
        getResumeLesson(user.id, courseId),
        getNextLesson(user.id, courseId)
      ]);
      
      setResumeLesson(resumeData as CourseLesson | null);
      setNextLesson(nextData as CourseLesson | null);
      
    } catch (error) {
      console.error('Error loading course data:', error);
      // Surface the error instead of hiding it
      console.error('Detailed error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = async (lessonId: string, isPreview: boolean) => {
    if (isPreview) {
      router.push(`/learn/${lessonId}`);
      return;
    }
    
    // Check if user has access based on their plan
    if (userPlan === 'member' || userPlan === 'premium') {
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

  const handleStartCourse = () => {
    if (nextLesson) {
      handleLessonClick(nextLesson.id, nextLesson.is_preview);
    }
  };

  const handleResumeCourse = () => {
    if (resumeLesson) {
      handleLessonClick(resumeLesson.id, resumeLesson.is_preview);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-2xl font-bold text-accent-primary">Loading course...</div>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <BookOpen size={48} className="text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Course Not Found</h2>
              <p className="text-gray-400">This course doesn't exist or isn't published yet.</p>
              <button
                onClick={() => router.push('/courses')}
                className="mt-4 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 hover-lift border border-accent-primary"
              >
                Browse All Courses
              </button>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const totalDurationSeconds = totalLessons * 900; // Fallback to 15 mins per lesson if duration not available
  const totalDurationMinutes = Math.ceil(totalDurationSeconds / 60);
  const totalDurationHours = Math.ceil(totalDurationMinutes / 60);
  
  const completedLessons = course.progress?.completed_lessons || 0;
  const progressPercent = course.progress?.progress_percent || 0;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          {/* Course Header */}
          <div className="card p-8 border border-card-border mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>
                <p className="text-gray-300 text-lg mb-6">{course.description}</p>
                
                {/* Progress Overview */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-gray-400" />
                    <span className="text-gray-300">{totalLessons} lessons</span>
                  </div>
                  {course.progress && (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-500" />
                        <span className="text-gray-300">{completedLessons} completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-accent-primary h-3 rounded-full" 
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-300 font-medium">{progressPercent}%</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  {progressPercent > 0 && resumeLesson ? (
                    <button
                      onClick={handleResumeCourse}
                      className="flex items-center gap-2 px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 font-medium hover-lift border border-accent-primary"
                    >
                      <Play size={20} />
                      Resume Course
                    </button>
                  ) : nextLesson ? (
                    <button
                      onClick={handleStartCourse}
                      className="flex items-center gap-2 px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 font-medium hover-lift border border-accent-primary"
                    >
                      <Play size={20} />
                      Start Course
                    </button>
                  ) : null}
                  
                  <button
                    onClick={() => router.push('/courses')}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium hover-lift"
                  >
                    Browse Courses
                  </button>
                </div>
              </div>
              
              {/* Course Thumbnail */}
              {course.thumbnail_url ? (
                <div className="lg:w-80">
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="lg:w-80 bg-gray-800 rounded-lg flex items-center justify-center h-48">
                  <BookOpen size={48} className="text-gray-600" />
                </div>
              )}
            </div>
          </div>

          {/* Modules and Lessons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Modules List */}
            <div className="lg:col-span-1">
              <div className="card p-6 border border-card-border sticky top-8">
                <h2 className="text-xl font-bold text-white mb-4">Course Content</h2>
                <div className="space-y-4">
                  {course.modules
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((module) => (
                      <div key={module.id} className="border-l-2 border-accent-primary pl-4 py-2">
                        <h3 className="font-medium text-white mb-3">{module.title}</h3>
                        <div className="space-y-2">
                          {module.lessons
                            .sort((a, b) => a.order_index - b.order_index)
                            .map((lesson) => {
                              const canAccess = lesson.is_preview || userPlan === 'member' || userPlan === 'premium';
                              
                              return (
                                <div 
                                  key={lesson.id}
                                  className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors ${
                                    canAccess 
                                      ? 'bg-gray-800/50 hover:bg-gray-700/50' 
                                      : 'bg-gray-900/50 opacity-60'
                                  }`}
                                  onClick={() => canAccess && handleLessonClick(lesson.id, lesson.is_preview)}
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {lesson.is_preview ? (
                                      <Eye size={16} className="text-blue-400 flex-shrink-0" />
                                    ) : (userPlan === 'member' || userPlan === 'premium') ? (
                                      <Play size={16} className="text-accent-primary flex-shrink-0" />
                                    ) : (
                                      <Lock size={16} className="text-gray-500 flex-shrink-0" />
                                    )}
                                    <span className="text-sm text-gray-300 truncate">{lesson.title}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                    {lesson.is_preview && (
                                      <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">Preview</span>
                                    )}
                                    
                                    {!lesson.is_preview && (userPlan === 'member' || userPlan === 'premium') && (
                                      <CheckCircle size={16} className="text-green-500" />
                                    )}
                                    
                                    <ChevronRight size={16} className="text-gray-500" />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Course Description */}
            <div className="lg:col-span-2">
              <div className="card p-6 border border-card-border">
                <h2 className="text-xl font-bold text-white mb-4">About This Course</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300">{course.description}</p>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <h3 className="font-medium text-white mb-2">Total Lessons</h3>
                      <p className="text-2xl font-bold text-accent-primary">{totalLessons}</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <h3 className="font-medium text-white mb-2">Course Duration</h3>
                      <p className="text-2xl font-bold text-accent-primary">
                        {totalDurationHours > 0 ? `~${totalDurationHours} hours` : `${totalDurationMinutes} mins`}
                      </p>
                      <p className="text-sm text-gray-400">Est. {totalDurationMinutes} minutes</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-white mb-3">What You'll Learn</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-accent-primary mt-1">•</span>
                        <span>Comprehensive course content organized in logical modules</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent-primary mt-1">•</span>
                        <span>Hands-on exercises and practical examples</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent-primary mt-1">•</span>
                        <span>Progress tracking and completion certificates</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default CourseDetailPage;