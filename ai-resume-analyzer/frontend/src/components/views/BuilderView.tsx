import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { UserProfile, ProfileExperience, ProfileEducation, ProfileProject, ProfileSkill, ProfileCertification } from '../../types';
import { User, Briefcase, GraduationCap, Code, FolderGit, Award, Plus, Trash2, Save, Sparkles, Layout, Mail, Phone, Globe, Linkedin, Github } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';

export const BuilderView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    headline: '',
    summary: '',
    experiences: [],
    educations: [],
    projects: [],
    skills: [],
    certifications: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications'>('info');

  // Form states
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');

  // Experience state
  const [expCompany, setExpCompany] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expStart, setExpStart] = useState('');
  const [expEnd, setExpEnd] = useState('');
  const [expCurrent, setExpCurrent] = useState(false);
  const [expDesc, setExpDesc] = useState('');

  // Education state
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduField, setEduField] = useState('');
  const [eduStart, setEduStart] = useState('');
  const [eduEnd, setEduEnd] = useState('');
  const [eduDesc, setEduDesc] = useState('');

  // Project state
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projUrl, setProjUrl] = useState('');
  const [projTech, setProjTech] = useState('');

  // Skill state
  const [skillName, setSkillName] = useState('');
  const [skillProf, setSkillProf] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');

  // Certification state
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await api.get<UserProfile>('/user/profile');
      setProfile(data);
      setHeadline(data.headline || '');
      setSummary(data.summary || '');
    } catch (err) {
      console.error('Failed to load user profile credentials', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/user/profile', { headline, summary });
      setProfile(prev => ({ ...prev, headline, summary }));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCompany || !expTitle) return;
    try {
      const res = await api.post<ProfileExperience>('/user/profile/experiences', {
        company: expCompany,
        title: expTitle,
        location: expLocation,
        startDate: expStart,
        endDate: expEnd,
        isCurrent: expCurrent,
        description: expDesc
      });
      setProfile(prev => ({ ...prev, experiences: [...prev.experiences, res] }));
      setExpCompany('');
      setExpTitle('');
      setExpLocation('');
      setExpStart('');
      setExpEnd('');
      setExpCurrent(false);
      setExpDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduInstitution) return;
    try {
      const res = await api.post<ProfileEducation>('/user/profile/educations', {
        institution: eduInstitution,
        degree: eduDegree,
        fieldOfStudy: eduField,
        startDate: eduStart,
        endDate: eduEnd,
        description: eduDesc
      });
      setProfile(prev => ({ ...prev, educations: [...prev.educations, res] }));
      setEduInstitution('');
      setEduDegree('');
      setEduField('');
      setEduStart('');
      setEduEnd('');
      setEduDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName) return;
    try {
      const res = await api.post<ProfileProject>('/user/profile/projects', {
        name: projName,
        description: projDesc,
        url: projUrl,
        technologies: projTech.split(',').map(s => s.trim()).filter(Boolean)
      });
      setProfile(prev => ({ ...prev, projects: [...prev.projects, res] }));
      setProjName('');
      setProjDesc('');
      setProjUrl('');
      setProjTech('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName) return;
    try {
      const res = await api.post<ProfileSkill>('/user/profile/skills', {
        name: skillName,
        proficiency: skillProf
      });
      setProfile(prev => ({ ...prev, skills: [...prev.skills, res] }));
      setSkillName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName) return;
    try {
      const res = await api.post<ProfileCertification>('/user/profile/certifications', {
        name: certName,
        issuer: certIssuer,
        issueDate: certDate
      });
      setProfile(prev => ({ ...prev, certifications: [...prev.certifications, res] }));
      setCertName('');
      setCertIssuer('');
      setCertDate('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (type: 'experiences' | 'educations' | 'projects' | 'skills' | 'certifications', id: number) => {
    try {
      await api.delete(`/user/profile/${type}/${id}`);
      setProfile(prev => ({
        ...prev,
        [type]: (prev[type] as any[]).filter((item: any) => item.id !== id)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Interactive Resume Section Builder</h2>
        <p className="text-xs text-slate-400 mt-1">Structure your core experience, education, skills, and projects, with instant live resume document rendering.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Side: Form Section Editor */}
        <div className="xl:col-span-5 space-y-6">
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-5">
            {/* Tabs Row */}
            <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-3">
              {[
                { id: 'info', icon: User, label: 'Profile' },
                { id: 'experience', icon: Briefcase, label: 'Experience' },
                { id: 'education', icon: GraduationCap, label: 'Education' },
                { id: 'skills', icon: Code, label: 'Skills' },
                { id: 'projects', icon: FolderGit, label: 'Projects' },
                { id: 'certifications', icon: Award, label: 'Certifications' }
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono transition cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 bg-white/2 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="text-xs">
              {activeTab === 'info' && (
                <form onSubmit={handleSaveInfo} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Professional Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={e => setHeadline(e.target.value)}
                      placeholder="e.g. Senior Full-Stack Cloud Engineer"
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Summary Biography</label>
                    <textarea
                      value={summary}
                      onChange={e => setSummary(e.target.value)}
                      placeholder="Brief overview detailing your technical highlights, leadership metrics, and career focus..."
                      rows={4}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/10"
                  >
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Persisting...' : 'Save Profile Meta'}
                  </button>
                </form>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddExperience} className="space-y-4 bg-white/2 border border-white/5 p-4 rounded-xl">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Employer / Company</label>
                        <input
                          type="text"
                          value={expCompany}
                          onChange={e => setExpCompany(e.target.value)}
                          placeholder="e.g. Google"
                          required
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Job Title</label>
                        <input
                          type="text"
                          value={expTitle}
                          onChange={e => setExpTitle(e.target.value)}
                          placeholder="e.g. Senior Developer"
                          required
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Start Date</label>
                        <input
                          type="text"
                          value={expStart}
                          onChange={e => setExpStart(e.target.value)}
                          placeholder="e.g. Jan 2021"
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">End Date</label>
                        <input
                          type="text"
                          value={expEnd}
                          onChange={e => setExpEnd(e.target.value)}
                          placeholder="e.g. Present"
                          disabled={expCurrent}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Location</label>
                      <input
                        type="text"
                        value={expLocation}
                        onChange={e => setExpLocation(e.target.value)}
                        placeholder="e.g. Mountain View, CA"
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Description / Achievements</label>
                      <textarea
                        value={expDesc}
                        onChange={e => setExpDesc(e.target.value)}
                        placeholder="Detail high-impact accomplishments, using metrics (e.g., Improved rendering throughput by 32%...)"
                        rows={3}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-cyan-400 font-semibold rounded-xl border border-white/5 hover:border-cyan-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Experience Block
                    </button>
                  </form>

                  {/* List of current experiences */}
                  <div className="space-y-2">
                    <span className="text-slate-500 font-semibold font-mono text-[10px] uppercase block">Saved Work Blocks</span>
                    {profile.experiences.length === 0 ? (
                      <p className="text-slate-600 font-mono text-[10px]">No experiences added yet.</p>
                    ) : (
                      profile.experiences.map(exp => (
                        <div key={exp.id} className="flex items-center justify-between p-3 bg-white/2 rounded-xl border border-white/5 hover:border-white/10 transition">
                          <div>
                            <p className="font-bold text-slate-200">{exp.title}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">{exp.company} • {exp.startDate} - {exp.endDate || 'Present'}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteItem('experiences', exp.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 bg-white/2 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddEducation} className="space-y-4 bg-white/2 border border-white/5 p-4 rounded-xl">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Institution / University</label>
                      <input
                        type="text"
                        value={eduInstitution}
                        onChange={e => setEduInstitution(e.target.value)}
                        placeholder="e.g. Stanford University"
                        required
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Degree</label>
                        <input
                          type="text"
                          value={eduDegree}
                          onChange={e => setEduDegree(e.target.value)}
                          placeholder="e.g. B.S. or M.S."
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Field of Study</label>
                        <input
                          type="text"
                          value={eduField}
                          onChange={e => setEduField(e.target.value)}
                          placeholder="e.g. Computer Science"
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Start Date</label>
                        <input
                          type="text"
                          value={eduStart}
                          onChange={e => setEduStart(e.target.value)}
                          placeholder="e.g. 2017"
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">End Date (or Expected)</label>
                        <input
                          type="text"
                          value={eduEnd}
                          onChange={e => setEduEnd(e.target.value)}
                          placeholder="e.g. 2021"
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-cyan-400 font-semibold rounded-xl border border-white/5 hover:border-cyan-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Education Block
                    </button>
                  </form>

                  <div className="space-y-2">
                    <span className="text-slate-500 font-semibold font-mono text-[10px] uppercase block">Saved Education Blocks</span>
                    {profile.educations.length === 0 ? (
                      <p className="text-slate-600 font-mono text-[10px]">No education blocks added yet.</p>
                    ) : (
                      profile.educations.map(edu => (
                        <div key={edu.id} className="flex items-center justify-between p-3 bg-white/2 rounded-xl border border-white/5 hover:border-white/10 transition">
                          <div>
                            <p className="font-bold text-slate-200">{edu.institution}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">{edu.degree} in {edu.fieldOfStudy} • {edu.startDate} - {edu.endDate}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteItem('educations', edu.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 bg-white/2 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddSkill} className="space-y-4 bg-white/2 border border-white/5 p-4 rounded-xl">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Skill Name</label>
                        <input
                          type="text"
                          value={skillName}
                          onChange={e => setSkillName(e.target.value)}
                          placeholder="e.g. React"
                          required
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Proficiency</label>
                        <select
                          value={skillProf}
                          onChange={e => setSkillProf(e.target.value as any)}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/40"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-cyan-400 font-semibold rounded-xl border border-white/5 hover:border-cyan-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Skill
                    </button>
                  </form>

                  <div className="space-y-2">
                    <span className="text-slate-500 font-semibold font-mono text-[10px] uppercase block">Saved Skill Set</span>
                    {profile.skills.length === 0 ? (
                      <p className="text-slate-600 font-mono text-[10px]">No skills added yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map(skill => (
                          <span
                            key={skill.id}
                            className="inline-flex items-center gap-2 pl-3 pr-1 py-1 bg-white/2 border border-white/5 text-slate-300 rounded-full text-[10px] font-medium font-mono"
                          >
                            <span>{skill.name} • <span className="text-cyan-400 font-semibold">{skill.proficiency}</span></span>
                            <button
                              onClick={() => handleDeleteItem('skills', skill.id)}
                              className="p-1 hover:text-red-400 bg-white/3 rounded-full hover:bg-red-500/10 transition cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5 rotate-45" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddProject} className="space-y-4 bg-white/2 border border-white/5 p-4 rounded-xl">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Project Name</label>
                      <input
                        type="text"
                        value={projName}
                        onChange={e => setProjName(e.target.value)}
                        placeholder="e.g. AI Content Synthesizer"
                        required
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Description</label>
                      <input
                        type="text"
                        value={projDesc}
                        onChange={e => setProjDesc(e.target.value)}
                        placeholder="Brief overview of project features and scope..."
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Link URL</label>
                        <input
                          type="text"
                          value={projUrl}
                          onChange={e => setProjUrl(e.target.value)}
                          placeholder="e.g. github.com/username/project"
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Tech Stack (comma separated)</label>
                        <input
                          type="text"
                          value={projTech}
                          onChange={e => setProjTech(e.target.value)}
                          placeholder="e.g. React, Docker, Gemini"
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-cyan-400 font-semibold rounded-xl border border-white/5 hover:border-cyan-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Project
                    </button>
                  </form>

                  <div className="space-y-2">
                    <span className="text-slate-500 font-semibold font-mono text-[10px] uppercase block">Saved Projects</span>
                    {profile.projects.length === 0 ? (
                      <p className="text-slate-600 font-mono text-[10px]">No projects added yet.</p>
                    ) : (
                      profile.projects.map(proj => (
                        <div key={proj.id} className="flex items-center justify-between p-3 bg-white/2 rounded-xl border border-white/5 hover:border-white/10 transition">
                          <div>
                            <p className="font-bold text-slate-200">{proj.name}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5 line-clamp-1">{proj.description}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteItem('projects', proj.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 bg-white/2 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'certifications' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddCert} className="space-y-4 bg-white/2 border border-white/5 p-4 rounded-xl">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Certification Name</label>
                      <input
                        type="text"
                        value={certName}
                        onChange={e => setCertName(e.target.value)}
                        placeholder="e.g. AWS Solutions Architect"
                        required
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Issuing Organization</label>
                        <input
                          type="text"
                          value={certIssuer}
                          onChange={e => setCertIssuer(e.target.value)}
                          placeholder="e.g. Amazon Web Services"
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold font-mono text-[10px] uppercase">Date Issued</label>
                        <input
                          type="text"
                          value={certDate}
                          onChange={e => setCertDate(e.target.value)}
                          placeholder="e.g. June 2023"
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-cyan-400 font-semibold rounded-xl border border-white/5 hover:border-cyan-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Certification
                    </button>
                  </form>

                  <div className="space-y-2">
                    <span className="text-slate-500 font-semibold font-mono text-[10px] uppercase block">Saved Certifications</span>
                    {profile.certifications.length === 0 ? (
                      <p className="text-slate-600 font-mono text-[10px]">No certifications added yet.</p>
                    ) : (
                      profile.certifications.map(cert => (
                        <div key={cert.id} className="flex items-center justify-between p-3 bg-white/2 rounded-xl border border-white/5 hover:border-white/10 transition">
                          <div>
                            <p className="font-bold text-slate-200">{cert.name}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">{cert.issuer} • {cert.issueDate}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteItem('certifications', cert.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 bg-white/2 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Live Styled Resume Preview */}
        <div className="xl:col-span-7">
          <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Real-Time Resume Document Preview</h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono px-2 py-0.5 border border-cyan-500/20 rounded bg-cyan-500/5 animate-pulse">
                Dynamic Mode
              </span>
            </div>

            {/* Resume Canvas (White/Black high contrast style sheet style) */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-8 shadow-2xl min-h-[600px] text-slate-200 relative overflow-hidden font-sans">
              <div className="space-y-6">
                
                {/* Header info */}
                <div className="border-b border-white/10 pb-4 text-center space-y-2">
                  <h1 className="text-xl font-display font-black tracking-tight text-white uppercase">
                    USER PROFILE RESUME
                  </h1>
                  {profile.headline ? (
                    <p className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">{profile.headline}</p>
                  ) : (
                    <p className="text-xs font-mono text-slate-500 italic">[Enter headline on the left]</p>
                  )}
                  
                  {/* Contact icons placeholder row */}
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-cyan-500" /> info@example.com</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-cyan-500" /> +1 (555) 0199</span>
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-cyan-500" /> portfolio.dev</span>
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest border-b border-white/5 pb-1">Summary</h3>
                  {profile.summary ? (
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{profile.summary}</p>
                  ) : (
                    <p className="text-xs text-slate-600 italic">[Enter professional bio summary on the left]</p>
                  )}
                </div>

                {/* Experience Column */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest border-b border-white/5 pb-1">Work History</h3>
                  {profile.experiences.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">[Work experience details will populate here]</p>
                  ) : (
                    <div className="space-y-4">
                      {profile.experiences.map(exp => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-slate-100">{exp.title} <span className="text-cyan-400 font-mono">@ {exp.company}</span></h4>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">{exp.startDate} - {exp.endDate || 'Present'}</span>
                          </div>
                          {exp.location && <p className="text-[10px] text-slate-500 font-mono">{exp.location}</p>}
                          {exp.description && <p className="text-xs text-slate-400 leading-relaxed mt-1 font-sans">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest border-b border-white/5 pb-1">Education</h3>
                  {profile.educations.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">[Education details will populate here]</p>
                  ) : (
                    <div className="space-y-3">
                      {profile.educations.map(edu => (
                        <div key={edu.id} className="flex justify-between items-start text-xs">
                          <div>
                            <p className="font-bold text-slate-100">{edu.institution}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">{edu.startDate} - {edu.endDate}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projects Grid */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest border-b border-white/5 pb-1">Key Projects</h3>
                  {profile.projects.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">[Key tech project cards will populate here]</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.projects.map(proj => (
                        <div key={proj.id} className="p-2.5 bg-white/2 rounded-lg border border-white/5 space-y-1">
                          <p className="text-xs font-bold text-slate-200">{proj.name}</p>
                          {proj.description && <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{proj.description}</p>}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1.5">
                              {proj.technologies.map((tech, i) => (
                                <span key={i} className="px-1.5 py-0.2 bg-cyan-500/5 text-cyan-400 rounded text-[8px] font-mono">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skills set row */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest border-b border-white/5 pb-1">Primary Core Skills</h3>
                  {profile.skills.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">[Primary core skill tags will populate here]</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.map(skill => (
                        <span key={skill.id} className="px-2 py-0.5 bg-white/3 text-slate-300 border border-white/5 rounded text-[9px] font-semibold font-mono">
                          {skill.name} ({skill.proficiency})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
