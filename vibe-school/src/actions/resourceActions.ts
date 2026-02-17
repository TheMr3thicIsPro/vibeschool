'use server'

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';
import { LessonResource, ResourceSubmission } from '@/types/course';

// Helper function to create Supabase client for server actions
async function createSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          const cookie = cookieStore.get(name);
          return cookie ? cookie.value : undefined;
        },
      },
    }
  );
}

// Check if user is admin
async function isAdmin(supabase: any): Promise<boolean> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return false;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return false;
  }

  return profile.role === 'admin' || profile.role === 'teacher';
}

// --- Lesson Resources Actions ---

export async function listLessonResources(lessonId: string): Promise<{ data: LessonResource[] | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('lesson_resources')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('listLessonResources error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function createLessonResource(
  lessonId: string,
  formData: FormData
): Promise<{ data: LessonResource | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File;
    const exerciseType = formData.get('exercise_type') as string;
    const difficulty = formData.get('difficulty') as string;

    if (!file) {
      return { data: null, error: 'No file provided' };
    }

    // 1. Upload file to Storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('lesson-resources')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { data: null, error: `Upload failed: ${uploadError.message}` };
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('lesson-resources')
      .getPublicUrl(fileName);

    // 3. Create DB Record
    const { data, error } = await supabase
      .from('lesson_resources')
      .insert([{
        lesson_id: lessonId,
        title,
        description,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || 'unknown',
        exercise_type: exerciseType || 'none',
        difficulty: difficulty || 'beginner'
      }])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    revalidatePath(`/learn/${lessonId}`);
    revalidatePath('/admin');
    
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function deleteLessonResource(id: string, fileUrl: string): Promise<{ error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { error: 'Access denied. Admin or teacher role required.' };
    }

    // 1. Delete DB Record
    const { error: dbError } = await supabase
      .from('lesson_resources')
      .delete()
      .eq('id', id);

    if (dbError) {
      return { error: dbError.message };
    }

    // 2. Delete File from Storage (Optional but recommended)
    // Extract filename from URL
    const fileName = fileUrl.split('/').pop();
    if (fileName) {
      const { error: storageError } = await supabase
        .storage
        .from('lesson-resources')
        .remove([fileName]);
      
      if (storageError) {
        console.error('Failed to delete file from storage:', storageError);
        // We don't return error here as DB record is already deleted
      }
    }

    revalidatePath('/admin');
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

// --- Submission Actions ---

export async function getUserSubmission(resourceId: string): Promise<{ data: ResourceSubmission | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('resource_submissions')
      .select('*')
      .eq('resource_id', resourceId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function createSubmission(
  resourceId: string,
  formData: FormData
): Promise<{ data: ResourceSubmission | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const submissionText = formData.get('submission_text') as string;
    const file = formData.get('file') as File;

    let submissionFileUrl = null;

    if (file) {
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase
        .storage
        .from('resource-submissions')
        .upload(fileName, file);

      if (uploadError) {
        return { data: null, error: `Upload failed: ${uploadError.message}` };
      }

      // Private bucket, so we store the path or signed URL?
      // Usually we store the path and generate signed URL on read.
      // But here let's just store the path relative to bucket root.
      submissionFileUrl = fileName; 
    }

    const { data, error } = await supabase
      .from('resource_submissions')
      .upsert({
        resource_id: resourceId,
        user_id: user.id,
        submission_text: submissionText,
        submission_file_url: submissionFileUrl,
        status: 'pending',
        updated_at: new Date().toISOString()
      }, { onConflict: 'resource_id, user_id' })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    revalidatePath(`/learn`); 
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}
