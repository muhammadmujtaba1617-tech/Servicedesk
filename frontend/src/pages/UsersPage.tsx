import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { UserCheck } from 'lucide-react';

interface UserRow {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'customer' | 'agent' | 'admin';
  createdAt?: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/v1/users');
      setUsers(response.data.data.items || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setMsg('');
    try {
      await apiClient.patch(`/api/v1/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => ((u.id === userId || u._id === userId) ? { ...u, role: newRole as any } : u))
      );
      setMsg(`Role updated successfully for user.`);
      setTimeout(() => setMsg(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'agent':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage user accounts and role-based permissions</p>
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <UserCheck className="w-5 h-5" /> {msg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          No users found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Current Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => {
                const uid = user.id || user._id || `user-${idx}`;
                return (
                  <tr key={uid} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        disabled={updatingId === uid}
                        value={user.role}
                        onChange={(e) => handleRoleChange(uid, e.target.value)}
                        className="input text-xs py-1 px-2 w-auto bg-gray-50 font-medium"
                      >
                        <option value="customer">Customer</option>
                        <option value="agent">Support Agent</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;

