'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { mapSupabaseAuthError } from '@/lib/authErrors';
import { supabase } from '@/lib/supabase';
import GeneralLoadingOverlay from '@/components/GeneralLoadingOverlay';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showFallbackForm, setShowFallbackForm] = useState(false);
  
  const router = useRouter();
  const { state } = useAuthStore();
  const { user, authLoading, profileLoading } = state;

  // Redirect if user exists AND authLoading is false
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);
  
  // Show loading state while auth state is being determined
  // But also start a 8s watchdog timer to show fallback form
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallbackForm(true);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If authLoading is true, show spinner BUT ALSO start a 8s watchdog timer
  if (authLoading && !showFallbackForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-2xl font-bold text-accent-primary">Loading...</div>
      </div>
    );
  }
  
  // Don't render anything if user is already logged in
  if (user && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-2xl font-bold text-accent-primary">Redirecting...</div>
      </div>
    );
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Basic validation
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      console.log('[SIGNUP] Attempting signup for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          }
        }
      });
      
      console.log('[SIGNUP] Response:', { data, error });
      
      if (error) {
        console.error('[SIGNUP] Error details:', error);
        setErrorMessage(`Signup failed: ${mapSupabaseAuthError(error)} (Code: ${error.code})`);
        return;
      }

      // Check if user needs to confirm email
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Email not confirmed yet
        setSuccessMessage('Check your email to verify your account');
      } else {
        // User is automatically signed in
        setSuccessMessage('Account created successfully');
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(mapSupabaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white font-[var(--font-space-grotesk)] tracking-wide">Vibe School</h1>
          <p className="text-gray-400 mt-2">Learn to prompt engineer and vibe code</p>
        </div>

        <div className="card p-8 border border-card-border">
          <h2 className="text-2xl font-bold text-white mb-6">Create an account</h2>
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 px-4 py-2 text-sm text-green-700 rounded-md">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-300 text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                placeholder="your_username"
                required
              />
            </div>

            <div className="mb-4">
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

            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-accent-primary hover-lift"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-300 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-accent-primary hover-lift"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-accent-primary text-white font-medium rounded-lg hover:bg-accent-primary/90 transition-colors glow-button disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
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

export default SignupPage;