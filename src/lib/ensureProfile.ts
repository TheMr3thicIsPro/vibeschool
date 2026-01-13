import type { SupabaseClient } from "@supabase/supabase-js"

let inFlight: Promise<any> | null = null

function logSupabaseError(context: string, error: any) {
  if (!error) return
  console.error(context, {
    status: error.status,
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  })
}

export async function ensureProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null; user_metadata?: any }
) {
  if (!user?.id) throw new Error("ensureProfile called without user")

  if (inFlight) return inFlight

  inFlight = (async () => {
    // 1 fetch safely
    const { data: existing, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (fetchError) {
      logSupabaseError("ensureProfile fetch error", fetchError)
      throw fetchError
    }

    if (existing) {
      console.log('ensureProfile: Found existing profile for user:', user.id);
      return existing
    }

    console.log('ensureProfile: No existing profile found, creating for user:', user.id);

    // 2 build username fallback safely
    const email = user.email ?? ""
    const usernameFromMeta = user.user_metadata?.username
    const usernameFallback =
      (typeof usernameFromMeta === "string" && usernameFromMeta.trim()) ||
      (email.includes("@") ? email.split("@")[0] : "") ||
      `user_${user.id.slice(0, 8)}`

    // 3 upsert to avoid 409 if called twice
    const { data: created, error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: email || null,
          username: usernameFallback,
          role: "student",
          plan: "free"
        },
        { onConflict: "id" }
      )
      .select("*")
      .single()

    if (upsertError) {
      logSupabaseError("ensureProfile upsert error", upsertError)
      throw upsertError
    }

    console.log('ensureProfile: Successfully created profile for user:', user.id);

    return created
  })()

  try {
    return await inFlight
  } finally {
    // allow future calls after completion
    inFlight = null
  }
}