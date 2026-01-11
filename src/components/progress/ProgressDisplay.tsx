import { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { getUserOverallProgress, getUserCourseProgress } from '@/services/progressService';

interface ProgressDisplayProps {
  courseId?: string;
}

const ProgressDisplay = ({ courseId }: ProgressDisplayProps) => {
  const { state } = useAuthStore();
  const user = state.user;
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, courseId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      let progressData = 0;
      
      if (user) {
        if (courseId) {
          // Get progress for specific course
          // For now, just using overall progress as placeholder
          progressData = await getUserOverallProgress(user.id);
        } else {
          // Get overall progress
          progressData = await getUserOverallProgress(user.id);
        }
      }
      
      setProgress(progressData);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className="bg-gray-600 h-2.5 rounded-full" style={{ width: '30%' }}></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">Progress</span>
        <span className="text-accent-primary font-medium">{progress.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-accent-primary h-2.5 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressDisplay;