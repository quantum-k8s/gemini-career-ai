import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { AtsAnalysis } from '../../types';
import { TrendingUp, BarChart3, PieChart, ShieldAlert, Award, AlertCircle, FileText, Calendar } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const [analyses, setAnalyses] = useState<AtsAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyses();
  }, []);

  async function loadAnalyses() {
    try {
      const data = await api.get<AtsAnalysis[]>('/ai/analyses');
      // Sort analyses chronologically for the trend chart
      const sorted = [...data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setAnalyses(sorted);
    } catch (err) {
      console.error('Failed to retrieve analytics data', err);
    } finally {
      setLoading(false);
    }
  }

  // Pre-calculate aggregate data
  const hasData = analyses.length > 0;
  
  const averageScore = hasData
    ? Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length)
    : 0;

  // Radar chart data for averages across dimensions
  const radarData = [
    { subject: 'Keywords', value: 0 },
    { subject: 'Formatting', value: 0 },
    { subject: 'Experience', value: 0 },
    { subject: 'Skills', value: 0 },
    { subject: 'Education', value: 0 },
    { subject: 'Grammar', value: 0 },
    { subject: 'Achievements', value: 0 },
    { subject: 'Projects', value: 0 }
  ];

  if (hasData) {
    analyses.forEach(a => {
      radarData[0].value += a.categoryScores?.keywords ?? 70;
      radarData[1].value += a.categoryScores?.formatting ?? 70;
      radarData[2].value += a.categoryScores?.experience ?? 70;
      radarData[3].value += a.categoryScores?.skills ?? 70;
      radarData[4].value += a.categoryScores?.education ?? 70;
      radarData[5].value += a.categoryScores?.grammar ?? 70;
      radarData[6].value += a.categoryScores?.achievements ?? 70;
      radarData[7].value += a.categoryScores?.projects ?? 70;
    });
    // Average each subject
    radarData.forEach(item => {
      item.value = Math.round(item.value / analyses.length);
    });
  }

  // Count keyword gap occurrences
  const keywordCounts: { [key: string]: number } = {};
  analyses.forEach(a => {
    if (a.missingKeywords) {
      a.missingKeywords.forEach(kw => {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      });
    }
  });

  const barData = Object.entries(keywordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const scoreTrendData = analyses.map((a, i) => ({
    name: `Scan ${i + 1}`,
    score: a.overallScore,
    date: new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    filename: a.resumeFilename
  }));

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Performance Analytics Portal</h2>
        <p className="text-xs text-slate-400 mt-1">Deep-dive into historic ATS score progression, structural category ratings, and recurrent skills gaps.</p>
      </div>

      {!hasData ? (
        <div className="glass-card p-16 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-bold text-slate-200">No Analytics Available Yet</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Once you upload and run matching audits on multiple resumes, this analytics board will populate charts visualizing your professional score trends.
            </p>
          </div>
        </div>
      ) : (
        <FadeIn className="space-y-8">
          {/* Top Level Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/15 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Average ATS Score</p>
                <p className="text-2xl font-display font-black text-white mt-1">{averageScore}%</p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Total Scans Run</p>
                <p className="text-2xl font-display font-black text-white mt-1">{analyses.length}</p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/15 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Unique Skills Flagged</p>
                <p className="text-2xl font-display font-black text-white mt-1">
                  {Object.keys(keywordCounts).length}
                </p>
              </div>
            </div>
          </div>

          {/* Core Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ATS Compatibility Area Trend */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" /> ATS compatibility Trend
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Chronological score progression across your uploaded iterations</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrendData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#cbd5e1'
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar average categories */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-violet-400" /> Average Dimensional Scores
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Aggregate scores across primary career/resume factors</p>
              </div>
              <div className="h-64 flex items-center justify-center">
                {radarData.every(r => r.value === 0) ? (
                  <p className="text-slate-500 font-mono text-xs">Awaiting data...</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.05)" />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                      <Radar name="Averages" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          fontSize: '11px'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recurrent gaps bar chart */}
            {barData.length > 0 && (
              <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 lg:col-span-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" /> Recurrent Missing Skills & Keywords
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Top skills flagged as missing in JD scans (frequency count)</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis dataKey="keyword" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={120} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          fontSize: '11px'
                        }}
                      />
                      <Bar dataKey="count" fill="rgba(239, 68, 68, 0.7)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      )}
    </div>
  );
};
