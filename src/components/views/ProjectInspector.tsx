import { Hourglass, ListPlus, Play, Timer, Zap } from 'lucide-react';
import type { FlowItem, Project } from '../../types';
import { useApp } from '../../store/AppContext';
import { ProgressRing } from '../ui/ProgressRing';
import { TypeChip } from '../ui/TypeChip';
import {
  formatDuration,
  getCompletedFocusMinutes,
  getCurrentItem,
  getProjectProgress,
  getRemainingMinutes,
  getTypeTheme,
  getUpcomingItems,
} from '../../utils/flowHelpers';

type Props = {
  project: Project;
  onStartFlow: () => void;
  onAddBlock: () => void;
};

export function ProjectInspector({ project, onStartFlow, onAddBlock }: Props) {
  const { sessions } = useApp();
  const current = getCurrentItem(project.items);
  const progress = getProjectProgress(project.items);
  const remaining = getRemainingMinutes(project.items);
  const focused = getCompletedFocusMinutes(sessions, project.id);
  const projectSessions = sessions.filter((s) => s.projectId === project.id);
  const xp = projectSessions.reduce((sum, s) => sum + s.xpEarned, 0);
  const upcoming = getUpcomingItems(project.items, 3);
  const color = project.color ?? 'var(--color-flow-500)';

  return (
    <div className="space-y-4">
      {/* Progress ring */}
      <div className="card flex items-center gap-4 p-5">
        <ProgressRing value={progress} color={color} size={88}>
          <span className="text-lg font-semibold tabular-nums text-neutral-900">{progress}%</span>
        </ProgressRing>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Flow progress</p>
          <p className="mt-1 text-sm font-medium text-neutral-700">
            {formatDuration(remaining)} remaining
          </p>
          <p className="text-xs text-neutral-400">{formatDuration(focused)} focused so far</p>
        </div>
      </div>

      {/* Current task */}
      {current && (
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Current block</p>
          <div className="mt-2 flex items-center gap-2">
            <TypeChip type={current.type} />
            <span className="text-xs text-neutral-400">{formatDuration(current.durationMinutes)}</span>
          </div>
          <p className="mt-1.5 font-semibold text-neutral-900">{current.title}</p>
          <button
            onClick={onStartFlow}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: color }}
          >
            <Play className="h-4 w-4" />
            Start Flow
          </button>
        </div>
      )}

      {/* Up next */}
      {upcoming.length > 0 && (
        <div className="card p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400">Up next</p>
          <div className="space-y-2.5">
            {upcoming.map((item) => (
              <UpcomingRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStat icon={Timer} label="Focused" value={formatDuration(focused)} />
        <MiniStat icon={Hourglass} label="Sessions" value={`${projectSessions.length}`} />
        <MiniStat icon={Zap} label="XP" value={`${xp}`} />
      </div>

      <button onClick={onAddBlock} className="btn-ghost w-full">
        <ListPlus className="h-4 w-4" />
        Add block
      </button>
    </div>
  );
}

function UpcomingRow({ item }: { item: FlowItem }) {
  const theme = getTypeTheme(item.type);
  return (
    <div className="flex items-center gap-2.5">
      <span className={`h-2 w-2 shrink-0 rounded-full ${theme.dot}`} />
      <span className="min-w-0 flex-1 truncate text-sm text-neutral-600">{item.title}</span>
      {item.durationMinutes > 0 && (
        <span className="shrink-0 text-xs tabular-nums text-neutral-400">
          {formatDuration(item.durationMinutes)}
        </span>
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Timer; label: string; value: string }) {
  return (
    <div className="card p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-neutral-400" />
      <p className="mt-1.5 text-sm font-semibold text-neutral-900">{value}</p>
      <p className="text-[11px] text-neutral-400">{label}</p>
    </div>
  );
}
