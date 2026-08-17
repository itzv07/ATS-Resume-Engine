import React, { useState } from 'react';
import { Upload, FileText, Briefcase, AlertCircle, CheckCircle2, ArrowRight, Loader2, X, Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ResumeUploaderProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  resumeText,
  setResumeText,
  resumeFileName,
  setResumeFileName,
  jobDescription,
  setJobDescription,
  onAnalyze,
  isAnalyzing
}) => {
  const { user, openAuthModal } = useAuth();
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'resume' | 'jd') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsExtractingFile(true);

    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text();
        if (target === 'resume') {
          setResumeText(text);
          setResumeFileName(file.name);
        } else {
          setJobDescription(text);
        }
      } else {
        // Send to server Gemini parser for PDF or DOCX text extraction
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          const res = await fetch('/api/extract-file-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64,
              fileName: file.name,
              mimeType: file.type || 'application/pdf'
            })
          });
          const data = await res.json();
          if (data.text) {
            if (target === 'resume') {
              setResumeText(data.text);
              setResumeFileName(file.name);
            } else {
              setJobDescription(data.text);
            }
          } else {
            throw new Error(data.error || 'Failed to extract document text');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      console.error(err);
      setUploadError('Failed to parse document. Please copy & paste the text directly.');
    } finally {
      setIsExtractingFile(false);
    }
  };

  const isReady = resumeText.trim().length > 30 && jobDescription.trim().length > 30;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Hero Welcome Banner */}
      <div className="bg-white border-2 border-black rounded p-6 shadow-[4px_4px_0px_#000] relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase font-bold bg-yellow-200 text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
              Step 1 of 4
            </span>
            <span className="font-mono text-xs text-gray-500 uppercase font-bold">
              Upload & Target JD
            </span>
          </div>
          <h2 className="font-sans font-bold text-2xl text-black uppercase tracking-tight">
            Upload Resume & Job Description
          </h2>
          <p className="font-mono text-xs text-gray-600 max-w-2xl mt-1 leading-relaxed">
            Upload your existing resume and paste the target Job Description (JD). Our AI engine will evaluate keyword matching, required qualifications, and generate truthful, ATS-optimized enhancements.
          </p>
        </div>
      </div>

      {/* Auth Banner for Unauthenticated Visitors */}
      {!user && (
        <div className="bg-amber-50 border-2 border-black rounded p-4 shadow-[3px_3px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-yellow-300 border border-black rounded font-mono shadow-[1px_1px_0px_#000] shrink-0 mt-0.5">
              <Lock className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-sans font-bold text-sm text-black uppercase tracking-tight flex items-center gap-2">
                <span>Account Sign In Required for ATS Evaluation</span>
                <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 rounded uppercase font-bold">Auth Required</span>
              </div>
              <p className="font-mono text-xs text-gray-700 mt-1 max-w-2xl">
                Please sign in to analyze your resume against job descriptions and access all AI evaluation features. New user? Create a free account to get started.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => openAuthModal('signin')}
              className="flex-1 md:flex-none px-4 py-2 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap active:translate-x-[1px] active:translate-y-[1px]"
            >
              <LogIn className="w-4 h-4 text-black" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="flex-1 md:flex-none px-4 py-2 bg-white hover:bg-gray-100 border-2 border-black rounded font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap active:translate-x-[1px] active:translate-y-[1px]"
            >
              <UserPlus className="w-4 h-4 text-black" />
              <span>Create Account</span>
            </button>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="p-4 bg-red-50 border-2 border-red-600 rounded text-red-800 text-xs font-mono flex items-center justify-between gap-2 shadow-[2px_2px_0px_#dc2626]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Dual Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RESUME INPUT COLUMN */}
        <div className="bg-white border-2 border-black rounded p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-black" />
              <h3 className="font-sans font-bold text-lg text-black uppercase tracking-tight">
                1. Candidate Resume
              </h3>
            </div>
            {resumeFileName && (
              <span className="font-mono text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                {resumeFileName}
              </span>
            )}
          </div>

          {/* File Upload Zone */}
          <div className="border-2 border-dashed border-gray-400 hover:border-black rounded p-4 bg-[#F8F9F3] text-center flex flex-col items-center justify-center gap-2 relative transition-colors">
            <Upload className="w-6 h-6 text-gray-600" />
            <div className="font-mono text-xs font-bold text-black">
              {isExtractingFile ? (
                <span className="flex items-center gap-2 justify-center text-amber-700">
                  <Loader2 className="w-4 h-4 animate-spin" /> Extracting document text...
                </span>
              ) : (
                'Upload PDF, DOCX, or TXT file'
              )}
            </div>
            <p className="font-mono text-[10px] text-gray-500">
              Drag & drop or click to browse resume document
            </p>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              onChange={(e) => handleFileUpload(e, 'resume')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Editable Resume Text Box */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-bold text-black uppercase">
                Resume Text (Parsed / Paste Directly)
              </label>
              {resumeText && (
                <button
                  onClick={() => { setResumeText(''); setResumeFileName(''); }}
                  className="font-mono text-[10px] text-red-600 hover:underline cursor-pointer"
                >
                  Clear Resume
                </button>
              )}
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here (Summary, Work Experience, Education, Technical Skills, Projects, Certifications)..."
              rows={12}
              className="w-full p-3 bg-white border border-black rounded font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-yellow-400 custom-scrollbar"
            />
            <span className="font-mono text-[10px] text-gray-500 text-right">
              {resumeText.length} characters
            </span>
          </div>
        </div>

        {/* JOB DESCRIPTION INPUT COLUMN */}
        <div className="bg-white border-2 border-black rounded p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-black" />
              <h3 className="font-sans font-bold text-lg text-black uppercase tracking-tight">
                2. Target Job Description (JD)
              </h3>
            </div>
            {jobDescription && (
              <span className="font-mono text-[11px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-700" />
                JD Loaded
              </span>
            )}
          </div>

          {/* JD File Upload Option */}
          <div className="border-2 border-dashed border-gray-400 hover:border-black rounded p-4 bg-[#F8F9F3] text-center flex flex-col items-center justify-center gap-2 relative transition-colors">
            <Upload className="w-6 h-6 text-gray-600" />
            <div className="font-mono text-xs font-bold text-black">
              Upload JD file (Optional)
            </div>
            <p className="font-mono text-[10px] text-gray-500">
              Upload PDF, DOCX, or paste JD text below
            </p>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              onChange={(e) => handleFileUpload(e, 'jd')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Editable JD Text Box */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-bold text-black uppercase">
                Job Description Text (Paste Full JD)
              </label>
              {jobDescription && (
                <button
                  onClick={() => setJobDescription('')}
                  className="font-mono text-[10px] text-red-600 hover:underline cursor-pointer"
                >
                  Clear JD
                </button>
              )}
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste complete Target Job Description here (Role summary, required skills, technical qualifications, responsibilities, preferred tools)..."
              rows={12}
              className="w-full p-3 bg-white border border-black rounded font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-yellow-400 custom-scrollbar"
            />
            <span className="font-mono text-[10px] text-gray-500 text-right">
              {jobDescription.length} characters
            </span>
          </div>
        </div>
      </div>

      {/* Primary CTA Area */}
      <div className="bg-white border-2 border-black rounded p-6 shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-4">
        {!user ? (
          <>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded border border-black font-mono font-bold bg-yellow-200 text-black shadow-[2px_2px_0px_#000]">
                SIGN IN
              </div>
              <div>
                <h4 className="font-sans font-bold text-base text-black uppercase">
                  Sign In Required to Analyze Resume
                </h4>
                <p className="font-mono text-xs text-gray-600">
                  {isReady
                    ? 'Resume & JD are ready! Please sign in to run the ATS evaluation, or create an account if you are new.'
                    : 'Please sign in or register to analyze resumes and access the ATS score optimizer.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => openAuthModal('signin')}
                className="w-full sm:w-auto px-6 py-3.5 rounded font-sans font-bold text-sm uppercase border-2 border-black bg-yellow-300 hover:bg-yellow-400 text-black shadow-[4px_4px_0px_#000] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap active:translate-x-[1px] active:translate-y-[1px]"
              >
                <LogIn className="w-4 h-4 text-black" />
                <span>Sign In to Analyze</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="w-full sm:w-auto px-6 py-3.5 rounded font-sans font-bold text-sm uppercase border-2 border-black bg-white hover:bg-gray-100 text-black shadow-[4px_4px_0px_#000] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap active:translate-x-[1px] active:translate-y-[1px]"
              >
                <UserPlus className="w-4 h-4 text-black" />
                <span>Create Free Account</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded border border-black font-mono font-bold ${isReady ? 'bg-emerald-300 text-black shadow-[2px_2px_0px_#000]' : 'bg-amber-100 text-amber-800'}`}>
                {isReady ? 'READY' : 'REQUIRED'}
              </div>
              <div>
                <h4 className="font-sans font-bold text-base text-black uppercase">
                  {isReady ? 'Both Resume & Job Description Ready' : 'Both Resume & Job Description Required'}
                </h4>
                <p className="font-mono text-xs text-gray-600">
                  {isReady
                    ? 'Click "Analyze Resume" to calculate estimated ATS compatibility and identify missing requirements.'
                    : 'Please make sure both candidate resume text and target JD text are provided above.'}
                </p>
              </div>
            </div>

            <button
              onClick={onAnalyze}
              disabled={!isReady || isAnalyzing}
              className={`px-8 py-3.5 rounded font-sans font-bold text-base uppercase border-2 border-black shadow-[4px_4px_0px_#000] transition-all flex items-center gap-3 cursor-pointer ${
                !isReady || isAnalyzing
                  ? 'bg-gray-200 text-gray-500 border-gray-400 shadow-none cursor-not-allowed'
                  : 'bg-yellow-300 hover:bg-yellow-400 text-black hover:-translate-y-0.5'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Resume against JD...</span>
                </>
              ) : (
                <>
                  <span>Analyze Resume</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
