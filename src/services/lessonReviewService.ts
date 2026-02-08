import { supabase } from '@/lib/supabase';

export type LessonReview = {
  id: string;
  lesson_id: string;
  user_id: string;
  rating: number; // 1-5
  comment: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
};

// Upsert a lesson review (one per user per lesson)
export const upsertLessonReview = async (
  userId: string,
  lessonId: string,
  input: { rating: number; comment?: string; is_anonymous?: boolean }
): Promise<LessonReview> => {
  console.log('lessonReviewService.upsertLessonReview: user', userId, 'lesson', lessonId, 'input', input);
  const { data, error } = await supabase
    .from('lesson_reviews')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      rating: input.rating,
      comment: input.comment ?? null,
      is_anonymous: !!input.is_anonymous,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'lesson_id,user_id' })
    .select()
    .single();

  if (error) {
    const code = (error as any).code;
    const msg = String((error as any).message || '');
    if (code === 'PGRST205' || msg.includes('Could not find the table') || msg.toLowerCase().includes('not found')) {
      console.warn('lessonReviewService.upsertLessonReview: lesson_reviews table missing; reviews disabled');
      throw new Error('Reviews are not yet available in this environment.');
    }
    console.error('lessonReviewService.upsertLessonReview: error', error);
    throw error;
  }
  console.log('lessonReviewService.upsertLessonReview: ok', data?.id);
  return data as LessonReview;
};

// Get current user's review for a lesson (students cannot see others' reviews)
export const getMyLessonReview = async (userId: string, lessonId: string): Promise<LessonReview | null> => {
  console.log('lessonReviewService.getMyLessonReview: user', userId, 'lesson', lessonId);
  const { data, error } = await supabase
    .from('lesson_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error) {
    const code = (error as any).code;
    const msg = String((error as any).message || '');
    if (code === 'PGRST205' || msg.includes('Could not find the table') || msg.toLowerCase().includes('not found')) {
      console.warn('lessonReviewService.getMyLessonReview: lesson_reviews table missing; returning null');
      return null;
    }
    console.error('lessonReviewService.getMyLessonReview: error', error);
    throw error;
  }
  return data as LessonReview | null;
};

// Admin-only: fetch lesson reviews with filters
export const getLessonReviewsAdmin = async (filters: {
  lessonId?: string;
  minRating?: number;
  maxRating?: number;
  isAnonymous?: boolean;
  sort?: 'newest' | 'lowest';
}) => {
  console.log('lessonReviewService.getLessonReviewsAdmin: filters', filters);
  let query = supabase
    .from('lesson_reviews')
    .select(`
      id,
      lesson_id,
      rating,
      comment,
      is_anonymous,
      created_at,
      updated_at,
      lessons!lesson_reviews_lesson_id_fkey (
        id,
        title
      ),
      user:profiles!lesson_reviews_user_id_fkey (
        id,
        username
      )
    `);

  if (filters.lessonId) query = query.eq('lesson_id', filters.lessonId);
  if (filters.minRating) query = query.gte('rating', filters.minRating);
  if (filters.maxRating) query = query.lte('rating', filters.maxRating);
  if (typeof filters.isAnonymous === 'boolean') query = query.eq('is_anonymous', filters.isAnonymous);

  if (filters.sort === 'lowest') {
    query = query.order('rating', { ascending: true }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    // Gracefully handle missing table in remote schema
    const code = (error as any).code;
    const msg = String((error as any).message || '');
    if (code === 'PGRST205' || msg.includes("Could not find the table")) {
      console.warn('lessonReviewService.getLessonReviewsAdmin: lesson_reviews table missing; returning empty list');
      return [] as any[];
    }
    console.error('lessonReviewService.getLessonReviewsAdmin: error', error);
    throw error;
  }
  return data as any[];
};

// Summary: average rating and count for a lesson (for display under the lesson)
export const getLessonRatingSummary = async (lessonId: string): Promise<{ average: number; count: number }> => {
  console.log('lessonReviewService.getLessonRatingSummary: lesson', lessonId);
  const { data, error } = await supabase
    .from('lesson_reviews')
    .select('rating')
    .eq('lesson_id', lessonId);

  if (error) {
    const code = (error as any).code;
    const msg = String((error as any).message || '');
    if (code === 'PGRST205' || msg.includes('Could not find the table') || msg.toLowerCase().includes('not found')) {
      console.warn('lessonReviewService.getLessonRatingSummary: lesson_reviews table missing; returning zeros');
      return { average: 0, count: 0 };
    }
    console.error('lessonReviewService.getLessonRatingSummary: error', error);
    throw error;
  }

  const ratings = (data || []).map((r: any) => Number(r.rating)).filter((n: number) => !isNaN(n));
  const count = ratings.length;
  const average = count > 0 ? parseFloat((ratings.reduce((a: number, b: number) => a + b, 0) / count).toFixed(2)) : 0;
  return { average, count };
};