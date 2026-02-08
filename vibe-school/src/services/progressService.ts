import { supabase } from '@/lib/supabase';

// Update user progress for a lesson
export const updateProgress = async (userId: string, lessonId: string, status: 'not_started' | 'in_progress' | 'completed' | 'skipped') => {
  // Check if progress record already exists
  const { data: existingProgress } = await supabase
    .from('progress')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();

  let result;
  if (existingProgress) {
    // Update existing progress
    result = await supabase
      .from('progress')
      .update({ 
        status, 
        updated_at: new Date().toISOString(),
        ...(status === 'completed' && { completed_at: new Date().toISOString() })
      })
      .eq('id', existingProgress.id)
      .select()
      .single();
  } else {
    // Create new progress record
    result = await supabase
      .from('progress')
      .insert([{
        user_id: userId,
        lesson_id: lessonId,
        status,
        ...(status === 'completed' && { completed_at: new Date().toISOString() })
      }])
      .select()
      .single();
  }

  if (result.error) throw result.error;
  return result.data;
};

// Get user progress for a lesson
export const getUserLessonProgress = async (userId: string, lessonId: string) => {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is for no rows returned
    throw error;
  }
  
  return data;
};

// Get user progress for a module
export const getUserModuleProgress = async (userId: string, moduleId: string) => {
  const { data, error } = await supabase
    .from('progress')
    .select(`
      *,
      lessons!inner (
        module_id
      )
    `)
    .eq('user_id', userId)
    .eq('lessons.module_id', moduleId);

  if (error) throw error;
  return data;
};

// Get user progress for a course
export const getUserCourseProgress = async (userId: string, courseId: string) => {
  const { data, error } = await supabase
    .from('progress')
    .select(`
      *,
      lessons!inner (
        modules!inner (
          course_id
        )
      )
    `)
    .eq('user_id', userId)
    .eq('lessons.modules.course_id', courseId);

  if (error) throw error;
  return data;
};

// Get overall user progress percentage
export const getUserOverallProgress = async (userId: string) => {
  // Get all lessons in courses
  const { data: allLessons, error: lessonsError } = await supabase
    .from('lessons')
    .select(`
      id,
      modules!inner (
        courses!inner (id)
      )
    `);

  if (lessonsError) throw lessonsError;

  // Get user's completed lessons
  const { data: completedLessons, error: progressError } = await supabase
    .from('progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('status', 'completed');

  if (progressError) throw progressError;

  const totalLessons = allLessons.length;
  const completedCount = completedLessons.length;
  
  return totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
};