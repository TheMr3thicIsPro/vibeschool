'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { getChallenges, getUserChallenges } from '@/services/challengeService';
import { ChallengeWithParticipants, ChallengeFilters } from '@/types/challenges';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import { format } from 'date-fns';
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Calendar, 
  Filter,
  Search,
  Crown,
  Zap,
  Lock
} from 'lucide-react';

const ChallengesPage = () => {
  const { state } = useAuthStore();
  const { user, profile } = state;
  
  const [challenges, setChallenges] = useState<ChallengeWithParticipants[]>([]);
  const [myChallenges, setMyChallenges] = useState<ChallengeWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [filters, setFilters] = useState<ChallengeFilters>({
    type: 'all',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        
        // Fetch all challenges
        const allChallenges = await getChallenges({
          ...filters,
          search: searchQuery || undefined
        });
        setChallenges(allChallenges);
        
        // Fetch user's challenges if logged in
        if (user?.id) {
          const userChallenges = await getUserChallenges(user.id);
          setMyChallenges(userChallenges);
        }
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [filters, searchQuery, user?.id]);

  // Handle filter changes
  const handleFilterChange = (key: keyof ChallengeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Render challenge status badge
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Upcoming' },
      active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
      ended: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Ended' },
      closed: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Closed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Render challenge type badge
  const renderTypeBadge = (type: string, entryFee: number) => {
    if (type === 'paid') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
          <DollarSign size={12} />
          Paid (${entryFee.toFixed(2)})
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
        Free
      </span>
    );
  };

  // Filter challenges based on active tab
  const filteredChallenges = activeTab === 'all' ? challenges : myChallenges;
  const displayedChallenges = filteredChallenges.filter(challenge => {
    // Additional client-side filtering if needed
    return true;
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading challenges...</p>
              </div>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00f3ff] to-[#b36cff] mb-2">
                Coding Challenges
              </h1>
              <p className="text-gray-400">
                Compete, learn, and showcase your skills in exciting coding competitions
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-accent-primary text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All Challenges
              </button>
              {user && (
                <button
                  onClick={() => setActiveTab('my')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'my'
                      ? 'bg-accent-primary text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  My Challenges
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search challenges..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  />
                </div>

                {/* Type Filter */}
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  <option value="all">All Types</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="ended">Ended</option>
                </select>

                {/* Sort */}
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="start_date-asc">Starting Soon</option>
                  <option value="participant_count-desc">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Challenges Grid */}
            {displayedChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedChallenges.map((challenge) => (
                  <div 
                    key={challenge.id} 
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-accent-primary/50 transition-all duration-300 hover-lift"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
                          <div className="flex flex-wrap gap-2">
                            {renderTypeBadge(challenge.type, challenge.entry_fee)}
                            {renderStatusBadge(challenge.status || 'upcoming')}
                          </div>
                        </div>
                        {challenge.user_participation?.is_winner && (
                          <Crown className="text-yellow-400" size={24} />
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-300 mb-4 line-clamp-3">
                        {challenge.description}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-300">
                            {challenge.participant_count} participants
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-300">
                            {challenge.time_remaining}
                          </span>
                        </div>
                        {challenge.type === 'paid' && (
                          <>
                            <div className="flex items-center gap-2">
                              <DollarSign size={16} className="text-gray-400" />
                              <span className="text-sm text-gray-300">
                                Entry: ${challenge.entry_fee.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Trophy size={16} className="text-gray-400" />
                              <span className="text-sm text-gray-300">
                                Prize: ${challenge.prize_pool.toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Starts {new Date(challenge.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap size={14} />
                          <span>Ends {new Date(challenge.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => window.location.href = `/challenges/${challenge.id}`}
                          className="flex-1 py-2 px-4 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-primary/90 transition-colors hover-lift"
                        >
                          {challenge.user_participation ? 'View Details' : 'Join Challenge'}
                        </button>
                        
                        {challenge.user_participation && (
                          <button
                            onClick={() => window.location.href = `/challenges/${challenge.id}/submit`}
                            disabled={challenge.status !== 'active'}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
                          >
                            {challenge.status === 'active' ? 'Submit' : 'View Submission'}
                          </button>
                        )}
                      </div>

                      {/* Locked state for non-Basics completers */}
                      {!profile?.basics_completed && (
                        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Lock size={16} className="text-yellow-500" />
                            <span className="text-yellow-300 text-sm">
                              Complete the Basics Module to join challenges
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="mx-auto text-gray-600 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  {activeTab === 'all' ? 'No challenges available' : 'No challenges joined yet'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'all' 
                    ? 'Check back later for new challenges!' 
                    : 'Browse and join challenges to get started.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default ChallengesPage;