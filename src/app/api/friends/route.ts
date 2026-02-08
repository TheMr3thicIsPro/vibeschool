import { NextRequest, NextResponse } from 'next/server';
import { getCommunityDB } from '@/community/db';
import { getUserId } from '@/lib/auth/getUserFromRequest';

console.log('[FRIENDREQ] Initializing /api/friends route');

export async function GET(request: NextRequest) {
  console.log("[FRIENDREQ] route GET /api/friends");
  
  try {
    const userId = await getUserId(request);
    console.log("[FRIENDREQ] userId", userId);
    
    if (!userId) {
      console.log("[FRIENDREQ] GET /api/friends - No user authenticated");
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    }

    const db = await getCommunityDB();
    const friends = await db.getFriends(userId);

    // Get profile information for each friend
    const friendsWithProfiles = await Promise.all(
      friends.map(async (friend) => {
        const profile = await db.getProfile(friend.friend_id);
        return {
          ...friend,
          profile
        };
      })
    );

    console.log("[FRIENDREQ] GET friends result", { count: friendsWithProfiles.length });
    
    return NextResponse.json({ 
      ok: true, 
      friends: friendsWithProfiles 
    });

  } catch (error) {
    console.log("[FRIENDREQ] Error fetching friends:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}