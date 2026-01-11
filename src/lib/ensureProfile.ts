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

    if (existing) return existing

    // 2 build username fallback safely
    const email = user.email ?? ""
    const usernameFromMeta = user.user_metadata?.username
    const usernameFallback =
      (typeof usernameFromMeta === "string" && usernameFromMeta.trim()) ||
      (email.includes("@") ? email.split("@")[0] : "") ||
      `user_${user.id.slice(0, 8)}`

    // 3 upsert to avoid 409 if called twice
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: email || null,
          username: usernameFallback,
        },
        { onConflict: "id" }
      )

    if (upsertError) {
      logSupabaseError("ensureProfile upsert error", upsertError)
      throw upsertError
    }

    // 4 refetch and return
    const { data: created, error: refetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (refetchError) {
      logSupabaseError("ensureProfile refetch error", refetchError)
      throw refetchError
    }

    if (!created) {
      throw new Error("ensureProfile failed to create profile row")
    }

    return created
  })()

  try {
    return await inFlight
  } finally {
    // allow future calls after completion
    inFlight = null
  }
}