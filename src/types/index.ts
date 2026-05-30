export type FlowItemType =
  | 'section'
  | 'task'
  | 'subtask'
  | 'break'
  | 'buffer'
  | 'review'
  | 'milestone';

export type FlowItemStatus =
  | 'not_started'
  | 'current'
  | 'completed'
  | 'skipped';

export type Project = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  color?: string;
  icon?: string;
  items: FlowItem[];
  createdAt: string;
  updatedAt: string;
};

export type FlowItem = {
  id: string;
  parentId?: string;
  projectId: string;
  title: string;
  type: FlowItemType;
  durationMinutes: number;
  status: FlowItemStatus;
  notes?: string;
  order: number;
  scheduledDate?: string;
};

export type FocusSession = {
  id: string;
  projectId: string;
  itemId: string;
  startedAt: string;
  endedAt?: string;
  plannedMinutes: number;
  actualMinutes: number;
  completed: boolean;
  skipped?: boolean;
  bufferUsedMinutes?: number;
  xpEarned: number;
};

export type UserStats = {
  totalXp: number;
  weeklyFocusGoalMinutes: number;
  streakDays: number;
  lastFocusDate?: string;
};

export type PomodoroSettings = {
  enabled: boolean;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
};

export type AccentKey = 'indigo' | 'blue' | 'emerald' | 'violet' | 'amber' | 'rose';

export type Preferences = {
  accent: AccentKey;
  defaultFocusMinutes: number;
  defaultBreakMinutes: number;
  defaultBufferMinutes: number;
  notificationsEnabled: boolean;
  autoAdvance: boolean;
  soundEnabled: boolean;
};

export type AppState = {
  projects: Project[];
  sessions: FocusSession[];
  stats: UserStats;
  pomodoro: PomodoroSettings;
  preferences: Preferences;
};

export type ProjectViewMode = 'flowline' | 'list' | 'calendar' | 'history' | 'goals';

export type CompletionSummaryData = {
  totalPlannedMinutes: number;
  totalCompletedMinutes: number;
  bufferMinutesUsed: number;
  tasksCompleted: number;
  xpEarned: number;
  streakDays: number;
};
