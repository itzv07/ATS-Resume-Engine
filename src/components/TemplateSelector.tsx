import React from 'react';
import { ATS_TEMPLATES } from '../data/templates';
import { ResumeTemplate } from '../types';
import { Check, ArrowRight, ShieldCheck, FileCheck, Layers } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplateId,
  setSelectedTemplateId,
  onGenerate,
  isGenerating
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header Banner */}
      <div className="bg-white border-2 border-black rounded p-6 shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase font-bold bg-yellow-200 text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
              Step 3 of 4
            </span>
            <span className="font-mono text-xs text-gray-500 uppercase font-bold">
              ATS Layout Engine
            </span>
          </div>
          <h2 className="font-sans font-bold text-2xl text-black uppercase tracking-tight">
            Select ATS-Friendly Resume Template
          </h2>
          <p className="font-mono text-xs text-gray-600 max-w-2xl mt-1 leading-relaxed">
            All templates prioritize clean single-column hierarchy, standard fonts, standard section headers, and machine-readable text without tables, columns, or icons that trigger parsing errors.
          </p>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-6 py-3.5 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-sans font-bold text-sm uppercase text-black shadow-[3px_3px_0px_#000] transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span>{isGenerating ? 'Generating Resume...' : 'Generate JD-Specific Resume'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Guarantees Badge Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-white border-2 border-black rounded shadow-[2px_2px_0px_#000] flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-sans font-bold text-xs uppercase text-black">100% ATS Parser Safe</h4>
            <p className="font-mono text-[10px] text-gray-600">No tables, graphics, columns, or hidden text</p>
          </div>
        </div>

        <div className="p-3 bg-white border-2 border-black rounded shadow-[2px_2px_0px_#000] flex items-center gap-3">
          <FileCheck className="w-6 h-6 text-blue-600 shrink-0" />
          <div>
            <h4 className="font-sans font-bold text-xs uppercase text-black">1-Page Optimized Layout</h4>
            <p className="font-mono text-[10px] text-gray-600">Tailored vertical density for freshers & pros</p>
          </div>
        </div>

        <div className="p-3 bg-white border-2 border-black rounded shadow-[2px_2px_0px_#000] flex items-center gap-3">
          <Layers className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-sans font-bold text-xs uppercase text-black">Role-Targeted Typography</h4>
            <p className="font-mono text-[10px] text-gray-600">Standard fonts (Arial, Georgia, Calibri, Garamond)</p>
          </div>
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ATS_TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplateId === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => setSelectedTemplateId(tmpl.id)}
              className={`p-6 bg-white border-2 border-black rounded shadow-[4px_4px_0px_#000] transition-all cursor-pointer relative flex flex-col justify-between gap-4 ${
                isSelected ? 'ring-4 ring-yellow-400 bg-yellow-50/50 -translate-y-1' : 'hover:-translate-y-0.5'
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b-2 border-black pb-3">
                  <span className="font-mono text-xs font-bold uppercase bg-black text-white px-2.5 py-1 rounded">
                    {tmpl.targetRole}
                  </span>
                  {isSelected && (
                    <span className="font-mono text-xs font-bold uppercase bg-yellow-300 text-black px-2.5 py-1 rounded border border-black flex items-center gap-1 shadow-[1px_1px_0px_#000]">
                      <Check className="w-3.5 h-3.5" /> Selected
                    </span>
                  )}
                </div>

                <h3 className="font-sans font-bold text-xl text-black uppercase tracking-tight">
                  {tmpl.name}
                </h3>

                <p className="font-mono text-xs text-gray-600 leading-relaxed">
                  {tmpl.description}
                </p>

                {/* Best For Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="font-mono text-[10px] font-bold text-gray-500 uppercase self-center mr-1">
                    Best For:
                  </span>
                  {tmpl.bestFor.map((role, idx) => (
                    <span key={idx} className="font-mono text-[10px] bg-white border border-black px-2 py-0.5 rounded text-black shadow-[1px_1px_0px_#000]">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Template Structural Mockup Box */}
              <div className="p-4 bg-[#F8F9F3] border-2 border-black rounded flex flex-col gap-2 font-mono text-[10px] shadow-[2px_2px_0px_#000]">
                {tmpl.id === 'software-engineer' && (
                  <div className="flex flex-col gap-1.5 font-sans">
                    <div className="border-b-2 border-black pb-1">
                      <div className="font-extrabold uppercase text-xs text-black">Candidate Name</div>
                      <div className="text-[9px] text-gray-600 font-mono">email@domain.com • +1 234 567 890 • Location • LinkedIn • GitHub</div>
                    </div>
                    <div className="border-b border-black text-[9px] font-bold uppercase text-black pb-0.5 mt-0.5">
                      Technical Skills (Stack Priority)
                    </div>
                    <div className="text-[9px] text-gray-700">Languages: JS, TS, Python • Frontend: React • Backend: Node, Express</div>
                    <div className="border-b border-black text-[9px] font-bold uppercase text-black pb-0.5 mt-0.5">
                      Work Experience
                    </div>
                    <div className="text-[9px] text-gray-700">Software Engineer — Tech Corp (2022–Present)</div>
                    <div className="text-[9px] text-gray-600 pl-2">• Architected scalable REST microservices & reduced API response latency</div>
                  </div>
                )}

                {tmpl.id === 'ai-ml' && (
                  <div className="flex flex-col gap-1.5 font-sans">
                    <div className="text-center">
                      <div className="font-black uppercase text-xs text-slate-900">Candidate Name</div>
                      <div className="bg-slate-200 border-y border-slate-400 py-0.5 my-1 text-[8.5px] font-bold text-slate-800">
                        email@domain.com | +1 234 567 890 | LinkedIn | GitHub
                      </div>
                    </div>
                    <div className="bg-slate-200 border-l-4 border-blue-600 pl-2 py-0.5 text-[9px] font-black uppercase text-slate-900">
                      AI & Machine Learning Pipelines
                    </div>
                    <div className="text-[9px] text-slate-800">Frameworks: PyTorch, TensorFlow, Scikit-Learn [CUDA, Docker]</div>
                    <div className="bg-slate-200 border-l-4 border-blue-600 pl-2 py-0.5 text-[9px] font-black uppercase text-slate-900">
                      Key AI Projects
                    </div>
                    <div className="text-[9px] text-slate-700 pl-2">• Fine-tuned LLM embeddings & deployed real-time inference server</div>
                  </div>
                )}

                {tmpl.id === 'graduate-fresher' && (
                  <div className="flex flex-col gap-1.5 font-serif">
                    <div className="text-center border-b-2 border-double border-black pb-1">
                      <div className="font-bold uppercase text-xs text-black">Candidate Name</div>
                      <div className="text-[8.5px] text-gray-600">email@domain.com | Phone | Location | Portfolio</div>
                    </div>
                    <div className="flex items-center gap-1 text-[8.5px] font-bold uppercase text-black my-0.5">
                      <span className="flex-1 h-[1px] bg-black"></span>
                      <span>Education & Academics</span>
                      <span className="flex-1 h-[1px] bg-black"></span>
                    </div>
                    <div className="text-[9px] text-gray-800 font-sans">B.Tech Computer Science — University (3.9 GPA / Honors)</div>
                    <div className="flex items-center gap-1 text-[8.5px] font-bold uppercase text-black my-0.5">
                      <span className="flex-1 h-[1px] bg-black"></span>
                      <span>Featured Capstone Projects</span>
                      <span className="flex-1 h-[1px] bg-black"></span>
                    </div>
                    <div className="text-[9px] text-gray-700 font-sans pl-2">• Developed full-stack web app with authentication & automated testing</div>
                  </div>
                )}

                {tmpl.id === 'professional' && (
                  <div className="flex flex-col gap-1.5 font-serif">
                    <div className="flex justify-between items-end border-b-2 border-black pb-1">
                      <div>
                        <div className="font-black uppercase text-xs text-black">Candidate Name</div>
                        <div className="text-[8px] font-bold uppercase text-gray-600">Senior Software Leader</div>
                      </div>
                      <div className="text-[8px] text-right text-gray-600 font-sans">email@domain.com<br/>+1 234 567 890</div>
                    </div>
                    <div className="border-b border-black text-[8.5px] font-black uppercase text-black pb-0.5 tracking-wider">
                      Executive Experience
                    </div>
                    <div className="text-[9px] text-black font-bold">Tech Lead — Global Enterprise (2019–Present)</div>
                    <div className="text-[8.5px] text-gray-700 font-sans pl-2">• Led cross-functional engineering team of 12 delivering $5M platform</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="bg-white border-2 border-black rounded p-6 shadow-[4px_4px_0px_#000] flex items-center justify-between">
        <div>
          <h4 className="font-sans font-bold text-base text-black uppercase">
            Ready to Build JD-Optimized Resume?
          </h4>
          <p className="font-mono text-xs text-gray-600">
            Selected Template: <span className="font-bold text-black">{ATS_TEMPLATES.find(t => t.id === selectedTemplateId)?.name}</span>
          </p>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-8 py-3.5 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-sans font-bold text-base uppercase text-black shadow-[4px_4px_0px_#000] transition-all flex items-center gap-3 cursor-pointer"
        >
          <span>{isGenerating ? 'Optimizing Resume...' : 'Generate & Preview Resume'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
