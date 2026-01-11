-- Vibe School Database Schema

-- Enable Row Level Security (RLS)
-- This will be configured in Supabase dashboard
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Profiles table (extends Supabase auth users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Modules table
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT false,
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) CHECK (task_type IN ('prompt-writing', 'vibe-coding')) NOT NULL,
  example_solution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  feedback TEXT,
  ai_reviewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Conversations table (for DMs)
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) CHECK (type IN ('dm', 'group')) DEFAULT 'dm',
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reply_to UUID REFERENCES messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reactions
CREATE TABLE message_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction)
);

-- Purchases table
CREATE TABLE purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_type VARCHAR(20) CHECK (product_type IN ('subscription', 'lifetime')) NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  amount_cents INTEGER,
  currency VARCHAR(3) DEFAULT 'AUD',
  status VARCHAR(20) CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress tracking
CREATE TABLE progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')) DEFAULT 'not_started',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- RLS Policies
-- Profiles policies
-- CREATE POLICY "Public profiles are viewable by everyone" ON profiles
--   FOR SELECT USING (true);

-- CREATE POLICY "Users can insert their own profile" ON profiles
--   FOR INSERT WITH CHECK (auth.uid() = id);

-- CREATE POLICY "Users can update own profile" ON profiles
--   FOR UPDATE USING (auth.uid() = id);

-- CREATE POLICY "Users can delete own profile" ON profiles
--   FOR DELETE USING (auth.uid() = id);

-- Courses policies
-- CREATE POLICY "Courses are viewable by everyone" ON courses
--   FOR SELECT USING (true);

-- CREATE POLICY "Admin can manage courses" ON courses
--   FOR ALL USING (auth.role() = 'service_role');

-- Modules policies
-- CREATE POLICY "Modules are viewable by everyone" ON modules
--   FOR SELECT USING (true);

-- CREATE POLICY "Admin can manage modules" ON modules
--   FOR ALL USING (auth.role() = 'service_role');

-- Lessons policies
-- CREATE POLICY "Lessons are viewable by everyone for free lessons" ON lessons
--   FOR SELECT USING (is_free = true);

-- CREATE POLICY "Lessons are viewable by paying users" ON lessons
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM purchases p
--       WHERE p.user_id = auth.uid()
--       AND (p.status = 'active' OR p.product_type = 'lifetime')
--       AND (p.ended_at IS NULL OR p.ended_at > NOW())
--     )
--   );

-- CREATE POLICY "Admin can manage lessons" ON lessons
--   FOR ALL USING (auth.role() = 'service_role');

-- Tasks policies
-- CREATE POLICY "Tasks are viewable by everyone for lessons they can access" ON tasks
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM lessons l
--       WHERE l.id = lesson_id
--       AND (
--         l.is_free = true
--         OR EXISTS (
--           SELECT 1 FROM purchases p
--           WHERE p.user_id = auth.uid()
--           AND (p.status = 'active' OR p.product_type = 'lifetime')
--           AND (p.ended_at IS NULL OR p.ended_at > NOW())
--         )
--       )
--     )
--   );

-- CREATE POLICY "Admin can manage tasks" ON tasks
--   FOR ALL USING (auth.role() = 'service_role');

-- Submissions policies
-- CREATE POLICY "Users can view their own submissions" ON submissions
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own submissions" ON submissions
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own submissions" ON submissions
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Admin can manage all submissions" ON submissions
--   FOR ALL USING (auth.role() = 'service_role');

-- Conversations policies
-- CREATE POLICY "Users can view conversations they are part of" ON conversations
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM conversation_participants cp
--       WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
--     )
--   );

-- CREATE POLICY "Users can insert conversations" ON conversations
--   FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Users can update conversations they are part of" ON conversations
--   FOR UPDATE USING (
--     EXISTS (
--       SELECT 1 FROM conversation_participants cp
--       WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
--     )
--   );

-- CREATE POLICY "Admin can manage all conversations" ON conversations
--   FOR ALL USING (auth.role() = 'service_role');

-- Conversation participants policies
-- CREATE POLICY "Users can view participants in conversations they are part of" ON conversation_participants
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM conversations c
--       JOIN conversation_participants cp ON c.id = cp.conversation_id
--       WHERE c.id = conversation_id AND cp.user_id = auth.uid()
--     )
--   );

-- CREATE POLICY "Users can join conversations" ON conversation_participants
--   FOR INSERT WITH CHECK (
--     auth.uid() = user_id
--     AND EXISTS (
--       SELECT 1 FROM conversations c
--       WHERE c.id = conversation_id
--     )
--   );

-- Messages policies
-- CREATE POLICY "Users can view messages in conversations they are part of" ON messages
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM conversation_participants cp
--       WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
--     )
--   );

-- CREATE POLICY "Users can insert messages in conversations they are part of" ON messages
--   FOR INSERT WITH CHECK (
--     auth.uid() = sender_id
--     AND EXISTS (
--       SELECT 1 FROM conversation_participants cp
--       WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
--     )
--   );

-- CREATE POLICY "Users can update their own messages" ON messages
--   FOR UPDATE USING (auth.uid() = sender_id);

-- CREATE POLICY "Users can delete their own messages" ON messages
--   FOR DELETE USING (auth.uid() = sender_id);

-- Message reactions policies
-- CREATE POLICY "Users can view reactions in conversations they are part of" ON message_reactions
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM messages m
--       JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
--       WHERE m.id = message_id AND cp.user_id = auth.uid()
--     )
--   );

-- CREATE POLICY "Users can react to messages in conversations they are part of" ON message_reactions
--   FOR INSERT WITH CHECK (
--     auth.uid() = user_id
--     AND EXISTS (
--       SELECT 1 FROM messages m
--       JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
--       WHERE m.id = message_id AND cp.user_id = auth.uid()
--     )
--   );

-- CREATE POLICY "Users can delete their own reactions" ON message_reactions
--   FOR DELETE USING (auth.uid() = user_id);

-- Purchases policies
-- CREATE POLICY "Users can view their own purchases" ON purchases
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own purchases" ON purchases
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Admin can manage all purchases" ON purchases
--   FOR ALL USING (auth.role() = 'service_role');

-- Progress policies
-- CREATE POLICY "Users can view their own progress" ON progress
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own progress" ON progress
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own progress" ON progress
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Admin can manage all progress" ON progress
--   FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_order ON lessons(module_id, order_index);
CREATE INDEX idx_tasks_lesson_id ON tasks(lesson_id);
CREATE INDEX idx_submissions_user_task ON submissions(user_id, task_id);
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_progress_user_lesson ON progress(user_id, lesson_id);
CREATE INDEX idx_progress_status ON progress(status);