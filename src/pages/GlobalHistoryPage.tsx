import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Timer, Zap } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Page, PageHeader } from '../components/ui/PageHeader';
import { StatsCard } from '../components/ui/StatsCard';
import { HistoryTable } from '../components/ui/HistoryTable';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { EmptyState } from '../components/ui/EmptyState';
import { EmptyFlowIllustration } from '../components/illustrations/EmptyFlowIllustration';
import { formatDuration, toDateKey } from '../utils/flowHelpers';

type Range = 'week' | 'month' | 'all';
type StatusFilter = 'all' | 'completed' | 'skipped';

const RANGES = [
  { id: 'week' as const, label: 'Week' },
  { id: 'month' as const, label: 'Month' },
  { id: 'all' as const, label: 'All' },
];
const STATUSES = [
  { id: 'all' as const, label: 'All' },
  { id: 'completed' as const, label: 'Completed' },
  { id: 'skipped' as const, label: 'Skipped' },
];

export function GlobalHistoryPage() {
  const { sessions, projects } = useApp();
  const [range, setRange] = useState<Range>('month');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [projectId, setProjectId] = useState<string>('all');

  const cutoff = useMemo(() => {
    const d = new Date();
    if (range === 'week') d.setDate(d.getDate() - 7);
    else if (range === 'month') d.setMonth(d.getMonth() - 1);
    else return new Date(0);
    return d;
  }, [range]);

  const filtered = useMemo(
    () =>
      sessions.filter((s) => {
        if (new Date(s.startedAt) < cutoff) return false;
        if (status === 'completed' && !s.completed) return false;
        if (status === 'skipped' && !s.skipped) return false;
        if (projectId !== 'all' && s.projectId !== projectId) return false;
        return true;
      }),
    [sessions, cutoff, status, projectId],
  );

  const totalMinutes = filtered.filter((s) => s.completed).reduce((sum, s) => sum + s.actualMinutes, 0);
  const totalXp = filtered.reduce((sum, s) => sum + s.xpEarned, 0);

  // Daily summary — last 7 days
  const days = useMemo(() => {
    const arr: { key: string; label: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const minutes = sessions
        .filter((s) => s.completed && toDateKey(s.startedAt) === key)
        .reduce((sum, s) => sum + s.actualMinutes, 0);
      arr.push({ key, label: d.toLocaleDateString(undefined, { weekday: 'short' })[0], minutes });
    }
    return arr;
  }, [sessions]);
  const maxDay = Math.max(30, ...days.map((d) => d.minutes));

  if (sessions.length === 0) {
    return (
      <Page>
        <PageHeader title="History" subtitle="Every focus session across your flows" />
        <EmptyState
          illustration={<EmptyFlowIllustration className="h-28 w-28" />}
          title="No sessions yet"
          description="Start a flow and complete blocks to begin logging your focus history."
          actions={
            <Link to="/projects" className="btn-primary">
              Open flows
            </Link>
          }
        />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader title="History" subtitle="Every focus session across your flows" />

      <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="grid grid-cols-3 gap-3">
          <StatsCard icon={Clock} label="Sessions" value={`${filtered.filter((s) => s.completed).length}`} />
          <StatsCard icon={Timer} label="Focus time" value={formatDuration(totalMinutes)} accent="flow" />
          <StatsCard icon={Zap} label="XP" value={`${totalXp}`} accent="amber" />
        </div>
        <div className="card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Last 7 days</p>
          <div className="flex h-16 items-end justify-between gap-1.5">
            {days.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-12 w-full items-end">
                  <div
                    className="w-full rounded-md bg-flow-500/80 transition-all"
                    style={{ height: `${Math.max(4, (d.minutes / maxDay) * 100)}%` }}
                    title={formatDuration(d.minutes)}
                  />
                </div>
                <span className="text-[10px] text-neutral-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SegmentedTabs segments={RANGES} value={range} onChange={setRange} size="sm" />
        <SegmentedTabs segments={STATUSES} value={status} onChange={setStatus} size="sm" />
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 outline-none focus:border-flow-400"
        >
          <option value="all">All flows</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      <HistoryTable sessions={filtered} projects={projects} />
    </Page>
  );
}
