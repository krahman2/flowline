import type { FocusSession, Project, UserStats } from '../types';
import { getWeekStartDate, isSameDay, toDateKey } from '../utils/flowHelpers';

export const XP_PER_MINUTE = 1;
export const PROJECT_COMPLETION_BONUS = 50;

export function calculateSessionXp(actualMinutes: number): number {
  if (actualMinutes <= 0) return 0;
  return Math.max(1, Math.round(actualMinutes * XP_PER_MINUTE));
}

export function updateStatsAfterSession(
  stats: UserStats,
  session: FocusSession,
): UserStats {
  let { streakDays, totalXp, lastFocusDate } = stats;
  totalXp += session.xpEarned;

  if (session.actualMinutes > 0) {
    const today = new Date();
    if (!lastFocusDate) {
      streakDays = 1;
    } else if (!isSameDay(lastFocusDate, today)) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      streakDays = isSameDay(lastFocusDate, yesterday) ? streakDays + 1 : 1;
    }
    lastFocusDate = toDateKey(today);
  }

  return { ...stats, totalXp, streakDays, lastFocusDate };
}

export function getWeeklyFocusMinutes(sessions: FocusSession[]): number {
  const weekStart = getWeekStartDate();
  return sessions
    .filter((s) => s.completed && new Date(s.startedAt) >= weekStart)
    .reduce((sum, s) => sum + s.actualMinutes, 0);
}

export function getWeeklyProgressPercent(
  sessions: FocusSession[],
  goalMinutes: number,
): number {
  if (goalMinutes <= 0) return 0;
  return Math.min(100, Math.round((getWeeklyFocusMinutes(sessions) / goalMinutes) * 100));
}

export function getCompletedBlocksThisWeek(sessions: FocusSession[]): number {
  const weekStart = getWeekStartDate();
  return sessions.filter(
    (s) => s.completed && new Date(s.startedAt) >= weekStart,
  ).length;
}

export type BestFocusDay = { date: string; minutes: number } | null;

export function getBestFocusDay(sessions: FocusSession[]): BestFocusDay {
  const byDay = new Map<string, number>();
  for (const s of sessions) {
    if (!s.completed) continue;
    const key = toDateKey(s.startedAt);
    byDay.set(key, (byDay.get(key) ?? 0) + s.actualMinutes);
  }
  let best: BestFocusDay = null;
  for (const [date, minutes] of byDay) {
    if (!best || minutes > best.minutes) best = { date, minutes };
  }
  return best;
}

export type ProjectBreakdownRow = {
  projectId: string;
  title: string;
  color?: string;
  icon?: string;
  minutes: number;
};

export function getProjectBreakdown(
  sessions: FocusSession[],
  projects: Project[],
  weeklyOnly = true,
): ProjectBreakdownRow[] {
  const weekStart = getWeekStartDate();
  const minutesByProject = new Map<string, number>();
  for (const s of sessions) {
    if (!s.completed) continue;
    if (weeklyOnly && new Date(s.startedAt) < weekStart) continue;
    minutesByProject.set(s.projectId, (minutesByProject.get(s.projectId) ?? 0) + s.actualMinutes);
  }
  return projects
    .map((p) => ({
      projectId: p.id,
      title: p.title,
      color: p.color,
      icon: p.icon,
      minutes: minutesByProject.get(p.id) ?? 0,
    }))
    .filter((row) => row.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);
}

export type Badge = {
  id: string;
  label: string;
  description: string;
  earned: boolean;
};

export type FocusRhythm = {
  avgSessionMinutes: number;
  bestHourLabel: string | null;
  mostFocusedProject: { title: string; icon?: string; minutes: number } | null;
  bufferMinutesThisWeek: number;
};

export function getFocusRhythm(sessions: FocusSession[], projects: Project[]): FocusRhythm {
  const completed = sessions.filter((s) => s.completed && s.actualMinutes > 0);
  const avgSessionMinutes = completed.length
    ? Math.round(completed.reduce((sum, s) => sum + s.actualMinutes, 0) / completed.length)
    : 0;

  // Best hour-of-day bucket
  const byHour = new Map<number, number>();
  for (const s of completed) {
    const h = new Date(s.startedAt).getHours();
    byHour.set(h, (byHour.get(h) ?? 0) + s.actualMinutes);
  }
  let bestHour: number | null = null;
  let bestHourMinutes = 0;
  for (const [h, m] of byHour) {
    if (m > bestHourMinutes) {
      bestHourMinutes = m;
      bestHour = h;
    }
  }
  const bestHourLabel =
    bestHour === null
      ? null
      : `${((bestHour + 11) % 12) + 1}${bestHour < 12 ? 'am' : 'pm'}–${((bestHour + 12) % 12) + 1}${bestHour + 1 < 12 || bestHour + 1 === 24 ? 'am' : 'pm'}`;

  const breakdown = getProjectBreakdown(sessions, projects, false);
  const top = breakdown[0];
  const mostFocusedProject = top
    ? { title: top.title, icon: top.icon, minutes: top.minutes }
    : null;

  const weekStart = getWeekStartDate();
  const bufferMinutesThisWeek = sessions
    .filter((s) => new Date(s.startedAt) >= weekStart)
    .reduce((sum, s) => sum + (s.bufferUsedMinutes ?? 0), 0);

  return { avgSessionMinutes, bestHourLabel, mostFocusedProject, bufferMinutesThisWeek };
}

export function getBadges(stats: UserStats, sessions: FocusSession[]): Badge[] {
  const totalCompleted = sessions.filter((s) => s.completed).length;
  const totalMinutes = sessions
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.actualMinutes, 0);
  return [
    {
      id: 'first-step',
      label: 'First Step',
      description: 'Complete your first focus block',
      earned: totalCompleted >= 1,
    },
    {
      id: 'consistent',
      label: 'Consistent',
      description: 'Reach a 3-day streak',
      earned: stats.streakDays >= 3,
    },
    {
      id: 'committed',
      label: 'Committed',
      description: 'Reach a 7-day streak',
      earned: stats.streakDays >= 7,
    },
    {
      id: 'deep-work',
      label: 'Deep Work',
      description: 'Focus for 5 hours total',
      earned: totalMinutes >= 300,
    },
    {
      id: 'marathon',
      label: 'Marathon',
      description: 'Complete 25 focus blocks',
      earned: totalCompleted >= 25,
    },
  ];
}
