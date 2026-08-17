import React, { useState, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { AtsScoreGauge } from './AtsScoreGauge';
import { ResumeKeywordInspector } from './ResumeKeywordInspector';
import {
  CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, Sparkles, Plus,
  Maximize2, RefreshCw, XCircle, Ban, BookOpen, Layers, Compass, Tag
} from 'lucide-react';

interface AnalysisViewProps {
  analysis: AnalysisResult;
  resumeText?: string;
  jobDescription?: string;
  onProceedToTemplate: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  analysis,
  resumeText,
  jobDescription,
  onProceedToTemplate
}) => {
  const [activeKeywordTab, setActiveKeywordTab] = useState<'add' | 'emphasize' | 'rephrase' | 'avoid' | 'doNotAdd'>('add');
  const [activeSection, setActiveSection] = useState<string>('section-score');

  const bd = analysis.originalBreakdown;

  const scoreCategories = [
    { label: 'JD Keyword Match', val: bd.keywordMatch },
    { label: 'Required Skills Match', val: bd.requiredSkillsMatch },
    { label: 'Technical Skills Match', val: bd.technicalSkillsMatch },
    { label: 'Qualifications Match', val: bd.qualificationsMatch },
    { label: 'Experience Relevance', val: bd.experienceRelevanceMatch },
    { label: 'Resume Structure', val: bd.resumeStructure },
    { label: 'ATS Parsing Compatibility', val: bd.atsParsingCompatibility },
    { label: 'Section Completeness', val: bd.sectionCompleteness },
    { label: 'Keyword Placement', val: bd.keywordPlacement },
    { label: 'Overall JD Relevance', val: bd.overallJdRelevance },
  ];

  const sections = [
    { id: 'section-score', label: '1. Score Breakdown', icon: Layers },
    { id: 'section-inspector', label: '2. Resume Keyword Inspector', icon: Sparkles },
    { id: 'section-missing', label: '3. Missing Requirements', icon: AlertTriangle },
    { id: 'section-keywords', label: '4. Keyword Strategy', icon: Tag },
    { id: 'section-recommendations', label: '5. Bullet Improvements', icon: BookOpen },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sections[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-black rounded p-6 shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase font-bold bg-yellow-200 text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
              Step 2 of 4
            </span>
            <span className="font-mono text-xs text-gray-500 uppercase font-bold">
              ATS Evaluation Dashboard
            </span>
          </div>
          <h2 className="font-sans font-bold text-2xl text-black uppercase tracking-tight">
            Resume Analysis vs {analysis.targetRole}
          </h2>
          <p className="font-mono text-xs text-gray-600 max-w-xl mt-1">
            Target Employer: <span className="font-bold text-black">{analysis.companyName}</span>
          </p>
        </div>

        <button
          onClick={onProceedToTemplate}
          className="px-6 py-3 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-sans font-bold text-sm uppercase text-black shadow-[3px_3px_0px_#000] transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span>Select Template & Generate Resume</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* STICKY SCROLLSPY NAVIGATION BAR */}
      <div className="sticky top-2 z-30 bg-[#F8F9F3]/95 backdrop-blur-md border-2 border-black rounded p-2 shadow-[4px_4px_0px_#000] flex items-center justify-between overflow-x-auto custom-scrollbar gap-2">
        <div className="flex items-center gap-2 min-w-max">
          <div className="flex items-center gap-1 text-black font-mono text-xs font-bold uppercase px-2 py-1 bg-yellow-200 border border-black rounded shadow-[1px_1px_0px_#000]">
            <Compass className="w-3.5 h-3.5 text-black" />
            <span>Navigation:</span>
          </div>
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-black'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-gray-500'}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
        <div className="hidden lg:flex items-center gap-2 pr-2 font-mono text-[11px] text-gray-600 font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Scrollspy Active</span>
        </div>
      </div>

      {/* 1. CURRENT ATS SCORE & BREAKDOWN */}
      <div id="section-score" className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-28">
        {/* Main Gauge */}
        <div className="lg:col-span-1">
          <AtsScoreGauge
            score={analysis.originalScore}
            label="Current ATS Match Score"
            size="lg"
          />
        </div>

        {/* Breakdown Categories Grid */}
        <div className="lg:col-span-2 bg-white border-2 border-black rounded p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
            <h3 className="font-sans font-bold text-base text-black uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4" />
              ATS Score Category Breakdown
            </h3>
            <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">
              10 Criteria Evaluated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scoreCategories.map((cat, idx) => (
              <div key={idx} className="p-2.5 bg-[#F8F9F3] border border-black rounded flex flex-col gap-1">
                <div className="flex justify-between items-center font-mono text-xs font-bold text-black">
                  <span>{cat.label}</span>
                  <span className={cat.val >= 80 ? 'text-emerald-700' : cat.val >= 65 ? 'text-amber-700' : 'text-rose-700'}>
                    {cat.val}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded overflow-hidden border border-black">
                  <div
                    className={`h-full transition-all duration-500 ${
                      cat.val >= 80 ? 'bg-emerald-500' : cat.val >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${cat.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="font-mono text-[11px] text-gray-600 bg-yellow-50 p-3 rounded border border-black mt-4">
            <span className="font-bold">Score Assessment:</span> {analysis.scoreExplanation}
          </p>
        </div>
      </div>

      {/* 2. RESUME TEXT & KEYWORD HIGHLIGHTING INSPECTOR */}
      <div id="section-inspector" className="scroll-mt-28">
        <ResumeKeywordInspector
          analysis={analysis}
          resumeText={resumeText}
          jobDescription={jobDescription}
        />
      </div>

      {/* 3. MISSING REQUIREMENTS SECTION */}
      <div id="section-missing" className="bg-white border-2 border-black rounded p-6 shadow-[4px_4px_0px_#000] flex flex-col gap-5 scroll-mt-28">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div>
            <h3 className="font-sans font-bold text-lg text-black uppercase tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Missing Requirements & Gaps
            </h3>
            <p className="font-mono text-xs text-gray-600 mt-0.5">
              Requirements extracted from target JD that are missing or omitted in your current resume text.
            </p>
          </div>
          <span className="font-mono text-xs bg-amber-100 text-amber-900 border border-amber-700 font-bold px-2.5 py-1 rounded shadow-[1px_1px_0px_#000]">
            Truth-Preserving Rule
          </span>
        </div>

        {/* Missing Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#F8F9F3] border-2 border-black rounded flex flex-col gap-3">
            <h4 className="font-mono text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5 border-b border-black pb-2">
              <BookOpen className="w-4 h-4 text-amber-700" />
              Missing Skills from JD
            </h4>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
              {analysis.missingRequirements.skills?.length === 0 ? (
                <p className="font-mono text-xs text-emerald-700">No critical skills missing!</p>
              ) : (
                analysis.missingRequirements.skills?.map((item, i) => (
                  <div key={i} className="p-2.5 bg-white border border-black rounded text-xs font-mono flex flex-col gap-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-black">{item.item}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border border-black uppercase ${
                        item.status === 'not_possessed' ? 'bg-rose-100 text-rose-800' : 'bg-yellow-100 text-yellow-900'
                      }`}>
                        {item.status === 'not_possessed' ? 'Not Possessed' : 'Omitted from Resume'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-snug">
                      <span className="font-bold text-black">Recommendation:</span> {item.recommendation}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-[#F8F9F3] border-2 border-black rounded flex flex-col gap-3">
            <h4 className="font-mono text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5 border-b border-black pb-2">
              <Sparkles className="w-4 h-4 text-blue-700" />
              Missing JD Keywords & Qualifications
            </h4>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
              {analysis.missingRequirements.keywords?.map((kw, i) => (
                <div key={i} className="p-2.5 bg-white border border-black rounded text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black">{kw.word}</span>
                    <span className="text-[10px] text-gray-500">({kw.context})</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-black ${
                    kw.importance === 'high' ? 'bg-rose-200 text-rose-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {kw.importance} Priority
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded border border-black text-xs font-mono text-amber-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong className="text-black uppercase">Anti-Fabrication Notice:</strong> If you do not possess a required skill, our AI recommends learning it rather than adding false claims to your resume.
          </span>
        </div>
      </div>

      {/* 3. KEYWORD ANALYSIS CATEGORIZATION */}
      <div id="section-keywords" className="bg-white border-2 border-black rounded p-6 shadow-[4px_4px_0px_#000] flex flex-col gap-5 scroll-mt-28">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div>
            <h3 className="font-sans font-bold text-lg text-black uppercase tracking-tight">
              Keyword Optimization Strategy
            </h3>
            <p className="font-mono text-xs text-gray-600 mt-0.5">
              Categorized recommendations on how to handle JD keywords accurately.
            </p>
          </div>
        </div>

        {/* Tabs for Keyword Categories */}
        <div className="flex flex-wrap gap-2 border-b-2 border-black pb-3">
          <button
            onClick={() => setActiveKeywordTab('add')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeKeywordTab === 'add' ? 'bg-emerald-300 text-black shadow-[2px_2px_0px_#000]' : 'bg-white hover:bg-gray-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-800" />
            Add ({analysis.keywords.add?.length || 0})
          </button>

          <button
            onClick={() => setActiveKeywordTab('emphasize')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeKeywordTab === 'emphasize' ? 'bg-amber-300 text-black shadow-[2px_2px_0px_#000]' : 'bg-white hover:bg-gray-100'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-800" />
            Emphasize ({analysis.keywords.emphasize?.length || 0})
          </button>

          <button
            onClick={() => setActiveKeywordTab('rephrase')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeKeywordTab === 'rephrase' ? 'bg-blue-300 text-black shadow-[2px_2px_0px_#000]' : 'bg-white hover:bg-gray-100'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-800" />
            Rephrase ({analysis.keywords.rephrase?.length || 0})
          </button>

          <button
            onClick={() => setActiveKeywordTab('avoid')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeKeywordTab === 'avoid' ? 'bg-rose-300 text-black shadow-[2px_2px_0px_#000]' : 'bg-white hover:bg-gray-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-800" />
            Avoid ({analysis.keywords.avoid?.length || 0})
          </button>

          <button
            onClick={() => setActiveKeywordTab('doNotAdd')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeKeywordTab === 'doNotAdd' ? 'bg-gray-300 text-black shadow-[2px_2px_0px_#000]' : 'bg-white hover:bg-gray-100'
            }`}
          >
            <Ban className="w-3.5 h-3.5 text-gray-800" />
            Do Not Add ({analysis.keywords.doNotAdd?.length || 0})
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-[#F8F9F3] p-4 border-2 border-black rounded min-h-48">
          {activeKeywordTab === 'add' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              {analysis.keywords.add?.map((item, i) => (
                <div key={i} className="p-3 bg-white border border-black rounded flex flex-col gap-1">
                  <span className="font-bold text-emerald-800 uppercase flex items-center gap-1">
                    + {item.keyword}
                  </span>
                  <span className="text-gray-600 text-[11px]">{item.context}</span>
                </div>
              ))}
            </div>
          )}

          {activeKeywordTab === 'emphasize' && (
            <div className="flex flex-col gap-3 font-mono text-xs">
              {analysis.keywords.emphasize?.map((item, i) => (
                <div key={i} className="p-3 bg-white border border-black rounded flex flex-col gap-1">
                  <span className="font-bold text-amber-800 uppercase">{item.keyword}</span>
                  <div className="text-gray-600 text-[11px]">
                    <strong>Current usage:</strong> {item.currentUsage}
                  </div>
                  <div className="text-gray-900 text-[11px]">
                    <strong>Action:</strong> {item.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeKeywordTab === 'rephrase' && (
            <div className="flex flex-col gap-3 font-mono text-xs">
              {analysis.keywords.rephrase?.map((item, i) => (
                <div key={i} className="p-3 bg-white border border-black rounded flex flex-col gap-2">
                  <span className="font-bold text-blue-800 uppercase">Target Keyword: {item.keyword}</span>
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-red-900 text-[11px]">
                    <strong>Original:</strong> {item.originalPhrase}
                  </div>
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px]">
                    <strong>Suggested:</strong> {item.suggestedPhrase}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeKeywordTab === 'avoid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              {analysis.keywords.avoid?.map((item, i) => (
                <div key={i} className="p-3 bg-white border border-black rounded flex flex-col gap-1">
                  <span className="font-bold text-rose-800 uppercase">✕ {item.keyword}</span>
                  <span className="text-gray-600 text-[11px]">{item.reason}</span>
                </div>
              ))}
            </div>
          )}

          {activeKeywordTab === 'doNotAdd' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              {analysis.keywords.doNotAdd?.map((item, i) => (
                <div key={i} className="p-3 bg-white border border-black rounded flex flex-col gap-1">
                  <span className="font-bold text-gray-800 uppercase">🚫 {item.keyword}</span>
                  <span className="text-gray-600 text-[11px]">{item.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. ACTIONABLE RESUME RECOMMENDATIONS */}
      <div id="section-recommendations" className="bg-white border-2 border-black rounded p-6 shadow-[4px_4px_0px_#000] flex flex-col gap-5 scroll-mt-28">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div>
            <h3 className="font-sans font-bold text-lg text-black uppercase tracking-tight">
              Actionable Bullet Improvements
            </h3>
            <p className="font-mono text-xs text-gray-600 mt-0.5">
              Specific before-and-after suggestions mapped to target JD terminology.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {analysis.recommendations?.map((rec, i) => (
            <div key={i} className="p-4 bg-[#F8F9F3] border-2 border-black rounded flex flex-col gap-3 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-between border-b border-black pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase bg-black text-white px-2 py-0.5 rounded">
                    {rec.section}
                  </span>
                  <span className="font-mono text-xs font-bold text-black">
                    Addressing: {rec.jdRequirementAddressed}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-600 px-2 py-0.5 rounded">
                  {rec.expectedImpact}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-red-50 border border-red-300 rounded flex flex-col gap-1">
                  <span className="font-bold text-red-800 uppercase text-[10px]">Current Text:</span>
                  <p className="text-gray-800 leading-relaxed">{rec.currentText}</p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded flex flex-col gap-1">
                  <span className="font-bold text-emerald-800 uppercase text-[10px]">Recommended Enhancement:</span>
                  <p className="text-gray-900 font-bold leading-relaxed">{rec.recommendedText}</p>
                </div>
              </div>

              <div className="font-mono text-[11px] text-gray-600 bg-white p-2.5 border border-black rounded flex items-center justify-between">
                <span><strong>Reasoning:</strong> {rec.reason}</span>
                <span className="font-bold text-blue-800 shrink-0">Keyword: {rec.keywordImproved}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-2 border-black rounded p-6 shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-sans font-bold text-base text-black uppercase">
            Ready to Select ATS Template & Generate Resume?
          </h4>
          <p className="font-mono text-xs text-gray-600">
            Choose from 4 role-optimized ATS templates and generate a tailored 1-page resume.
          </p>
        </div>

        <button
          onClick={onProceedToTemplate}
          className="px-8 py-3.5 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-sans font-bold text-base uppercase text-black shadow-[4px_4px_0px_#000] transition-all flex items-center gap-3 cursor-pointer"
        >
          <span>Choose Template & Optimize</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
