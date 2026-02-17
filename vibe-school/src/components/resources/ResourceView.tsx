'use client';

import { useState, useEffect, useRef } from 'react';
import { LessonResource, ResourceSubmission } from '@/types/course';
import { listLessonResources, createSubmission, getUserSubmission } from '@/actions/resourceActions';
import { Download, FileText, Code, Package, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/context/AuthContext';

interface ResourceViewProps {
  lessonId: string;
}

export const ResourceView = ({ lessonId }: ResourceViewProps) => {
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Record<string, ResourceSubmission>>({});
  
  // Submission form state
  const [selectedResource, setSelectedResource] = useState<LessonResource | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { state } = useAuthStore();
  const user = state.user;

  useEffect(() => {
    loadResources();
  }, [lessonId]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const { data } = await listLessonResources(lessonId);
      if (data) {
        setResources(data);
        // Load submissions for exercises
        const exerciseResources = data.filter(r => r.exercise_type !== 'none');
        if (exerciseResources.length > 0 && user) {
          await loadSubmissions(exerciseResources);
        }
      }
    } catch (err) {
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (exerciseResources: LessonResource[]) => {
    const subs: Record<string, ResourceSubmission> = {};
    await Promise.all(exerciseResources.map(async (res) => {
      const { data } = await getUserSubmission(res.id);
      if (data) {
        subs[res.id] = data;
      }
    }));
    setSubmissions(subs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('submission_text', submissionText);
      if (submissionFile) {
        formData.append('file', submissionFile);
      }

      const { data, error } = await createSubmission(selectedResource.id, formData);
      
      if (error) {
        setError(error);
      } else if (data) {
        setSubmissions(prev => ({
          ...prev,
          [selectedResource.id]: data
        }));
        // Reset form
        setSelectedResource(null);
        setSubmissionText('');
        setSubmissionFile(null);
      }
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading resources...</div>;
  if (resources.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Package className="text-accent-primary" />
        Lesson Resources & Exercises
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((resource) => {
          const submission = submissions[resource.id];
          const isExercise = resource.exercise_type !== 'none';

          return (
            <div key={resource.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col h-full hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded ${
                    isExercise ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'
                  }`}>
                    {resource.exercise_type === 'debug' ? <Code size={20} /> :
                     resource.exercise_type === 'recreate' ? <Package size={20} /> :
                     <FileText size={20} />}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{resource.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 uppercase bg-gray-700 px-1.5 py-0.5 rounded">
                        {resource.file_type.split('/')[1] || 'FILE'}
                      </span>
                      {isExercise && (
                        <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                          resource.difficulty === 'beginner' ? 'bg-green-900/30 text-green-400' :
                          resource.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {resource.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-4 flex-grow">{resource.description}</p>

              <div className="space-y-3 mt-auto">
                <a 
                  href={resource.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  <Download size={16} />
                  Download File
                </a>

                {isExercise && (
                  <div>
                    {submission ? (
                      <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-400">Submission Status</span>
                          <span className={`text-xs flex items-center gap-1 ${
                            submission.status === 'approved' ? 'text-green-400' :
                            submission.status === 'changes_requested' ? 'text-red-400' :
                            'text-yellow-400'
                          }`}>
                            {submission.status === 'approved' ? <CheckCircle size={12} /> :
                             submission.status === 'changes_requested' ? <AlertCircle size={12} /> :
                             <Clock size={12} />}
                            <span className="capitalize">{submission.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                        {submission.feedback && (
                          <div className="text-xs text-gray-300 mt-2 p-2 bg-gray-800 rounded">
                            <span className="font-bold text-gray-500 block mb-1">Feedback:</span>
                            {submission.feedback}
                          </div>
                        )}
                        <button 
                          onClick={() => setSelectedResource(resource)}
                          className="w-full mt-2 text-xs text-gray-400 hover:text-white underline"
                        >
                          Update Submission
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedResource(resource)}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded text-sm transition-colors"
                      >
                        <Upload size={16} />
                        Submit Work
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-1">Submit Work</h3>
            <p className="text-sm text-gray-400 mb-4">For: {selectedResource.title}</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notes / Description
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:border-accent-primary focus:outline-none"
                  rows={3}
                  placeholder="Describe your solution..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Upload File (Optional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Upload your code or project zip.</p>
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 text-red-400 text-sm rounded border border-red-800">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedResource(null);
                    setSubmissionText('');
                    setSubmissionFile(null);
                    setError(null);
                  }}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
