import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ResumeUploader } from './components/ResumeUploader';
import { AnalysisView } from './components/AnalysisView';
import { TemplateSelector } from './components/TemplateSelector';
import { ResumePreview } from './components/ResumePreview';
import { ResumeDiffView } from './components/ResumeDiffView';
import { CandidateForm } from './components/CandidateForm';
import { DashboardView, SavedSession } from './components/DashboardView';
import { AuthModal } from './components/AuthModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';

import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  getUserAnalysisSessions, 
  saveUserAnalysisSession, 
  deleteUserAnalysisSession, 
  clearAllUserAnalysisSessions 
} from './lib/firestoreService';

import { AnalysisResult, CandidateProfile, OptimizedResume } from './types';
import { runClientFallbackAnalysis } from './lib/fallbackAnalyzer';
import { ATS_TEMPLATES } from './data/templates';
import { AlertCircle } from 'lucide-react';

function ATSResumeApp() {
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'input' | 'analysis' | 'template' | 'preview' | 'compare' | 'profile' | 'dashboard'>('input');

  // Input states
  const [resumeText, setResumeText] = useState<string>('');
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('software-engineer');

  // Analysis & Generated States
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(() => {
    try {
      const stored = localStorage.getItem('ats_current_candidate_profile');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  });
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResume | null>(null);

  // Status & Error states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Saved History Sessions in Firestore (or fallback localStorage if offline/guest)
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  // Keep candidate profile in localStorage whenever it changes
  const handleProfileChange = (updatedProfile: CandidateProfile) => {
    setCandidateProfile(updatedProfile);
    try {
      localStorage.setItem('ats_current_candidate_profile', JSON.stringify(updatedProfile));
    } catch (err) {
      console.warn('Failed to save candidate profile to localStorage', err);
    }

    // Keep optimizedResume in sync if it exists
    if (optimizedResume) {
      setOptimizedResume(prev => prev ? ({
        ...prev,
        candidateProfile: updatedProfile,
        optimizedProfile: updatedProfile
      }) : null);
    }

    // Keep active session in sync
    setSavedSessions(prev => {
      if (!prev || prev.length === 0) return prev;
      const updated = prev.map((s, idx) => {
        if (idx === 0) {
          const updatedS: SavedSession = {
            ...s,
            analysis: s.analysis ? {
              ...s.analysis,
              extractedCandidateInfo: updatedProfile
            } : undefined,
            optimizedResume: s.optimizedResume ? {
              ...s.optimizedResume,
              candidateProfile: updatedProfile,
              optimizedProfile: updatedProfile
            } : undefined
          };
          if (user) {
            saveUserAnalysisSession(user.uid, updatedS).catch(e => console.error(e));
          }
          return updatedS;
        }
        return s;
      });
      return updated;
    });
  };

  // Load Firestore sessions when user logs in
  useEffect(() => {
    async function loadUserSessions() {
      if (user) {
        try {
          const userSessions = await getUserAnalysisSessions(user.uid);
          setSavedSessions(userSessions);
        } catch (err) {
          console.error("Failed to load user sessions from Firestore:", err);
        }
      } else {
        // Fallback to localStorage for guest
        try {
          const stored = localStorage.getItem('ats_resume_sessions');
          setSavedSessions(stored ? JSON.parse(stored) : []);
        } catch {
          setSavedSessions([]);
        }
      }
    }
    loadUserSessions();
  }, [user]);

  // Save guest sessions to localStorage
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem('ats_resume_sessions', JSON.stringify(savedSessions));
      } catch (err) {
        console.error('Failed to save sessions to localStorage', err);
      }
    }
  }, [savedSessions, user]);

  // Reset protected tabs to input if user logs out or is unauthenticated
  useEffect(() => {
    if (!user && activeTab !== 'input' && activeTab !== 'dashboard') {
      setActiveTab('input');
    }
  }, [user, activeTab]);

  // Reset All
  const handleResetAll = () => {
    setResumeText('');
    setResumeFileName('');
    setJobDescription('');
    setAnalysis(null);
    setCandidateProfile(null);
    setOptimizedResume(null);
    setApiError(null);
    try {
      localStorage.removeItem('ats_current_candidate_profile');
    } catch {
      // ignore
    }
    setActiveTab('input');
  };

  // Run ATS Analysis via Gemini API
  const handleAnalyzeResume = async () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    if (!resumeText.trim() || !jobDescription.trim()) {
      setApiError('Please provide both Candidate Resume text and Target Job Description before analyzing.');
      return;
    }

    setApiError(null);
    setIsAnalyzing(true);

    try {
      let analysisResult: AnalysisResult;
      let profile: CandidateProfile | null = null;

      try {
        const res = await fetch('/api/analyze-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText, jobDescription })
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to analyze resume.');
        }

        analysisResult = data.analysis || data;
        profile = data.candidateProfile || analysisResult.extractedCandidateInfo || null;
      } catch (networkErr: any) {
        console.warn("API fetch failed or offline, running resilient client analyzer:", networkErr);
        const fallback = runClientFallbackAnalysis(resumeText, jobDescription);
        analysisResult = fallback.analysis;
        profile = fallback.candidateProfile;
      }

      setAnalysis(analysisResult);
      if (profile) {
        setCandidateProfile(profile);
      }

      // Save new session
      const newSession: SavedSession = {
        id: `session-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        targetRole: analysisResult.targetRole || 'Target Role',
        companyName: analysisResult.companyName || 'Target Company',
        originalScore: analysisResult.originalScore || 0,
        resumeText,
        jobDescription,
        analysis: analysisResult
      };

      setSavedSessions(prev => [newSession, ...prev]);

      // If user is authenticated, save directly to Firestore under user's UID
      if (user) {
        await saveUserAnalysisSession(user.uid, newSession);
      }

      // Move to Analysis tab
      setActiveTab('analysis');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setApiError(err.message || 'An error occurred while evaluating ATS score.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run Optimization & Generate JD-Specific Resume
  const handleGenerateResume = async () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    if (!candidateProfile || !jobDescription) {
      setApiError('Missing candidate profile or job description.');
      return;
    }

    setApiError(null);
    setIsGenerating(true);

    try {
      const template = ATS_TEMPLATES.find(t => t.id === selectedTemplateId) || ATS_TEMPLATES[0];

      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateProfile,
          jobDescription,
          templateId: selectedTemplateId,
          targetRole: template.targetRole,
          originalScore: analysis?.originalScore || 72,
          analysis
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate optimized resume.');
      }

      const optResume = data.optimizedResume || data;
      setOptimizedResume(optResume);
      if (optResume.optimizedProfile || optResume.candidateProfile) {
        setCandidateProfile(optResume.optimizedProfile || optResume.candidateProfile);
      }

      // Update session in state and Firestore
      let updatedSession: SavedSession | null = null;
      setSavedSessions(prev =>
        prev.map(s => {
          if (s.analysis?.originalScore === analysis?.originalScore) {
            const updated = {
              ...s,
              improvedScore: optResume.afterScore,
              optimizedResume: optResume
            };
            updatedSession = updated;
            return updated;
          }
          return s;
        })
      );

      if (user && updatedSession) {
        await saveUserAnalysisSession(user.uid, updatedSession);
      }

      // Navigate to Preview tab
      setActiveTab('preview');
    } catch (err: any) {
      console.error('Resume generation error:', err);
      setApiError(err.message || 'Failed to generate optimized resume.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Load past session
  const handleLoadSession = (sess: SavedSession) => {
    setResumeText(sess.resumeText);
    setJobDescription(sess.jobDescription);
    if (sess.analysis) setAnalysis(sess.analysis);
    if (sess.optimizedResume) {
      setOptimizedResume(sess.optimizedResume);
      if (sess.optimizedResume.optimizedProfile) {
        setCandidateProfile(sess.optimizedResume.optimizedProfile);
      }
    }
    setActiveTab(sess.optimizedResume ? 'preview' : 'analysis');
  };

  const handleDeleteSession = async (id: string) => {
    setSavedSessions(prev => prev.filter(s => s.id !== id));
    if (user) {
      await deleteUserAnalysisSession(user.uid, id);
    }
  };

  const handleClearAllSessions = async () => {
    setSavedSessions([]);
    if (user) {
      await clearAllUserAnalysisSessions(user.uid);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9F3] text-[#111111] font-sans flex flex-col selection:bg-yellow-300 selection:text-black">
      {/* Persistent Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasAnalysis={!!analysis}
        hasOptimized={!!optimizedResume}
        onResetAll={handleResetAll}
      />

      {/* Global API Error Alert Banner */}
      {apiError && (
        <div className="max-w-6xl mx-auto w-full px-4 pt-4">
          <div className="p-4 bg-red-100 border-2 border-red-600 rounded text-red-900 font-mono text-xs flex items-center justify-between shadow-[2px_2px_0px_#dc2626]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="font-bold uppercase text-red-800 hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {/* TAB 1: INPUT */}
        {activeTab === 'input' && (
          <ResumeUploader
            resumeText={resumeText}
            setResumeText={setResumeText}
            resumeFileName={resumeFileName}
            setResumeFileName={setResumeFileName}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onAnalyze={handleAnalyzeResume}
            isAnalyzing={isAnalyzing}
          />
        )}

        {/* TAB 2: ATS ANALYSIS */}
        {activeTab === 'analysis' && analysis && (
          <AnalysisView
            analysis={analysis}
            resumeText={resumeText}
            jobDescription={jobDescription}
            onProceedToTemplate={() => setActiveTab('template')}
          />
        )}

        {/* TAB 3: TEMPLATE SELECTOR */}
        {activeTab === 'template' && (
          <TemplateSelector
            selectedTemplateId={selectedTemplateId}
            setSelectedTemplateId={setSelectedTemplateId}
            onGenerate={handleGenerateResume}
            isGenerating={isGenerating}
          />
        )}

        {/* TAB 4: PREVIEW & EDIT */}
        {activeTab === 'preview' && candidateProfile && (
          <ResumePreview
            profile={candidateProfile}
            templateId={selectedTemplateId}
            atsScore={optimizedResume?.afterScore || analysis?.originalScore || 85}
            onEditProfile={() => setActiveTab('profile')}
            onSelectTemplate={setSelectedTemplateId}
          />
        )}

        {/* TAB 5: SCORE DIFFERENTIAL */}
        {activeTab === 'compare' && optimizedResume && (
          <ResumeDiffView
            optimizedResume={optimizedResume}
            onProceedToPreview={() => setActiveTab('preview')}
          />
        )}

        {/* TAB 6: CANDIDATE PROFILE FORM */}
        {activeTab === 'profile' && candidateProfile && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <CandidateForm
              profile={candidateProfile}
              onChange={handleProfileChange}
              onSaveAndRecalculate={() => {
                setActiveTab('preview');
              }}
            />
          </div>
        )}

        {/* TAB 7: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardView
            sessions={savedSessions}
            onLoadSession={handleLoadSession}
            onDeleteSession={handleDeleteSession}
            onClearAllSessions={handleClearAllSessions}
            onNewAnalysis={() => {
              handleResetAll();
              setActiveTab('input');
            }}
          />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <AccountSettingsModal />

      {/* Footer */}
      <footer className="no-print print:hidden border-t-2 border-black bg-white py-4 font-mono text-xs text-gray-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-black uppercase">ATS Resume Engine</span>
            <span>• Truth-Preserving & Anti-Fabrication Verified</span>
          </div>
          <div>
            Designed and developed by Venkatesh Erla | All rights reserved © 2026
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ATSResumeApp />
    </AuthProvider>
  );
}
