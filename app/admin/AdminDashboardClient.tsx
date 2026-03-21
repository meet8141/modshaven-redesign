'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Edit,
  Trash2,
  ChevronDown,
  Search,
  TrendingUp,
  Users,
  Box,
  Download,
  X,
  Eye,
  Save,
  AlertCircle,
  Check,
} from 'lucide-react';

interface Mod {
  _id: string;
  name: string;
  author: string;
  game: string;
  downloads: number;
  featured: boolean;
  ads_mode: number;
  date_added: string;
  slug: string;
  description?: string;
  mod_image?: string;
  downloads_size?: string;
  download_link?: string;
  AD_link?: string;
  Virustotal_link?: string;
  images?: string[];
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profileImageURL?: string;
  createdAt: string;
  roleHistory?: any[];
}

interface DashboardData {
  mods: Mod[];
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: Record<string, string>;
}

interface Stats {
  totalMods: number;
  beamngMods: number;
  assettoCorsaMods: number;
  featuredMods: number;
  totalDownloads: number;
}

type ModalType = 'editMod' | 'deleteMod' | 'createUser' | 'editUser' | 'roleHistory' | 'uploadHistory' | null;

const inputClass =
  'w-full px-4 py-2.5 bg-black/50 border-2 border-white/10 rounded-[0.75rem] text-white focus:outline-none focus:border-[#ff6600] transition-colors font-[600]';
const labelClass = 'block text-white text-sm font-[700] mb-2';

export default function AdminDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchMod, setSearchMod] = useState('');
  const [gameMod, setGameMod] = useState('all');
  const [sortBy, setSortBy] = useState('date_added');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'mods' | 'users'>('mods');

  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: '12',
        search: searchMod,
        game: gameMod,
        sortBy,
        sortOrder,
      });

      const [dashRes, statsRes] = await Promise.all([
        fetch(`/api/admin/dashboard?${queryParams}`),
        fetch('/api/admin/stats'),
      ]);

      if (!dashRes.ok) throw new Error('Failed to fetch dashboard');
      if (!statsRes.ok) throw new Error('Failed to fetch stats');

      const dashData = await dashRes.json();
      const statsData = await statsRes.json();

      setData(dashData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [currentPage, searchMod, gameMod, sortBy, sortOrder]);

  const handleSearchChange = (value: string) => {
    setSearchMod(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (game: string) => {
    setGameMod(game);
    setCurrentPage(1);
  };

  const handleSaveMod = async () => {
    if (!selectedMod) return;

    try {
      setSaving(true);
      setSaveError(null);

      const response = await fetch(`/api/admin/mod/${selectedMod._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update mod');
      }

      setModalType(null);
      await fetchDashboard();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMod = async () => {
    if (!selectedMod) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/mod/${selectedMod._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete mod');

      setModalType(null);
      await fetchDashboard();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleAdsMode = async (modId: string, newMode: number) => {
    try {
      const response = await fetch(`/api/admin/mod/${modId}/ads`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ads_mode: newMode }),
      });

      if (!response.ok) throw new Error('Failed to update ads mode');
      await fetchDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const getModPublicPath = (mod: Mod) => {
    const slugOrName = mod.slug?.trim() ? mod.slug : mod.name;
    return `/mods/${encodeURIComponent(slugOrName)}`;
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  pt-32 p-6" style={{ zIndex: 1, position: 'relative' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-[900] text-white mb-2">Admin Dashboard</h1>
          <p className="text-white/60 font-[600]">Manage mods, users, and platform settings</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border-2 border-red-500/50 rounded-[1rem] px-6 py-3 text-red-200 flex items-center gap-2 font-[600]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <StatCard title="Total Mods" value={stats.totalMods} icon={<Box className="w-6 h-6" />} />
            <StatCard
              title="BeamNG Mods"
              value={stats.beamngMods}
              icon={<TrendingUp className="w-6 h-6" />}
            />
            <StatCard
              title="Assetto Corsa"
              value={stats.assettoCorsaMods}
              icon={<TrendingUp className="w-6 h-6" />}
            />
            <StatCard
              title="Featured"
              value={stats.featuredMods}
              icon={<Download className="w-6 h-6" />}
            />
            <StatCard
              title="Total Downloads"
              value={stats.totalDownloads}
              icon={<Users className="w-6 h-6" />}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b-2 border-white/10">
          <button
            onClick={() => setActiveTab('mods')}
            className={`px-6 py-3 font-[800] border-b-2 text-base transition-colors ${
              activeTab === 'mods'
                ? 'text-white border-[#ff6600]'
                : 'text-white/60 border-transparent hover:text-white hover:border-[#ff6600]/50'
            }`}
          >
            Mods
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-[700] border-b-2 transition-all ${
              activeTab === 'users'
                ? 'text-white border-[#ff6600]'
                : 'text-white/60 border-transparent hover:text-white hover:border-[#ff6600]/50'
            }`}
          >
            Users
          </button>
        </div>

        {/* Mods Table */}
        {activeTab === 'mods' && data && (
          <div>
            {/* Filters */}
            <div className="flex flex-col md:flex-row  gap-4 mb-6">
              <div className="flex-1 flex gap-4 flex-col sm:flex-row">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#ff6600]/60" />
                  <input
                    type="text"
                    placeholder="Search mods..."
                    value={searchMod}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-black/50 backdrop-blur-lg border-2 border-white/10 rounded-[0.75rem] text-white placeholder-white/40 focus:outline-none focus:border-[#ff6600] transition-colors font-[600]"
                  />
                </div>

                <div className="w-[220px]  ">
                  <ThemedDropdown 
                    value={gameMod}
                    options={[
                      { value: 'all', label: 'All Games' },
                      { value: 'BeamNG.drive', label: 'BeamNG.drive' },
                      { value: 'Assetto Corsa', label: 'Assetto Corsa' },
                    ]}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>

            {/* Mods Table */}
            <div className="bg-black/50 backdrop-blur-lg border-2 border-white/10 rounded-[1rem] overflow-hidden hover:border-[#ff6600]/30 transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-white/10 bg-black/20">
                      <th className="px-6 py-4 text-left text-white font-[700] text-sm">Name</th>
                      <th className="px-6 py-4 text-left text-white font-[700] text-sm">Author</th>
                      <th className="px-6 py-4 text-left text-white font-[700] text-sm">Game</th>
                      <th className="px-6 py-4 text-center text-white font-[700] text-sm">Downloads</th>
                      <th className="px-6 py-4 text-center text-white font-[700] text-sm">Ads Mode</th>
                      <th className="px-6 py-4 text-center text-white font-[700] text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.mods.map((mod) => (
                      <tr key={mod._id} className="border-b border-white/10 hover:bg-white/5 transition">
                        <td className="px-6 py-4 text-white font-[600]">{mod.name}</td>
                        <td className="px-6 py-4 text-white/70 font-[600]">{mod.author}</td>
                        <td className="px-6 py-4 text-white/70 font-[600]">{mod.game}</td>
                        <td className="px-6 py-4 text-center text-white font-[600]">{mod.downloads.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="mx-auto w-[132px]">
                            <ThemedDropdown
                              compact
                              value={String(mod.ads_mode)}
                              options={[
                                { value: '0', label: 'Disabled' },
                                { value: '1', label: 'Mode 1' },
                                { value: '2', label: 'Mode 2' },
                              ]}
                              onChange={(value) => handleAdsMode(mod._id, Number(value))}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => window.open(getModPublicPath(mod), '_blank', 'noopener,noreferrer')}
                              className="p-2 hover:bg-white/10 rounded-[0.5rem] transition text-[#ff6600] hover:text-[#ff7722] font-[700]"
                              title="View mod page"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMod(mod);
                                setEditFormData(mod);
                                setModalType('editMod');
                              }}
                              className="p-2 hover:bg-white/10 rounded-[0.5rem] transition text-[#ff6600] hover:text-[#ff7722] font-[700]"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMod(mod);
                                setModalType('deleteMod');
                              }}
                              className="p-2 hover:bg-red-500/20 rounded-[0.5rem] transition text-red-400 hover:text-red-300 font-[700]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-2 p-4 border-t-2 border-white/10">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-black/50 hover:bg-white/10 disabled:opacity-30 border-2 border-white/10 hover:border-[#ff6600] rounded-[0.75rem] text-white transition-all font-[700] disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-3 px-4">
                  <span className="text-white font-[700]">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(data.pagination.totalPages, currentPage + 1))
                  }
                  disabled={currentPage === data.pagination.totalPages}
                  className="px-4 py-2 bg-black/50 hover:bg-white/10 disabled:opacity-30 border-2 border-white/10 hover:border-[#ff6600] rounded-[0.75rem] text-white transition-all font-[700] disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        {activeTab === 'users' && data && (
          <div>
            {/* Users Table */}
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
                    {data.users.map((user) => (
                      <tr key={user._id} className="border-b border-white/10 hover:bg-white/5 transition">
                        <td className="px-6 py-4 text-white font-[600]">{user.fullName}</td>
                        <td className="px-6 py-4 text-white/70 font-[600]">{user.email}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-[700] ${
                            user.role === 'ADMIN'
                              ? 'bg-red-500/20 text-red-400'
                              : user.role === 'MODERATOR'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-white/70 font-[600]">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setModalType('roleHistory');
                              }}
                              className="p-2 hover:bg-white/10 rounded-[0.5rem] transition text-[#ff6600] hover:text-[#ff7722] font-[700]"
                              title="View role history"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setEditFormData(user);
                                setModalType('editUser');
                              }}
                              className="p-2 hover:bg-white/10 rounded-[0.5rem] transition text-[#ff6600] hover:text-[#ff7722] font-[700]"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setModalType('deleteMod');
                              }}
                              className="p-2 hover:bg-red-500/20 rounded-[0.5rem] transition text-red-400 hover:text-red-300 font-[700]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Edit Mod Modal */}
        {modalType === 'editMod' && selectedMod && (
          <Modal title="Edit Mod" size="lg" onClose={() => setModalType(null)}>
            <div className="space-y-4">
              {saveError && (
                <div className="bg-red-500/20 border-2 border-red-500/50 rounded-[0.75rem] px-4 py-2.5 text-red-200 text-sm flex items-center gap-2 font-[600]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {saveError}
                </div>
              )}

              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={(editFormData as any)?.name || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  value={(editFormData as any)?.description || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Author</label>
                  <input
                    type="text"
                    value={(editFormData as any)?.author || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, author: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Game</label>
                  <ThemedDropdown
                    value={(editFormData as any)?.game || ''}
                    options={[
                      { value: '', label: 'Select Game' },
                      { value: 'BeamNG.drive', label: 'BeamNG.drive' },
                      { value: 'Assetto Corsa', label: 'Assetto Corsa' },
                    ]}
                    onChange={(value) => setEditFormData({ ...editFormData, game: value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Download Size</label>
                  <input
                    type="text"
                    value={(editFormData as any)?.downloads_size || ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        downloads_size: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Download Link</label>
                  <input
                    type="url"
                    value={(editFormData as any)?.download_link || ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        download_link: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 text-white cursor-pointer font-[600]">
                  <input
                    type="checkbox"
                    checked={(editFormData as any)?.featured || false}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, featured: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-2 border-white/20 accent-[#ff6600] cursor-pointer"
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setModalType(null)}
                  className="px-5 py-2.5 bg-black/50 hover:bg-white/10 border-2 border-white/20 rounded-[0.75rem] text-white transition-all font-[700]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMod}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#ff6600] hover:bg-[#ff7722] disabled:opacity-50 border-2 border-[#ff6600] hover:border-[#ff7722] rounded-[0.75rem] text-white font-[700] transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Mod Modal */}
        {modalType === 'deleteMod' && selectedMod && (
          <Modal title="Delete Mod" onClose={() => setModalType(null)}>
            <div className="space-y-4">
              <p className="text-white/80 font-[600]">
                Are you sure you want to delete <span className="font-[800] text-[#ff6600]">"{selectedMod.name}"</span>?
              </p>
              <p className="text-red-400 text-sm font-[600]">This action cannot be undone.</p>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setModalType(null)}
                  className="px-5 py-2.5 bg-black/50 hover:bg-white/10 border-2 border-white/20 rounded-[0.75rem] text-white transition-all font-[700]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMod}
                  disabled={saving}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 border-2 border-red-600 hover:border-red-700 rounded-[0.75rem] text-white font-[700] transition-all"
                >
                  {saving ? 'Deleting...' : 'Delete Mod'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit User Modal */}
        {modalType === 'editUser' && selectedUser && (
          <Modal title="Edit User" onClose={() => setModalType(null)}>
            <div className="space-y-4">
              {saveError && (
                <div className="bg-red-500/20 border-2 border-red-500/50 rounded-[0.75rem] px-4 py-2.5 text-red-200 text-sm flex items-center gap-2 font-[600]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {saveError}
                </div>
              )}

              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  value={(editFormData as any)?.fullName || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, fullName: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={(editFormData as any)?.email || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Role</label>
                <ThemedDropdown
                  value={(editFormData as any)?.role || ''}
                  options={[
                    { value: '', label: 'Select Role' },
                    { value: 'USER', label: 'User' },
                    { value: 'MODERATOR', label: 'Moderator' },
                    { value: 'ADMIN', label: 'Admin' },
                  ]}
                  onChange={(value) => setEditFormData({ ...editFormData, role: value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setModalType(null)}
                  className="px-5 py-2.5 bg-black/50 hover:bg-white/10 border-2 border-white/20 rounded-[0.75rem] text-white transition-all font-[700]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMod}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#ff6600] hover:bg-[#ff7722] disabled:opacity-50 border-2 border-[#ff6600] hover:border-[#ff7722] rounded-[0.75rem] text-white font-[700] transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Role History Modal */}
        {modalType === 'roleHistory' && selectedUser && (
          <Modal title="Role History" onClose={() => setModalType(null)}>
            <div className="space-y-3">
              {selectedUser.roleHistory && selectedUser.roleHistory.length > 0 ? (
                <div className="space-y-3">
                  {selectedUser.roleHistory.map((entry: any, idx: number) => (
                    <div key={idx} className="bg-black/50 border border-white/10 rounded-[0.75rem] p-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-white/80 text-xs font-[600]">
                            {entry.oldRole && `${entry.oldRole}`} → {entry.newRole}
                          </p>
                          <p className="text-white/60 text-xs mt-1">{entry.reason || 'No reason provided'}</p>
                        </div>
                        <span className="text-white/50 text-xs whitespace-nowrap">
                          {entry.changedAt ? new Date(entry.changedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-sm font-[600]">No role history available.</p>
              )}
            </div>
          </Modal>
        )}

        {/* Delete User Modal */}
        {modalType === 'deleteMod' && selectedUser && (
          <Modal title="Delete User" onClose={() => setModalType(null)}>
            <div className="space-y-4">
              <p className="text-white/80 font-[600]">
                Are you sure you want to delete <span className="font-[800] text-[#ff6600]">"{selectedUser.fullName}"</span>?
              </p>
              <p className="text-red-400 text-sm font-[600]">This action cannot be undone.</p>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setModalType(null)}
                  className="px-5 py-2.5 bg-black/50 hover:bg-white/10 border-2 border-white/20 rounded-[0.75rem] text-white transition-all font-[700]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMod}
                  disabled={saving}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 border-2 border-red-600 hover:border-red-700 rounded-[0.75rem] text-white font-[700] transition-all"
                >
                  {saving ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-black/50 backdrop-blur-lg border-2 border-white/10 rounded-[1rem] p-5 hover:border-[#ff6600]/50 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-xs font-[700] text-uppercase tracking-wide">{title}</p>
          <p className="text-white text-3xl font-[900] mt-2">{value.toLocaleString()}</p>
        </div>
        <div className="text-[#ff6600] opacity-80">{icon}</div>
      </div>
    </div>
  );
}

function Modal({
  title,
  size = 'md',
  onClose,
  children,
}: {
  title: string;
  size?: 'sm' | 'md' | 'lg';
  onClose: () => void;
  children: React.ReactNode;
}) {
  const widthClass = size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-md';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-black/90 backdrop-blur-lg border-2 border-white/10 rounded-[1rem] p-6 ${widthClass} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-[800] text-white">{title}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-[#ff6600] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ThemedDropdown({
  value,
  options,
  onChange,
  compact = false,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center backdrop-blur-lg justify-between gap-2 px-3 ${compact ? 'py-1.5 rounded-[0.5rem] text-xs' : 'py-2.5 rounded-[0.6rem] text-sm'} font-semibold border-2 transition-all text-white ${
          open ? 'border-[#ff6600] shadow-[0_0_10px_#ff660033]' : 'border-white/10 hover:border-[#ff6600]/60'
        }`}
      >
        <span className="truncate text-left">{selected?.label ?? 'Select'}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#ff6600] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="scrollbar-themed absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-[0.75rem] bg-black/80 backdrop-blur-lg border-2 border-[#ff6600]/60 shadow-[0_8px_32px_#ff660022]">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 ${compact ? 'py-2 text-xs' : 'py-2.5 text-sm'} transition-all duration-150 first:rounded-t-[0.65rem] last:rounded-b-[0.65rem] ${
                  active
                    ? 'bg-[#ff6600] text-white font-bold'
                    : 'text-white/75 hover:bg-[#ff6600]/15 hover:text-white font-medium'
                }`}
              >
                <span>{option.label}</span>
                {active && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
