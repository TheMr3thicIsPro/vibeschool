"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { upsertLessonReview, getMyLessonReview } from '@/services/lessonReviewService';

export const LessonReviewForm = ({ lessonId }: { lessonId: string }) => {
  const { state } = useAuthStore();
  const user = state.user;
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  // Add user-friendly submission error state
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const myReview = await getMyLessonReview(user.id, lessonId);
        if (myReview) {
          setExistingReview(myReview);
          setRating(myReview.rating);
          setComment(myReview.comment || '');
          setIsAnonymous(!!myReview.is_anonymous);
        }
      } catch (err) {
        console.error('LessonReviewForm: failed to load existing review', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user, lessonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!user) return;
    if (rating < 1 || rating > 5) {
      setMessage('Please choose a rating between 1 and 5.');
      return;
    }
    try {
      setLoading(true);
      await upsertLessonReview(user.id, lessonId, { rating, comment, is_anonymous: isAnonymous });
      setMessage(existingReview ? 'Your feedback has been updated. Thank you!' : 'Thanks for your feedback — it helps us improve!');
      setExistingReview({ rating, comment, is_anonymous: isAnonymous });
      console.log('LessonReviewForm: review submitted', { lessonId, rating, isAnonymous });
    } catch (err: any) {
      console.error('LessonReviewForm: submission error', err);
      const msg = String(err?.message || '');
      // Graceful message if reviews are not available yet (missing remote table)
      if (msg.toLowerCase().includes('reviews are not yet available') || msg.toLowerCase().includes('not found')) {
        setSubmitError('Reviews are temporarily unavailable in this environment. Your feedback is valuable — please try again later.');
      } else {
        setSubmitError('Something went wrong while submitting your review. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-card-bg rounded-lg border border-card-border">
      <h3 className="text-xl font-semibold text-white mb-2">Help us improve this lesson</h3>
      <p className="text-gray-400 mb-2">Your feedback is private and only visible to the VibeSchool team.</p>
      <p className="text-gray-400 mb-4">Any video rated below 3 stars will be recreated to improve student experience with VibeSchool.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2">Rate this lesson</label>
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-2 rounded ${rating >= star ? 'text-yellow-400' : 'text-gray-500'} hover:text-yellow-300`}
                aria-label={`Rate ${star} star${star>1?'s':''}`}
              >
                {/* Simple star using SVG to avoid extra deps */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-1">Choose between 1 and 5 stars.</p>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">What did you like or find confusing?</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Optional"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="anonymous"
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 text-accent-primary focus:ring-accent-primary border-gray-700 bg-gray-800"
          />
          <label htmlFor="anonymous" className="text-gray-300">Submit anonymously</label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || rating === 0}
            className={`px-4 py-2 rounded font-medium transition-colors hover-lift border ${loading || rating===0 ? 'bg-gray-700 text-gray-400 border-gray-700' : 'bg-accent-primary text-white hover:bg-accent-primary/90 border-accent-primary'}`}
          >
            {existingReview ? 'Update Feedback' : 'Submit Feedback'}
          </button>
          {message && <span className="text-gray-300 text-sm">{message}</span>}
        </div>
      </form>

      {/* Informational and error messages */}
      {submitError && (
        <div role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </div>
      )}
    </div>
  );
};

export default LessonReviewForm;