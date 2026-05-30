import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Copy, Flame, LayoutDashboard, RotateCcw } from 'lucide-react';
import type { Project } from '../../types';
import { useApp } from '../../store/AppContext';
import { CompletionIllustration } from '../illustrations/CompletionIllustration';
import { ProjectMark } from '../illustrations/ProjectMark';
import {
  formatDuration,
  getBufferMinutesUsed,
  getCompletedCount,
  getCompletedFocusMinutes,
  getTotalPlannedMinutes,
} from '../../utils/flowHelpers';

type Props = {
  project: Project;
  bonusXp: number;
  onViewHistory: () => void;
  onBackToDashboard: () => void;
  onReset: () => void;
  onDuplicate: () => void;
};

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

export function CompletionSummary({
  project,
  bonusXp,
  onViewHistory,
  onBackToDashboard,
  onReset,
  onDuplicate,
}: Props) {
  const { sessions, stats } = useApp();
  const projectSessions = sessions.filter((s) => s.projectId === project.id);
  const xpFromSessions = projectSessions.reduce((sum, s) => sum + s.xpEarned, 0);
  const totalXp = xpFromSessions + bonusXp;
  const animatedXp = useCountUp(totalXp);

  const rows = [
    { label: 'Planned time', value: formatDuration(getTotalPlannedMinutes(project.items)) },
    { label: 'Actual focus time', value: formatDuration(getCompletedFocusMinutes(sessions, project.id)) },
    { label: 'Buffer time used', value: formatDuration(getBufferMinutesUsed(sessions, project.id)) },
    { label: 'Blocks completed', value: `${getCompletedCount(project.items)}` },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"
      >
        <div className="mb-6 text-center">
          <CompletionIllustration className="mx-auto h-20 w-20" />
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-neutral-900">Flow complete</h2>
          <div className="mt-1.5 flex items-center justify-center gap-2 text-sm text-neutral-500">
            <ProjectMark mark={project.icon} color={project.color ?? 'var(--color-flow-500)'} size={18} className="rounded-md" />
            {project.title}
          </div>
        </div>

        <div className="mb-4 rounded-2xl bg-flow-50 py-4 text-center">
          <p className="text-3xl font-semibold tabular-nums text-flow-700">{animatedXp} XP</p>
          <div className="mt-1 flex items-center justify-center gap-3 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              {stats.streakDays} day streak
            </span>
            {bonusXp > 0 && <span className="text-amber-600">+{bonusXp} completion bonus</span>}
          </div>
        </div>

        <div className="divide-y divide-neutral-100 rounded-2xl bg-neutral-50 px-4">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-neutral-500">{r.label}</span>
              <span className="font-semibold tabular-nums text-neutral-800">{r.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={onBackToDashboard} className="btn-ghost flex-1 py-2.5">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>
          <button onClick={onViewHistory} className="btn-primary flex-1 py-2.5">
            View history
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <button onClick={onReset} className="btn-subtle flex-1 py-2 text-neutral-500">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset statuses
          </button>
          <button onClick={onDuplicate} className="btn-subtle flex-1 py-2 text-neutral-500">
            <Copy className="h-3.5 w-3.5" />
            Duplicate as template
          </button>
        </div>
      </motion.div>
    </div>
  );
}
