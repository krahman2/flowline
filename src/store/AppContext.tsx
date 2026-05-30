import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  PROJECT_COMPLETION_BONUS,
  calculateSessionXp,
  updateStatsAfterSession,
} from './gamification';
import { loadState, saveState, resetState, loadSampleState } from './storage';
import { useAuth } from './AuthContext';
import { loadCloudState, saveCloudState } from '../lib/cloudSync';
import { mergeAppState } from '../lib/mergeAppState';
import type {
  AppState,
  FlowItem,
  FocusSession,
  PomodoroSettings,
  Preferences,
  Project,
  UserStats,
} from '../types';
import { buildTemplateItems, type ProjectTemplate } from './templates';
import {
  advanceToNextItem,
  autoCompleteRollupParents,
  completeChildBlocks,
  getEffectiveDurationMinutes,
  getFocusableItems,
  getSortedItems,
  isProjectComplete,
  isRollupParent,
  resetProjectFlow,
  syncParentDurations,
} from '../utils/flowHelpers';

type NewItemInput = Omit<FlowItem, 'id' | 'projectId' | 'order' | 'status'> & {
  status?: FlowItem['status'];
};

export type CompleteResult = {
  session: FocusSession;
  projectComplete: boolean;
  bonusXp: number;
};

type AppContextValue = {
  state: AppState;
  projects: Project[];
  stats: UserStats;
  pomodoro: PomodoroSettings;
  preferences: Preferences;
  sessions: FocusSession[];
  getProject: (id: string) => Project | undefined;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'items'>) => string;
  createProjectFromTemplate: (
    meta: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'items'>,
    template: ProjectTemplate,
  ) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  duplicateProject: (id: string) => string;
  deleteProject: (id: string) => void;
  addItem: (projectId: string, item: NewItemInput, afterItemId?: string) => void;
  updateItem: (projectId: string, itemId: string, updates: Partial<FlowItem>) => void;
  deleteItem: (projectId: string, itemId: string) => void;
  duplicateItem: (projectId: string, itemId: string) => void;
  moveItem: (projectId: string, itemId: string, direction: 'up' | 'down') => void;
  addBufferAfter: (projectId: string, afterItemId: string, minutes: number) => void;
  startFlow: (projectId: string) => void;
  setCurrentItem: (projectId: string, itemId: string) => void;
  toggleItemComplete: (projectId: string, itemId: string) => void;
  completeItem: (
    projectId: string,
    itemId: string,
    actualMinutes: number,
    bufferUsedMinutes?: number,
  ) => CompleteResult;
  skipItem: (projectId: string, itemId: string) => void;
  updatePomodoro: (settings: Partial<PomodoroSettings>) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  updateWeeklyGoal: (minutes: number) => void;
  resetData: () => void;
  loadSampleData: () => void;
  exportData: () => AppState;
  importData: (next: AppState) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function withFreshTimestamps(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() };
}

function reindex(items: FlowItem[]): FlowItem[] {
  return getSortedItems(items).map((item, idx) => ({ ...item, order: idx }));
}

function finalizeItems(items: FlowItem[]): FlowItem[] {
  return syncParentDurations(reindex(items));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, authReady, setSyncStatus, isConfigured } = useAuth();
  const [state, setState] = useState<AppState>(() => loadState());
  const [cloudHydrated, setCloudHydrated] = useState(false);
  const skipCloudSave = useRef(false);
  const syncUserRef = useRef<string | null>(null);

  // Merge local + cloud when user signs in (or returns on refresh)
  useEffect(() => {
    if (!authReady) return;

    if (!user || !isConfigured) {
      syncUserRef.current = null;
      setCloudHydrated(true);
      return;
    }

    if (syncUserRef.current === user.uid) return;

    setCloudHydrated(false);
    let cancelled = false;

    (async () => {
      setSyncStatus('syncing');
      try {
        const local = loadState();
        const cloud = await loadCloudState(user.uid);
        const merged = mergeAppState(local, cloud);
        skipCloudSave.current = true;
        if (!cancelled) {
          setState(merged);
          saveState(merged);
          await saveCloudState(user.uid, merged, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
          syncUserRef.current = user.uid;
          setCloudHydrated(true);
          setSyncStatus('synced');
        }
      } catch (err) {
        console.error('Cloud sync failed:', err);
        if (!cancelled) {
          syncUserRef.current = user.uid;
          setCloudHydrated(true);
          setSyncStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authReady, isConfigured, setSyncStatus]);

  // Always persist locally
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Debounced cloud save when signed in
  useEffect(() => {
    if (!user || !cloudHydrated || !isConfigured) return;
    if (skipCloudSave.current) {
      skipCloudSave.current = false;
      return;
    }

    setSyncStatus('syncing');
    const timer = window.setTimeout(async () => {
      try {
        await saveCloudState(user.uid, state, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        setSyncStatus('synced');
      } catch (err) {
        console.error('Cloud save failed:', err);
        setSyncStatus('error');
      }
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [state, user, cloudHydrated, isConfigured, setSyncStatus]);

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    setState(updater);
  }, []);

  const mapProject = useCallback(
    (projectId: string, fn: (p: Project) => Project) => {
      update((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === projectId ? withFreshTimestamps(fn(p)) : p,
        ),
      }));
    },
    [update],
  );

  const getProject = useCallback(
    (id: string) => state.projects.find((p) => p.id === id),
    [state.projects],
  );

  const addProject = useCallback(
    (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'items'>) => {
      const id = uuidv4();
      const ts = new Date().toISOString();
      update((prev) => ({
        ...prev,
        projects: [...prev.projects, { ...project, id, items: [], createdAt: ts, updatedAt: ts }],
      }));
      return id;
    },
    [update],
  );

  const createProjectFromTemplate = useCallback(
    (
      meta: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'items'>,
      template: ProjectTemplate,
    ) => {
      const id = uuidv4();
      const ts = new Date().toISOString();
      const items = buildTemplateItems(id, template);
      update((prev) => ({
        ...prev,
        projects: [...prev.projects, { ...meta, id, items, createdAt: ts, updatedAt: ts }],
      }));
      return id;
    },
    [update],
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => mapProject(id, (p) => ({ ...p, ...updates })),
    [mapProject],
  );

  const duplicateProject = useCallback(
    (id: string) => {
      const source = state.projects.find((p) => p.id === id);
      if (!source) return id;
      const newId = uuidv4();
      const ts = new Date().toISOString();
      const idMap = new Map<string, string>();
      source.items.forEach((i) => idMap.set(i.id, uuidv4()));
      const items: FlowItem[] = getSortedItems(source.items).map((i) => ({
        ...i,
        id: idMap.get(i.id)!,
        projectId: newId,
        parentId: i.parentId ? idMap.get(i.parentId) : undefined,
        status: 'not_started',
      }));
      const firstFocusable = items.find((i) => i.type !== 'section' && i.type !== 'milestone');
      if (firstFocusable) firstFocusable.status = 'current';
      update((prev) => ({
        ...prev,
        projects: [
          ...prev.projects,
          { ...source, id: newId, title: `${source.title} (copy)`, items, createdAt: ts, updatedAt: ts },
        ],
      }));
      return newId;
    },
    [state.projects, update],
  );

  const deleteProject = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id),
        sessions: prev.sessions.filter((s) => s.projectId !== id),
      }));
    },
    [update],
  );

  const addItem = useCallback(
    (projectId: string, item: NewItemInput, afterItemId?: string) => {
      mapProject(projectId, (p) => {
        const newItem: FlowItem = {
          ...item,
          id: uuidv4(),
          projectId,
          order: 0,
          status: item.status ?? 'not_started',
        };
        let items: FlowItem[];
        if (afterItemId) {
          const sorted = getSortedItems(p.items);
          const idx = sorted.findIndex((i) => i.id === afterItemId);
          if (idx === -1) sorted.push(newItem);
          else sorted.splice(idx + 1, 0, newItem);
          items = reindex(sorted);
        } else {
          const maxOrder = p.items.reduce((max, i) => Math.max(max, i.order), -1);
          newItem.order = maxOrder + 1;
          items = [...p.items, newItem];
        }
        const hasCurrent = getFocusableItems(items).some((i) => i.status === 'current');
        if (!hasCurrent && newItem.type !== 'section' && newItem.type !== 'milestone') {
          newItem.status = 'current';
          items = items.map((i) => (i.id === newItem.id ? { ...i, status: 'current' } : i));
        }
        return { ...p, items: finalizeItems(items) };
      });
    },
    [mapProject],
  );

  const updateItem = useCallback(
    (projectId: string, itemId: string, updates: Partial<FlowItem>) => {
      mapProject(projectId, (p) => ({
        ...p,
        items: finalizeItems(
          p.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
        ),
      }));
    },
    [mapProject],
  );

  const deleteItem = useCallback(
    (projectId: string, itemId: string) => {
      mapProject(projectId, (p) => {
        const toRemove = new Set<string>([itemId]);
        const collect = (parentId: string) => {
          p.items
            .filter((i) => i.parentId === parentId)
            .forEach((child) => {
              toRemove.add(child.id);
              collect(child.id);
            });
        };
        collect(itemId);
        let items = p.items.filter((i) => !toRemove.has(i.id));
        // keep a current item if we removed it
        if (!getFocusableItems(items).some((i) => i.status === 'current')) {
          const next = getFocusableItems(items).find(
            (i) => i.status !== 'completed' && i.status !== 'skipped',
          );
          if (next) items = items.map((i) => (i.id === next.id ? { ...i, status: 'current' } : i));
        }
        return { ...p, items: finalizeItems(items) };
      });
    },
    [mapProject],
  );

  const duplicateItem = useCallback(
    (projectId: string, itemId: string) => {
      mapProject(projectId, (p) => {
        const original = p.items.find((i) => i.id === itemId);
        if (!original) return p;
        const sorted = getSortedItems(p.items);
        const idx = sorted.findIndex((i) => i.id === itemId);
        const copy: FlowItem = {
          ...original,
          id: uuidv4(),
          title: `${original.title} (copy)`,
          status: 'not_started',
        };
        sorted.splice(idx + 1, 0, copy);
        return { ...p, items: finalizeItems(sorted) };
      });
    },
    [mapProject],
  );

  const moveItem = useCallback(
    (projectId: string, itemId: string, direction: 'up' | 'down') => {
      mapProject(projectId, (p) => {
        const sorted = getSortedItems(p.items);
        const idx = sorted.findIndex((i) => i.id === itemId);
        if (idx === -1) return p;
        const swapWith = direction === 'up' ? idx - 1 : idx + 1;
        if (swapWith < 0 || swapWith >= sorted.length) return p;
        [sorted[idx], sorted[swapWith]] = [sorted[swapWith], sorted[idx]];
        return { ...p, items: finalizeItems(sorted) };
      });
    },
    [mapProject],
  );

  const addBufferAfter = useCallback(
    (projectId: string, afterItemId: string, minutes: number) => {
      mapProject(projectId, (p) => {
        const sorted = getSortedItems(p.items);
        const idx = sorted.findIndex((i) => i.id === afterItemId);
        if (idx === -1) return p;
        const buffer: FlowItem = {
          id: uuidv4(),
          projectId,
          title: `Buffer (${minutes}m)`,
          type: 'buffer',
          durationMinutes: minutes,
          status: 'not_started',
          order: 0,
          notes: 'Flex time added during focus.',
        };
        sorted.splice(idx + 1, 0, buffer);
        return { ...p, items: finalizeItems(sorted) };
      });
    },
    [mapProject],
  );

  const startFlow = useCallback(
    (projectId: string) => {
      mapProject(projectId, (p) => ({ ...p, items: resetProjectFlow(p.items) }));
    },
    [mapProject],
  );

  const setCurrentItem = useCallback(
    (projectId: string, itemId: string) => {
      mapProject(projectId, (p) => ({
        ...p,
        items: p.items.map((i) => ({
          ...i,
          status:
            i.id === itemId
              ? 'current'
              : i.status === 'current'
                ? 'not_started'
                : i.status,
        })),
      }));
    },
    [mapProject],
  );

  const toggleItemComplete = useCallback(
    (projectId: string, itemId: string) => {
      mapProject(projectId, (p) => {
        const item = p.items.find((i) => i.id === itemId);
        if (!item || item.type === 'section' || item.type === 'milestone') return p;
        const nextStatus: FlowItem['status'] =
          item.status === 'completed' ? 'not_started' : 'completed';
        let items = p.items.map((i) =>
          i.id === itemId ? { ...i, status: nextStatus } : i,
        );
        if (nextStatus === 'completed' && isRollupParent(p.items, item)) {
          items = completeChildBlocks(items, itemId);
        }
        items = autoCompleteRollupParents(finalizeItems(items));
        return { ...p, items };
      });
    },
    [mapProject],
  );

  const completeItem = useCallback(
    (projectId: string, itemId: string, actualMinutes: number, bufferUsedMinutes = 0) => {
      let result: CompleteResult = {
        session: {} as FocusSession,
        projectComplete: false,
        bonusXp: 0,
      };

      update((prev) => {
        const project = prev.projects.find((p) => p.id === projectId);
        if (!project) return prev;
        const item = project.items.find((i) => i.id === itemId);
        const isBuffer = item?.type === 'buffer';

        const xpEarned = calculateSessionXp(actualMinutes);
        const plannedMinutes = item
          ? getEffectiveDurationMinutes(project.items, item)
          : actualMinutes;
        const session: FocusSession = {
          id: uuidv4(),
          projectId,
          itemId,
          startedAt: new Date(Date.now() - actualMinutes * 60000).toISOString(),
          endedAt: new Date().toISOString(),
          plannedMinutes,
          actualMinutes,
          completed: true,
          bufferUsedMinutes: isBuffer ? actualMinutes : bufferUsedMinutes || undefined,
          xpEarned,
        };

        let updatedItems = project.items;
        if (item && isRollupParent(project.items, item)) {
          updatedItems = completeChildBlocks(updatedItems, itemId);
        }
        updatedItems = advanceToNextItem(updatedItems, itemId, 'completed');
        const projectComplete = isProjectComplete(updatedItems);

        let stats = updateStatsAfterSession(prev.stats, session);
        let bonusXp = 0;
        if (projectComplete) {
          bonusXp = PROJECT_COMPLETION_BONUS;
          stats = { ...stats, totalXp: stats.totalXp + bonusXp };
        }

        result = { session, projectComplete, bonusXp };

        return {
          ...prev,
          projects: prev.projects.map((p) =>
            p.id === projectId ? withFreshTimestamps({ ...p, items: updatedItems }) : p,
          ),
          sessions: [...prev.sessions, session],
          stats,
        };
      });

      return result;
    },
    [update],
  );

  const skipItem = useCallback(
    (projectId: string, itemId: string) => {
      update((prev) => {
        const project = prev.projects.find((p) => p.id === projectId);
        if (!project) return prev;
        const item = project.items.find((i) => i.id === itemId);
        const session: FocusSession = {
          id: uuidv4(),
          projectId,
          itemId,
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          plannedMinutes: item?.durationMinutes ?? 0,
          actualMinutes: 0,
          completed: false,
          skipped: true,
          xpEarned: 0,
        };
        const updatedItems = advanceToNextItem(project.items, itemId, 'skipped');
        return {
          ...prev,
          projects: prev.projects.map((p) =>
            p.id === projectId ? withFreshTimestamps({ ...p, items: updatedItems }) : p,
          ),
          sessions: [...prev.sessions, session],
        };
      });
    },
    [update],
  );

  const updatePomodoro = useCallback(
    (settings: Partial<PomodoroSettings>) =>
      update((prev) => ({ ...prev, pomodoro: { ...prev.pomodoro, ...settings } })),
    [update],
  );

  const updatePreferences = useCallback(
    (prefs: Partial<Preferences>) =>
      update((prev) => ({ ...prev, preferences: { ...prev.preferences, ...prefs } })),
    [update],
  );

  const updateWeeklyGoal = useCallback(
    (minutes: number) =>
      update((prev) => ({
        ...prev,
        stats: { ...prev.stats, weeklyFocusGoalMinutes: minutes },
      })),
    [update],
  );

  const resetData = useCallback(() => setState(resetState()), []);

  const loadSampleData = useCallback(() => setState(loadSampleState()), []);

  const exportData = useCallback(() => state, [state]);

  const importData = useCallback((next: AppState) => setState(next), []);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      projects: state.projects,
      stats: state.stats,
      pomodoro: state.pomodoro,
      preferences: state.preferences,
      sessions: state.sessions,
      getProject,
      addProject,
      createProjectFromTemplate,
      updateProject,
      duplicateProject,
      deleteProject,
      addItem,
      updateItem,
      deleteItem,
      duplicateItem,
      moveItem,
      addBufferAfter,
      startFlow,
      setCurrentItem,
      toggleItemComplete,
      completeItem,
      skipItem,
      updatePomodoro,
      updatePreferences,
      updateWeeklyGoal,
      resetData,
      loadSampleData,
      exportData,
      importData,
    }),
    [
      state,
      getProject,
      addProject,
      createProjectFromTemplate,
      updateProject,
      duplicateProject,
      deleteProject,
      addItem,
      updateItem,
      deleteItem,
      duplicateItem,
      moveItem,
      addBufferAfter,
      startFlow,
      setCurrentItem,
      toggleItemComplete,
      completeItem,
      skipItem,
      updatePomodoro,
      updatePreferences,
      updateWeeklyGoal,
      resetData,
      loadSampleData,
      exportData,
      importData,
    ],
  );

  if (!authReady || (user && isConfigured && !cloudHydrated)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-sm text-neutral-500">Loading your flows…</p>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useProject(projectId: string | undefined) {
  const { getProject } = useApp();
  return projectId ? getProject(projectId) : undefined;
}
