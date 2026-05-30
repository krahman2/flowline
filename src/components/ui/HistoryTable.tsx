import { Zap } from 'lucide-react';
import type { FocusSession, Project } from '../../types';
import { formatDuration } from '../../utils/flowHelpers';
import { ProjectMark } from '../illustrations/ProjectMark';

type Props = {
  sessions: FocusSession[];
  projects: Project[];
  showProject?: boolean;
};

export function HistoryTable({ sessions, projects, showProject = true }: Props) {
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  const lookup = (id: string) => projects.find((p) => p.id === id);

  if (sorted.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-neutral-600">No sessions yet</p>
        <p className="mt-1 text-sm text-neutral-400">
          Start a flow to begin logging your focus history.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Desktop header */}
      <div className="hidden grid-cols-[7rem_1fr_5rem_5rem_5rem_4rem] gap-3 border-b border-neutral-100 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-neutral-400 md:grid">
        <span>Date</span>
        <span>Task{showProject ? ' / Project' : ''}</span>
        <span className="text-right">Planned</span>
        <span className="text-right">Actual</span>
        <span className="text-right">XP</span>
        <span className="text-right">Status</span>
      </div>

      <div className="divide-y divide-neutral-100">
        {sorted.map((s) => {
          const project = lookup(s.projectId);
          const item = project?.items.find((i) => i.id === s.itemId);
          const d = new Date(s.startedAt);
          const status = s.skipped ? 'Skipped' : 'Completed';
          return (
            <div
              key={s.id}
              className="grid grid-cols-2 gap-3 px-4 py-3 text-sm md:grid-cols-[7rem_1fr_5rem_5rem_5rem_4rem] md:items-center"
            >
              <span className="order-1 text-xs tabular-nums text-neutral-500 md:order-none">
                {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                <span className="ml-1 text-neutral-400">
                  {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </span>
              <div className="order-3 col-span-2 min-w-0 md:order-none md:col-span-1">
                <p className="truncate font-medium text-neutral-800">{item?.title ?? 'Untitled'}</p>
                {showProject && (
                  <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                    {project && (
                      <ProjectMark mark={project.icon} color={project.color ?? 'var(--color-flow-500)'} size={16} className="rounded" />
                    )}
                    <span className="truncate">{project?.title}</span>
                  </span>
                )}
              </div>
              <span className="order-4 text-right text-xs tabular-nums text-neutral-500 md:order-none">
                {formatDuration(s.plannedMinutes)}
              </span>
              <span className="order-5 text-right text-xs tabular-nums text-neutral-700 md:order-none">
                {formatDuration(s.actualMinutes)}
              </span>
              <span className="order-2 flex items-center justify-end gap-1 text-right text-xs font-medium text-amber-600 md:order-none">
                <Zap className="h-3 w-3" />
                {s.xpEarned}
              </span>
              <span className="order-6 text-right md:order-none">
                <span
                  className={`chip ${
                    s.skipped ? 'bg-neutral-100 text-neutral-500' : 'bg-mint-50 text-mint-600'
                  }`}
                >
                  {status}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
