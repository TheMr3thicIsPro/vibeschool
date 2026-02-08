-- Simplified SQL script to create quiz tables in your Supabase database
-- This version removes dependencies on tables that might not exist yet
-- Copy and paste this into your Supabase SQL Editor

-- Create quizzes table
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_questions table
CREATE TABLE quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'short_answer')) NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_options table
CREATE TABLE quiz_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_submissions table
CREATE TABLE quiz_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_answers table
CREATE TABLE quiz_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES quiz_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES quiz_options(id),
  short_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all quiz tables
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quizzes table - simplified version
CREATE POLICY "Users can view active quizzes for lessons they have access to" ON quizzes
FOR SELECT TO authenticated USING (
  is_active = true AND
  lesson_id IN (
    SELECT id FROM lessons WHERE course_id IN (
      -- For now, allow access to courses where user is enrolled (if enrollments table exists) 
      -- OR to preview courses
      SELECT course_id FROM enrollments WHERE user_id = auth.uid()
      UNION
      SELECT id FROM courses WHERE is_preview = true
    )
  )
);

-- Alternative simplified policy if enrollments table doesn't exist yet
-- Uncomment the following and comment out the above policy if needed:
/*
CREATE POLICY "Users can view active quizzes for lessons they have access to" ON quizzes
FOR SELECT TO authenticated USING (
  is_active = true AND
  lesson_id IN (
    SELECT id FROM lessons WHERE is_preview = true
  )
);
*/

-- Create RLS policies for quiz_questions table - simplified version
CREATE POLICY "Users can view questions for active quizzes" ON quiz_questions
FOR SELECT TO authenticated USING (
  lesson_id IN (
    SELECT lesson_id FROM quizzes WHERE is_active = true
  ) AND
  lesson_id IN (
    SELECT id FROM lessons WHERE course_id IN (
      SELECT course_id FROM enrollments WHERE user_id = auth.uid()
      UNION
      SELECT id FROM courses WHERE is_preview = true
    )
  )
);

-- Alternative simplified policy if enrollments table doesn't exist yet
-- Uncomment the following and comment out the above policy if needed:
/*
CREATE POLICY "Users can view questions for active quizzes" ON quiz_questions
FOR SELECT TO authenticated USING (
  lesson_id IN (
    SELECT lesson_id FROM quizzes WHERE is_active = true
  ) AND
  lesson_id IN (
    SELECT id FROM lessons WHERE is_preview = true
  )
);
*/

-- Create RLS policies for quiz_options table - simplified version
CREATE POLICY "Users can view options for active quiz questions" ON quiz_options
FOR SELECT TO authenticated USING (
  question_id IN (
    SELECT id FROM quiz_questions WHERE lesson_id IN (
      SELECT lesson_id FROM quizzes WHERE is_active = true
    ) AND
    lesson_id IN (
      SELECT id FROM lessons WHERE course_id IN (
        SELECT course_id FROM enrollments WHERE user_id = auth.uid()
        UNION
        SELECT id FROM courses WHERE is_preview = true
      )
    )
  )
);

-- Alternative simplified policy if enrollments table doesn't exist yet
-- Uncomment the following and comment out the above policy if needed:
/*
CREATE POLICY "Users can view options for active quiz questions" ON quiz_options
FOR SELECT TO authenticated USING (
  question_id IN (
    SELECT id FROM quiz_questions WHERE lesson_id IN (
      SELECT lesson_id FROM quizzes WHERE is_active = true
    ) AND
    lesson_id IN (
      SELECT id FROM lessons WHERE is_preview = true
    )
  )
);
*/

-- Create RLS policies for quiz_submissions table
CREATE POLICY "Users can view their own submissions" ON quiz_submissions
FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all quiz submissions" ON quiz_submissions
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create RLS policies for quiz_answers table
CREATE POLICY "Users can view their own answers" ON quiz_answers
FOR ALL TO authenticated USING (
  submission_id IN (
    SELECT id FROM quiz_submissions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all quiz answers" ON quiz_answers
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Admin policy for all quiz tables
CREATE POLICY "Admins can manage all quizzes" ON quizzes
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage all quiz questions" ON quiz_questions
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage all quiz options" ON quiz_options
FOR ALL TO service_role USING (true) WITH CHECK (true);