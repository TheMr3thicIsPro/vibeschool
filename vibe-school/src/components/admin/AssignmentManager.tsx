'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { reviewSubmission } from '@/services/assignmentService';
import { getFileUrl } from '@/services/storageService';

export default function AssignmentManager() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'changes_requested'>('approved');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignments (
          title,
          lesson_id,
          lessons (
            title,
            modules (
              title,
              courses (title)
            )
          )
        ),
        profiles:user_id (
          email,
          full_name
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  const handleReview = async () => {
    if (!selectedSubmission) return;
    
    try {
      await reviewSubmission(selectedSubmission.id, reviewStatus, feedback);
      setSelectedSubmission(null);
      setFeedback('');
      fetchSubmissions();
    } catch (error) {
      console.error('Error reviewing submission:', error);
    }
  };

  const getFileDownloadUrl = async (path: string) => {
    try {
      const url = await getFileUrl('assignment-submissions', path);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error getting file URL:', error);
    }
  };

  if (loading) return <div className="text-gray-400">Loading submissions...</div>;

  return (
    <div className="h-full flex flex-col p-4 text-white">
      {/* List */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-sm">
              <th className="p-3 font-medium">User</th>
              <th className="p-3 font-medium">Assignment</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Submitted</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No submissions found.
                </td>
              </tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="p-3">
                    <div className="font-medium text-white">{sub.profiles?.full_name || 'Unknown'}</div>
                    <div className="text-xs text-gray-400">{sub.profiles?.email}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-white">{sub.assignments?.title}</div>
                    <div className="text-xs text-gray-400">
                      {sub.assignments?.lessons?.title}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                      sub.status === 'approved' ? 'bg-green-900/30 text-green-300 border-green-800' :
                      sub.status === 'changes_requested' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-800' :
                      'bg-blue-900/30 text-blue-300 border-blue-800'
                    }`}>
                      {sub.status === 'changes_requested' ? 'Changes Requested' : 
                       sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-400">
                    {new Date(sub.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setFeedback(sub.admin_feedback || '');
                        setReviewStatus(sub.status === 'submitted' ? 'approved' : sub.status as any);
                      }}
                      className="px-3 py-1 bg-accent-primary text-white rounded text-sm hover:bg-accent-primary/90 border border-accent-primary shadow-sm hover:shadow transition-all"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-white border-b border-gray-800 pb-2">Review Submission</h3>
            
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-2 gap-6 p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Student</label>
                  <div className="text-white">{selectedSubmission.profiles?.full_name}</div>
                  <div className="text-sm text-gray-400">{selectedSubmission.profiles?.email}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Assignment</label>
                  <div className="text-white">{selectedSubmission.assignments?.title}</div>
                  <div className="text-sm text-gray-400">{selectedSubmission.assignments?.lessons?.title}</div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedSubmission.link_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-1">Project Link</label>
                    <a 
                      href={selectedSubmission.link_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-accent-primary hover:text-accent-primary/80 hover:underline break-all p-2 bg-gray-800 rounded border border-gray-700"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {selectedSubmission.link_url}
                    </a>
                  </div>
                )}

                {selectedSubmission.file_path && (
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-1">Uploaded File</label>
                    <button
                      onClick={() => getFileDownloadUrl(selectedSubmission.file_path)}
                      className="flex items-center gap-2 text-accent-primary hover:text-accent-primary/80 hover:underline p-2 bg-gray-800 rounded border border-gray-700 w-full text-left"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download {selectedSubmission.file_path.split('/').pop()}
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-800 pt-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Review Decision</label>
                <div className="flex gap-4 mb-4">
                  <label className={`flex-1 flex items-center justify-center p-3 rounded cursor-pointer border transition-all ${reviewStatus === 'approved' ? 'bg-green-900/30 border-green-500 text-green-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>
                    <input
                      type="radio"
                      checked={reviewStatus === 'approved'}
                      onChange={() => setReviewStatus('approved')}
                      className="mr-2"
                    />
                    Approve
                  </label>
                  <label className={`flex-1 flex items-center justify-center p-3 rounded cursor-pointer border transition-all ${reviewStatus === 'changes_requested' ? 'bg-yellow-900/30 border-yellow-500 text-yellow-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>
                    <input
                      type="radio"
                      checked={reviewStatus === 'changes_requested'}
                      onChange={() => setReviewStatus('changes_requested')}
                      className="mr-2"
                    />
                    Request Changes
                  </label>
                </div>

                <label className="block text-sm font-medium text-gray-300 mb-2">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-3 rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
                  placeholder={reviewStatus === 'approved' ? "Great job! (Optional)" : "Please fix the following issues..."}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                className="px-6 py-2 bg-accent-primary text-white rounded font-medium hover:bg-accent-primary/90 hover-lift border border-accent-primary shadow-lg shadow-accent-primary/20"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
