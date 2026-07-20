import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Resume, JobDescription, Refactor } from '../../types';
import { Wand2, Sparkles, Clipboard, Check, Download, AlertCircle, FileText, ChevronRight, RefreshCw } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';

interface RefactorViewProps {
  onNavigate: (page: string) => void;
}

export const RefactorView: React.FC<RefactorViewProps> = ({ onNavigate }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jds, setJds] = useState<JobDescription[]>([]);
  
  const [resumeId, setResumeId] = useState<string>('');
  const [jdId, setJdId] = useState<string>('');
  const [jdText, setJdText] = useState<string>('');
  const [jdTitle, setJdTitle] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Refactor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [resList, jdList] = await Promise.all([
          api.get<Resume[]>('/resumes'),
          api.get<JobDescription[]>('/job-descriptions')
        ]);
        setResumes(resList);
        setJds(jdList);

        if (resList.length > 0) {
          setResumeId(resList[0].id.toString());
        }
        if (jdList.length > 0) {
          setJdId(jdList[0].id.toString());
          setJdText(jdList[0].content);
        } else {
          setJdId('custom');
        }
      } catch (err) {
        console.error('Failed to load refactor options', err);
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

  const handleRefactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId) {
      setError('Please select or upload a resume first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let finalJdId: number | undefined;

      if (jdId === 'custom' && jdText.trim().length > 0) {
        const savedJd = await api.post<JobDescription>('/job-descriptions', {
          title: jdTitle.trim() || 'Custom Job Description',
          content: jdText.trim()
        });
        finalJdId = savedJd.id;
        const updatedJds = await api.get<JobDescription[]>('/job-descriptions');
        setJds(updatedJds);
        setJdId(savedJd.id.toString());
      } else if (jdId !== 'custom') {
        finalJdId = parseInt(jdId);
      }

      const refactorResult = await api.post<Refactor>('/ai/refactor', {
        resumeId: parseInt(resumeId),
        jobDescriptionId: finalJdId,
        jobDescriptionText: jdId === 'custom' ? jdText : undefined
      });

      setResult(refactorResult);
    } catch (err: any) {
      setError(err.message || 'AI refactoring process failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.refactoredContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!result) return;
    const element = document.createElement('a');
    const file = new Blob([result.refactoredContent], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `refactored_resume_${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">AI Resume Refactorer</h2>
        <p className="text-xs text-slate-400 mt-1">Rewrite your summaries, bullet points, and experience structure utilizing action verbs and key metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono text-slate-400">Refactoring Scope</h3>

            {resumes.length === 0 ? (
              <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15 text-xs text-yellow-400">
                Please upload a resume in the Upload section before starting a refactoring audit.
              </div>
            ) : (
              <form onSubmit={handleRefactor} className="space-y-5">
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
                      <option key={r.id} value={r.id}>{r.filename}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Target Job Description
                  </label>
                  <select
                    value={jdId}
                    onChange={(e) => handleJdSelect(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="custom">✍️ Paste Custom JD Text</option>
                    {jds.map(j => (
                      <option key={j.id} value={j.id}>📁 {j.title}</option>
                    ))}
                  </select>
                </div>

                {jdId === 'custom' && (
                  <div className="space-y-3 pt-1 border-t border-white/5">
                    <input
                      type="text"
                      placeholder="Target Role Title"
                      value={jdTitle}
                      onChange={(e) => setJdTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                    />
                    <textarea
                      rows={6}
                      placeholder="Paste targeted job responsibilities & keywords..."
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-600 font-mono"
                    ></textarea>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl font-semibold text-xs text-white shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Refactoring Bullets...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" /> Optimize and Refactor Resume
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Output Panel / Side-by-Side View */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-start gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">AI Refactor Process Failed</p>
                <p className="text-xs text-slate-400 mt-1">{error}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="glass-card p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-cyan-400 animate-pulse">
                <Wand2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white tracking-tight animate-pulse">Rewriting & Formatting...</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1.5">
                  AI is aligning summaries, bullet phrases, and technologies into industry-standard, high-impact action templates.
                </p>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="glass-card p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
                <Wand2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-300">Awaiting Scope Execution</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                  Start the optimization process on the left panel. The AI will output side-by-side structures with markdown downloads.
                </p>
              </div>
            </div>
          )}

          {result && !loading && (
            <FadeIn duration={0.4} className="space-y-6">
              {/* Refactoring stats banner */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <h4 className="text-sm font-semibold text-white">AI Rewriting Actions Completed</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 font-mono uppercase block mb-1">Keywords Embedded</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {result.missingKeywords.map((word, i) => (
                        <span key={i} className="px-2 py-0.5 bg-cyan-500/5 text-cyan-400 border border-cyan-500/10 rounded text-[9px] font-semibold font-mono">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 font-mono uppercase block mb-1">Impact Highlights</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      {result.changesSummary.map((ch, i) => <li key={i}>{ch}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Text comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original extracted text */}
                <div className="glass-card rounded-2xl border border-white/5 flex flex-col h-[400px]">
                  <div className="px-4 py-3 border-b border-white/5 bg-white/2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Original Extract</span>
                    <span className="text-[10px] font-mono text-slate-600">READ-ONLY</span>
                  </div>
                  <div className="p-4 overflow-y-auto text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed select-all">
                    {result.originalContent || 'No original text available.'}
                  </div>
                </div>

                {/* Refactored Markdown text */}
                <div className="glass-card rounded-2xl border border-white/5 flex flex-col h-[400px] relative">
                  <div className="px-4 py-3 border-b border-white/5 bg-white/2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-400" /> AI Refactored (Markdown)
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded transition cursor-pointer"
                        title="Copy Markdown"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={downloadMarkdown}
                        className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded transition cursor-pointer"
                        title="Download Markdown file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 overflow-y-auto text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                    {result.refactoredContent}
                  </div>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
};
