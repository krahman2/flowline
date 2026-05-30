import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { AppState } from '../types';
import { db } from './firebase';
import { normalizeAppState } from '../store/storage';

const COLLECTION = 'users';

export type CloudUserDoc = AppState & {
  updatedAt: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
};

export async function loadCloudState(uid: string): Promise<AppState | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return null;
  const data = snap.data() as Partial<CloudUserDoc>;
  return normalizeAppState({
    projects: data.projects,
    sessions: data.sessions,
    stats: data.stats,
    pomodoro: data.pomodoro,
    preferences: data.preferences,
  });
}

export async function saveCloudState(
  uid: string,
  state: AppState,
  profile?: { email?: string | null; displayName?: string | null; photoURL?: string | null },
): Promise<void> {
  if (!db) return;
  const payload: CloudUserDoc = {
    ...state,
    updatedAt: new Date().toISOString(),
    email: profile?.email ?? null,
    displayName: profile?.displayName ?? null,
    photoURL: profile?.photoURL ?? null,
  };
  await setDoc(doc(db, COLLECTION, uid), payload, { merge: true });
}
