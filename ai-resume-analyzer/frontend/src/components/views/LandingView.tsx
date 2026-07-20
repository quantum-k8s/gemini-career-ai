import React from 'react';
import { Sparkles, FileUp, ScanLine, Wand2, BarChart3, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FadeIn } from '../animations/FadeIn';

interface LandingViewProps {
  onNavigate: (page: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between overflow-x-hidden relative">
      {/* Aurora Radial Glow Accents */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[300px] right-[-200px] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none"></div>

      {/* Landing Header */}
      <header className="max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">AI Resume ATS Analyzer</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition cursor-pointer"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl shadow-lg transition cursor-pointer"
              >
                Register Free
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-16 flex-1 flex flex-col justify-center relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <FadeIn delay={0.05} y={20}>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium font-mono tracking-wider bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen Resume Parser & Optimizer
            </span>
          </FadeIn>

          <FadeIn delay={0.15} y={20}>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
              Optimize Your Resume for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400">
                ATS Algorithms
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.25} y={20}>
            <p className="mt-6 text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Scan your professional resume against targeted job descriptions. Unearth missing keywords, generate detailed
              ATS score breakdowns, and refactor formatting and summaries with state-of-the-art Google Gemini AI.
            </p>
          </FadeIn>

          <FadeIn delay={0.35} y={20} className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate(user ? 'dashboard' : 'register')}
              className="px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl shadow-xl shadow-violet-500/10 hover:shadow-cyan-500/10 flex items-center gap-2 transition duration-300 cursor-pointer"
            >
              Start Free Scan <ArrowRight className="w-4 h-4" />
            </button>
          </FadeIn>
        </div>

        {/* Floating Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">
          {[
            {
              icon: FileUp,
              title: 'Dynamic Uploads',
              desc: 'Drag and drop PDF, Word, or plain text resumes. Automatically extracts metadata and structured text.'
            },
            {
              icon: ScanLine,
              title: 'Detailed ATS Score',
              desc: 'Get granular metrics for Keywords, Experience, formatting, Skills, Grammar, and Achievements.'
            },
            {
              icon: Wand2,
              title: 'AI Resume Refactoring',
              desc: 'Rewrite and optimize bullet points with active verbs and impact-oriented statistics aligned to the job description.'
            },
            {
              icon: BarChart3,
              title: 'History & Trends',
              desc: 'Track and visualize your scores over time to see formatting improvements and keywords matching accuracy.'
            }
          ].map((feat, index) => {
            const Icon = feat.icon;
            return (
              <FadeIn key={index} delay={0.45 + index * 0.08} y={15} className="flex">
                <div className="glass-card glow-hover p-6 rounded-2xl flex flex-col justify-between transition duration-300 w-full">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 relative z-10">
        <p>© 2026 AI Resume ATS Analyzer. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-cyan-500" /> SECURE AUTH</span>
          <span className="flex items-center gap-1"><Cpu className="w-4 h-4 text-violet-500" /> GEMINI POWERED</span>
        </div>
      </footer>
    </div>
  );
};
