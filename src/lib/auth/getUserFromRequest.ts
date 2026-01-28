import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function getUserId(request: Request): Promise<string | null> {
  console.log("[FRIENDREQ] getUserId called");
  
  // Check if Supabase is enabled
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseAnonKey) {
    console.log("[FRIENDREQ] Supabase enabled, checking session");
    try {
      // Get cookies from the request
      const cookieStore = await cookies();
      
      // Create Supabase server client
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
          },
        }
      );

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log("[FRIENDREQ] Supabase session error:", error.message);
        return null;
      }
      
      if (!session?.user) {
        console.log("[FRIENDREQ] No Supabase session user found");
        return null;
      }
      
      console.log("[FRIENDREQ] Found Supabase user:", session.user.id);
      return session.user.id;
    } catch (error) {
      console.log("[FRIENDREQ] Supabase auth error:", error);
      return null;
    }
  }
  
  // Local auth fallback - check headers and cookies
  console.log("[FRIENDREQ] Using local auth fallback");
  
  // Check x-user-id header
  const userIdHeader = request.headers.get('x-user-id');
  if (userIdHeader) {
    console.log("[FRIENDREQ] Found user ID in header:", userIdHeader);
    return userIdHeader;
  }
  
  // Check user_id cookie
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('user_id')?.value;
  if (userIdCookie) {
    console.log("[FRIENDREQ] Found user ID in cookie:", userIdCookie);
    return userIdCookie;
  }
  
  console.log("[FRIENDREQ] No user ID found in any source");
  return null;
}