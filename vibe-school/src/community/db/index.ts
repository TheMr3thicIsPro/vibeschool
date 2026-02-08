import { LocalDB } from './LocalDB';
import { SupabaseDB } from './SupabaseDB';
import { Profile, FriendRequest, Friend, Conversation, ConversationMember, Message, Block, Report, CommunityDB } from './types';

// Ensure the classes are imported before being used in the factory function
export { LocalDB, SupabaseDB };
export type { Profile, FriendRequest, Friend, Conversation, ConversationMember, Message, Block, Report, CommunityDB };

let dbInstance: CommunityDB | null = null;

export const getCommunityDB = async (): Promise<CommunityDB> => {
  if (dbInstance) {
    return dbInstance;
  }

  const DEBUG_COMMUNITY = process.env.DEBUG_COMMUNITY === 'true';
  
  // Check if Supabase is available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (supabaseUrl) {
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/health`);
      if (response.ok) {
        if (DEBUG_COMMUNITY) {
          console.log('[COMMUNITY] Using SupabaseDB backend');
        }
        dbInstance = new SupabaseDB();
        return dbInstance as CommunityDB;
      }
    } catch (error) {
      if (DEBUG_COMMUNITY) {
        console.log('[COMMUNITY] Supabase not reachable, using LocalDB backend');
      }
    }
  }
  
  if (DEBUG_COMMUNITY) {
    console.log('[COMMUNITY] Using LocalDB backend');
  }
  dbInstance = new LocalDB();
  return dbInstance!;
};