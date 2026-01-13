import { supabase } from '@/lib/supabase';

// Get all published courses with progress for current user
export const getPublishedCourses = async (userId?: string) => {
  console.log('getPublishedCourses: Fetching published courses for user:', userId);
  
  let query = supabase
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
        title,
        order_index,
        lessons (
          id,
          title,
          order_index,
          is_preview,
          is_published
        )
      )
    `)
    .eq('is_published', true)
    .order('order_index', { foreignTable: 'modules' })
    .order('order_index', { foreignTable: 'modules.lessons' });

  if (userId) {
    // Add user progress to the query
    query = supabase
      .rpc('get_courses_with_progress', { user_id: userId }) as any;
  } else {
    // For non-logged in users, just get courses without progress
    query = supabase
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
          title,
          order_index,
          lessons (
            id,
            title,
            order_index,
            is_preview,
            is_published
          )
        )
      `)
      .eq('is_published', true)
      .order('order_index', { foreignTable: 'modules' })
      .order('order_index', { foreignTable: 'modules.lessons' });
  }

  const { data, error } = await query;

  console.log('getPublishedCourses: Result', { data, error });
  if (error) {
    console.error('getPublishedCourses: Error fetching courses:', error);
    throw error;
  }

  return data || [];
};

// Get a specific course with all its modules and lessons
export const getCourseById = async (courseId: string, userId?: string) => {
  console.log('getCourseById: Fetching course:', courseId, 'for user:', userId);
  
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
        title,
        order_index,
        lessons (
          id,
          title,
          description,
          order_index,
          video_provider,
          video_url,
          youtube_video_id,
          is_preview,
          is_published
        )
      )
    `)
    .eq('id', courseId)
    .eq('is_published', true)
    .single();

  console.log('getCourseById: Result', { data, error });
  if (error) {
    console.error('getCourseById: Error fetching course:', error);
    throw error;
  }

  // If user is logged in, get their progress for this course
  if (userId && data) {
    const progress = await getUserCourseProgress(userId, courseId);
    return { ...data, progress };
  }

  return data;
};

// Get user's progress for a specific course
export const getUserCourseProgress = async (userId: string, courseId: string) => {
  console.log('getUserCourseProgress: Fetching progress for user:', userId, 'course:', courseId);
  
  // First, get all module IDs for this course
  const { data: modulesData, error: modulesError } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', courseId);

  if (modulesError) {
    console.error('getUserCourseProgress: Error fetching module IDs:', modulesError);
    throw modulesError;
  }

  if (!modulesData || modulesData.length === 0) {
    console.log('getUserCourseProgress: No modules found for course');
    return [];
  }

  const moduleIds = modulesData.map(module => module.id);

  // Then get all lesson IDs for those modules
  const { data: lessonsData, error: lessonsError } = await supabase
    .from('lessons')
    .select('id')
    .in('module_id', moduleIds);

  if (lessonsError) {
    console.error('getUserCourseProgress: Error fetching lesson IDs:', lessonsError);
    throw lessonsError;
  }

  if (!lessonsData || lessonsData.length === 0) {
    console.log('getUserCourseProgress: No lessons found for course');
    return [];
  }

  const lessonIds = lessonsData.map(lesson => lesson.id);

  // Then get progress for those lessons
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select(`
      lesson_id,
      completed,
      completed_at,
      last_position_seconds
    `)
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);

  console.log('getUserCourseProgress: Result', { data, error });
  if (error) {
    console.error('getUserCourseProgress: Error fetching progress:', error);
    throw error;
  }

  return data || [];
};

// Get lesson by ID with course/module info
export const getLessonById = async (lessonId: string) => {
  console.log('getLessonById: Fetching lesson:', lessonId);
  
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      description,
      video_provider,
      video_url,
      youtube_video_id,
      is_preview,
      is_published,
      module_id,
      modules (
        id,
        title,
        course_id,
        courses (
          id,
          title
        )
      )
    `)
    .eq('id', lessonId)
    .eq('is_published', true)
    .single();

  console.log('getLessonById: Result', { data, error });
  if (error) {
    console.error('getLessonById: Error fetching lesson:', error);
    throw error;
  }

  return data;
};

// Get user's progress for a specific lesson
export const getUserLessonProgress = async (userId: string, lessonId: string) => {
  console.log('getUserLessonProgress: Fetching progress for user:', userId, 'lesson:', lessonId);
  
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('completed, completed_at, last_position_seconds')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();

  console.log('getUserLessonProgress: Result', { data, error });
  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('getUserLessonProgress: Error fetching progress:', error);
    throw error;
  }

  return data || { completed: false, completed_at: null, last_position_seconds: 0 };
};

// Update user's progress for a lesson
export const updateUserLessonProgress = async (
  userId: string,
  lessonId: string,
  progressData: {
    last_position_seconds?: number;
    completed?: boolean;
    completed_at?: string;
  }
) => {
  console.log('updateUserLessonProgress: Updating progress for user:', userId, 'lesson:', lessonId, 'data:', progressData);
  
  // Use upsert to create or update the progress record
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

// Get latest announcements
export const getLatestAnnouncements = async (limit = 10) => {
  console.log('getLatestAnnouncements: Fetching latest announcements, limit:', limit);
  
  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, body, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  console.log('getLatestAnnouncements: Result', { data, error });
  if (error) {
    console.error('getLatestAnnouncements: Error fetching announcements:', error);
    throw error;
  }

  return data || [];
};

// Get user's profile with role and plan
export const getUserProfile = async (userId: string) => {
  console.log('getUserProfile: Fetching profile for user:', userId);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, role, plan, created_at')
    .eq('id', userId)
    .single();

  console.log('getUserProfile: Result', { data, error });
  if (error) {
    console.error('getUserProfile: Error fetching profile:', error);
    throw error;
  }

  return data;
};

// Check if user has access to a lesson
export const checkLessonAccess = async (userId: string, lessonId: string) => {
  console.log('checkLessonAccess: Checking access for user:', userId, 'lesson:', lessonId);
  
  // First, get the lesson to check if it's a preview
  const lesson = await getLessonById(lessonId);
  
  // If it's a preview lesson, everyone can access it
  if (lesson.is_preview) {
    console.log('checkLessonAccess: Lesson is preview, access granted');
    return { hasAccess: true, isPreview: true };
  }

  // Check if user is a member
  const profile = await getUserProfile(userId);
  const hasAccess = profile.plan === 'member';
  
  console.log('checkLessonAccess: Member access check result:', { hasAccess, plan: profile.plan });
  return { hasAccess, isPreview: false };
};