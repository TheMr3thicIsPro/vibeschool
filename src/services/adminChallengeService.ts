import { supabase } from '@/lib/supabase';
import { 
  Challenge, 
  ChallengeParticipant, 
  Submission, 
  ReviewSubmissionInput,
  ChallengeWithSubmissions,
  CreateChallengeInput,
  UpdateChallengeInput
} from '@/types/challenges';
import { deleteFile } from '@/services/storageService';

// Get all challenges (admin view - includes unpublished)
export const getAllChallengesAdmin = async (): Promise<ChallengeWithSubmissions[]> => {
  try {
    console.log('getAllChallengesAdmin: Fetching all challenges for admin');

    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        challenge_participants(
          *,
          profiles(username, full_name)
        ),
        submissions(
          *,
          profiles(username, full_name),
          reviewers:reviewed_by(username, full_name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getAllChallengesAdmin: Error fetching challenges:', error);
      throw error;
    }

    // Transform data
    const challenges = (data || []).map((challenge: any) => ({
      ...challenge,
      participant_count: challenge.challenge_participants?.length || 0,
      participants: challenge.challenge_participants?.map((p: any) => ({
        ...p,
        user: p.profiles
      })) || [],
      submissions: challenge.submissions?.map((s: any) => ({
        ...s,
        user: s.profiles,
        reviewer: s.reviewers
      })) || []
    }));

    console.log('getAllChallengesAdmin: Returning', challenges.length, 'challenges');
    return challenges as ChallengeWithSubmissions[];
  } catch (error) {
    console.error('getAllChallengesAdmin: Unexpected error:', error);
    throw error;
  }
};

// Review and approve/reject submission
export const reviewSubmission = async (
  input: ReviewSubmissionInput,
  reviewerId: string
): Promise<Submission> => {
  try {
    console.log('reviewSubmission: Reviewing submission:', input.submission_id, 'by:', reviewerId);

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', reviewerId)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can review submissions');
    }

    // Update submission
    const { data, error } = await supabase
      .from('submissions')
      .update({
        status: input.status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        feedback: input.feedback,
        is_winner: input.is_winner || false
      })
      .eq('id', input.submission_id)
      .select(`
        *,
        profiles(username, full_name),
        reviewers:reviewed_by(username, full_name)
      `)
      .single();

    if (error) {
      console.error('reviewSubmission: Error reviewing submission:', error);
      throw error;
    }

    console.log('reviewSubmission: Successfully reviewed submission:', data.id);
    return {
      ...data,
      user: (data as any).profiles,
      reviewer: (data as any).reviewers
    } as Submission;
  } catch (error) {
    console.error('reviewSubmission: Unexpected error:', error);
    throw error;
  }
};

// Get all submissions for a challenge (admin view)
export const getChallengeSubmissionsAdmin = async (challengeId: string): Promise<Submission[]> => {
  try {
    console.log('getChallengeSubmissionsAdmin: Fetching submissions for challenge:', challengeId);

    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        profiles(username, full_name),
        reviewers:reviewed_by(username, full_name)
      `)
      .eq('challenge_id', challengeId)
      .order('submitted_at', { ascending: true });

    if (error) {
      console.error('getChallengeSubmissionsAdmin: Error fetching submissions:', error);
      throw error;
    }

    const submissions = (data || []).map((submission: any) => ({
      ...submission,
      user: submission.profiles,
      reviewer: submission.reviewers
    }));

    console.log('getChallengeSubmissionsAdmin: Returning', submissions.length, 'submissions');
    return submissions as Submission[];
  } catch (error) {
    console.error('getChallengeSubmissionsAdmin: Unexpected error:', error);
    throw error;
  }
};

// Delete submission (admin only)
export const deleteSubmission = async (submissionId: string, adminId: string): Promise<void> => {
  try {
    console.log('deleteSubmission: Deleting submission:', submissionId, 'by admin:', adminId);

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can delete submissions');
    }

    // Get submission to check for files to delete
    const { data: submission } = await supabase
      .from('submissions')
      .select('file_url, challenge_id, user_id')
      .eq('id', submissionId)
      .single();

    if (submission?.file_url) {
      // Delete associated file
      const filePath = `${submission.user_id}/${submission.challenge_id}/${submission.file_url.split('/').pop()}`;
      await deleteFile('challenge-submissions', filePath);
    }

    // Delete submission record
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', submissionId);

    if (error) {
      console.error('deleteSubmission: Error deleting submission:', error);
      throw error;
    }

    console.log('deleteSubmission: Successfully deleted submission:', submissionId);
  } catch (error) {
    console.error('deleteSubmission: Unexpected error:', error);
    throw error;
  }
};

// Get challenge participants (admin view)
export const getChallengeParticipantsAdmin = async (challengeId: string): Promise<ChallengeParticipant[]> => {
  try {
    console.log('getChallengeParticipantsAdmin: Fetching participants for challenge:', challengeId);

    const { data, error } = await supabase
      .from('challenge_participants')
      .select(`
        *,
        profiles(username, full_name, email)
      `)
      .eq('challenge_id', challengeId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('getChallengeParticipantsAdmin: Error fetching participants:', error);
      throw error;
    }

    const participants = (data || []).map((participant: any) => ({
      ...participant,
      user: participant.profiles
    }));

    console.log('getChallengeParticipantsAdmin: Returning', participants.length, 'participants');
    return participants as ChallengeParticipant[];
  } catch (error) {
    console.error('getChallengeParticipantsAdmin: Unexpected error:', error);
    throw error;
  }
};

// Remove participant from challenge (admin only)
export const removeParticipant = async (
  challengeId: string, 
  userId: string, 
  adminId: string
): Promise<void> => {
  try {
    console.log('removeParticipant: Removing user:', userId, 'from challenge:', challengeId, 'by admin:', adminId);

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can remove participants');
    }

    const { error } = await supabase
      .from('challenge_participants')
      .delete()
      .eq('challenge_id', challengeId)
      .eq('user_id', userId);

    if (error) {
      console.error('removeParticipant: Error removing participant:', error);
      throw error;
    }

    console.log('removeParticipant: Successfully removed participant');
  } catch (error) {
    console.error('removeParticipant: Unexpected error:', error);
    throw error;
  }
};

// Update participant payment status (admin only)
export const updateParticipantPayment = async (
  participantId: string,
  paymentStatus: 'paid' | 'refunded' | 'failed',
  adminId: string
): Promise<ChallengeParticipant> => {
  try {
    console.log('updateParticipantPayment: Updating payment status for participant:', participantId, 'by admin:', adminId);

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can update payment status');
    }

    const { data, error } = await supabase
      .from('challenge_participants')
      .update({
        payment_status: paymentStatus
      })
      .eq('id', participantId)
      .select(`
        *,
        profiles(username, full_name)
      `)
      .single();

    if (error) {
      console.error('updateParticipantPayment: Error updating payment status:', error);
      throw error;
    }

    console.log('updateParticipantPayment: Successfully updated payment status');
    return {
      ...data,
      user: (data as any).profiles
    } as ChallengeParticipant;
  } catch (error) {
    console.error('updateParticipantPayment: Unexpected error:', error);
    throw error;
  }
};

// Get admin dashboard statistics
export const getAdminStats = async (): Promise<any> => {
  try {
    console.log('getAdminStats: Fetching admin statistics');

    // Get challenge counts by status
    const now = new Date().toISOString();
    
    const { count: totalChallenges } = await supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true });

    const { count: publishedChallenges } = await supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    const { count: draftChallenges } = await supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', false);

    const { count: activeChallenges } = await supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true })
      .lte('start_date', now)
      .gte('end_date', now);

    // Get participant statistics
    const { count: totalParticipants } = await supabase
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true });

    const { count: paidParticipants } = await supabase
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'paid');

    // Get submission statistics
    const { count: totalSubmissions } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true });

    const { count: pendingReview } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted');

    const { count: approvedSubmissions } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    const { count: rejectedSubmissions } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected');

    const stats = {
      challenges: {
        total: totalChallenges || 0,
        published: publishedChallenges || 0,
        drafts: draftChallenges || 0,
        active: activeChallenges || 0
      },
      participants: {
        total: totalParticipants || 0,
        paid: paidParticipants || 0
      },
      submissions: {
        total: totalSubmissions || 0,
        pending_review: pendingReview || 0,
        approved: approvedSubmissions || 0,
        rejected: rejectedSubmissions || 0
      }
    };

    console.log('getAdminStats: Returning statistics');
    return stats;
  } catch (error) {
    console.error('getAdminStats: Unexpected error:', error);
    throw error;
  }
};

// Bulk update submissions status
export const bulkUpdateSubmissions = async (
  submissionIds: string[],
  status: 'approved' | 'rejected',
  reviewerId: string
): Promise<Submission[]> => {
  try {
    console.log('bulkUpdateSubmissions: Updating', submissionIds.length, 'submissions by:', reviewerId);

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', reviewerId)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can bulk update submissions');
    }

    const updates = submissionIds.map(id => ({
      id,
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('submissions')
      .upsert(updates)
      .select(`
        *,
        profiles(username, full_name),
        reviewers:reviewed_by(username, full_name)
      `);

    if (error) {
      console.error('bulkUpdateSubmissions: Error updating submissions:', error);
      throw error;
    }

    const submissions = (data || []).map((submission: any) => ({
      ...submission,
      user: submission.profiles,
      reviewer: submission.reviewers
    }));

    console.log('bulkUpdateSubmissions: Successfully updated', submissions.length, 'submissions');
    return submissions as Submission[];
  } catch (error) {
    console.error('bulkUpdateSubmissions: Unexpected error:', error);
    throw error;
  }
};

// Create challenge (admin only)
export const createChallengeAdmin = async (
  input: CreateChallengeInput,
  adminId: string
): Promise<Challenge> => {
  try {
    console.log('createChallengeAdmin: Creating challenge by admin:', adminId, input.title);

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can create challenges');
    }

    const payload = {
      title: input.title,
      description: input.description,
      type: input.type,
      entry_fee: input.entry_fee ?? 0,
      prize_pool: input.prize_pool ?? 0,
      start_date: input.start_date,
      end_date: input.end_date,
      submission_deadline: input.submission_deadline,
      max_participants: input.max_participants ?? null,
      is_published: input.is_published ?? false,
      created_by: adminId
    };

    const { data, error } = await supabase
      .from('challenges')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('createChallengeAdmin: Error creating challenge:', error);
      throw error;
    }

    console.log('createChallengeAdmin: Challenge created:', data.id);
    return data as Challenge;
  } catch (error) {
    console.error('createChallengeAdmin: Unexpected error:', error);
    throw error;
  }
};

// Update challenge (admin only)
export const updateChallengeAdmin = async (
  input: UpdateChallengeInput,
  adminId: string
): Promise<Challenge> => {
  try {
    console.log('updateChallengeAdmin: Updating challenge:', input.id, 'by admin:', adminId);

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can update challenges');
    }

    // Build update payload filtering out undefined
    const updatePayload: any = {};
    const keys: (keyof UpdateChallengeInput)[] = [
      'title', 'description', 'type', 'entry_fee', 'prize_pool',
      'start_date', 'end_date', 'submission_deadline', 'max_participants', 'is_published'
    ];
    keys.forEach((key) => {
      const value = input[key];
      if (value !== undefined) {
        updatePayload[key] = value;
      }
    });
    updatePayload['updated_at'] = new Date().toISOString();

    const { data, error } = await supabase
      .from('challenges')
      .update(updatePayload)
      .eq('id', input.id)
      .select('*')
      .single();

    if (error) {
      console.error('updateChallengeAdmin: Error updating challenge:', error);
      throw error;
    }

    console.log('updateChallengeAdmin: Challenge updated:', data.id);
    return data as Challenge;
  } catch (error) {
    console.error('updateChallengeAdmin: Unexpected error:', error);
    throw error;
  }
};

// Publish/Unpublish challenge (admin only)
export const publishChallengeAdmin = async (
  challengeId: string,
  publish: boolean,
  adminId: string
): Promise<Challenge> => {
  try {
    console.log('publishChallengeAdmin: Setting publish to', publish, 'for challenge:', challengeId);

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can publish challenges');
    }

    const { data, error } = await supabase
      .from('challenges')
      .update({ is_published: publish, updated_at: new Date().toISOString() })
      .eq('id', challengeId)
      .select('*')
      .single();

    if (error) {
      console.error('publishChallengeAdmin: Error updating publish status:', error);
      throw error;
    }

    console.log('publishChallengeAdmin: Publish status updated for challenge:', data.id);
    return data as Challenge;
  } catch (error) {
    console.error('publishChallengeAdmin: Unexpected error:', error);
    throw error;
  }
};

// Delete challenge (admin only) - also clean up submission files
export const deleteChallengeAdmin = async (
  challengeId: string,
  adminId: string
): Promise<void> => {
  try {
    console.log('deleteChallengeAdmin: Deleting challenge:', challengeId, 'by admin:', adminId);

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can delete challenges');
    }

    // Fetch submissions to delete files from storage
    const { data: subs } = await supabase
      .from('submissions')
      .select('file_url, user_id, challenge_id')
      .eq('challenge_id', challengeId);

    if (subs && subs.length > 0) {
      for (const s of subs) {
        if (s.file_url) {
          const fileName = s.file_url.split('/').pop();
          if (fileName) {
            const filePath = `${s.user_id}/${s.challenge_id}/${fileName}`;
            try {
              await deleteFile('challenge-submissions', filePath);
            } catch (e) {
              console.warn('deleteChallengeAdmin: Failed to delete file from storage:', filePath, e);
            }
          }
        }
      }
    }

    // Delete challenge (will cascade to participants and submissions)
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', challengeId);

    if (error) {
      console.error('deleteChallengeAdmin: Error deleting challenge:', error);
      throw error;
    }

    console.log('deleteChallengeAdmin: Challenge deleted:', challengeId);
  } catch (error) {
    console.error('deleteChallengeAdmin: Unexpected error:', error);
    throw error;
  }
};