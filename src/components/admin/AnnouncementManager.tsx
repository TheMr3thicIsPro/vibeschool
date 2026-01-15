'use client';

import { useState, useEffect } from 'react';
import { listAnnouncements, createAnnouncement, deleteAnnouncement } from '@/actions/announcementActions';

interface Announcement {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAnnouncements();
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setAnnouncements(result.data);
      }
    } catch (err) {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newTitle.trim() || !newBody.trim()) {
      setError('Title and body are required');
      return;
    }

    try {
      const result = await createAnnouncement(newTitle, newBody);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setAnnouncements([result.data, ...announcements]);
        setNewTitle('');
        setNewBody('');
        setShowCreateForm(false);
      }
    } catch (err) {
      setError('Failed to create announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const result = await deleteAnnouncement(id);
      if (result.error) {
        setError(result.error);
      } else {
        setAnnouncements(announcements.filter(announcement => announcement.id !== id));
      }
    } catch (err) {
      setError('Failed to delete announcement');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Announcements</h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-accent-primary hover:bg-accent-primary/90 text-black px-3 py-1 rounded-md text-sm font-medium transition-colors hover-lift"
          >
            + New
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Announcement title"
              className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600 text-white"
            />
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Announcement content"
              className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600 text-white"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateAnnouncement}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm hover-lift"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTitle('');
                  setNewBody('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm hover-lift"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No announcements found</div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {announcements.map((announcement) => (
              <li key={announcement.id} className="p-3 border-b border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{announcement.title}</h4>
                    <p className="text-sm text-gray-300 mt-1">{announcement.body}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(announcement.created_at).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="p-1 rounded text-red-400 hover:bg-red-900/20 ml-2 hover-lift"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AnnouncementManager;