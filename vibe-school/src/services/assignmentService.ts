import { supabase } from '@/lib/supabase';
import { Assignment, AssignmentSubmission, AssignmentStatus } from '@/types/assignment';

// Helper to check for missing table error (PGRST205)
// This allows the app to function even if the assignment features haven't been deployed to the DB yet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isMissingTableError = (error: any) => {
  // PGRST205: specific PostgREST error for missing relation/table
  // 42P01: Postgres error for undefined table
  return error?.code === 'PGRST205' || error?.code === '42P01';
};

// Get assignment for a lesson
export const getAssignmentByLessonId = async (lessonId: string): Promise<Assignment | null> => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) {
        // Silent fail for missing table - feature is optional
        console.debug('Assignments table missing (PGRST205), skipping assignment load.');
        return null;
      }
      console.error('getAssignmentByLessonId error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    // Double safety catch
    if (isMissingTableError(error)) return null;
    throw error;
  }
};

// Create or update assignment
export const upsertAssignment = async (data: Partial<Assignment> & { lesson_id: string }) => {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('assignments')
      .select('id')
      .eq('lesson_id', data.lesson_id)
      .maybeSingle();

    if (fetchError) {
      if (isMissingTableError(fetchError)) {
        console.warn('Assignments table missing, cannot upsert assignment.');
        throw new Error('Assignments feature is not available (table missing).');
      }
      throw fetchError;
    }

    if (existing) {
      const { error } = await supabase
        .from('assignments')
        .update({
          title: data.title,
          description: data.description,
          submission_type: data.submission_type,
          is_published: data.is_published,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('assignments').insert({
        lesson_id: data.lesson_id,
        title: data.title!,
        description: data.description,
        submission_type: data.submission_type!,
        is_published: data.is_published,
      });
      if (error) throw error;
    }
  } catch (error) {
    // Re-throw unless it's handled above, but ensure we don't crash unrelated things if called in a non-critical path
    throw error;
  }
};

// Get user submission
export const getUserSubmission = async (assignmentId: string, userId: string): Promise<AssignmentSubmission | null> => {
  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) {
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
};

// Submit assignment
export const submitAssignment = async (
  assignmentId: string, 
  userId: string, 
  submission: { link_url?: string; file_path?: string }
) => {
  // Check if exists
  const existing = await getUserSubmission(assignmentId, userId);

  if (existing) {
    const { error } = await supabase
      .from('assignment_submissions')
      .update({
        link_url: submission.link_url,
        file_path: submission.file_path,
        status: 'submitted', // Reset status on resubmission
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) {
      if (isMissingTableError(error)) {
        throw new Error('Assignment submissions are temporarily unavailable.');
      }
      throw error;
    }
  } else {
    const { error } = await supabase.from('assignment_submissions').insert({
      assignment_id: assignmentId,
      user_id: userId,
      link_url: submission.link_url,
      file_path: submission.file_path,
      status: 'submitted',
    });
    if (error) {
      if (isMissingTableError(error)) {
        throw new Error('Assignment submissions are temporarily unavailable.');
      }
      throw error;
    }
  }
};

// Admin: Get all submissions for an assignment
export const getAssignmentSubmissions = async (assignmentId: string) => {
  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    return data;
  } catch (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
};

// Admin: Review submission
export const reviewSubmission = async (
  submissionId: string, 
  status: AssignmentStatus, 
  feedback?: string
) => {
  const { error } = await supabase
    .from('assignment_submissions')
    .update({
      status,
      admin_feedback: feedback,
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId);
  if (error) {
    if (isMissingTableError(error)) {
      throw new Error('Cannot review submission: database table missing.');
    }
    throw error;
  }
};
