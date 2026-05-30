import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, ListChecks, Play } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useUI } from '../store/UIContext';
import { Page, PageHeader } from '../components/ui/PageHeader';
import { StatsCard } from '../components/ui/StatsCard';
import { ProgressRing } from '../components/ui/ProgressRing';
import { TypeChip } from '../components/ui/TypeChip';
import { EmptyState } from '../components/ui/EmptyState';
import { ProjectMark } from '../components/illustrations/ProjectMark';
import { EmptyFlowIllustration } from '../components/illustrations/EmptyFlowIllustration';
import {
  formatDuration,
  getTodayItems,
  isSameDay,
} from '../utils/flowHelpers';
import type { FlowItem, Project } from '../types';

type Row =
  | { kind: 'project'; project: Project }
  | { kind: 'item'; project: Project; item: FlowItem };

export function TodayPage() {
  const { projects, sessions } = useApp();
  const { openNewProject } = useUI();
  const navigate = useNavigate();

  const groups = getTodayItems(projects);
  const totalPlanned = groups.reduce(
    (sum, g) => sum + g.items.reduce((s, i) => s + i.durationMinutes, 0),
    0,
  );
  const remainingCount = groups.reduce((sum, g) => sum + g.items.length, 0);
  const completedToday = sessions.filter((s) => s.completed && isSameDay(s.startedAt, new Date())).length;
  const totalToday = remainingCount + completedToday;
  const dayPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const today = new Date();
  const firstProject = groups[0]?.project;

  const rows: Row[] = [];
  for (const g of groups) {
    rows.push({ kind: 'project', project: g.project });
    for (const item of g.items) rows.push({ kind: 'item', project: g.project, item });
  }

  return (
    <Page>
      <PageHeader
        title="Today Flow"
        subtitle={today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        actions={
          firstProject && (
            <button onClick={() => navigate(`/projects/${firstProject.id}?focus=1`)} className="btn-primary">
              <Play className="h-4 w-4" />
              Start Today Flow
            </button>
          )
        }
      />

      {groups.length === 0 ? (
        <EmptyState
          illustration={<EmptyFlowIllustration className="h-28 w-28" />}
          title="No scheduled blocks yet"
          description="Schedule blocks from a flow or set a due date for today to build your daily Flowline."
          actions={
            <>
              <Link to="/calendar" className="btn-primary">
                Schedule a block
              </Link>
              <Link to="/projects" className="btn-ghost">
                Open flows
              </Link>
              <button onClick={openNewProject} className="btn-ghost">
                Create quick flow
              </button>
            </>
          }
        />
      ) : (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
          {/* Combined daily flowline */}
          <div className="mx-auto w-full max-w-2xl">
            <div className="group/timeline relative">
              <div className="pointer-events-none absolute bottom-4 left-[22px] top-4 w-[2px] -translate-x-1/2 rounded-full bg-neutral-200/80" />
              <div
                className="pointer-events-none absolute left-[22px] top-4 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-flow-400 to-flow-500 transition-all duration-700"
                style={{ height: `calc(${dayPct}% - 1rem)` }}
              />
              {rows.map((row) =>
                row.kind === 'project' ? (
                  <div key={`p-${row.project.id}`} className="relative grid grid-cols-[44px_1fr] items-center pb-1 pt-6 first:pt-1">
                    <div className="flex justify-center">
                      <span className="relative z-10 rounded-lg bg-canvas p-0.5">
                        <ProjectMark mark={row.project.icon} color={row.project.color ?? 'var(--color-flow-500)'} size={28} className="rounded-lg" />
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link to={`/projects/${row.project.id}`} className="text-sm font-semibold text-neutral-800 hover:text-flow-700">
                        {row.project.title}
                      </Link>
                      <span className="h-px flex-1 bg-neutral-200" />
                      <button
                        onClick={() => navigate(`/projects/${row.project.id}?focus=1`)}
                        className="rounded-lg bg-flow-50 px-2.5 py-1 text-xs font-medium text-flow-700 hover:bg-flow-100"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={row.item.id} className="relative grid grid-cols-[44px_1fr]">
                    <div className="flex justify-center pt-3.5">
                      <span className="relative z-10 bg-canvas py-1">
                        <span
                          className={`block h-5 w-5 rounded-full border-2 ${
                            row.item.status === 'current'
                              ? 'border-flow-500 bg-white'
                              : 'border-neutral-300 bg-white'
                          }`}
                        />
                      </span>
                    </div>
                    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-neutral-200/70 bg-white p-3.5">
                      <TypeChip type={row.item.type} />
                      <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-neutral-800">
                        {row.item.title}
                      </span>
                      <span className="text-xs tabular-nums text-neutral-400">
                        {formatDuration(row.item.durationMinutes)}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Side summary */}
          <aside className="space-y-4">
            <div className="card flex items-center gap-4 p-5">
              <ProgressRing value={dayPct} size={72}>
                <span className="text-sm font-semibold tabular-nums">{dayPct}%</span>
              </ProgressRing>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Today</p>
                <p className="mt-1 text-sm text-neutral-600">{completedToday} done · {remainingCount} left</p>
              </div>
            </div>
            <StatsCard icon={Clock} label="Planned focus" value={formatDuration(totalPlanned)} accent="flow" />
            <div className="grid grid-cols-2 gap-3">
              <StatsCard icon={ListChecks} label="Remaining" value={`${remainingCount}`} />
              <StatsCard icon={CheckCircle2} label="Completed" value={`${completedToday}`} accent="mint" />
            </div>
          </aside>
        </div>
      )}
    </Page>
  );
}
