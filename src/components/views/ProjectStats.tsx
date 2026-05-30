import { CheckCircle2, Clock, Gauge, Hourglass, Timer, Zap } from 'lucide-react';
import type { Project } from '../../types';
import { useApp } from '../../store/AppContext';
import { StatsCard } from '../ui/StatsCard';
import { ProgressBar } from '../ui/ProgressBar';
import { HistoryTable } from '../ui/HistoryTable';
import {
  formatDuration,
  getBufferMinutesUsed,
  getCompletedCount,
  getCompletedFocusMinutes,
  getCompletionRate,
  getItemTypeLabel,
  getPlannedVsActual,
  getProjectProgress,
  getRemainingMinutes,
  getTotalPlannedMinutes,
  getTypeBreakdown,
  getTypeTheme,
} from '../../utils/flowHelpers';

export function ProjectStats({ project }: { project: Project }) {
  const { sessions } = useApp();
  const projectSessions = sessions.filter((s) => s.projectId === project.id);
  const progress = getProjectProgress(project.items);
  const xp = projectSessions.reduce((sum, s) => sum + s.xpEarned, 0);
  const breakdown = getTypeBreakdown(project.items);
  const maxTypeMin = Math.max(1, ...breakdown.map((b) => b.minutes));
  const pva = getPlannedVsActual(sessions, project.id);
  const completionRate = getCompletionRate(project.items);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-600">Flow progress</span>
          <span className="font-semibold tabular-nums text-neutral-900">{progress}%</span>
        </div>
        <ProgressBar value={progress} color={project.color ?? 'var(--color-flow-500)'} className="h-2.5" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard icon={Clock} label="Planned" value={formatDuration(getTotalPlannedMinutes(project.items))} />
        <StatsCard icon={Timer} label="Focused" value={formatDuration(getCompletedFocusMinutes(sessions, project.id))} accent="flow" />
        <StatsCard icon={Hourglass} label="Remaining" value={formatDuration(getRemainingMinutes(project.items))} />
        <StatsCard icon={CheckCircle2} label="Blocks done" value={`${getCompletedCount(project.items)}`} accent="mint" />
        <StatsCard icon={Gauge} label="Completion rate" value={`${completionRate}%`} accent="violet" />
        <StatsCard icon={Zap} label="Project XP" value={`${xp}`} accent="amber" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Planned vs actual */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-neutral-900">Planned vs focused</p>
          <p className="mt-0.5 text-xs text-neutral-400">Average per completed block · {pva.sessions} sessions</p>
          {pva.sessions === 0 ? (
            <p className="mt-4 text-sm text-neutral-400">Complete a block to see this comparison.</p>
          ) : (
            <div className="mt-4 space-y-3">
              <Bar label="Planned" minutes={pva.avgPlanned} max={Math.max(pva.avgPlanned, pva.avgActual)} color="var(--color-neutral-300)" />
              <Bar label="Actual" minutes={pva.avgActual} max={Math.max(pva.avgPlanned, pva.avgActual)} color="var(--color-flow-500)" />
              <p className="text-xs text-neutral-400">
                {pva.avgActual <= pva.avgPlanned
                  ? `On average you finish ${formatDuration(pva.avgPlanned - pva.avgActual)} under plan.`
                  : `On average you run ${formatDuration(pva.avgActual - pva.avgPlanned)} over plan.`}
              </p>
            </div>
          )}
        </div>

        {/* Breakdown by type */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-neutral-900">Breakdown by type</p>
          <p className="mt-0.5 text-xs text-neutral-400">Planned time across block types</p>
          <div className="mt-4 space-y-3">
            {breakdown.map((row) => {
              const theme = getTypeTheme(row.type);
              return (
                <div key={row.type}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-neutral-600">
                      <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
                      {getItemTypeLabel(row.type)} <span className="text-neutral-300">· {row.count}</span>
                    </span>
                    <span className="tabular-nums text-neutral-400">{formatDuration(row.minutes)}</span>
                  </div>
                  <ProgressBar value={(row.minutes / maxTypeMin) * 100} color={theme.dot.replace('bg-', 'var(--color-').replace(/-(\d+)$/, '-$1)')} />
                </div>
              );
            })}
            {breakdown.length === 0 && <p className="text-sm text-neutral-400">No blocks yet.</p>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <Hourglass className="h-4 w-4 text-neutral-400" />
          Buffer used: {formatDuration(getBufferMinutesUsed(sessions, project.id))}
        </h3>
        <HistoryTable sessions={projectSessions} projects={[project]} showProject={false} />
      </div>
    </div>
  );
}

function Bar({ label, minutes, max, color }: { label: string; minutes: number; max: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-neutral-600">{label}</span>
        <span className="tabular-nums text-neutral-500">{formatDuration(minutes)}</span>
      </div>
      <ProgressBar value={max > 0 ? (minutes / max) * 100 : 0} color={color} />
    </div>
  );
}
