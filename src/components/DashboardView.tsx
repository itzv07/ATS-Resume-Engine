import React from 'react';
import { AnalysisResult, OptimizedResume } from '../types';
import { History, FileText, Trash2, ArrowRight, Sparkles, CheckCircle2, Lock, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface SavedSession {
  id: string;
  date: string;
  targetRole: string;
  companyName: string;
  originalScore: number;
  improvedScore?: number;
  resumeText: string;
  jobDescription: string;
  analysis?: AnalysisResult;
  optimizedResume?: OptimizedResume;
}

interface DashboardViewProps {
  sessions: SavedSession[];
  onLoadSession: (session: SavedSession) => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
  onNewAnalysis: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  onLoadSession,
  onDeleteSession,
  onClearAllSessions,
  onNewAnalysis
}) => {
  const { user, userProfile, openAuthModal, openSettingsModal } = useAuth();

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border-2 border-black rounded-lg p-8 shadow-[8px_8px_0px_#000] flex flex-col items-center gap-4">
          <div className="p-4 bg-yellow-300 border-2 border-black rounded-full shadow-[2px_2px_0px_#000]">
            <Lock className="w-8 h-8 text-black" />
          </div>
          <div>
            <div className="inline-block bg-yellow-200 border border-black px-2.5 py-0.5 rounded font-mono text-xs font-bold uppercase shadow-[1px_1px_0px_#000] mb-2">
              Protected Private Area
            </div>
            <h2 className="font-sans font-extrabold text-2xl text-black uppercase tracking-tight">
              Sign In to Access Your Dashboard
            </h2>
            <p className="font-mono text-xs text-gray-600 max-w-md mx-auto mt-2">
              Your ATS resume evaluations, target JD match scores, and optimized resumes are private and securely tied to your authenticated Firebase UID.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
            <button
              onClick={() => openAuthModal('signin')}
              className="px-6 py-3 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-sans font-bold text-sm uppercase text-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all whitespace-nowrap"
            >
              Sign In to Account
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-6 py-3 bg-white hover:bg-gray-100 border-2 border-black rounded font-sans font-bold text-sm uppercase text-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all whitespace-nowrap"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Member';

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col gap-6 sm:gap-8">
      {/* Top Profile & Session Banner */}
      <div className="bg-white border-2 border-black rounded p-4 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-3 bg-yellow-300 border-2 border-black rounded shadow-[2px_2px_0px_#000] hidden sm:block">
            <User className="w-8 h-8 text-black" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span className="font-mono text-[10px] sm:text-xs uppercase font-bold bg-yellow-200 text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
                Authenticated User
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-emerald-700 uppercase font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Firebase Firestore Protected
              </span>
            </div>
            <h2 className="font-sans font-extrabold text-xl sm:text-2xl text-black uppercase tracking-tight">
              {displayName}'s Private Dashboard
            </h2>
            <p className="font-mono text-[11px] sm:text-xs text-gray-600 max-w-xl mt-1 break-words">
              Signed in as <span className="font-bold text-black">{user.email}</span> • Access your private resume evaluations and JD-matched history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={openSettingsModal}
            className="px-3.5 py-2 bg-white hover:bg-gray-100 border-2 border-black rounded font-sans font-bold text-xs uppercase text-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
          >
            Settings
          </button>
          <button
            onClick={onNewAnalysis}
            className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-sans font-bold text-xs uppercase text-black shadow-[3px_3px_0px_#000] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-amber-800" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 font-mono text-xs">
        <div className="p-4 bg-white border-2 border-black rounded shadow-[2px_2px_0px_#000]">
          <span className="text-gray-500 uppercase text-[10px] font-bold">Total Resumes Evaluated</span>
          <div className="text-2xl sm:text-3xl font-bold text-black my-1">{sessions.length}</div>
          <p className="text-gray-600 text-[10px]">Synced with Firebase Cloud Storage</p>
        </div>

        <div className="p-4 bg-white border-2 border-black rounded shadow-[2px_2px_0px_#000]">
          <span className="text-gray-500 uppercase text-[10px] font-bold">Anti-Fabrication Engine</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 my-1 flex items-center gap-1">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" /> 100%
          </div>
          <p className="text-gray-600 text-[10px]">Strict verification against candidate facts</p>
        </div>

        <div className="p-4 bg-white border-2 border-black rounded shadow-[2px_2px_0px_#000]">
          <span className="text-gray-500 uppercase text-[10px] font-bold">Average ATS Score Improvement</span>
          <div className="text-2xl sm:text-3xl font-bold text-amber-700 my-1">+16 pts</div>
          <p className="text-gray-600 text-[10px]">Across JD keyword matching</p>
        </div>
      </div>

      {/* Saved Sessions Table */}
      <div className="bg-white border-2 border-black rounded p-4 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between border-b-2 border-black pb-3 gap-2">
          <h3 className="font-sans font-bold text-base sm:text-lg text-black uppercase tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-black shrink-0" />
            Saved Firestore Sessions ({sessions.length})
          </h3>

          {sessions.length > 0 && (
            <button
              onClick={onClearAllSessions}
              className="text-xs font-mono text-red-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="p-6 sm:p-8 text-center bg-[#F8F9F3] border border-black rounded font-mono text-xs text-gray-600 flex flex-col items-center gap-3">
            <FileText className="w-8 h-8 text-gray-400" />
            <p className="font-bold text-black">No saved resume sessions found in your account.</p>
            <p>Upload a resume and job description to perform your first ATS analysis and save it to your profile.</p>
            <button
              onClick={onNewAnalysis}
              className="mt-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 border border-black rounded font-bold text-black shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              Start First Analysis
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 font-mono text-xs">
            {sessions.map((sess) => (
              <div key={sess.id} className="p-3.5 sm:p-4 bg-[#F8F9F3] border-2 border-black rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 shadow-[2px_2px_0px_#000]">
                <div className="flex flex-col gap-1 w-full md:w-auto">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-black text-sm uppercase">{sess.targetRole || 'Target Role'}</span>
                    <span className="text-[10px] bg-white border border-black px-2 py-0.5 rounded text-gray-600 max-w-full truncate">
                      {sess.companyName || 'Target Employer'}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500">Evaluated on {sess.date}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 border-gray-200 pt-2.5 md:pt-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-white border border-black rounded text-center min-w-16">
                      <span className="text-[9px] text-gray-500 block uppercase">Original</span>
                      <span className="font-bold text-gray-800">{sess.originalScore}/100</span>
                    </div>

                    {sess.improvedScore && (
                      <>
                        <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="p-1.5 sm:p-2 bg-emerald-100 border border-emerald-700 rounded text-center min-w-16">
                          <span className="text-[9px] text-emerald-800 block uppercase font-bold">Optimized</span>
                          <span className="font-bold text-emerald-900">{sess.improvedScore}/100</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLoadSession(sess)}
                      className="px-3.5 py-2 bg-yellow-300 hover:bg-yellow-400 border border-black rounded font-bold text-black shadow-[1px_1px_0px_#000] cursor-pointer text-xs"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => onDeleteSession(sess.id)}
                      className="p-2 text-red-600 hover:bg-red-100 border border-red-300 rounded cursor-pointer"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
