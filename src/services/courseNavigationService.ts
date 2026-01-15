import { supabase } from '@/lib/supabase';

// Types
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  is_published: boolean;
  created_at: string;
  modules?: Module[];
  progress?: CourseProgress;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order_index: number;
  video_provider: string;
  video_url: string;
  youtube_video_id: string;
  is_preview: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserLessonProgress {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  last_position_seconds: number;
  updated_at: string;
}

export interface CourseProgress {
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
  last_accessed_lesson_id: string | null;
}

export interface ContinueLearningItem {
  course: Course;
  next_lesson: Lesson;
  progress_percent: number;
}

// 1. Data Layer Functions

/**
 * Get all published courses with modules and lessons
 */
export const listCourses = async (): Promise<Course[]> => {
  console.log('listCourses: Fetching published courses');
  
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      thumbnail_url,
      is_published,
      created_at,
      modules (
        id,
        course_id,
        title,
        order_index,
        lessons (
          id,
          module_id,
          title,
          description,
          order_index,
          video_provider,
          video_url,
          youtube_video_id,
          is_preview,
          is_published,
          created_at,
          updated_at
        )
      )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .order('order_index', { foreignTable: 'modules' })
    .order('order_index', { foreignTable: 'modules.lessons' });

  console.log('listCourses: Result', { data, error });
  if (error) {
    console.error('listCourses: Error fetching courses:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get a specific course with all modules and lessons
 */
export const getCourse = async (courseId: string, userId?: string): Promise<Course & { progress?: CourseProgress }> => {
  console.log('getCourse: Fetching course:', courseId, 'for user:', userId);
  
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      thumbnail_url,
      is_published,
      created_at,
      modules (
        id,
        course_id,
        title,
        order_index,
        lessons (
          id,
          module_id,
          title,
          description,
          order_index,
          video_provider,
          video_url,
          youtube_video_id,
          is_preview,
          is_published,
          created_at,
          updated_at
        )
      )
    `)
    .eq('id', courseId)
    .eq('is_published', true)
    .single();

  console.log('getCourse: Result', { data, error });
  if (error) {
    console.error('getCourse: Error fetching course:', error);
    throw error;
  }

  // Add progress if user is logged in
  if (userId && data) {
    const progress = await getCourseProgress(userId, courseId);
    return { ...data, progress };
  }

  return data;
};

/**
 * Get course progress for a user
 */
export const getCourseProgress = async (userId: string, courseId: string): Promise<CourseProgress> => {
  console.log('getCourseProgress: Fetching progress for user:', userId, 'course:', courseId);
  
  // Get all lessons for this course
  const { data: lessonsData, error: lessonsError } = await supabase
    .from('lessons')
    .select(`
      id,
      module_id,
      modules (
        course_id
      )
    `)
    .eq('modules.course_id', courseId);

  if (lessonsError) {
    console.error('getCourseProgress: Error fetching lessons:', lessonsError);
    throw lessonsError;
  }

  const lessonIds = lessonsData?.map(lesson => lesson.id) || [];
  const totalLessons = lessonIds.length;

  if (totalLessons === 0) {
    return {
      total_lessons: 0,
      completed_lessons: 0,
      progress_percent: 0,
      last_accessed_lesson_id: null
    };
  }

  // Get user progress for these lessons
  const { data: progressData, error: progressError } = await supabase
    .from('user_lesson_progress')
    .select('lesson_id, completed, updated_at')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);

  if (progressError) {
    console.error('getCourseProgress: Error fetching progress data:', progressError);
    throw progressError;
  }

  const completedLessons = progressData?.filter(p => p.completed).length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Find the most recently accessed lesson
  const sortedProgress = progressData?.sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
  const lastAccessedLessonId = sortedProgress?.[0]?.lesson_id || null;

  return {
    total_lessons: totalLessons,
    completed_lessons: completedLessons,
    progress_percent: progressPercent,
    last_accessed_lesson_id: lastAccessedLessonId
  };
};

/**
 * Get the next lesson for a user in a course
 * Logic: Find first incomplete lesson in module order, then lesson order
 */
export const getNextLesson = async (userId: string, courseId: string): Promise<Lesson | null> => {
  console.log('getNextLesson: Finding next lesson for user:', userId, 'course:', courseId);
  
  // Get course with ordered modules and lessons
  const course = await getCourse(courseId, userId);
  
  if (!course.modules || course.modules.length === 0) {
    console.log('getNextLesson: No modules found');
    return null;
  }

  // Get user's progress for this course
  const { data: progressData, error: progressError } = await supabase
    .from('user_lesson_progress')
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .eq('completed', true);

  if (progressError) {
    console.error('getNextLesson: Error fetching progress:', progressError);
    throw progressError;
  }

  const completedLessonIds = new Set(progressData?.map(p => p.lesson_id) || []);

  // Find first incomplete lesson in order
  for (const module of course.modules.sort((a, b) => a.order_index - b.order_index)) {
    if (module.lessons) {
      for (const lesson of module.lessons.sort((a, b) => a.order_index - b.order_index)) {
        if (!completedLessonIds.has(lesson.id)) {
          console.log('getNextLesson: Found next lesson:', lesson.id);
          return lesson;
        }
      }
    }
  }

  // If all lessons are completed, return the first lesson
  console.log('getNextLesson: All lessons completed, returning first lesson');
  const firstModule = course.modules.sort((a, b) => a.order_index - b.order_index)[0];
  if (firstModule && firstModule.lessons && firstModule.lessons.length > 0) {
    return firstModule.lessons.sort((a, b) => a.order_index - b.order_index)[0];
  }

  return null;
};

/**
 * Get the resume lesson for a user in a course
 * Logic: Find last accessed incomplete lesson, or next lesson if all are complete
 */
export const getResumeLesson = async (userId: string, courseId: string): Promise<Lesson | null> => {
  console.log('getResumeLesson: Finding resume lesson for user:', userId, 'course:', courseId);
  
  // First, try to find the last accessed incomplete lesson
  const { data: recentProgress, error: recentError } = await supabase
    .from('user_lesson_progress')
    .select(`
      lesson_id,
      completed,
      last_position_seconds
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(5); // Check last 5 accessed lessons

  if (recentError) {
    console.error('getResumeLesson: Error fetching recent progress:', recentError);
    throw recentError;
  }

  // Check recent lessons for incomplete ones with progress
  if (recentProgress) {
    for (const progress of recentProgress) {
      if (!progress.completed && progress.last_position_seconds > 0) {
        // Get the lesson details
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', progress.lesson_id)
          .single();
        
        if (!lessonError && lessonData) {
          console.log('getResumeLesson: Found resume lesson with progress:', lessonData.id);
          return lessonData;
        }
      }
    }
  }

  // If no suitable resume lesson found, fall back to next lesson logic
  return getNextLesson(userId, courseId);
};

// 2. Progress Updates

/**
 * Update user lesson progress
 */
export const updateUserLessonProgress = async (
  userId: string,
  lessonId: string,
  progressData: Partial<UserLessonProgress>
): Promise<UserLessonProgress> => {
  console.log('updateUserLessonProgress: Updating progress for user:', userId, 'lesson:', lessonId, 'data:', progressData);
  
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      ...progressData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,lesson_id' })
    .select()
    .single();

  console.log('updateUserLessonProgress: Result', { data, error });
  if (error) {
    console.error('updateUserLessonProgress: Error updating progress:', error);
    throw error;
  }

  return data;
};

/**
 * Mark lesson as completed
 */
export const markLessonCompleted = async (userId: string, lessonId: string): Promise<UserLessonProgress> => {
  return updateUserLessonProgress(userId, lessonId, {
    completed: true,
    completed_at: new Date().toISOString()
  });
};

// 3. Dashboard Functions

/**
 * Get continue learning items for dashboard
 */
export const getContinueLearningItems = async (userId: string, limit = 3): Promise<ContinueLearningItem[]> => {
  console.log('getContinueLearningItems: Fetching items for user:', userId, 'limit:', limit);
  
  // Get courses with user progress
  const courses = await listCourses();
  const items: ContinueLearningItem[] = [];

  for (const course of courses) {
    const progress = await getCourseProgress(userId, course.id);
    
    if (progress.total_lessons > 0 && progress.progress_percent < 100) {
      const nextLesson = await getNextLesson(userId, course.id);
      
      if (nextLesson) {
        items.push({
          course,
          next_lesson: nextLesson,
          progress_percent: progress.progress_percent
        });
      }
    }
  }

  // Sort by progress (lowest first) and limit results
  return items
    .sort((a, b) => a.progress_percent - b.progress_percent)
    .slice(0, limit);
};

/**
 * Get user's progress for a specific lesson
 */
export const getUserLessonProgress = async (userId: string, lessonId: string): Promise<UserLessonProgress> => {
  console.log('getUserLessonProgress: Fetching progress for user:', userId, 'lesson:', lessonId);
  
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();

  console.log('getUserLessonProgress: Result', { data, error });
  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('getUserLessonProgress: Error fetching progress:', error);
    throw error;
  }

  return data || { 
    user_id: userId, 
    lesson_id: lessonId, 
    completed: false, 
    completed_at: null, 
    last_position_seconds: 0,
    updated_at: new Date().toISOString()
  };
};

/**
 * Check if user has access to a lesson
 */
export const checkLessonAccess = async (userId: string, lessonId: string) => {
  console.log('checkLessonAccess: Checking access for user:', userId, 'lesson:', lessonId);
  
  // First, get the lesson to check if it's a preview
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('is_preview')
    .eq('id', lessonId)
    .single();
  
  if (lessonError) {
    console.error('checkLessonAccess: Error fetching lesson:', lessonError);
    return { hasAccess: false, isPreview: false };
  }

  // If it's a preview lesson, everyone can access it
  if (lesson.is_preview) {
    console.log('checkLessonAccess: Lesson is preview, access granted');
    return { hasAccess: true, isPreview: true };
  }

  // Check if user is a member
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.error('checkLessonAccess: Error fetching profile:', profileError);
    return { hasAccess: false, isPreview: false };
  }

  const hasAccess = profile.plan === 'member';
  
  console.log('checkLessonAccess: Member access check result:', { hasAccess, plan: profile.plan });
  return { hasAccess, isPreview: false };
};