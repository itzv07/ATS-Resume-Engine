import React, { useState, useMemo } from 'react';
import { AnalysisResult } from '../types';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Search,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Eye,
  Tag,
  Copy,
  Check,
  Zap,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ResumeKeywordInspectorProps {
  analysis: AnalysisResult;
  resumeText?: string;
  jobDescription?: string;
}

interface HighlightTerm {
  word: string;
  type: 'matched' | 'missing' | 'emphasize' | 'avoid';
  importance: 'high' | 'medium' | 'low';
  context?: string;
  recommendation?: string;
  category?: string;
}

export const ResumeKeywordInspector: React.FC<ResumeKeywordInspectorProps> = ({
  analysis,
  resumeText = '',
  jobDescription = ''
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'missing' | 'matched' | 'high_priority'>('missing');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<HighlightTerm | null>(null);
  const [viewMode, setViewMode] = useState<'annotated' | 'raw' | 'matrix'>('annotated');
  const [copied, setCopied] = useState(false);

  // Fallback text if user input is brief or missing
  const effectiveResumeText = useMemo(() => {
    if (resumeText && resumeText.trim().length > 20) {
      return resumeText;
    }
    // Generate readable text from extracted profile if resumeText wasn't passed directly
    const info = analysis.extractedCandidateInfo;
    if (info) {
      const parts: string[] = [];
      if (info.personal?.fullName) parts.push(`NAME: ${info.personal.fullName}`);
      if (info.personal?.summary) parts.push(`\nPROFESSIONAL SUMMARY:\n${info.personal.summary}`);
      if (info.skills && info.skills.length > 0) {
        parts.push(`\nTECHNICAL SKILLS:\n` + info.skills.map(s => `${s.categoryName}: ${s.skills.join(', ')}`).join('\n'));
      }
      if (info.experience && info.experience.length > 0) {
        parts.push(`\nEXPERIENCE:\n` + info.experience.map(e => `${e.jobTitle} at ${e.company} (${e.employmentDates})\n` + (e.responsibilities?.map(r => `• ${r}`).join('\n') || '')).join('\n\n'));
      }
      if (info.projects && info.projects.length > 0) {
        parts.push(`\nPROJECTS:\n` + info.projects.map(p => `${p.projectName}: ${p.description}\nTechnologies: ${p.technologies}\n` + (p.responsibilities?.map(r => `• ${r}`).join('\n') || '')).join('\n\n'));
      }
      if (info.education && info.education.length > 0) {
        parts.push(`\nEDUCATION:\n` + info.education.map(ed => `${ed.degree}, ${ed.institution} (${ed.graduationYear})`).join('\n'));
      }
      return parts.join('\n');
    }
    return 'Candidate Resume Text not available. Please ensure a resume is uploaded.';
  }, [resumeText, analysis]);

  // Extract and categorize all terms
  const { allTerms, missingTerms, matchedTerms, highPriorityMissing } = useMemo(() => {
    const termMap = new Map<string, HighlightTerm>();

    // 1. Missing keywords from JD
    if (analysis.missingRequirements?.keywords) {
      analysis.missingRequirements.keywords.forEach(kw => {
        const key = kw.word.trim().toLowerCase();
        if (!key) return;
        termMap.set(key, {
          word: kw.word,
          type: 'missing',
          importance: kw.importance || 'medium',
          context: kw.context || 'Specified as a core qualification in the target Job Description.',
          recommendation: `Add '${kw.word}' to your Skills section or work experience bullets if you have experience with it.`,
          category: 'JD Missing Keyword'
        });
      });
    }

    // 2. Missing skills from JD
    if (analysis.missingRequirements?.skills) {
      analysis.missingRequirements.skills.forEach(sk => {
        const key = sk.item.trim().toLowerCase();
        if (!key) return;
        termMap.set(key, {
          word: sk.item,
          type: 'missing',
          importance: 'high',
          context: `Target JD requirement (${sk.status === 'not_possessed' ? 'Not possessed' : 'Omitted from resume text'})`,
          recommendation: sk.recommendation || `Include '${sk.item}' in Technical Skills or relevant project bullets.`,
          category: 'JD Missing Skill'
        });
      });
    }

    // 3. Keywords to add
    if (analysis.keywords?.add) {
      analysis.keywords.add.forEach(item => {
        const key = item.keyword.trim().toLowerCase();
        if (!key) return;
        if (!termMap.has(key)) {
          termMap.set(key, {
            word: item.keyword,
            type: 'missing',
            importance: 'high',
            context: item.context || 'High-value keyword for ATS search indexing',
            recommendation: `Incorporate '${item.keyword}' naturally into work experience or skills.`,
            category: 'Recommended Addition'
          });
        }
      });
    }

    // 4. Keywords to emphasize
    if (analysis.keywords?.emphasize) {
      analysis.keywords.emphasize.forEach(item => {
        const key = item.keyword.trim().toLowerCase();
        if (!key) return;
        termMap.set(key, {
          word: item.keyword,
          type: 'emphasize',
          importance: 'medium',
          context: item.currentUsage || 'Present in resume but under-emphasized',
          recommendation: item.recommendation || `Emphasize impact and metrics using '${item.keyword}'.`,
          category: 'Emphasize Term'
        });
      });
    }

    // 5. Detect matched keywords in the resume text
    // Scan candidate profile skills and text against JD keywords
    const lowerResume = effectiveResumeText.toLowerCase();
    const candidateSkills: string[] = [];
    if (analysis.extractedCandidateInfo?.skills) {
      analysis.extractedCandidateInfo.skills.forEach(cat => {
        cat.skills?.forEach(s => candidateSkills.push(s.trim()));
      });
    }

    candidateSkills.forEach(skill => {
      const key = skill.toLowerCase();
      if (key && !termMap.has(key) && lowerResume.includes(key)) {
        termMap.set(key, {
          word: skill,
          type: 'matched',
          importance: 'medium',
          context: 'Found present in your resume text & skills inventory.',
          recommendation: 'Good match! Ensure it aligns with JD phrasing.',
          category: 'Matched Candidate Skill'
        });
      }
    });

    const list = Array.from(termMap.values());
    const missing = list.filter(t => t.type === 'missing');
    const matched = list.filter(t => t.type === 'matched' || t.type === 'emphasize');
    const highPri = missing.filter(t => t.importance === 'high');

    return {
      allTerms: list,
      missingTerms: missing,
      matchedTerms: matched,
      highPriorityMissing: highPri
    };
  }, [analysis, effectiveResumeText]);

  // Filtered term list for chips
  const displayTerms = useMemo(() => {
    return allTerms.filter(term => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!term.word.toLowerCase().includes(q) && !term.context?.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedFilter === 'missing') return term.type === 'missing';
      if (selectedFilter === 'matched') return term.type === 'matched' || term.type === 'emphasize';
      if (selectedFilter === 'high_priority') return term.type === 'missing' && term.importance === 'high';
      return true;
    });
  }, [allTerms, selectedFilter, searchQuery]);

  // Break text into paragraphs/snippets for annotated view
  const paragraphs = useMemo(() => {
    return effectiveResumeText
      .split(/\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }, [effectiveResumeText]);

  // Copy snippet
  const handleCopy = () => {
    navigator.clipboard.writeText(effectiveResumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to render inline highlighted text
  const renderHighlightedSnippet = (text: string) => {
    if (!text) return null;

    // Build regex of terms to highlight
    const termsToHighlight = allTerms.filter(t => {
      if (selectedFilter === 'missing') return true; // Show contextual matching + gaps
      if (selectedFilter === 'matched') return t.type === 'matched' || t.type === 'emphasize';
      if (selectedFilter === 'high_priority') return t.importance === 'high';
      return true;
    });

    if (termsToHighlight.length === 0) return <span>{text}</span>;

    // Escape regex characters
    const escapedWords = termsToHighlight
      .map(t => t.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .filter(w => w.length > 1)
      .sort((a, b) => b.length - a.length);

    if (escapedWords.length === 0) return <span>{text}</span>;

    const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      const matchTerm = termsToHighlight.find(t => t.word.toLowerCase() === part.toLowerCase());
      if (matchTerm) {
        const isMatched = matchTerm.type === 'matched';
        const isEmphasize = matchTerm.type === 'emphasize';
        const isSelected = selectedTerm?.word.toLowerCase() === matchTerm.word.toLowerCase();

        return (
          <mark
            key={idx}
            onClick={() => setSelectedTerm(matchTerm)}
            className={`inline-block px-1.5 py-0.5 rounded text-xs font-mono font-bold cursor-pointer transition-all mx-0.5 ${
              isSelected
                ? 'ring-2 ring-black scale-105 shadow-[2px_2px_0px_#000]'
                : ''
            } ${
              isMatched
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-500 hover:bg-emerald-200'
                : isEmphasize
                ? 'bg-amber-100 text-amber-900 border border-amber-500 hover:bg-amber-200'
                : 'bg-rose-100 text-rose-900 border border-rose-500 hover:bg-rose-200'
            }`}
            title={`Keyword: ${matchTerm.word} (${matchTerm.category || 'Term'}) - Click for details`}
          >
            {part}
          </mark>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // Identify section type for smart missing term callouts
  const getSectionMissingSuggestions = (paragraph: string) => {
    const lower = paragraph.toLowerCase();
    if (lower.startsWith('technical skills') || lower.startsWith('skills') || lower.includes('skills:')) {
      return missingTerms.slice(0, 4);
    }
    if (lower.startsWith('experience') || lower.startsWith('work experience') || lower.includes('developer') || lower.includes('engineer')) {
      return highPriorityMissing.slice(0, 3);
    }
    if (lower.startsWith('professional summary') || lower.startsWith('summary')) {
      return missingTerms.filter(t => t.importance === 'high').slice(0, 2);
    }
    return [];
  };

  return (
    <div className="bg-white border-2 border-black rounded p-5 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col gap-6">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase font-bold bg-yellow-200 text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
              Keyword Inspector
            </span>
            <span className="font-mono text-xs text-emerald-700 uppercase font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Precision JD Grounding
            </span>
          </div>
          <h3 className="font-sans font-bold text-xl text-black uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            Resume Text & Missing JD Keyword Highlighting
          </h3>
          <p className="font-mono text-xs text-gray-600 max-w-2xl mt-0.5">
            Visually inspect where target job description keywords appear in your resume, and pinpoint missing requirements for ATS optimization.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#F8F9F3] border-2 border-black rounded p-1 shadow-[2px_2px_0px_#000]">
          <button
            onClick={() => setViewMode('annotated')}
            className={`px-3 py-1 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'annotated'
                ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Annotated Snippets
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Missing Gap Matrix
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'raw'
                ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Raw View
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 bg-[#F8F9F3] border-2 border-black rounded shadow-[2px_2px_0px_#000]">
          <span className="text-gray-500 uppercase text-[10px] font-bold block">JD Keywords Analyzed</span>
          <span className="text-2xl font-bold text-black">{allTerms.length}</span>
          <span className="text-[10px] text-gray-600 block mt-0.5">Extracted from target role</span>
        </div>

        <div className="p-3 bg-emerald-50 border-2 border-black rounded shadow-[2px_2px_0px_#000]">
          <span className="text-emerald-800 uppercase text-[10px] font-bold block">Matched In Resume</span>
          <span className="text-2xl font-bold text-emerald-700">{matchedTerms.length}</span>
          <span className="text-[10px] text-emerald-800 block mt-0.5">Found in candidate text</span>
        </div>

        <div className="p-3 bg-rose-50 border-2 border-black rounded shadow-[2px_2px_0px_#000]">
          <span className="text-rose-800 uppercase text-[10px] font-bold block">Missing from Resume</span>
          <span className="text-2xl font-bold text-rose-700">{missingTerms.length}</span>
          <span className="text-[10px] text-rose-800 block mt-0.5">Not detected in profile</span>
        </div>

        <div className="p-3 bg-amber-50 border-2 border-black rounded shadow-[2px_2px_0px_#000]">
          <span className="text-amber-800 uppercase text-[10px] font-bold block">High Priority Gaps</span>
          <span className="text-2xl font-bold text-amber-800">{highPriorityMissing.length}</span>
          <span className="text-[10px] text-amber-800 block mt-0.5">Immediate ATS score impact</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F8F9F3] p-3 border-2 border-black rounded shadow-[2px_2px_0px_#000]">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedFilter('missing')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'missing'
                ? 'bg-rose-300 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-800" />
            <span>Missing from JD ({missingTerms.length})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('high_priority')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'high_priority'
                ? 'bg-amber-300 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-800" />
            <span>High Priority ({highPriorityMissing.length})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('matched')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'matched'
                ? 'bg-emerald-300 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
            <span>Matched Terms ({matchedTerms.length})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All ({allTerms.length})
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keyword..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-black rounded text-xs font-mono text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* Interactive Keyword Chips Tray */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-700" />
            Target Keywords (Click chip for details & placement tips):
          </span>
          <span className="font-mono text-[11px] text-gray-500">
            Showing {displayTerms.length} of {allTerms.length} keywords
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-2 bg-[#F8F9F3] border border-black rounded">
          {displayTerms.map((term, idx) => {
            const isSelected = selectedTerm?.word.toLowerCase() === term.word.toLowerCase();
            const isMissing = term.type === 'missing';
            const isHigh = term.importance === 'high';

            return (
              <button
                key={idx}
                onClick={() => setSelectedTerm(term)}
                className={`px-2.5 py-1 rounded font-mono text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-black ring-2 ring-black scale-105 shadow-[2px_2px_0px_#000]'
                    : 'border-gray-400'
                } ${
                  isMissing
                    ? isHigh
                      ? 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-rose-600'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-600'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-emerald-600'
                }`}
              >
                <span>{isMissing ? '✕' : '✓'}</span>
                <span>{term.word}</span>
                {isHigh && (
                  <span className="text-[9px] uppercase px-1 py-0.2 bg-black text-white rounded">
                    High
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Term Detail Inspector Popover Card */}
      {selectedTerm && (
        <div className="p-4 bg-yellow-50 border-2 border-black rounded shadow-[3px_3px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-black uppercase bg-yellow-300 border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                {selectedTerm.word}
              </span>
              <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-black ${
                selectedTerm.type === 'missing' ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {selectedTerm.type === 'missing' ? 'Missing from Resume' : 'Found in Resume'}
              </span>
              <span className="font-mono text-[10px] bg-white border border-black px-1.5 py-0.5 rounded text-gray-700">
                Priority: {selectedTerm.importance.toUpperCase()}
              </span>
            </div>
            <p className="font-mono text-xs text-gray-700 mt-1">
              <strong>JD Requirement Context:</strong> {selectedTerm.context}
            </p>
            <p className="font-mono text-xs text-black font-medium">
              <strong>Actionable Suggestion:</strong> {selectedTerm.recommendation}
            </p>
          </div>

          <button
            onClick={() => setSelectedTerm(null)}
            className="px-3 py-1 bg-white hover:bg-gray-100 border border-black rounded font-mono text-xs font-bold text-gray-700 cursor-pointer self-start sm:self-center shrink-0"
          >
            Close Detail
          </button>
        </div>
      )}

      {/* MAIN VIEW MODE 1: ANNOTATED RESUME SNIPPETS WITH MISSING KEYWORD CALLOUTS */}
      {viewMode === 'annotated' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-black" />
              Uploaded Resume Snippet with Live Keyword Highlights & Missing Gap Slots:
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-white hover:bg-gray-100 border border-black rounded font-mono text-xs font-bold text-gray-800 shadow-[1px_1px_0px_#000] cursor-pointer flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 font-mono text-xs bg-[#F8F9F3] p-4 sm:p-5 border-2 border-black rounded shadow-[2px_2px_0px_#000] max-h-[500px] overflow-y-auto custom-scrollbar">
            {paragraphs.map((p, idx) => {
              const missingForSection = getSectionMissingSuggestions(p);
              const isHeading = p.length < 50 && (p === p.toUpperCase() || p.endsWith(':'));

              return (
                <div key={idx} className="flex flex-col gap-1.5 group">
                  <div className="flex items-start gap-3">
                    <span className="text-[10px] text-gray-400 font-mono select-none w-6 text-right shrink-0 pt-0.5">
                      {idx + 1}
                    </span>
                    <div className={`flex-1 leading-relaxed ${isHeading ? 'font-bold text-black text-sm uppercase border-b border-black pb-1 pt-2' : 'text-gray-800'}`}>
                      {renderHighlightedSnippet(p)}
                    </div>
                  </div>

                  {/* Visual Missing Keyword Callout for Relevant Resume Section */}
                  {missingForSection.length > 0 && selectedFilter !== 'matched' && (
                    <div className="ml-9 my-1.5 p-3 bg-rose-50/90 border-2 border-dashed border-rose-400 rounded flex flex-col gap-2 shadow-[1px_1px_0px_#f43f5e]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900 uppercase text-[10px] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Missing JD Keywords for this section:
                        </span>
                        <span className="text-[9px] bg-rose-200 text-rose-950 font-bold px-1.5 py-0.5 rounded border border-rose-500">
                          Recommended Insertion Spot
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {missingForSection.map((mk, mkIdx) => (
                          <button
                            key={mkIdx}
                            onClick={() => setSelectedTerm(mk)}
                            className="px-2 py-0.5 bg-white hover:bg-rose-100 border border-rose-500 rounded text-[11px] font-bold text-rose-900 cursor-pointer flex items-center gap-1 shadow-[1px_1px_0px_#000]"
                          >
                            <span>+ Missing: {mk.word}</span>
                            <span className="text-[8px] bg-rose-600 text-white px-1 rounded uppercase">
                              {mk.importance}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN VIEW MODE 2: MISSING GAP MATRIX */}
      {viewMode === 'matrix' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-black" />
              JD Missing Requirements & Recommended Section Placements
            </span>
          </div>

          <div className="overflow-x-auto border-2 border-black rounded shadow-[2px_2px_0px_#000]">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F9F3] border-b-2 border-black text-black uppercase font-bold">
                  <th className="p-3 border-r border-black">Missing JD Term</th>
                  <th className="p-3 border-r border-black w-28 text-center">Priority</th>
                  <th className="p-3 border-r border-black">Target JD Context</th>
                  <th className="p-3">Suggested Placement Action</th>
                </tr>
              </thead>
              <tbody>
                {missingTerms.map((term, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedTerm(term)}
                    className="border-b border-gray-300 hover:bg-yellow-50/60 cursor-pointer transition-colors"
                  >
                    <td className="p-3 border-r border-black font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      {term.word}
                    </td>
                    <td className="p-3 border-r border-black text-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-black ${
                        term.importance === 'high' ? 'bg-rose-200 text-rose-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {term.importance}
                      </span>
                    </td>
                    <td className="p-3 border-r border-black text-gray-700 text-[11px]">
                      {term.context}
                    </td>
                    <td className="p-3 text-black font-medium text-[11px]">
                      {term.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MAIN VIEW MODE 3: RAW VIEW */}
      {viewMode === 'raw' && (
        <div className="p-4 bg-slate-900 text-slate-100 rounded border-2 border-black font-mono text-xs max-h-[400px] overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed">
          {effectiveResumeText}
        </div>
      )}

      {/* Bottom Guideline Notice */}
      <div className="bg-amber-50 p-3 rounded border border-black text-xs font-mono text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong className="text-black uppercase">ATS Optimization Tip:</strong> Adding missing keywords from the job description can boost your ATS Match score by 15-25 points. Ensure all skills added represent truthful capabilities.
          </span>
        </div>
      </div>
    </div>
  );
};
