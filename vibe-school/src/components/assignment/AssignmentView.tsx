'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { getAssignmentByLessonId, getUserSubmission, submitAssignment } from '@/services/assignmentService';
import { uploadFile } from '@/services/storageService';
import { Assignment, AssignmentSubmission } from '@/types/assignment';

interface AssignmentViewProps {
  lessonId: string;
  onComplete?: (passed: boolean) => void;
}

export const AssignmentView = ({ lessonId, onComplete }: AssignmentViewProps) => {
  const { state: { user } } = useAuthStore();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to keep stable dependencies for loadData
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  // Form state
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const loadData = useCallback(async () => {
    if (!user || !lessonId) return;

    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      const assign = await getAssignmentByLessonId(lessonId);
      // If null, it means either no assignment or table missing (handled by service)
      setAssignment(assign);

      if (assign && user) {
        const sub = await getUserSubmission(assign.id, user.id);
        setSubmission(sub);
        if (sub) {
          setLinkUrl(sub.link_url || '');
          if (sub.status === 'approved' && onCompleteRef.current) {
            onCompleteRef.current(true);
          }
        }
      }
    } catch (err) {
      console.error(err);
      // Only show error if it's NOT a missing table error (which returns null in service now)
      // But if something else failed, we should probably show it.
      // However, to be extra robust against "spamming console", we can be generic.
      setError('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  }, [lessonId, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment || !user) return;

    setError(null);
    setSubmitting(true);

    try {
      let filePath = submission?.file_path;

      // Handle file upload
      if (file && (assignment.submission_type === 'file' || assignment.submission_type === 'both')) {
        const path = `${user.id}/${assignment.id}/${file.name}`;
        await uploadFile('assignment-submissions', path, file);
        filePath = path;
      }

      await submitAssignment(assignment.id, user.id, {
        link_url: linkUrl || undefined,
        file_path: filePath || undefined
      });

      // Reload submission
      const sub = await getUserSubmission(assignment.id, user.id);
      setSubmission(sub);
      
      // Reset file input
      setFile(null);
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-400">Loading assignment...</div>;
  if (!assignment || !assignment.is_published) return null;

  const isApproved = submission?.status === 'approved';
  const needsChanges = submission?.status === 'changes_requested';

  return (
    <div id="assignment-section" className="bg-gray-900 border border-gray-800 rounded-lg p-6 mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{assignment.title}</h2>
        <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
          {assignment.description}
        </div>
      </div>

      {submission && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isApproved ? 'bg-green-900/20 border-green-800' :
          needsChanges ? 'bg-yellow-900/20 border-yellow-800' :
          'bg-blue-900/20 border-blue-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-white">Status:</span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              isApproved ? 'bg-green-800 text-green-100' :
              needsChanges ? 'bg-yellow-800 text-yellow-100' :
              'bg-blue-800 text-blue-100'
            }`}>
              {isApproved ? 'Approved' : needsChanges ? 'Needs Changes' : 'Submitted'}
            </span>
          </div>
          {submission.admin_feedback && (
            <div className="mt-2 text-sm">
              <span className="font-semibold text-gray-300">Feedback:</span>
              <p className="mt-1 text-gray-400">{submission.admin_feedback}</p>
            </div>
          )}
          <div className="mt-2 text-xs text-gray-500">
            Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
          </div>
        </div>
      )}

      {(!isApproved || needsChanges) && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {(assignment.submission_type === 'link' || assignment.submission_type === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Project Link
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
                placeholder="https://my-project.vercel.app"
                required={assignment.submission_type === 'link'}
              />
            </div>
          )}

          {(assignment.submission_type === 'file' || assignment.submission_type === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Upload File (ZIP, PDF, etc.)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-primary file:text-white hover:file:bg-accent-primary/90"
                required={assignment.submission_type === 'file' && !submission?.file_path}
              />
              {submission?.file_path && !file && (
                <p className="mt-1 text-sm text-gray-500">
                  Current file: {submission.file_path.split('/').pop()}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-accent-primary hover:bg-accent-primary/90 text-white rounded font-medium disabled:opacity-50 hover-lift border border-accent-primary"
          >
            {submitting ? 'Submitting...' : submission ? 'Update Submission' : 'Submit Assignment'}
          </button>
        </form>
      )}
    </div>
  );
};
