-- Corrected Schema for Vibe School with proper table structure and RLS policies

-- Drop existing tables if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_members CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table with correct structure
CREATE TABLE profiles (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversations table with correct structure
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT CHECK (type IN ('group', 'dm')) NOT NULL,
  name TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(type, name) WHERE type = 'group' AND name = 'Global Help'
);

-- Create conversation_members table with correct structure
CREATE TABLE conversation_members (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table with correct structure
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for conversations
CREATE POLICY "Users can view conversations they are members of" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create DM conversations" ON conversations
  FOR INSERT WITH CHECK (type = 'dm');

CREATE POLICY "Service role can create global conversations" ON conversations
  FOR INSERT TO service_role WITH CHECK (type = 'group' AND name = 'Global Help');

CREATE POLICY "Users can update conversations they are members of" ON conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Create RLS policies for conversation_members
CREATE POLICY "Users can view members of conversations they are in" ON conversation_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_members.conversation_id
      AND EXISTS (
        SELECT 1 FROM conversation_members cm2
        WHERE cm2.conversation_id = c.id
        AND cm2.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can join conversations they are invited to" ON conversation_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
    )
  );

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in conversations they are members of" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in conversations they are members of" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_conversations_type_name ON conversations(type, name) WHERE type = 'group';
CREATE INDEX idx_conversation_members_conversation_id ON conversation_members(conversation_id);
CREATE INDEX idx_conversation_members_user_id ON conversation_members(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, username)
  VALUES (NEW.id, NEW.email, NEW.email); -- Use email as initial username
  RETURN NEW;
END;
$$;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();