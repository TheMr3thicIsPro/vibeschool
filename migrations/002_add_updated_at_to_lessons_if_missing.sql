-- Migration to ensure lessons table has updated_at column with trigger
-- This addresses the 400 error where column 'lessons.updated_at does not exist'

-- Add updated_at column to lessons table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'lessons' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE lessons ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for lessons table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers 
                   WHERE trigger_name = 'update_lessons_updated_at'
                   AND event_object_table = 'lessons') THEN
        CREATE TRIGGER update_lessons_updated_at 
            BEFORE UPDATE ON lessons 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;