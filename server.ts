import express from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import * as pdf from 'pdf-parse';
import AdmZip from 'adm-zip';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Ensure required folders exist
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'database.json');

// Interface declarations
interface User {
  id: number;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Resume {
  id: number;
  userId: number;
  filename: string;
  storedPath: string;
  fileType: string;
  extractedText: string;
  createdAt: string;
}

interface JobDescription {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
}

interface AtsAnalysis {
  id: number;
  resumeId: number;
  jobDescriptionId?: number;
  overallScore: number;
  categoryScores: {
    keywords: number;
    formatting: number;
    experience: number;
    skills: number;
    education: number;
    grammar: number;
    achievements: number;
    projects: number;
  };
  missingKeywords: string[];
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  createdAt: string;
}

interface Refactor {
  id: number;
  resumeId: number;
  jobDescriptionId?: number;
  originalContent: string;
  refactoredContent: string;
  changesSummary: string[];
  missingKeywords: string[];
  createdAt: string;
}

interface Job {
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

interface SavedJob {
  id: number;
  userId: number;
  jobId: number;
  createdAt: string;
}

interface AppliedJob {
  id: number;
  userId: number;
  jobId: number;
  resumeId?: number;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  coverLetter?: string;
  appliedAt: string;
}

interface ProfileExperience {
  id: number;
  userId: number;
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

interface ProfileEducation {
  id: number;
  userId: number;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface ProfileProject {
  id: number;
  userId: number;
  name: string;
  description?: string;
  url?: string;
  technologies?: string[];
}

interface ProfileSkill {
  id: number;
  userId: number;
  name: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Expert';
}

interface ProfileCertification {
  id: number;
  userId: number;
  name: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
}

interface Notification {
  id: number;
  userId: number;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

interface UserProfile {
  userId: number;
  headline?: string;
  summary?: string;
}

interface Database {
  users: User[];
  resumes: Resume[];
  jobDescriptions: JobDescription[];
  atsAnalyses: AtsAnalysis[];
  refactors: Refactor[];
  jobs: Job[];
  savedJobs: SavedJob[];
  appliedJobs: AppliedJob[];
  profileExperiences: ProfileExperience[];
  profileEducations: ProfileEducation[];
  profileProjects: ProfileProject[];
  profileSkills: ProfileSkill[];
  profileCertifications: ProfileCertification[];
  notifications: Notification[];
  userProfiles: UserProfile[];
}

// Database Helpers
function readDb(): Database {
  const getInitialDb = (): Database => {
    return {
      users: [],
      resumes: [],
      jobDescriptions: [],
      atsAnalyses: [],
      refactors: [],
      jobs: [],
      savedJobs: [],
      appliedJobs: [],
      profileExperiences: [],
      profileEducations: [],
      profileProjects: [],
      profileSkills: [],
      profileCertifications: [],
      notifications: [],
      userProfiles: []
    };
  };

  if (!fs.existsSync(DB_FILE)) {
    const initialDb = getInitialDb();
    // Seed default admin
    const adminPasswordHash = bcrypt.hashSync('adminpassword', 10);
    initialDb.users.push({
      id: 1,
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      fullName: 'System Administrator',
      isAdmin: true,
      createdAt: new Date().toISOString()
    });
    
    // Seed some initial job listings for a vibrant platform
    initialDb.jobs.push({
      id: 1,
      title: "Senior Full-Stack Engineer (React & Node)",
      company: "Google AI Solutions",
      location: "Mountain View, CA",
      description: "Join the core AI experiences group to craft next-generation web platforms powered by Gemini. We use TypeScript, Tailwind CSS, and bleeding-edge system designs.",
      requirements: ["5+ years experience with modern React", "Expert TypeScript and API development", "Prior exposure to Large Language Model design paradigms"],
      responsibilities: ["Lead engineering on consumer-facing web layers", "Orchestrate high-throughput Node.js microservices", "Refactor UI performance and latency bounds"],
      salaryMin: 145000,
      salaryMax: 195000,
      salaryCurrency: "USD",
      jobType: "Full-time",
      experienceLevel: "Senior",
      skillsRequired: ["React", "TypeScript", "Node.js", "Gemini API", "Tailwind CSS"],
      isRemote: true,
      postedAt: new Date().toISOString()
    }, {
      id: 2,
      title: "Frontend Developer (React / Tailwind)",
      company: "Stripe",
      location: "San Francisco, CA",
      description: "We are looking for a designer-developer hybrid who is passionate about pixel-perfect layouts, responsive interfaces, and clean, beautiful web components.",
      requirements: ["2+ years experience building polished UI apps", "Exceptional CSS/Tailwind skills", "Experience with motion or keyframe animations"],
      responsibilities: ["Develop and polish new onboarding flows", "Collaborate closely with visual brand designers", "Maintain the component toolkit library"],
      salaryMin: 110000,
      salaryMax: 150000,
      salaryCurrency: "USD",
      jobType: "Full-time",
      experienceLevel: "Mid-level",
      skillsRequired: ["React", "Tailwind CSS", "TypeScript", "Framer Motion"],
      isRemote: false,
      postedAt: new Date().toISOString()
    }, {
      id: 3,
      title: "Cloud Infrastructure Architect",
      company: "Netflix",
      location: "Los Gatos, CA",
      description: "Own the orchestration, telemetry, and reliability metrics of thousands of stateless streaming containers across AWS deployments.",
      requirements: ["AWS Certified Solutions Architect", "Strong experience with Docker and Kubernetes", "Expert knowledge of PostgreSQL query tuning"],
      responsibilities: ["Optimize service latency across edge gateways", "Execute automated scaling rules for peaks", "Harden database replication pipelines"],
      salaryMin: 180000,
      salaryMax: 240000,
      salaryCurrency: "USD",
      jobType: "Full-time",
      experienceLevel: "Lead",
      skillsRequired: ["Docker", "Kubernetes", "AWS", "PostgreSQL", "CI/CD"],
      isRemote: true,
      postedAt: new Date().toISOString()
    });

    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      users: parsed.users || [],
      resumes: parsed.resumes || [],
      jobDescriptions: parsed.jobDescriptions || [],
      atsAnalyses: parsed.atsAnalyses || [],
      refactors: parsed.refactors || [],
      jobs: parsed.jobs || [],
      savedJobs: parsed.savedJobs || [],
      appliedJobs: parsed.appliedJobs || [],
      profileExperiences: parsed.profileExperiences || [],
      profileEducations: parsed.profileEducations || [],
      profileProjects: parsed.profileProjects || [],
      profileSkills: parsed.profileSkills || [],
      profileCertifications: parsed.profileCertifications || [],
      notifications: parsed.notifications || [],
      userProfiles: parsed.userProfiles || []
    };
  } catch (e) {
    return getInitialDb();
  }
}


function writeDb(db: Database) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MOCK_KEY',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Setup JWT constants
const JWT_SECRET = process.env.JWT_SECRET || 'ai-resume-analyzer-secret-key-998877';

// Setup file upload handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.docx' || ext === '.txt') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX and TXT files are allowed.'));
    }
  }
});

function parseDocx(buffer: Buffer): string {
  try {
    const zip = new AdmZip(buffer);
    const xml = zip.readAsText('word/document.xml');
    const matches = xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (!matches) return '';
    return matches.map(val => val.replace(/<[^>]+>/g, '')).join(' ');
  } catch (e) {
    console.error('Error parsing DOCX file:', e);
    return '';
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middlewares
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      req.user = decoded;
      next();
    });
  };

  // API HEALTH CHECK
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'resume-analyzer-backend' });
  });

  // AUTH API
  app.post('/api/auth/register', (req, res) => {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = readDb();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser: User = {
      id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      isAdmin: db.users.length === 0, // First user is Admin
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);

    // Add initial welcome notifications
    db.notifications.push({
      id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
      userId: newUser.id,
      title: 'Welcome to ATS.AI Platform!',
      message: 'Upload your resume to perform your very first ATS score audit and optimize your professional credentials.',
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    writeDb(db);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, isAdmin: newUser.isAdmin }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        isAdmin: newUser.isAdmin
      }
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = readDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
        phone: user.phone,
        linkedin: user.linkedin,
        github: user.github,
        portfolio: user.portfolio
      }
    });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const db = readDb();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isAdmin: user.isAdmin,
      phone: user.phone,
      linkedin: user.linkedin,
      github: user.github,
      portfolio: user.portfolio,
      createdAt: user.createdAt
    });
  });

  app.put('/api/auth/profile', authenticateToken, (req: any, res) => {
    const { fullName, phone, linkedin, github, portfolio } = req.body;
    const db = readDb();
    const index = db.users.findIndex(u => u.id === req.user.id);
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.users[index] = {
      ...db.users[index],
      fullName: fullName || db.users[index].fullName,
      phone: phone !== undefined ? phone : db.users[index].phone,
      linkedin: linkedin !== undefined ? linkedin : db.users[index].linkedin,
      github: github !== undefined ? github : db.users[index].github,
      portfolio: portfolio !== undefined ? portfolio : db.users[index].portfolio,
    };

    writeDb(db);
    res.json(db.users[index]);
  });

  // ADMIN ENDPOINTS
  app.get('/api/admin/users', authenticateToken, (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const db = readDb();
    res.json(db.users.map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      linkedin: u.linkedin,
      github: u.github,
      portfolio: u.portfolio,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt
    })));
  });

  app.delete('/api/admin/users/:id', authenticateToken, (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const targetId = parseInt(req.params.id);
    if (targetId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    const db = readDb();
    const initialLength = db.users.length;
    db.users = db.users.filter(u => u.id !== targetId);

    if (db.users.length === initialLength) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cascade delete resumes
    db.resumes = db.resumes.filter(r => r.userId !== targetId);
    db.jobDescriptions = db.jobDescriptions.filter(j => j.userId !== targetId);

    writeDb(db);
    res.json({ message: 'User and associated data deleted successfully' });
  });

  // RESUME UPLOAD API
  app.post('/api/resumes/upload', authenticateToken, (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
      if (err) {
        console.error('Multer file upload error:', err);
        return res.status(400).json({ error: err.message || 'File upload failed.' });
      }
      next();
    });
  }, async (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const filePath = req.file.path;
      const originalName = req.file.originalname;
      const fileType = path.extname(originalName).toLowerCase().replace('.', '');
      let extractedText = '';

      if (fileType === 'txt') {
        extractedText = fs.readFileSync(filePath, 'utf8');
      } else if (fileType === 'pdf') {
        const fileBuffer = fs.readFileSync(filePath);
        
        // Robust PDF-parse resolving
        let parseFn: any = (pdf as any).default || pdf;
        if (typeof parseFn !== 'function') {
          if (parseFn && typeof parseFn.default === 'function') {
            parseFn = parseFn.default;
          }
        }
        
        if (typeof parseFn !== 'function') {
          console.warn('pdf-parse could not be resolved as a function. Falling back to text extraction placeholder.');
          extractedText = `PDF Document: ${originalName} (Internal text parser unresolved).`;
        } else {
          try {
            const parsed = await parseFn(fileBuffer);
            extractedText = parsed.text || '';
          } catch (parseErr: any) {
            console.error('pdf-parse failed to parse buffer:', parseErr);
            throw new Error('PDF parsing failed: ' + parseErr.message);
          }
        }
      } else if (fileType === 'docx') {
        const fileBuffer = fs.readFileSync(filePath);
        extractedText = parseDocx(fileBuffer);
      }

      // If text extraction was completely empty, fallback to simple placeholder or return error
      if (!extractedText || extractedText.trim().length === 0) {
        extractedText = `Extracted Text Placeholder for ${originalName}. Resume uploaded successfully.`;
      }

      const db = readDb();
      const newResume: Resume = {
        id: db.resumes.length > 0 ? Math.max(...db.resumes.map(r => r.id)) + 1 : 1,
        userId: req.user.id,
        filename: originalName,
        storedPath: filePath,
        fileType,
        extractedText,
        createdAt: new Date().toISOString()
      };

      db.resumes.push(newResume);
      writeDb(db);

      res.status(201).json({
        id: newResume.id,
        filename: newResume.filename,
        fileType: newResume.fileType,
        createdAt: newResume.createdAt,
        textLength: extractedText.length
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'Failed to process and upload resume: ' + err.message });
    }
  });

  app.get('/api/resumes', authenticateToken, (req: any, res) => {
    const db = readDb();
    const userResumes = db.resumes.filter(r => r.userId === req.user.id);
    res.json(userResumes.map(r => ({
      id: r.id,
      filename: r.filename,
      fileType: r.fileType,
      createdAt: r.createdAt
    })));
  });

  app.get('/api/resumes/:id', authenticateToken, (req: any, res) => {
    const db = readDb();
    const resume = db.resumes.find(r => r.id === parseInt(req.params.id) && r.userId === req.user.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json(resume);
  });

  app.delete('/api/resumes/:id', authenticateToken, (req: any, res) => {
    const db = readDb();
    const index = db.resumes.findIndex(r => r.id === parseInt(req.params.id) && r.userId === req.user.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const resume = db.resumes[index];
    if (fs.existsSync(resume.storedPath)) {
      try {
        fs.unlinkSync(resume.storedPath);
      } catch (err) {
        console.error('Failed to delete file from disk', err);
      }
    }

    db.resumes.splice(index, 1);
    // Delete corresponding analyses
    db.atsAnalyses = db.atsAnalyses.filter(a => a.resumeId !== resume.id);
    db.refactors = db.refactors.filter(rf => rf.resumeId !== resume.id);

    writeDb(db);
    res.json({ message: 'Resume deleted successfully' });
  });

  // JOB DESCRIPTIONS
  app.post('/api/job-descriptions', authenticateToken, (req: any, res) => {
    const { title, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const db = readDb();
    const newJD: JobDescription = {
      id: db.jobDescriptions.length > 0 ? Math.max(...db.jobDescriptions.map(j => j.id)) + 1 : 1,
      userId: req.user.id,
      title: title || 'Job Description',
      content,
      createdAt: new Date().toISOString()
    };

    db.jobDescriptions.push(newJD);
    writeDb(db);

    res.status(201).json(newJD);
  });

  app.get('/api/job-descriptions', authenticateToken, (req: any, res) => {
    const db = readDb();
    const userJDs = db.jobDescriptions.filter(j => j.userId === req.user.id);
    res.json(userJDs);
  });

  // AI OPERATIONS (ATS SCORING)
  app.post('/api/ai/ats-score', authenticateToken, async (req: any, res) => {
    const { resumeId, jobDescriptionId, jobDescriptionText } = req.body;
    if (!resumeId) {
      return res.status(400).json({ error: 'Resume ID is required' });
    }

    const db = readDb();
    const resume = db.resumes.find(r => r.id === parseInt(resumeId) && r.userId === req.user.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    let jdText = jobDescriptionText || '';
    let jdId: number | undefined = jobDescriptionId;

    if (jobDescriptionId) {
      const jd = db.jobDescriptions.find(j => j.id === parseInt(jobDescriptionId) && j.userId === req.user.id);
      if (jd) {
        jdText = jd.content;
      }
    }

    // Call Gemini API to perform the ATS Scoring
    try {
      const isMockKey = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY' || process.env.GEMINI_API_KEY === 'MOCK_KEY';

      let parsedResult: any;

      if (isMockKey) {
        // Fallback mock logic with realistic scoring if key is missing or is the default placeholder
        const scoreRandom = Math.floor(Math.random() * 20) + 65; // 65-85
        parsedResult = {
          overallScore: scoreRandom,
          categoryScores: {
            keywords: Math.floor(Math.random() * 25) + 60,
            formatting: Math.floor(Math.random() * 15) + 80,
            experience: Math.floor(Math.random() * 20) + 70,
            skills: Math.floor(Math.random() * 20) + 65,
            education: Math.floor(Math.random() * 10) + 85,
            grammar: Math.floor(Math.random() * 5) + 90,
            achievements: Math.floor(Math.random() * 30) + 55,
            projects: Math.floor(Math.random() * 20) + 70
          },
          missingKeywords: ['TypeScript', 'Kubernetes', 'CI/CD', 'GraphQL', 'AWS CloudFormation'],
          suggestions: [
            'Add measurable impact metrics (e.g. percentages, values) to your bullet points.',
            'Integrate missing keywords such as AWS CloudFormation and Kubernetes into your skill list.',
            'Elaborate on technical project implementations and the scale of deployment.'
          ],
          strengths: [
            'Excellent education background matching industry standards.',
            'Great grammatical consistency and professional formatting.',
            'Solid experience with frontend React/Next.js frameworks.'
          ],
          weaknesses: [
            'Missing key cloud deployment and orchestration keywords.',
            'Work history lists tasks rather than achievements/outcomes.'
          ]
        };
      } else {
        const prompt = `You are an expert Applicant Tracking System (ATS) scanner.
Analyze the following resume text against the provided job description.
Assess scores (0-100) for overall match, keywords, formatting, experience, skills, education, grammar, achievements, and projects.
Identify critical missing keywords, actionable suggestions, major strengths, and weaknesses.

RESUME TEXT:
"""
${resume.extractedText}
"""

JOB DESCRIPTION:
"""
${jdText || 'Standard Software Engineering / General Technical Professional Roles'}
"""

You MUST respond strictly with a valid JSON object matching the following TypeScript interface structure. Ensure no markdown formatting wrappers are used in the raw response, or return valid JSON.

Interface schema:
{
  "overallScore": number,
  "categoryScores": {
    "keywords": number,
    "formatting": number,
    "experience": number,
    "skills": number,
    "education": number,
    "grammar": number,
    "achievements": number,
    "projects": number
  },
  "missingKeywords": string[],
  "suggestions": string[],
  "strengths": string[],
  "weaknesses": string[]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallScore: { type: Type.INTEGER },
                categoryScores: {
                  type: Type.OBJECT,
                  properties: {
                    keywords: { type: Type.INTEGER },
                    formatting: { type: Type.INTEGER },
                    experience: { type: Type.INTEGER },
                    skills: { type: Type.INTEGER },
                    education: { type: Type.INTEGER },
                    grammar: { type: Type.INTEGER },
                    achievements: { type: Type.INTEGER },
                    projects: { type: Type.INTEGER }
                  },
                  required: ['keywords', 'formatting', 'experience', 'skills', 'education', 'grammar', 'achievements', 'projects']
                },
                missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['overallScore', 'categoryScores', 'missingKeywords', 'suggestions', 'strengths', 'weaknesses']
            }
          }
        });

        const text = response.text || '';
        try {
          parsedResult = JSON.parse(text.trim());
        } catch (e) {
          console.error("Failed to parse Gemini response as JSON. Text received: ", text);
          throw new Error("Could not parse AI response as valid JSON.");
        }
      }

      const newAnalysis: AtsAnalysis = {
        id: db.atsAnalyses.length > 0 ? Math.max(...db.atsAnalyses.map(a => a.id)) + 1 : 1,
        resumeId: resume.id,
        jobDescriptionId: jdId,
        overallScore: parsedResult.overallScore || 70,
        categoryScores: parsedResult.categoryScores || {
          keywords: 70, formatting: 70, experience: 70, skills: 70, education: 70, grammar: 70, achievements: 70, projects: 70
        },
        missingKeywords: parsedResult.missingKeywords || [],
        suggestions: parsedResult.suggestions || [],
        strengths: parsedResult.strengths || [],
        weaknesses: parsedResult.weaknesses || [],
        createdAt: new Date().toISOString()
      };

      db.atsAnalyses.push(newAnalysis);
      writeDb(db);

      res.json(newAnalysis);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'AI analysis failed: ' + err.message });
    }
  });

  app.get('/api/ai/analyses', authenticateToken, (req: any, res) => {
    const db = readDb();
    const userResumes = db.resumes.filter(r => r.userId === req.user.id).map(r => r.id);
    const userAnalyses = db.atsAnalyses.filter(a => userResumes.includes(a.resumeId));

    // Hydrate with resume filename & JD details
    const hydrated = userAnalyses.map(a => {
      const resume = db.resumes.find(r => r.id === a.resumeId);
      const jd = a.jobDescriptionId ? db.jobDescriptions.find(j => j.id === a.jobDescriptionId) : null;
      return {
        ...a,
        resumeFilename: resume ? resume.filename : 'Deleted Resume',
        jobTitle: jd ? jd.title : 'General Analysis'
      };
    });

    res.json(hydrated);
  });

  // RESUME REFACTORING (SIDE-BY-SIDE WRITE-UP)
  app.post('/api/ai/refactor', authenticateToken, async (req: any, res) => {
    const { resumeId, jobDescriptionId, jobDescriptionText } = req.body;
    if (!resumeId) {
      return res.status(400).json({ error: 'Resume ID is required' });
    }

    const db = readDb();
    const resume = db.resumes.find(r => r.id === parseInt(resumeId) && r.userId === req.user.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    let jdText = jobDescriptionText || '';
    let jdId: number | undefined = jobDescriptionId;

    if (jobDescriptionId) {
      const jd = db.jobDescriptions.find(j => j.id === parseInt(jobDescriptionId) && j.userId === req.user.id);
      if (jd) {
        jdText = jd.content;
      }
    }

    try {
      const isMockKey = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY' || process.env.GEMINI_API_KEY === 'MOCK_KEY';

      let parsedResult: any;

      if (isMockKey) {
        // Fallback mock logic for testing/preview
        parsedResult = {
          refactoredContent: `# REFACTORED RESUME: ${resume.filename}\n\n## Professional Summary\nResult-oriented software engineer with verified expertise in core React, Node.js development, and microservices architecture. Accomplished in leveraging high-performance TypeScript setups, integrating Docker, and executing scalable AWS deployments.\n\n## Technical Skills\n- **Languages**: TypeScript, JavaScript, HTML5, CSS3, SQL, Go\n- **Frameworks**: React, Next.js, Express, Tailwind CSS\n- **Tools & Infrastructure**: Docker, Git, CI/CD pipelines, AWS S3, ECS, CloudFormation\n\n## Experience\n**Senior Web Application Engineer** | Acme Tech Solutions (2024 - Present)\n- Engineered robust frontend rendering pathways with Next.js App Router, resulting in a **32% speed improvement** in client-side loading times.\n- Automated microservice provisioning via **Docker orchestration** pipelines, cutting deployment latency by 18 minutes.\n- Integrated high-performance secure state persistence systems handling user-authored logs.\n\n## Education\n**B.S. in Computer Science** | University of Technology (GPA: 3.8/4.0)`,
          changesSummary: [
            'Added powerful descriptive action verbs like "Engineered", "Orchestrated", and "Automated".',
            'Quantified achievements with exact stats (e.g. 32% loading speed improvement).',
            'Integrated high-impact missing keywords like "Next.js App Router", "Docker orchestration", and "TypeScript".',
            'Streamlined the formatting for maximum readability in ATS parsers.'
          ],
          missingKeywords: ['Next.js App Router', 'TypeScript', 'Docker']
        };
      } else {
        const prompt = `You are an expert resume refactoring consultant and ATS copywriter.
Analyze this resume text and optimize it against the provided Job Description.
Instructions:
1. Preserve all real names, colleges, past dates, companies, and roles (do NOT invent fake experiences or degrees).
2. Rewrite summaries and bullet points to emphasize impact, using active verbs and metrics where possible.
3. Incorporate key skills, tools, and workflows from the job description naturally.
4. Output the refactored resume in a clean, professional Markdown format.

RESUME TEXT:
"""
${resume.extractedText}
"""

JOB DESCRIPTION:
"""
${jdText || 'General High-Impact Technical Role'}
"""

You MUST respond strictly with a valid JSON object matching the following structure. Do not wrap the response in any markdown code block wrappers (like \`\`\`json) or include extra text outside the JSON.

JSON Structure:
{
  "refactoredContent": "full markdown string representing the refactored resume content",
  "changesSummary": ["bullet point of change", "another bullet point of change"],
  "missingKeywords": ["keyword solved", "keyword solved"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                refactoredContent: { type: Type.STRING },
                changesSummary: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['refactoredContent', 'changesSummary', 'missingKeywords']
            }
          }
        });

        const text = response.text || '';
        try {
          parsedResult = JSON.parse(text.trim());
        } catch (e) {
          console.error("Failed to parse Gemini response as JSON. Text received: ", text);
          throw new Error("Could not parse AI response as valid JSON.");
        }
      }

      const newRefactor: Refactor = {
        id: db.refactors.length > 0 ? Math.max(...db.refactors.map(rf => rf.id)) + 1 : 1,
        resumeId: resume.id,
        jobDescriptionId: jdId,
        originalContent: resume.extractedText,
        refactoredContent: parsedResult.refactoredContent,
        changesSummary: parsedResult.changesSummary || [],
        missingKeywords: parsedResult.missingKeywords || [],
        createdAt: new Date().toISOString()
      };

      db.refactors.push(newRefactor);
      writeDb(db);

      res.json(newRefactor);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'AI refactoring failed: ' + err.message });
    }
  });

  // INTERVIEW PREPARATION ENDPOINT
  app.post('/api/ai/interview-questions', authenticateToken, async (req: any, res) => {
    const { resumeId, jobDescriptionId, jobDescriptionText } = req.body;
    if (!resumeId) {
      return res.status(400).json({ error: 'Resume ID is required' });
    }

    const db = readDb();
    const resume = db.resumes.find(r => r.id === parseInt(resumeId) && r.userId === req.user.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    let jdText = jobDescriptionText || '';
    if (jobDescriptionId) {
      const jd = db.jobDescriptions.find(j => j.id === parseInt(jobDescriptionId) && j.userId === req.user.id);
      if (jd) {
        jdText = jd.content;
      }
    }

    try {
      const isMockKey = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY' || process.env.GEMINI_API_KEY === 'MOCK_KEY';

      let parsedResult: any;

      if (isMockKey) {
        parsedResult = {
          questions: [
            { type: 'technical', question: 'How did you improve next-page rendering times inside Next.js by 32%? Can you walk us through your optimization framework?', topic: 'Next.js Performance' },
            { type: 'technical', question: 'In your resume, you mentioned containerizing microservices. How did you structure your Dockerfiles to achieve optimal build caches?', topic: 'Docker Orchestration' },
            { type: 'technical', question: 'How do you handle JWT authentication and secure session state hydration across dynamic Express backends?', topic: 'Authentication Security' },
            { type: 'behavioral', question: 'Describe a time when you had to adapt a legacy code module against strict deadlines. How did you manage code quality?', topic: 'Adaptability' },
            { type: 'behavioral', question: 'Can you walk us through an achievement in your past roles that you are particularly proud of, and how you quantified its success?', topic: 'Achievement Impact' }
          ]
        };
      } else {
        const prompt = `Based on the following resume and job description, generate 5 relevant technical questions and 5 behavioral interview questions to prepare the candidate. Provide the topic of focus for each.

RESUME TEXT:
"""
${resume.extractedText}
"""

JOB DESCRIPTION:
"""
${jdText || 'Technical Career Path'}
"""

Respond with a valid JSON object matching the following structure.

JSON Structure:
{
  "questions": [
    {
      "type": "technical" | "behavioral",
      "question": "string representing the question",
      "topic": "string focus topic"
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      question: { type: Type.STRING },
                      topic: { type: Type.STRING }
                    },
                    required: ['type', 'question', 'topic']
                  }
                }
              },
              required: ['questions']
            }
          }
        });

        const text = response.text || '';
        try {
          parsedResult = JSON.parse(text.trim());
        } catch (e) {
          console.error("Failed parsing questions", text);
          throw new Error("Could not parse AI questions.");
        }
      }

      res.json(parsedResult);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'AI preparation question generation failed: ' + err.message });
    }
  });

  // USER PROFILE ENDPOINTS
  app.get('/api/user/profile', authenticateToken, (req: any, res) => {
    const db = readDb();
    const profile = db.userProfiles.find(p => p.userId === req.user.id) || { userId: req.user.id };
    
    const experiences = db.profileExperiences.filter(e => e.userId === req.user.id);
    const educations = db.profileEducations.filter(ed => ed.userId === req.user.id);
    const projects = db.profileProjects.filter(p => p.userId === req.user.id);
    const skills = db.profileSkills.filter(s => s.userId === req.user.id);
    const certifications = db.profileCertifications.filter(c => c.userId === req.user.id);

    res.json({
      ...profile,
      experiences,
      educations,
      projects,
      skills,
      certifications
    });
  });

  app.put('/api/user/profile', authenticateToken, (req: any, res) => {
    const { headline, summary } = req.body;
    const db = readDb();
    let profileIndex = db.userProfiles.findIndex(p => p.userId === req.user.id);
    
    if (profileIndex === -1) {
      db.userProfiles.push({ userId: req.user.id, headline, summary });
    } else {
      db.userProfiles[profileIndex].headline = headline !== undefined ? headline : db.userProfiles[profileIndex].headline;
      db.userProfiles[profileIndex].summary = summary !== undefined ? summary : db.userProfiles[profileIndex].summary;
    }

    writeDb(db);
    res.json({ success: true });
  });

  app.get('/api/user/profile/completion', authenticateToken, (req: any, res) => {
    const db = readDb();
    const profile = db.userProfiles.find(p => p.userId === req.user.id);
    
    const exps = db.profileExperiences.filter(e => e.userId === req.user.id);
    const edus = db.profileEducations.filter(e => e.userId === req.user.id);
    const skills = db.profileSkills.filter(s => s.userId === req.user.id);

    const missing_fields: string[] = [];
    let filled = 0;

    if (profile?.headline) filled++; else missing_fields.push('headline');
    if (profile?.summary) filled++; else missing_fields.push('summary');
    if (exps.length > 0) filled++; else missing_fields.push('work_experience');
    if (edus.length > 0) filled++; else missing_fields.push('education');
    if (skills.length > 0) filled++; else missing_fields.push('skills');

    const percentage = Math.round((filled / 5) * 100);
    res.json({ percentage, missing_fields });
  });

  // EXPERIENCES CRUD
  app.post('/api/user/profile/experiences', authenticateToken, (req: any, res) => {
    const { company, title, location, startDate, endDate, isCurrent, description } = req.body;
    if (!company || !title) {
      return res.status(400).json({ error: 'Company and Title are required' });
    }
    const db = readDb();
    const newExp: ProfileExperience = {
      id: db.profileExperiences.length > 0 ? Math.max(...db.profileExperiences.map(e => e.id)) + 1 : 1,
      userId: req.user.id,
      company,
      title,
      location,
      startDate,
      endDate,
      isCurrent: !!isCurrent,
      description
    };
    db.profileExperiences.push(newExp);
    writeDb(db);
    res.status(201).json(newExp);
  });

  app.put('/api/user/profile/experiences/:id', authenticateToken, (req: any, res) => {
    const db = readDb();
    const exp = db.profileExperiences.find(e => e.id === parseInt(req.params.id) && e.userId === req.user.id);
    if (!exp) return res.status(404).json({ error: 'Experience not found' });

    Object.assign(exp, req.body);
    writeDb(db);
    res.json(exp);
  });

  app.delete('/api/user/profile/experiences/:id', authenticateToken, (req: any, res) => {
    const db = readDb();
    const idx = db.profileExperiences.findIndex(e => e.id === parseInt(req.params.id) && e.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Experience not found' });

    db.profileExperiences.splice(idx, 1);
    writeDb(db);
    res.json({ success: true });
  });

  // EDUCATIONS CRUD
  app.post('/api/user/profile/educations', authenticateToken, (req: any, res) => {
    const { institution, degree, fieldOfStudy, startDate, endDate, description } = req.body;
    if (!institution) {
      return res.status(400).json({ error: 'Institution is required' });
    }
    const db = readDb();
    const newEdu: ProfileEducation = {
      id: db.profileEducations.length > 0 ? Math.max(...db.profileEducations.map(e => e.id)) + 1 : 1,
      userId: req.user.id,
      institution,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      description
    };
    db.profileEducations.push(newEdu);
    writeDb(db);
    res.status(201).json(newEdu);
  });

  app.put('/api/user/profile/educations/:id', authenticateToken, (req: any, res) => {
    const db = readDb();
    const edu = db.profileEducations.find(e => e.id === parseInt(req.params.id) && e.userId === req.user.id);
    if (!edu) return res.status(404).json({ error: 'Education not found' });

    Object.assign(edu, req.body);
    writeDb(db);
    res.json(edu);
  });

  app.delete('/api/user/profile/educations/:id', authenticateToken, (req: any, res) => {
    const db = readDb();
    const idx = db.profileEducations.findIndex(e => e.id === parseInt(req.params.id) && e.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Education not found' });

    db.profileEducations.splice(idx, 1);
    writeDb(db);
    res.json({ success: true });
  });

  // PROJECTS CRUD
  app.post('/api/user/profile/projects', authenticateToken, (req: any, res) => {
    const { name, description, url, technologies } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });
    
    const db = readDb();
    const newProj: ProfileProject = {
      id: db.profileProjects.length > 0 ? Math.max(...db.profileProjects.map(p => p.id)) + 1 : 1,
      userId: req.user.id,
      name,
      description,
      url,
      technologies: Array.isArray(technologies) ? technologies : []
    };
    db.profileProjects.push(newProj);
    writeDb(db);
    res.status(201).json(newProj);
  });

  app.put('/api/user/profile/projects/:id', authenticateToken, (req: any, res) => {
    const db = readDb();
    const proj = db.profileProjects.find(p => p.id === parseInt(req.params.id) && p.userId === req.user.id);
    if (!proj) return res.status(404).json({ error: 'Project not found' });

    Object.assign(proj, req.body);
    writeDb(db);
    res.json(proj);
  });

  app.delete('/api/user/profile/projects/:id', authenticateToken, (req: any, res) => {
    const db = readDb();
    const idx = db.profileProjects.findIndex(p => p.id === parseInt(req.params.id) && p.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Project not found' });

    db.profileProjects.splice(idx, 1);
    writeDb(db);
    res.json({ success: true });
  });

  // SKILLS CRUD
  app.post('/api/user/profile/skills', authenticateToken, (req: any, res) => {
    const { name, proficiency } = req.body;
    if (!name) return res.status(400).json({ error: 'Skill name is required' });

    const db = readDb();
    const newSkill: ProfileSkill = {
      id: db.profileSkills.length > 0 ? Math.max(...db.profileSkills.map(s => s.id)) + 1 : 1,
      userId: req.user.id,
      name,
      proficiency: proficiency || 'Intermediate'
    };
    db.profileSkills.push(newSkill);
    writeDb(db);
    res.status(201).json(newSkill);
  });

  app.delete('/api/user/profile/skills/:id', authenticateToken, (req: any, res) => {
    const db = readDb();
    const idx = db.profileSkills.findIndex(s => s.id === parseInt(req.params.id) && s.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Skill not found' });

    db.profileSkills.splice(idx, 1);
    writeDb(db);
    res.json({ success: true });
  });

  // CERTIFICATIONS CRUD
  app.post('/api/user/profile/certifications', authenticateToken, (req: any, res) => {
    const { name, issuer, issueDate, expiryDate, credentialUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'Certification name is required' });

    const db = readDb();
    const newCert: ProfileCertification = {
      id: db.profileCertifications.length > 0 ? Math.max(...db.profileCertifications.map(c => c.id)) + 1 : 1,
      userId: req.user.id,
      name,
      issuer,
      issueDate,
      expiryDate,
      credentialUrl
    };
    db.profileCertifications.push(newCert);
    writeDb(db);
    res.status(201).json(newCert);
  });

  app.delete('/api/user/profile/certifications/:id', authenticateToken, (req: any, res) => {
    const db = readDb();
    const idx = db.profileCertifications.findIndex(c => c.id === parseInt(req.params.id) && c.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Certification not found' });

    db.profileCertifications.splice(idx, 1);
    writeDb(db);
    res.json({ success: true });
  });

  // JOB SERVICE ROUTINGS
  app.get('/api/jobs', authenticateToken, (req: any, res) => {
    const db = readDb();
    res.json(db.jobs);
  });

  app.get('/api/jobs/:id', authenticateToken, (req: any, res) => {
    const db = readDb();
    const job = db.jobs.find(j => j.id === parseInt(req.params.id));
    if (!job) return res.status(404).json({ error: 'Job listing not found' });
    res.json(job);
  });

  app.post('/api/jobs/:id/save', authenticateToken, (req: any, res) => {
    const db = readDb();
    const jobId = parseInt(req.params.id);
    const existing = db.savedJobs.find(s => s.userId === req.user.id && s.jobId === jobId);
    
    if (existing) {
      return res.json(existing);
    }

    const newSaved: SavedJob = {
      id: db.savedJobs.length > 0 ? Math.max(...db.savedJobs.map(s => s.id)) + 1 : 1,
      userId: req.user.id,
      jobId,
      createdAt: new Date().toISOString()
    };
    db.savedJobs.push(newSaved);
    writeDb(db);
    res.status(201).json(newSaved);
  });

  app.delete('/api/jobs/:id/save', authenticateToken, (req: any, res) => {
    const db = readDb();
    const jobId = parseInt(req.params.id);
    const idx = db.savedJobs.findIndex(s => s.userId === req.user.id && s.jobId === jobId);
    if (idx === -1) return res.status(404).json({ error: 'Bookmark not found' });

    db.savedJobs.splice(idx, 1);
    writeDb(db);
    res.json({ success: true });
  });

  app.get('/api/saved-jobs', authenticateToken, (req: any, res) => {
    const db = readDb();
    const saved = db.savedJobs.filter(s => s.userId === req.user.id);
    const hydrated = saved.map(s => {
      const job = db.jobs.find(j => j.id === s.jobId);
      return { ...s, job };
    });
    res.json(hydrated);
  });

  app.post('/api/jobs/:id/apply', authenticateToken, (req: any, res) => {
    const db = readDb();
    const jobId = parseInt(req.params.id);
    const { resumeId, coverLetter } = req.body;

    const existing = db.appliedJobs.find(a => a.userId === req.user.id && a.jobId === jobId);
    if (existing) {
      return res.status(400).json({ error: 'You have already applied for this role.' });
    }

    const newApplication: AppliedJob = {
      id: db.appliedJobs.length > 0 ? Math.max(...db.appliedJobs.map(a => a.id)) + 1 : 1,
      userId: req.user.id,
      jobId,
      resumeId: resumeId ? parseInt(resumeId) : undefined,
      status: 'pending',
      coverLetter,
      appliedAt: new Date().toISOString()
    };

    db.appliedJobs.push(newApplication);

    // Push live notification
    const job = db.jobs.find(j => j.id === jobId);
    db.notifications.push({
      id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
      userId: req.user.id,
      title: 'Application Dispatched!',
      message: `Your application for ${job ? job.title : 'Role'} at ${job ? job.company : 'Company'} was sent.`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    writeDb(db);
    res.status(201).json(newApplication);
  });

  app.get('/api/applied-jobs', authenticateToken, (req: any, res) => {
    const db = readDb();
    const applications = db.appliedJobs.filter(a => a.userId === req.user.id);
    const hydrated = applications.map(a => {
      const job = db.jobs.find(j => j.id === a.jobId);
      return { ...a, job };
    });
    res.json(hydrated);
  });

  // NOTIFICATION SERVICE ENDPOINTS
  app.get('/api/notifications', authenticateToken, (req: any, res) => {
    const db = readDb();
    const notifs = db.notifications.filter(n => n.userId === req.user.id);
    res.json(notifs.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  app.get('/api/notifications/unread-count', authenticateToken, (req: any, res) => {
    const db = readDb();
    const count = db.notifications.filter(n => n.userId === req.user.id && !n.isRead).length;
    res.json({ count });
  });

  app.put('/api/notifications/:id/read', authenticateToken, (req: any, res) => {
    const db = readDb();
    const notif = db.notifications.find(n => n.id === parseInt(req.params.id) && n.userId === req.user.id);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });

    notif.isRead = true;
    writeDb(db);
    res.json({ success: true });
  });

  app.put('/api/notifications/read-all', authenticateToken, (req: any, res) => {
    const db = readDb();
    db.notifications.filter(n => n.userId === req.user.id && !n.isRead).forEach(n => n.isRead = true);
    writeDb(db);
    res.json({ success: true });
  });

  app.delete('/api/notifications/:id', authenticateToken, (req: any, res) => {
    const db = readDb();
    const idx = db.notifications.findIndex(n => n.id === parseInt(req.params.id) && n.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Notification not found' });

    db.notifications.splice(idx, 1);
    writeDb(db);
    res.json({ success: true });
  });


  // SETUP DEV SERVER / DIST STATIC PATHS
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting express backend server:', err);
});
