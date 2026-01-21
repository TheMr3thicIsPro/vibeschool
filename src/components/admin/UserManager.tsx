'use client';

import { useState, useEffect } from 'react';
import { listUsers, updateUser, deleteUser, searchUsers } from '@/actions/userActions';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  plan: string;
  created_at: string;
}

const UserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [originalUsers, setOriginalUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listUsers();
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setUsers(result.data);
        setOriginalUsers(result.data); // Store original for search
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Use original users for filtering
  const filteredUsers = originalUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Use the new hardened service function
      const result = await updateUser(userId, { role: newRole });
      if (result.error) {
        setError(result.error);
        console.error('Update user role error:', result.error);
      } else if (result.data) {
        setUsers(users.map(user => 
          user.id === userId ? result.data! : user
        ));
      }
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError('Failed to update user role');
    }
  };

  const updateUserPlan = async (userId: string, newPlan: string) => {
    try {
      const result = await updateUser(userId, { plan: newPlan });
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setUsers(users.map(user => 
          user.id === userId ? result.data! : user
        ));
      }
    } catch (err) {
      setError('Failed to update user plan');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Users</h3>
        
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={async (e) => {
              const value = e.target.value;
              setSearchTerm(value);
              
              // If search term is empty, load all users again
              if (!value.trim()) {
                loadUsers();
              } else {
                // For now, we'll just filter client-side
                // In a real implementation, you'd call searchUsers(value)
              }
            }}
            placeholder="Search users..."
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
          />
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{user.username}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded text-white text-sm p-1"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={user.plan}
                        onChange={(e) => updateUserPlan(user.id, e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded text-white text-sm p-1"
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button 
                        className="text-red-400 hover:text-red-300 text-sm hover-lift"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this user?')) {
                            const result = await deleteUser(user.id);
                            if (result.error) {
                              setError(result.error);
                            } else {
                              setUsers(users.filter(u => u.id !== user.id));
                            }
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;