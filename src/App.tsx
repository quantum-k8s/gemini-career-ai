import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { LandingView } from './components/views/LandingView';
import { LoginView } from './components/views/LoginView';
import { RegisterView } from './components/views/RegisterView';
import { DashboardHomeView } from './components/views/DashboardHomeView';
import { UploadView } from './components/views/UploadView';
import { AnalyzeView } from './components/views/AnalyzeView';
import { RefactorView } from './components/views/RefactorView';
import { HistoryView } from './components/views/HistoryView';
import { ProfileView } from './components/views/ProfileView';
import { AdminView } from './components/views/AdminView';
import { BuilderView } from './components/views/BuilderView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { JobsView } from './components/views/JobsView';
import { SavedJobsView } from './components/views/SavedJobsView';
import { AppliedJobsView } from './components/views/AppliedJobsView';
import { SettingsView } from './components/views/SettingsView';


// Inner app routing and state switcher
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');

  // Handle loading state gracefully
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <span className="w-10 h-10 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin z-10"></span>
        <p className="text-xs font-mono text-slate-400 mt-4 tracking-widest uppercase z-10">Initializing Application Suite...</p>
      </div>
    );
  }

  // Enforce auth states
  if (!user) {
    if (currentPage === 'login') {
      return <LoginView onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'register') {
      return <RegisterView onNavigate={setCurrentPage} />;
    }
    return <LandingView onNavigate={setCurrentPage} />;
  }

  // If logged in, standard Dashboard layout wrapping
  // Automatically redirect from landing/auth pages to dashboard if user has session
  const activePage = ['landing', 'login', 'register'].includes(currentPage) ? 'dashboard' : currentPage;

  const renderActiveView = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardHomeView onNavigate={setCurrentPage} />;
      case 'upload':
        return <UploadView onNavigate={setCurrentPage} />;
      case 'analyze':
        return <AnalyzeView onNavigate={setCurrentPage} />;
      case 'refactor':
        return <RefactorView onNavigate={setCurrentPage} />;
      case 'history':
        return <HistoryView />;
      case 'builder':
        return <BuilderView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'jobs':
        return <JobsView />;
      case 'saved-jobs':
        return <SavedJobsView onNavigate={setCurrentPage} />;
      case 'applied-jobs':
        return <AppliedJobsView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      case 'admin':
        return <AdminView />;
      default:
        return <DashboardHomeView onNavigate={setCurrentPage} />;
    }
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'System Overview';
      case 'upload':
        return 'Upload Resume File';
      case 'analyze':
        return 'ATS Scoring Audit';
      case 'refactor':
        return 'AI Copywriting Refactor';
      case 'history':
        return 'Historic Trends & Reports';
      case 'builder':
        return 'Interactive Resume Section Builder';
      case 'analytics':
        return 'Performance Analytics Portal';
      case 'jobs':
        return 'Active Career Opportunities';
      case 'saved-jobs':
        return 'Saved & Bookmarked Roles';
      case 'applied-jobs':
        return 'Application Dispatch Logs';
      case 'profile':
        return 'Profile Configurations';
      case 'settings':
        return 'System & Account Settings';
      case 'admin':
        return 'User Suite Management';
      default:
        return 'Workspace';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans relative">
      {/* Aurora Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Collapsible glassmorphic sidebar */}
      <Sidebar currentPage={activePage} onChangePage={setCurrentPage} />

      {/* Main panel */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 bg-slate-950/40 backdrop-blur-md">
        <Navbar pageTitle={getPageTitle()} onChangePage={setCurrentPage} />

        {/* Dynamic content scroll area */}
        <main className="flex-1 overflow-y-auto px-10 py-10 relative">
          <div className="max-w-7xl mx-auto w-full">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
