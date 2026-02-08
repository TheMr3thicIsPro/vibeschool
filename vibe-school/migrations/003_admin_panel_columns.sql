-- Admin Panel Columns Migration

-- Ensure all required columns exist for the admin panel functionality

-- The schema already includes all required columns, but let's make sure the lessons table has all needed fields
-- We need to ensure that the lessons table has the necessary boolean flags for admin panel functionality

-- Add missing columns if they don't exist (idempotent approach)
DO $$ 
BEGIN
    -- Check if is_free column exists (mapping to is_preview since they serve similar purposes)
    -- In our schema, is_preview already exists, so we'll map it appropriately
    
    -- Ensure all required columns exist in lessons table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'lessons' AND column_name = 'is_preview') THEN
        ALTER TABLE lessons ADD COLUMN is_preview BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'lessons' AND column_name = 'is_published') THEN
        ALTER TABLE lessons ADD COLUMN is_published BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'lessons' AND column_name = 'order_index') THEN
        ALTER TABLE lessons ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;
    
    -- Update any existing records that might have NULL values for the new defaults
    UPDATE lessons SET is_preview = FALSE WHERE is_preview IS NULL;
    UPDATE lessons SET is_published = TRUE WHERE is_published IS NULL;
    UPDATE lessons SET order_index = 0 WHERE order_index IS NULL;
    
    -- Update the modules table to ensure order_index exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'modules' AND column_name = 'order_index') THEN
        ALTER TABLE modules ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;
    
    -- Update any existing records that might have NULL values for the new defaults
    UPDATE modules SET order_index = 0 WHERE order_index IS NULL;
    
    -- Ensure courses table has is_published column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'is_published') THEN
        ALTER TABLE courses ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Update any existing records that might have NULL values for the new defaults
    UPDATE courses SET is_published = FALSE WHERE is_published IS NULL;
END $$;

-- Update the RLS policies to ensure proper access control for admin panel
-- The existing policies should already be sufficient, but let's make sure they're correct

-- Make sure the policies exist as they were in the original schema
-- (This is idempotent and won't cause issues if they already exist)

-- Courses policies
DROP POLICY IF EXISTS "Teachers and admins can manage courses" ON courses;
CREATE POLICY "Teachers and admins can manage courses" ON courses
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher', 'admin')
  );

-- Modules policies
DROP POLICY IF EXISTS "Teachers and admins can manage modules" ON modules;
CREATE POLICY "Teachers and admins can manage modules" ON modules
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher', 'admin')
  );

-- Lessons policies
DROP POLICY IF EXISTS "Teachers and admins can manage lessons" ON lessons;
CREATE POLICY "Teachers and admins can manage lessons" ON lessons
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher', 'admin')
  );