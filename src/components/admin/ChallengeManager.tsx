'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getAllChallengesAdmin,
  createChallengeAdmin,
  updateChallengeAdmin,
  publishChallengeAdmin,
  deleteChallengeAdmin,
} from '@/services/adminChallengeService';
import {
  Challenge,
  ChallengeWithSubmissions,
  CreateChallengeInput,
  UpdateChallengeInput,
  ChallengeType,
} from '@/types/challenges';
import { useAuthStore } from '@/context/AuthContext';
import { PlusIcon, TrashIcon, EyeIcon, EyeOffIcon, PencilIcon } from 'lucide-react';

// Helper: convert ISO string to datetime-local input value
function isoToLocalInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Helper: convert datetime-local input to ISO
function localInputToISO(v: string): string {
  // new Date treats this as local time; toISOString converts to UTC
  const d = new Date(v);
  return d.toISOString();
}

const defaultForm: CreateChallengeInput = {
  title: '',
  description: '',
  type: ChallengeType.FREE,
  entry_fee: 0,
  prize_pool: 0,
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // default +7 days
  submission_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  max_participants: undefined,
  is_published: false,
};

const ChallengeManager = () => {
  const { state } = useAuthStore();
  const adminId = state.user?.id;

  const [challenges, setChallenges] = useState<ChallengeWithSubmissions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  const [editing, setEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateChallengeInput>({ ...defaultForm });

  const isPaid = useMemo(() => form.type === ChallengeType.PAID, [form.type]);

  useEffect(() => {
    loadChallenges();
  }, []);

  const resetForm = () => {
    setForm({ ...defaultForm });
    setEditing(false);
    setEditingId(null);
  };

  const loadChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllChallengesAdmin();
      setChallenges(data);
    } catch (e: any) {
      console.error(e);
      setError('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!adminId) {
      setError('Missing admin ID');
      return;
    }
    // Minimal validation
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (new Date(form.start_date) > new Date(form.end_date)) {
      setError('Start date must be before end date');
      return;
    }
    if (new Date(form.submission_deadline) > new Date(form.end_date)) {
      setError('Submission deadline must be on or before end date');
      return;
    }

    try {
      const created = await createChallengeAdmin(form, adminId);
      setChallenges([created as any, ...challenges]);
      resetForm();
      setShowCreateForm(false);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to create challenge');
    }
  };

  const handleUpdate = async () => {
    if (!adminId || !editingId) {
      setError('Missing admin or challenge ID');
      return;
    }
    const payload: UpdateChallengeInput = {
      id: editingId,
      title: form.title,
      description: form.description,
      type: form.type,
      entry_fee: form.entry_fee,
      prize_pool: form.prize_pool,
      start_date: form.start_date,
      end_date: form.end_date,
      submission_deadline: form.submission_deadline,
      max_participants: form.max_participants,
      is_published: form.is_published,
    };
    try {
      const updated = await updateChallengeAdmin(payload, adminId);
      setChallenges(challenges.map((c) => (c.id === updated.id ? (updated as any) : c)));
      resetForm();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to update challenge');
    }
  };

  const handlePublishToggle = async (id: string, isPublished: boolean) => {
    if (!adminId) return;
    try {
      const updated = await publishChallengeAdmin(id, !isPublished, adminId);
      setChallenges(challenges.map((c) => (c.id === id ? (updated as any) : c)));
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to update publish status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!adminId) return;
    const ok = window.confirm('Are you sure you want to delete this challenge? This will also remove participants and submissions.');
    if (!ok) return;
    try {
      await deleteChallengeAdmin(id, adminId);
      setChallenges(challenges.filter((c) => c.id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to delete challenge');
    }
  };

  const beginEdit = (challenge: Challenge) => {
    setEditing(true);
    setEditingId(challenge.id);
    setShowCreateForm(false);
    setForm({
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      entry_fee: challenge.entry_fee,
      prize_pool: challenge.prize_pool,
      start_date: challenge.start_date,
      end_date: challenge.end_date,
      submission_deadline: challenge.submission_deadline,
      max_participants: challenge.max_participants,
      is_published: challenge.is_published,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Challenges</h3>
          <button
            onClick={() => {
              resetForm();
              setEditing(false);
              setShowCreateForm(!showCreateForm);
            }}
            className="bg-accent-primary hover:bg-accent-primary/90 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors hover-lift border border-accent-primary"
          >
            <PlusIcon size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        {(showCreateForm || editing) && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <h4 className="text-white font-medium mb-2">{editing ? 'Edit Challenge' : 'Create Challenge'}</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Challenge title"
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ChallengeType })}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                >
                  <option value={ChallengeType.FREE}>Free</option>
                  <option value={ChallengeType.PAID}>Paid</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the challenge"
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Start</label>
                <input
                  type="datetime-local"
                  value={isoToLocalInput(form.start_date)}
                  onChange={(e) => setForm({ ...form, start_date: localInputToISO(e.target.value) })}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">End</label>
                <input
                  type="datetime-local"
                  value={isoToLocalInput(form.end_date)}
                  onChange={(e) => setForm({ ...form, end_date: localInputToISO(e.target.value) })}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Submission Deadline</label>
                <input
                  type="datetime-local"
                  value={isoToLocalInput(form.submission_deadline)}
                  onChange={(e) => setForm({ ...form, submission_deadline: localInputToISO(e.target.value) })}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Max Participants (optional)</label>
                <input
                  type="number"
                  value={form.max_participants ?? ''}
                  onChange={(e) => setForm({ ...form, max_participants: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                  placeholder="e.g., 100"
                />
              </div>

              {isPaid && (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Entry Fee</label>
                    <input
                      type="number"
                      value={form.entry_fee ?? 0}
                      onChange={(e) => setForm({ ...form, entry_fee: Number(e.target.value) })}
                      className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Prize Pool</label>
                    <input
                      type="number"
                      value={form.prize_pool ?? 0}
                      onChange={(e) => setForm({ ...form, prize_pool: Number(e.target.value) })}
                      className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                      placeholder="e.g., 100"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2 flex items-center gap-2 mt-1">
                <input
                  id="is_published"
                  type="checkbox"
                  checked={!!form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="h-4 w-4 text-accent-primary bg-gray-700 border-gray-600 rounded"
                />
                <label htmlFor="is_published" className="text-sm text-gray-300">Published</label>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              {editing ? (
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm hover-lift"
                >
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm hover-lift"
                >
                  Create Challenge
                </button>
              )}
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateForm(false);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm hover-lift"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400">Loading challenges...</div>
        ) : challenges.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No challenges found</div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {challenges.map((challenge) => (
              <li
                key={challenge.id}
                className={`p-3 transition-colors hover:bg-gray-800/50`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white truncate">{challenge.title}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        challenge.is_published
                          ? 'bg-green-900/30 text-green-400 border border-green-800'
                          : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                      }`}>
                        {challenge.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        challenge.type === 'paid'
                          ? 'bg-purple-900/30 text-purple-400 border border-purple-800'
                          : 'bg-blue-900/30 text-blue-400 border border-blue-800'
                      }`}>
                        {challenge.type === 'paid' ? 'Paid' : 'Free'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{challenge.description}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        {new Date(challenge.start_date).toLocaleString()} → {new Date(challenge.end_date).toLocaleString()}
                      </span>
                      <span className="text-gray-600">|</span>
                      <span>Participants: {challenge.participant_count ?? 0}</span>
                      {challenge.type === 'paid' && (
                        <>
                          <span className="text-gray-600">|</span>
                          <span>Entry Fee: {challenge.entry_fee}</span>
                          <span className="text-gray-600">|</span>
                          <span>Prize Pool: {challenge.prize_pool}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handlePublishToggle(challenge.id, challenge.is_published)}
                      className={`p-1 rounded hover-lift ${
                        challenge.is_published ? 'text-green-400 hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-700'
                      }`}
                      title={challenge.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {challenge.is_published ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                    </button>
                    <button
                      onClick={() => beginEdit(challenge)}
                      className="p-1 rounded text-blue-400 hover:bg-blue-900/20 hover-lift"
                      title="Edit"
                    >
                      <PencilIcon size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(challenge.id)}
                      className="p-1 rounded text-red-400 hover:bg-red-900/20 hover-lift"
                      title="Delete"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChallengeManager;