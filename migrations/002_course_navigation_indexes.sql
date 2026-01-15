-- Migration: Add indexes for course navigation performance
-- This migration adds indexes to optimize course navigation queries

-- Index for getting user progress by course
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_course 
ON user_lesson_progress(user_id) 
WHERE completed = true;

-- Index for getting lessons by module with ordering
CREATE INDEX IF NOT EXISTS idx_lessons_module_published_order 
ON lessons(module_id, is_published, order_index);

-- Index for getting modules by course with ordering
CREATE INDEX IF NOT EXISTS idx_modules_course_published_order 
ON modules(course_id, order_index) 
WHERE course_id IS NOT NULL;

-- Composite index for user progress lookups
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lookup 
ON user_lesson_progress(user_id, lesson_id, completed, updated_at);

-- Index for course publication status
CREATE INDEX IF NOT EXISTS idx_courses_published 
ON courses(is_published, created_at DESC);

-- Index for lesson preview status
CREATE INDEX IF NOT EXISTS idx_lessons_preview 
ON lessons(is_preview, is_published) 
WHERE is_preview = true;

-- Index for user progress completion tracking
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_completion 
ON user_lesson_progress(user_id, completed) 
WHERE completed = false;

COMMENT ON INDEX idx_user_lesson_progress_user_course IS 'Optimizes queries for completed lessons by user';
COMMENT ON INDEX idx_lessons_module_published_order IS 'Optimizes lesson retrieval by module with proper ordering';
COMMENT ON INDEX idx_modules_course_published_order IS 'Optimizes module retrieval by course with proper ordering';
COMMENT ON INDEX idx_user_lesson_progress_lookup IS 'Optimizes user progress lookups by lesson';
COMMENT ON INDEX idx_courses_published IS 'Optimizes published course listings';
COMMENT ON INDEX idx_lessons_preview IS 'Optimizes preview lesson discovery';
COMMENT ON INDEX idx_user_lesson_progress_completion IS 'Optimizes incomplete lesson tracking';