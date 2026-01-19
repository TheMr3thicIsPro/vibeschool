// Quiz-related type definitions

export type QuizType = 'multiple_choice' | 'short_answer';

export type QuizQuestion = {
  id: string;
  lesson_id: string;
  question_text: string;
  question_type: QuizType;
  order_index: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
};

export type QuizOption = {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type QuizSubmission = {
  id: string;
  user_id: string;
  lesson_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  created_at: string;
  updated_at: string;
};

export type QuizAnswer = {
  id: string;
  submission_id: string;
  question_id: string;
  selected_option_id?: string; // For multiple choice
  answer_text?: string; // For short answer
  is_correct: boolean;
  created_at: string;
  updated_at: string;
};

export type QuizWithQuestions = {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions: (QuizQuestion & {
    options?: QuizOption[];
  })[];
};