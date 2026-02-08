import { supabase } from '@/lib/supabase';
import {
  Challenge,
  ChallengeParticipant,
  Submission,
  ChallengeWithParticipants,
  ChallengeWithSubmissions,
  JoinChallengeInput,
  SubmitChallengeInput,
  ChallengeFilters,
  ChallengeStatus,
} from '@/types/challenges';
import { uploadFile, deleteFile } from '@/services/storageService';

// Utilities
const toISO = (date: Date) => date.toISOString();

function computeStatus(challenge: Challenge): ChallengeStatus {
  const now = new Date();
  const start = new Date(challenge.start_date);
  const end = new Date(challenge.end_date);
  if (now < start) return ChallengeStatus.UPCOMING;
  if (now > end) return ChallengeStatus.ENDED;
  return ChallengeStatus.ACTIVE;
}

function enhanceChallenge(base: any): ChallengeWithParticipants {
  const participantCount = base.challenge_participants?.length || 0;
  const status = computeStatus(base as Challenge);
  return {
    ...(base as Challenge),
    participant_count: participantCount,
    status,
    participants: base.challenge_participants?.map((p: any) => ({
      ...p,
      user: p.profiles,
    })) || [],
  };
}

// Get all published challenges with optional filters
export const getChallenges = async (
  filters: ChallengeFilters = {}
): Promise<ChallengeWithParticipants[]> => {
  try {
    console.log('challengeService.getChallenges: fetching with filters', filters);

    let query = supabase
      .from('challenges')
      .select(`
        *,
        challenge_participants(
          *,
          profiles(username, full_name)
        )
      `)
      .eq('is_published', true);

    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }
    if (filters.search) {
      // Simple ILIKE search on title/description
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    // Sort by created_at by default; complex sorts handled after fetch
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('challengeService.getChallenges: error fetching challenges', error);
      throw error;
    }

    let challenges = (data || []).map(enhanceChallenge);

    // Client-side status filtering
    if (filters.status && filters.status !== 'all') {
      challenges = challenges.filter((c: ChallengeWithParticipants) => c.status === filters.status);
    }

    // Client-side sort for fields like start_date or participant_count
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    challenges.sort((a: ChallengeWithParticipants, b: ChallengeWithParticipants) => {
      let av: any = (a as any)[sortBy];
      let bv: any = (b as any)[sortBy];
      if (sortBy === 'participant_count') {
        av = a.participant_count || 0;
        bv = b.participant_count || 0;
      }
      if (sortBy === 'start_date') {
        av = new Date(a.start_date).getTime();
        bv = new Date(b.start_date).getTime();
      }
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    console.log('challengeService.getChallenges: returning', challenges.length, 'challenges');
    return challenges;
  } catch (err) {
    console.error('challengeService.getChallenges: unexpected error', err);
    throw err;
  }
};

// Get challenges the user has joined
export const getUserChallenges = async (
  userId: string
): Promise<ChallengeWithParticipants[]> => {
  try {
    console.log('challengeService.getUserChallenges: fetching for user', userId);

    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        challenge_participants!inner(
          *,
          profiles(username, full_name)
        )
      `)
      .eq('challenge_participants.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('challengeService.getUserChallenges: error fetching', error);
      throw error;
    }

    const challenges = (data || []).map((c: any) => {
      const enhanced = enhanceChallenge(c);
      enhanced.user_participation = (c.challenge_participants || []).find(
        (p: any) => p.user_id === userId
      ) || null;
      return enhanced;
    });

    console.log('challengeService.getUserChallenges: returning', challenges.length, 'challenges');
    return challenges;
  } catch (err) {
    console.error('challengeService.getUserChallenges: unexpected error', err);
    throw err;
  }
};

// Get a single challenge by ID including participants and submissions
export const getChallengeById = async (
  challengeId: string,
  userId?: string
): Promise<ChallengeWithSubmissions | null> => {
  try {
    console.log('challengeService.getChallengeById: fetching challenge', challengeId, 'for user', userId);

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
      .eq('id', challengeId)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('challengeService.getChallengeById: error fetching', error);
      throw error;
    }

    const enhanced = enhanceChallenge(data);

    const submissions = (data.submissions || []).map((s: any) => ({
      ...s,
      user: s.profiles,
      reviewer: s.reviewers,
    }));

    const result: ChallengeWithSubmissions = {
      ...enhanced,
      submissions,
      user_participation: userId
        ? ((data.challenge_participants || []).find((p: any) => p.user_id === userId) || null)
        : null,
    };

    console.log('challengeService.getChallengeById: returning challenge', result.id);
    return result;
  } catch (err) {
    console.error('challengeService.getChallengeById: unexpected error', err);
    throw err;
  }
};

// Join a challenge with basic validations
export const joinChallenge = async (
  input: JoinChallengeInput,
  userId: string
): Promise<ChallengeParticipant> => {
  try {
    console.log('challengeService.joinChallenge: user', userId, 'joining challenge', input.challenge_id);

    // Verify basics module completion
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, basics_completed')
      .eq('id', userId)
      .single();

    if (!profile?.basics_completed) {
      throw new Error('You must complete the Basics Module before joining challenges');
    }

    // Fetch challenge
    const { data: challenge, error: chErr } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', input.challenge_id)
      .single();

    if (chErr || !challenge) {
      console.error('challengeService.joinChallenge: challenge not found', chErr);
      throw new Error('Challenge not found');
    }

    // Validate timeframe
    const status = computeStatus(challenge as Challenge);
    if (status === ChallengeStatus.ENDED) {
      throw new Error('You cannot join an ended challenge');
    }

    const deadline = new Date(challenge.submission_deadline);
    if (new Date() > deadline) {
      throw new Error('You cannot join after the submission deadline');
    }

    // Prevent duplicate join
    const { data: existing } = await supabase
      .from('challenge_participants')
      .select('id')
      .eq('challenge_id', input.challenge_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing?.id) {
      throw new Error('You have already joined this challenge');
    }

    const paymentStatus = challenge.type === 'paid' ? 'pending' : 'paid';

    const { data, error } = await supabase
      .from('challenge_participants')
      .insert([
        {
          challenge_id: input.challenge_id,
          user_id: userId,
          payment_status: paymentStatus,
          joined_at: toISO(new Date()),
        },
      ])
      .select(`
        *,
        profiles(username, full_name)
      `)
      .single();

    if (error) {
      console.error('challengeService.joinChallenge: error joining', error);
      throw error;
    }

    const participant: ChallengeParticipant = {
      ...data,
      user: data.profiles,
    };

    console.log('challengeService.joinChallenge: joined successfully', participant.id);
    return participant;
  } catch (err) {
    console.error('challengeService.joinChallenge: unexpected error', err);
    throw err;
  }
};

// Submit or replace a submission to a challenge
export const submitToChallenge = async (
  input: SubmitChallengeInput,
  userId: string
): Promise<Submission> => {
  try {
    console.log('challengeService.submitToChallenge: user', userId, 'submitting to', input.challenge_id);

    // Verify participation
    const { data: participant } = await supabase
      .from('challenge_participants')
      .select('id')
      .eq('challenge_id', input.challenge_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!participant?.id) {
      throw new Error('You must join the challenge before submitting');
    }

    // Fetch challenge to validate deadline
    const { data: challenge } = await supabase
      .from('challenges')
      .select('submission_deadline')
      .eq('id', input.challenge_id)
      .single();

    const deadline = new Date(challenge.submission_deadline);
    if (new Date() > deadline) {
      throw new Error('Submission deadline has passed');
    }

    // Check existing submission
    const { data: existing } = await supabase
      .from('submissions')
      .select('*')
      .eq('challenge_id', input.challenge_id)
      .eq('user_id', userId)
      .maybeSingle();

    let fileUrl: string | undefined = existing?.file_url;
    let fileName: string | undefined = existing?.file_name;
    let fileSize: number | undefined = existing?.file_size;
    let mimeType: string | undefined = existing?.mime_type;

    // Handle file upload if provided
    if (input.file) {
      const safeName = input.file.name.replace(/\s+/g, '_');
      const path = `${userId}/${input.challenge_id}/${Date.now()}-${safeName}`;
      const upload = await uploadFile('challenge-submissions', path, input.file);
      fileUrl = upload.url;
      fileName = upload.fileName;
      fileSize = upload.fileSize;
      mimeType = upload.mimeType;

      // Clean up old file if replacing
      if (existing?.file_url) {
        try {
          const oldName = existing.file_url.split('/').pop();
          if (oldName) {
            const oldPath = `${userId}/${input.challenge_id}/${oldName}`;
            await deleteFile('challenge-submissions', oldPath);
          }
        } catch (delErr) {
          console.warn('challengeService.submitToChallenge: failed to delete old file', delErr);
        }
      }
    }

    if (existing?.id) {
      // Update existing submission
      const { data, error } = await supabase
        .from('submissions')
        .update({
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          mime_type: mimeType,
          submission_notes: input.submission_notes,
          status: 'submitted',
          updated_at: toISO(new Date()),
        })
        .eq('id', existing.id)
        .select(`
          *,
          profiles(username, full_name),
          reviewers:reviewed_by(username, full_name)
        `)
        .single();

      if (error) {
        console.error('challengeService.submitToChallenge: error updating submission', error);
        throw error;
      }

      const submission: Submission = {
        ...data,
        user: data.profiles,
        reviewer: data.reviewers,
      };

      console.log('challengeService.submitToChallenge: updated submission', submission.id);
      return submission;
    } else {
      // Create new submission
      if (!input.file) {
        throw new Error('Please attach a file to submit');
      }

      const { data, error } = await supabase
        .from('submissions')
        .insert([
          {
            challenge_id: input.challenge_id,
            user_id: userId,
            file_url: fileUrl,
            file_name: fileName,
            file_size: fileSize,
            mime_type: mimeType,
            submission_notes: input.submission_notes,
            status: 'submitted',
            is_winner: false,
            submitted_at: toISO(new Date()),
          },
        ])
        .select(`
          *,
          profiles(username, full_name),
          reviewers:reviewed_by(username, full_name)
        `)
        .single();

      if (error) {
        console.error('challengeService.submitToChallenge: error creating submission', error);
        throw error;
      }

      const submission: Submission = {
        ...data,
        user: data.profiles,
        reviewer: data.reviewers,
      };

      console.log('challengeService.submitToChallenge: created submission', submission.id);
      return submission;
    }
  } catch (err) {
    console.error('challengeService.submitToChallenge: unexpected error', err);
    throw err;
  }
};