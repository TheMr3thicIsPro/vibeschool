// Course type definition
export type Course = {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  created_at: string;
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