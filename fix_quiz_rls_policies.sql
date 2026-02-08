-- Fix RLS policies for quiz tables
-- This script updates the policies to properly allow service role access
-- Run this in your Supabase SQL Editor

-- Drop existing policies that may be causing issues
DROP POLICY IF EXISTS "Admin can manage all quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can view active quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admin can manage all quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can view quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Admin can manage all quiz options" ON quiz_options;
DROP POLICY IF EXISTS "Users can view quiz options" ON quiz_options;
DROP POLICY IF EXISTS "Admin can manage all quiz submissions" ON quiz_submissions;
DROP POLICY IF EXISTS "Users can manage own submissions" ON quiz_submissions;
DROP POLICY IF EXISTS "Admin can manage all quiz answers" ON quiz_answers;
DROP POLICY IF EXISTS "Users can manage own answers" ON quiz_answers;

-- Recreate policies with proper permissions for service_role
CREATE POLICY "Admin can manage all quizzes" ON quizzes
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view active quizzes" ON quizzes
FOR SELECT TO authenticated USING (
  is_active = true
);

CREATE POLICY "Admin can manage all quiz questions" ON quiz_questions
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view quiz questions" ON quiz_questions
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage all quiz options" ON quiz_options
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view quiz options" ON quiz_options
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage all quiz submissions" ON quiz_submissions
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage own submissions" ON quiz_submissions
FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admin can manage all quiz answers" ON quiz_answers
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage own answers" ON quiz_answers
FOR ALL TO authenticated USING (
  submission_id IN (SELECT id FROM quiz_submissions WHERE user_id = auth.uid())
);