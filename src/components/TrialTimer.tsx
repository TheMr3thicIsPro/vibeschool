'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { Clock } from 'lucide-react';

const TrialTimer = () => {
  const { state } = useAuthStore();
  const user = state.user;
  const profile = state.profile;
  
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    if (!user || !profile?.trial_expires_at || profile.plan !== 'free') {
      return;
    }

    const calculateTimeLeft = () => {
      const expiryDate = new Date(profile.trial_expires_at);
      const now = new Date();
      const difference = expiryDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft('Trial Expired');
        setIsExpiringSoon(true);
        return;
      }

      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (minutes < 5) {
        setIsExpiringSoon(true);
      } else {
        setIsExpiringSoon(false);
      }

      if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [user, profile]);

  if (!user || !profile?.trial_expires_at || profile.plan !== 'free') {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
      isExpiringSoon 
        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    }`}>
      <Clock size={16} />
      <span>Trial: {timeLeft}</span>
    </div>
  );
};

export default TrialTimer;