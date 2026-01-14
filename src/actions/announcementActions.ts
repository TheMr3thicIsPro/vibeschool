'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Type definitions
type Announcement = {
  id: string;
  title: string;
  body: string;
  created_at: string;
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

// Announcement Actions
export async function listAnnouncements(): Promise<{ data: Announcement[] | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    const { data, error } = await supabase
      .from('announcements')
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

export async function createAnnouncement(title: string, body: string): Promise<{ data: Announcement | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert([{ title, body }])
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

export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<{ data: Announcement | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin or teacher role required.' };
    }

    const { data, error } = await supabase
      .from('announcements')
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

export async function deleteAnnouncement(id: string): Promise<{ error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { error: 'Access denied. Admin or teacher role required.' };
    }

    const { error } = await supabase
      .from('announcements')
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