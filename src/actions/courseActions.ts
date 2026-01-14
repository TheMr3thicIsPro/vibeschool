'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { parseYouTube } from '@/lib/youtubeParser';

// Type definitions
type Course = {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type Module = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
};

type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order_index: number;
  video_provider: string;
  video_url: string | null;
  youtube_video_id: string | null;
  is_preview: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

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

// Course Actions
export async function listCourses(): Promise<{ data: Course[] | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function createCourse(title: string, description: string): Promise<{ data: Course | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    const { data, error } = await supabase
      .from('courses')
      .insert([{ title, description }])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<{ data: Course | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function deleteCourse(id: string): Promise<{ error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { error: 'Access denied. Admin or teacher role required.' };
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function publishCourse(id: string, isPublished: boolean): Promise<{ data: Course | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    const { data, error } = await supabase
      .from('courses')
      .update({ is_published: isPublished })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

// Module Actions
export async function listModules(courseId: string): Promise<{ data: Module[] | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function createModule(courseId: string, title: string): Promise<{ data: Module | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    // Get the highest order_index to determine the new position
    const { data: existingModules } = await supabase
      .from('modules')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1);

    const newOrderIndex = existingModules && existingModules.length > 0 
      ? existingModules[0].order_index + 10 
      : 0;

    const { data, error } = await supabase
      .from('modules')
      .insert([{ course_id: courseId, title, order_index: newOrderIndex }])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function updateModule(id: string, updates: Partial<Module>): Promise<{ data: Module | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    const { data, error } = await supabase
      .from('modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function deleteModule(id: string): Promise<{ error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { error: 'Access denied. Admin or teacher role required.' };
    }

    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function reorderModules(courseId: string, moduleIds: string[]): Promise<{ error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { error: 'Access denied. Admin or teacher role required.' };
    }

    // Update all modules with their new positions in a single transaction
    const updates = moduleIds.map((id, index) => ({
      id,
      order_index: index * 10 // Use increments of 10 to allow for future insertions between items
    }));

    // Perform updates in a batch
    for (const update of updates) {
      const { error } = await supabase
        .from('modules')
        .update({ order_index: update.order_index })
        .eq('id', update.id)
        .eq('course_id', courseId); // Additional safety check

      if (error) {
        return { error: error.message };
      }
    }

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Lesson Actions
export async function listLessons(moduleId: string): Promise<{ data: Lesson[] | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function createLesson(
  moduleId: string, 
  title: string, 
  description: string, 
  youtubeUrl: string
): Promise<{ data: Lesson | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    // Parse the YouTube URL
    const parsed = parseYouTube(youtubeUrl);
    if (parsed.error) {
      return { data: null, error: parsed.error };
    }

    // Get the highest order_index to determine the new position
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: false })
      .limit(1);

    const newOrderIndex = existingLessons && existingLessons.length > 0 
      ? existingLessons[0].order_index + 10 
      : 0;

    const { data, error } = await supabase
      .from('lessons')
      .insert([{
        module_id: moduleId,
        title,
        description,
        youtube_video_id: parsed.videoId,
        video_url: parsed.embedUrl,
        order_index: newOrderIndex,
        is_preview: false,
        is_published: true
      }])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function updateLesson(
  id: string, 
  updates: Partial<Omit<Lesson, 'id' | 'module_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Lesson | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    // If updating YouTube URL, parse it first
    if (updates.video_url) {
      const parsed = parseYouTube(updates.video_url);
      if (parsed.error) {
        return { data: null, error: parsed.error };
      }
      updates.youtube_video_id = parsed.videoId;
      updates.video_url = parsed.embedUrl;
    }

    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function deleteLesson(id: string): Promise<{ error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { error: 'Access denied. Admin or teacher role required.' };
    }

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function reorderLessons(moduleId: string, lessonIds: string[]): Promise<{ error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { error: 'Access denied. Admin or teacher role required.' };
    }

    // Update all lessons with their new positions in a single transaction
    const updates = lessonIds.map((id, index) => ({
      id,
      order_index: index * 10 // Use increments of 10 to allow for future insertions between items
    }));

    // Perform updates in a batch
    for (const update of updates) {
      const { error } = await supabase
        .from('lessons')
        .update({ order_index: update.order_index })
        .eq('id', update.id)
        .eq('module_id', moduleId); // Additional safety check

      if (error) {
        return { error: error.message };
      }
    }

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}