'use client';

import { ReactNode, useState } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const { state } = useAuthStore();
  const user = state.user;
  const loading = state.loading;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Show sidebar only when user is authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl font-bold text-accent-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // For non-authenticated users, just render children without sidebar
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile menu button - shown when sidebar is collapsed */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-sidebar-bg text-accent-primary hover:glow-button"
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