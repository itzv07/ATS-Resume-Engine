import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Check, ShieldCheck, Loader2, AlertCircle, Briefcase, Mail } from 'lucide-react';

export const AccountSettingsModal: React.FC = () => {
  const { isSettingsModalOpen, closeSettingsModal, user, userProfile, updateProfileData } = useAuth();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [targetRole, setTargetRole] = useState(userProfile?.targetRole || 'Software Engineer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || user?.displayName || '');
      setTargetRole(userProfile.targetRole || 'Software Engineer');
    }
  }, [userProfile, user, isSettingsModalOpen]);

  if (!isSettingsModalOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateProfileData({
        displayName: displayName.trim(),
        targetRole: targetRole.trim()
      });
      setSuccessMsg("Account profile updated successfully!");
      setTimeout(() => {
        closeSettingsModal();
        setSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setErrorMsg("Failed to update account settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_#000] max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={closeSettingsModal}
          className="absolute top-4 right-4 p-1.5 bg-gray-100 hover:bg-gray-200 border border-black rounded text-black transition-all shadow-[2px_2px_0px_#000]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="inline-block bg-yellow-200 border border-black px-2.5 py-0.5 rounded font-mono text-xs font-bold uppercase shadow-[1px_1px_0px_#000] mb-2">
            Account Management
          </div>
          <h2 className="text-xl font-sans font-bold uppercase text-black tracking-tight">
            Account & Profile Settings
          </h2>
          <p className="font-mono text-xs text-gray-600 mt-1">
            Manage your authenticated user profile and target role preferences.
          </p>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-600 rounded text-emerald-900 text-xs font-mono flex items-center gap-2 shadow-[2px_2px_0px_#047857]">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border border-red-500 rounded text-red-900 text-xs font-mono flex items-center gap-2 shadow-[2px_2px_0px_#991b1b]">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-black uppercase mb-1">
              Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border-2 border-black rounded text-sm font-sans focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-[2px_2px_0px_#000]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-black uppercase mb-1">
              Default Target Role
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full pl-9 pr-3 py-2 border-2 border-black rounded text-sm font-sans focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-[2px_2px_0px_#000]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-black uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                disabled
                value={user.email || ''}
                className="w-full pl-9 pr-3 py-2 border-2 border-gray-300 bg-gray-100 rounded text-sm font-sans text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeSettingsModal}
              className="px-4 py-2 bg-white hover:bg-gray-100 border-2 border-black rounded font-sans font-bold text-xs uppercase text-black shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-sans font-bold text-xs uppercase text-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
