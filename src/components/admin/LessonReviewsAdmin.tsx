"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getLessonReviewsAdmin } from '@/services/lessonReviewService';

type ReviewAdminItem = {
  id: string;
  lesson_id: string;
  rating: number;
  comment: string | null;
  is_anonymous: boolean;
  created_at: string;
  lesson: { id: string; title: string } | null;
  user: { id: string; username: string } | null;
};

const LessonReviewsAdmin = () => {
  const [filters, setFilters] = useState<{ lessonId?: string; minRating?: number; maxRating?: number; isAnonymous?: boolean; sort?: 'newest' | 'lowest' }>({ sort: 'newest' });
  const [reviews, setReviews] = useState<ReviewAdminItem[]>([]);
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('lessons')
          .select('id, title')
          .eq('is_published', true)
          .order('title');
        if (error) throw error;
        setLessons(data || []);
      } catch (err: any) {
        console.error('LessonReviewsAdmin: failed to load lessons', err);
        setError(err.message || 'Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };
    loadLessons();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getLessonReviewsAdmin(filters);
      setReviews(data);
      setError(null);
      console.log('LessonReviewsAdmin: loaded reviews', data.length);
    } catch (err: any) {
      console.error('LessonReviewsAdmin: failed to load reviews', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.lessonId, filters.minRating, filters.maxRating, filters.isAnonymous, filters.sort]);

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold text-white mb-4">Lesson Reviews</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-gray-300 mb-2">Lesson</label>
          <select
            value={filters.lessonId || ''}
            onChange={(e) => setFilters((f) => ({ ...f, lessonId: e.target.value || undefined }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          >
            <option value="">All lessons</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Min rating</label>
          <select
            value={filters.minRating || ''}
            onChange={(e) => setFilters((f) => ({ ...f, minRating: e.target.value ? Number(e.target.value) : undefined }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          >
            <option value="">Any</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Max rating</label>
          <select
            value={filters.maxRating || ''}
            onChange={(e) => setFilters((f) => ({ ...f, maxRating: e.target.value ? Number(e.target.value) : undefined }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          >
            <option value="">Any</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Identity</label>
          <select
            value={typeof filters.isAnonymous === 'boolean' ? (filters.isAnonymous ? 'anon' : 'named') : ''}
            onChange={(e) => {
              const v = e.target.value;
              setFilters((f) => ({ ...f, isAnonymous: v === '' ? undefined : v === 'anon' }));
            }}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          >
            <option value="">All</option>
            <option value="anon">Anonymous</option>
            <option value="named">Named</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-gray-300">Sort:</label>
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as 'newest' | 'lowest' }))}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        >
          <option value="newest">Newest</option>
          <option value="lowest">Lowest rating</option>
        </select>
        <button
          onClick={() => loadReviews()}
          className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >Refresh</button>
      </div>

      {loading && <p className="text-gray-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      <div className="mt-2 overflow-auto max-h-[60vh] border border-gray-700 rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-3 py-2 text-left">Lesson</th>
              <th className="px-3 py-2 text-left">Rating</th>
              <th className="px-3 py-2 text-left">Comment</th>
              <th className="px-3 py-2 text-left">Identity</th>
              <th className="px-3 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-t border-gray-700">
                <td className="px-3 py-2 text-white">{r.lesson?.title || '—'}</td>
                <td className="px-3 py-2 text-white">{'★'.repeat(r.rating)}</td>
                <td className="px-3 py-2 text-gray-300">{r.comment || ''}</td>
                <td className="px-3 py-2 text-gray-300">{r.is_anonymous ? 'Anonymous' : (r.user?.username || 'Named')}</td>
                <td className="px-3 py-2 text-gray-300">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LessonReviewsAdmin;