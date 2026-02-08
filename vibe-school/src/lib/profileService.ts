import { supabase } from "@/lib/supabase";

export async function ensureProfile() {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) throw new Error("No auth user");

  const defaultUsername = `user_${user.id.slice(-6)}`;
  const email = user.email ?? "";

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email,
        username: defaultUsername,
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}