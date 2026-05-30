import type { AppState, FocusSession, Project } from '../types';
import { normalizeAppState } from '../store/storage';

function pickNewerDate(a?: string, b?: string): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return new Date(a) >= new Date(b) ? a : b;
}

function isEmptyState(state: AppState): boolean {
  return state.projects.length === 0 && state.sessions.length === 0;
}

function mergeProjects(local: Project[], cloud: Project[]): Project[] {
  const map = new Map<string, Project>();
  for (const project of [...cloud, ...local]) {
    const existing = map.get(project.id);
    if (!existing || new Date(project.updatedAt) > new Date(existing.updatedAt)) {
      map.set(project.id, project);
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function mergeSessions(local: FocusSession[], cloud: FocusSession[]): FocusSession[] {
  const map = new Map<string, FocusSession>();
  for (const session of [...cloud, ...local]) {
    map.set(session.id, session);
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

/**
 * Merge local (browser) and cloud snapshots.
 * Local work is preserved on first sign-in; cloud fills gaps when switching devices.
 */
export function mergeAppState(local: AppState, cloud: AppState | null): AppState {
  if (!cloud) return normalizeAppState(local);

  const localEmpty = isEmptyState(local);
  const cloudEmpty = isEmptyState(cloud);
  if (localEmpty && !cloudEmpty) return normalizeAppState(cloud);
  if (!localEmpty && cloudEmpty) return normalizeAppState(local);
  if (localEmpty && cloudEmpty) return normalizeAppState(local);

  const projects = mergeProjects(local.projects, cloud.projects);
  const sessions = mergeSessions(local.sessions, cloud.sessions);

  return normalizeAppState({
    projects,
    sessions,
    stats: {
      ...cloud.stats,
      ...local.stats,
      totalXp: Math.max(local.stats.totalXp, cloud.stats.totalXp),
      streakDays: Math.max(local.stats.streakDays, cloud.stats.streakDays),
      lastFocusDate: pickNewerDate(local.stats.lastFocusDate, cloud.stats.lastFocusDate),
    },
    // Prefer local UI settings — user was actively using this browser
    pomodoro: local.pomodoro,
    preferences: local.preferences,
  });
}
