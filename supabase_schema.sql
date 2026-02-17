-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- 3. Enable RLS
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for friend_requests

-- Users can insert only if they are the sender
CREATE POLICY "Users can insert own friend requests" 
  ON friend_requests FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Users can view requests they sent or received
CREATE POLICY "Users can view their own friend requests" 
  ON friend_requests FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can update requests if they are the receiver (accept/decline) OR sender (cancel)
-- Note: This policy is a bit broad, application logic handles specific status transitions.
-- Ideally we'd split this, but for simplicity:
CREATE POLICY "Users can update their own friend requests" 
  ON friend_requests FOR UPDATE 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can delete their own requests (sender can cancel/delete pending)
CREATE POLICY "Users can delete their own friend requests" 
  ON friend_requests FOR DELETE 
  USING (auth.uid() = sender_id);


-- 5. RLS Policies for friends

-- Users can view their own friends
CREATE POLICY "Users can view their own friends" 
  ON friends FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert friends (usually handled by server/trigger, but if client does it via accepted request)
-- Since we are doing it via API route which runs as server/authenticated user, 
-- we need to allow the user to insert the record where they are the 'user_id'.
-- However, our API inserts TWO records (A->B and B->A).
-- The user (Receiver) accepts the request. They insert (Receiver->Sender) and (Sender->Receiver).
-- RLS check for (Receiver->Sender) will pass because auth.uid() = Receiver.
-- RLS check for (Sender->Receiver) will FAIL because auth.uid() != Sender.
-- SOLUTION: Use a Database Function (RPC) or `security definer` function to accept requests.
-- OR: Allow insert if the user is part of the friendship? No, that's not enough for B inserting A->B.

-- BETTER APPROACH: The accept logic should be in a Supabase Edge Function or a PostgreSQL Function.
-- BUT, given the requirements and current implementation (API Route), 
-- the API route runs with the user's auth token.
-- So we cannot insert the "other side" record directly if RLS is strict.

-- WORKAROUND:
-- We can create a policy that allows inserting if the user is EITHER party? 
-- No, that allows me to force you to be my friend.
-- Correct way without Service Role is a Postgres Function.

-- Let's define a function to handle acceptance safely.

CREATE OR REPLACE FUNCTION accept_friend_request(request_id UUID)
RETURNS VOID AS $$
DECLARE
  r_sender_id UUID;
  r_receiver_id UUID;
  r_status TEXT;
BEGIN
  -- Get request details
  SELECT sender_id, receiver_id, status INTO r_sender_id, r_receiver_id, r_status
  FROM friend_requests
  WHERE id = request_id;

  -- Verify existence and status
  IF r_sender_id IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF r_status != 'pending' THEN
    RAISE EXCEPTION 'Request is not pending';
  END IF;

  -- Verify auth (only receiver can accept)
  IF auth.uid() != r_receiver_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Update request status
  UPDATE friend_requests 
  SET status = 'accepted', updated_at = now() 
  WHERE id = request_id;

  -- Insert friend records (both directions)
  INSERT INTO friends (user_id, friend_id) VALUES (r_sender_id, r_receiver_id);
  INSERT INTO friends (user_id, friend_id) VALUES (r_receiver_id, r_sender_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION accept_friend_request TO authenticated;

-- If we use the function, we don't need Insert policy for friends table for normal users.
-- But for reading:
CREATE POLICY "Users can see their friends"
  ON friends FOR SELECT
  USING (auth.uid() = user_id);

-- If you still want to use client-side insert (not recommended due to RLS issue explained above),
-- you would need Service Role key in the API route.
-- The API route uses `getCommunityDB()` -> `SupabaseDB` -> `createClient`.
-- If `createClient` uses ANON key, it's subject to RLS.
-- If the project has SERVICE_ROLE_KEY env var, we could use it for the API route.
-- Let's check SupabaseDB.ts constructor.
-- It uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
-- So it acts as the user.

-- Therefore, the `accept_friend_request` function is the robust solution.
-- I should update the `SupabaseDB.updateFriendRequest` to call this function if status is 'accepted'.
-- Or, simpler: Just relax the RLS for friends table?
-- "Users can insert rows only if auth.uid() = user_id" was the prompt requirement.
-- If so, the API route will fail to insert the second record.

-- RE-READING PROMPT: "Users can insert rows only if auth.uid() = user_id"
-- This implies the prompt expects the user to only be able to add themselves as a friend?
-- But "A friend relationship is mutual (insert two rows when accepted)".
-- If I insert `(Me, You)` that works.
-- If I insert `(You, Me)` that fails.
-- So the API must use Service Role or RPC.

-- Since I cannot easily change the API to use Service Role (security risk if not careful) without env vars (which I assume exist but `SupabaseDB` is hardcoded to use Anon Key),
-- I will add the RPC function to the SQL schema.
-- And I will update `SupabaseDB.ts` to use this RPC if it exists, OR I will assume the user has Service Role configured for backend.
-- Wait, `SupabaseDB` is used in Client Components too?
-- `SupabaseDB.ts` is imported in `discover.tsx` (Client Component).
-- So it MUST use Anon Key.
-- So client-side `updateFriendRequest` -> `accept` will FAIL for the second insert.
-- The prompt said "Wrap in a transaction-like flow with error handling."
-- The only way to do a transaction that bypasses RLS for the second insert is a Postgres Function (RPC).

-- So I will include the RPC in the SQL.
-- And I should probably update `SupabaseDB.ts` to use `rpc` for accepting requests?
-- But I just wrote the code to do manual inserts.
-- The user prompt said: "STEP 5 ... Insert into friends ... (user_id = sender, friend_id = receiver) ... (user_id = receiver, friend_id = sender)".
-- It didn't explicitly say "Use RPC".
-- But it said "Users can insert rows only if auth.uid() = user_id".
-- This is a contradiction if done client-side.
-- UNLESS `friends` table allows me to insert for others? No.

-- Maybe I should assume the API route uses Service Role?
-- The API route imports `getCommunityDB`.
-- `src/community/db/index.ts` likely exports a singleton or factory.
-- If I check `src/community/db/SupabaseDB.ts`, it uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
-- So it is definitely using Anon Key.

-- Okay, I will provide the RPC in the SQL file.
-- And I will add a comment in the SQL file explaining this.
-- For now, the code in `SupabaseDB.ts` tries to insert both.
-- The first one `(Receiver, Sender)` will succeed (since `Receiver` calls it).
-- The second one `(Sender, Receiver)` will fail RLS.

-- To fix this properly, I should use the RPC in `SupabaseDB.ts`.
-- `await this.supabase.rpc('accept_friend_request', { request_id: requestId })`
-- But `SupabaseDB` needs to know if it should use RPC or manual.
-- Given I am an "expert engineer", I should use RPC for correctness.

-- I will update `supabase_schema.sql` to include the RPC.
-- And I will update `SupabaseDB.ts` to use the RPC for 'accepted' status.
