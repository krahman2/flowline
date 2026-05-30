import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { FlowItem } from '../../types';
import {
  formatDuration,
  getEffectiveDurationMinutes,
  getFocusableChildItems,
  getIndentLevel,
  getTypeTheme,
  isRollupParent,
} from '../../utils/flowHelpers';
import { FlowNodeMarker } from './FlowNodeMarker';
import { ItemActionsMenu, type ItemActions } from './ItemActionsMenu';
import { FocusTimer, type FocusTimerControls } from '../focus/FocusTimer';
import { TypeChip } from '../ui/TypeChip';

type Props = {
  item: FlowItem;
  allItems: FlowItem[];
  isLast: boolean;
  focusMode?: boolean;
  dimmed?: boolean;
  timer?: FocusTimerControls | null;
  actions?: ItemActions;
  onStartFocus?: () => void;
};

const STATUS_LABEL: Record<string, string> = {
  current: 'In progress',
  completed: 'Done',
  skipped: 'Skipped',
};

function accentFor(type: FlowItem['type']): string {
  switch (type) {
    case 'break':
      return 'var(--color-mint-500)';
    case 'buffer':
      return 'var(--color-amber-500)';
    case 'review':
      return 'var(--color-violet-500)';
    default:
      return 'var(--color-flow-500)';
  }
}

export const FlowlineNode = forwardRef<HTMLDivElement, Props>(function FlowlineNode(
  { item, allItems, isLast, focusMode, dimmed, timer, actions, onStartFocus },
  ref,
) {
  const theme = getTypeTheme(item.type);
  const indent = getIndentLevel(allItems, item);
  const isSection = item.type === 'section';
  const isCurrent = item.status === 'current';
  const isCompleted = item.status === 'completed';
  const isSkipped = item.status === 'skipped';
  const accentColor = accentFor(item.type);
  const showTimer = focusMode && isCurrent && !!timer;
  const rollup = isRollupParent(allItems, item);
  const childCount = rollup ? getFocusableChildItems(allItems, item.id).length : 0;
  const effectiveMinutes = getEffectiveDurationMinutes(allItems, item);

  // Section heading — elegant label, not a card
  if (isSection) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative grid grid-cols-[44px_1fr] items-center pb-1 pt-6 first:pt-1"
      >
        <div className="flex justify-center">
          <span className="relative z-10 bg-canvas py-1">
            <FlowNodeMarker item={item} />
          </span>
        </div>
        <div className="group/section flex items-center gap-3" style={{ paddingLeft: indent * 18 }}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            {item.title}
          </h3>
          <span className="h-px flex-1 bg-neutral-200" />
          {actions && (
            <div className="opacity-0 transition group-hover/section:opacity-100">
              <ItemActionsMenu item={item} actions={actions} />
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: dimmed ? 0.45 : 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative grid grid-cols-[44px_1fr]"
    >
      <div className="flex justify-center pt-3.5">
        <span className="relative z-10 bg-canvas py-1">
          <FlowNodeMarker item={item} emphasized={isCurrent} />
        </span>
      </div>

      <div
        className={`group/card mb-3.5 min-w-0 rounded-2xl border transition-all duration-200 ${
          isCurrent
            ? 'border-flow-200 bg-white shadow-[0_8px_30px_-12px_rgba(79,107,246,0.35)] ring-1 ring-flow-100'
            : isCompleted
              ? 'border-neutral-100 bg-white/60'
              : isSkipped
                ? 'border-dashed border-neutral-200 bg-neutral-50/40'
                : 'border-neutral-200/70 bg-white hover:border-neutral-300/80 hover:shadow-[0_4px_16px_-8px_rgba(17,17,17,0.12)]'
        } ${showTimer ? 'p-5' : 'p-4'}`}
        style={{ marginLeft: indent * 18 }}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <TypeChip type={item.type} />
              {STATUS_LABEL[item.status] && (
                <span
                  className={`text-[11px] font-medium ${
                    isCurrent ? theme.accent : isCompleted ? 'text-mint-600' : 'text-neutral-400'
                  }`}
                >
                  {STATUS_LABEL[item.status]}
                </span>
              )}
            </div>

            <h4
              className={`mt-1.5 font-semibold leading-snug ${
                showTimer ? 'text-xl' : 'text-[15px]'
              } ${isCompleted || isSkipped ? 'text-neutral-400' : 'text-neutral-900'}`}
            >
              {item.title}
            </h4>

            {item.notes && (isCurrent || showTimer) && (
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">{item.notes}</p>
            )}
            {rollup && (isCurrent || showTimer) && (
              <p className="mt-1.5 text-xs text-neutral-400">
                {childCount} subtasks · {formatDuration(effectiveMinutes)} total
                {!showTimer && ' · Set as current to focus all at once'}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {effectiveMinutes > 0 && !showTimer && (
              <span
                className={`rounded-lg px-2 py-0.5 text-xs font-medium tabular-nums ${
                  rollup ? 'bg-flow-50 text-flow-600' : 'bg-neutral-100 text-neutral-500'
                }`}
                title={rollup ? 'Rolls up from subtask durations' : undefined}
              >
                {rollup ? `${formatDuration(effectiveMinutes)} · ${childCount}` : formatDuration(effectiveMinutes)}
              </span>
            )}
            {actions && (
              <div className="opacity-0 transition focus-within:opacity-100 group-hover/card:opacity-100">
                <ItemActionsMenu item={item} actions={actions} />
              </div>
            )}
          </div>
        </div>

        {showTimer && timer && <FocusTimer {...timer} accentColor={accentColor} />}

        {isCurrent && !focusMode && onStartFocus && (
          <div className="mt-3.5">
            <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full w-0 rounded-full" style={{ backgroundColor: accentColor }} />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onStartFocus}
                className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                <Play className="h-3.5 w-3.5" />
                Start focus
              </button>
              <span className="text-xs text-neutral-400">
                {formatDuration(effectiveMinutes)} planned
              </span>
            </div>
          </div>
        )}
      </div>
      {!isLast && <span className="sr-only">connector</span>}
    </motion.div>
  );
});
