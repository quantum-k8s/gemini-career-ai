import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';

interface NavbarProps {
  pageTitle: string;
  onChangePage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ pageTitle, onChangePage }) => {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-20 border-b border-white/10 bg-slate-950/50 backdrop-blur-md px-10 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-medium font-display tracking-tight text-white">{pageTitle}</h1>
        {user?.isAdmin && (
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">
            <Shield className="w-3 h-3" /> Admin
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <button
            onClick={() => onChangePage('profile')}
            className="flex items-center gap-3 text-left group cursor-pointer animate-fade-in"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center font-bold text-white text-xs shadow-md border border-white/15 group-hover:scale-105 transition duration-300">
              {getInitials(user.fullName)}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition line-clamp-1">
                {user.fullName}
              </p>
              <p className="text-[10px] text-slate-400 line-clamp-1 font-mono">{user.email}</p>
            </div>
          </button>
        )}

        <div className="w-[1px] h-8 bg-white/10"></div>

        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-400 bg-white/10 hover:bg-red-500/10 rounded-xl border border-white/10 hover:border-red-500/20 transition cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
