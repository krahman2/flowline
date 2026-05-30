import type {
  FlowItem,
  FlowItemStatus,
  FlowItemType,
  FocusSession,
  Project,
} from '../types';

export function formatDuration(minutes: number): string {
  const m = Math.round(minutes);
  if (m <= 0) return '0m';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

export function formatTimer(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function getItemTypeLabel(type: FlowItemType): string {
  const labels: Record<FlowItemType, string> = {
    section: 'Section',
    task: 'Task',
    subtask: 'Subtask',
    break: 'Break',
    buffer: 'Buffer',
    review: 'Review',
    milestone: 'Milestone',
  };
  return labels[type];
}

export type TypeTheme = {
  dot: string;
  ring: string;
  chipBg: string;
  chipText: string;
  accent: string;
};

export function getTypeTheme(type: FlowItemType): TypeTheme {
  switch (type) {
    case 'break':
      return {
        dot: 'bg-mint-500',
        ring: 'ring-mint-200',
        chipBg: 'bg-mint-50',
        chipText: 'text-mint-600',
        accent: 'text-mint-600',
      };
    case 'buffer':
      return {
        dot: 'bg-amber-500',
        ring: 'ring-amber-200',
        chipBg: 'bg-amber-50',
        chipText: 'text-amber-600',
        accent: 'text-amber-600',
      };
    case 'review':
      return {
        dot: 'bg-violet-500',
        ring: 'ring-violet-200',
        chipBg: 'bg-violet-50',
        chipText: 'text-violet-600',
        accent: 'text-violet-600',
      };
    case 'milestone':
      return {
        dot: 'bg-flow-600',
        ring: 'ring-flow-200',
        chipBg: 'bg-flow-50',
        chipText: 'text-flow-700',
        accent: 'text-flow-700',
      };
    case 'section':
      return {
        dot: 'bg-neutral-400',
        ring: 'ring-neutral-200',
        chipBg: 'bg-neutral-100',
        chipText: 'text-neutral-600',
        accent: 'text-neutral-600',
      };
    default:
      return {
        dot: 'bg-flow-500',
        ring: 'ring-flow-200',
        chipBg: 'bg-flow-50',
        chipText: 'text-flow-600',
        accent: 'text-flow-600',
      };
  }
}

export function getSortedItems(items: FlowItem[]): FlowItem[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function getChildItems(items: FlowItem[], parentId: string): FlowItem[] {
  return getSortedItems(items.filter((item) => item.parentId === parentId));
}

export function getFocusableChildItems(items: FlowItem[], parentId: string): FlowItem[] {
  return getChildItems(items, parentId).filter(
    (item) => item.type !== 'section' && item.type !== 'milestone',
  );
}

/** Task with subtasks (or other focusable children) — duration rolls up from children. */
export function isRollupParent(items: FlowItem[], item: FlowItem): boolean {
  return item.type === 'task' && getFocusableChildItems(items, item.id).length > 0;
}

/** Focus blocks in automatic flow order (excludes rollup parents unless user picks them). */
export function getFlowFocusables(items: FlowItem[]): FlowItem[] {
  return getFocusableItems(items).filter((item) => !isRollupParent(items, item));
}

/** Blocks that count once toward planned/remaining totals (no parent + children double-count). */
export function getPlannableFocusables(items: FlowItem[]): FlowItem[] {
  return getFlowFocusables(items);
}

export function getChildDurationSum(items: FlowItem[], parentId: string): number {
  return getFocusableChildItems(items, parentId).reduce(
    (sum, child) => sum + child.durationMinutes,
    0,
  );
}

/** Timer/display duration — rollup parents use sum of (remaining) child blocks. */
export function getEffectiveDurationMinutes(items: FlowItem[], item: FlowItem): number {
  if (!isRollupParent(items, item)) return item.durationMinutes;
  const children = getFocusableChildItems(items, item.id);
  const open = children.filter(
    (c) => c.status !== 'completed' && c.status !== 'skipped',
  );
  const pool = open.length > 0 ? open : children;
  return pool.reduce((sum, c) => sum + c.durationMinutes, 0);
}

/** Keep parent task duration in sync with its subtask total. */
export function syncParentDurations(items: FlowItem[]): FlowItem[] {
  return items.map((item) => {
    if (item.type !== 'task') return item;
    const childSum = getChildDurationSum(items, item.id);
    if (childSum <= 0) return item;
    return childSum !== item.durationMinutes ? { ...item, durationMinutes: childSum } : item;
  });
}

/** When every child is done, mark the rollup parent complete too. */
export function autoCompleteRollupParents(items: FlowItem[]): FlowItem[] {
  return items.map((item) => {
    if (!isRollupParent(items, item)) return item;
    const children = getFocusableChildItems(items, item.id);
    const allDone = children.every(
      (c) => c.status === 'completed' || c.status === 'skipped',
    );
    if (allDone && item.status !== 'completed' && item.status !== 'skipped') {
      return { ...item, status: 'completed' as FlowItemStatus };
    }
    return item;
  });
}

/** Mark all focusable children complete (batch focus on parent task). */
export function completeChildBlocks(
  items: FlowItem[],
  parentId: string,
): FlowItem[] {
  const childIds = new Set(getFocusableChildItems(items, parentId).map((c) => c.id));
  return items.map((item) =>
    childIds.has(item.id) && item.status !== 'completed' && item.status !== 'skipped'
      ? { ...item, status: 'completed' as FlowItemStatus }
      : item,
  );
}

export function getFocusableItems(items: FlowItem[]): FlowItem[] {
  return getSortedItems(
    items.filter((item) => item.type !== 'section' && item.type !== 'milestone'),
  );
}

export function getCurrentItem(items: FlowItem[]): FlowItem | undefined {
  return getFocusableItems(items).find((item) => item.status === 'current');
}

export function getNextFocusableItem(
  items: FlowItem[],
  currentId?: string,
): FlowItem | undefined {
  const flowFocusables = getFlowFocusables(items);
  const open = (i: FlowItem) => i.status !== 'completed' && i.status !== 'skipped';

  if (!currentId) return flowFocusables.find(open);

  const current = items.find((i) => i.id === currentId);

  // After batch-completing a parent task, jump past its children
  if (current && isRollupParent(items, current)) {
    const sorted = getSortedItems(items);
    const children = getFocusableChildItems(items, current.id);
    const lastChildIdx = Math.max(
      ...children.map((c) => sorted.findIndex((i) => i.id === c.id)),
      sorted.findIndex((i) => i.id === current.id),
    );
    const nextInTimeline = sorted.slice(lastChildIdx + 1).find((i) => {
      if (i.type === 'section' || i.type === 'milestone') return false;
      if (!open(i)) return false;
      return true;
    });
    if (nextInTimeline) return nextInTimeline;
    return flowFocusables.find(open);
  }

  const idx = flowFocusables.findIndex((item) => item.id === currentId);
  if (idx === -1) return flowFocusables.find(open);
  return flowFocusables.slice(idx + 1).find(open);
}

export function getUpcomingItems(items: FlowItem[], count: number): FlowItem[] {
  const current = getCurrentItem(items);
  const focusable = getFocusableItems(items);
  const startIdx = current
    ? focusable.findIndex((i) => i.id === current.id) + 1
    : 0;
  return focusable.slice(startIdx).filter((i) => i.status !== 'completed' && i.status !== 'skipped').slice(0, count);
}

export function getProjectProgress(items: FlowItem[]): number {
  const focusable = getFlowFocusables(items);
  if (focusable.length === 0) return 0;
  const done = focusable.filter(
    (item) => item.status === 'completed' || item.status === 'skipped',
  ).length;
  return Math.round((done / focusable.length) * 100);
}

/** How far down the full timeline (all items) the user has reached, 0–100. */
export function getRailFillPercent(items: FlowItem[]): number {
  const all = getSortedItems(items);
  if (all.length <= 1) return isProjectComplete(items) ? 100 : 0;
  if (isProjectComplete(items)) return 100;
  const current = getCurrentItem(items);
  if (!current) {
    const anyDone = all.some((i) => i.status === 'completed');
    return anyDone ? 6 : 0;
  }
  const idx = all.findIndex((i) => i.id === current.id);
  return Math.round((idx / (all.length - 1)) * 100);
}

export function getTotalPlannedMinutes(items: FlowItem[]): number {
  return getPlannableFocusables(items).reduce(
    (sum, item) => sum + item.durationMinutes,
    0,
  );
}

export function getRemainingMinutes(items: FlowItem[]): number {
  return getPlannableFocusables(items)
    .filter((i) => i.status !== 'completed' && i.status !== 'skipped')
    .reduce((sum, item) => sum + item.durationMinutes, 0);
}

export function getCompletedFocusMinutes(
  sessions: FocusSession[],
  projectId?: string,
): number {
  return sessions
    .filter((s) => (projectId ? s.projectId === projectId : true) && s.completed)
    .reduce((sum, s) => sum + s.actualMinutes, 0);
}

export function getBufferMinutesUsed(
  sessions: FocusSession[],
  projectId?: string,
): number {
  return sessions
    .filter((s) => (projectId ? s.projectId === projectId : true))
    .reduce((sum, s) => sum + (s.bufferUsedMinutes ?? 0), 0);
}

export function getCompletedCount(items: FlowItem[]): number {
  return getFlowFocusables(items).filter((i) => i.status === 'completed').length;
}

export function resetProjectFlow(items: FlowItem[]): FlowItem[] {
  const flowIds = new Set(getFlowFocusables(items).map((i) => i.id));
  let firstSet = false;
  return items.map((item) => {
    if (!flowIds.has(item.id)) {
      if (item.type === 'section' || item.type === 'milestone') {
        return { ...item, status: 'not_started' as FlowItemStatus };
      }
      // Rollup parent stays not_started until children finish
      return { ...item, status: 'not_started' as FlowItemStatus };
    }
    if (!firstSet) {
      firstSet = true;
      return { ...item, status: 'current' as FlowItemStatus };
    }
    return { ...item, status: 'not_started' as FlowItemStatus };
  });
}

export function advanceToNextItem(
  items: FlowItem[],
  finishedItemId: string,
  finalStatus: FlowItemStatus = 'completed',
): FlowItem[] {
  let nextItems = items.map((item) => {
    if (item.id === finishedItemId) {
      return { ...item, status: finalStatus };
    }
    if (item.status === 'current' && item.id !== finishedItemId) {
      return { ...item, status: 'not_started' as FlowItemStatus };
    }
    return item;
  });

  nextItems = autoCompleteRollupParents(nextItems);
  const next = getNextFocusableItem(nextItems, finishedItemId);

  return nextItems.map((item) => {
    if (next && item.id === next.id) {
      return { ...item, status: 'current' as FlowItemStatus };
    }
    return item;
  });
}

export function isProjectComplete(items: FlowItem[]): boolean {
  const focusable = getFocusableItems(items);
  return (
    focusable.length > 0 &&
    focusable.every(
      (item) => item.status === 'completed' || item.status === 'skipped',
    )
  );
}

export function getWeekStartDate(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateKey(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function isToday(date?: string): boolean {
  if (!date) return false;
  return toDateKey(date) === toDateKey(new Date());
}

export function getIndentLevel(items: FlowItem[], item: FlowItem): number {
  let level = 0;
  let current = item;
  while (current.parentId) {
    level++;
    const parent = items.find((i) => i.id === current.parentId);
    if (!parent) break;
    current = parent;
  }
  return level;
}

export type TypeBreakdownRow = {
  type: FlowItemType;
  count: number;
  minutes: number;
};

export function getTypeBreakdown(items: FlowItem[]): TypeBreakdownRow[] {
  const map = new Map<FlowItemType, TypeBreakdownRow>();
  for (const item of getPlannableFocusables(items)) {
    const row = map.get(item.type) ?? { type: item.type, count: 0, minutes: 0 };
    row.count += 1;
    row.minutes += item.durationMinutes;
    map.set(item.type, row);
  }
  return [...map.values()].sort((a, b) => b.minutes - a.minutes);
}

export function getCompletionRate(items: FlowItem[]): number {
  const focusable = getFocusableItems(items);
  const finished = focusable.filter((i) => i.status === 'completed' || i.status === 'skipped');
  if (finished.length === 0) return 0;
  const completed = focusable.filter((i) => i.status === 'completed').length;
  return Math.round((completed / finished.length) * 100);
}

export function getPlannedVsActual(
  sessions: FocusSession[],
  projectId: string,
): { avgPlanned: number; avgActual: number; sessions: number } {
  const completed = sessions.filter((s) => s.projectId === projectId && s.completed && s.actualMinutes > 0);
  if (completed.length === 0) return { avgPlanned: 0, avgActual: 0, sessions: 0 };
  const avgPlanned = Math.round(
    completed.reduce((sum, s) => sum + s.plannedMinutes, 0) / completed.length,
  );
  const avgActual = Math.round(
    completed.reduce((sum, s) => sum + s.actualMinutes, 0) / completed.length,
  );
  return { avgPlanned, avgActual, sessions: completed.length };
}

export function getUnscheduledItems(items: FlowItem[]): FlowItem[] {
  return getFocusableItems(items).filter((i) => !i.scheduledDate && i.status !== 'completed');
}

/** Items across all projects that are scheduled for or due today. */
export function getTodayItems(projects: Project[]): {
  project: Project;
  items: FlowItem[];
}[] {
  return projects
    .map((project) => {
      const dueToday = isToday(project.dueDate);
      const items = getFocusableItems(project.items).filter(
        (i) =>
          i.status !== 'completed' &&
          (isToday(i.scheduledDate) || (dueToday && !i.scheduledDate)),
      );
      return { project, items };
    })
    .filter((group) => group.items.length > 0);
}
