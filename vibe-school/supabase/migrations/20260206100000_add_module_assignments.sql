-- Module Assignments System
-- This migration creates tables and RLS policies for the VibeSchool Module Assignments

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  submission_type VARCHAR(20) NOT NULL CHECK (submission_type IN ('link', 'file', 'both')),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one assignment per lesson
  UNIQUE(lesson_id)
);

-- Create assignment_submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  link_url TEXT,
  file_path TEXT,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'changes_requested', 'approved')),
  admin_feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one submission per user per assignment
  UNIQUE(assignment_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assignments_lesson ON assignments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_user ON assignment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Assignments policies
CREATE POLICY "Public can view published assignments" ON assignments
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can view all assignments" ON assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage assignments" ON assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Assignment Submissions policies
CREATE POLICY "Users can view their own submissions" ON assignment_submissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own submissions" ON assignment_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own submissions" ON assignment_submissions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all submissions" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage all submissions" ON assignment_submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create storage bucket for assignment submissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-submissions', 'assignment-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload to their own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assignment-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'assignment-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'assignment-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can select their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assignment-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can manage all assignment files" ON storage.objects
  FOR ALL USING (
    bucket_id = 'assignment-submissions'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_assignments_updated_at 
    BEFORE UPDATE ON assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_submissions_updated_at 
    BEFORE UPDATE ON assignment_submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
