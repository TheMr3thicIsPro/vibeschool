export type AssignmentSubmissionType = 'link' | 'file' | 'both';
export type AssignmentStatus = 'submitted' | 'changes_requested' | 'approved';

export interface Assignment {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  submission_type: AssignmentSubmissionType;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  link_url?: string | null;
  file_path?: string | null;
  status: AssignmentStatus;
  admin_feedback?: string | null;
  submitted_at: string;
  updated_at: string;
}
