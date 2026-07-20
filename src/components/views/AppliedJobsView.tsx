import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { AppliedJob } from '../../types';
import { Send, Building2, MapPin, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';

export const AppliedJobsView: React.FC = () => {
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppliedJobs();
  }, []);

  async function loadAppliedJobs() {
    try {
      const data = await api.get<AppliedJob[]>('/applied-jobs');
      setAppliedJobs(data);
    } catch (err) {
      console.error('Failed to load application history', err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'reviewing':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
      case 'reviewing':
        return <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
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
        <h2 className="text-xl font-bold text-white tracking-tight">Application Dispatch Logs</h2>
        <p className="text-xs text-slate-400 mt-1">Track live review status, delivery timestamps, and cover letter records for submitted roles.</p>
      </div>

      {appliedJobs.length === 0 ? (
        <div className="glass-card p-16 text-center border border-white/5 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">No Dispatched Applications</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't submitted any job applications yet. Go to "Job Search" to apply directly!
            </p>
          </div>
        </div>
      ) : (
        <FadeIn className="glass-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  <th className="px-6 py-4">Job Info</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">Review Status</th>
                  <th className="px-6 py-4">Routing ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {appliedJobs.map(app => {
                  const job = app.job;
                  if (!job) return null;
                  return (
                    <tr key={app.id} className="hover:bg-white/1 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 line-clamp-1">{job.title}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{job.company} — {job.location || 'Anywhere'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-600" />
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 border rounded-full font-mono text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-[10px]">
                        TXN_APP_{app.id.toString().padStart(4, '0')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FadeIn>
      )}
    </div>
  );
};
