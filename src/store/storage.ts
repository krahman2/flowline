import type { AppState } from '../types';
import { createEmptyState, createSampleState } from './seedData';

const STORAGE_KEY = 'flowline-app-state-v4';

/** Merge persisted state with current defaults so new fields never break older saves. */
export function normalizeAppState(state: Partial<AppState>): AppState {
  const base = createEmptyState();
  return {
    projects: state.projects ?? base.projects,
    sessions: state.sessions ?? base.sessions,
    stats: { ...base.stats, ...state.stats },
    pomodoro: { ...base.pomodoro, ...state.pomodoro },
    preferences: { ...base.preferences, ...state.preferences },
  };
}

export function hasLocalData(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return (parsed.projects?.length ?? 0) > 0 || (parsed.sessions?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const empty = createEmptyState();
      saveState(empty);
      return empty;
    }
    return normalizeAppState(JSON.parse(raw) as Partial<AppState>);
  } catch {
    const empty = createEmptyState();
    saveState(empty);
    return empty;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

/** Clears everything back to a fresh, empty app. */
export function resetState(): AppState {
  const empty = createEmptyState();
  saveState(empty);
  return empty;
}

/** Loads opt-in demo data (Settings only). */
export function loadSampleState(): AppState {
  const sample = createSampleState();
  saveState(sample);
  return sample;
}
