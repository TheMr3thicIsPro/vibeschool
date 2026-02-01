'use client';

import { useAuthStore } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // BUILD-TIME GUARD: Skip auth checks during static build
  if (typeof window === 'undefined') {
    console.log('[ProtectedRoute] Skipping auth check during build time');
    return <>{children}</>;
  }
  
  const { state } = useAuthStore();
  const { user, authLoading } = state;
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl font-bold text-accent-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect happens in useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;