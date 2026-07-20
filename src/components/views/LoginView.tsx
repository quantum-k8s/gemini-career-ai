import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight, AlertTriangle, ArrowLeft } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';

interface LoginViewProps {
  onNavigate: (page: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email || !password) {
      setErr('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      onNavigate('dashboard');
    } catch (e: any) {
      setErr(e.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 relative">
      {/* Background Orbs */}
      <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[30%] w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none"></div>

      {/* Back Button */}
      <button
        onClick={() => onNavigate('landing')}
        className="absolute top-8 left-8 flex items-center gap-2 text-xs text-slate-400 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      <FadeIn duration={0.4}>
        <div className="w-full max-w-md">
          {/* Logo Heading */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg mb-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1">Access your ATS scorer and optimizer workspace</p>
          </div>

          {/* Login Card */}
          <div className="glass-card p-8 rounded-2xl border border-white/5 shadow-2xl relative">
            <form onSubmit={handleSubmit} className="space-y-5">
              {err && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{err}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-slate-900/40 hover:bg-slate-900/60 focus:bg-slate-900 text-sm rounded-xl pl-10 pr-4 py-3 text-slate-200 border border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-900/40 hover:bg-slate-900/60 focus:bg-slate-900 text-sm rounded-xl pl-10 pr-4 py-3 text-slate-200 border border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Quick tip demo credentials */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-slate-400 leading-relaxed font-mono">
                💡 Admin demo login: <strong className="text-cyan-400">admin@example.com</strong> / password <strong className="text-cyan-400">adminpassword</strong>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Link to Register */}
            <div className="mt-6 text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-cyan-400 font-semibold hover:underline bg-transparent border-none cursor-pointer"
              >
                Register Here
              </button>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};
