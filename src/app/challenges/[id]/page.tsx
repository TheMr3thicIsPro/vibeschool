'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/context/AuthContext';
import { getChallengeById, joinChallenge, submitToChallenge } from '@/services/challengeService';
import { ChallengeWithSubmissions } from '@/types/challenges';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import { format } from 'date-fns';
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Calendar, 
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const ChallengeDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { state } = useAuthStore();
  const { user, profile } = state;
  
  const challengeId = params.id as string;
  const [challenge, setChallenge] = useState<ChallengeWithSubmissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [error, setError] = useState('');

  // Fetch challenge details
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        setError('');
        
        const challengeData = await getChallengeById(challengeId, user?.id);
        setChallenge(challengeData);
      } catch (err: any) {
        setError(err.message || 'Failed to load challenge');
        console.error('Error fetching challenge:', err);
      } finally {
        setLoading(false);
      }
    };

    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId, user?.id]);

  // Handle join challenge
  const handleJoin = async () => {
    if (!user?.id) {
      router.push('/auth/login');
      return;
    }

    if (!profile?.basics_completed) {
      setError('You must complete the Basics Module before joining challenges');
      return;
    }

    try {
      setJoining(true);
      setError('');
      
      await joinChallenge({ challenge_id: challengeId }, user.id);
      
      // Refresh challenge data
      const updatedChallenge = await getChallengeById(challengeId, user.id);
      setChallenge(updatedChallenge);
      
    } catch (err: any) {
      setError(err.message || 'Failed to join challenge');
      console.error('Error joining challenge:', err);
    } finally {
      setJoining(false);
    }
  };

  // Handle file submission
  const handleSubmit = async () => {
    if (!user?.id || !challenge?.user_participation) {
      setError('You must join the challenge first');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      await submitToChallenge({
        challenge_id: challengeId,
        file: selectedFile || undefined,
        submission_notes: submissionNotes || undefined
      }, user.id);
      
      // Refresh challenge data
      const updatedChallenge = await getChallengeById(challengeId, user.id);
      setChallenge(updatedChallenge);
      
      // Reset form
      setSelectedFile(null);
      setSubmissionNotes('');
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit to challenge');
      console.error('Error submitting to challenge:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size exceeds 50MB limit');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading challenge details...</p>
              </div>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (!challenge) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                <h2 className="text-2xl font-bold text-white mb-2">Challenge Not Found</h2>
                <p className="text-gray-400 mb-6">The challenge you're looking for doesn't exist or has been removed.</p>
                <button
                  onClick={() => router.push('/challenges')}
                  className="px-6 py-3 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-primary/90 transition-colors hover-lift"
                >
                  Browse All Challenges
                </button>
              </div>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const userHasJoined = !!challenge.user_participation;
  const userHasSubmitted = challenge.submissions?.some(s => s.user_id === user?.id);
  const isActive = challenge.status === 'active';
  const isEnded = challenge.status === 'ended';
  const canSubmit = userHasJoined && (isActive || isEnded) && !userHasSubmitted;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
          <div className="container mx-auto px-4 py-8">
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-400" />
                  <span className="text-red-300">{error}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
                  
                  {/* Header */}
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-4">{challenge.title}</h1>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        challenge.type === 'paid' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {challenge.type === 'paid' ? `Paid ($${challenge.entry_fee})` : 'Free'}
                      </span>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        challenge.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        challenge.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {(challenge.status || 'unknown').charAt(0).toUpperCase() + (challenge.status || 'unknown').slice(1)}
                      </span>
                      
                      {userHasJoined && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-accent-primary/20 text-accent-primary">
                          Joined
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
                    <p className="text-gray-300 leading-relaxed">{challenge.description}</p>
                  </div>

                  {/* Timeline */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Timeline</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="text-gray-400" size={16} />
                          <span className="text-gray-400 text-sm">Start Date</span>
                        </div>
                        <p className="text-white font-medium">
                          {format(new Date(challenge.start_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="text-gray-400" size={16} />
                          <span className="text-gray-400 text-sm">End Date</span>
                        </div>
                        <p className="text-white font-medium">
                          {format(new Date(challenge.end_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Upload className="text-gray-400" size={16} />
                          <span className="text-gray-400 text-sm">Submission Deadline</span>
                        </div>
                        <p className="text-white font-medium">
                          {format(new Date(challenge.submission_deadline), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submission Form */}
                  {canSubmit && (
                    <div className="border-t border-gray-700 pt-8">
                      <h2 className="text-xl font-semibold text-white mb-4">Submit Your Entry</h2>
                      
                      <div className="space-y-6">
                        {/* File Upload */}
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Upload File (Optional)
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                              <div className="flex items-center gap-2">
                                <Upload size={20} className="text-gray-400" />
                                <span className="text-gray-300">
                                  {selectedFile ? selectedFile.name : 'Choose file...'}
                                </span>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept=".html,.css,.js,.json,.zip,image/*"
                                onChange={handleFileChange}
                              />
                            </label>
                            
                            {selectedFile && (
                              <button
                                onClick={() => setSelectedFile(null)}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm mt-1">
                            Supported: HTML, CSS, JS, JSON, ZIP, Images (Max 50MB)
                          </p>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Notes (Optional)
                          </label>
                          <textarea
                            value={submissionNotes}
                            onChange={(e) => setSubmissionNotes(e.target.value)}
                            placeholder="Describe your submission, approach, or any special considerations..."
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-primary min-h-24"
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="w-full py-3 px-6 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
                        >
                          {submitting ? 'Submitting...' : 'Submit Entry'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* User Submission Status */}
                  {userHasSubmitted && (
                    <div className="border-t border-gray-700 pt-8">
                      <h2 className="text-xl font-semibold text-white mb-4">Your Submission</h2>
                      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="text-green-400" size={20} />
                          <span className="text-green-300 font-medium">Entry Submitted Successfully</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Your submission is under review. Check back later for feedback.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Join Card */}
                {!userHasJoined && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Join Challenge</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Entry Fee</span>
                        <span className="text-white font-medium">
                          {challenge.type === 'paid' ? `$${challenge.entry_fee}` : 'Free'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-300">Prize Pool</span>
                        <span className="text-white font-medium">
                          {challenge.type === 'paid' ? `$${challenge.prize_pool}` : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-300">Participants</span>
                        <span className="text-white font-medium">{challenge.participant_count}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleJoin}
                      disabled={joining || !profile?.basics_completed}
                      className="w-full py-3 px-4 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
                    >
                      {joining ? 'Joining...' : 'Join Challenge'}
                    </button>

                    {!profile?.basics_completed && (
                      <p className="text-yellow-400 text-sm mt-3 text-center">
                        Complete Basics Module to join
                      </p>
                    )}
                  </div>
                )}

                {/* Stats Card */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Challenge Stats</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="text-gray-400" size={16} />
                      <div>
                        <p className="text-gray-300 text-sm">Participants</p>
                        <p className="text-white font-medium">{challenge.participant_count}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <FileText className="text-gray-400" size={16} />
                      <div>
                        <p className="text-gray-300 text-sm">Submissions</p>
                        <p className="text-white font-medium">{challenge.submissions?.length || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Trophy className="text-gray-400" size={16} />
                      <div>
                        <p className="text-gray-300 text-sm">Status</p>
                        <p className="text-white font-medium capitalize">{challenge.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default ChallengeDetailPage;