import { Target } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { formatDuration } from '../../utils/flowHelpers';

type Props = {
  focusMinutes: number;
  goalMinutes: number;
  compact?: boolean;
};

export function GoalProgressCard({ focusMinutes, goalMinutes, compact }: Props) {
  const pct = goalMinutes > 0 ? Math.min(100, Math.round((focusMinutes / goalMinutes) * 100)) : 0;

  if (compact) {
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-neutral-500">Weekly focus</span>
          <span className="tabular-nums text-neutral-400">{pct}%</span>
        </div>
        <ProgressBar value={pct} color="var(--color-mint-500)" />
        <p className="mt-1.5 text-[11px] text-neutral-400">
          {formatDuration(focusMinutes)} of {formatDuration(goalMinutes)}
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint-50 text-mint-600">
          <Target className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Weekly focus goal</p>
          <p className="text-xs text-neutral-400">
            {formatDuration(focusMinutes)} of {formatDuration(goalMinutes)}
          </p>
        </div>
        <span className="ml-auto text-xl font-semibold tabular-nums text-mint-600">{pct}%</span>
      </div>
      <ProgressBar value={pct} color="var(--color-mint-500)" className="h-2" />
    </div>
  );
}
