-- Community Tables Migration

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE
);

-- Friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (requester_id != addressee_id)
);

-- Friends table (mutual friendships)
CREATE TABLE IF NOT EXISTS friends (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  is_group BOOLEAN DEFAULT FALSE,
  title VARCHAR(255),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation members table
CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (conversation_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT,
  attachment_url TEXT,
  attachment_type VARCHAR(20), -- image, file
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Blocks table
CREATE TABLE IF NOT EXISTS blocks (
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((reported_user_id IS NOT NULL) OR (message_id IS NOT NULL))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_friend_requests_requester ON friend_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_addressee ON friend_requests(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id ON conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON blocks(blocker_id);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: Everyone can read, user can update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Friend requests RLS: Requester and addressee can view
CREATE POLICY "Friend requests viewable by requester and addressee" ON friend_requests
  FOR ALL USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );

-- Friends RLS: Only the user can see their own friends
CREATE POLICY "Users can only see their own friends" ON friends
  FOR ALL USING (
    auth.uid() = user_id
  );

-- Conversations RLS: Only members can access
CREATE POLICY "Conversations viewable by members only" ON conversations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Conversation members RLS: Only members of conversation can access
CREATE POLICY "Conversation members viewable by conversation members" ON conversation_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.user_id = auth.uid()
    )
  );

-- Messages RLS: Only members of conversation can access
CREATE POLICY "Messages viewable by conversation members" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Blocks RLS: Only blocker can manage their blocks
CREATE POLICY "Users can only manage their own blocks" ON blocks
  FOR ALL USING (
    auth.uid() = blocker_id
  );

-- Reports RLS: Users can only see their own reports
CREATE POLICY "Users can only see their own reports" ON reports
  FOR ALL USING (
    auth.uid() = reporter_id
  );

-- RPC Functions
-- Create or get DM (creates DM if it doesn't exist)
CREATE OR REPLACE FUNCTION create_or_get_dm(other_user_id UUID)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Check if DM already exists between users
  SELECT c.id INTO conversation_id
  FROM conversations c
  JOIN conversation_members cm1 ON c.id = cm1.conversation_id
  JOIN conversation_members cm2 ON c.id = cm2.conversation_id
  WHERE c.is_group = false
    AND cm1.user_id = auth.uid()
    AND cm2.user_id = other_user_id
    AND cm1.user_id != cm2.user_id;

  -- If no conversation exists, create one
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (is_group, created_by)
    VALUES (false, auth.uid())
    RETURNING id INTO conversation_id;

    -- Add both users to the conversation
    INSERT INTO conversation_members (conversation_id, user_id, role)
    VALUES (conversation_id, auth.uid(), 'member');

    INSERT INTO conversation_members (conversation_id, user_id, role)
    VALUES (conversation_id, other_user_id, 'member');
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create group chat
CREATE OR REPLACE FUNCTION create_group_chat(title VARCHAR, member_ids UUID[])
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
  user_id UUID;
BEGIN
  -- Insert the group conversation
  INSERT INTO conversations (is_group, title, created_by)
  VALUES (true, title, auth.uid())
  RETURNING id INTO conversation_id;

  -- Add the creator as owner
  INSERT INTO conversation_members (conversation_id, user_id, role)
  VALUES (conversation_id, auth.uid(), 'owner');

  -- Add other members
  FOREACH user_id IN ARRAY member_ids
  LOOP
    -- Skip if user is already added or is the creator
    IF user_id != auth.uid() THEN
      INSERT INTO conversation_members (conversation_id, user_id, role)
      VALUES (conversation_id, user_id, 'member')
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accept friend request
CREATE OR REPLACE FUNCTION accept_friend_request(request_id UUID)
RETURNS VOID AS $$
DECLARE
  request_row RECORD;
BEGIN
  -- Get the request details
  SELECT * INTO request_row
  FROM friend_requests
  WHERE id = request_id AND addressee_id = auth.uid();

  -- Update the request status
  UPDATE friend_requests
  SET status = 'accepted', updated_at = NOW()
  WHERE id = request_id;

  -- Add both users to each other's friend list
  INSERT INTO friends (user_id, friend_id)
  VALUES (request_row.requester_id, request_row.addressee_id),
         (request_row.addressee_id, request_row.requester_id)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark messages as read
CREATE OR REPLACE FUNCTION mark_read(conversation_id UUID, last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())
RETURNS VOID AS $$
BEGIN
  INSERT INTO conversation_members (conversation_id, user_id, last_read_at)
  VALUES (conversation_id, auth.uid(), last_read_at)
  ON CONFLICT (conversation_id, user_id)
  DO UPDATE SET last_read_at = EXCLUDED.last_read_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;