-- Migration: Update course system schema with proper defaults and RLS policies
-- This migration ensures proper draft/published workflow for courses

-- Update default values for sort_order in existing tables
ALTER TABLE modules ALTER COLUMN order_index SET DEFAULT 1000;
ALTER TABLE lessons ALTER COLUMN order_index SET DEFAULT 1000;

-- Create proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_modules_course_sort_order 
ON modules(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_lessons_module_sort_order 
ON lessons(module_id, order_index);

CREATE INDEX IF NOT EXISTS idx_courses_published_created_at 
ON courses(is_published, created_at DESC);

-- Update RLS policies to ensure students can only see published content
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Everyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Everyone can view modules of published courses" ON modules;
DROP POLICY IF EXISTS "Everyone can view published lessons of published courses" ON lessons;

-- Create new RLS policies with clearer logic
CREATE POLICY "Students can view published courses" ON courses
  FOR SELECT USING (
    is_published = true
  );

CREATE POLICY "Students can view modules of published courses" ON modules
  FOR SELECT USING (
    (SELECT is_published FROM courses WHERE id = course_id) = true
  );

CREATE POLICY "Students can view published lessons of published courses" ON lessons
  FOR SELECT USING (
    is_published = true 
    AND (SELECT is_published FROM courses WHERE id = (SELECT course_id FROM modules WHERE id = module_id)) = true
  );

-- Ensure teachers and admins have full access
CREATE POLICY "Teachers and admins can manage courses" ON courses
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher', 'admin')
  );

CREATE POLICY "Teachers and admins can manage modules" ON modules
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher', 'admin')
  );

CREATE POLICY "Teachers and admins can manage lessons" ON lessons
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher', 'admin')
  );

-- Add comments for documentation
COMMENT ON INDEX idx_modules_course_sort_order IS 'Optimizes module retrieval by course with proper ordering';
COMMENT ON INDEX idx_lessons_module_sort_order IS 'Optimizes lesson retrieval by module with proper ordering';
COMMENT ON INDEX idx_courses_published_created_at IS 'Optimizes published course listings';