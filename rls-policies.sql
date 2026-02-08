-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Enable RLS on conversation_members table
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

-- Conversation members policies
CREATE POLICY "Users can view conversation members if they are members of the conversation" ON conversation_members
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_members cm2
    WHERE cm2.conversation_id = conversation_members.conversation_id
    AND cm2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert themselves as members" ON conversation_members
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view messages if they are members of the conversation" ON messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_members cm
    WHERE cm.conversation_id = messages.conversation_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages if they are members of the conversation" ON messages
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_members cm
    WHERE cm.conversation_id = messages.conversation_id
    AND cm.user_id = auth.uid()
  )
  AND auth.uid() = sender_id
);