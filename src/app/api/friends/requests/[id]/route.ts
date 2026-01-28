import { NextRequest, NextResponse } from 'next/server';
import { getCommunityDB } from '@/community/db';
import { getUserId } from '@/lib/auth/getUserFromRequest';

console.log('[FRIENDREQ] Initializing /api/friends/requests/[id] route');

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("[FRIENDREQ] route PUT /api/friends/requests/[id]", params.id);
  
  try {
    const userId = await getUserId(request);
    console.log("[FRIENDREQ] userId", userId);
    
    if (!userId) {
      console.log("[FRIENDREQ] PUT /api/friends/requests/[id] - No user authenticated");
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    }

    const { status } = await request.json();
    
    if (!status || !['accepted', 'declined', 'cancelled'].includes(status)) {
      console.log("[FRIENDREQ] PUT /api/friends/requests/[id] - Invalid status", status);
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const db = await getCommunityDB();
    
    // Get the friend request to verify ownership
    const friendRequests = await db.getFriendRequests(userId);
    const friendRequest = friendRequests.find(req => req.id === params.id);
    
    if (!friendRequest) {
      console.log("[FRIENDREQ] PUT /api/friends/requests/[id] - Friend request not found", params.id);
      return NextResponse.json({ error: "Friend request not found" }, { status: 404 });
    }

    // Only the addressee can accept/decline, only requester can cancel
    if (status === 'accepted' || status === 'declined') {
      if (friendRequest.addressee_id !== userId) {
        console.log("[FRIENDREQ] PUT /api/friends/requests/[id] - Not authorized to accept/decline this request", { request: friendRequest, userId });
        return NextResponse.json({ error: "Not authorized to accept/decline this request" }, { status: 403 });
      }
    } else if (status === 'cancelled') {
      if (friendRequest.requester_id !== userId) {
        console.log("[FRIENDREQ] PUT /api/friends/requests/[id] - Not authorized to cancel this request", { request: friendRequest, userId });
        return NextResponse.json({ error: "Not authorized to cancel this request" }, { status: 403 });
      }
    }

    // Update the friend request
    const updatedRequest = await db.updateFriendRequest(params.id, status);
    console.log("[FRIENDREQ] PUT request updated", { requestId: params.id, status, updatedRequest });

    return NextResponse.json({ 
      ok: true, 
      request: updatedRequest 
    });

  } catch (error) {
    console.log("[FRIENDREQ] Error updating friend request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("[FRIENDREQ] route DELETE /api/friends/requests/[id]", params.id);
  
  try {
    const userId = await getUserId(request);
    console.log("[FRIENDREQ] userId", userId);
    
    if (!userId) {
      console.log("[FRIENDREQ] DELETE /api/friends/requests/[id] - No user authenticated");
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    }

    const db = await getCommunityDB();
    
    // Get the friend request to verify ownership
    const friendRequests = await db.getFriendRequests(userId);
    const friendRequest = friendRequests.find(req => req.id === params.id);
    
    if (!friendRequest) {
      console.log("[FRIENDREQ] DELETE /api/friends/requests/[id] - Friend request not found", params.id);
      return NextResponse.json({ error: "Friend request not found" }, { status: 404 });
    }

    // Only the requester can delete a pending request
    if (friendRequest.requester_id !== userId || friendRequest.status !== 'pending') {
      console.log("[FRIENDREQ] DELETE /api/friends/requests/[id] - Not authorized to delete this request", { request: friendRequest, userId });
      return NextResponse.json({ error: "Not authorized to delete this request" }, { status: 403 });
    }

    // For simplicity, we'll just update the status to cancelled
    const updatedRequest = await db.updateFriendRequest(params.id, 'cancelled');
    console.log("[FRIENDREQ] DELETE request cancelled", { requestId: params.id, updatedRequest });

    return NextResponse.json({ 
      ok: true, 
      request: updatedRequest 
    });

  } catch (error) {
    console.log("[FRIENDREQ] Error deleting friend request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}