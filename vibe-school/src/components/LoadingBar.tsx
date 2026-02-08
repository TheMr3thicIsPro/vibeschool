'use client';

import React, { useState, useEffect } from 'react';

interface LoadingBarProps {
  duration?: number;
  className?: string;
  showPercentage?: boolean;
}

const LoadingBar = ({ duration = 3000, className = '', showPercentage = true }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, duration / 100);

    return () => clearInterval(interval);
  }, [duration]);

  const containerClass = 'w-full ' + className;
  const progressWidth = progress + '%';

  return React.createElement(
    'div',
    { className: containerClass },
    showPercentage && React.createElement(
      'div',
      { className: 'flex justify-between items-center mb-2' },
      React.createElement('span', { className: 'text-sm font-medium text-gray-300' }, 'Loading...'),
      React.createElement('span', { className: 'text-sm font-medium text-accent-primary' }, progress + '%')
    ),
    React.createElement(
      'div',
      { className: 'w-full bg-gray-800 rounded-full h-2.5' },
      React.createElement('div', {
        className: 'bg-gradient-to-r from-accent-primary to-purple-600 h-2.5 rounded-full transition-all duration-100 ease-out',
        style: { width: progressWidth }
      })
    ),
    progress >= 100 && React.createElement(
      'div',
      { className: 'mt-2 text-center text-sm text-green-400 animate-pulse' },
      'Complete!'
    )
  );
};

export default LoadingBar;
