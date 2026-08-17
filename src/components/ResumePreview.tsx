import React, { useState, useRef, useEffect } from 'react';
import { CandidateProfile, ResumeTemplate } from '../types';
import { ATS_TEMPLATES } from '../data/templates';
import { downloadResumeAsDocx } from '../utils/exportResume';
import {
  Download, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, CheckCircle2,
  Edit3, ShieldCheck, FileText, ChevronDown, Check, Sliders
} from 'lucide-react';

interface ResumePreviewProps {
  profile: CandidateProfile;
  templateId: string;
  atsScore: number;
  onEditProfile: () => void;
  onSelectTemplate?: (templateId: string) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  profile,
  templateId,
  atsScore,
  onEditProfile,
  onSelectTemplate
}) => {
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(templateId || 'software-engineer');
  const [zoom, setZoom] = useState<number>(100);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const [pageCount, setPageCount] = useState<number>(1);
  const [marginDensity, setMarginDensity] = useState<'standard' | 'compact' | 'spacious'>('standard');
  const [showTemplateMenu, setShowTemplateMenu] = useState<boolean>(false);

  const resumeRef = useRef<HTMLDivElement>(null);

  // Sync external templateId changes if any
  useEffect(() => {
    if (templateId) {
      setCurrentTemplateId(templateId);
    }
  }, [templateId]);

  const template = ATS_TEMPLATES.find(t => t.id === currentTemplateId) || ATS_TEMPLATES[0];

  const handleTemplateChange = (id: string) => {
    setCurrentTemplateId(id);
    if (onSelectTemplate) {
      onSelectTemplate(id);
    }
    setShowTemplateMenu(false);
  };

  // Monitor page height to compute realistic page count
  useEffect(() => {
    if (resumeRef.current) {
      const height = resumeRef.current.offsetHeight;
      // Standard A4 at 96 DPI is approx 1122px height
      const calculatedPages = Math.ceil(height / 1060);
      setPageCount(Math.max(1, calculatedPages));
    }
  }, [profile, currentTemplateId, zoom, marginDensity]);

  const handleDocxDownload = async () => {
    setIsExportingDocx(true);
    await downloadResumeAsDocx(
      profile,
      template,
      `${profile.personal.fullName ? profile.personal.fullName.replace(/\s+/g, '_') : 'Candidate'}_ATS_Resume.docx`
    );
    setIsExportingDocx(false);
  };

  const marginPaddingClass = marginDensity === 'compact' 
    ? 'p-[12mm]' 
    : marginDensity === 'spacious' 
    ? 'p-[20mm]' 
    : 'p-[16mm]';

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8 flex flex-col gap-4 sm:gap-6 print:p-0 print:m-0 print:max-w-full">
      {/* Top Action & Controls Bar */}
      <div className="no-print print:hidden bg-white border-2 border-black rounded p-3.5 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        
        {/* Left Badges & Switcher */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* ATS Score Badge */}
          <div className="bg-emerald-100 border-2 border-black rounded px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 sm:gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-mono text-[11px] sm:text-xs font-bold text-black uppercase">
              ATS Score: <span className="text-emerald-800 font-extrabold text-xs sm:text-sm">{atsScore}/100</span>
            </span>
          </div>

          {/* Quick Template Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              className="bg-yellow-100 hover:bg-yellow-200 border-2 border-black rounded px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 font-mono text-[11px] sm:text-xs font-bold text-black cursor-pointer transition-colors"
              title="Click to switch ATS templates"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Template: {template.name.split('—')[1] || template.name}</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {showTemplateMenu && (
              <div className="absolute left-0 mt-1 w-72 bg-white border-2 border-black rounded shadow-[4px_4px_0px_#000] z-50 py-1 font-mono text-xs animate-fadeIn">
                <div className="px-3 py-1.5 bg-[#F8F9F3] border-b border-black text-[10px] font-bold uppercase text-gray-600">
                  Select ATS Resume Format
                </div>
                {ATS_TEMPLATES.map((tmpl) => {
                  const isSelected = tmpl.id === currentTemplateId;
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => handleTemplateChange(tmpl.id)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-yellow-100 cursor-pointer transition-colors ${
                        isSelected ? 'bg-yellow-200 font-bold' : ''
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-black">{tmpl.name}</span>
                        <span className="text-[10px] text-gray-500">{tmpl.targetRole}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-black shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Page Count Indicator */}
          <div className={`border border-black rounded px-2.5 py-1 sm:px-3 sm:py-1.5 font-mono text-[11px] sm:text-xs font-bold flex items-center gap-1.5 ${
            pageCount > 1 ? 'bg-amber-200 text-amber-900 border-amber-800' : 'bg-gray-100 text-black'
          }`}>
            <span>{pageCount} Page{pageCount > 1 ? 's' : ''}</span>
          </div>

          {/* Margin Density Quick Toggle */}
          <div className="hidden md:flex items-center gap-1 bg-[#F8F9F3] border border-black rounded p-0.5 font-mono text-[10px]">
            <span className="px-1.5 text-gray-500 font-bold uppercase">Margins:</span>
            {(['compact', 'standard', 'spacious'] as const).map((density) => (
              <button
                key={density}
                onClick={() => setMarginDensity(density)}
                className={`px-2 py-0.5 rounded capitalize font-bold transition-all cursor-pointer ${
                  marginDensity === density
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                {density}
              </button>
            ))}
          </div>
        </div>

        {/* Right Toolbar: Zoom & Direct Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom controls */}
          <div className="bg-[#F8F9F3] border border-black rounded p-1 flex items-center gap-1">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1 hover:bg-gray-200 rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs font-bold px-1 w-10 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(130, zoom + 10))}
              className="p-1 hover:bg-gray-200 rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1 hover:bg-gray-200 rounded cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Edit Information */}
          <button
            onClick={onEditProfile}
            className="px-3 py-1.5 sm:py-2 bg-white hover:bg-gray-100 border-2 border-black rounded font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5 transition-all"
            title="Edit resume text and candidate profile fields"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Info</span>
          </button>

          {/* Primary DOCX Export Action */}
          <button
            onClick={handleDocxDownload}
            disabled={isExportingDocx}
            className="px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white border-2 border-black rounded font-sans font-bold text-xs uppercase shadow-[3px_3px_0px_#000] cursor-pointer flex items-center gap-1.5 transition-all"
            title="Download formatted Microsoft Word .docx file for ATS submission"
          >
            <FileText className="w-4 h-4" />
            <span>{isExportingDocx ? 'Exporting...' : 'Download DOCX'}</span>
          </button>
        </div>
      </div>

      {/* Page Count Alert Notice */}
      {pageCount > 1 && (
        <div className="no-print print:hidden p-3.5 sm:p-4 bg-amber-100 border-2 border-amber-600 rounded text-amber-900 font-mono text-xs flex items-center justify-between shadow-[2px_2px_0px_#b45309]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <span>
              <strong>1-Page ATS Tip:</strong> Your resume content currently spans {pageCount} pages. To fit cleanly onto a single page, switch margins to <strong>Compact</strong> above or edit text in <strong>Edit Info</strong>.
            </span>
          </div>
          <button
            onClick={() => setMarginDensity('compact')}
            className="hidden sm:block ml-4 px-2.5 py-1 bg-amber-200 hover:bg-amber-300 border border-amber-800 rounded font-bold uppercase text-[11px] cursor-pointer"
          >
            Apply Compact Margins
          </button>
        </div>
      )}

      {/* Main Document Preview Container */}
      <div className="bg-gray-200 p-2 sm:p-4 md:p-8 border-2 border-black rounded shadow-[4px_4px_0px_#000] flex justify-start sm:justify-center overflow-x-auto custom-scrollbar max-w-full print:bg-white print:p-0 print:border-none print:shadow-none print:overflow-visible print:m-0 print:w-full print:block">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
          className="transition-transform duration-200 shrink-0 sm:transform-origin-top-center print:transform-none print:w-full print:m-0 print:p-0 print:block"
        >
          {/* Printable Resume Canvas Sheet (Standard A4 Format 210mm x 297mm) */}
          <div
            id="resume-preview-document"
            ref={resumeRef}
            style={{
              fontFamily: template.fontFamily || 'Arial, Helvetica, sans-serif',
              width: '210mm',
              minHeight: '297mm'
            }}
            className={`bg-white text-[#111111] shadow-2xl border border-gray-300 flex flex-col gap-4 text-left leading-normal box-border transition-all ${marginPaddingClass} ${
              marginDensity === 'compact'
                ? 'text-[10px]'
                : marginDensity === 'spacious'
                ? 'text-[12px]'
                : 'text-[11px]'
            }`}
          >

            {/* ========================================================
                TEMPLATE 01: TECH & SOFTWARE ENGINEERING (Clean Modern ATS)
                Standard Silicon Valley tech format: Left-aligned bold header,
                prominent Technical Skills stack right under Header, quantified
                achievement bullets.
            ======================================================== */}
            {template.id === 'software-engineer' && (
              <div className="flex flex-col gap-3.5 w-full font-sans">
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-2.5">
                  <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-1">
                    {profile.personal.fullName || 'Candidate Name'}
                  </h1>
                  <div className="text-[10.5px] text-slate-700 font-medium flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {profile.personal.email && <span>{profile.personal.email}</span>}
                    {profile.personal.mobileNumber && <span>• {profile.personal.mobileNumber}</span>}
                    {profile.personal.location && <span>• {profile.personal.location}</span>}
                    {profile.personal.linkedIn && <span>• {profile.personal.linkedIn}</span>}
                    {profile.personal.gitHub && <span>• {profile.personal.gitHub}</span>}
                    {profile.personal.portfolio && <span>• {profile.personal.portfolio}</span>}
                  </div>
                </div>

                {/* Professional Summary */}
                {profile.personal.summary && (
                  <div>
                    <h2 className="text-xs font-bold uppercase border-b-2 border-slate-900 pb-0.5 mb-1.5 tracking-wider text-slate-900">
                      Professional Summary
                    </h2>
                    <p className="text-slate-800 leading-relaxed">
                      {profile.personal.summary}
                    </p>
                  </div>
                )}

                {/* Technical Skills - Stack Priority for Engineers */}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase border-b-2 border-slate-900 pb-0.5 mb-1.5 tracking-wider text-slate-900">
                      Technical Skills
                    </h2>
                    <div className="flex flex-col gap-1 text-slate-800">
                      {profile.skills.map((cat, idx) => (
                        cat.skills && cat.skills.length > 0 && (
                          <div key={idx}>
                            <span className="font-bold text-slate-900">{cat.categoryName}: </span>
                            <span>{cat.skills.join(', ')}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {profile.experience && profile.experience.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase border-b-2 border-slate-900 pb-0.5 mb-1.5 tracking-wider text-slate-900">
                      Work Experience
                    </h2>
                    <div className="flex flex-col gap-3">
                      {profile.experience.map((exp, idx) => (
                        <div key={exp.id || idx} className="text-slate-800">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{exp.jobTitle} — {exp.company}</span>
                            <span className="text-slate-600 font-normal">{exp.employmentDates}</span>
                          </div>
                          {exp.responsibilities && exp.responsibilities.length > 0 && (
                            <ul className="list-disc list-outside pl-4 space-y-1 mt-1 text-slate-800">
                              {exp.responsibilities.map((bullet, bIdx) => (
                                <li key={bIdx} className="pl-0.5 leading-normal">{bullet}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Projects */}
                {profile.projects && profile.projects.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase border-b-2 border-slate-900 pb-0.5 mb-1.5 tracking-wider text-slate-900">
                      Key Technical Projects
                    </h2>
                    <div className="flex flex-col gap-2.5">
                      {profile.projects.map((proj, idx) => (
                        <div key={proj.id || idx} className="text-slate-800">
                          <div className="font-bold text-slate-900 flex justify-between">
                            <span>{proj.projectName}</span>
                            <span className="font-normal italic text-slate-600">{proj.technologies}</span>
                          </div>
                          {proj.description && <p className="text-slate-700 leading-normal mt-0.5">{proj.description}</p>}
                          {proj.responsibilities && proj.responsibilities.length > 0 && (
                            <ul className="list-disc list-outside pl-4 space-y-1 mt-1">
                              {proj.responsibilities.map((bullet, bIdx) => (
                                <li key={bIdx} className="pl-0.5 leading-normal">{bullet}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Internships & Training */}
                {profile.internships && profile.internships.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase border-b-2 border-slate-900 pb-0.5 mb-1.5 tracking-wider text-slate-900">
                      Internships & Training
                    </h2>
                    <div className="flex flex-col gap-2.5">
                      {profile.internships.map((intern, idx) => (
                        <div key={intern.id || idx} className="text-slate-800">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{intern.role} — {intern.organization}</span>
                            <span className="text-slate-600 font-normal">{intern.duration}</span>
                          </div>
                          {intern.responsibilities && intern.responsibilities.length > 0 && (
                            <ul className="list-disc list-outside pl-4 space-y-1 mt-1 text-slate-800">
                              {intern.responsibilities.map((bullet, bIdx) => (
                                <li key={bIdx} className="pl-0.5 leading-normal">{bullet}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {profile.education && profile.education.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase border-b-2 border-slate-900 pb-0.5 mb-1.5 tracking-wider text-slate-900">
                      Education
                    </h2>
                    <div className="flex flex-col gap-1.5">
                      {profile.education.map((edu, idx) => (
                        <div key={edu.id || idx} className="text-slate-800 flex justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{edu.degree}</span> — {edu.institution}
                            {edu.cgpaOrPercentage && <span className="text-slate-600 ml-2">({edu.cgpaOrPercentage})</span>}
                          </div>
                          <span className="text-slate-600">{edu.graduationYear}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications & Achievements */}
                {((profile.certifications && profile.certifications.length > 0) || (profile.achievements && profile.achievements.length > 0)) && (
                  <div>
                    <h2 className="text-xs font-bold uppercase border-b-2 border-slate-900 pb-0.5 mb-1.5 tracking-wider text-slate-900">
                      Certifications & Achievements
                    </h2>
                    <ul className="list-disc list-outside pl-4 space-y-1 text-slate-800">
                      {profile.certifications?.map((cert, idx) => (
                        <li key={cert.id || idx} className="pl-0.5">
                          <span className="font-bold">{cert.certificationName}</span> — {cert.issuingOrganization} ({cert.issueDate})
                        </li>
                      ))}
                      {profile.achievements?.map((ach, idx) => (
                        <li key={ach.id || idx} className="pl-0.5">
                          <span className="font-bold">{ach.title}:</span> {ach.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                TEMPLATE 02: HARVARD / CLASSIC IVY LEAGUE ATS (Serif Layout)
                Classic ivy league ATS layout: Centered candidate header with
                subtle separator, right-aligned dates, uppercase section rules.
            ======================================================== */}
            {template.id === 'ai-ml' && (
              <div className="flex flex-col gap-3.5 w-full font-serif">
                {/* Centered Classic Header */}
                <div className="text-center border-b border-gray-900 pb-2">
                  <h1 className="text-2xl font-bold uppercase tracking-wider text-black mb-1">
                    {profile.personal.fullName || 'Candidate Name'}
                  </h1>
                  <div className="text-[10px] text-gray-800 font-sans flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5">
                    {profile.personal.email && <span>{profile.personal.email}</span>}
                    {profile.personal.mobileNumber && <span>| {profile.personal.mobileNumber}</span>}
                    {profile.personal.location && <span>| {profile.personal.location}</span>}
                    {profile.personal.linkedIn && <span>| {profile.personal.linkedIn}</span>}
                    {profile.personal.gitHub && <span>| {profile.personal.gitHub}</span>}
                  </div>
                </div>

                {/* Professional Summary */}
                {profile.personal.summary && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-800 pb-0.5 mb-1">
                      Professional Summary
                    </h2>
                    <p className="text-gray-900 leading-relaxed font-sans text-[10.5px]">
                      {profile.personal.summary}
                    </p>
                  </div>
                )}

                {/* Work Experience */}
                {profile.experience && profile.experience.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-800 pb-0.5 mb-1.5">
                      Professional Experience
                    </h2>
                    <div className="flex flex-col gap-3">
                      {profile.experience.map((exp, idx) => (
                        <div key={exp.id || idx} className="text-gray-900">
                          <div className="flex justify-between font-bold text-black text-xs">
                            <span>{exp.company} — <span className="font-normal italic">{exp.jobTitle}</span></span>
                            <span className="font-normal font-sans text-[10px] text-gray-700">{exp.employmentDates}</span>
                          </div>
                          {exp.responsibilities && exp.responsibilities.length > 0 && (
                            <ul className="list-disc list-outside pl-4 space-y-1 mt-1 font-sans text-gray-800 text-[10.5px]">
                              {exp.responsibilities.map((bullet, bIdx) => (
                                <li key={bIdx} className="pl-0.5 leading-normal">{bullet}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-800 pb-0.5 mb-1">
                      Technical & Core Competencies
                    </h2>
                    <div className="flex flex-col gap-1 font-sans text-gray-800 text-[10.5px]">
                      {profile.skills.map((cat, idx) => (
                        cat.skills && cat.skills.length > 0 && (
                          <div key={idx}>
                            <span className="font-bold text-black">{cat.categoryName}: </span>
                            <span>{cat.skills.join(', ')}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Projects */}
                {profile.projects && profile.projects.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-800 pb-0.5 mb-1.5">
                      Key Projects & Implementations
                    </h2>
                    <div className="flex flex-col gap-2.5">
                      {profile.projects.map((proj, idx) => (
                        <div key={proj.id || idx} className="text-gray-900">
                          <div className="font-bold text-black flex justify-between text-xs">
                            <span>{proj.projectName}</span>
                            <span className="font-normal font-sans italic text-gray-600 text-[10px]">{proj.technologies}</span>
                          </div>
                          {proj.description && <p className="text-gray-800 font-sans text-[10.5px] leading-normal mt-0.5">{proj.description}</p>}
                          {proj.responsibilities && proj.responsibilities.length > 0 && (
                            <ul className="list-disc list-outside pl-4 space-y-1 mt-1 font-sans text-gray-800 text-[10.5px]">
                              {proj.responsibilities.map((bullet, bIdx) => (
                                <li key={bIdx} className="pl-0.5 leading-normal">{bullet}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {profile.education && profile.education.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-800 pb-0.5 mb-1">
                      Education
                    </h2>
                    <div className="flex flex-col gap-1.5">
                      {profile.education.map((edu, idx) => (
                        <div key={edu.id || idx} className="text-gray-900 flex justify-between font-sans text-[10.5px]">
                          <div>
                            <span className="font-bold text-black font-serif">{edu.institution}</span> — {edu.degree}
                            {edu.cgpaOrPercentage && <span className="text-gray-600 ml-1.5">({edu.cgpaOrPercentage})</span>}
                          </div>
                          <span className="text-gray-700">{edu.graduationYear}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications & Achievements */}
                {((profile.certifications && profile.certifications.length > 0) || (profile.achievements && profile.achievements.length > 0)) && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-800 pb-0.5 mb-1">
                      Honors & Certifications
                    </h2>
                    <ul className="list-disc list-outside pl-4 space-y-1 font-sans text-gray-800 text-[10.5px]">
                      {profile.certifications?.map((cert, idx) => (
                        <li key={cert.id || idx} className="pl-0.5">
                          <span className="font-bold text-black">{cert.certificationName}</span> — {cert.issuingOrganization} ({cert.issueDate})
                        </li>
                      ))}
                      {profile.achievements?.map((ach, idx) => (
                        <li key={ach.id || idx} className="pl-0.5">
                          <span className="font-bold text-black">{ach.title}:</span> {ach.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                TEMPLATE 03: FRESH GRADUATE / ENTRY-LEVEL ATS
                Academic & Project priority: Education & Capstone Projects
                placed prominently above Experience for freshers & entry roles.
            ======================================================== */}
            {template.id === 'graduate-fresher' && (
              <div className="flex flex-col gap-3.5 w-full font-sans">
                {/* Header */}
                <div className="text-center border-b-2 border-black pb-2.5">
                  <h1 className="text-2xl font-black uppercase tracking-tight text-black mb-1">
                    {profile.personal.fullName || 'Candidate Name'}
                  </h1>
                  <div className="text-[10px] text-gray-700 font-medium flex flex-wrap justify-center items-center gap-x-2.5 gap-y-0.5">
                    {profile.personal.email && <span>{profile.personal.email}</span>}
                    {profile.personal.mobileNumber && <span>• {profile.personal.mobileNumber}</span>}
                    {profile.personal.location && <span>• {profile.personal.location}</span>}
                    {profile.personal.linkedIn && <span>• {profile.personal.linkedIn}</span>}
                    {profile.personal.gitHub && <span>• {profile.personal.gitHub}</span>}
                  </div>
                </div>

                {/* Professional Objective / Summary */}
                {profile.personal.summary && (
                  <div>
                    <h2 className="text-xs font-bold uppercase bg-gray-100 border-l-3 border-black pl-2 py-0.5 mb-1.5 tracking-wider text-black">
                      Career Objective
                    </h2>
                    <p className="text-gray-800 leading-relaxed px-0.5">
                      {profile.personal.summary}
                    </p>
                  </div>
                )}

                {/* Education - High Priority for Freshers */}
                {profile.education && profile.education.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase bg-gray-100 border-l-3 border-black pl-2 py-0.5 mb-1.5 tracking-wider text-black">
                      Education & Academics
                    </h2>
                    <div className="flex flex-col gap-1.5 px-0.5">
                      {profile.education.map((edu, idx) => (
                        <div key={edu.id || idx} className="text-gray-900 flex justify-between">
                          <div>
                            <span className="font-bold text-black">{edu.degree}</span> — {edu.institution}
                            {edu.cgpaOrPercentage && <span className="text-gray-600 ml-2 font-semibold">({edu.cgpaOrPercentage})</span>}
                          </div>
                          <span className="text-gray-600 font-mono text-[10px]">{edu.graduationYear}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase bg-gray-100 border-l-3 border-black pl-2 py-0.5 mb-1.5 tracking-wider text-black">
                      Technical Skills & Tools
                    </h2>
                    <div className="flex flex-col gap-1 px-0.5 text-gray-800">
                      {profile.skills.map((cat, idx) => (
                        cat.skills && cat.skills.length > 0 && (
                          <div key={idx}>
                            <span className="font-bold text-black">{cat.categoryName}: </span>
                            <span>{cat.skills.join(', ')}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Capstone Projects */}
                {profile.projects && profile.projects.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase bg-gray-100 border-l-3 border-black pl-2 py-0.5 mb-1.5 tracking-wider text-black">
                      Featured Capstone Projects
                    </h2>
                    <div className="flex flex-col gap-2.5 px-0.5">
                      {profile.projects.map((proj, idx) => (
                        <div key={proj.id || idx} className="text-gray-800">
                          <div className="font-bold text-black flex justify-between">
                            <span>{proj.projectName}</span>
                            <span className="font-normal italic text-gray-600 text-[10px]">{proj.technologies}</span>
                          </div>
                          {proj.description && <p className="text-gray-700 leading-normal mt-0.5">{proj.description}</p>}
                          {proj.responsibilities && proj.responsibilities.length > 0 && (
                            <ul className="list-disc list-outside pl-4 space-y-1 mt-1">
                              {proj.responsibilities.map((bullet, bIdx) => (
                                <li key={bIdx} className="pl-0.5 leading-normal">{bullet}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Internships & Practical Training */}
                {profile.internships && profile.internships.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase bg-gray-100 border-l-3 border-black pl-2 py-0.5 mb-1.5 tracking-wider text-black">
                      Internships & Training
                    </h2>
                    <div className="flex flex-col gap-2.5 px-0.5">
                      {profile.internships.map((intern, idx) => (
                        <div key={intern.id || idx} className="text-gray-800">
                          <div className="flex justify-between font-bold text-black">
                            <span>{intern.role} — {intern.organization}</span>
                            <span className="text-gray-600 font-normal text-[10px]">{intern.duration}</span>
                          </div>
                          {intern.responsibilities && intern.responsibilities.length > 0 && (
                            <ul className="list-disc list-outside pl-4 space-y-1 mt-1 text-gray-800">
                              {intern.responsibilities.map((bullet, bIdx) => (
                                <li key={bIdx} className="pl-0.5 leading-normal">{bullet}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience (if applicable) */}
                {profile.experience && profile.experience.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase bg-gray-100 border-l-3 border-black pl-2 py-0.5 mb-1.5 tracking-wider text-black">
                      Work Experience
                    </h2>
                    <div className="flex flex-col gap-2.5 px-0.5">
                      {profile.experience.map((exp, idx) => (
                        <div key={exp.id || idx} className="text-gray-800">
                          <div className="flex justify-between font-bold text-black">
                            <span>{exp.jobTitle} — {exp.company}</span>
                            <span className="text-gray-600 font-normal text-[10px]">{exp.employmentDates}</span>
                          </div>
                          {exp.responsibilities && exp.responsibilities.length > 0 && (
                            <ul className="list-disc list-outside pl-4 space-y-1 mt-1 text-gray-800">
                              {exp.responsibilities.map((bullet, bIdx) => (
                                <li key={bIdx} className="pl-0.5 leading-normal">{bullet}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications & Achievements */}
                {((profile.certifications && profile.certifications.length > 0) || (profile.achievements && profile.achievements.length > 0)) && (
                  <div>
                    <h2 className="text-xs font-bold uppercase bg-gray-100 border-l-3 border-black pl-2 py-0.5 mb-1.5 tracking-wider text-black">
                      Certifications & Extracurriculars
                    </h2>
                    <ul className="list-disc list-outside pl-4 space-y-1 text-gray-800 px-0.5">
                      {profile.certifications?.map((cert, idx) => (
                        <li key={cert.id || idx} className="pl-0.5">
                          <span className="font-bold">{cert.certificationName}</span> — {cert.issuingOrganization} ({cert.issueDate})
                        </li>
                      ))}
                      {profile.achievements?.map((ach, idx) => (
                        <li key={ach.id || idx} className="pl-0.5">
                          <span className="font-bold">{ach.title}:</span> {ach.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                TEMPLATE 04: MODERN CORPORATE & EXECUTIVE ATS
                Executive format: Clean typography (Calibri/Slate), structured
                summary, clear leadership & strategic project outcomes.
            ======================================================== */}
            {template.id === 'professional' && (
              <div className="flex flex-col gap-3.5 w-full font-sans">
                {/* Header */}
                <div className="border-b-2 border-slate-800 pb-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1">
                  <div>
                    <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900 mb-0.5">
                      {profile.personal.fullName || 'Candidate Name'}
                    </h1>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Engineering & Technical Professional
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-700 font-medium sm:text-right flex flex-col gap-0.5">
                    {profile.personal.email && <span>{profile.personal.email}</span>}
                    {profile.personal.mobileNumber && <span>{profile.personal.mobileNumber}</span>}
                    {profile.personal.location && <span>{profile.personal.location}</span>}
                    {profile.personal.linkedIn && <span>{profile.personal.linkedIn}</span>}
                  </div>
                </div>

                {/* Executive Summary */}
                {profile.personal.summary && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
                      Executive Summary
                    </h2>
                    <p className="text-slate-800 leading-relaxed">
                      {profile.personal.summary}
                    </p>
                  </div>
                )}

                {/* Professional Experience */}
                {profile.experience && profile.experience.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
                      Professional Experience
                    </h2>
                    <div className="flex flex-col gap-3">
                      {profile.experience.map((exp, idx) => (
                        <div key={exp.id || idx} className="text-slate-900">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span className="text-xs">{exp.jobTitle} — <span className="font-semibold text-slate-700">{exp.company}</span></span>
                            <span className="text-slate-600 font-normal text-[10px]">{exp.employmentDates}</span>
                          </div>
                          {exp.responsibilities && exp.responsibilities.length > 0 && (
                            <ul className="list-disc list-outside pl-4 space-y-1 mt-1 text-slate-800">
                              {exp.responsibilities.map((bullet, bIdx) => (
                                <li key={bIdx} className="pl-0.5 leading-normal">{bullet}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Skills & Competencies */}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
                      Core Competencies & Stack
                    </h2>
                    <div className="flex flex-col gap-1 text-slate-800">
                      {profile.skills.map((cat, idx) => (
                        cat.skills && cat.skills.length > 0 && (
                          <div key={idx}>
                            <span className="font-bold text-slate-900">{cat.categoryName}: </span>
                            <span>{cat.skills.join(', ')}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Strategic Projects */}
                {profile.projects && profile.projects.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
                      Strategic Projects & Deliverables
                    </h2>
                    <div className="flex flex-col gap-2.5">
                      {profile.projects.map((proj, idx) => (
                        <div key={proj.id || idx} className="text-slate-900">
                          <div className="font-bold text-slate-900 flex justify-between">
                            <span>{proj.projectName}</span>
                            <span className="font-normal italic text-slate-600 text-[10px]">{proj.technologies}</span>
                          </div>
                          {proj.description && <p className="text-slate-700 leading-normal mt-0.5">{proj.description}</p>}
                          {proj.responsibilities && proj.responsibilities.length > 0 && (
                            <ul className="list-disc list-outside pl-4 space-y-1 mt-1 text-slate-800">
                              {proj.responsibilities.map((bullet, bIdx) => (
                                <li key={bIdx} className="pl-0.5 leading-normal">{bullet}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {profile.education && profile.education.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
                      Education
                    </h2>
                    <div className="flex flex-col gap-1.5">
                      {profile.education.map((edu, idx) => (
                        <div key={edu.id || idx} className="text-slate-800 flex justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{edu.degree}</span> — {edu.institution}
                            {edu.cgpaOrPercentage && <span className="text-slate-600 ml-2">({edu.cgpaOrPercentage})</span>}
                          </div>
                          <span className="text-slate-600">{edu.graduationYear}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications & Leadership Recognition */}
                {((profile.certifications && profile.certifications.length > 0) || (profile.achievements && profile.achievements.length > 0)) && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
                      Certifications & Leadership Recognition
                    </h2>
                    <ul className="list-disc list-outside pl-4 space-y-1 text-slate-800">
                      {profile.certifications?.map((cert, idx) => (
                        <li key={cert.id || idx} className="pl-0.5">
                          <span className="font-bold">{cert.certificationName}</span> — {cert.issuingOrganization} ({cert.issueDate})
                        </li>
                      ))}
                      {profile.achievements?.map((ach, idx) => (
                        <li key={ach.id || idx} className="pl-0.5">
                          <span className="font-bold">{ach.title}:</span> {ach.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
