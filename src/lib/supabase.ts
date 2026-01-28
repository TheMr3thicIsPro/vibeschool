import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Dev logs
if (process.env.NODE_ENV === 'development') {
  console.log("SUPABASE URL", supabaseUrl);
  console.log("SUPABASE ANON", supabaseAnonKey ? "present" : "missing");
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
}
if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
  throw new Error("Invalid SUPABASE URL format: " + supabaseUrl)
}

// Lazy client factory - only create when needed
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!_client) {
    console.log('[AUTH] creating supabase client');
    _client = createBrowserClient(
      supabaseUrl as string, 
      supabaseAnonKey as string, 
      {
        auth: {
          autoRefreshToken: false, // OFFLINE KILL SWITCH - disable auto refresh
          persistSession: true,
          detectSessionInUrl: false, // Disable URL detection to prevent auto refresh
        }
      }
    );
  }
  return _client;
}

// Backwards compatibility export - but encourage using getSupabaseClient
export const supabase = getSupabaseClient();

// Enhanced reachability test with timeout
export async function testSupabaseReachability(url: string, timeoutMs = 3000): Promise<{ ok: boolean; error?: string }> {
  console.log('[AUTH] reachability test start', url);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const healthUrl = url.replace('.supabase.co', '.supabase.co/auth/v1/health');
    const res = await fetch(healthUrl, { 
      cache: 'no-store',
      signal: controller.signal,
      method: 'GET'
    });
    
    clearTimeout(timeoutId);
    
    console.log('[AUTH] reachability result', { 
      status: res.status, 
      ok: res.ok,
      url: healthUrl 
    });
    
    return { 
      ok: res.ok, 
      error: res.ok ? undefined : `HTTP ${res.status}` 
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    console.error('[AUTH] reachability failed', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')[0],
      url: url.replace('.supabase.co', '.supabase.co/auth/v1/health')
    });
    
    return { 
      ok: false, 
      error: `${error.name}: ${error.message}` 
    };
  }
}