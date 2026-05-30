import { useRef, useState } from 'react';
import { Bell, Cloud, Download, FlaskConical, Palette, RotateCcw, Timer, Upload, Zap } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { AuthButton } from '../components/auth/AuthButton';
import { ACCENTS } from '../store/accents';
import { Page, PageHeader } from '../components/ui/PageHeader';
import type { AccentKey, AppState } from '../types';

export function SettingsPage() {
  const {
    pomodoro,
    updatePomodoro,
    preferences,
    updatePreferences,
    stats,
    updateWeeklyGoal,
    resetData,
    loadSampleData,
    exportData,
    importData,
  } = useApp();
  const { user, isConfigured, syncStatus } = useAuth();
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowline-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppState;
        if (parsed.projects && parsed.stats) importData(parsed);
        else alert('That file does not look like a Flowline backup.');
      } catch {
        alert('Could not read that file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Page className="max-w-3xl">
      <PageHeader title="Settings" subtitle="Tune Flowline to fit how you work" />

      <div className="space-y-5">
        <Section
          icon={Cloud}
          title="Account & sync"
          desc="Sign in with Google to save flows across devices. Local progress merges when you first sign in."
        >
          <div className="flex flex-wrap items-center gap-3">
            <AuthButton />
            {isConfigured && user && (
              <p className="text-xs text-neutral-500">
                Signed in as {user.email}
                {syncStatus === 'synced' && ' · Saved to cloud'}
                {syncStatus === 'syncing' && ' · Saving…'}
                {syncStatus === 'error' && ' · Sync error — try refreshing'}
              </p>
            )}
            {!isConfigured && (
              <p className="text-xs text-amber-600">
                Cloud sync is off — add Firebase env vars and redeploy.
              </p>
            )}
          </div>
        </Section>

        {/* Accent */}
        <Section icon={Palette} title="Accent color" desc="Pick the highlight color used across your flows">
          <div className="flex flex-wrap gap-2.5">
            {(Object.keys(ACCENTS) as AccentKey[]).map((key) => (
              <button
                key={key}
                onClick={() => updatePreferences({ accent: key })}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                  preferences.accent === key
                    ? 'border-neutral-300 bg-neutral-50 font-medium text-neutral-900'
                    : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                }`}
              >
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: ACCENTS[key].swatch }} />
                {ACCENTS[key].label}
              </button>
            ))}
          </div>
        </Section>

        {/* Defaults */}
        <Section icon={Timer} title="Default durations" desc="Used when you add new blocks">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <NumberField
              label="Focus"
              value={preferences.defaultFocusMinutes}
              onChange={(v) => updatePreferences({ defaultFocusMinutes: v })}
            />
            <NumberField
              label="Break"
              value={preferences.defaultBreakMinutes}
              onChange={(v) => updatePreferences({ defaultBreakMinutes: v })}
            />
            <NumberField
              label="Buffer"
              value={preferences.defaultBufferMinutes}
              onChange={(v) => updatePreferences({ defaultBufferMinutes: v })}
            />
          </div>
        </Section>

        {/* Focus behavior */}
        <Section icon={Zap} title="Focus behavior" desc="How focus mode advances and notifies you">
          <div className="space-y-3">
            <Toggle
              checked={preferences.autoAdvance}
              onChange={(v) => updatePreferences({ autoAdvance: v })}
              label="Auto-advance to the next block when the timer ends"
            />
            <Toggle
              checked={preferences.soundEnabled}
              onChange={(v) => updatePreferences({ soundEnabled: v })}
              label="Play a sound when a block finishes (coming soon)"
            />
          </div>
        </Section>

        {/* Pomodoro */}
        <Section icon={Timer} title="Pomodoro mode" desc="Override block durations with fixed focus intervals">
          <Toggle checked={pomodoro.enabled} onChange={(v) => updatePomodoro({ enabled: v })} label="Use Pomodoro intervals in focus mode" />
          {pomodoro.enabled && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <NumberField label="Focus" value={pomodoro.focusMinutes} onChange={(v) => updatePomodoro({ focusMinutes: v })} />
              <NumberField label="Short break" value={pomodoro.shortBreakMinutes} onChange={(v) => updatePomodoro({ shortBreakMinutes: v })} />
              <NumberField label="Long break" value={pomodoro.longBreakMinutes} onChange={(v) => updatePomodoro({ longBreakMinutes: v })} />
            </div>
          )}
        </Section>

        {/* Weekly goal */}
        <Section title="Weekly focus goal" desc="Hours of focused work you aim for each week">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={60}
              max={900}
              step={30}
              value={stats.weeklyFocusGoalMinutes}
              onChange={(e) => updateWeeklyGoal(Number(e.target.value))}
              className="flex-1 accent-flow-600"
            />
            <span className="w-20 text-right text-sm font-medium tabular-nums text-neutral-700">
              {Math.round(stats.weeklyFocusGoalMinutes / 60)}h
              {stats.weeklyFocusGoalMinutes % 60 ? ` ${stats.weeklyFocusGoalMinutes % 60}m` : ''}
            </span>
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications" desc="Reminders when a block finishes (coming soon)">
          <Toggle
            checked={preferences.notificationsEnabled}
            onChange={(v) => updatePreferences({ notificationsEnabled: v })}
            label="Enable focus reminders"
          />
        </Section>

        {/* Data */}
        <Section title="Data" desc="Flowline stores everything locally in your browser">
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExport} className="btn-ghost">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button onClick={() => fileRef.current?.click()} className="btn-ghost">
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button onClick={loadSampleData} className="btn-ghost">
              <FlaskConical className="h-4 w-4" />
              Load sample data
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
            />
          </div>
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="btn-ghost mt-3 text-red-600">
              <RotateCcw className="h-4 w-4" />
              Reset to sample data
            </button>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-neutral-600">This erases your flows. Sure?</span>
              <button
                onClick={() => {
                  resetData();
                  setConfirmReset(false);
                }}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Reset
              </button>
              <button onClick={() => setConfirmReset(false)} className="btn-subtle">
                Cancel
              </button>
            </div>
          )}
        </Section>
      </div>
    </Page>
  );
}

function Section({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon?: typeof Timer;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-flow-50 text-flow-600">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          <p className="text-xs text-neutral-400">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-neutral-200 transition peer-checked:bg-flow-600 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
      <span className="text-sm text-neutral-700">{label}</span>
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-neutral-500">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={1}
          max={120}
          value={value}
          onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
          className="input"
        />
        <span className="text-xs text-neutral-400">min</span>
      </div>
    </div>
  );
}
