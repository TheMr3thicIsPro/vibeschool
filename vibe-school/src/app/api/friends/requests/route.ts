import { NextRequest, NextResponse } from 'next/server';
import { getCommunityDB } from '@/community/db';
import { getUserId } from '@/lib/auth/getUserFromRequest';

console.log('[FRIENDREQ] Initializing /api/friends/requests route');

export async function POST(request: NextRequest) {
  console.log("[FRIENDREQ] route POST /api/friends/requests");
  
  try {
    const userId = await getUserId(request);
    console.log("[FRIENDREQ] userId", userId);
    
    if (!userId) {
      console.log("[FRIENDREQ] POST /api/friends/requests - No user authenticated");
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    }

    const { toUserId } = await request.json();
    console.log("[FRIENDREQ] create payload", { from: userId, to: toUserId });

    if (!toUserId) {
      console.log("[FRIENDREQ] POST /api/friends/requests - Missing toUserId in request body");
      return NextResponse.json({ error: "toUserId is required" }, { status: 400 });
    }

    if (userId === toUserId) {
      console.log("[FRIENDREQ] POST /api/friends/requests - User tried to send request to themselves");
      return NextResponse.json({ error: "Cannot send friend request to yourself" }, { status: 400 });
    }

    const db = await getCommunityDB();
    
    // Check if users are already friends
    const existingFriends = await db.getFriends(userId);
    const isAlreadyFriends = existingFriends.some(friend => friend.friend_id === toUserId);
    if (isAlreadyFriends) {
      console.log("[FRIENDREQ] POST /api/friends/requests - Users are already friends");
      return NextResponse.json({ error: "Already friends" }, { status: 409 });
    }

    // Check if request already exists
    const existingRequests = await db.getFriendRequests(userId);
    const existingRequest = existingRequests.find(
      req => (req.requester_id === userId && req.addressee_id === toUserId) ||
             (req.requester_id === toUserId && req.addressee_id === userId)
    );
    
    if (existingRequest && existingRequest.status === 'pending') {
      console.log("[FRIENDREQ] POST /api/friends/requests - Friend request already pending");
      return NextResponse.json({ error: "Friend request already pending" }, { status: 409 });
    }

    // Create the friend request
    const friendRequest = await db.createFriendRequest(userId, toUserId);
    console.log("[FRIENDREQ] create result", friendRequest);

    return NextResponse.json({ 
      ok: true, 
      request: friendRequest 
    });

  } catch (error) {
    console.log("[FRIENDREQ] Error creating friend request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  console.log("[FRIENDREQ] route GET /api/friends/requests");
  
  try {
    const userId = await getUserId(request);
    console.log("[FRIENDREQ] userId", userId);
    
    if (!userId) {
      console.log("[FRIENDREQ] GET /api/friends/requests - No user authenticated");
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    }

    const db = await getCommunityDB();
    const friendRequests = await db.getFriendRequests(userId);
    
    // Separate incoming and outgoing requests
    const incoming = friendRequests.filter(req => req.addressee_id === userId && req.status === 'pending');
    const outgoing = friendRequests.filter(req => req.requester_id === userId && req.status === 'pending');
    
    console.log("[FRIENDREQ] GET requests result", { incoming: incoming.length, outgoing: outgoing.length });
    
    return NextResponse.json({ 
      ok: true, 
      requests: {
        incoming,
        outgoing
      }
    });

  } catch (error) {
    console.log("[FRIENDREQ] Error fetching friend requests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}