import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Resume, AtsAnalysis, JobDescription } from '../../types';
import { ScanLine, Sparkles, AlertCircle, Play, FileText, CheckCircle2, ChevronRight, Bookmark } from 'lucide-react';
import { FadeIn, StaggerContainer } from '../animations/FadeIn';

interface AnalyzeViewProps {
  onNavigate: (page: string) => void;
  selectedResumeId?: number;
  selectedJDId?: number;
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({ onNavigate, selectedResumeId, selectedJDId }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jds, setJds] = useState<JobDescription[]>([]);
  
  const [resumeId, setResumeId] = useState<string>(selectedResumeId?.toString() || '');
  const [jdId, setJdId] = useState<string>(selectedJDId?.toString() || '');
  const [jdText, setJdText] = useState<string>('');
  const [jdTitle, setJdTitle] = useState<string>('');

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [resList, jdList] = await Promise.all([
          api.get<Resume[]>('/resumes'),
          api.get<JobDescription[]>('/job-descriptions')
        ]);
        setResumes(resList);
        setJds(jdList);

        if (resList.length > 0 && !resumeId) {
          setResumeId(resList[0].id.toString());
        }
        if (jdList.length > 0 && !jdId) {
          setJdId(jdList[0].id.toString());
          setJdText(jdList[0].content);
        }
      } catch (err) {
        console.error('Failed to load options', err);
      }
    }
    loadOptions();
  }, []);

  const handleJdSelect = (idStr: string) => {
    setJdId(idStr);
    if (idStr === 'custom') {
      setJdText('');
      setJdTitle('');
    } else {
      const selected = jds.find(j => j.id.toString() === idStr);
      if (selected) {
        setJdText(selected.content);
        setJdTitle(selected.title);
      }
    }
  };

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId) {
      setError('Please select or upload a resume first.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      let finalJdId: number | undefined;

      // If pasting custom JD, save it first
      if (jdId === 'custom' && jdText.trim().length > 0) {
        const savedJd = await api.post<JobDescription>('/job-descriptions', {
          title: jdTitle.trim() || 'Custom Job Description',
          content: jdText.trim()
        });
        finalJdId = savedJd.id;
        // Refresh JDs list
        const updatedJds = await api.get<JobDescription[]>('/job-descriptions');
        setJds(updatedJds);
        setJdId(savedJd.id.toString());
      } else if (jdId !== 'custom') {
        finalJdId = parseInt(jdId);
      }

      const scoreResult = await api.post<AtsAnalysis>('/ai/ats-score', {
        resumeId: parseInt(resumeId),
        jobDescriptionId: finalJdId,
        jobDescriptionText: jdId === 'custom' ? jdText : undefined
      });

      setResult(scoreResult);
    } catch (err: any) {
      setError(err.message || 'AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'stroke-emerald-500 text-emerald-400';
    if (score >= 60) return 'stroke-cyan-500 text-cyan-400';
    return 'stroke-orange-500 text-orange-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score >= 60) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">ATS Analysis Suite</h2>
        <p className="text-xs text-slate-400 mt-1">Audit resumes against job descriptions to score formatting, keyword compatibility, and qualifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Input panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono text-slate-400">Analysis Inputs</h3>

            {resumes.length === 0 ? (
              <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15 text-xs text-yellow-400 space-y-3">
                <p>No resumes available to analyze.</p>
                <button
                  onClick={() => onNavigate('upload')}
                  className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg text-yellow-300 font-bold tracking-tight transition cursor-pointer"
                >
                  Upload a Resume Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleStartAnalysis} className="space-y-5">
                {/* Resume Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Select Resume
                  </label>
                  <select
                    value={resumeId}
                    onChange={(e) => setResumeId(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>{r.filename} ({r.fileType.toUpperCase()})</option>
                    ))}
                  </select>
                </div>

                {/* JD Options */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Target Job Description
                  </label>
                  <select
                    value={jdId}
                    onChange={(e) => handleJdSelect(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 mb-3"
                  >
                    <option value="custom">✍️ Paste Custom JD Text</option>
                    {jds.map(j => (
                      <option key={j.id} value={j.id}>📁 {j.title}</option>
                    ))}
                  </select>
                </div>

                {/* Custom JD fields */}
                {jdId === 'custom' && (
                  <div className="space-y-3 pt-1 border-t border-white/5">
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Job Title (e.g. Senior Frontend Developer)"
                        value={jdTitle}
                        onChange={(e) => setJdTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <textarea
                        rows={8}
                        placeholder="Paste job description qualifications, skills, and details here..."
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-600 font-mono"
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* Read only loaded JD */}
                {jdId !== 'custom' && (
                  <div className="p-3 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-slate-400 line-clamp-4 font-mono">
                    {jdText}
                  </div>
                )}

                {/* Submit Trigger */}
                <button
                  type="submit"
                  disabled={analyzing}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl font-semibold text-xs text-white shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      Running ATS Audit...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Start Comprehensive Audit
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Output panel */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-start gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">AI Scan Failed</p>
                <p className="text-xs text-slate-400 mt-1">{error}</p>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="glass-card p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-cyan-500/10 border-t-cyan-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-cyan-400">
                  <ScanLine className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div>
                <h4 className="text-base font-semibold text-white tracking-tight animate-pulse">Scanning Resume Compatibility...</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1.5">
                  Gemini API is performing a deep scan of formatting compliance, keywords matching density, and grammatical structure.
                </p>
              </div>
            </div>
          )}

          {!result && !analyzing && !error && (
            <div className="glass-card p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
                <ScanLine className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-300">Awaiting Input Selection</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                  Select a resume and configure a target job description on the left panel to execute a deep ATS audit.
                </p>
              </div>
            </div>
          )}

          {result && !analyzing && (
            <FadeIn duration={0.4} className="space-y-6">
              {/* Overall Score Circle & Category bars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Circle overall */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-4">Overall Score</span>
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="54" strokeWidth="8" stroke="rgba(255,255,255,0.02)" fill="transparent" />
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 54}
                        strokeDashoffset={2 * Math.PI * 54 * (1 - result.overallScore / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                        className={`transition-all duration-1000 ${getScoreColor(result.overallScore)}`}
                      />
                    </svg>
                    <span className="absolute text-3xl font-display font-extrabold text-white">
                      {result.overallScore}%
                    </span>
                  </div>
                  <span className={`mt-4 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider border uppercase ${getScoreBgColor(result.overallScore)}`}>
                    {result.overallScore >= 80 ? 'EXCELLENT MATCH' : result.overallScore >= 60 ? 'COMPATIBLE' : 'NEEDS OPTIMIZATION'}
                  </span>
                </div>

                {/* Mini category scores */}
                <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-2">Category Scores</span>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                    {[
                      { label: 'Keywords Density', value: result.categoryScores.keywords },
                      { label: 'ATS Formatting', value: result.categoryScores.formatting },
                      { label: 'Experience Alignment', value: result.categoryScores.experience },
                      { label: 'Technical Skills', value: result.categoryScores.skills },
                      { label: 'Education Standards', value: result.categoryScores.education },
                      { label: 'Grammar & Clarity', value: result.categoryScores.grammar },
                      { label: 'Achievements Impact', value: result.categoryScores.achievements },
                      { label: 'Project Depth', value: result.categoryScores.projects }
                    ].map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between font-medium text-slate-300">
                          <span>{cat.label}</span>
                          <span className="font-mono text-cyan-400 font-semibold">{cat.value}%</span>
                        </div>
                        <div className="h-1.5 bg-white/2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-1000"
                            style={{ width: `${cat.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Missing keywords & Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Missing keywords */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-white">
                    <Bookmark className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-semibold tracking-tight">Missing Target Keywords</h4>
                  </div>
                  {result.missingKeywords.length === 0 ? (
                    <p className="text-xs text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Perfect matching! No missing keywords identified.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map((word, i) => (
                        <span key={i} className="px-2.5 py-1 bg-red-500/5 text-red-400 border border-red-500/10 rounded-lg text-[10px] font-semibold tracking-tight">
                          + {word}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <h4 className="text-sm font-semibold tracking-tight">ATS Audit Details</h4>
                  </div>
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 font-mono uppercase block mb-1">Key Strengths</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        {result.strengths.slice(0, 3).map((st, i) => <li key={i}>{st}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 font-mono uppercase block mb-1">Identified Gaps</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        {result.weaknesses.slice(0, 3).map((wk, i) => <li key={i}>{wk}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestions bullet lists */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                <h4 className="text-sm font-semibold text-white tracking-tight">Actionable Optimization Suggestions</h4>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {result.suggestions.map((sug, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                      <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button
                    onClick={() => onNavigate('refactor')}
                    className="px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    Rewrite and Refactor with AI <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  </button>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
};
