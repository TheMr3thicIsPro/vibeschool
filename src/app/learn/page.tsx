'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';

const LearnPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to courses page
    router.push('/courses');
  }, [router]);

  // Show loading state while redirecting
  return (
    <ProtectedRoute>
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <div className="text-2xl font-bold text-accent-primary">Redirecting to courses...</div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default LearnPage;