export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Resume {
  id: number;
  filename: string;
  fileType: string;
  createdAt: string;
  extractedText?: string;
}

export interface JobDescription {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface CategoryScores {
  keywords: number;
  formatting: number;
  experience: number;
  skills: number;
  education: number;
  grammar: number;
  achievements: number;
  projects: number;
}

export interface AtsAnalysis {
  id: number;
  resumeId: number;
  resumeFilename: string;
  jobDescriptionId?: number;
  jobTitle?: string;
  overallScore: number;
  categoryScores: CategoryScores;
  missingKeywords: string[];
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  createdAt: string;
}

export interface Refactor {
  id: number;
  resumeId: number;
  jobDescriptionId?: number;
  originalContent: string;
  refactoredContent: string;
  changesSummary: string[];
  missingKeywords: string[];
  createdAt: string;
}

export interface InterviewQuestion {
  type: 'technical' | 'behavioral';
  question: string;
  topic: string;
}

// Job Type Definitions
export interface Job {
  id: number;
  title: string;
  company: string;
  location?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobType?: string;
  experienceLevel?: string;
  skillsRequired?: string[];
  isRemote?: boolean;
  postedAt: string;
}

export interface SavedJob {
  id: number;
  jobId: number;
  createdAt: string;
  job?: Job;
}

export interface AppliedJob {
  id: number;
  jobId: number;
  resumeId?: number;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  coverLetter?: string;
  appliedAt: string;
  job?: Job;
}

// Profile Section Types
export interface ProfileExperience {
  id: number;
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface ProfileEducation {
  id: number;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ProfileProject {
  id: number;
  name: string;
  description?: string;
  url?: string;
  technologies?: string[];
}

export interface ProfileSkill {
  id: number;
  name: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface ProfileCertification {
  id: number;
  name: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface UserProfile {
  headline?: string;
  summary?: string;
  experiences: ProfileExperience[];
  educations: ProfileEducation[];
  projects: ProfileProject[];
  skills: ProfileSkill[];
  certifications: ProfileCertification[];
}

// Notification Types
export interface Notification {
  id: number;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

