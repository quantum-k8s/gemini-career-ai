import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Job, Resume } from '../../types';
import { Search, MapPin, Briefcase, DollarSign, Filter, Bookmark, Check, Send, Sparkles, Building2, ExternalLink, X, FileCheck } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';

export const JobsView: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedRemote, setSelectedRemote] = useState('all');
  const [selectedSalary, setSelectedSalary] = useState(0);

  // Apply Modal state
  const [selectedJobToApply, setSelectedJobToApply] = useState<Job | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [allJobs, saved, applied, userResumes] = await Promise.all([
        api.get<Job[]>('/jobs'),
        api.get<{ id: number; jobId: number }[]>('/saved-jobs'),
        api.get<{ id: number; jobId: number }[]>('/applied-jobs'),
        api.get<Resume[]>('/resumes')
      ]);

      setJobs(allJobs);
      setSavedJobIds(saved.map(s => s.jobId));
      setAppliedJobIds(applied.map(a => a.jobId));
      setResumes(userResumes);

      if (userResumes.length > 0) {
        setSelectedResumeId(userResumes[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load job listings data', err);
    } finally {
      setLoading(false);
    }
  }

  const handleBookmarkToggle = async (jobId: number) => {
    const isSaved = savedJobIds.includes(jobId);
    try {
      if (isSaved) {
        await api.delete(`/jobs/${jobId}/save`);
        setSavedJobIds(prev => prev.filter(id => id !== jobId));
      } else {
        await api.post(`/jobs/${jobId}/save`, {});
        setSavedJobIds(prev => [...prev, jobId]);
      }
    } catch (err) {
      console.error('Failed to toggle saved job state', err);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobToApply) return;

    setApplying(true);
    try {
      await api.post(`/jobs/${selectedJobToApply.id}/apply`, {
        resumeId: selectedResumeId ? parseInt(selectedResumeId) : undefined,
        coverLetter
      });
      setAppliedJobIds(prev => [...prev, selectedJobToApply.id]);
      setApplySuccess(true);
      setTimeout(() => {
        setSelectedJobToApply(null);
        setApplySuccess(false);
        setCoverLetter('');
      }, 1500);
    } catch (err) {
      console.error('Application delivery failed', err);
    } finally {
      setApplying(false);
    }
  };

  // Filter logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedJobType === 'all' || job.jobType === selectedJobType;
    const matchesLevel = selectedLevel === 'all' || job.experienceLevel === selectedLevel;
    
    const matchesRemote = selectedRemote === 'all' || 
                          (selectedRemote === 'remote' && job.isRemote) ||
                          (selectedRemote === 'on-site' && !job.isRemote);

    const matchesSalary = selectedSalary === 0 || (job.salaryMin && job.salaryMin >= selectedSalary);

    return matchesSearch && matchesType && matchesLevel && matchesRemote && matchesSalary;
  });

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
        <h2 className="text-xl font-bold text-white tracking-tight">Active Career opportunities</h2>
        <p className="text-xs text-slate-400 mt-1">Discover, bookmark, and dispatch applications to customized technical listings matched to your credentials.</p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-5">
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Filter className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Job Filters</h3>
            </div>

            {/* Job Type */}
            <div className="space-y-2 text-xs">
              <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Employment Type</label>
              <select
                value={selectedJobType}
                onChange={e => setSelectedJobType(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/40"
              >
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Level */}
            <div className="space-y-2 text-xs">
              <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Experience Level</label>
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/40"
              >
                <option value="all">All Levels</option>
                <option value="Junior">Junior</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            {/* Remote */}
            <div className="space-y-2 text-xs">
              <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Workplace Mode</label>
              <select
                value={selectedRemote}
                onChange={e => setSelectedRemote(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/40"
              >
                <option value="all">All Settings</option>
                <option value="remote">Remote-only</option>
                <option value="on-site">In-Office</option>
              </select>
            </div>

            {/* Salary Range */}
            <div className="space-y-2 text-xs">
              <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase flex justify-between">
                <span>Minimum Salary</span>
                <span className="text-cyan-400 font-bold">${(selectedSalary / 1000).toFixed(0)}k</span>
              </label>
              <input
                type="range"
                min="0"
                max="250000"
                step="10000"
                value={selectedSalary}
                onChange={e => setSelectedSalary(parseInt(e.target.value))}
                className="w-full accent-cyan-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="lg:col-span-3 space-y-5">
          {/* Search Header */}
          <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search by role name, employer brand, or keyword technologies..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 font-mono font-semibold px-2 border border-white/5 rounded bg-white/2">
              {filteredJobs.length} matches
            </span>
          </div>

          {/* Job Cards */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="glass-card p-12 text-center border border-white/5 rounded-2xl text-slate-500 font-mono text-xs">
                No matching opportunities found based on current criteria. Try widening your search terms!
              </div>
            ) : (
              filteredJobs.map(job => {
                const isSaved = savedJobIds.includes(job.id);
                const isApplied = appliedJobIds.includes(job.id);
                return (
                  <FadeIn key={job.id} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition space-y-4 relative overflow-hidden group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 flex items-center justify-center shrink-0">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 mt-1 font-mono">
                            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {job.company}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location || 'Anywhere'}</span>
                            {job.isRemote && <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold">Remote</span>}
                          </div>
                        </div>
                      </div>

                      {/* Bookmark icon */}
                      <button
                        onClick={() => handleBookmarkToggle(job.id)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer shrink-0 ${
                          isSaved
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {job.description}
                    </p>

                    {/* Meta labels */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/2 text-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {job.skillsRequired?.slice(0, 4).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white/3 text-slate-300 rounded text-[9px] font-mono">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4">
                        {job.salaryMin && (
                          <span className="text-slate-300 font-semibold font-mono flex items-center text-[11px]">
                            <DollarSign className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            {job.salaryMin.toLocaleString()}+ {job.salaryCurrency || 'USD'}
                          </span>
                        )}

                        <button
                          disabled={isApplied}
                          onClick={() => setSelectedJobToApply(job)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer flex items-center gap-1.5 ${
                            isApplied
                              ? 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed'
                              : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/15'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Applied
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Apply Now
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </FadeIn>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {selectedJobToApply && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <FadeIn className="glass-card max-w-xl w-full border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setSelectedJobToApply(null)}
              className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-5">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest block font-bold">DISPATCH APPLICATION</span>
                <h3 className="text-lg font-bold text-white mt-1">Apply to {selectedJobToApply.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedJobToApply.company} — {selectedJobToApply.location || 'Anywhere'}</p>
              </div>

              {applySuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Application Dispatched!</h4>
                    <p className="text-xs text-slate-500 mt-1">Your credentials have been securely routed to the HR hiring portal.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Choose Resume */}
                  <div className="space-y-2 text-xs">
                    <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Select Active Resume Version</label>
                    {resumes.length === 0 ? (
                      <div className="p-3 border border-red-500/10 bg-red-500/5 text-red-400 rounded-xl leading-relaxed">
                        Please upload a resume first to support job applications.
                      </div>
                    ) : (
                      <select
                        value={selectedResumeId}
                        onChange={e => setSelectedResumeId(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/40"
                      >
                        {resumes.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.filename} ({new Date(r.createdAt).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Cover Letter */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Cover Letter / Note to Recruiter</label>
                      <span className="text-slate-500 font-mono">Optional</span>
                    </div>
                    <textarea
                      value={coverLetter}
                      onChange={e => setCoverLetter(e.target.value)}
                      placeholder="Explain why your experience matches this role's credentials, achievements, or target skills..."
                      rows={5}
                      className="w-full bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl p-3 text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-500/40 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setSelectedJobToApply(null)}
                      className="px-4 py-2 text-slate-400 hover:text-white bg-white/5 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applying || resumes.length === 0}
                      className="px-5 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    >
                      {applying ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                          Routing...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Dispatch Application
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </FadeIn>
        </div>
      )}
    </div>
  );
};
