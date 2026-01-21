'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Type definitions
type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  plan: string;
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

  return profile.role === 'admin';
}

// User Actions
export async function listUsers(): Promise<{ data: User[] | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin role required.' };
    }

    // Join with auth.users to get email
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        role,
        plan,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    // For now, we'll return mock emails since we can't access auth.users directly from RLS
    // In a real implementation, you'd need a service role key or a dedicated RPC function
    const usersWithMockEmails = data.map((user: any) => ({
      ...user,
      email: `${user.username}@example.com` // Mock email for demo purposes
    }));

    return { data: usersWithMockEmails as User[], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<{ data: User | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin role required.' };
    }

    // Use the hardened service function
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: updates.role,
        plan: updates.plan
      })
      .eq('id', id)
      .select()
      .maybeSingle(); // Changed from .single() to .maybeSingle()

    if (error) {
      console.error('[USER ACTION] Update error:', error);
      return { data: null, error: error.message };
    }
    
    // Handle case where no rows were updated
    if (!data) {
      console.error('[USER ACTION] No profile found for update:', id);
      return { data: null, error: 'No profile found for this user' };
    }

    // Add mock email
    const userData = {
      ...data,
      email: `${data.username}@example.com`
    };

    return { data: userData as User, error: null };
  } catch (error: any) {
    console.error('[USER ACTION] Unexpected error:', error);
    return { data: null, error: error.message };
  }
}

export async function deleteUser(id: string): Promise<{ error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { error: 'Access denied. Admin role required.' };
    }

    // Note: In a real implementation, you'd want to properly delete the user
    // from auth.users as well, but that typically requires a service role key
    // For now, we'll just delete from profiles
    const { error } = await supabase
      .from('profiles')
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

export async function searchUsers(searchTerm: string): Promise<{ data: User[] | null; error: string | null }> {
  const supabase = await createSupabaseClient();
  
  try {
    // Check admin access
    const adminCheck = await isAdmin(supabase);
    if (!adminCheck) {
      return { data: null, error: 'Access denied. Admin role required.' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        role,
        plan,
        created_at
      `)
      .or(`username.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    // Add mock emails
    const usersWithMockEmails = data.map((user: any) => ({
      ...user,
      email: `${user.username}@example.com`
    }));

    return { data: usersWithMockEmails as User[], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}