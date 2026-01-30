'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.error_description || err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Vibe School</h1>
          <p className="text-gray-400 mt-2">Learn to prompt engineer and vibe code</p>
        </div>

        <div className="card p-8 border border-card-border">
          <h2 className="text-2xl font-bold text-white mb-6">Reset your password</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="mb-6 p-3 bg-green-900/30 border border-green-700 rounded text-green-300 text-sm">
              Password reset link sent! Check your email for instructions.
            </div>
          ) : (
            <p className="text-gray-400 mb-6">
              Enter your email and we'll send you a link to reset your password.
            </p>
          )}

          {!success ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-accent-primary text-white font-medium rounded-lg hover:bg-accent-primary/90 transition-colors glow-button disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full py-3 px-4 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors glow-button hover-lift"
            >
              Back to Login
            </button>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-accent-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;