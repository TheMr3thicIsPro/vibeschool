'use client';

import { useState, useEffect } from 'react';
import { Lesson } from '@/types/course';
import { updateLesson, createLesson } from '@/actions/courseActions';
import { parseYouTube } from '@/lib/youtubeParser';

interface LessonEditorProps {
  lesson: Lesson | null;
  moduleId: string | null;
  onSave: (lesson: Lesson) => void;
  onClose: () => void;
  onCreate: (lesson: Lesson) => void;
}

const LessonEditor = ({ lesson, moduleId, onSave, onClose, onCreate }: LessonEditorProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '');
      setDescription(lesson.description || '');
      setYoutubeUrl(lesson.video_url || '');
      setIsPreview(!!lesson.is_preview);
      setIsPublished(!!lesson.is_published);
      setEmbedUrl(lesson.video_url || null);
    } else {
      // Reset form for new lesson
      setTitle('');
      setDescription('');
      setYoutubeUrl('');
      setIsPreview(false);
      setIsPublished(true);
      setEmbedUrl(null);
      setErrors({});
    }
  }, [lesson]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!youtubeUrl.trim()) {
      newErrors.youtubeUrl = 'YouTube URL is required';
    } else {
      const parsed = parseYouTube(youtubeUrl);
      if (parsed.error) {
        newErrors.youtubeUrl = parsed.error;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      if (lesson) {
        // Update existing lesson
        const updates = {
          title,
          description,
          video_url: youtubeUrl,
          is_preview: isPreview,
          is_published: isPublished
        };
        
        const result = await updateLesson(lesson.id, updates);
        if (result.error) {
          setErrors({ general: result.error });
        } else if (result.data) {
          onSave(result.data);
          onClose();
        }
      } else if (moduleId) {
        // Create new lesson
        const result = await createLesson(moduleId, title, description, youtubeUrl);
        if (result.error) {
          setErrors({ general: result.error });
        } else if (result.data) {
          onCreate(result.data);
          onClose();
        }
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (value: string) => {
    setYoutubeUrl(value);
    
    // Parse URL and show preview if valid
    const parsed = parseYouTube(value);
    if (!parsed.error) {
      setEmbedUrl(parsed.embedUrl);
    } else {
      setEmbedUrl(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              {lesson ? 'Edit Lesson' : 'Create New Lesson'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full p-2 rounded bg-gray-800 border ${
                    errors.title ? 'border-red-500' : 'border-gray-600'
                  } text-white`}
                  placeholder="Lesson title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  YouTube URL *
                </label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className={`w-full p-2 rounded bg-gray-800 border ${
                    errors.youtubeUrl ? 'border-red-500' : 'border-gray-600'
                  } text-white`}
                  placeholder="Paste YouTube URL or video ID"
                />
                {errors.youtubeUrl && (
                  <p className="mt-1 text-sm text-red-400">{errors.youtubeUrl}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Supports: watch?v=, youtu.be/, embed/, shorts/
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Preview
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPreview}
                      onChange={(e) => setIsPreview(e.target.checked)}
                      className="h-4 w-4 text-accent-primary bg-gray-700 border-gray-600 rounded focus:ring-accent-primary"
                    />
                    <span className="ml-2 text-sm text-gray-300">
                      Available for free users
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Published
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="h-4 w-4 text-accent-primary bg-gray-700 border-gray-600 rounded focus:ring-accent-primary"
                    />
                    <span className="ml-2 text-sm text-gray-300">
                      Visible to users
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                  placeholder="Lesson description (optional)"
                  rows={4}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Preview
              </label>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                {embedUrl ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={embedUrl}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded"
                    ></iframe>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-600 rounded-lg">
                    <p className="text-gray-500">Video preview will appear here</p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                The video will be embedded using the provided YouTube URL
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-black rounded-md font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : lesson ? 'Update Lesson' : 'Create Lesson'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonEditor;