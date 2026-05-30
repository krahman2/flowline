import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import type { Project } from '../../types';
import { ProgressBar } from './ProgressBar';
import { ProjectMark } from '../illustrations/ProjectMark';
import {
  formatDuration,
  getCurrentItem,
  getNextFocusableItem,
  getProjectProgress,
  getRemainingMinutes,
  getSortedItems,
  getTotalPlannedMinutes,
  getTypeTheme,
  isProjectComplete,
  isToday,
  toDateKey,
} from '../../utils/flowHelpers';

type Status = { label: string; cls: string };

function projectStatus(project: Project): Status {
  if (isProjectComplete(project.items)) return { label: 'Completed', cls: 'bg-mint-50 text-mint-600' };
  if (project.dueDate) {
    const due = new Date(project.dueDate);
    const days = Math.ceil((due.getTime() - Date.now()) / 86400000);
    if (days < 0) return { label: 'Overdue', cls: 'bg-red-50 text-red-600' };
    if (days <= 2) return { label: 'Due soon', cls: 'bg-amber-50 text-amber-600' };
  }
  const scheduled = project.items.some((i) => isToday(i.scheduledDate) || (i.scheduledDate && toDateKey(i.scheduledDate) >= toDateKey(new Date())));
  if (getCurrentItem(project.items) || scheduled) return { label: 'On track', cls: 'bg-flow-50 text-flow-600' };
  return { label: 'Not scheduled', cls: 'bg-neutral-100 text-neutral-500' };
}

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  const progress = getProjectProgress(project.items);
  const planned = getTotalPlannedMinutes(project.items);
  const remaining = getRemainingMinutes(project.items);
  const current = getCurrentItem(project.items);
  const next = current ? getNextFocusableItem(project.items, current.id) : undefined;
  const complete = isProjectComplete(project.items);
  const color = project.color ?? 'var(--color-flow-500)';
  const status = projectStatus(project);
  const preview = getSortedItems(project.items).slice(0, 8);

  return (
    <Link to={`/projects/${project.id}`} className="card card-hover group flex flex-col p-4">
      <div className="flex items-start gap-3">
        <ProjectMark mark={project.icon} color={color} size={40} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-neutral-900">{project.title}</h3>
          <p className="mt-0.5 text-xs text-neutral-400">
            {project.dueDate ? `Due ${project.dueDate}` : 'No due date'}
          </p>
        </div>
        <span className={`chip ${status.cls}`}>{status.label}</span>
      </div>

      {/* Mini flow dots */}
      <div className="mt-3.5 flex items-center gap-1">
        {preview.map((item) => {
          const done = item.status === 'completed' || item.status === 'skipped';
          const isCurrent = item.status === 'current';
          return (
            <span
              key={item.id}
              className={`h-1.5 flex-1 rounded-full ${
                done ? 'bg-flow-500' : isCurrent ? getTypeTheme(item.type).dot : 'bg-neutral-200'
              }`}
            />
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
        <span className="font-medium text-neutral-600 tabular-nums">{progress}%</span>
        <span>{formatDuration(planned)} planned</span>
        <span className="h-1 w-1 rounded-full bg-neutral-300" />
        <span>{formatDuration(remaining)} left</span>
      </div>

      <div className="mt-2">
        <ProgressBar value={complete ? 100 : progress} color={color} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3.5">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-neutral-400">
            {complete ? 'Status' : 'Current'}
          </p>
          <p className="truncate text-sm font-medium text-neutral-700">
            {complete ? 'Flow complete' : (current?.title ?? 'Not started')}
          </p>
          {!complete && next && (
            <p className="truncate text-xs text-neutral-400">Next · {next.title}</p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            navigate(`/projects/${project.id}${complete ? '' : '?focus=1'}`);
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-flow-50 px-3 py-1.5 text-sm font-medium text-flow-700 transition group-hover:bg-flow-100"
        >
          {complete ? (
            <>
              View <ArrowRight className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" /> Continue
            </>
          )}
        </button>
      </div>
    </Link>
  );
}
