'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const CommunityPage = () => {
  const router = useRouter();
  const { state } = useAuthStore();
  const user = state.user;

  // Redirect to social page since it serves as the unified social hub
  useEffect(() => {
    if (user) {
      router.push('/social');
    }
  }, [user, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Redirecting...</h2>
          <p className="text-gray-300">Loading social hub</p>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CommunityPage;