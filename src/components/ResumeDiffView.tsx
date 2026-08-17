import React from 'react';
import { OptimizedResume } from '../types';
import { TrendingUp, CheckCircle2, ArrowRight, Sparkles, Layers, RefreshCw } from 'lucide-react';

interface ResumeDiffViewProps {
  optimizedResume: OptimizedResume;
  onProceedToPreview: () => void;
}

export const ResumeDiffView: React.FC<ResumeDiffViewProps> = ({ optimizedResume, onProceedToPreview }) => {
  const b = optimizedResume.beforeBreakdown;
  const a = optimizedResume.afterBreakdown;

  const comparisonRows = [
    { label: 'Overall ATS Score', before: b.overallScore, after: a.overallScore },
    { label: 'JD Keyword Match', before: b.keywordMatch, after: a.keywordMatch },
    { label: 'Required Skills Match', before: b.requiredSkillsMatch, after: a.requiredSkillsMatch },
    { label: 'Technical Skills Match', before: b.technicalSkillsMatch, after: a.technicalSkillsMatch },
    { label: 'Qualifications Match', before: b.qualificationsMatch, after: a.qualificationsMatch },
    { label: 'Experience Relevance', before: b.experienceRelevanceMatch, after: a.experienceRelevanceMatch },
    { label: 'Resume Structure', before: b.resumeStructure, after: a.resumeStructure },
    { label: 'ATS Parsing Compatibility', before: b.atsParsingCompatibility, after: a.atsParsingCompatibility },
    { label: 'Section Completeness', before: b.sectionCompleteness, after: a.sectionCompleteness },
    { label: 'Keyword Placement', before: b.keywordPlacement, after: a.keywordPlacement },
    { label: 'Overall JD Relevance', before: b.overallJdRelevance, after: a.overallJdRelevance },
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col gap-6 sm:gap-8">
      {/* Top Banner Card */}
      <div className="bg-white border-2 border-black rounded p-4 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase font-bold bg-yellow-200 text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
              Score Comparison
            </span>
            <span className="font-mono text-[10px] sm:text-xs text-gray-500 uppercase font-bold">
              Before vs After ATS Optimization
            </span>
          </div>
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-black uppercase tracking-tight">
            ATS Compatibility Score Improvement
          </h2>
          <p className="font-mono text-xs text-gray-600 max-w-xl mt-1">
            Clearly showing how keyword alignment, bullet rephrasing, and JD relevance boosted your estimated ATS compatibility.
          </p>
        </div>

        <button
          onClick={onProceedToPreview}
          className="w-full md:w-auto px-5 py-3 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-sans font-bold text-xs sm:text-sm uppercase text-black shadow-[3px_3px_0px_#000] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span>View Final 1-Page Resume</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {/* BEFORE VS AFTER SCORE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* BEFORE CARD */}
        <div className="bg-white border-2 border-black rounded p-4 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center text-center">
          <span className="font-mono text-xs uppercase font-bold text-gray-500 mb-1">
            Original Resume Score
          </span>
          <div className="font-mono font-extrabold text-4xl sm:text-5xl text-gray-700 my-1 sm:my-2">
            {optimizedResume.beforeScore}
            <span className="text-lg sm:text-xl text-gray-400 font-normal">/100</span>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold bg-gray-100 text-gray-700 border border-black px-2.5 py-0.5 rounded">
            Before Optimization
          </span>
        </div>

        {/* AFTER CARD */}
        <div className="bg-emerald-50 border-2 border-black rounded p-4 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center text-center">
          <span className="font-mono text-xs uppercase font-bold text-emerald-900 mb-1">
            Optimized Resume Score
          </span>
          <div className="font-mono font-extrabold text-4xl sm:text-5xl text-emerald-700 my-1 sm:my-2">
            {optimizedResume.afterScore}
            <span className="text-lg sm:text-xl text-emerald-500 font-normal">/100</span>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold bg-emerald-600 text-white border border-black px-2.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
            After Optimization
          </span>
        </div>

        {/* IMPROVEMENT CARD */}
        <div className="bg-yellow-100 border-2 border-black rounded p-4 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center text-center">
          <span className="font-mono text-xs uppercase font-bold text-amber-900 mb-1 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-amber-700 shrink-0" /> Score Boost
          </span>
          <div className="font-mono font-extrabold text-4xl sm:text-5xl text-amber-800 my-1 sm:my-2">
            +{optimizedResume.scoreImprovement}
            <span className="text-lg sm:text-xl text-amber-700 font-normal"> pts</span>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold bg-yellow-300 text-black border border-black px-2.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
            Significant Enhancement
          </span>
        </div>
      </div>

      {/* CATEGORY COMPARISON TABLE */}
      <div className="bg-white border-2 border-black rounded p-4 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between border-b-2 border-black pb-3 gap-2">
          <h3 className="font-sans font-bold text-base sm:text-lg text-black uppercase tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-black shrink-0" />
            Category Score Comparison Table
          </h3>
          <span className="font-mono text-[10px] sm:text-xs text-gray-500 uppercase font-bold">
            Internal Scoring Consistency Verified
          </span>
        </div>

        <div className="overflow-x-auto max-w-full">
          <table className="w-full min-w-[460px] text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F9F3] border-b-2 border-black text-black uppercase font-bold">
                <th className="p-2.5 sm:p-3 border-r border-black">Evaluation Category</th>
                <th className="p-2.5 sm:p-3 border-r border-black text-center w-28 sm:w-32">Before</th>
                <th className="p-2.5 sm:p-3 border-r border-black text-center w-28 sm:w-32">After</th>
                <th className="p-2.5 sm:p-3 text-center w-28 sm:w-32">Boost</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, idx) => {
                const diff = row.after - row.before;
                return (
                  <tr key={idx} className="border-b border-gray-300 hover:bg-yellow-50/50 transition-colors">
                    <td className="p-2.5 sm:p-3 border-r border-black font-bold text-black">{row.label}</td>
                    <td className="p-2.5 sm:p-3 border-r border-black text-center text-gray-600">{row.before}%</td>
                    <td className="p-2.5 sm:p-3 border-r border-black text-center font-bold text-emerald-700">{row.after}%</td>
                    <td className="p-2.5 sm:p-3 text-center font-bold text-emerald-800 bg-emerald-50">
                      +{diff}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 sm:p-4 bg-yellow-50 border border-black rounded font-mono text-xs text-gray-800">
          <strong className="text-black uppercase">Improvement Summary:</strong> {optimizedResume.improvementExplanation}
        </div>
      </div>

      {/* HIGHLIGHTED CHANGES LIST */}
      <div className="bg-white border-2 border-black rounded p-4 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col gap-4 sm:gap-5">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <h3 className="font-sans font-bold text-base sm:text-lg text-black uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            Highlighted Content & Keyword Enhancements
          </h3>
        </div>

        <div className="flex flex-col gap-3 font-mono text-xs">
          {optimizedResume.highlightChanges?.map((item, idx) => (
            <div key={idx} className="p-3.5 sm:p-4 bg-[#F8F9F3] border-2 border-black rounded flex flex-col gap-2 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-between border-b border-black pb-2">
                <span className="font-bold text-black uppercase bg-black text-white px-2 py-0.5 rounded text-[10px]">
                  {item.section} Section
                </span>
                <span className="font-bold text-emerald-800 bg-emerald-100 border border-emerald-600 px-2 py-0.5 rounded text-[10px] uppercase">
                  {item.type.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 mt-1">
                <div className="p-2.5 bg-red-50 border border-red-300 rounded text-red-900 text-[11px] break-words">
                  <strong>Before:</strong> {item.original}
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded text-emerald-950 font-bold text-[11px] break-words">
                  <strong>After:</strong> {item.updated}
                </div>
              </div>

              <p className="text-[11px] text-gray-600 bg-white p-2 border border-black rounded">
                <strong>Why it improved score:</strong> {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-white border-2 border-black rounded p-4 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-sans font-bold text-sm sm:text-base text-black uppercase">
            Proceed to Final Resume Preview & Download
          </h4>
          <p className="font-mono text-xs text-gray-600">
            Download your single-page PDF or DOCX file with preserved ATS layout formatting.
          </p>
        </div>

        <button
          onClick={onProceedToPreview}
          className="w-full sm:w-auto px-6 py-3 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-sans font-bold text-sm sm:text-base uppercase text-black shadow-[3px_3px_0px_#000] transition-all flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
        >
          <span>View Final 1-Page Resume</span>
          <ArrowRight className="w-5 h-5 shrink-0" />
        </button>
      </div>
    </div>
  );
};
