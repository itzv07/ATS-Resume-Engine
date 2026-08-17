import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithPopup, 
  signOut, 
  updateProfile as updateFirebaseProfile 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { saveUserProfile, getUserProfile, UserProfileData } from '../lib/firestoreService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfileData>) => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup' | 'forgot_password';
  openAuthModal: (mode?: 'signin' | 'signup' | 'forgot_password') => void;
  closeAuthModal: () => void;
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal control states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot_password'>('signin');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          let profile = await getUserProfile(currentUser.uid);
          if (!profile) {
            await saveUserProfile(currentUser.uid, {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Candidate',
              photoURL: currentUser.photoURL || ''
            });
            profile = await getUserProfile(currentUser.uid);
          }
          setUserProfile(profile);
        } catch (err) {
          console.error("Failed to load user profile from Firestore:", err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await saveUserProfile(cred.user.uid, {
        uid: cred.user.uid,
        email: cred.user.email || '',
        displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'User'
      });
      const p = await getUserProfile(cred.user.uid);
      setUserProfile(p);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      if (name.trim()) {
        await updateFirebaseProfile(cred.user, { displayName: name.trim() });
      }
      await saveUserProfile(cred.user.uid, {
        uid: cred.user.uid,
        email: cred.user.email || '',
        displayName: name.trim() || cred.user.email?.split('@')[0] || 'User',
        photoURL: cred.user.photoURL || ''
      });
      const p = await getUserProfile(cred.user.uid);
      setUserProfile(p);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await saveUserProfile(result.user.uid, {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || 'Candidate',
        photoURL: result.user.photoURL || ''
      });
      const p = await getUserProfile(result.user.uid);
      setUserProfile(p);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const updateProfileData = async (data: Partial<UserProfileData>) => {
    if (!user) return;
    await saveUserProfile(user.uid, data);
    const updated = await getUserProfile(user.uid);
    setUserProfile(updated);
  };

  const openAuthModal = (mode: 'signin' | 'signup' | 'forgot_password' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
      signInWithGoogle,
      logout,
      updateProfileData,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      isSettingsModalOpen,
      openSettingsModal,
      closeSettingsModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
