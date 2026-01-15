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
  
  // First, get courses
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, description, thumbnail_url, is_published, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (coursesError) {
    console.error('listCourses: Error fetching courses:', coursesError);
    console.error("Supabase error", {
      message: coursesError?.message,
      details: coursesError?.details,
      hint: coursesError?.hint,
      code: coursesError?.code,
    });
    throw coursesError;
  }

  // If no courses, return empty array
  if (!coursesData || coursesData.length === 0) {
    console.log('listCourses: No courses found');
    return [];
  }

  // Get modules for all courses
  const courseIds = coursesData.map(course => course.id);
  const { data: modulesData, error: modulesError } = await supabase
    .from('modules')
    .select('id, course_id, title, order_index')
    .in('course_id', courseIds)
    .order('order_index', { ascending: true });

  if (modulesError) {
    console.error('listCourses: Error fetching modules:', modulesError);
    console.error("Supabase error", {
      message: modulesError?.message,
      details: modulesError?.details,
      hint: modulesError?.hint,
      code: modulesError?.code,
    });
    throw modulesError;
  }

  // Group modules by course
  const modulesByCourse: Record<string, any[]> = {};
  if (modulesData) {
    for (const module of modulesData) {
      if (!modulesByCourse[module.course_id]) {
        modulesByCourse[module.course_id] = [];
      }
      modulesByCourse[module.course_id].push(module);
    }
  }

  // Get lessons for all modules
  const moduleIds = modulesData?.map(module => module.id) || [];
  let lessonsData: any[] = [];
  if (moduleIds.length > 0) {
    const { data: lessonsRes, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, module_id, title, description, order_index, video_provider, video_url, youtube_video_id, is_preview, is_published, created_at')
      .in('module_id', moduleIds)
      .order('order_index', { ascending: true });

    if (lessonsError) {
      console.error('listCourses: Error fetching lessons:', lessonsError);
      console.error("Supabase error", {
        message: lessonsError?.message,
        details: lessonsError?.details,
        hint: lessonsError?.hint,
        code: lessonsError?.code,
      });
      // Log a concise error message to prevent infinite loops
      console.warn('Warning: Failed to fetch lessons, continuing with empty lessons array');
      // Return empty array instead of throwing to prevent cascading errors
      lessonsData = [];
      // Optionally re-throw for calling code to handle appropriately
      throw lessonsError;
    }

    lessonsData = lessonsRes || [];
  }

  // Group lessons by module
  const lessonsByModule: Record<string, any[]> = {};
  for (const lesson of lessonsData) {
    if (!lessonsByModule[lesson.module_id]) {
      lessonsByModule[lesson.module_id] = [];
    }
    lessonsByModule[lesson.module_id].push(lesson);
  }

  // Combine everything
  const result = coursesData.map(course => ({
    ...course,
    modules: modulesByCourse[course.id] ? 
      modulesByCourse[course.id].map(module => ({
        ...module,
        lessons: lessonsByModule[module.id] || []
      })) : []
  }));

  console.log('listCourses: Final result', { count: result.length });
  return result;
};

/**
 * Get a specific course with all modules and lessons
 */
export const getCourse = async (courseId: string, userId?: string): Promise<Course & { progress?: CourseProgress }> => {
  console.log('getCourse: Fetching course:', courseId, 'for user:', userId);
  
  // Get the course
  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select('id, title, description, thumbnail_url, is_published, created_at')
    .eq('id', courseId)
    .eq('is_published', true)
    .single();

  if (courseError) {
    console.error('getCourse: Error fetching course:', courseError);
    console.error("Supabase error", {
      message: courseError?.message,
      details: courseError?.details,
      hint: courseError?.hint,
      code: courseError?.code,
    });
    throw courseError;
  }

  if (!courseData) {
    throw new Error('Course not found');
  }

  // Get modules for this course
  const { data: modulesData, error: modulesError } = await supabase
    .from('modules')
    .select('id, course_id, title, order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  if (modulesError) {
    console.error('getCourse: Error fetching modules:', modulesError);
    console.error("Supabase error", {
      message: modulesError?.message,
      details: modulesError?.details,
      hint: modulesError?.hint,
      code: modulesError?.code,
    });
    throw modulesError;
  }

  // Get lessons for all modules in this course
  const moduleIds = modulesData?.map(module => module.id) || [];
  let lessonsData: any[] = [];
  if (moduleIds.length > 0) {
    const { data: lessonsRes, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, module_id, title, description, order_index, video_provider, video_url, youtube_video_id, is_preview, is_published, created_at')
      .in('module_id', moduleIds)
      .order('order_index', { ascending: true });

    if (lessonsError) {
      console.error('getCourse: Error fetching lessons:', lessonsError);
      console.error("Supabase error", {
        message: lessonsError?.message,
        details: lessonsError?.details,
        hint: lessonsError?.hint,
        code: lessonsError?.code,
      });
      // Log a concise error message to prevent infinite loops
      console.warn('Warning: Failed to fetch lessons, continuing with empty lessons array');
      // Return empty array instead of throwing to prevent cascading errors
      lessonsData = [];
      // Re-throw for calling code to handle appropriately
      throw lessonsError;
    }

    lessonsData = lessonsRes || [];
  }

  // Group lessons by module
  const lessonsByModule: Record<string, any[]> = {};
  for (const lesson of lessonsData) {
    if (!lessonsByModule[lesson.module_id]) {
      lessonsByModule[lesson.module_id] = [];
    }
    lessonsByModule[lesson.module_id].push(lesson);
  }

  // Combine everything
  const result = {
    ...courseData,
    modules: modulesData?.map(module => ({
      ...module,
      lessons: lessonsByModule[module.id] || []
    })) || []
  };

  console.log('getCourse: Result', { course: result.id, modules: result.modules.length });

  // Add progress if user is logged in
  if (userId) {
    const progress = await getCourseProgress(userId, courseId);
    return { ...result, progress };
  }

  return result;
};

/**
 * Get course progress for a user
 */
export const getCourseProgress = async (userId: string, courseId: string): Promise<CourseProgress> => {
  console.log('getCourseProgress: Fetching progress for user:', userId, 'course:', courseId);
  
  // Get all lessons for this course by first getting modules then lessons
  const { data: modulesData, error: modulesError } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', courseId);

  if (modulesError) {
    console.error('getCourseProgress: Error fetching modules:', modulesError);
    console.error("Supabase error", {
      message: modulesError?.message,
      details: modulesError?.details,
      hint: modulesError?.hint,
      code: modulesError?.code,
    });
    throw modulesError;
  }

  let lessonIds: string[] = [];
  if (modulesData && modulesData.length > 0) {
    const moduleIds = modulesData.map(module => module.id);
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds);
    
    if (lessonsError) {
      console.error('getCourseProgress: Error fetching lessons:', lessonsError);
      console.error("Supabase error", {
        message: lessonsError?.message,
        details: lessonsError?.details,
        hint: lessonsError?.hint,
        code: lessonsError?.code,
      });
      // Log a concise error message to prevent infinite loops
      console.warn('Warning: Failed to fetch lessons for progress calculation');
      // Return empty array instead of throwing to prevent cascading errors
      return {
        total_lessons: 0,
        completed_lessons: 0,
        progress_percent: 0,
        last_accessed_lesson_id: null
      };
    }
    
    lessonIds = lessonsData?.map(lesson => lesson.id) || [];
  }
  
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
    console.error("Supabase error", {
      message: progressError?.message,
      details: progressError?.details,
      hint: progressError?.hint,
      code: progressError?.code,
    });
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
    console.error("Supabase error", {
      message: progressError?.message,
      details: progressError?.details,
      hint: progressError?.hint,
      code: progressError?.code,
    });
    throw progressError;
  }

  const completedLessonIds = new Set(progressData?.map(p => p.lesson_id) || []);

  // Find first incomplete lesson in order
  for (const module of course.modules) {
    if (module.lessons) {
      for (const lesson of module.lessons) {
        if (!completedLessonIds.has(lesson.id)) {
          console.log('getNextLesson: Found next lesson:', lesson.id);
          return lesson;
        }
      }
    }
  }

  // If all lessons are completed, return the first lesson
  console.log('getNextLesson: All lessons completed, returning first lesson');
  const firstModule = course.modules[0];
  if (firstModule && firstModule.lessons && firstModule.lessons.length > 0) {
    return firstModule.lessons[0];
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
    console.error("Supabase error", {
      message: recentError?.message,
      details: recentError?.details,
      hint: recentError?.hint,
      code: recentError?.code,
    });
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
    console.error("Supabase error", {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
    });
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
    console.error("Supabase error", {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
    });
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
    console.error("Supabase error", {
      message: lessonError?.message,
      details: lessonError?.details,
      hint: lessonError?.hint,
      code: lessonError?.code,
    });
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
    console.error("Supabase error", {
      message: profileError?.message,
      details: profileError?.details,
      hint: profileError?.hint,
      code: profileError?.code,
    });
    return { hasAccess: false, isPreview: false };
  }

  const hasAccess = profile.plan === 'member';
  
  console.log('checkLessonAccess: Member access check result:', { hasAccess, plan: profile.plan });
  return { hasAccess, isPreview: false };
};

export const listCoursesSafe = async (): Promise<Course[]> => {
  console.log('listCoursesSafe: Fetching published courses with error handling');
  
  try {
    // First, get courses
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, description, thumbnail_url, is_published, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (coursesError) {
      console.error('listCoursesSafe: Error fetching courses:', coursesError);
      console.error("Supabase error", {
        message: coursesError?.message,
        details: coursesError?.details,
        hint: coursesError?.hint,
        code: coursesError?.code,
      });
      return []; // Return empty array instead of throwing
    }

    // If no courses, return empty array
    if (!coursesData || coursesData.length === 0) {
      console.log('listCoursesSafe: No courses found');
      return [];
    }

    // Get modules for all courses
    const courseIds = coursesData.map(course => course.id);
    const { data: modulesData, error: modulesError } = await supabase
      .from('modules')
      .select('id, course_id, title, order_index')
      .in('course_id', courseIds)
      .order('order_index', { ascending: true });

    if (modulesError) {
      console.error('listCoursesSafe: Error fetching modules:', modulesError);
      console.error("Supabase error", {
        message: modulesError?.message,
        details: modulesError?.details,
        hint: modulesError?.hint,
        code: modulesError?.code,
      });
      return coursesData.map(course => ({ ...course, modules: [] })); // Return courses with empty modules
    }

    // Group modules by course
    const modulesByCourse: Record<string, any[]> = {};
    if (modulesData) {
      for (const module of modulesData) {
        if (!modulesByCourse[module.course_id]) {
          modulesByCourse[module.course_id] = [];
        }
        modulesByCourse[module.course_id].push(module);
      }
    }

    // Get lessons for all modules
    const moduleIds = modulesData?.map(module => module.id) || [];
    let lessonsData: any[] = [];
    if (moduleIds.length > 0) {
      const { data: lessonsRes, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, module_id, title, description, order_index, video_provider, video_url, youtube_video_id, is_preview, is_published, created_at')
        .in('module_id', moduleIds)
        .order('order_index', { ascending: true });

      if (lessonsError) {
        console.error('listCoursesSafe: Error fetching lessons:', lessonsError);
        console.error("Supabase error", {
          message: lessonsError?.message,
          details: lessonsError?.details,
          hint: lessonsError?.hint,
          code: lessonsError?.code,
        });
        // Continue with empty lessons array
        lessonsData = [];
      } else {
        lessonsData = lessonsRes || [];
      }
    }

    // Group lessons by module
    const lessonsByModule: Record<string, any[]> = {};
    for (const lesson of lessonsData) {
      if (!lessonsByModule[lesson.module_id]) {
        lessonsByModule[lesson.module_id] = [];
      }
      lessonsByModule[lesson.module_id].push(lesson);
    }

    // Combine everything
    const result = coursesData.map(course => ({
      ...course,
      modules: modulesByCourse[course.id] ? 
        modulesByCourse[course.id].map(module => ({
          ...module,
          lessons: lessonsByModule[module.id] || []
        })) : []
    }));

    console.log('listCoursesSafe: Final result', { count: result.length });
    return result;
  } catch (error) {
    console.error('listCoursesSafe: Unexpected error', error);
    return []; // Return empty array as fallback
  }
};
