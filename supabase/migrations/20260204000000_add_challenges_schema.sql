-- Challenges System Database Schema
-- This migration creates all necessary tables and RLS policies for the VibeSchool Challenges system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('free', 'paid')),
  entry_fee DECIMAL(10,2) DEFAULT 0.00,
  prize_pool DECIMAL(10,2) DEFAULT 0.00,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  submission_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (start_date < end_date AND end_date <= submission_deadline),
  CONSTRAINT positive_fees CHECK (entry_fee >= 0 AND prize_pool >= 0),
  CONSTRAINT paid_challenge_requirements CHECK (
    (type = 'free' AND entry_fee = 0 AND prize_pool = 0) OR
    (type = 'paid' AND entry_fee > 0 AND prize_pool > 0)
  )
);

-- Create challenge_participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  payment_intent_id VARCHAR(255),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(challenge_id, user_id)
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT,
  file_name VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100),
  submission_notes TEXT,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  is_winner BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(challenge_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenges_published ON challenges(is_published);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Challenges table policies
CREATE POLICY "Public can view published challenges" ON challenges
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can view challenges they've joined" ON challenges
  FOR SELECT USING (
    id IN (
      SELECT challenge_id FROM challenge_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all challenges" ON challenges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create challenges" ON challenges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update challenges" ON challenges
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete challenges" ON challenges
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Challenge participants table policies
CREATE POLICY "Users can view their own participation" ON challenge_participants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own participation" ON challenge_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" ON challenge_participants
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all participation" ON challenge_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all participation" ON challenge_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Submissions table policies
CREATE POLICY "Users can view their own submissions" ON submissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own submissions" ON submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own submissions" ON submissions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all submissions" ON submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage bucket for challenge submissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('challenge-submissions', 'challenge-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for challenge submissions
CREATE POLICY "Users can upload to their own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'challenge-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'challenge-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'challenge-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can select their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'challenge-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can manage all challenge files" ON storage.objects
  FOR ALL USING (
    bucket_id = 'challenge-submissions'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_challenges_updated_at 
    BEFORE UPDATE ON challenges 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- INSERT INTO challenges (title, description, type, entry_fee, prize_pool, start_date, end_date, submission_deadline, is_published, created_by)
-- VALUES 
--   ('Web Game Challenge', 'Create an interactive web-based game using HTML, CSS, and JavaScript', 'free', 0, 0, NOW(), NOW() + INTERVAL '7 days', NOW() + INTERVAL '10 days', true, 'admin-user-id'),
--   ('AI Prompt Engineering Contest', 'Showcase your prompt engineering skills with creative AI applications', 'paid', 25.00, 100.00, NOW() + INTERVAL '1 day', NOW() + INTERVAL '14 days', NOW() + INTERVAL '16 days', true, 'admin-user-id');

COMMIT;