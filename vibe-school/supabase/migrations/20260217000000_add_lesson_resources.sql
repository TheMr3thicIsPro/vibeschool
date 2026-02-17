-- Lesson Resources System
-- Allows instructors to upload files (code, assets, etc.) to lessons and students to download/submit work.

-- 1. Create lesson_resources table
CREATE TABLE IF NOT EXISTS lesson_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(50) DEFAULT 'other', -- e.g., 'source', 'asset', 'archive', 'pdf'
  exercise_type VARCHAR(20) DEFAULT 'none', -- 'none', 'debug', 'complete', 'recreate'
  difficulty VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create resource_submissions table
CREATE TABLE IF NOT EXISTS resource_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES lesson_resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submission_file_url TEXT,
  submission_text TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'changes_requested'
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(resource_id, user_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_resource_submissions_resource ON resource_submissions(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_submissions_user ON resource_submissions(user_id);

-- 4. RLS Policies

-- lesson_resources
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view resources for published lessons" ON lesson_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_resources.lesson_id 
      AND lessons.is_published = true
    )
  );

CREATE POLICY "Admins can manage all resources" ON lesson_resources
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- resource_submissions
ALTER TABLE resource_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own submissions" ON resource_submissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own submissions" ON resource_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own submissions" ON resource_submissions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all submissions" ON resource_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage all submissions" ON resource_submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Storage Buckets

-- lesson-resources bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-resources', 'lesson-resources', true)
ON CONFLICT (id) DO NOTHING;

-- resource-submissions bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resource-submissions', 'resource-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies

-- lesson-resources (Public Read, Admin Write)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'lesson-resources');

CREATE POLICY "Admin Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lesson-resources' 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin Update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'lesson-resources' 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'lesson-resources' 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- resource-submissions (Authenticated Read Own/Admin, Authenticated Write Own)
CREATE POLICY "Users can upload submissions" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resource-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own submissions" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resource-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all submissions" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resource-submissions'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Triggers for updated_at
CREATE TRIGGER update_lesson_resources_updated_at 
    BEFORE UPDATE ON lesson_resources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_submissions_updated_at 
    BEFORE UPDATE ON resource_submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
