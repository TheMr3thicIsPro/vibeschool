'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';

const LockedAccountPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-6 text-center border border-red-500/30">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-red-500 mb-2">Trial ended</h1>
          <p className="text-foreground mb-4">
            Your free trial has wrapped up, but you’re just getting started.
          </p>
          <p className="text-foreground mb-4">
            Upgrade anytime to keep learning and unlock the full VibeSchool experience.
          </p>
        </div>
        <div className="space-y-4">
          <Link 
            href="/payments"
            className="w-full px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium inline-block text-center hover-lift border border-accent-primary"
          >
            Upgrade - $1.99/month
          </Link>
          <div className="text-sm text-gray-400">
            Lifetime access: $7.99
          </div>
        </div>

      </div>
    </div>
  );
};

export default LockedAccountPage;
