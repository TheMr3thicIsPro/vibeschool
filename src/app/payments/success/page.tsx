'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/context/AuthContext';
import { handleSuccessfulPayment } from '@/services/stripe/stripeService';
import { CheckCircle, ArrowRight } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';

const PaymentSuccessContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state } = useAuthStore();
  const user = state.user;
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId || !user) {
        setError('Missing session or user information');
        setLoading(false);
        return;
      }

      try {
        await handleSuccessfulPayment(sessionId, user.id);
        setSuccess(true);
      } catch (err: any) {
        console.error('Error processing payment:', err);
        setError(err.message || 'Failed to process payment');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [sessionId, user]);

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
              <p className="text-xl text-gray-300">Processing your payment...</p>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-red-400 mb-2">Payment Processing Failed</h2>
                <p className="text-red-300">{error}</p>
              </div>
              <button
                onClick={() => router.push('/payments')}
                className="px-6 py-3 bg-accent-primary text-black rounded-lg hover:bg-accent-primary/90 font-medium hover-lift"
              >
                Try Again
              </button>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-8 mb-8">
              <CheckCircle className="text-green-400 w-16 h-16 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-green-400 mb-2">Payment Successful!</h1>
              <p className="text-green-300 mb-6">
                Welcome to VibeSchool Premium! You now have access to all courses and premium content.
              </p>
              
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-white mb-2">What's Next?</h3>
                <ul className="text-left text-gray-300 text-sm space-y-1">
                  <li>• Start your 3-day free trial</li>
                  <li>• Explore premium courses</li>
                  <li>• Join our community</li>
                  <li>• Track your progress</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-accent-primary text-black rounded-lg hover:bg-accent-primary/90 font-medium hover-lift flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => router.push('/courses')}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium hover-lift"
              >
                Browse Courses
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <AppShell>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
              <p className="text-xl text-gray-300">Loading...</p>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;