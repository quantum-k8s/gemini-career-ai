import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileUp,
  ScanLine,
  Wand2,
  History,
  User,
  Users,
  Sparkles,
  ShieldAlert,
  FilePenLine,
  BarChart4,
  Search,
  Bookmark,
  Send,
  Settings
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onChangePage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onChangePage }) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Resume', icon: FileUp },
    { id: 'analyze', label: 'ATS Analysis', icon: ScanLine },
    { id: 'refactor', label: 'AI Refactor', icon: Wand2 },
    { id: 'history', label: 'History & Trends', icon: History },
    { id: 'builder', label: 'Resume Builder', icon: FilePenLine },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart4 },
    { id: 'jobs', label: 'Search Jobs', icon: Search },
    { id: 'saved-jobs', label: 'Saved Jobs', icon: Bookmark },
    { id: 'applied-jobs', label: 'Applied Jobs', icon: Send },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const adminItems = [
    { id: 'admin', label: 'User Management', icon: Users }
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-white/5 backdrop-blur-2xl flex flex-col h-screen overflow-y-auto z-10">
      {/* Brand Header */}
      <div className="h-20 px-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <span className="font-display font-bold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 block">ATS.AI</span>
          <span className="text-[9px] text-cyan-400 font-mono block tracking-wider uppercase">ATS Analyzer v1.0</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-4 py-6 space-y-8">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 block mb-3 font-mono">
            Navigation
          </span>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onChangePage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white/10 border border-white/10 text-cyan-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {user?.isAdmin && (
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 block mb-3 font-mono">
              Admin Suite
            </span>
            <div className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onChangePage(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-white/10 border border-white/10 text-cyan-400'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer Info & Active User Profile Block */}
      {user && (
        <div className="p-4 border-t border-white/10 flex items-center gap-3 bg-white/5 backdrop-blur-xl shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md">
            {user.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'US'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.fullName || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate font-mono">{user.email}</p>
          </div>
        </div>
      )}

      <div className="p-3 border-t border-white/10 text-[9px] text-slate-500 font-mono text-center bg-white/2">
        <span>Google AI Studio Build</span>
      </div>
    </aside>
  );
};
