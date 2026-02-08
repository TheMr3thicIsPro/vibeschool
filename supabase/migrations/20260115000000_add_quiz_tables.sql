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
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_answers table
CREATE TABLE quiz_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES quiz_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES quiz_options(id),
  answer_text TEXT,
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX idx_quiz_questions_lesson_id ON quiz_questions(lesson_id);
CREATE INDEX idx_quiz_questions_order ON quiz_questions(order_index);
CREATE INDEX idx_quiz_options_question_id ON quiz_options(question_id);
CREATE INDEX idx_quiz_submissions_user_lesson ON quiz_submissions(user_id, lesson_id);
CREATE INDEX idx_quiz_answers_submission_id ON quiz_answers(submission_id);
CREATE INDEX idx_quiz_answers_question_id ON quiz_answers(question_id);

-- Enable Row Level Security (RLS) for quiz tables
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quizzes
CREATE POLICY "Users can view quizzes for lessons they have access to" ON quizzes FOR
  SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE quizzes.lesson_id = l.id
      AND (
        l.is_preview = true 
        OR c.is_published = true
        OR auth.uid() = (
          SELECT user_id FROM user_course_enrollments WHERE course_id = c.id
        )
      )
    )
  );

CREATE POLICY "Instructors and admins can manage quizzes" ON quizzes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM lessons l
    WHERE quizzes.lesson_id = l.id
    AND (
      l.module_id IN (
        SELECT m.id FROM modules m
        JOIN courses c ON m.course_id = c.id
        WHERE c.created_by = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);

-- Create RLS policies for quiz_questions
CREATE POLICY "Users can view quiz questions for lessons they have access to" ON quiz_questions FOR
  SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE quiz_questions.lesson_id = l.id
      AND (
        l.is_preview = true 
        OR c.is_published = true
        OR auth.uid() = (
          SELECT user_id FROM user_course_enrollments WHERE course_id = c.id
        )
      )
    )
  );

CREATE POLICY "Instructors and admins can manage quiz questions" ON quiz_questions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM lessons l
    WHERE quiz_questions.lesson_id = l.id
    AND (
      l.module_id IN (
        SELECT m.id FROM modules m
        JOIN courses c ON m.course_id = c.id
        WHERE c.created_by = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);

-- Create RLS policies for quiz_options
CREATE POLICY "Users can view quiz options for lessons they have access to" ON quiz_options FOR
  SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_questions q_q
      JOIN lessons l ON q_q.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE quiz_options.question_id = q_q.id
      AND (
        l.is_preview = true 
        OR c.is_published = true
        OR auth.uid() = (
          SELECT user_id FROM user_course_enrollments WHERE course_id = c.id
        )
      )
    )
  );

CREATE POLICY "Instructors and admins can manage quiz options" ON quiz_options FOR ALL USING (
  EXISTS (
    SELECT 1 FROM quiz_questions q_q
    JOIN lessons l ON q_q.lesson_id = l.id
    WHERE quiz_options.question_id = q_q.id
    AND (
      l.module_id IN (
        SELECT m.id FROM modules m
        JOIN courses c ON m.course_id = c.id
        WHERE c.created_by = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);

-- Create RLS policies for quiz_submissions
CREATE POLICY "Users can view their own submissions" ON quiz_submissions FOR
  SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions" ON quiz_submissions FOR
  INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions" ON quiz_submissions FOR
  UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Instructors and admins can view all submissions" ON quiz_submissions FOR
  SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE quiz_submissions.lesson_id = l.id
      AND (
        c.created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Create RLS policies for quiz_answers
CREATE POLICY "Users can view their own answers" ON quiz_answers FOR
  SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_submissions qs
      WHERE quiz_answers.submission_id = qs.id
      AND qs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create answers for their submissions" ON quiz_answers FOR
  INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_submissions qs
      WHERE quiz_answers.submission_id = qs.id
      AND qs.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors and admins can view all answers" ON quiz_answers FOR
  SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_submissions qs
      JOIN lessons l ON qs.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE quiz_answers.submission_id = qs.id
      AND (
        c.created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );