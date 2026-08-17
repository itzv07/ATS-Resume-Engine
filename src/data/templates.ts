import { ResumeTemplate } from '../types';

export const ATS_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'software-engineer',
    name: 'Template 01 — Software Engineer',
    targetRole: 'Software Engineer',
    bestFor: [
      'Java Developer',
      'Software Engineer',
      'Backend Developer',
      'Full Stack Developer'
    ],
    description: 'Ultra-clean single column layout prioritizing technical stack visibility, concise bullet metrics, and zero graphical parsing noise.',
    fontFamily: 'Arial, Helvetica, sans-serif',
    primaryColor: '#111111',
    accentColor: '#1f2937'
  },
  {
    id: 'ai-ml',
    name: 'Template 02 — AI/ML',
    targetRole: 'AI & Machine Learning',
    bestFor: [
      'AI Engineer',
      'ML Engineer',
      'Data Scientist',
      'Data Analyst'
    ],
    description: 'Tailored for data-heavy roles highlighting machine learning pipelines, model frameworks, cloud compute, and quantitative project outcomes.',
    fontFamily: 'Calibri, sans-serif',
    primaryColor: '#0f172a',
    accentColor: '#334155'
  },
  {
    id: 'graduate-fresher',
    name: 'Template 03 — Graduate / Fresher',
    targetRole: 'Fresh Graduate & Entry Level',
    bestFor: [
      'Fresh Graduates',
      'Entry-Level Software Engineers',
      'Campus Placements'
    ],
    description: 'Emphasizes academic background, coursework, internships, hackathons, and personal projects to fit perfectly onto a single high-impact page.',
    fontFamily: 'Georgia, Times New Roman, serif',
    primaryColor: '#18181b',
    accentColor: '#27272a'
  },
  {
    id: 'professional',
    name: 'Template 04 — Professional',
    targetRole: 'Senior & Experienced Roles',
    bestFor: [
      'Experienced Software Engineers',
      'Business/Technical Lead Roles',
      'General Corporate Positions'
    ],
    description: 'Classic executive single-column format with formal typography, chronological experience breakdown, and clear leadership/achievement focus.',
    fontFamily: 'Garamond, Georgia, serif',
    primaryColor: '#111827',
    accentColor: '#4b5563'
  }
];
