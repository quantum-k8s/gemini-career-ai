import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Resume, AtsAnalysis } from '../../types';
import { FileUp, ScanLine, Wand2, History, ArrowRight, Award, ChevronRight, FileText } from 'lucide-react';
import { ATSScoreChart } from '../charts/ATSScoreChart';
import { FadeIn, StaggerContainer } from '../animations/FadeIn';

interface DashboardHomeViewProps {
  onNavigate: (page: string) => void;
}

export const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyses, setAnalyses] = useState<AtsAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resList, anaList] = await Promise.all([
          api.get<Resume[]>('/resumes'),
          api.get<AtsAnalysis[]>('/ai/analyses')
        ]);
        setResumes(resList);
        setAnalyses(anaList);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getAverageScore = () => {
    if (analyses.length === 0) return 0;
    const total = analyses.reduce((acc, a) => acc + a.overallScore, 0);
    return Math.round(total / analyses.length);
  };

  const getBestScore = () => {
    if (analyses.length === 0) return 0;
    return Math.max(...analyses.map(a => a.overallScore));
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <FadeIn delay={0.02}>
        <div className="p-8 rounded-2xl bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-cyan-500/10 border border-violet-500/10 relative overflow-hidden">
          <div className="absolute top-[-100px] right-[-100px] w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl"></div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            Hello, {user?.fullName || 'User'}!
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Analyze your formatting, track missing industry keywords, and rewrite bullet points to match automated scanning models.
          </p>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => onNavigate('upload')}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl transition duration-200 cursor-pointer flex items-center gap-1.5 shadow-md shadow-violet-500/10"
            >
              <FileUp className="w-3.5 h-3.5" /> Upload Resume
            </button>
            <button
              onClick={() => onNavigate('analyze')}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition cursor-pointer"
            >
              Start ATS Scan
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Stats row */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Uploaded Resumes', value: resumes.length, icon: FileText, color: 'text-violet-400' },
          { label: 'Total ATS Analyses', value: analyses.length, icon: ScanLine, color: 'text-cyan-400' },
          { label: 'Average Match Score', value: `${getAverageScore()}%`, icon: Award, color: 'text-emerald-400' },
          { label: 'Best Match Score', value: `${getBestScore()}%`, icon: Wand2, color: 'text-pink-400' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-display font-extrabold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </StaggerContainer>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">ATS Score Trends</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">Historical matching scores over consecutive resume parser runs</p>
          </div>
          <ATSScoreChart analyses={analyses} />
        </div>

        {/* Quick Recent items */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white tracking-tight">Recent Resumes</h3>
              <button
                onClick={() => onNavigate('upload')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {resumes.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs text-center border border-dashed border-white/10 rounded-xl">
                <p>No resumes uploaded yet.</p>
                <button
                  onClick={() => onNavigate('upload')}
                  className="text-cyan-400 underline mt-1.5 cursor-pointer bg-transparent"
                >
                  Upload your first resume
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 flex items-center justify-between text-xs transition group cursor-pointer"
                    onClick={() => onNavigate('analyze')}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-mono font-bold uppercase text-[10px]">
                        {r.fileType}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200 group-hover:text-white line-clamp-1">{r.filename}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <button
              onClick={() => onNavigate('analyze')}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              Analyze Resume Against Job Description <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
