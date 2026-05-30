import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Zap } from 'lucide-react';
import type { Project } from '../../types';
import { useApp } from '../../store/AppContext';
import {
  formatDuration,
  getCurrentItem,
  getEffectiveDurationMinutes,
  getNextFocusableItem,
  getProjectProgress,
} from '../../utils/flowHelpers';
import { ProgressBar } from '../ui/ProgressBar';
import { FlowlineTimeline } from '../flowline/FlowlineTimeline';
import { AddBufferModal } from '../modals/AddBufferModal';
import { CompletionSummary } from './CompletionSummary';
import { ProjectMark } from '../illustrations/ProjectMark';
import { CompletionIllustration } from '../illustrations/CompletionIllustration';
import { useWakeLock } from '../../hooks/useWakeLock';
import { vibrateOnTimerComplete } from '../../utils/mobileFeedback';
import type { FocusTimerControls } from './FocusTimer';

type Props = {
  project: Project;
  onClose: () => void;
};

export function FocusTimelineMode({ project, onClose }: Props) {
  const { completeItem, skipItem, addBufferAfter, pomodoro, preferences, startFlow, duplicateProject } =
    useApp();
  const navigate = useNavigate();
  const [timeUp, setTimeUp] = useState(false);

  const current = getCurrentItem(project.items);
  const currentId = current?.id;

  const plannedSeconds = useMemo(() => {
    if (!current) return 0;
    if (pomodoro.enabled) {
      if (current.type === 'break') return pomodoro.shortBreakMinutes * 60;
      return pomodoro.focusMinutes * 60;
    }
    return Math.max(1, getEffectiveDurationMinutes(project.items, current)) * 60;
  }, [current, pomodoro, project.items]);

  const [secondsLeft, setSecondsLeft] = useState(plannedSeconds);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [showBuffer, setShowBuffer] = useState(false);
  const [summary, setSummary] = useState<{ bonusXp: number } | null>(null);

  const currentNodeRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  useWakeLock(isRunning);

  // Reset timer when the active item changes
  useEffect(() => {
    setSecondsLeft(plannedSeconds);
    setElapsed(0);
    setIsRunning(false);
    setHasStarted(false);
    setTimeUp(false);
  }, [currentId, plannedSeconds]);

  // Auto-scroll to the current node
  useEffect(() => {
    const t = setTimeout(() => {
      currentNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    return () => clearTimeout(t);
  }, [currentId]);

  // Tick
  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
      setElapsed((e) => e + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const finish = useCallback(() => {
    if (!current) return;
    setIsRunning(false);
    const actualMinutes =
      elapsed > 0
        ? Math.max(1, Math.round(elapsed / 60))
        : Math.max(1, getEffectiveDurationMinutes(project.items, current));
    const { projectComplete, bonusXp, session } = completeItem(project.id, current.id, actualMinutes);
    setXpToast(session.xpEarned);
    window.setTimeout(() => setXpToast(null), 2200);
    if (projectComplete) setSummary({ bonusXp });
  }, [current, elapsed, completeItem, project.id]);

  // When the timer reaches zero: auto-advance if enabled, otherwise wait for the user
  useEffect(() => {
    if (isRunning && secondsLeft === 0) {
      setIsRunning(false);
      vibrateOnTimerComplete(preferences.soundEnabled);
      if (preferences.autoAdvance) {
        finish();
      } else {
        setTimeUp(true);
      }
    }
  }, [isRunning, secondsLeft, finish, preferences.autoAdvance, preferences.soundEnabled]);

  const handleSkip = useCallback(() => {
    if (!current) return;
    setIsRunning(false);
    skipItem(project.id, current.id);
  }, [current, skipItem, project.id]);

  const nextItem = current ? getNextFocusableItem(project.items, current.id) : undefined;

  const toggleRun = useCallback(() => {
    setIsRunning((r) => {
      if (!r) setHasStarted(true);
      return !r;
    });
  }, []);

  const openBuffer = useCallback(() => {
    setIsRunning(false);
    setShowBuffer(true);
  }, []);

  const timer: FocusTimerControls | null = current
    ? {
        secondsLeft,
        totalSeconds: plannedSeconds,
        isRunning,
        hasStarted,
        timeUp,
        accentColor: 'var(--color-flow-500)',
        nextTitle: nextItem?.title ?? null,
        onStart: toggleRun,
        onPause: () => setIsRunning(false),
        onComplete: finish,
        onSkip: handleSkip,
        onAddBuffer: openBuffer,
      }
    : null;

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (summary || showBuffer || !current) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggleRun();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        finish();
      } else if (e.key.toLowerCase() === 's') {
        handleSkip();
      } else if (e.key.toLowerCase() === 'b') {
        openBuffer();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [summary, showBuffer, current, toggleRun, finish, handleSkip, openBuffer]);

  const progress = getProjectProgress(project.items);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overscroll-y-contain bg-canvas animate-fade">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-200/70 bg-canvas/85 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
          <ProjectMark mark={project.icon} color={project.color ?? 'var(--color-flow-500)'} size={28} className="rounded-lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">{project.title}</p>
            <p className="truncate text-xs text-neutral-400">
              Focus mode · {current ? current.title : 'Flow complete'}
            </p>
          </div>
          <span className="ml-auto text-sm font-semibold tabular-nums text-neutral-700">{progress}%</span>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-2 sm:px-6">
          <ProgressBar value={progress} />
        </div>
      </header>

      {/* Scrollable timeline */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          {current ? (
            <FlowlineTimeline
              project={project}
              focusMode
              dimCompleted
              timer={timer}
              currentItemId={currentId}
              currentNodeRef={currentNodeRef}
            />
          ) : (
            <div className="flex flex-col items-center py-20 text-center">
              <CompletionIllustration className="h-24 w-24" />
              <p className="mt-5 text-lg font-semibold text-neutral-800">All blocks done</p>
              <p className="mt-1 text-sm text-neutral-500">You've reached the end of this flow.</p>
              <button onClick={onClose} className="btn-primary mx-auto mt-6">
                Back to project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* XP toast */}
      {xpToast !== null && (
        <div className="pointer-events-none fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-20 -translate-x-1/2 animate-rise">
          <div className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
            <Zap className="h-4 w-4 text-amber-400" />
            +{xpToast} XP · {formatDuration(elapsed / 60)} focused
          </div>
        </div>
      )}

      {showBuffer && (
        <AddBufferModal
          onClose={() => setShowBuffer(false)}
          onConfirm={(minutes) => {
            if (current) addBufferAfter(project.id, current.id, minutes);
            setShowBuffer(false);
          }}
        />
      )}

      {summary && (
        <CompletionSummary
          project={project}
          bonusXp={summary.bonusXp}
          onViewHistory={() => {
            onClose();
            navigate('/history');
          }}
          onBackToDashboard={() => {
            onClose();
            navigate('/');
          }}
          onReset={() => {
            startFlow(project.id);
            setSummary(null);
          }}
          onDuplicate={() => {
            const newId = duplicateProject(project.id);
            onClose();
            navigate(`/projects/${newId}`);
          }}
        />
      )}
    </div>
  );
}
