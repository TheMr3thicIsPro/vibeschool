'use client';

import { useState, useEffect } from 'react';
import { Assignment, AssignmentSubmissionType } from '@/types/assignment';

interface AssignmentEditorProps {
  assignment: Assignment | null;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const AssignmentEditor = ({ assignment, onSave, onCancel }: AssignmentEditorProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submissionType, setSubmissionType] = useState<AssignmentSubmissionType>('link');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title);
      setDescription(assignment.description || '');
      setSubmissionType(assignment.submission_type);
      setIsPublished(assignment.is_published);
    } else {
      setTitle('Final Assignment');
      setDescription('');
      setSubmissionType('link');
      setIsPublished(false);
    }
  }, [assignment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        title,
        description,
        submission_type: submissionType,
        is_published: isPublished
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save assignment');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div 
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              {assignment ? 'Edit Assignment' : 'Create Assignment'}
            </h2>
            <button 
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-white hover-lift"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
                placeholder="e.g. Build a Portfolio Website"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description & Instructions
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
                placeholder="Explain what the student needs to build and submit..."
                rows={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Submission Type
              </label>
              <select
                value={submissionType}
                onChange={(e) => setSubmissionType(e.target.value as AssignmentSubmissionType)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
              >
                <option value="link">Link Only (e.g. Deployed Website)</option>
                <option value="file">File Upload Only (e.g. ZIP)</option>
                <option value="both">Both Link and File</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 text-accent-primary bg-gray-700 border-gray-600 rounded focus:ring-accent-primary"
              />
              <label htmlFor="isPublished" className="ml-2 text-sm text-gray-300">
                Publish Assignment (visible to students)
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-800 disabled:opacity-50 hover-lift"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-md font-medium disabled:opacity-50 hover-lift border border-accent-primary"
            >
              {loading ? 'Saving...' : 'Save Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
