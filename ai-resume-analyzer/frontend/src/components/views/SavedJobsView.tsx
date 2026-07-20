import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { SavedJob } from '../../types';
import { Bookmark, Building2, MapPin, DollarSign, ExternalLink, ArrowRight, Trash2 } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';

export const SavedJobsView: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  async function loadSavedJobs() {
    try {
      const data = await api.get<SavedJob[]>('/saved-jobs');
      setSavedJobs(data);
    } catch (err) {
      console.error('Failed to load saved jobs', err);
    } finally {
      setLoading(false);
    }
  }

  const handleRemove = async (jobId: number) => {
    try {
      await api.delete(`/jobs/${jobId}/save`);
      setSavedJobs(prev => prev.filter(s => s.jobId !== jobId));
    } catch (err) {
      console.error('Failed to remove bookmarked job', err);
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
        <h2 className="text-xl font-bold text-white tracking-tight">Saved & Bookmarked Roles</h2>
        <p className="text-xs text-slate-400 mt-1">Review and manage bookmarked listings you have prioritized for future submissions.</p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="glass-card p-16 text-center border border-white/5 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">No Bookmarked Jobs</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't bookmarked any jobs yet. Browse the career listings to save opportunities that catch your eye!
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('jobs')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl text-cyan-400 transition cursor-pointer"
            >
              Browse Open Roles
            </button>
          )}
        </div>
      ) : (
        <FadeIn className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map(sj => {
            const job = sj.job;
            if (!job) return null;
            return (
              <div key={sj.id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-white/10 transition flex flex-col justify-between space-y-4 relative overflow-hidden group">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => handleRemove(job.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/10 transition cursor-pointer"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition line-clamp-1">{job.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{job.company}</p>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-500 font-mono">
                    <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-600" /> {job.location || 'Remote'}</p>
                    {job.salaryMin && (
                      <p className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-slate-600" /> ${job.salaryMin.toLocaleString()}+ {job.salaryCurrency || 'USD'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">Saved {new Date(sj.createdAt).toLocaleDateString()}</span>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('jobs')}
                      className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition"
                    >
                      View Details <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </FadeIn>
      )}
    </div>
  );
};
