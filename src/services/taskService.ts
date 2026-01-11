import { supabase } from '@/lib/supabase';

// Get tasks for a lesson
export const getTasksByLesson = async (lessonId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

// Get a specific task
export const getTaskById = async (taskId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (error) throw error;
  return data;
};

// Submit a task
export const submitTask = async (
  userId: string, 
  taskId: string, 
  content: string
) => {
  const { data, error } = await supabase
    .from('submissions')
    .insert([{
      user_id: userId,
      task_id: taskId,
      content,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get user's submission for a task
export const getUserTaskSubmission = async (userId: string, taskId: string) => {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .single();

  if (error && error.code !== 'PGRST116') { // No rows returned
    throw error;
  }
  
  return data;
};

// Get all submissions for a task (for admin/review)
export const getTaskSubmissions = async (taskId: string) => {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      profiles!inner (username, avatar_url)
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Update submission feedback (for admin/review)
export const updateSubmissionFeedback = async (submissionId: string, feedback: string) => {
  const { data, error } = await supabase
    .from('submissions')
    .update({ 
      feedback,
      ai_reviewed: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', submissionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Create a new task (for admin)
export const createTask = async (taskData: { 
  lesson_id: string; 
  title: string; 
  description: string; 
  task_type: 'prompt-writing' | 'vibe-coding'; 
  example_solution?: string 
}) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([taskData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update an existing task (for admin)
export const updateTask = async (taskId: string, taskData: Partial<{
  title: string;
  description: string;
  task_type: 'prompt-writing' | 'vibe-coding';
  example_solution?: string;
}>) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
};