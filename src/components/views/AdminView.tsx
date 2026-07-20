import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { User, ShieldAlert, Trash2, Shield, Calendar, Mail, Phone, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FadeIn } from '../animations/FadeIn';

export const AdminView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const list = await api.get<any[]>('/admin/users');
      setUsers(list);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user list.');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteUser = async (id: number, email: string) => {
    if (id === currentUser?.id) {
      alert('You cannot delete your own admin account!');
      return;
    }
    if (!confirm(`Are you sure you want to delete user "${email}" and ALL their resumes and reports? This is irreversible!`)) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" /> Admin User Management
        </h2>
        <p className="text-xs text-slate-400 mt-1">Oversee active registered candidate accounts, audit administrative levels, and manage data lifecycles</p>
      </div>

      {error ? (
        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          <span>Error: {error} (Admin authentication privileges required).</span>
        </div>
      ) : (
        <FadeIn duration={0.3}>
          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Contact & Links</th>
                    <th className="px-6 py-4">Date Joined</th>
                    <th className="px-6 py-4">Role Privileges</th>
                    <th className="px-6 py-4 text-right">Action Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono">
                        No candidate accounts available.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/2 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-200">{u.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" /> {u.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 space-y-1">
                          {u.phone && (
                            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" /> {u.phone}
                            </p>
                          )}
                          <div className="flex gap-2.5">
                            {u.linkedin && (
                              <a href={u.linkedin} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5 font-mono">
                                LinkedIn <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            {u.github && (
                              <a href={u.github} target="_blank" rel="noreferrer" className="text-[10px] text-violet-400 hover:underline flex items-center gap-0.5 font-mono">
                                GitHub <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            {u.portfolio && (
                              <a href={u.portfolio} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 font-mono">
                                Portfolio <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.isAdmin ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">
                              <Shield className="w-3.5 h-3.5" /> ADMIN
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">Candidate User</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={u.id === currentUser?.id}
                            className={`p-2 rounded-xl transition cursor-pointer border ${
                              u.id === currentUser?.id
                                ? 'bg-transparent text-slate-600 border-white/5 cursor-not-allowed'
                                : 'bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border-white/5 hover:border-red-500/20'
                            }`}
                            title={u.id === currentUser?.id ? 'Cannot delete your own account' : 'Delete Candidate Account'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
};
