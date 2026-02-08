'use client';

import React from 'react';
import LoadingBar from './LoadingBar';
import SkeletonLoader from './SkeletonLoader';

interface GeneralLoadingOverlayProps {
  className?: string;
  loadingText?: string;
  showLoadingBar?: boolean;
  showSkeletons?: boolean;
  skeletonCount?: number;
  duration?: number;
}

const GeneralLoadingOverlay: React.FC<GeneralLoadingOverlayProps> = ({ 
  className = '',
  loadingText = 'Loading...',
  showLoadingBar = true,
  showSkeletons = true,
  skeletonCount = 5,
  duration = 5000
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Loading Bar Overlay */}
      {showLoadingBar && (
        <div className="fixed top-0 left-0 right-0 z-50 pt-2 px-4">
          <LoadingBar duration={duration} showPercentage={false} />
        </div>
      )}
      
      {/* General Skeleton Content */}
      {showSkeletons && (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <SkeletonLoader className="h-8 w-64 mb-4 mx-auto" />
            <SkeletonLoader className="h-4 w-48 mx-auto" />
          </div>

          <div className="space-y-6">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div key={index} className="card p-6 border border-card-border">
                <div className="flex items-center justify-between mb-4">
                  <SkeletonLoader className="h-6 w-32" />
                  <SkeletonLoader className="h-4 w-16" />
                </div>
                
                <div className="space-y-4">
                  <SkeletonLoader className="h-4 w-full" />
                  <SkeletonLoader className="h-4 w-5/6" />
                  <SkeletonLoader className="h-4 w-4/6" />
                  
                  <div className="flex gap-3 mt-4">
                    <SkeletonLoader className="h-10 w-24 rounded-lg" />
                    <SkeletonLoader className="h-10 w-24 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralLoadingOverlay;