'use client';

import { useState, useEffect, useRef } from 'react';
import { Lesson, LessonResource } from '@/types/course';
import { updateLesson, createLesson } from '@/actions/courseActions';
import { parseYouTube } from '@/lib/youtubeParser';
import { getQuizByLessonId, upsertQuiz } from '@/services/quizService';
import { getAssignmentByLessonId, upsertAssignment } from '@/services/assignmentService';
import { listLessonResources, createLessonResource, deleteLessonResource } from '@/actions/resourceActions';
import { QuizEditor } from './QuizEditor';
import { AssignmentEditor } from './AssignmentEditor';
import { Trash2, Download, FileText, Code, Package, Plus, X } from 'lucide-react';

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
  // const [duration, setDuration] = useState(15); // Disabled until DB migration
  const [isPreview, setIsPreview] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [assignment, setAssignment] = useState<any>(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [showAssignmentEditor, setShowAssignmentEditor] = useState(false);
  
  // Resources state
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New Resource Form State
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceDesc, setNewResourceDesc] = useState('');
  const [newResourceType, setNewResourceType] = useState<'none' | 'debug' | 'complete' | 'recreate'>('none');
  const [newResourceDifficulty, setNewResourceDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '');
      setDescription(lesson.description || '');
      setYoutubeUrl(lesson.video_url || '');
      // setDuration(lesson.duration ? Math.round(lesson.duration / 60) : 15);
      setIsPreview(!!lesson.is_preview);
      setIsPublished(!!lesson.is_published);
      setEmbedUrl(lesson.video_url || null);
      
      // Load quiz for this lesson
      loadQuiz(lesson.id);
      loadAssignment(lesson.id);
      loadResources(lesson.id);
    } else {
      // Reset form for new lesson
      setTitle('');
      setDescription('');
      setYoutubeUrl('');
      setIsPreview(false);
      setIsPublished(true);
      setEmbedUrl(null);
      setQuiz(null);
      setAssignment(null);
      setResources([]);
      setErrors({});
    }
  }, [lesson]);

  // Monitor quiz state changes for debugging
  useEffect(() => {
    console.log('Quiz state changed:', quiz);
    if (quiz) {
      console.log(`Quiz has ${quiz.questions?.length || 0} questions`);
    }
  }, [quiz]);
  
  const loadQuiz = async (lessonId: string) => {
    setQuizLoading(true);
    try {
      console.log('loadQuiz: Loading quiz for lesson:', lessonId);
      const lessonQuiz = await getQuizByLessonId(lessonId);
      console.log('loadQuiz: Loaded quiz data:', lessonQuiz);
      setQuiz(lessonQuiz);
      
      // Force a re-render by updating state
      if (lessonQuiz) {
        console.log(`loadQuiz: Setting quiz with ${lessonQuiz.questions.length} questions`);
      } else {
        console.log('loadQuiz: No quiz found for this lesson');
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setQuizLoading(false);
    }
  };

  const loadAssignment = async (lessonId: string) => {
    setAssignmentLoading(true);
    try {
      const data = await getAssignmentByLessonId(lessonId);
      setAssignment(data);
    } catch (error) {
      console.error('Error loading assignment:', error);
    } finally {
      setAssignmentLoading(false);
    }
  };

  const loadResources = async (lessonId: string) => {
    setResourcesLoading(true);
    try {
      const { data, error } = await listLessonResources(lessonId);
      if (data) {
        setResources(data);
      } else if (error) {
        console.error('Error loading resources:', error);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson || selectedFiles.length === 0 || !newResourceTitle) return;

    setUploadingResource(true);
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        const title =
          selectedFiles.length > 1
            ? `${newResourceTitle} - ${file.name}`
            : newResourceTitle;
        formData.append('title', title);
        formData.append('description', newResourceDesc);
        formData.append('file', file);
        formData.append('exercise_type', newResourceType);
        formData.append('difficulty', newResourceDifficulty);

        const { error } = await createLessonResource(lesson.id, formData);
        if (error) {
          setErrors({ resource: error });
          break;
        }
      }

      if (!errors.resource) {
        setNewResourceTitle('');
        setNewResourceDesc('');
        setNewResourceType('none');
        setNewResourceDifficulty('beginner');
        setSelectedFiles([]);
        setShowResourceForm(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadResources(lesson.id);
      }
    } catch (err: any) {
      setErrors({ resource: err.message || 'Upload failed' });
    } finally {
      setUploadingResource(false);
    }
  };

  const handleDeleteResource = async (resourceId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await deleteLessonResource(resourceId, fileUrl);
      setResources(prev => prev.filter(r => r.id !== resourceId));
    } catch (error) {
      console.error('Failed to delete resource:', error);
    }
  };

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
          // duration: duration * 60
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
        const result = await createLesson(moduleId, title, description, youtubeUrl); // duration removed until migration
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
  
  const handleSaveQuiz = async (quizData: any) => {
    if (!lesson) return;
    
    try {
      console.log('handleSaveQuiz: Saving quiz data:', quizData);
      await upsertQuiz(lesson.id, {
        title: quizData.title,
        description: quizData.description,
        is_active: quizData.is_active,
        questions: quizData.questions.map((q: any, index: number) => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          is_required: q.is_required,
          order_index: index,
          options: q.options?.map((opt: any, optIndex: number) => ({
            id: opt.id,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            order_index: optIndex
          }))
        }))
      });
      
      // Reload quiz after saving
      console.log('handleSaveQuiz: Reloading quiz after save');
      await loadQuiz(lesson.id);
      setShowQuizEditor(false);
    } catch (error) {
      console.error('Error saving quiz:', error);
      setErrors({ general: 'Error saving quiz' });
    }
  };

  const handleSaveAssignment = async (data: any) => {
    if (!lesson) return;

    try {
      await upsertAssignment({
        lesson_id: lesson.id,
        ...data
      });
      await loadAssignment(lesson.id);
      setShowAssignmentEditor(false);
    } catch (error) {
      console.error('Error saving assignment:', error);
      throw error; // Let the editor handle the error display
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
    <>
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
                className="text-gray-400 hover:text-white hover-lift"
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

                {/* <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                    placeholder="Duration in minutes"
                    min="1"
                  />
                </div> */}

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
                
                {/* Quiz Section */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white mb-2">Quiz</h3>
                    <button
                      type="button"
                      onClick={() => {
                        if (lesson) {
                          setShowQuizEditor(true);
                        }
                      }}
                      disabled={!lesson}
                      className="px-3 py-1 bg-accent-primary text-white rounded text-sm hover:bg-accent-primary/90 hover-lift disabled:opacity-50 disabled:cursor-not-allowed border border-accent-primary"
                    >
                      {quiz ? 'Edit Quiz' : 'Create Quiz'}
                    </button>
                  </div>
                  
                  {quizLoading ? (
                    <div className="text-gray-500 text-sm">Loading quiz...</div>
                  ) : quiz ? (
                    <div className="mt-2 text-sm text-gray-400">
                      <div>Quiz: {quiz.title}</div>
                      <div>Questions: {quiz.questions.length}</div>
                      <div>Status: {quiz.is_active ? 'Active' : 'Inactive'}</div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-gray-500">
                      No quiz created for this lesson yet.
                    </div>
                  )}
                </div>

                {/* Assignment Section */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white mb-2">Assignment</h3>
                    <button
                      type="button"
                      onClick={() => {
                        if (lesson) {
                          setShowAssignmentEditor(true);
                        }
                      }}
                      disabled={!lesson}
                      className="px-3 py-1 bg-accent-primary text-white rounded text-sm hover:bg-accent-primary/90 hover-lift disabled:opacity-50 disabled:cursor-not-allowed border border-accent-primary"
                    >
                      {assignment ? 'Edit Assignment' : 'Create Assignment'}
                    </button>
                  </div>
                  
                  {assignmentLoading ? (
                    <div className="text-gray-500 text-sm">Loading assignment...</div>
                  ) : assignment ? (
                    <div className="mt-2 text-sm text-gray-400">
                      <div>Title: {assignment.title}</div>
                      <div>Type: {assignment.submission_type}</div>
                      <div>Status: {assignment.is_published ? 'Published' : 'Draft'}</div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-gray-500">
                      No assignment created for this lesson yet.
                    </div>
                  )}
                </div>

                {/* Resources & Exercises Section */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">Resources & Exercises</h3>
                    <button
                      type="button"
                      onClick={() => setShowResourceForm(!showResourceForm)}
                      disabled={!lesson}
                      className="flex items-center gap-1 px-3 py-1 bg-accent-primary text-white rounded text-sm hover:bg-accent-primary/90 hover-lift disabled:opacity-50 disabled:cursor-not-allowed border border-accent-primary"
                    >
                      {showResourceForm ? <X size={16} /> : <Plus size={16} />}
                      {showResourceForm ? 'Cancel' : 'Add Resource'}
                    </button>
                  </div>

                  {showResourceForm && (
                    <div className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700">
                      <h4 className="text-sm font-medium text-white mb-3">Upload New Resource</h4>
                      <form onSubmit={handleUploadResource} className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={newResourceTitle}
                            onChange={(e) => setNewResourceTitle(e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                            placeholder="Resource title"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Description (Optional)</label>
                          <textarea
                            value={newResourceDesc}
                            onChange={(e) => setNewResourceDesc(e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                            placeholder="Instructions or description"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Exercise Type</label>
                            <select
                              value={newResourceType}
                              onChange={(e) => setNewResourceType(e.target.value as any)}
                              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                            >
                              <option value="none">Reference / Download</option>
                              <option value="debug">Debugging Challenge</option>
                              <option value="complete">Complete the Code</option>
                              <option value="recreate">Recreate Project</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
                            <select
                              value={newResourceDifficulty}
                              onChange={(e) => setNewResourceDifficulty(e.target.value as any)}
                              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Files</label>
                          <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={(e) =>
                              setSelectedFiles(
                                e.target.files ? Array.from(e.target.files) : []
                              )
                            }
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-primary file:text-white hover:file:bg-accent-primary/90"
                            required
                          />
                          <p className="mt-1 text-[11px] text-gray-500">
                            Select one or more files (for folders, select all files or upload a zipped project).
                          </p>
                        </div>

                        {errors.resource && (
                          <p className="text-red-400 text-xs">{errors.resource}</p>
                        )}

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={uploadingResource}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm disabled:opacity-50"
                          >
                            {uploadingResource ? 'Uploading...' : 'Upload Resource'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {resourcesLoading ? (
                    <div className="text-gray-500 text-sm">Loading resources...</div>
                  ) : resources.length > 0 ? (
                    <div className="space-y-2">
                      {resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-gray-700 rounded text-accent-primary">
                              {resource.exercise_type === 'none' ? <Download size={18} /> : 
                               resource.exercise_type === 'debug' ? <Package size={18} /> :
                               <Code size={18} />}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-white truncate">{resource.title}</div>
                              <div className="text-xs text-gray-400 flex items-center gap-2">
                                <span className="capitalize">{resource.exercise_type === 'none' ? 'File' : resource.exercise_type}</span>
                                <span>•</span>
                                <span className="uppercase text-[10px] bg-gray-700 px-1 rounded">{resource.file_type.split('/')[1] || 'FILE'}</span>
                                {resource.exercise_type !== 'none' && (
                                  <>
                                    <span>•</span>
                                    <span className={`capitalize ${
                                      resource.difficulty === 'beginner' ? 'text-green-400' :
                                      resource.difficulty === 'intermediate' ? 'text-yellow-400' :
                                      'text-red-400'
                                    }`}>{resource.difficulty}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a 
                              href={resource.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                              title="Download"
                            >
                              <Download size={16} />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteResource(resource.id, resource.file_url)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">No resources uploaded yet.</div>
                  )}
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
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-800 disabled:opacity-50 hover-lift"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-md font-medium disabled:opacity-50 hover-lift border border-accent-primary"
              >
                {loading ? 'Saving...' : lesson ? 'Update Lesson' : 'Create Lesson'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showQuizEditor && lesson && (
        <QuizEditor
          quiz={quiz}
          onSave={handleSaveQuiz}
          onCancel={() => setShowQuizEditor(false)}
        />
      )}

      {showAssignmentEditor && lesson && (
        <AssignmentEditor
          assignment={assignment}
          onSave={handleSaveAssignment}
          onCancel={() => setShowAssignmentEditor(false)}
        />
      )}
    </>
  );
};

export default LessonEditor;
