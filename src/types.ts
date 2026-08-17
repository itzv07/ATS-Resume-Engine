export interface PersonalDetails {
  fullName: string;
  mobileNumber: string;
  email: string;
  location: string;
  linkedIn: string;
  gitHub: string;
  portfolio: string;
  summary: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  specialization: string;
  graduationYear: string;
  cgpaOrPercentage: string;
  relevantCoursework: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  employmentDates: string;
  responsibilities: string[];
  achievements: string;
}

export interface InternshipItem {
  id: string;
  role: string;
  organization: string;
  duration: string;
  responsibilities: string[];
  technologiesUsed: string;
  achievements: string;
}

export interface ProjectItem {
  id: string;
  projectName: string;
  description: string;
  technologies: string;
  responsibilities: string[];
  resultsOrImpact: string;
}

export interface SkillCategory {
  categoryName: string; // e.g. Programming Languages, Frameworks, Databases, Tools
  skills: string[];
}

export interface CertificationItem {
  id: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  category: string; // Hackathon, Award, Academic, Leadership
  description: string;
}

export interface CandidateProfile {
  personal: PersonalDetails;
  education: EducationItem[];
  experience: ExperienceItem[];
  internships: InternshipItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  hobbies: string;
  additionalInfo: string;
}

export interface AtsScoreBreakdown {
  overallScore: number;
  keywordMatch: number;
  requiredSkillsMatch: number;
  technicalSkillsMatch: number;
  qualificationsMatch: number;
  experienceRelevanceMatch: number;
  resumeStructure: number;
  atsParsingCompatibility: number;
  sectionCompleteness: number;
  keywordPlacement: number;
  overallJdRelevance: number;
}

export interface MissingRequirementItem {
  item: string;
  status: 'missing_from_resume' | 'not_possessed';
  recommendation: string;
}

export interface MissingRequirements {
  skills: MissingRequirementItem[];
  keywords: { word: string; importance: 'high' | 'medium' | 'low'; context: string }[];
  qualifications: { requirement: string; candidateHasIt: boolean; details: string }[];
  jdRequirements: { requirement: string; candidateHasIt: boolean; details: string }[];
}

export interface KeywordCategoryBreakdown {
  add: { keyword: string; context: string }[];
  emphasize: { keyword: string; currentUsage: string; recommendation: string }[];
  rephrase: { originalPhrase: string; suggestedPhrase: string; keyword: string }[];
  avoid: { keyword: string; reason: string }[];
  doNotAdd: { keyword: string; reason: string }[];
}

export interface RecommendationItem {
  id: string;
  section: 'Summary' | 'Experience' | 'Projects' | 'Skills' | 'Education';
  currentText: string;
  recommendedText: string;
  reason: string;
  jdRequirementAddressed: string;
  keywordImproved: string;
  expectedImpact: string;
}

export interface AnalysisResult {
  id: string;
  targetRole: string;
  companyName: string;
  timestamp: string;
  originalScore: number;
  originalBreakdown: AtsScoreBreakdown;
  missingRequirements: MissingRequirements;
  keywords: KeywordCategoryBreakdown;
  recommendations: RecommendationItem[];
  scoreExplanation: string;
  extractedCandidateInfo: CandidateProfile;
}

export interface HighlightChange {
  section: string;
  type: 'added_keyword' | 'rewritten_bullet' | 'reordered' | 'optimized_skill';
  original: string;
  updated: string;
  explanation: string;
}

export interface OptimizedResume {
  id: string;
  templateId: string;
  candidateProfile: CandidateProfile;
  optimizedProfile?: CandidateProfile;
  beforeScore: number;
  afterScore: number;
  scoreImprovement: number;
  beforeBreakdown: AtsScoreBreakdown;
  afterBreakdown: AtsScoreBreakdown;
  improvementExplanation: string;
  highlightChanges: HighlightChange[];
}

export interface GridNodeData {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  icon?: string;
  tags?: string[];
  connections?: string[];
}

export interface ResumeTemplate {
  id: string;
  name: string;
  targetRole: string;
  bestFor: string[];
  description: string;
  fontFamily: string;
  primaryColor: string;
  accentColor: string;
}

export interface DashboardHistoryItem {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  originalScore: number;
  optimizedScore: number;
  templateId: string;
  resumeFileName?: string;
  candidateName: string;
}
