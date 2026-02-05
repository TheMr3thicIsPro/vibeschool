'use client';

import { useAuthStore } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import GeneralLoadingOverlay from '@/components/GeneralLoadingOverlay';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Hydration guard: ensure first client render matches SSR to avoid mismatch
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const { state } = useAuthStore();
  const { user, authLoading } = state;
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !authLoading && !user) {
      router.push('/auth/login');
    }
  }, [hydrated, user, authLoading, router]);

  // Until hydrated, render children to match SSR output
  if (!hydrated) {
    return <>{children}</>;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GeneralLoadingOverlay loadingText="Checking authentication status..." />
      </div>
    );
  }

  if (!user) {
    return null; // Redirect happens in useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;