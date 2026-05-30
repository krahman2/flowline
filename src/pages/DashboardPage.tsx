import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Flame, FolderPlus, ListPlus, Play, Plus, Zap } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useUI } from '../store/UIContext';
import { getWeeklyFocusMinutes } from '../store/gamification';
import { Page } from '../components/ui/PageHeader';
import { ProjectCard } from '../components/ui/ProjectCard';
import { GoalProgressCard } from '../components/ui/GoalProgressCard';
import { HistoryTable } from '../components/ui/HistoryTable';
import { ProgressRing } from '../components/ui/ProgressRing';
import { TypeChip } from '../components/ui/TypeChip';
import { ProjectMark } from '../components/illustrations/ProjectMark';
import { EmptyFlowIllustration } from '../components/illustrations/EmptyFlowIllustration';
import { AddItemModal } from '../components/modals/AddItemModal';
import {
  formatDuration,
  getCurrentItem,
  getProjectProgress,
  getSortedItems,
  getTodayItems,
  getTypeTheme,
  getUpcomingItems,
  isProjectComplete,
} from '../utils/flowHelpers';
import type { Project } from '../types';

export function DashboardPage() {
  const { projects, sessions, stats } = useApp();
  const { openNewProject } = useUI();
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  const activeProjects = projects.filter((p) => !isProjectComplete(p.items));
  const continueProject =
    [...projects]
      .filter((p) => getCurrentItem(p.items))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] ?? projects[0];

  const todayGroups = getTodayItems(projects);
  const todayPlanned = todayGroups.reduce(
    (sum, g) => sum + g.items.reduce((s, i) => s + i.durationMinutes, 0),
    0,
  );
  const weeklyMinutes = getWeeklyFocusMinutes(sessions);
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (projects.length === 0) {
    return (
      <Page>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mx-auto mt-6 max-w-2xl"
        >
          <div className="card flex flex-col items-center px-6 py-14 text-center">
            <EmptyFlowIllustration className="h-32 w-32" />
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-900">
              Welcome to Flowline
            </h1>
            <p className="mt-2 max-w-md text-sm text-neutral-500">
              Turn a project into a timed progress path. Start blank or pick a template when you
              create your flow.
            </p>
            <div className="mt-7">
              <button onClick={openNewProject} className="btn-primary px-6 py-2.5">
                <Plus className="h-4 w-4" />
                Create flow
              </button>
            </div>
          </div>
        </motion.div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{greeting}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {activeProjects.length > 0
              ? `${activeProjects.length} active flow${activeProjects.length > 1 ? 's' : ''} · ${formatDuration(todayPlanned)} planned today`
              : 'Start a new flow to get going.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={openNewProject} className="btn-ghost">
            <FolderPlus className="h-4 w-4 text-flow-600" />
            New flow
          </button>
          <button
            onClick={() => setAddTaskOpen(true)}
            disabled={projects.length === 0}
            className="btn-ghost disabled:opacity-40"
          >
            <ListPlus className="h-4 w-4 text-flow-600" />
            Add block
          </button>
        </div>
      </div>

      {/* Hero: Continue Flow */}
      {continueProject && getCurrentItem(continueProject.items) && (
        <ContinueFlowHero project={continueProject} />
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-700">Your flows</h2>
              <Link to="/projects" className="text-xs font-medium text-flow-600 hover:text-flow-700">
                View all
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.slice(0, 4).map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-700">Recent sessions</h2>
              <Link to="/history" className="text-xs font-medium text-flow-600 hover:text-flow-700">
                History
              </Link>
            </div>
            {recentSessions.length === 0 ? (
              <div className="card px-4 py-8 text-center text-sm text-neutral-400">No sessions yet</div>
            ) : (
              <HistoryTable sessions={recentSessions} projects={projects} />
            )}
          </section>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-flow-50 text-flow-600">
                <Clock className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Planned today</span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">
              {formatDuration(todayPlanned)}
            </p>
            <Link to="/today" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-flow-600 hover:text-flow-700">
              Open Today Flow <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <GoalProgressCard focusMinutes={weeklyMinutes} goalMinutes={stats.weeklyFocusGoalMinutes} />

          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 text-center">
              <p className="text-2xl font-semibold text-amber-500">{stats.totalXp}</p>
              <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-neutral-400">
                <Zap className="h-3 w-3" /> Total XP
              </p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-semibold text-orange-500">{stats.streakDays}</p>
              <p className="mt-0.5 inline-flex items-center justify-center gap-1 text-xs text-neutral-400">
                <Flame className="h-3 w-3 text-orange-500" /> Day streak
              </p>
            </div>
          </div>
        </div>
      </div>

      {addTaskOpen && projects[0] && (
        <AddItemModal projectId={(continueProject ?? projects[0]).id} onClose={() => setAddTaskOpen(false)} />
      )}
    </Page>
  );
}

function ContinueFlowHero({ project }: { project: Project }) {
  const navigate = useNavigate();
  const current = getCurrentItem(project.items)!;
  const progress = getProjectProgress(project.items);
  const color = project.color ?? 'var(--color-flow-500)';
  const upcoming = getUpcomingItems(project.items, 2);
  const preview = getSortedItems(project.items).slice(0, 6);

  return (
    <div className="card overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[1fr_15rem]">
        {/* Left: current + actions */}
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs font-medium text-flow-600">
            <span className="flex h-1.5 w-1.5 animate-pulse-ring rounded-full bg-flow-500" />
            Continue your flow
          </div>
          <div className="mt-3 flex items-center gap-2">
            <ProjectMark mark={project.icon} color={color} size={20} className="rounded-lg" />
            <p className="text-xs text-neutral-400">{project.title}</p>
          </div>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-neutral-900">{current.title}</h2>
          <div className="mt-2 flex items-center gap-2">
            <TypeChip type={current.type} />
            <span className="text-xs text-neutral-400">{formatDuration(current.durationMinutes)}</span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(`/projects/${project.id}?focus=1`)}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: color }}
            >
              <Play className="h-4 w-4" />
              Start Flow
            </button>
            <Link
              to={`/projects/${project.id}`}
              className="text-sm font-medium text-neutral-500 transition hover:text-neutral-800"
            >
              Open flow
            </Link>
          </div>

          {upcoming.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
              <span className="font-medium text-neutral-500">Up next</span>
              {upcoming.map((u) => (
                <span key={u.id} className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${getTypeTheme(u.type).dot}`} />
                  {u.title}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: mini flow + ring */}
        <div className="flex flex-col gap-4 border-t border-neutral-100 bg-neutral-50/50 p-6 md:border-l md:border-t-0">
          <div className="flex items-center gap-3">
            <ProgressRing value={progress} color={color} size={64} stroke={7}>
              <span className="text-xs font-semibold tabular-nums text-neutral-900">{progress}%</span>
            </ProgressRing>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Flow path</p>
              <p className="text-sm text-neutral-600">{preview.length}+ blocks</p>
            </div>
          </div>
          <div className="relative pl-1">
            <div className="absolute bottom-1.5 left-[5px] top-1.5 w-px bg-neutral-200" />
            <div className="space-y-2">
              {preview.map((item) => {
                const done = item.status === 'completed' || item.status === 'skipped';
                const isCurrent = item.status === 'current';
                return (
                  <div key={item.id} className="relative flex items-center gap-2.5">
                    <span
                      className={`relative z-10 h-2.5 w-2.5 rounded-full ring-2 ring-neutral-50 ${
                        done ? 'bg-flow-600' : isCurrent ? getTypeTheme(item.type).dot : 'bg-neutral-300'
                      }`}
                    />
                    <span className={`truncate text-xs ${isCurrent ? 'font-medium text-neutral-800' : done ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

