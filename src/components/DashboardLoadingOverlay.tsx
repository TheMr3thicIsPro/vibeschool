'use client';

import React from 'react';
import LoadingBar from './LoadingBar';
import SkeletonLoader from './SkeletonLoader';

interface DashboardLoadingOverlayProps {
  className?: string;
}

const DashboardLoadingOverlay: React.FC<DashboardLoadingOverlayProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Loading Bar Overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-2 px-4">
        <LoadingBar duration={5000} showPercentage={false} />
      </div>
      
      {/* Dashboard Skeleton Content */}
      <div className="mb-8">
        <SkeletonLoader className="h-8 w-64 mb-2" />
        <SkeletonLoader className="h-4 w-48" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[0, 1, 2, 3].map((_, index) => (
          <div key={index} className="card p-6 border border-card-border">
            <div className="flex items-center justify-between">
              <div>
                <SkeletonLoader className="h-4 w-20 mb-2" />
                <SkeletonLoader className="h-6 w-16" />
              </div>
              <SkeletonLoader className="h-12 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Continue Learning Section Skeleton */}
      <div className="card p-6 border border-card-border mb-8">
        <div className="flex justify-between items-center mb-4">
          <SkeletonLoader className="h-6 w-48" />
          <SkeletonLoader className="h-4 w-24" />
        </div>
        
        <div className="space-y-4">
          {[0, 1, 2].map((_, index) => (
            <div key={index} className="flex items-center p-4 bg-card-bg rounded-lg border border-card-border">
              <div className="flex-1">
                <SkeletonLoader className="h-5 w-64 mb-2" />
                <SkeletonLoader className="h-4 w-40" />
              </div>
              <div className="flex items-center gap-3">
                <SkeletonLoader className="h-2 w-32 rounded-full" />
                <SkeletonLoader className="h-4 w-16" />
                <SkeletonLoader className="h-10 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements Skeleton */}
      <div className="card p-6 border border-card-border">
        <SkeletonLoader className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {[0, 1, 2].map((_, index) => (
            <div key={index} className="p-4 bg-card-bg rounded-lg border border-card-border">
              <SkeletonLoader className="h-5 w-48 mb-2" />
              <SkeletonLoader className="h-4 w-full mb-2" />
              <SkeletonLoader className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardLoadingOverlay;