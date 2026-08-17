import React, { useState, useEffect, useRef } from 'react';
import { CandidateProfile, SkillCategory } from '../types';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Code, 
  FolderGit2, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Sparkles,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface CandidateFormProps {
  profile: CandidateProfile;
  onChange: (updatedProfile: CandidateProfile) => void;
  onSaveAndRecalculate?: () => void;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({
  profile,
  onChange,
  onSaveAndRecalculate
}) => {
  // Tab ordering: 1. Personal Info, 2. Education, 3. Experience, 4. Skills, 5. Projects, 6. Certifications, 7. Achievements
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'experience' | 'skills' | 'projects' | 'certifications' | 'achievements'>('skills');

  // Local state for raw skills strings so typing (commas, spaces, deleting, pasting) is NEVER interrupted or normalized on keystrokes
  const [skillsInputs, setSkillsInputs] = useState<{ [categoryIndex: number]: string }>({});
  const [categoryNames, setCategoryNames] = useState<{ [categoryIndex: number]: string }>({});
  const [skillsSavedFeedback, setSkillsSavedFeedback] = useState<boolean>(false);
  const isEditingSkillsRef = useRef<boolean>(false);

  // Initialize or sync skills input strings whenever profile.skills updates from outside (unless user is actively typing)
  useEffect(() => {
    if (!profile.skills || profile.skills.length === 0) {
      // Ensure at least one default skill category exists
      const defaultCategories: SkillCategory[] = [
        {
          categoryName: 'Technical & Programming Skills',
          skills: ['Java', 'Python', 'SQL']
        },
        {
          categoryName: 'Frameworks & Libraries',
          skills: ['React', 'Spring Boot']
        },
        {
          categoryName: 'Cloud, DevOps & Tools',
          skills: ['Docker', 'AWS', 'Git']
        }
      ];
      onChange({
        ...profile,
        skills: defaultCategories
      });
      return;
    }

    if (!isEditingSkillsRef.current) {
      const initialInputs: { [idx: number]: string } = {};
      const initialNames: { [idx: number]: string } = {};
      profile.skills.forEach((cat, idx) => {
        initialInputs[idx] = (cat.skills || []).join(', ');
        initialNames[idx] = cat.categoryName || `Category ${idx + 1}`;
      });
      setSkillsInputs(initialInputs);
      setCategoryNames(initialNames);
    }
  }, [profile.skills]);

  // Helper to commit skills changes from local text inputs to parent profile state
  const commitSkills = (
    currentInputs: { [idx: number]: string } = skillsInputs,
    currentNames: { [idx: number]: string } = categoryNames
  ) => {
    const categoriesCount = Math.max(
      profile.skills?.length || 0,
      Object.keys(currentInputs).length,
      Object.keys(currentNames).length
    );

    const updatedCategories: SkillCategory[] = [];

    for (let i = 0; i < categoriesCount; i++) {
      const rawName = currentNames[i] !== undefined 
        ? currentNames[i] 
        : (profile.skills?.[i]?.categoryName || `Skills Section ${i + 1}`);
      
      const rawText = currentInputs[i] !== undefined 
        ? currentInputs[i] 
        : (profile.skills?.[i]?.skills?.join(', ') || '');

      // Parse comma-separated list into clean string array
      const parsedSkills = rawText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (rawName.trim() || parsedSkills.length > 0) {
        updatedCategories.push({
          categoryName: rawName.trim() || 'Technical Skills',
          skills: parsedSkills
        });
      }
    }

    const newProfile: CandidateProfile = {
      ...profile,
      skills: updatedCategories.length > 0 ? updatedCategories : [
        { categoryName: 'Technical Skills', skills: [] }
      ]
    };

    onChange(newProfile);
    setSkillsSavedFeedback(true);
    setTimeout(() => setSkillsSavedFeedback(false), 2000);
    isEditingSkillsRef.current = false;
  };

  const handleSkillTextChange = (idx: number, value: string) => {
    isEditingSkillsRef.current = true;
    const updated = { ...skillsInputs, [idx]: value };
    setSkillsInputs(updated);
  };

  const handleCategoryNameChange = (idx: number, name: string) => {
    isEditingSkillsRef.current = true;
    const updated = { ...categoryNames, [idx]: name };
    setCategoryNames(updated);
  };

  const handleAddSkillCategory = () => {
    commitSkills();
    const currentList = profile.skills || [];
    const newCategory: SkillCategory = {
      categoryName: 'New Skill Category',
      skills: []
    };
    const updatedSkills = [...currentList, newCategory];
    const newIdx = updatedSkills.length - 1;
    
    setCategoryNames(prev => ({ ...prev, [newIdx]: 'New Skill Category' }));
    setSkillsInputs(prev => ({ ...prev, [newIdx]: '' }));
    
    onChange({
      ...profile,
      skills: updatedSkills
    });
  };

  const handleRemoveSkillCategory = (idxToRemove: number) => {
    const currentList = profile.skills || [];
    const updated = currentList.filter((_, idx) => idx !== idxToRemove);
    
    const newInputs: { [idx: number]: string } = {};
    const newNames: { [idx: number]: string } = {};
    
    updated.forEach((cat, idx) => {
      newInputs[idx] = (cat.skills || []).join(', ');
      newNames[idx] = cat.categoryName;
    });

    setSkillsInputs(newInputs);
    setCategoryNames(newNames);
    isEditingSkillsRef.current = false;

    onChange({
      ...profile,
      skills: updated.length > 0 ? updated : [{ categoryName: 'Technical Skills', skills: [] }]
    });
  };

  const handleTabChange = (newTab: 'personal' | 'education' | 'experience' | 'skills' | 'projects' | 'certifications' | 'achievements') => {
    if (activeTab === 'skills') {
      commitSkills();
    }
    setActiveTab(newTab);
  };

  const handleSaveAndReturn = () => {
    if (activeTab === 'skills') {
      commitSkills();
    }
    if (onSaveAndRecalculate) {
      onSaveAndRecalculate();
    }
  };

  const updatePersonal = (field: string, val: string) => {
    onChange({
      ...profile,
      personal: { ...profile.personal, [field]: val }
    });
  };

  // Education helpers
  const addEducation = () => {
    const newItem = {
      id: `edu-${Date.now()}`,
      degree: 'B.Tech / Bachelor Degree',
      institution: 'University / Institute Name',
      specialization: 'Computer Science',
      graduationYear: '2024',
      cgpaOrPercentage: '8.0/10',
      relevantCoursework: 'Data Structures, Software Engineering'
    };
    onChange({ ...profile, education: [...(profile.education || []), newItem] });
  };

  const removeEducation = (id: string) => {
    onChange({ ...profile, education: (profile.education || []).filter(e => e.id !== id) });
  };

  // Experience helpers
  const addExperience = () => {
    const newItem = {
      id: `exp-${Date.now()}`,
      jobTitle: 'Software Engineer',
      company: 'Company Name',
      employmentDates: '2023 – Present',
      responsibilities: ['Developed RESTful APIs and UI features', 'Collaborated on database and service architectures'],
      achievements: 'Improved team productivity by 20%'
    };
    onChange({ ...profile, experience: [...(profile.experience || []), newItem] });
  };

  const removeExperience = (id: string) => {
    onChange({ ...profile, experience: (profile.experience || []).filter(e => e.id !== id) });
  };

  // Projects helpers
  const addProject = () => {
    const newItem = {
      id: `proj-${Date.now()}`,
      projectName: 'New Technical Project',
      description: 'Engineered a scalable full-stack web application with responsive UI.',
      technologies: 'React, TypeScript, Node.js, SQL, Docker',
      responsibilities: ['Designed database schema', 'Integrated frontend APIs and authentication'],
      resultsOrImpact: 'Successfully deployed and tested with positive user feedback.'
    };
    onChange({ ...profile, projects: [...(profile.projects || []), newItem] });
  };

  const removeProject = (id: string) => {
    onChange({ ...profile, projects: (profile.projects || []).filter(p => p.id !== id) });
  };

  // Certifications helpers
  const addCertification = () => {
    const newItem = {
      id: `cert-${Date.now()}`,
      certificationName: 'AWS Certified Solutions Architect / Cloud Certification',
      issuingOrganization: 'Amazon Web Services',
      issueDate: '2024'
    };
    onChange({ ...profile, certifications: [...(profile.certifications || []), newItem] });
  };

  const removeCertification = (id: string) => {
    onChange({ ...profile, certifications: (profile.certifications || []).filter(c => c.id !== id) });
  };

  return (
    <div className="bg-white border-2 border-black rounded-lg p-4 sm:p-6 shadow-[6px_6px_0px_#000] flex flex-col gap-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b-2 border-black pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-yellow-300 border border-black px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase shadow-[1px_1px_0px_#000]">
              Interactive Editor
            </span>
            <h3 className="font-sans font-black text-xl text-black uppercase tracking-tight flex items-center gap-2">
              Edit Candidate Information
            </h3>
          </div>
          <p className="font-mono text-xs text-gray-600 mt-1">
            Manually edit, add, or remove skills and resume profile details. Changes directly update the resume preview, DOCX export, and saved sessions.
          </p>
        </div>

        <button
          onClick={handleSaveAndReturn}
          className="px-5 py-2.5 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-mono text-xs font-bold text-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save & Apply to Resume</span>
        </button>
      </div>

      {/* Form Navigation Tabs (Cleanly Numbered 1 to 7 with Section 4 as Skills) */}
      <div className="flex flex-wrap gap-2 border-b-2 border-black pb-3">
        <button
          onClick={() => handleTabChange('personal')}
          className={`px-3 py-2 rounded font-mono text-xs font-bold border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'personal' ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]' : 'bg-white hover:bg-gray-100'
          }`}
        >
          <User className="w-3.5 h-3.5" /> 1. Personal Info
        </button>

        <button
          onClick={() => handleTabChange('education')}
          className={`px-3 py-2 rounded font-mono text-xs font-bold border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'education' ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]' : 'bg-white hover:bg-gray-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" /> 2. Education ({profile.education?.length || 0})
        </button>

        <button
          onClick={() => handleTabChange('experience')}
          className={`px-3 py-2 rounded font-mono text-xs font-bold border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'experience' ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]' : 'bg-white hover:bg-gray-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" /> 3. Experience ({profile.experience?.length || 0})
        </button>

        <button
          onClick={() => handleTabChange('skills')}
          className={`px-3.5 py-2 rounded font-mono text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'skills' ? 'bg-yellow-300 shadow-[3px_3px_0px_#000] ring-2 ring-black' : 'bg-white hover:bg-gray-100 shadow-[1px_1px_0px_#000]'
          }`}
        >
          <Code className="w-4 h-4 text-black" /> 4. Skills ({profile.skills?.reduce((acc, c) => acc + (c.skills?.length || 0), 0) || 0})
        </button>

        <button
          onClick={() => handleTabChange('projects')}
          className={`px-3 py-2 rounded font-mono text-xs font-bold border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'projects' ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]' : 'bg-white hover:bg-gray-100'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" /> 5. Projects ({profile.projects?.length || 0})
        </button>

        <button
          onClick={() => handleTabChange('certifications')}
          className={`px-3 py-2 rounded font-mono text-xs font-bold border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'certifications' ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]' : 'bg-white hover:bg-gray-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" /> 6. Certifications ({profile.certifications?.length || 0})
        </button>
      </div>

      {/* ========================================================
          SECTION 4: SKILLS (Manual Editing, Adding, Deleting)
      ======================================================== */}
      {activeTab === 'skills' && (
        <div className="flex flex-col gap-6 font-mono text-xs">
          
          {/* Section Guide Banner */}
          <div className="p-4 bg-amber-50 border-2 border-amber-500 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#f59e0b]">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-xs">
                  Section 4: Technical & Core Skills
                </p>
                <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
                  Type skills separated by commas (e.g. <span className="font-bold text-black bg-amber-200 px-1 py-0.5 rounded">Java, Python, SQL, React, Spring Boot, Docker, AWS</span>). You can physically type, paste, insert between words, and add or delete categories.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleAddSkillCategory}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-black rounded font-bold text-black flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_#000]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Category</span>
              </button>

              <button
                type="button"
                onClick={() => commitSkills()}
                className="px-3.5 py-1.5 bg-yellow-300 hover:bg-yellow-400 border border-black rounded font-bold text-black flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_#000]"
              >
                {skillsSavedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Save className="w-3.5 h-3.5" />}
                <span>{skillsSavedFeedback ? 'Skills Saved!' : 'Apply Skills'}</span>
              </button>
            </div>
          </div>

          {/* Skill Category Cards */}
          <div className="flex flex-col gap-5">
            {(profile.skills && profile.skills.length > 0 ? profile.skills : [{ categoryName: 'Technical Skills', skills: [] }]).map((cat, catIdx) => {
              const currentInputString = skillsInputs[catIdx] !== undefined 
                ? skillsInputs[catIdx] 
                : (cat.skills || []).join(', ');

              const currentCategoryName = categoryNames[catIdx] !== undefined
                ? categoryNames[catIdx]
                : (cat.categoryName || `Category ${catIdx + 1}`);

              // Parse current skills for live badge preview
              const parsedPreviewSkills = currentInputString
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

              return (
                <div 
                  key={catIdx} 
                  className="p-4 sm:p-5 bg-[#F8F9F3] border-2 border-black rounded-lg flex flex-col gap-3 relative shadow-[3px_3px_0px_#000]"
                >
                  {/* Category Name & Delete Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-300 pb-2.5">
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <label className="font-bold text-black uppercase text-[11px] shrink-0">Category Name:</label>
                      <input
                        type="text"
                        value={currentCategoryName}
                        onChange={(e) => handleCategoryNameChange(catIdx, e.target.value)}
                        onBlur={() => commitSkills()}
                        placeholder="e.g. Programming Languages, Frameworks, Cloud & Tools"
                        className="font-bold text-black bg-white p-2 border border-black rounded flex-1 focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkillCategory(catIdx)}
                      className="text-red-600 hover:text-red-800 font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer self-end sm:self-center"
                      title="Remove this category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Category</span>
                    </button>
                  </div>

                  {/* Physical Editable Textarea for Skills */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-black uppercase text-[11px]">
                        Skills List (Comma-Separated)
                      </label>
                      <span className="text-[10px] text-gray-500 font-normal">
                        {parsedPreviewSkills.length} skill{parsedPreviewSkills.length !== 1 ? 's' : ''} detected
                      </span>
                    </div>

                    <textarea
                      id={`skills-input-${catIdx}`}
                      value={currentInputString}
                      onChange={(e) => handleSkillTextChange(catIdx, e.target.value)}
                      onBlur={() => commitSkills()}
                      rows={3}
                      placeholder="Type skills separated by commas, e.g.: Java, Python, SQL, React, Spring Boot, Docker, AWS"
                      className="p-3 bg-white border-2 border-black rounded text-black leading-relaxed focus:ring-2 focus:ring-yellow-400 font-mono text-xs custom-scrollbar placeholder:text-gray-400"
                    />
                  </div>

                  {/* Live Skill Badges Preview */}
                  {parsedPreviewSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase mr-1">Parsed:</span>
                      {parsedPreviewSkills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 bg-yellow-200 border border-black rounded text-black font-mono text-[11px] font-bold shadow-[1px_1px_0px_#000] flex items-center gap-1"
                        >
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Action Footer for Skills */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t-2 border-black">
            <button
              type="button"
              onClick={handleAddSkillCategory}
              className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-gray-100 border-2 border-black rounded font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Skill Category</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => commitSkills()}
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-100 hover:bg-emerald-200 border-2 border-black rounded font-mono text-xs font-bold text-emerald-900 shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply Skills</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndReturn}
                className="flex-1 sm:flex-none px-5 py-2 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-mono text-xs font-black text-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save & Return to Preview</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          SECTION 1: PERSONAL INFO
      ======================================================== */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-black uppercase">Full Name</label>
            <input
              type="text"
              value={profile.personal.fullName}
              onChange={(e) => updatePersonal('fullName', e.target.value)}
              className="p-2.5 bg-white border border-black rounded focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-black uppercase">Mobile Number</label>
            <input
              type="text"
              value={profile.personal.mobileNumber}
              onChange={(e) => updatePersonal('mobileNumber', e.target.value)}
              className="p-2.5 bg-white border border-black rounded focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-black uppercase">Email Address</label>
            <input
              type="email"
              value={profile.personal.email}
              onChange={(e) => updatePersonal('email', e.target.value)}
              className="p-2.5 bg-white border border-black rounded focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-black uppercase">Location (City, Country)</label>
            <input
              type="text"
              value={profile.personal.location}
              onChange={(e) => updatePersonal('location', e.target.value)}
              className="p-2.5 bg-white border border-black rounded focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-black uppercase">LinkedIn Profile URL</label>
            <input
              type="text"
              value={profile.personal.linkedIn}
              onChange={(e) => updatePersonal('linkedIn', e.target.value)}
              className="p-2.5 bg-white border border-black rounded focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-black uppercase">GitHub Profile URL</label>
            <input
              type="text"
              value={profile.personal.gitHub}
              onChange={(e) => updatePersonal('gitHub', e.target.value)}
              className="p-2.5 bg-white border border-black rounded focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="font-bold text-black uppercase">Portfolio Website URL</label>
            <input
              type="text"
              value={profile.personal.portfolio}
              onChange={(e) => updatePersonal('portfolio', e.target.value)}
              className="p-2.5 bg-white border border-black rounded focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="font-bold text-black uppercase">Professional Summary</label>
            <textarea
              value={profile.personal.summary}
              onChange={(e) => updatePersonal('summary', e.target.value)}
              rows={4}
              className="p-2.5 bg-white border border-black rounded leading-relaxed focus:ring-2 focus:ring-yellow-400 custom-scrollbar"
            />
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 2: EDUCATION
      ======================================================== */}
      {activeTab === 'education' && (
        <div className="flex flex-col gap-4 font-mono text-xs">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addEducation}
              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 border border-black rounded font-bold text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Education
            </button>
          </div>

          {(profile.education || []).map((edu, idx) => (
            <div key={edu.id || idx} className="p-4 bg-[#F8F9F3] border-2 border-black rounded flex flex-col gap-3 relative shadow-[2px_2px_0px_#000]">
              <button
                type="button"
                onClick={() => removeEducation(edu.id)}
                className="absolute top-3 right-3 text-red-600 hover:text-red-800 cursor-pointer"
                title="Remove education"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold uppercase text-[10px]">Degree / Qualification</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = [...(profile.education || [])];
                      updated[idx].degree = e.target.value;
                      onChange({ ...profile, education: updated });
                    }}
                    className="p-2 bg-white border border-black rounded"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold uppercase text-[10px]">University / College</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = [...(profile.education || [])];
                      updated[idx].institution = e.target.value;
                      onChange({ ...profile, education: updated });
                    }}
                    className="p-2 bg-white border border-black rounded"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold uppercase text-[10px]">Graduation Year</label>
                  <input
                    type="text"
                    value={edu.graduationYear}
                    onChange={(e) => {
                      const updated = [...(profile.education || [])];
                      updated[idx].graduationYear = e.target.value;
                      onChange({ ...profile, education: updated });
                    }}
                    className="p-2 bg-white border border-black rounded"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold uppercase text-[10px]">CGPA / Percentage</label>
                  <input
                    type="text"
                    value={edu.cgpaOrPercentage}
                    onChange={(e) => {
                      const updated = [...(profile.education || [])];
                      updated[idx].cgpaOrPercentage = e.target.value;
                      onChange({ ...profile, education: updated });
                    }}
                    className="p-2 bg-white border border-black rounded"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          SECTION 3: EXPERIENCE
      ======================================================== */}
      {activeTab === 'experience' && (
        <div className="flex flex-col gap-4 font-mono text-xs">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addExperience}
              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 border border-black rounded font-bold text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Experience
            </button>
          </div>

          {(profile.experience || []).map((exp, idx) => (
            <div key={exp.id || idx} className="p-4 bg-[#F8F9F3] border-2 border-black rounded flex flex-col gap-3 relative shadow-[2px_2px_0px_#000]">
              <button
                type="button"
                onClick={() => removeExperience(exp.id)}
                className="absolute top-3 right-3 text-red-600 hover:text-red-800 cursor-pointer"
                title="Remove experience"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold uppercase text-[10px]">Job Title</label>
                  <input
                    type="text"
                    value={exp.jobTitle}
                    onChange={(e) => {
                      const updated = [...(profile.experience || [])];
                      updated[idx].jobTitle = e.target.value;
                      onChange({ ...profile, experience: updated });
                    }}
                    className="p-2 bg-white border border-black rounded"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold uppercase text-[10px]">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...(profile.experience || [])];
                      updated[idx].company = e.target.value;
                      onChange({ ...profile, experience: updated });
                    }}
                    className="p-2 bg-white border border-black rounded"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold uppercase text-[10px]">Employment Dates</label>
                  <input
                    type="text"
                    value={exp.employmentDates}
                    onChange={(e) => {
                      const updated = [...(profile.experience || [])];
                      updated[idx].employmentDates = e.target.value;
                      onChange({ ...profile, experience: updated });
                    }}
                    className="p-2 bg-white border border-black rounded"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold uppercase text-[10px]">Bullet Points / Responsibilities (One per line)</label>
                <textarea
                  value={exp.responsibilities?.join('\n') || ''}
                  onChange={(e) => {
                    const updated = [...(profile.experience || [])];
                    updated[idx].responsibilities = e.target.value.split('\n').filter(Boolean);
                    onChange({ ...profile, experience: updated });
                  }}
                  rows={4}
                  className="p-2 bg-white border border-black rounded leading-relaxed custom-scrollbar"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          SECTION 5: PROJECTS
      ======================================================== */}
      {activeTab === 'projects' && (
        <div className="flex flex-col gap-4 font-mono text-xs">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addProject}
              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 border border-black rounded font-bold text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>

          {(profile.projects || []).map((proj, idx) => (
            <div key={proj.id || idx} className="p-4 bg-[#F8F9F3] border-2 border-black rounded flex flex-col gap-3 relative shadow-[2px_2px_0px_#000]">
              <button
                type="button"
                onClick={() => removeProject(proj.id)}
                className="absolute top-3 right-3 text-red-600 hover:text-red-800 cursor-pointer"
                title="Remove project"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold uppercase text-[10px]">Project Name</label>
                  <input
                    type="text"
                    value={proj.projectName}
                    onChange={(e) => {
                      const updated = [...(profile.projects || [])];
                      updated[idx].projectName = e.target.value;
                      onChange({ ...profile, projects: updated });
                    }}
                    className="p-2 bg-white border border-black rounded"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold uppercase text-[10px]">Technologies Used</label>
                  <input
                    type="text"
                    value={proj.technologies}
                    onChange={(e) => {
                      const updated = [...(profile.projects || [])];
                      updated[idx].technologies = e.target.value;
                      onChange({ ...profile, projects: updated });
                    }}
                    className="p-2 bg-white border border-black rounded"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold uppercase text-[10px]">Description & Impact</label>
                <textarea
                  value={proj.description}
                  onChange={(e) => {
                    const updated = [...(profile.projects || [])];
                    updated[idx].description = e.target.value;
                    onChange({ ...profile, projects: updated });
                  }}
                  rows={2}
                  className="p-2 bg-white border border-black rounded"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          SECTION 6: CERTIFICATIONS
      ======================================================== */}
      {activeTab === 'certifications' && (
        <div className="flex flex-col gap-4 font-mono text-xs">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addCertification}
              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 border border-black rounded font-bold text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Certification
            </button>
          </div>

          {(profile.certifications || []).map((cert, idx) => (
            <div key={cert.id || idx} className="p-3 bg-[#F8F9F3] border-2 border-black rounded flex items-center justify-between gap-3 relative shadow-[2px_2px_0px_#000]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Certification Name"
                  value={cert.certificationName}
                  onChange={(e) => {
                    const updated = [...(profile.certifications || [])];
                    updated[idx].certificationName = e.target.value;
                    onChange({ ...profile, certifications: updated });
                  }}
                  className="p-2 bg-white border border-black rounded"
                />
                <input
                  type="text"
                  placeholder="Issuing Organization"
                  value={cert.issuingOrganization}
                  onChange={(e) => {
                    const updated = [...(profile.certifications || [])];
                    updated[idx].issuingOrganization = e.target.value;
                    onChange({ ...profile, certifications: updated });
                  }}
                  className="p-2 bg-white border border-black rounded"
                />
                <input
                  type="text"
                  placeholder="Year / Issue Date"
                  value={cert.issueDate}
                  onChange={(e) => {
                    const updated = [...(profile.certifications || [])];
                    updated[idx].issueDate = e.target.value;
                    onChange({ ...profile, certifications: updated });
                  }}
                  className="p-2 bg-white border border-black rounded"
                />
              </div>

              <button
                type="button"
                onClick={() => removeCertification(cert.id)}
                className="text-red-600 hover:text-red-800 cursor-pointer"
                title="Remove certification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
