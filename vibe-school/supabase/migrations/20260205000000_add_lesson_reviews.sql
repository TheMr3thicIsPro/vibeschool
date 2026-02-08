-- Lesson Reviews System Schema and RLS Policies

-- Ensure extensions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create lesson_reviews table
CREATE TABLE IF NOT EXISTS lesson_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lesson_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_reviews_lesson ON lesson_reviews(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_reviews_user ON lesson_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_reviews_rating ON lesson_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_lesson_reviews_anonymous ON lesson_reviews(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_lesson_reviews_created_at ON lesson_reviews(created_at);

-- Enable RLS
ALTER TABLE lesson_reviews ENABLE ROW LEVEL SECURITY;

-- RLS: Users can select their own reviews only
CREATE POLICY "Users can select their own lesson reviews" ON lesson_reviews
  FOR SELECT USING (user_id = auth.uid());

-- Helper condition to check lesson accessibility aligned with existing policies
-- Users can insert/update only for lessons they can access
CREATE POLICY "Users can insert their own lesson reviews for accessible lessons" ON lesson_reviews
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND EXISTS (
      SELECT 1
      FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE l.id = lesson_id
        AND l.is_published = TRUE
        AND c.is_published = TRUE
        AND (
          (SELECT plan FROM profiles WHERE id = auth.uid()) = 'member'
          OR (
            (SELECT plan FROM profiles WHERE id = auth.uid()) = 'free'
            AND NOT is_trial_expired(auth.uid())
          )
          OR (
            l.is_preview = TRUE
            AND (SELECT plan FROM profiles WHERE id = auth.uid()) = 'free'
          )
        )
    )
  );

CREATE POLICY "Users can update their own lesson reviews for accessible lessons" ON lesson_reviews
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND EXISTS (
      SELECT 1
      FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE l.id = lesson_id
        AND l.is_published = TRUE
        AND c.is_published = TRUE
        AND (
          (SELECT plan FROM profiles WHERE id = auth.uid()) = 'member'
          OR (
            (SELECT plan FROM profiles WHERE id = auth.uid()) = 'free'
            AND NOT is_trial_expired(auth.uid())
          )
          OR (
            l.is_preview = TRUE
            AND (SELECT plan FROM profiles WHERE id = auth.uid()) = 'free'
          )
        )
    )
  );

-- Admins can view all reviews
CREATE POLICY "Admins can view all lesson reviews" ON lesson_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Optional: Admins can delete reviews (for moderation)
-- Uncomment if needed
-- CREATE POLICY "Admins can delete any lesson review" ON lesson_reviews
--   FOR DELETE USING (
--     EXISTS (
--       SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
--     )
--   );

-- Trigger to auto-update updated_at
CREATE TRIGGER update_lesson_reviews_updated_at
  BEFORE UPDATE ON lesson_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;