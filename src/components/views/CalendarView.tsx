import { useMemo, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FlowItem, Project } from '../../types';
import { useApp } from '../../store/AppContext';
import { TypeChip } from '../ui/TypeChip';
import {
  formatDuration,
  getFocusableItems,
  getTypeTheme,
  getUnscheduledItems,
  toDateKey,
} from '../../utils/flowHelpers';

type CalEvent = {
  id: string;
  dateKey: string;
  title: string;
  project: Project;
  item?: FlowItem;
  kind: 'scheduled' | 'due';
};

function buildEvents(projects: Project[]): Map<string, CalEvent[]> {
  const map = new Map<string, CalEvent[]>();
  const push = (e: CalEvent) => {
    const arr = map.get(e.dateKey) ?? [];
    arr.push(e);
    map.set(e.dateKey, arr);
  };
  for (const project of projects) {
    for (const item of getFocusableItems(project.items)) {
      if (item.scheduledDate) {
        push({ id: item.id, dateKey: toDateKey(item.scheduledDate), title: item.title, project, item, kind: 'scheduled' });
      }
    }
    if (project.dueDate) {
      push({ id: `${project.id}-due`, dateKey: toDateKey(project.dueDate), title: `${project.title} due`, project, kind: 'due' });
    }
  }
  return map;
}

type Props = {
  projects: Project[];
  onEditItem?: (item: FlowItem) => void;
};

export function CalendarView({ projects, onEditItem }: Props) {
  const { updateItem } = useApp();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(toDateKey(new Date()));

  const events = useMemo(() => buildEvents(projects), [projects]);
  const unscheduled = useMemo(
    () => projects.flatMap((p) => getUnscheduledItems(p.items).map((item) => ({ project: p, item }))),
    [projects],
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toDateKey(new Date());

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const selectedEvents = events.get(selected) ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <div className="card p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">
            {cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center gap-1">
            <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setCursor(new Date(year, month, 1))} className="rounded-lg px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100">
              Today
            </button>
            <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-neutral-400">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {cells.map((date, i) => {
            if (!date) return <div key={`e${i}`} />;
            const key = toDateKey(date);
            const dayEvents = events.get(key) ?? [];
            const isToday = key === todayKey;
            const isSelected = key === selected;
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`flex aspect-square flex-col items-center justify-start gap-1 rounded-xl p-1.5 text-sm transition ${
                  isSelected
                    ? 'bg-flow-600 text-white shadow-sm'
                    : isToday
                      ? 'bg-flow-50 text-flow-700'
                      : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span className="tabular-nums">{date.getDate()}</span>
                {dayEvents.length > 0 && (
                  <span className="flex flex-wrap justify-center gap-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor: isSelected
                            ? 'rgba(255,255,255,0.9)'
                            : ev.kind === 'due'
                              ? 'var(--color-amber-500)'
                              : (ev.project.color ?? 'var(--color-flow-500)'),
                        }}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-neutral-900">
            {new Date(selected).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>
          <div className="mt-3 space-y-2">
            {selectedEvents.length === 0 && (
              <p className="py-6 text-center text-sm text-neutral-400">No scheduled blocks yet.</p>
            )}
            {selectedEvents.map((ev) => {
              const theme = ev.item ? getTypeTheme(ev.item.type) : null;
              const clickable = !!ev.item && !!onEditItem;
              return (
                <button
                  key={ev.id}
                  onClick={() => ev.item && onEditItem?.(ev.item)}
                  disabled={!clickable}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition ${
                    clickable ? 'bg-neutral-50 hover:bg-neutral-100' : 'bg-neutral-50'
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: ev.kind === 'due' ? 'var(--color-amber-500)' : (ev.project.color ?? 'var(--color-flow-500)'),
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800">{ev.title}</p>
                    <p className="truncate text-xs text-neutral-400">
                      {ev.kind === 'due' ? 'Project due' : ev.project.title}
                    </p>
                  </div>
                  {ev.item && theme && <TypeChip type={ev.item.type} />}
                  {ev.item && ev.item.durationMinutes > 0 && (
                    <span className="text-xs tabular-nums text-neutral-400">{formatDuration(ev.item.durationMinutes)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {unscheduled.length > 0 && (
          <div className="card p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <CalendarPlus className="h-4 w-4 text-flow-500" />
              <h3 className="text-sm font-semibold text-neutral-900">Schedule a block</h3>
            </div>
            <p className="mb-3 text-xs text-neutral-400">
              Add an unscheduled block to {new Date(selected).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.
            </p>
            <div className="space-y-1.5">
              {unscheduled.slice(0, 6).map(({ project, item }) => (
                <button
                  key={item.id}
                  onClick={() => updateItem(project.id, item.id, { scheduledDate: selected })}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-neutral-600 transition hover:bg-flow-50"
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${getTypeTheme(item.type).dot}`} />
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  <span className="text-xs text-neutral-400">+ add</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
