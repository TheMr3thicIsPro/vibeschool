'use client';

import React, { useState, useEffect } from 'react';
import LoadingBar from './LoadingBar';
import SkeletonLoader from './SkeletonLoader';

interface ProgressiveLoadingWrapperProps {
  duration?: number;
  onLoadingComplete?: () => void;
  children: React.ReactNode;
  className?: string;
}

const ProgressiveLoadingWrapper: React.FC<ProgressiveLoadingWrapperProps> = ({ 
  duration = 5000,
  onLoadingComplete,
  children,
  className = ''
}) => {
  const [loadingPhase, setLoadingPhase] = useState<'progress' | 'skeleton' | 'complete'>('progress');
  const [progressComplete, setProgressComplete] = useState(false);

  useEffect(() => {
    const progressTimer = setTimeout(() => {
      setProgressComplete(true);
      const skeletonTimer = setTimeout(() => {
        setLoadingPhase('complete');
        onLoadingComplete?.();
      }, 1000);
      
      return () => clearTimeout(skeletonTimer);
    }, duration);

    return () => clearTimeout(progressTimer);
  }, [duration, onLoadingComplete]);

  if (loadingPhase === 'complete') {
    return React.createElement(React.Fragment, null, children);
  }

  const containerClasses = 'flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white ' + className;

  return React.createElement(
    'div',
    { className: containerClasses },
    React.createElement(
      'div',
      { className: 'w-full max-w-2xl px-8' },
      loadingPhase === 'progress' && React.createElement(
        'div',
        { className: 'text-center mb-12' },
        React.createElement(
          'h2',
          { className: 'text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00f3ff] to-[#b36cff]' },
          'Loading VibeSchool'
        ),
        React.createElement(
          'p',
          { className: 'text-gray-400 mb-8' },
          progressComplete ? 'Preparing your experience...' : 'Getting everything ready...'
        ),
        React.createElement(LoadingBar, {
          duration: duration,
          showPercentage: !progressComplete,
          className: progressComplete ? 'opacity-50' : ''
        })
      ),
      loadingPhase === 'skeleton' && React.createElement(
        'div',
        { className: 'w-full' },
        React.createElement(
          'div',
          { className: 'mb-8 text-center' },
          React.createElement(
            'h2',
            { className: 'text-2xl font-bold mb-2 text-white' },
            'Preparing Content'
          ),
          React.createElement(
            'p',
            { className: 'text-gray-400' },
            'Loading interface elements...'
          )
        ),
        React.createElement(SkeletonLoader, {
          count: 6,
          className: 'h-4 mb-4',
          showLoadingBar: false
        }),
        React.createElement(SkeletonLoader, {
          count: 3,
          className: 'h-12 mb-4 rounded-lg',
          showLoadingBar: false
        }),
        React.createElement(SkeletonLoader, {
          count: 2,
          className: 'h-8 mb-4 rounded-full',
          showLoadingBar: false
        })
      )
    )
  );
};

export default ProgressiveLoadingWrapper;
