import { Award, CalendarCheck, Clock3, Flame, Hourglass, Lock, Sparkles, Sunrise, Target, TrendingUp, Zap } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { ProjectMark } from '../components/illustrations/ProjectMark';
import {
  getBadges,
  getBestFocusDay,
  getCompletedBlocksThisWeek,
  getFocusRhythm,
  getProjectBreakdown,
  getWeeklyFocusMinutes,
} from '../store/gamification';
import { Page, PageHeader } from '../components/ui/PageHeader';
import { StatsCard } from '../components/ui/StatsCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatDuration } from '../utils/flowHelpers';

export function GlobalGoalsPage() {
  const { sessions, projects, stats, updateWeeklyGoal } = useApp();

  const weeklyMinutes = getWeeklyFocusMinutes(sessions);
  const goal = stats.weeklyFocusGoalMinutes;
  const pct = goal > 0 ? Math.min(100, Math.round((weeklyMinutes / goal) * 100)) : 0;
  const completedBlocks = getCompletedBlocksThisWeek(sessions);
  const bestDay = getBestFocusDay(sessions);
  const breakdown = getProjectBreakdown(sessions, projects);
  const badges = getBadges(stats, sessions);
  const maxBreakdown = Math.max(1, ...breakdown.map((b) => b.minutes));
  const rhythm = getFocusRhythm(sessions, projects);

  return (
    <Page>
      <PageHeader title="Goals & Stats" subtitle="Your focus rhythm across everything" />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Zap} label="Total XP" value={`${stats.totalXp}`} accent="amber" />
        <StatsCard icon={Flame} label="Streak" value={`${stats.streakDays}`} hint="days in a row" accent="amber" />
        <StatsCard icon={TrendingUp} label="This week" value={formatDuration(weeklyMinutes)} accent="flow" />
        <StatsCard icon={CalendarCheck} label="Blocks done" value={`${completedBlocks}`} hint="this week" accent="mint" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Weekly goal */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint-50 text-mint-600">
              <Target className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-900">Weekly focus goal</p>
              <p className="text-xs text-neutral-400">
                {formatDuration(weeklyMinutes)} of {formatDuration(goal)}
              </p>
            </div>
            <span className="ml-auto text-xl font-semibold tabular-nums text-mint-600">{pct}%</span>
          </div>
          <ProgressBar value={pct} color="var(--color-mint-500)" className="h-2.5" />
          <div className="mt-4 flex items-center gap-3">
            <input
              type="range"
              min={60}
              max={900}
              step={30}
              value={goal}
              onChange={(e) => updateWeeklyGoal(Number(e.target.value))}
              className="flex-1 accent-mint-500"
            />
            <span className="w-16 text-right text-sm font-medium tabular-nums text-neutral-700">
              {formatDuration(goal)}
            </span>
          </div>
        </div>

        {/* Best focus day */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-flow-50 text-flow-600">
              <TrendingUp className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-neutral-900">Best focus day</p>
          </div>
          {bestDay ? (
            <>
              <p className="text-2xl font-semibold tracking-tight text-neutral-900">
                {formatDuration(bestDay.minutes)}
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                {new Date(bestDay.date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </>
          ) : (
            <p className="text-sm text-neutral-400">Complete a session to set a record.</p>
          )}
        </div>

        {/* Project breakdown */}
        <div className="card p-5">
          <p className="mb-4 text-sm font-semibold text-neutral-900">Project breakdown · this week</p>
          {breakdown.length === 0 ? (
            <p className="text-sm text-neutral-400">No focus time logged this week yet.</p>
          ) : (
            <div className="space-y-3">
              {breakdown.map((row) => (
                <div key={row.projectId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-neutral-700">
                      <ProjectMark mark={row.icon} color={row.color ?? 'var(--color-flow-500)'} size={20} className="rounded-md" />
                      <span className="truncate">{row.title}</span>
                    </span>
                    <span className="tabular-nums text-neutral-400">{formatDuration(row.minutes)}</span>
                  </div>
                  <ProgressBar
                    value={(row.minutes / maxBreakdown) * 100}
                    color={row.color ?? 'var(--color-flow-500)'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Focus rhythm */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-flow-50 text-flow-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-neutral-900">Focus rhythm</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <RhythmTile icon={Clock3} label="Avg session" value={formatDuration(rhythm.avgSessionMinutes)} />
            <RhythmTile icon={Sunrise} label="Best time of day" value={rhythm.bestHourLabel ?? '—'} />
            <RhythmTile
              icon={TrendingUp}
              label="Most focused flow"
              value={rhythm.mostFocusedProject ? rhythm.mostFocusedProject.title : '—'}
            />
            <RhythmTile icon={Hourglass} label="Buffer this week" value={formatDuration(rhythm.bufferMinutesThisWeek)} />
          </div>
        </div>

        {/* Badges */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Award className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-neutral-900">Badges</p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 ${
                  b.earned ? 'border-violet-100 bg-violet-50/50' : 'border-neutral-100 bg-neutral-50 opacity-60'
                }`}
              >
                <span className={b.earned ? 'text-violet-500' : 'text-neutral-300'}>
                  {b.earned ? <Award className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-800">{b.label}</p>
                  <p className="truncate text-[11px] text-neutral-400">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}

function RhythmTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-neutral-50 p-3">
      <Icon className="h-4 w-4 text-neutral-400" />
      <p className="mt-1.5 truncate text-sm font-semibold text-neutral-800">{value}</p>
      <p className="text-[11px] text-neutral-400">{label}</p>
    </div>
  );
}
