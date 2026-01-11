import { supabase } from '@/lib/supabase';

// Get all courses
export const getAllCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

// Get course by ID
export const getCourseById = async (courseId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) throw error;
  return data;
};

// Get modules for a course with their lessons
export const getModulesByCourse = async (courseId: string) => {
  const { data, error } = await supabase
    .from('modules')
    .select(`
      *,
      lessons!inner (*)
    `)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })
    .order('lessons.order_index', { referencedTable: 'lessons', ascending: true });

  if (error) throw error;
  return data;
};

// Get lessons for a module
export const getLessonsByModule = async (moduleId: string) => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data;
};

// Get lesson by ID
export const getLessonById = async (lessonId: string) => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      modules!inner (
        *,
        courses!inner (*)
      )
    `)
    .eq('id', lessonId)
    .single();

  if (error) throw error;
  return data;
};

// Get all lessons for a course
export const getLessonsByCourse = async (courseId: string) => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      modules (
        title
      )
    `)
    .eq('modules.course_id', courseId)
    .order('modules.order_index', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data;
};

// Get free lessons
export const getFreeLessons = async () => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      modules (
        title,
        course_id
      )
    `)
    .eq('is_free', true)
    .order('modules.order_index', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data;
};

// Admin functions (for content management)
export const createCourse = async (courseData: { title: string; description: string }) => {
  const { data, error } = await supabase
    .from('courses')
    .insert([courseData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createModule = async (moduleData: { course_id: string; title: string; description: string; order_index: number }) => {
  const { data, error } = await supabase
    .from('modules')
    .insert([moduleData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createLesson = async (lessonData: { 
  module_id: string; 
  title: string; 
  description: string; 
  video_url?: string; 
  content?: string; 
  order_index: number;
  is_free: boolean;
  is_required: boolean;
  is_recommended: boolean;
}) => {
  const { data, error } = await supabase
    .from('lessons')
    .insert([lessonData])
    .select()
    .single();

  if (error) throw error;
  return data;
};