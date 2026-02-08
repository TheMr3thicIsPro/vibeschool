// Challenge System Types

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'free' | 'paid';
  entry_fee: number;
  prize_pool: number;
  start_date: string;
  end_date: string;
  submission_deadline: string;
  max_participants?: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  participant_count?: number;
  time_remaining?: string;
  status?: 'upcoming' | 'active' | 'ended' | 'closed';
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  payment_intent_id?: string;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  joined_at: string;
  
  // Related data
  challenge?: Challenge;
  user?: {
    id: string;
    username: string;
    full_name?: string;
  };
  // Optional computed flag, populated by services when winner info is available
  is_winner?: boolean;
}

export interface Submission {
  id: string;
  challenge_id: string;
  user_id: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  submission_notes?: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  feedback?: string;
  is_winner: boolean;
  submitted_at: string;
  updated_at: string;
  
  // Related data
  challenge?: Challenge;
  user?: {
    id: string;
    username: string;
    full_name?: string;
  };
  reviewer?: {
    id: string;
    username: string;
    full_name?: string;
  };
}

export interface ChallengeWithParticipants extends Challenge {
  participant_count: number;
  participants?: ChallengeParticipant[];
  user_participation?: ChallengeParticipant | null;
}

export interface ChallengeWithSubmissions extends ChallengeWithParticipants {
  submissions?: Submission[];
}

export interface CreateChallengeInput {
  title: string;
  description: string;
  type: 'free' | 'paid';
  entry_fee?: number;
  prize_pool?: number;
  start_date: string;
  end_date: string;
  submission_deadline: string;
  max_participants?: number;
  is_published?: boolean;
}

export interface UpdateChallengeInput extends Partial<CreateChallengeInput> {
  id: string;
}

export interface JoinChallengeInput {
  challenge_id: string;
  payment_method_id?: string; // For paid challenges
}

export interface SubmitChallengeInput {
  challenge_id: string;
  file?: File;
  submission_notes?: string;
}

export interface ReviewSubmissionInput {
  submission_id: string;
  status: 'approved' | 'rejected';
  feedback?: string;
  is_winner?: boolean;
}

export interface ChallengeFilters {
  type?: 'free' | 'paid' | 'all';
  status?: 'upcoming' | 'active' | 'ended' | 'all';
  search?: string;
  sortBy?: 'created_at' | 'start_date' | 'participant_count';
  sortOrder?: 'asc' | 'desc';
}

export interface ChallengeStats {
  total_challenges: number;
  active_challenges: number;
  upcoming_challenges: number;
  ended_challenges: number;
  total_participants: number;
  total_submissions: number;
  total_prize_pool: number;
}

// Enums
export enum ChallengeStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  ENDED = 'ended',
  CLOSED = 'closed'
}

export enum ChallengeType {
  FREE = 'free',
  PAID = 'paid'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}