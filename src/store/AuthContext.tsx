import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

type AuthContextValue = {
  user: User | null;
  authReady: boolean;
  syncStatus: SyncStatus;
  setSyncStatus: (status: SyncStatus) => void;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    isFirebaseConfigured ? 'idle' : 'offline',
  );

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) setSyncStatus('idle');
    });
    return unsub;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error('Firebase is not configured');
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setSyncStatus('idle');
  }, []);

  const value = useMemo(
    () => ({
      user,
      authReady,
      syncStatus,
      setSyncStatus,
      isConfigured: isFirebaseConfigured,
      signInWithGoogle,
      signOut,
    }),
    [user, authReady, syncStatus, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
