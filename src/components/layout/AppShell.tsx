'use client';

import { ReactNode, useState } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import TrialTimer from '@/components/TrialTimer';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const { state } = useAuthStore();
  const user = state.user;
  const authLoading = state.authLoading;
  const profile = state.profile;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Show sidebar only when user is authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl font-bold text-accent-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // For non-authenticated users, just render children without sidebar
    return <div>{children}</div>;
  }
  
  // Check if account is locked due to expired trial
  if (user.account_locked) {
    const trialExpiredAt = profile?.trial_expires_at ? new Date(profile.trial_expires_at) : null;
    const formattedExpiration = trialExpiredAt ? trialExpiredAt.toLocaleString() : 'Unknown';
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Account Locked</h2>
          <p className="text-foreground mb-4">
            Your free trial expired on {formattedExpiration}. Please upgrade to a membership to continue accessing the platform.
          </p>
          <div className="mb-6 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-sm text-red-400">
              Trial Duration: 5 minutes • Expired: {formattedExpiration}
            </p>
          </div>
          <a 
            href="/payments"
            className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium inline-block"
          >
            Upgrade to Member
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile menu button - shown when sidebar is collapsed */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-sidebar-bg text-accent-primary hover:glow-button hover-lift"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={cn(
          "h-full transition-all duration-300 ease-in-out",
          sidebarOpen ? "block" : "hidden md:block",
          "md:block md:translate-x-0"
        )}
      >
        <Sidebar />
      </div>

      {/* Header bar with trial timer */}
      <div className="fixed top-0 right-0 z-40 p-4">
        <TrialTimer />
      </div>
      
      {/* Main content */}
      <main className="flex-1 h-full overflow-auto md:ml-0 transition-all duration-300">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppShell;