import { ArrowRight, Check, Coffee, Pause, Play, SkipForward } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { formatDuration, formatTimer } from '../../utils/flowHelpers';

export type FocusTimerControls = {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  hasStarted: boolean;
  timeUp?: boolean;
  accentColor: string;
  nextTitle?: string | null;
  onStart: () => void;
  onPause: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onAddBuffer: () => void;
};

export function FocusTimer(props: FocusTimerControls) {
  const {
    secondsLeft,
    totalSeconds,
    isRunning,
    hasStarted,
    timeUp,
    accentColor,
    nextTitle,
    onStart,
    onPause,
    onComplete,
    onSkip,
    onAddBuffer,
  } = props;

  const elapsedSeconds = Math.max(0, totalSeconds - secondsLeft);
  const elapsedPct = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;

  return (
    <div className="mt-4">
      <div className="flex items-end justify-between gap-4">
        <div
          className="font-mono text-[3.25rem] font-light leading-none tabular-nums tracking-tight text-neutral-900 sm:text-6xl"
          aria-live="polite"
        >
          {formatTimer(secondsLeft)}
        </div>
        <div className="pb-1 text-right">
          <p className="text-xs font-medium tabular-nums text-neutral-400">
            {Math.round(elapsedPct)}% elapsed
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-400">
            {formatDuration(elapsedSeconds / 60)} of {formatDuration(totalSeconds / 60)}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar value={elapsedPct} color={accentColor} className="h-2.5" animated={isRunning} />
      </div>

      {timeUp && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
          Time's up — complete the block or add buffer
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!isRunning ? (
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            <Play className="h-4 w-4" />
            {hasStarted ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>
        )}

        <button
          onClick={onComplete}
          className="inline-flex items-center gap-2 rounded-xl bg-mint-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mint-600"
        >
          <Check className="h-4 w-4" />
          Complete
        </button>

        <button
          onClick={onAddBuffer}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
        >
          <Coffee className="h-4 w-4" />
          Buffer
        </button>

        <button onClick={onSkip} className="btn-subtle ml-auto py-2.5 text-neutral-400">
          <SkipForward className="h-4 w-4" />
          Skip
        </button>
      </div>

      {nextTitle && (
        <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3 text-sm text-neutral-400">
          <ArrowRight className="h-3.5 w-3.5" />
          Next: <span className="font-medium text-neutral-600">{nextTitle}</span>
        </div>
      )}

      <p className="mt-3 text-[11px] text-neutral-300">
        Space start/pause · Enter complete · S skip · B buffer
      </p>
    </div>
  );
}
