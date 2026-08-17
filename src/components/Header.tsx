import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  RotateCcw, 
  BarChart3, 
  Layout, 
  History, 
  Award, 
  User, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Settings, 
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: 'input' | 'analysis' | 'template' | 'preview' | 'compare' | 'profile' | 'dashboard';
  setActiveTab: (tab: 'input' | 'analysis' | 'template' | 'preview' | 'compare' | 'profile' | 'dashboard') => void;
  hasAnalysis: boolean;
  hasOptimized: boolean;
  onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasAnalysis,
  hasOptimized,
  onResetAll
}) => {
  const { 
    user, 
    userProfile, 
    logout, 
    openAuthModal, 
    openSettingsModal 
  } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'US';
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Member';

  return (
    <header className="no-print print:hidden bg-[#F8F9F3] border-b-2 border-black sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 rounded border border-black shadow-[2px_2px_0px_#000] flex items-center justify-center">
            <FileText className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans font-extrabold text-lg tracking-tight text-black uppercase">
                ATS Resume Engine
              </h1>
              <span className="font-mono text-[10px] bg-yellow-200 text-black px-2 py-0.5 rounded border border-black font-bold shadow-[1px_1px_0px_#000]">
                v2.5 AI
              </span>
            </div>
            <p className="text-xs font-mono text-gray-600 hidden sm:block">
              JD-Matched Resume Builder & Anti-Fabrication ATS Scoring
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 custom-scrollbar">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'input'
                ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white hover:bg-gray-100 text-black shadow-[1px_1px_0px_#000]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Resume & JD</span>
          </button>

          <button
            onClick={() => {
              if (!user) {
                openAuthModal('signin');
              } else if (hasAnalysis) {
                setActiveTab('analysis');
              }
            }}
            disabled={user ? !hasAnalysis : false}
            title={!user ? "Sign in to unlock ATS Analysis" : !hasAnalysis ? "Complete Step 1 analysis first" : "View ATS Analysis"}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              !user
                ? 'opacity-60 bg-gray-50 text-gray-700 hover:bg-yellow-100'
                : !hasAnalysis
                ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-500'
                : activeTab === 'analysis'
                ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white hover:bg-gray-100 text-black shadow-[1px_1px_0px_#000]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>2. ATS Analysis</span>
          </button>

          <button
            onClick={() => {
              if (!user) {
                openAuthModal('signin');
              } else if (hasAnalysis) {
                setActiveTab('template');
              }
            }}
            disabled={user ? !hasAnalysis : false}
            title={!user ? "Sign in to unlock Templates" : !hasAnalysis ? "Complete Step 1 analysis first" : "Select Template"}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              !user
                ? 'opacity-60 bg-gray-50 text-gray-700 hover:bg-yellow-100'
                : !hasAnalysis
                ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-500'
                : activeTab === 'template'
                ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white hover:bg-gray-100 text-black shadow-[1px_1px_0px_#000]'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>3. Templates</span>
          </button>

          <button
            onClick={() => {
              if (!user) {
                openAuthModal('signin');
              } else if (hasOptimized) {
                setActiveTab('preview');
              }
            }}
            disabled={user ? !hasOptimized : false}
            title={!user ? "Sign in to unlock Resume Preview & Editor" : !hasOptimized ? "Generate resume first" : "Preview & Edit"}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              !user
                ? 'opacity-60 bg-gray-50 text-gray-700 hover:bg-yellow-100'
                : !hasOptimized
                ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-500'
                : activeTab === 'preview'
                ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white hover:bg-gray-100 text-black shadow-[1px_1px_0px_#000]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>4. Preview & Edit</span>
          </button>

          <button
            onClick={() => {
              if (!user) {
                openAuthModal('signin');
              } else if (hasOptimized) {
                setActiveTab('compare');
              }
            }}
            disabled={user ? !hasOptimized : false}
            title={!user ? "Sign in to view Score Differential" : !hasOptimized ? "Generate resume first" : "Score Differential"}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              !user
                ? 'opacity-60 bg-gray-50 text-gray-700 hover:bg-yellow-100'
                : !hasOptimized
                ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-500'
                : activeTab === 'compare'
                ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white hover:bg-gray-100 text-black shadow-[1px_1px_0px_#000]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Score Diff</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border border-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white hover:bg-gray-100 text-black shadow-[1px_1px_0px_#000]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* Top-Right Profile / Authentication Section */}
        <div className="flex items-center gap-2">
          {user ? (
            /* Authenticated User Profile Menu */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="pl-2 pr-3 py-1 bg-white hover:bg-gray-50 border-2 border-black rounded shadow-[2px_2px_0px_#000] cursor-pointer transition-all flex items-center gap-2 text-black"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="w-6 h-6 rounded-full border border-black object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-yellow-300 border border-black font-mono font-bold text-[10px] text-black flex items-center justify-center">
                    {getInitials(displayName, user.email || '')}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <span className="block font-sans font-bold text-xs leading-none max-w-28 truncate">
                    {displayName}
                  </span>
                  <span className="block font-mono text-[9px] text-gray-500 leading-tight truncate">
                    {userProfile?.targetRole || 'Software Engineer'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
              </button>

              {/* Profile Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_#000] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <p className="font-sans font-bold text-xs text-black truncate">{displayName}</p>
                    <p className="font-mono text-[10px] text-gray-500 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-yellow-100 font-mono text-xs font-bold text-black flex items-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-black" />
                    <span>My Private Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      openSettingsModal();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-yellow-100 font-mono text-xs font-bold text-black flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-black" />
                    <span>Account Settings</span>
                  </button>

                  <div className="border-t border-gray-200 my-1"></div>

                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 font-mono text-xs font-bold text-red-600 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Visitor Options */
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openAuthModal('signin')}
                className="h-8 px-3.5 py-1 bg-white hover:bg-gray-100 border-2 border-black rounded font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-black shrink-0" />
                <span className="whitespace-nowrap">Sign In</span>
              </button>

              <button
                onClick={() => openAuthModal('signup')}
                className="h-8 px-3.5 py-1 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5 text-black shrink-0" />
                <span className="whitespace-nowrap">Register</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
