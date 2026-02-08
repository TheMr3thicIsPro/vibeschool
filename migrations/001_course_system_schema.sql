-- Course System Schema

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  plan TEXT CHECK (plan IN ('free', 'member')) DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  video_provider TEXT DEFAULT 'youtube',
  video_url TEXT,
  youtube_video_id TEXT,
  is_preview BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INTEGER DEFAULT 70
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  options JSONB,
  correct_index INTEGER
);

-- Create user_lesson_progress table
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  user_id UUID REFERENCES auth.users(id),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_position_seconds INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_modules_course_order ON modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_module_order ON lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_lesson ON user_lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Everyone can view basic profile info" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can update user roles and plans" ON profiles
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin')
  );

-- Courses policies
CREATE POLICY "Everyone can view published courses" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Teachers and admins can manage courses" ON courses
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher', 'admin')
  );

-- Modules policies
CREATE POLICY "Everyone can view modules of published courses" ON modules
  FOR SELECT USING (
    (SELECT is_published FROM courses WHERE id = course_id) = true
  );

CREATE POLICY "Teachers and admins can manage modules" ON modules
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher', 'admin')
  );

-- Lessons policies
CREATE POLICY "Everyone can view published lessons of published courses" ON lessons
  FOR SELECT USING (
    is_published = true 
    AND (SELECT is_published FROM courses WHERE id = (SELECT course_id FROM modules WHERE id = module_id)) = true
  );

CREATE POLICY "Teachers and admins can manage lessons" ON lessons
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher', 'admin')
  );

-- Quizzes policies
CREATE POLICY "Everyone can view quizzes of published lessons" ON quizzes
  FOR SELECT USING (
    (SELECT is_published FROM lessons WHERE id = lesson_id) = true
    AND (SELECT is_published FROM courses WHERE id = (SELECT course_id FROM modules WHERE id = (SELECT module_id FROM lessons WHERE id = (SELECT lesson_id FROM quizzes WHERE id = quizzes.id)))) = true
  );

CREATE POLICY "Teachers and admins can manage quizzes" ON quizzes
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher', 'admin')
  );

-- Quiz questions policies
CREATE POLICY "Everyone can view quiz questions of published quizzes" ON quiz_questions
  FOR SELECT USING (
    (SELECT is_published FROM lessons WHERE id = (SELECT lesson_id FROM quizzes WHERE id = quiz_id)) = true
    AND (SELECT is_published FROM courses WHERE id = (SELECT course_id FROM modules WHERE id = (SELECT module_id FROM lessons WHERE id = (SELECT lesson_id FROM quizzes WHERE id = (SELECT quiz_id FROM quiz_questions WHERE id = quiz_questions.id))))) = true
  );

CREATE POLICY "Teachers and admins can manage quiz questions" ON quiz_questions
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher', 'admin')
  );

-- User lesson progress policies
CREATE POLICY "Users can manage own progress" ON user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- Announcements policies
CREATE POLICY "Everyone can view announcements" ON announcements
  FOR SELECT USING (true);

CREATE POLICY "Teachers and admins can manage announcements" ON announcements
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher', 'admin')
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON courses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at 
    BEFORE UPDATE ON lessons 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();