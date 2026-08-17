import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, LogIn, UserPlus, AlertCircle, Loader2, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    authModalMode, 
    closeAuthModal, 
    signInWithEmail, 
    signUpWithEmail, 
    resetPassword,
    signInWithGoogle 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_password'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setSuccessMsg(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'forgot_password') {
      if (!email.trim()) {
        setError("Please enter your registered email address to receive the password reset link.");
        return;
      }
      setIsSubmitting(true);
      try {
        await resetPassword(email.trim());
        setSuccessMsg(`Password reset link sent to ${email.trim()}! Please check your email inbox and spam folder to enter your new password.`);
      } catch (err: any) {
        console.error("Password reset error:", err);
        const code = err.code || '';
        const rawMsg = err.message || '';
        let msg = "Failed to send password reset email. Please verify the email address.";
        if (code === 'auth/user-not-found' || rawMsg.includes('user-not-found')) {
          msg = "No account found with this email address. Please register a new account.";
        } else if (code === 'auth/invalid-email' || rawMsg.includes('invalid-email')) {
          msg = "Please enter a valid email address format.";
        } else if (rawMsg) {
          msg = rawMsg;
        }
        setError(msg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password, displayName.trim());
      }
      closeAuthModal();
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err: any) {
      console.error("Auth error:", err);
      const code = err.code || '';
      const rawMsg = err.message || '';
      let msg = "Authentication failed. Please check your details.";

      if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential' || rawMsg.includes('invalid-credential') || rawMsg.includes('user-not-found') || rawMsg.includes('wrong-password')) {
        msg = "Invalid email or password. If you forgot your password, click 'Forgot Password?' below, or switch to 'Create Account' to register.";
      } else if (code === 'auth/email-already-in-use' || rawMsg.includes('email-already-in-use')) {
        msg = "An account with this email address already exists. Please switch to Sign In or use Google Sign-In.";
      } else if (code === 'auth/weak-password' || rawMsg.includes('weak-password')) {
        msg = "Password should be at least 6 characters.";
      } else if (code === 'auth/popup-closed-by-user' || rawMsg.includes('popup-closed-by-user')) {
        msg = "Sign in popup was closed before completion.";
      } else if (code === 'auth/operation-not-allowed' || rawMsg.includes('operation-not-allowed')) {
        msg = "Email/Password sign-in is not enabled in Firebase Console. Please click 'Continue with Google' above, or enable Email/Password under Firebase Console > Authentication > Sign-in method.";
      } else if (rawMsg) {
        msg = rawMsg;
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      closeAuthModal();
    } catch (err: any) {
      console.error("Google auth error:", err);
      const code = err.code || '';
      const rawMsg = err.message || '';
      let msg = "Google Sign-In failed. Please try again.";
      if (code === 'auth/popup-closed-by-user' || rawMsg.includes('popup-closed-by-user')) {
        msg = "Google Sign-In popup was closed.";
      } else if (code === 'auth/operation-not-allowed' || rawMsg.includes('operation-not-allowed')) {
        msg = "Google Sign-In is not enabled in your Firebase Console under Authentication > Sign-in method.";
      } else if (rawMsg) {
        msg = rawMsg;
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_#000] max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 bg-gray-100 hover:bg-gray-200 border border-black rounded text-black transition-all shadow-[2px_2px_0px_#000]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-block bg-yellow-200 border border-black px-2.5 py-0.5 rounded font-mono text-xs font-bold uppercase shadow-[1px_1px_0px_#000] mb-2">
            {mode === 'forgot_password' ? 'Password Recovery' : 'Secure Member Portal'}
          </div>
          <h2 className="text-2xl font-sans font-extrabold uppercase text-black tracking-tight">
            {mode === 'signin' ? 'Sign In to Your Dashboard' : mode === 'signup' ? 'Create Free ATS Account' : 'Reset Account Password'}
          </h2>
          <p className="font-mono text-xs text-gray-600 mt-1">
            {mode === 'forgot_password' 
              ? "Enter your registered email address and we'll send you an official Firebase password reset link." 
              : "Access your saved resume evaluations, ATS match history, and JD-tailored resumes anytime."}
          </p>
        </div>

        {/* Google Sign In Button (only for signin and signup) */}
        {mode !== 'forgot_password' && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full mb-5 py-2.5 px-4 bg-white hover:bg-gray-50 border-2 border-black rounded font-sans font-bold text-sm text-black shadow-[3px_3px_0px_#000] cursor-pointer flex items-center justify-center gap-3 transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-mono">
                <span className="bg-white px-2 text-gray-500 font-bold">Or with email</span>
              </div>
            </div>
          </>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border-2 border-emerald-600 rounded text-emerald-950 text-xs font-mono flex flex-col gap-2 shadow-[2px_2px_0px_#047857]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{successMsg}</span>
            </div>
            <div className="mt-1 pt-2 border-t border-emerald-200 flex justify-between items-center">
              <span className="text-[11px] text-emerald-800">Check spam folder if not received in 2 minutes.</span>
              <button
                type="button"
                onClick={() => { setMode('signin'); setSuccessMsg(null); setError(null); }}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[11px] uppercase cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-500 rounded text-red-900 text-xs font-mono flex flex-col gap-2 shadow-[2px_2px_0px_#991b1b]">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>

            {/* Quick Action Buttons for common error scenarios */}
            {error.includes("already exists") && mode === 'signup' && (
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
                className="mt-1 self-start px-2.5 py-1 bg-white border border-red-800 rounded text-[11px] font-bold text-red-900 hover:bg-red-50 cursor-pointer uppercase shadow-[1px_1px_0px_#991b1b]"
              >
                Switch to Sign In →
              </button>
            )}

            {error.includes("Invalid email or password") && mode === 'signin' && (
              <div className="flex flex-wrap gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => { setMode('forgot_password'); setError(null); setSuccessMsg(null); }}
                  className="px-2.5 py-1 bg-yellow-300 border border-black rounded text-[11px] font-bold text-black hover:bg-yellow-400 cursor-pointer uppercase shadow-[1px_1px_0px_#000]"
                >
                  Forgot Password? →
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
                  className="px-2.5 py-1 bg-white border border-red-800 rounded text-[11px] font-bold text-red-900 hover:bg-red-50 cursor-pointer uppercase shadow-[1px_1px_0px_#991b1b]"
                >
                  Create Free Account →
                </button>
              </div>
            )}

            {error.includes("not enabled") && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="mt-1 self-start px-2.5 py-1 bg-yellow-300 border border-black rounded text-[11px] font-bold text-black hover:bg-yellow-400 cursor-pointer uppercase shadow-[1px_1px_0px_#000]"
              >
                Use Google Sign-In Instead →
              </button>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-mono font-bold text-black uppercase mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border-2 border-black rounded text-sm font-sans focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-[2px_2px_0px_#000]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-black uppercase mb-1">
              {mode === 'forgot_password' ? 'Your Registered Email Address' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="candidate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border-2 border-black rounded text-sm font-sans focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-[2px_2px_0px_#000]"
              />
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono font-bold text-black uppercase">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setError(null); setSuccessMsg(null); }}
                    className="text-[11px] font-mono font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border-2 border-black rounded text-sm font-sans focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-[2px_2px_0px_#000]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded font-sans font-bold text-sm text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] cursor-pointer flex items-center justify-center gap-2 transition-all active:translate-x-[1px] active:translate-y-[1px] whitespace-nowrap"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Sign In to Dashboard</span>
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Create Account</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Send Password Reset Link</span>
              </>
            )}
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs font-mono">
          {mode === 'signin' ? (
            <p className="text-gray-600">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
                className="font-bold text-black underline hover:text-amber-700 cursor-pointer"
              >
                Create Account
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p className="text-gray-600">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
                className="font-bold text-black underline hover:text-amber-700 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
              className="font-bold text-black underline hover:text-amber-700 cursor-pointer flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
