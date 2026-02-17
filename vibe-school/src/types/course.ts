// Course type definition
export type Course = {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type LessonResource = {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number | null;
  file_type: string; // 'source', 'asset', 'archive', 'pdf', 'other'
  exercise_type: 'none' | 'debug' | 'complete' | 'recreate';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
};

export type ResourceSubmission = {
  id: string;
  resource_id: string;
  user_id: string;
  submission_file_url: string | null;
  submission_text: string | null;
  status: 'pending' | 'approved' | 'changes_requested';
  feedback: string | null;
  submitted_at: string;
  updated_at: string;
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order_index: number;
  video_provider: string;
  video_url: string | null;
  youtube_video_id: string | null;
  is_preview: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};