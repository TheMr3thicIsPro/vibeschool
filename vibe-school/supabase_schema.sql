-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT friend_requests_no_self_request CHECK (sender_id <> receiver_id)
);

-- Create unique index to prevent duplicate requests (A->B)
CREATE UNIQUE INDEX IF NOT EXISTS friend_requests_sender_receiver_idx ON friend_requests(sender_id, receiver_id);

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT friends_no_self_friend CHECK (user_id <> friend_id)
);

-- Create unique index to prevent duplicate friendships (A->B)
CREATE UNIQUE INDEX IF NOT EXISTS friends_user_friend_idx ON friends(user_id, friend_id);

-- Enable RLS
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Policies for friend_requests

-- Users can insert only if auth.uid() = sender_id
CREATE POLICY "Users can insert friend requests" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can select requests where auth.uid() = sender_id OR auth.uid() = receiver_id
CREATE POLICY "Users can view their friend requests" ON friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can update only if auth.uid() = receiver_id (accept/reject)
CREATE POLICY "Users can update received friend requests" ON friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Policies for friends

-- Users can select rows where auth.uid() = user_id
CREATE POLICY "Users can view their friends" ON friends
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert rows only if auth.uid() = user_id
CREATE POLICY "Users can insert friends" ON friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);
