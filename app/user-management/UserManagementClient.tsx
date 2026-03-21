'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, AlertCircle, Check, Edit, Save } from 'lucide-react';

type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

interface UserRecord {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

interface ApiResponse {
  users: UserRecord[];
}

export default function UserManagementClient({ currentRole }: { currentRole: UserRole }) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'USER' as UserRole,
  });

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'USER' as UserRole,
  });

  const canDelete = currentRole === 'ADMIN';
  const isModerator = currentRole === 'MODERATOR';

  const canEditUser = (user: UserRecord) => {
    if (currentRole === 'ADMIN') return true;
    if (currentRole === 'MODERATOR') return user.role === 'USER';
    return false;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user-management', { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch users');
      }
      const data = (await res.json()) as ApiResponse;
      setUsers(Array.isArray(data.users) ? data.users : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      setCreating(true);
      setCreateError(null);
      setCreateSuccess(null);

      const payload: Record<string, string> = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      };

      if (currentRole === 'ADMIN') {
        payload.role = form.role;
      }

      const res = await fetch('/api/user-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create user');
      }

      setCreateSuccess('User created successfully');
      setForm({ fullName: '', email: '', password: '', role: 'USER' });
      await fetchUsers();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!canDelete) return;
    const confirmed = window.confirm('Delete this user permanently?');
    if (!confirmed) return;

    try {
      setError(null);
      const res = await fetch(`/api/user-management/${userId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete user');
      }
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const openEditModal = (user: UserRecord) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
    });
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      setEditing(true);
      setEditError(null);

      const payload: Record<string, string> = {
        fullName: editForm.fullName,
        email: editForm.email,
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      if (currentRole === 'ADMIN') {
        payload.role = editForm.role;
      }

      const res = await fetch(`/api/user-management/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update user');
      }

      setIsEditOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 p-6" style={{ zIndex: 1, position: 'relative' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-[900] text-white mb-2">User Management</h1>
            <p className="text-white/60 font-[600]">
              {isModerator
                ? 'Moderator access: can create users and edit USER accounts only. Deleting is restricted.'
                : 'Manage user accounts and roles.'}
            </p>
          </div>
          <button
            onClick={() => {
              setCreateError(null);
              setCreateSuccess(null);
              setIsCreateOpen(true);
            }}
            className="px-5 py-2.5 bg-[#ff6600] hover:bg-[#ff7722] border-2 border-[#ff6600] rounded-[0.75rem] text-white font-[700] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border-2 border-red-500/50 rounded-[1rem] px-6 py-3 text-red-200 flex items-center gap-2 font-[600]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-black/50 backdrop-blur-lg border-2 border-white/10 rounded-[1rem] overflow-hidden hover:border-[#ff6600]/30 transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-white/10 bg-black/20">
                  <th className="px-6 py-4 text-left text-white font-[700] text-sm">Name</th>
                  <th className="px-6 py-4 text-left text-white font-[700] text-sm">Email</th>
                  <th className="px-6 py-4 text-center text-white font-[700] text-sm">Role</th>
                  <th className="px-6 py-4 text-center text-white font-[700] text-sm">Joined</th>
                  <th className="px-6 py-4 text-center text-white font-[700] text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-6 py-6 text-white/70 font-[600]" colSpan={5}>
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-white/70 font-[600]" colSpan={5}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="border-b border-white/10 hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-white font-[600]">{user.fullName}</td>
                      <td className="px-6 py-4 text-white/70 font-[600]">{user.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-[700] ${
                            user.role === 'ADMIN'
                              ? 'bg-red-500/20 text-red-400'
                              : user.role === 'MODERATOR'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-white/70 font-[600]">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {canEditUser(user) && (
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 hover:bg-white/10 rounded-[0.5rem] transition text-[#ff6600] hover:text-[#ff7722] font-[700]"
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {canDelete ? (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 hover:bg-red-500/20 rounded-[0.5rem] transition text-red-400 hover:text-red-300 font-[700]"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            !canEditUser(user) && (
                              <span className="text-white/40 text-xs font-[700]">No access</span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isCreateOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 backdrop-blur-lg border-2 border-white/10 rounded-[1rem] p-6 w-full max-w-md">
              <h2 className="text-2xl font-[800] text-white mb-5">Add User</h2>

              {createError && (
                <div className="mb-4 bg-red-500/20 border-2 border-red-500/50 rounded-[0.75rem] px-4 py-2.5 text-red-200 text-sm flex items-center gap-2 font-[600]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {createError}
                </div>
              )}

              {createSuccess && (
                <div className="mb-4 bg-green-500/20 border-2 border-green-500/40 rounded-[0.75rem] px-4 py-2.5 text-green-200 text-sm flex items-center gap-2 font-[600]">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  {createSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-[700] mb-2">Full Name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/50 border-2 border-white/10 rounded-[0.75rem] text-white focus:outline-none focus:border-[#ff6600] transition-colors font-[600]"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-[700] mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/50 border-2 border-white/10 rounded-[0.75rem] text-white focus:outline-none focus:border-[#ff6600] transition-colors font-[600]"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-[700] mb-2">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/50 border-2 border-white/10 rounded-[0.75rem] text-white focus:outline-none focus:border-[#ff6600] transition-colors font-[600]"
                  />
                </div>

                {currentRole === 'ADMIN' && (
                  <div>
                    <label className="block text-white text-sm font-[700] mb-2">Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                      className="w-full px-4 py-2.5 bg-black/50 border-2 border-white/10 rounded-[0.75rem] text-white focus:outline-none focus:border-[#ff6600] transition-colors font-[600]"
                    >
                      <option value="USER">USER</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 bg-black/50 hover:bg-white/10 border-2 border-white/20 rounded-[0.75rem] text-white transition-all font-[700]"
                >
                  Cancel
                </button>
                <button
                  disabled={creating}
                  onClick={handleCreateUser}
                  className="px-5 py-2.5 bg-[#ff6600] hover:bg-[#ff7722] disabled:opacity-50 border-2 border-[#ff6600] hover:border-[#ff7722] rounded-[0.75rem] text-white font-[700] transition-all"
                >
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isEditOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 backdrop-blur-lg border-2 border-white/10 rounded-[1rem] p-6 w-full max-w-md">
              <h2 className="text-2xl font-[800] text-white mb-5">Edit User</h2>

              {editError && (
                <div className="mb-4 bg-red-500/20 border-2 border-red-500/50 rounded-[0.75rem] px-4 py-2.5 text-red-200 text-sm flex items-center gap-2 font-[600]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {editError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-[700] mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/50 border-2 border-white/10 rounded-[0.75rem] text-white focus:outline-none focus:border-[#ff6600] transition-colors font-[600]"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-[700] mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/50 border-2 border-white/10 rounded-[0.75rem] text-white focus:outline-none focus:border-[#ff6600] transition-colors font-[600]"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-[700] mb-2">New Password</label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-4 py-2.5 bg-black/50 border-2 border-white/10 rounded-[0.75rem] text-white focus:outline-none focus:border-[#ff6600] transition-colors font-[600]"
                  />
                </div>

                {currentRole === 'ADMIN' && (
                  <div>
                    <label className="block text-white text-sm font-[700] mb-2">Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                      className="w-full px-4 py-2.5 bg-black/50 border-2 border-white/10 rounded-[0.75rem] text-white focus:outline-none focus:border-[#ff6600] transition-colors font-[600]"
                    >
                      <option value="USER">USER</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 bg-black/50 hover:bg-white/10 border-2 border-white/20 rounded-[0.75rem] text-white transition-all font-[700]"
                >
                  Cancel
                </button>
                <button
                  disabled={editing}
                  onClick={handleEditUser}
                  className="px-5 py-2.5 bg-[#ff6600] hover:bg-[#ff7722] disabled:opacity-50 border-2 border-[#ff6600] hover:border-[#ff7722] rounded-[0.75rem] text-white font-[700] transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
