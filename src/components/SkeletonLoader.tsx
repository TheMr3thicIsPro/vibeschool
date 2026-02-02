import React from 'react';
import LoadingBar from './LoadingBar';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  showLoadingBar?: boolean;
  loadingDuration?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  count = 1,
  showLoadingBar = false,
  loadingDuration = 3000
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div 
      key={index}
      className={`animate-pulse bg-gray-700 rounded ${className}`}
    />
  ));

  return (
    <>
      {showLoadingBar && (
        <div className='mb-6'>
          <LoadingBar duration={loadingDuration} />
        </div>
      )}
      {skeletons}
    </>
  );
};

export default SkeletonLoader;
