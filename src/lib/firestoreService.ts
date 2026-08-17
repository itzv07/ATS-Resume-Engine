import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { SavedSession } from "../components/DashboardView";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  targetRole?: string;
  createdAt?: any;
  lastLoginAt?: any;
}

// 1. User Profile Operations
export async function saveUserProfile(uid: string, profile: Partial<UserProfileData>): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, "users", uid);
    const existingDoc = await getDoc(userRef);

    if (!existingDoc.exists()) {
      await setDoc(userRef, {
        uid,
        email: profile.email || "",
        displayName: profile.displayName || profile.email?.split("@")[0] || "User",
        photoURL: profile.photoURL || "",
        targetRole: profile.targetRole || "Software Engineer",
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });
    } else {
      await setDoc(userRef, {
        ...profile,
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserProfileData;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

// 2. User Analysis Sessions Operations under users/{uid}/resumeAnalyses
export async function saveUserAnalysisSession(uid: string, session: SavedSession): Promise<void> {
  const path = `users/${uid}/resumeAnalyses/${session.id}`;
  try {
    const analysisRef = doc(db, "users", uid, "resumeAnalyses", session.id);
    await setDoc(analysisRef, {
      ...session,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserAnalysisSessions(uid: string): Promise<SavedSession[]> {
  const path = `users/${uid}/resumeAnalyses`;
  try {
    const analysesRef = collection(db, "users", uid, "resumeAnalyses");
    const q = query(analysesRef, orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    const sessions: SavedSession[] = [];
    snapshot.forEach((doc) => {
      sessions.push(doc.data() as SavedSession);
    });
    return sessions;
  } catch (err) {
    try {
      // Fallback without ordering if index is building or missing
      const analysesRef = collection(db, "users", uid, "resumeAnalyses");
      const snapshot = await getDocs(analysesRef);
      const sessions: SavedSession[] = [];
      snapshot.forEach((doc) => {
        sessions.push(doc.data() as SavedSession);
      });
      return sessions;
    } catch (fallbackErr) {
      handleFirestoreError(fallbackErr, OperationType.LIST, path);
      return [];
    }
  }
}

export async function deleteUserAnalysisSession(uid: string, analysisId: string): Promise<void> {
  const path = `users/${uid}/resumeAnalyses/${analysisId}`;
  try {
    const analysisRef = doc(db, "users", uid, "resumeAnalyses", analysisId);
    await deleteDoc(analysisRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function clearAllUserAnalysisSessions(uid: string): Promise<void> {
  const path = `users/${uid}/resumeAnalyses`;
  try {
    const analysesRef = collection(db, "users", uid, "resumeAnalyses");
    const snapshot = await getDocs(analysesRef);
    const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
