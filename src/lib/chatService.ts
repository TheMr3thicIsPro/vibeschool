import { supabase } from "@/lib/supabase";

export async function getConversationMembers(conversationId: string) {
  const { data, error } = await supabase
    .from("conversation_members")
    .select(`
      user_id,
      role,
      profiles:profiles ( username, avatar_url, email )
    `)
    .eq("conversation_id", conversationId);

  if (error) throw error;
  return data ?? [];
}