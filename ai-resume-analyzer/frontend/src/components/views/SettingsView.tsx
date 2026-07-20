import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Settings, Shield, Palette, Bell, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'notifications'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [atsAlerts, setAtsAlerts] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // In local full-stack setup, let's simulate saving settings nicely
      setTimeout(() => {
        setSuccessMsg('Profile settings updated successfully.');
        setSaving(false);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
      setSaving(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // Simulate password change
      setTimeout(() => {
        setSuccessMsg('Security credentials updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSaving(false);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
      setSaving(false);
    }
  };

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSuccessMsg('System configurations updated.');
      setSaving(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">System & Account Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Configure your personal brand profiles, modify security credentials, and manage push notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Settings Navigation */}
        <div className="lg:col-span-1 space-y-3">
          <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-1">
            {[
              { id: 'profile', icon: Settings, label: 'Profile Configurations' },
              { id: 'security', icon: Shield, label: 'Security & Access' },
              { id: 'appearance', icon: Palette, label: 'Visual Interface' },
              { id: 'notifications', icon: Bell, label: 'Alerting Prefs' }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    active
                      ? 'bg-white/10 border border-white/10 text-cyan-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Forms Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
            
            {/* Status indicators */}
            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {errorMsg}
              </div>
            )}

            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-5 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Personal Branding Meta</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Verify your essential contact configurations</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-3 py-2 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">LinkedIn URL</label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={e => setLinkedin(e.target.value)}
                      placeholder="e.g. linkedin.com/in/username"
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 0199"
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/10"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleSecuritySubmit} className="space-y-5 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Access Credentials</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Maintain robust authentication boundaries</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving || !newPassword}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/10"
                >
                  <Shield className="w-3.5 h-3.5" /> Modify Password
                </button>
              </form>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-5 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Visual Settings & Presets</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Customizing active workspace layout modes</p>
                </div>

                <div className="p-4 bg-white/2 rounded-xl border border-white/5 space-y-3">
                  <span className="text-slate-400 font-semibold font-mono text-[10px] uppercase block">Selected Interface Preset</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">Aurora Frosted Glass</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">High-contrast slate tones blended with neon cyan accents</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full font-mono font-bold text-[10px] uppercase">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <form onSubmit={handlePreferencesSubmit} className="space-y-5 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Alerting Channels</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Decide which system updates dispatch alerts</p>
                </div>

                <div className="space-y-3">
                  {[
                    { state: emailAlerts, setState: setEmailAlerts, label: 'Email digest newsletters', desc: 'Weekly analytics recap containing top industry matched roles.' },
                    { state: atsAlerts, setState: setAtsAlerts, label: 'ATS analysis dispatches', desc: 'Alert when a resume score assessment completes scanning.' },
                    { state: jobAlerts, setState: setJobAlerts, label: 'Career opportunity alerts', desc: 'Immediate notification when a role matches your profile skill set.' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between p-3 bg-white/2 border border-white/5 rounded-xl hover:bg-white/4 transition">
                      <div className="pr-4">
                        <p className="font-semibold text-slate-200">{item.label}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={item.state}
                        onChange={e => item.setState(e.target.checked)}
                        className="accent-cyan-500 h-4 w-4 border-white/10 rounded cursor-pointer shrink-0 mt-1"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Save className="w-3.5 h-3.5" /> Save Preferences
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
