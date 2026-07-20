import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { AtsAnalysis } from '../../types';
import { History, Award, Calendar, FileText, Trash2, ArrowRight, CheckCircle2, AlertTriangle, Eye, X } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';

export const HistoryView: React.FC = () => {
  const [analyses, setAnalyses] = useState<AtsAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AtsAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const list = await api.get<AtsAnalysis[]>('/ai/analyses');
      setAnalyses(list);
    } catch (err) {
      console.error('Failed to load analysis history', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this analysis report?')) return;
    try {
      await api.delete(`/resumes/${id}`); // deletes matching resumes & analyses
      setAnalyses(prev => prev.filter(a => a.id !== id));
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null);
      }
      loadHistory();
    } catch (err: any) {
      setError(err.message || 'Failed to delete report.');
    }
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score >= 60) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Audit History & Reports</h2>
        <p className="text-xs text-slate-400 mt-1">Review historical matching scores, missing keyword assessments, and performance trends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left list table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    <th className="px-6 py-4">Report Info</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Overall Match</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {analyses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-mono">
                        No previous audit reports found. Go to "ATS Analysis" to run your first check!
                      </td>
                    </tr>
                  ) : (
                    analyses.map((report) => (
                      <tr
                        key={report.id}
                        onClick={() => setSelectedAnalysis(report)}
                        className={`hover:bg-white/2 transition cursor-pointer ${
                          selectedAnalysis?.id === report.id ? 'bg-gradient-to-r from-violet-500/5 to-cyan-500/5 border-l-2 border-cyan-500' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-200 line-clamp-1">{report.resumeFilename}</p>
                              <p className="text-[10px] text-slate-500 font-mono line-clamp-1 mt-0.5">{report.jobTitle || 'General Analysis'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 border rounded-full font-mono text-[10px] font-bold ${getScoreBgColor(report.overallScore)}`}>
                            {report.overallScore}% Match
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedAnalysis(report)}
                              className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(report.resumeId)}
                              className="p-1.5 text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg border border-white/5 hover:border-red-500/20 transition cursor-pointer"
                              title="Delete Report"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right details drawer / panel */}
        <div className="lg:col-span-1 space-y-6">
          {!selectedAnalysis ? (
            <div className="glass-card p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-300">Select a Report</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                  Click on any previous scan in the list to reveal full category ratings, missing keywords lists, and suggestions.
                </p>
              </div>
            </div>
          ) : (
            <FadeIn duration={0.3} className="glass-card p-6 rounded-2xl border border-white/5 space-y-5 relative">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{selectedAnalysis.resumeFilename}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedAnalysis.jobTitle || 'General Scan'}</p>
                </div>
                <button
                  onClick={() => setSelectedAnalysis(null)}
                  className="p-1 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Score rating circles */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/3 border border-white/5 flex flex-col items-center justify-center text-center shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">SCORE</span>
                  <span className="text-xl font-display font-black text-white">{selectedAnalysis.overallScore}%</span>
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">Compatibility: {selectedAnalysis.overallScore >= 80 ? 'Excellent' : selectedAnalysis.overallScore >= 60 ? 'Good Match' : 'Optimizable'}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Analyzed: {new Date(selectedAnalysis.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Categorized ratings list */}
              <div className="space-y-3 pt-3 border-t border-white/5 text-xs">
                <span className="text-[10px] font-bold text-slate-500 font-mono uppercase block mb-1">Detailed Ratings</span>
                {[
                  { name: 'Keywords', value: selectedAnalysis.categoryScores.keywords },
                  { name: 'Formatting', value: selectedAnalysis.categoryScores.formatting },
                  { name: 'Experience', value: selectedAnalysis.categoryScores.experience },
                  { name: 'Skills Match', value: selectedAnalysis.categoryScores.skills },
                  { name: 'Education', value: selectedAnalysis.categoryScores.education },
                  { name: 'Grammar', value: selectedAnalysis.categoryScores.grammar },
                  { name: 'Achievements', value: selectedAnalysis.categoryScores.achievements },
                  { name: 'Projects', value: selectedAnalysis.categoryScores.projects }
                ].map((sc, i) => (
                  <div key={i} className="flex justify-between text-slate-300">
                    <span>{sc.name}</span>
                    <span className="font-mono text-cyan-400 font-semibold">{sc.value}%</span>
                  </div>
                ))}
              </div>

              {/* Keywords chips preview */}
              <div className="space-y-2 pt-3 border-t border-white/5 text-xs">
                <span className="text-[10px] font-bold text-slate-500 font-mono uppercase block mb-1">Missing Keywords</span>
                {selectedAnalysis.missingKeywords.length === 0 ? (
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> High density match! No missing keys.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAnalysis.missingKeywords.slice(0, 8).map((word, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-500/5 text-red-400 border border-red-500/10 rounded text-[9px] font-semibold font-mono">
                        + {word}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
};
