import { v4 as uuidv4 } from 'uuid';
import type { AppState, FlowItem, FocusSession, Project } from '../types';
import { toDateKey } from '../utils/flowHelpers';

const now = new Date().toISOString();
const todayKey = toDateKey(new Date());

type SeedItem = {
  title: string;
  type: FlowItem['type'];
  durationMinutes: number;
  notes?: string;
  section?: string;
  scheduledToday?: boolean;
};

function buildItems(projectId: string, defs: SeedItem[]): FlowItem[] {
  const sectionIds: Record<string, string> = {};
  const items: FlowItem[] = [];

  defs.forEach((def, index) => {
    const id = uuidv4();
    if (def.type === 'section') sectionIds[def.title] = id;
    items.push({
      id,
      projectId,
      parentId: def.section ? sectionIds[def.section] : undefined,
      title: def.title,
      type: def.type,
      durationMinutes: def.durationMinutes,
      status: 'not_started',
      notes: def.notes,
      order: index,
      scheduledDate: def.scheduledToday ? todayKey : undefined,
    });
  });

  const firstFocusable = items.find(
    (i) => i.type !== 'section' && i.type !== 'milestone',
  );
  if (firstFocusable) firstFocusable.status = 'current';

  return items;
}

const mathId = uuidv4();
const mathItems = buildItems(mathId, [
  { title: 'Question 1', type: 'section', durationMinutes: 0 },
  {
    title: '1a — Algebra setup',
    type: 'subtask',
    durationMinutes: 20,
    section: 'Question 1',
    notes: 'Set up equations and identify variables.',
    scheduledToday: true,
  },
  { title: '1b — Solve equations', type: 'subtask', durationMinutes: 20, section: 'Question 1', scheduledToday: true },
  { title: '1c — Check answers', type: 'subtask', durationMinutes: 20, section: 'Question 1', scheduledToday: true },
  { title: 'Short Break', type: 'break', durationMinutes: 10 },
  { title: 'Question 2', type: 'section', durationMinutes: 0 },
  { title: '2a — Read problem', type: 'subtask', durationMinutes: 20, section: 'Question 2' },
  { title: '2b — Work through solution', type: 'subtask', durationMinutes: 20, section: 'Question 2' },
  { title: '2c — Finalize answers', type: 'subtask', durationMinutes: 20, section: 'Question 2' },
  {
    title: 'Review & Submit',
    type: 'review',
    durationMinutes: 15,
    notes: 'Double-check all work before submitting.',
  },
  {
    title: 'Extra Buffer',
    type: 'buffer',
    durationMinutes: 20,
    notes: 'Flex time for delays or cleanup.',
  },
  { title: 'Homework Complete', type: 'milestone', durationMinutes: 0 },
]);

const mathProject: Project = {
  id: mathId,
  title: 'Math Homework',
  description: 'Algebra problem set with structured focus blocks and breaks.',
  dueDate: toDateKey(new Date(Date.now() + 2 * 86400000)),
  color: '#4f6bf6',
  icon: 'target',
  items: mathItems,
  createdAt: now,
  updatedAt: now,
};

const essayId = uuidv4();
const essayItems = buildItems(essayId, [
  { title: 'Research', type: 'section', durationMinutes: 0 },
  { title: 'Gather sources', type: 'task', durationMinutes: 25, section: 'Research', scheduledToday: true },
  { title: 'Outline argument', type: 'task', durationMinutes: 25, section: 'Research' },
  { title: 'Coffee Break', type: 'break', durationMinutes: 5 },
  { title: 'Draft', type: 'section', durationMinutes: 0 },
  { title: 'Write introduction', type: 'task', durationMinutes: 30, section: 'Draft' },
  { title: 'Write body paragraphs', type: 'task', durationMinutes: 45, section: 'Draft' },
  { title: 'Proofread', type: 'review', durationMinutes: 20 },
  { title: 'Submit Essay', type: 'milestone', durationMinutes: 0 },
]);

const essayProject: Project = {
  id: essayId,
  title: 'History Essay',
  description: 'Draft and submit the comparative history essay.',
  dueDate: toDateKey(new Date(Date.now() + 5 * 86400000)),
  color: '#10b981',
  icon: 'book',
  items: essayItems,
  createdAt: now,
  updatedAt: now,
};

function makeSession(
  projectId: string,
  itemId: string,
  daysAgo: number,
  plannedMinutes: number,
  actualMinutes: number,
): FocusSession {
  const started = new Date(Date.now() - daysAgo * 86400000 - 3600000);
  const ended = new Date(started.getTime() + actualMinutes * 60000);
  return {
    id: uuidv4(),
    projectId,
    itemId,
    startedAt: started.toISOString(),
    endedAt: ended.toISOString(),
    plannedMinutes,
    actualMinutes,
    completed: true,
    xpEarned: Math.max(1, actualMinutes),
  };
}

const seedSessions: FocusSession[] = [
  makeSession(essayId, essayItems[1].id, 2, 25, 25),
  makeSession(essayId, essayItems[2].id, 2, 25, 22),
  makeSession(mathId, mathItems[1].id, 1, 20, 20),
];

const DEFAULT_POMODORO = {
  enabled: false,
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

const DEFAULT_PREFERENCES = {
  accent: 'indigo' as const,
  defaultFocusMinutes: 25,
  defaultBreakMinutes: 5,
  defaultBufferMinutes: 10,
  notificationsEnabled: false,
  autoAdvance: true,
  soundEnabled: false,
};

/** Default state for a brand-new user: completely empty, no fake data. */
export function createEmptyState(): AppState {
  return {
    projects: [],
    sessions: [],
    stats: {
      totalXp: 0,
      weeklyFocusGoalMinutes: 300,
      streakDays: 0,
      lastFocusDate: undefined,
    },
    pomodoro: { ...DEFAULT_POMODORO },
    preferences: { ...DEFAULT_PREFERENCES },
  };
}

/** Opt-in demo data, loaded only from Settings. */
export function createSampleState(): AppState {
  return {
    projects: [mathProject, essayProject],
    sessions: seedSessions,
    stats: {
      totalXp: seedSessions.reduce((s, x) => s + x.xpEarned, 0),
      weeklyFocusGoalMinutes: 300,
      streakDays: 2,
      lastFocusDate: toDateKey(new Date(Date.now() - 86400000)),
    },
    pomodoro: { ...DEFAULT_POMODORO },
    preferences: { ...DEFAULT_PREFERENCES },
  };
}
