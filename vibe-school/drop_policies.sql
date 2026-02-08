-- Drop existing policies first
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Admin can manage courses" ON courses;

DROP POLICY IF EXISTS "Modules are viewable by everyone" ON modules;
DROP POLICY IF EXISTS "Admin can manage modules" ON modules;

DROP POLICY IF EXISTS "Lessons are viewable by everyone for free lessons" ON lessons;
DROP POLICY IF EXISTS "Lessons are viewable by paying users" ON lessons;
DROP POLICY IF EXISTS "Admin can manage lessons" ON lessons;

DROP POLICY IF EXISTS "Tasks are viewable by everyone for lessons they can access" ON tasks;
DROP POLICY IF EXISTS "Admin can manage tasks" ON tasks;

DROP POLICY IF EXISTS "Users can view their own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can update their own submissions" ON submissions;
DROP POLICY IF EXISTS "Admin can manage all submissions" ON submissions;

DROP POLICY IF EXISTS "Users can view conversations they are part of" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they are part of" ON conversations;
DROP POLICY IF EXISTS "Admin can manage all conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view participants in conversations they are part of" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;

DROP POLICY IF EXISTS "Users can view messages in conversations they are part of" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in conversations they are part of" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

DROP POLICY IF EXISTS "Users can view reactions in conversations they are part of" ON message_reactions;
DROP POLICY IF EXISTS "Users can react to messages in conversations they are part of" ON message_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON message_reactions;

DROP POLICY IF EXISTS "Users can view their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can insert their own purchases" ON purchases;
DROP POLICY IF EXISTS "Admin can manage all purchases" ON purchases;

DROP POLICY IF EXISTS "Users can view their own progress" ON progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON progress;
DROP POLICY IF EXISTS "Admin can manage all progress" ON progress;

-- Also drop any RLS that might be causing issues with the global help conversation
-- Now run the corrected policies
-- Enable RLS on all tables (in case they were disabled)
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