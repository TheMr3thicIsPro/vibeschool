'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getLessonById } from '@/services/courseService';
import { updateProgress } from '@/services/progressService';
import { Play, SkipForward, CheckCircle, Circle, BookOpen, FileText, CheckSquare } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';

const LessonDetailPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lesson' | 'task' | 'notes'>('lesson');
  const [videoProgress, setVideoProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (lessonId && user) {
      fetchLesson();
    }
  }, [lessonId, user]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const data = await getLessonById(lessonId);
      setLesson(data);
      
      // Check if lesson is completed
      // This would require checking progress in a real implementation
    } catch (err) {
      console.error('Failed to fetch lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress);
    
    // Mark as completed if progress is above 90%
    if (progress >= 90 && !isCompleted) {
      setIsCompleted(true);
      handleMarkComplete();
    }
  };

  const handleMarkComplete = async () => {
    if (!user || !lesson) return;
    
    try {
      await updateProgress(user.id, lesson.id, 'completed');
      setIsCompleted(true);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleSkipVideo = () => {
    handleVideoProgress(100);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex items-center justify-center h-full">
            <div className="text-2xl font-bold text-accent-primary">Loading lesson...</div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="flex h-full">
          {/* Left side - Video Player */}
          <div className="w-2/3 bg-card-bg p-6 overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">{lesson?.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-gray-400 text-sm">
                  Module: {lesson?.modules?.title}
                </span>
                <span className="text-gray-400 text-sm">
                  Course: {lesson?.modules?.courses?.title}
                </span>
              </div>
            </div>

            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              {lesson?.video_url ? (
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-4">🎥</div>
                    <p className="text-gray-400">Video Player would be embedded here</p>
                    <p className="text-gray-500 text-sm mt-2">Video URL: {lesson.video_url}</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-4">📄</div>
                    <p className="text-gray-400">No video available for this lesson</p>
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">
                    {videoProgress.toFixed(0)}% watched
                  </span>
                  <span className="text-gray-400 text-sm">
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-accent-primary h-2 rounded-full" 
                    style={{ width: `${videoProgress}%` }}
                  ></div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={handleSkipVideo}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <SkipForward size={16} />
                    Skip Video
                  </button>
                  
                  <button 
                    onClick={handleMarkComplete}
                    disabled={isCompleted}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isCompleted 
                        ? 'bg-green-700 text-white' 
                        : 'bg-accent-primary text-white hover:bg-accent-primary/90'
                    }`}
                  >
                    {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
                    {isCompleted ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-700 mb-6">
              <div className="flex">
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'lesson'
                      ? 'text-accent-primary border-b-2 border-accent-primary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('lesson')}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} />
                    Lesson
                  </div>
                </button>
                
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'task'
                      ? 'text-accent-primary border-b-2 border-accent-primary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('task')}
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare size={16} />
                    Task
                  </div>
                </button>
                
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'notes'
                      ? 'text-accent-primary border-b-2 border-accent-primary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('notes')}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    Notes
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'lesson' && (
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-xl font-semibold text-white mb-4">Lesson Content</h3>
                  {lesson?.content ? (
                    <div className="text-gray-300 whitespace-pre-line">
                      {lesson.content}
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      No additional content for this lesson.
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'task' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Practice Task</h3>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-gray-300 mb-4">
                      This lesson includes a practice task. Complete the task to reinforce your learning.
                    </p>
                    <button className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors">
                      Start Task
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'notes' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Your Notes</h3>
                  <textarea
                    className="w-full h-64 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                    placeholder="Write your notes here..."
                  ></textarea>
                  <button className="mt-4 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors">
                    Save Notes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Lesson List */}
          <div className="w-1/3 bg-card-bg border-l border-card-border p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Course Content</h2>
            
            <div className="space-y-2">
              {lesson?.modules?.lessons?.map((otherLesson: any) => (
                <div 
                  key={otherLesson.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                    otherLesson.id === lesson.id
                      ? 'bg-accent-primary/10 border border-accent-primary'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => router.push(`/learn/${otherLesson.id}`)}
                >
                  <div className="flex-shrink-0">
                    {otherLesson.is_free ? (
                      <Play className="text-accent-primary" size={16} />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-600"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${
                      otherLesson.id === lesson.id ? 'text-accent-primary font-medium' : 'text-gray-300'
                    }`}>
                      {otherLesson.title}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {otherLesson.is_required && (
                        <span className="text-xs bg-red-900/30 text-red-400 px-1 rounded">
                          Required
                        </span>
                      )}
                      {otherLesson.is_recommended && (
                        <span className="text-xs bg-blue-900/30 text-blue-400 px-1 rounded">
                          Recommended
                        </span>
                      )}
                      {otherLesson.is_free && (
                        <span className="text-xs bg-green-900/30 text-green-400 px-1 rounded">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default LessonDetailPage;