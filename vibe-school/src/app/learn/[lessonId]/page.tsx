'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { useAuthStore } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import { getLessonById, checkLessonAccess } from '@/services/courseService';
import { updateUserLessonProgress, getUserLessonProgress, getNextLesson } from '@/services/courseNavigationService';
import { getQuizByLessonId, getQuizSubmissionByLessonId } from '@/services/quizService';
import { QuizComponent } from '@/components/quiz/QuizComponent';
import { AssignmentView } from '@/components/assignment/AssignmentView';
import { loadYouTubeIFrameAPI, destroyPlayer } from '@/lib/youtube';
import LessonReviewForm from '@/components/reviews/LessonReviewForm';
import { getLessonRatingSummary } from '@/services/lessonReviewService';
import { Lesson } from '@/types/course';
import { QuizWithQuestions } from '@/types/quiz';

interface LessonWithDetails extends Lesson {
  modules: {
    id: string;
    title: string;
    course_id: string;
    courses: {
      id: string;
      title: string;
    }
  };
}

const LessonPlayer = () => {
  const params = useParams();
  const lessonId = (Array.isArray(params?.lessonId) ? params.lessonId[0] : params?.lessonId) as string;
  const { state } = useAuthStore();
  const user = state.user;
  const [lesson, setLesson] = useState<LessonWithDetails | null>(null);
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
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [quizLoading, setQuizLoading] = useState(true);
  // Removed unused quizSubmission state
  const [quizPassed, setQuizPassed] = useState(false);
  const [ratingSummary, setRatingSummary] = useState<{ average: number; count: number } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [playerEl, setPlayerEl] = useState<HTMLDivElement | null>(null);
  const playerElRef = useCallback((node: HTMLDivElement | null) => { 
    console.log('YT DEBUG: playerElRef called with node:', !!node);
    setPlayerEl(node);
  }, []);

  const loadLessonData = useCallback(async () => {
    if (!user || !lessonId) return;
    
    console.log('LessonPlayer: Starting loadLessonData', { lessonId, userId: user.id });
    try {
      setLoading(true);
      
      // Check access first
      console.log('LessonPlayer: Checking access...');
      const accessResult = await checkLessonAccess(user.id, lessonId);
      console.log('LessonPlayer: Access result:', accessResult);
      
      setCanAccess(accessResult.hasAccess);
      setIsCheckingAccess(false);
      
      if (!accessResult.hasAccess) {
        console.warn('LessonPlayer: Access denied');
        setError('You do not have access to this lesson. Please upgrade to a membership or access a preview lesson.');
        return;
      }
      
      // Get lesson details
      console.log('LessonPlayer: Fetching lesson details...');
      const lessonData = await getLessonById(lessonId);
      console.log('LessonPlayer: Lesson details loaded', lessonData?.id);
      setLesson(lessonData);
      
      // Get user progress
      console.log('LessonPlayer: Fetching progress...');
      const progressData = await getUserLessonProgress(user.id, lessonId);
      console.log('LessonPlayer: Progress loaded', progressData);
      setProgress(progressData);
      
      // Get quiz for this lesson
      try {
        console.log('LessonPlayer: Fetching quiz...');
        const lessonQuiz = await getQuizByLessonId(lessonId);
        setQuiz(lessonQuiz);
        console.log('LessonPlayer: Quiz loaded', !!lessonQuiz);
        
        // Check if user has passed the quiz
        if (lessonQuiz) {
          const submission = await getQuizSubmissionByLessonId(user.id, lessonId);
          if (submission) {
            // Check if the submission meets passing criteria (you can adjust this)
            if (submission.score >= 70) { // Assuming 70% is the passing grade
              setQuizPassed(true);
            }
          }
        }
      } catch (quizErr) {
        console.error('Error loading quiz:', quizErr);
        // Quiz is optional, so we don't set an error
      } finally {
        setQuizLoading(false);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error loading lesson:', err);
      setError(err.message || 'Failed to load lesson');
      setQuizLoading(false);
    } finally {
      setLoading(false);
    }
  }, [user, lessonId]);

  useEffect(() => {
    if (user && lessonId) {
      loadLessonData();
    }
  }, [loadLessonData, user, lessonId]);

  useEffect(() => {
    if (lessonId) {
      getLessonRatingSummary(lessonId as string)
        .then(setRatingSummary)
        .catch((err) => {
          console.warn('LessonPlayer: rating summary unavailable', err);
          setRatingSummary({ average: 0, count: 0 });
        });
    }
  }, [lessonId]);


  // Calculate hasVideo outside useEffect for proper dependency tracking
  const hasVideo = !!(lesson && (
    (lesson.video_provider === 'youtube' && lesson.youtube_video_id) ||
    (lesson.video_url && (lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be')))
  ));
  
  // Load YouTube API and initialize player when lesson changes
  useEffect(() => {
    console.log('YT DEBUG: useEffect triggered, lesson:', !!lesson, 'hasVideo:', hasVideo, 'playerEl:', !!playerEl);
      
    if (!lesson) return;
      
    // Extract YouTube video ID from URL if needed
    let videoId = lesson.youtube_video_id;
    if (!videoId && lesson.video_url) {
      // Extract video ID from YouTube URL
      const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&\?\s]{11})/;
      const urlMatch = lesson.video_url.match(regExp);
      if (urlMatch) {
        videoId = urlMatch[1];
      }
    }
  
    if (!videoId) {
      console.log('YT DEBUG: No video ID found');
      return;
    }
  
    if (!playerEl) {
      console.log('YT DEBUG: No player element, waiting for mount');
      return;
    }
  
    console.log('YT DEBUG: Initializing player with video:', videoId);
      
    let cancelled = false;
      
    const initializePlayer = async () => {
      if (cancelled) return;
        
      try {
        console.log('YT: loading API for video:', videoId);
        await loadYouTubeIFrameAPI();
          
        if (cancelled || !playerEl) return;
          
        console.log('YT: creating player for video:', videoId);
          
        // Clean up existing player if any
        if (playerRef.current) {
          destroyPlayer(playerRef.current);
        }
          
        // Create new player
        playerRef.current = new window.YT.Player(playerEl, {
          videoId: videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 0,
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
            start: 0,
          },
          events: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onReady: (event: any) => {
              console.log('YT: onReady fired');
              if (!cancelled) {
                playerRef.current = event.target;
                setPlayerReady(true);
                  
                // Seek to last position after player is ready
                setTimeout(() => {
                  if (progress.last_position_seconds > 0 && !cancelled) {
                    event.target.seekTo(progress.last_position_seconds, true);
                  }
                }, 1000);
              }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onStateChange: (event: any) => {
              if (cancelled) return;
                
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
                  
                // If video ended, mark as completed
                if (event.data === window.YT.PlayerState.ENDED && !progress.completed) {
                  handleMarkComplete();
                }
              }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
              console.error('YT: Player error:', error);
              if (!cancelled) {
                setError(`Video player error: ${error?.data || 'Unknown error'}`);
              }
            }
          },
        });
          
      } catch (error) {
        console.error('YT: Failed to initialize player:', error);
        if (!cancelled) {
          setError(`Failed to load video player: ${(error as Error)?.message || 'Unknown error'}`);
          setPlayerReady(false);
        }
      }
    };
      
    initializePlayer();
      
    // Cleanup function
    return () => {
      cancelled = true;
      if (playerRef.current) {
        destroyPlayer(playerRef.current);
        playerRef.current = null;
      }
      setPlayerReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, lesson?.youtube_video_id, playerEl, progress.last_position_seconds]);

  const handleMarkComplete = useCallback(async () => {
    if (!user || !lessonId) return;
    
    console.log('LessonPlayer: Marking lesson as complete', { userId: user.id, lessonId });
    try {
      await updateUserLessonProgress(user.id, lessonId, {
        completed: true,
        completed_at: new Date().toISOString()
      });
      console.log('LessonPlayer: Lesson marked as complete successfully');
      
      setProgress(prev => ({ ...prev, completed: true }));
    } catch (err) {
      console.error('Error marking lesson as complete:', err);
    }
  }, [user, lessonId]);

  // Handle video progress updates
  useEffect(() => {
    // Update progress every 5 seconds while playing
    if (isPlaying && playerRef.current && user) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      console.log('LessonPlayer: Starting progress tracking interval');
      timerRef.current = setInterval(async () => {
        try {
          const currentTime = playerRef.current?.getCurrentTime();
          if (currentTime !== undefined) {
            console.log('LessonPlayer: Updating progress', Math.floor(currentTime));
            await updateUserLessonProgress(user.id, lessonId, {
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
        console.log('LessonPlayer: Clearing progress tracking interval');
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, user, lessonId]);

  const handleRestart = () => {
    console.log('LessonPlayer: Restarting video');
    if (playerRef.current) {
      playerRef.current.seekTo(0, true);
      playerRef.current.playVideo();
    }
  };

  const handleNextLesson = async () => {
    if (!lesson || !user) return;
    
    console.log('LessonPlayer: handleNextLesson triggered');
    try {
      // Find the course ID from the lesson data
      const courseId = lesson.modules?.course_id;
      if (!courseId) {
        console.error('Could not find course ID for lesson');
        return;
      }
      
      console.log('LessonPlayer: Finding next lesson for course', courseId);
      // Get the next lesson in the course
      const nextLesson = await getNextLesson(user.id, courseId);
      
      if (nextLesson) {
        console.log('LessonPlayer: Navigating to next lesson', nextLesson.id);
        // Navigate to the next lesson
        window.location.href = `/learn/${nextLesson.id}`;
      } else {
        console.log('LessonPlayer: No next lesson found (course completed)');
        // If no next lesson, show a message or navigate back to course
        alert('Congratulations! You have completed all lessons in this course.');
        window.location.href = `/courses/${courseId}`;
      }
    } catch (error) {
      console.error('Error getting next lesson:', error);
      // Fallback to course page
      const courseId = lesson.modules?.course_id;
      if (courseId) {
        window.location.href = `/courses/${courseId}`;
      }
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
                className="mt-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 hover-lift"
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
                className="mt-4 px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary/90 hover-lift border border-accent-primary"
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
          
          {/* Refresh notification for video loading issues */}
          <div className="mb-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-blue-300 font-medium">Video Loading Tip</h3>
                <p className="text-blue-400 text-sm mt-1">
                  If the video doesn&apos;t load, please refresh the page. Some videos may take a moment to load or require a page refresh to display properly.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-black rounded-lg overflow-hidden mb-6 relative">
            <div 
              ref={playerElRef}
              data-yt-container
              className="w-full aspect-video rounded-lg overflow-hidden bg-black"
            />
            
            {/* Loading overlay */}
            {!playerReady && hasVideo && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
                  <p className="text-white">Loading video player...</p>
                </div>
              </div>
            )}
            
            {/* Video not configured placeholder */}
            {!hasVideo && (
              <div className="absolute inset-0 w-full aspect-video bg-gray-900 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p>Video not configured</p>
                  <p className="text-sm mt-2">Lesson ID: {lesson?.id}</p>
                  <p className="text-xs mt-1">Video provider: {lesson?.video_provider}</p>
                  <p className="text-xs mt-1">YouTube ID: {lesson?.youtube_video_id}</p>
                  <p className="text-xs mt-1">Video URL: {lesson?.video_url}</p>
                </div>
              </div>
            )}
            
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && !playerEl && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs p-1 rounded">
                YT container not mounted
              </div>
            )}
            
            <div className="p-4 bg-gray-900 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 hover-lift"
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
              
              <div className="flex gap-2">
                <button
                  onClick={handleMarkComplete}
                  disabled={progress.completed}
                  className={`px-4 py-2 rounded hover-lift ${
                    progress.completed 
                      ? 'bg-green-800 text-green-300' 
                      : 'bg-accent-primary text-white hover:bg-accent-primary/90 border border-accent-primary'
                  }`}
                >
                  {progress.completed ? '✓ Completed' : 'Mark as Complete'}
                </button>
                {quiz && !quizPassed && (
                  <button
                    onClick={() => {
                      // Scroll to the quiz section
                      const quizSection = document.querySelector('#quiz-section');
                      if (quizSection) {
                        quizSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-4 py-2 rounded hover-lift bg-purple-600 text-white hover:bg-purple-500"
                  >
                    Take Quiz
                  </button>
                )}
                {quizPassed && (
                  <button
                    onClick={handleNextLesson}
                    className="px-4 py-2 rounded hover-lift bg-blue-600 text-white hover:bg-blue-500"
                  >
                    Next Lesson →
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300">{lesson?.description}</p>
          </div>

          {/* Overall rating summary under the lesson */}
          {ratingSummary && (
            <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg flex items-center gap-3">
              <div className="flex items-center">
                {[1,2,3,4,5].map((i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={ratingSummary.average >= i ? '#fbbf24' : '#4b5563'} className="w-5 h-5">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <div className="text-gray-300 text-sm">
                <span className="font-medium text-white">{ratingSummary.average.toFixed(2)}</span> average · {ratingSummary.count} review{ratingSummary.count !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Lesson Review Form: under description, above quiz */}
          <LessonReviewForm lessonId={lessonId} onSubmitted={() => {
            getLessonRatingSummary(lessonId as string)
              .then(setRatingSummary)
              .catch((err) => console.warn('LessonPlayer: rating summary refresh failed', err));
          }} />

          {/* Quiz section */}
          {!quizLoading && quiz && (
            <div id="quiz-section">
              <QuizComponent 
                lessonId={lessonId} 
                quiz={quiz} 
                onComplete={(passed) => {
                  setQuizPassed(passed);
                  if (passed) {
                    // Mark lesson as completed when quiz is passed
                    handleMarkComplete();
                  }
                }}
              />
              {!quizPassed && (
                <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                  <p className="text-yellow-300">⚠️ Complete the quiz to unlock the next lesson.</p>
                </div>
              )}
            </div>
          )}
          
          {quizLoading && (
            <div className="mt-8 p-6 bg-card-bg rounded-lg border border-card-border">
              <div className="text-center py-8">
                <div className="text-lg text-gray-400">Loading quiz...</div>
              </div>
            </div>
          )}

          {/* Assignment Section */}
          <AssignmentView 
            lessonId={lessonId}
            onComplete={(passed) => {
              if (passed) {
                handleMarkComplete();
              }
            }}
          />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default LessonPlayer;