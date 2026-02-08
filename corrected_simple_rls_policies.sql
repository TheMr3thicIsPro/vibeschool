-- Corrected Simple RLS Policies for Vibe School

-- First, drop any remaining problematic policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view reactions to messages in their conversations" ON message_reactions;
DROP POLICY IF EXISTS "Users can react to messages in their conversations" ON message_reactions;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Courses policies
CREATE POLICY "Courses are viewable by everyone" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage courses" ON courses
  FOR ALL USING (auth.role() = 'service_role');

-- Modules policies
CREATE POLICY "Modules are viewable by everyone" ON modules
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage modules" ON modules
  FOR ALL USING (auth.role() = 'service_role');

-- Lessons policies
CREATE POLICY "Lessons are viewable by everyone for free lessons" ON lessons
  FOR SELECT USING (is_free = true);

CREATE POLICY "Lessons are viewable by paying users" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM purchases p
      WHERE p.user_id = auth.uid()
      AND (p.status = 'active' OR p.product_type = 'lifetime')
      AND (p.ended_at IS NULL OR p.ended_at > NOW())
    )
  );

CREATE POLICY "Admin can manage lessons" ON lessons
  FOR ALL USING (auth.role() = 'service_role');

-- Tasks policies
CREATE POLICY "Tasks are viewable by everyone for lessons they can access" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.id = task.lesson_id
      AND (
        l.is_free = true
        OR EXISTS (
          SELECT 1 FROM purchases p
          WHERE p.user_id = auth.uid()
          AND (p.status = 'active' OR p.product_type = 'lifetime')
          AND (p.ended_at IS NULL OR p.ended_at > NOW())
        )
      )
    )
  );

CREATE POLICY "Admin can manage tasks" ON tasks
  FOR ALL USING (auth.role() = 'service_role');

-- Submissions policies
CREATE POLICY "Users can view their own submissions" ON submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions" ON submissions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all submissions" ON submissions
  FOR ALL USING (auth.role() = 'service_role');

-- Conversations policies (with explicit table references)
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    conversations.id IN (
      SELECT cp.conversation_id FROM conversation_participants cp WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert conversations" ON conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their conversations" ON conversations
  FOR UPDATE USING (
    conversations.id IN (
      SELECT cp.conversation_id FROM conversation_participants cp WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all conversations" ON conversations
  FOR ALL USING (auth.role() = 'service_role');

-- Conversation participants policies
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants
  FOR SELECT USING (
    conversation_participants.conversation_id IN (
      SELECT cp.conversation_id FROM conversation_participants cp WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join conversations" ON conversation_participants
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
    )
  );

-- Messages policies (with explicit table references)
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    messages.conversation_id IN (
      SELECT cp.conversation_id FROM conversation_participants cp WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND messages.conversation_id IN (
      SELECT cp.conversation_id FROM conversation_participants cp WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Message reactions policies (with explicit table references)
CREATE POLICY "Users can view reactions to messages in their conversations" ON message_reactions
  FOR SELECT USING (
    message_reactions.message_id IN (
      SELECT m.id FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can react to messages in their conversations" ON message_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND message_reactions.message_id IN (
      SELECT m.id FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own reactions" ON message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Purchases policies
CREATE POLICY "Users can view their own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all purchases" ON purchases
  FOR ALL USING (auth.role() = 'service_role');

-- Progress policies
CREATE POLICY "Users can view their own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all progress" ON progress
  FOR ALL USING (auth.role() = 'service_role');