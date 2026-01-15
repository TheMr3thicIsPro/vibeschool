'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Play, Pause, RotateCcw } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import { getLessonById, checkLessonAccess } from '@/services/courseService';
import { updateUserLessonProgress, markLessonCompleted, getUserLessonProgress } from '@/services/courseNavigationService';

const LessonPlayer = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { state } = useAuthStore();
  const user = state.user;
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    completed: false,
    last_position_seconds: 0
  });
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canAccess, setCanAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  
  const playerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user && lessonId) {
      loadLessonData();
    }
  }, [user, lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      
      // Check access first
      const accessResult = await checkLessonAccess(user!.id, lessonId);
      setCanAccess(accessResult.hasAccess);
      setIsCheckingAccess(false);
      
      if (!accessResult.hasAccess) {
        setError('You do not have access to this lesson. Please upgrade to a membership or access a preview lesson.');
        return;
      }
      
      // Get lesson details
      const lessonData = await getLessonById(lessonId);
      setLesson(lessonData);
      
      // Get user progress
      const progressData = await getUserLessonProgress(user!.id, lessonId);
      setProgress(progressData);
    } catch (err: any) {
      console.error('Error loading lesson:', err);
      setError(err.message || 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  // Initialize YouTube player
  useEffect(() => {
    if (lesson && progress.last_position_seconds >= 0 && playerReady && typeof window !== 'undefined' && 'YT' in window) {
      // Seek to last position if available
      if (progress.last_position_seconds > 0) {
        playerRef.current?.seekTo(progress.last_position_seconds, true);
      }
    }
  }, [lesson, progress, playerReady]);

  // Handle video progress updates
  useEffect(() => {
    // Update progress every 5 seconds while playing
    if (isPlaying && playerRef.current) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(async () => {
        try {
          const currentTime = playerRef.current?.getCurrentTime();
          if (currentTime !== undefined) {
            await updateUserLessonProgress(user!.id, lessonId, {
              last_position_seconds: Math.floor(currentTime)
            });
          }
        } catch (err) {
          console.error('Error updating progress:', err);
        }
      }, 5000); // Update every 5 seconds
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, user, lessonId]);

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    setPlayerReady(true);
    
    // Seek to last position after player is ready
    if (progress.last_position_seconds > 0) {
      event.target.seekTo(progress.last_position_seconds, true);
    }
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === 1) { // PLAYING
      setIsPlaying(true);
    } else if (event.data === 2 || event.data === 0) { // PAUSED or ENDED
      setIsPlaying(false);
      
      // If video ended, mark as completed
      if (event.data === 0 && !progress.completed) { // ENDED
        handleMarkComplete();
      }
    }
  };

  const handleMarkComplete = async () => {
    try {
      await updateUserLessonProgress(user!.id, lessonId, {
        completed: true,
        completed_at: new Date().toISOString()
      });
      
      setProgress(prev => ({ ...prev, completed: true }));
    } catch (err) {
      console.error('Error marking lesson as complete:', err);
    }
  };

  const handleRestart = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0, true);
      playerRef.current.playVideo();
    }
  };

  if (loading || isCheckingAccess) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="container mx-auto px-4 py-8">
            <p className="text-gray-400">Loading lesson...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <h2 className="text-red-300 font-bold mb-2">Error Loading Lesson</h2>
              <p className="text-red-400">{error}</p>
              <button 
                onClick={() => window.history.back()} 
                className="mt-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600"
              >
                Go Back
              </button>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (!canAccess) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="container mx-auto px-4 py-8">
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <h2 className="text-yellow-300 font-bold mb-2">Access Restricted</h2>
              <p className="text-yellow-400">You need a membership to access this lesson.</p>
              <p className="text-yellow-400 mt-2">Preview lessons are available for free, but full content requires a membership.</p>
              <button 
                onClick={() => window.location.href = '/courses'}
                className="mt-4 px-4 py-2 bg-accent-primary text-black rounded hover:bg-accent-primary/90"
              >
                Browse Courses
              </button>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">{lesson?.title}</h1>
            <p className="text-gray-400">{lesson?.modules?.courses?.title} • {lesson?.modules?.title}</p>
          </div>
          
          <div className="bg-black rounded-lg overflow-hidden mb-6">
            <div 
              id="youtube-player" 
              className="w-full aspect-video"
            />
            
            <div className="p-4 bg-gray-900 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  <RotateCcw size={16} />
                  Restart
                </button>
                
                <div className="text-sm text-gray-300">
                  {progress.completed ? (
                    <span className="text-green-500">✓ Completed</span>
                  ) : (
                    <span>Resume from {Math.floor(progress.last_position_seconds / 60)}:{String(Math.floor(progress.last_position_seconds % 60)).padStart(2, '0')}</span>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleMarkComplete}
                disabled={progress.completed}
                className={`px-4 py-2 rounded ${
                  progress.completed 
                    ? 'bg-green-800 text-green-300' 
                    : 'bg-accent-primary text-black hover:bg-accent-primary/90'
                }`}
              >
                {progress.completed ? '✓ Completed' : 'Mark as Complete'}
              </button>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300">{lesson?.description}</p>
          </div>
          
          {/* Quiz section would go here */}
          {lesson?.has_quiz && (
            <div className="mt-8 card p-6 border border-card-border">
              <h3 className="text-xl font-bold text-white mb-4">Knowledge Check</h3>
              <p className="text-gray-400">Test your understanding of this lesson.</p>
              {/* Quiz component would be implemented here */}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

// Load YouTube IFrame API
// Load YouTube IFrame API
if (typeof window !== 'undefined') {
  const loadYouTubeAPI = () => {
    if (!(window as any).YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
      
      // Set up the onYouTubeIframeAPIReady callback
      (window as any).onYouTubeIframeAPIReady = () => {
        // This function will be called by the YouTube API when ready
      };
    }
  };
  
  loadYouTubeAPI();
}

export default LessonPlayer;