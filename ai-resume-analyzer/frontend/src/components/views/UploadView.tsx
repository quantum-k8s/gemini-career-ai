import React, { useState, useRef } from 'react';
import { api } from '../../lib/api';
import { FileUp, Sparkles, CheckCircle2, AlertCircle, FileText, Loader2, ArrowRight } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';

interface UploadViewProps {
  onNavigate: (page: string) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onNavigate }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx' && ext !== 'txt') {
      setError('Unsupported file format. Please upload a PDF, DOCX or TXT file.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const result = await api.post<any>('/resumes/upload', formData);
      setSuccess(result);
    } catch (err: any) {
      setError(err.message || 'Failed to parse and upload resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Upload Resume</h2>
        <p className="text-xs text-slate-400 mt-1">Upload files to parse and analyze your details using our secure microservice</p>
      </div>

      <FadeIn duration={0.3}>
        <div className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`h-72 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition relative group ${
              dragActive
                ? 'border-cyan-400 bg-cyan-500/5'
                : 'border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/3'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInput}
              className="hidden"
              accept=".pdf,.docx,.txt"
            />

            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-105 transition-transform duration-300">
              <FileUp className="w-8 h-8" />
            </div>

            <p className="text-sm font-semibold text-white">Drag and drop your resume file here</p>
            <p className="text-xs text-slate-400 mt-1.5">or click to browse local files</p>
            <p className="text-[10px] text-slate-500 font-mono mt-6 uppercase tracking-wider">
              Supported Formats: PDF, DOCX, TXT (MAX 5MB)
            </p>
          </div>

          {/* Upload Progress / Loading */}
          {uploading && (
            <div className="p-6 rounded-2xl bg-white/3 border border-white/5 flex items-center gap-4">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-200">Parsing and extracting text...</p>
                <p className="text-xs text-slate-400 mt-1">Analyzing formatting structure and scanning document syntax</p>
              </div>
            </div>
          )}

          {/* Success Dialog */}
          {success && (
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 space-y-4">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-400">Resume Uploaded and Parsed!</p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Structured text model created successfully: <span className="text-slate-200 font-mono text-[11px]">{success.filename}</span>
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onNavigate('analyze')}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  Proceed to ATS Analysis <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Error Dialog */}
          {error && (
            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/25 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400">Failed to Parse File</p>
                <p className="text-xs text-slate-400 mt-1.5">{error}</p>
                <p className="text-xs text-slate-500 mt-3 font-mono">
                  💡 Tip: Ensure the file is not empty or corrupted and fits the .pdf, .docx, or .txt format.
                </p>
              </div>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
};
