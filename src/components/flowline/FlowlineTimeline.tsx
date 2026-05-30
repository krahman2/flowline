import { type Ref } from 'react';
import type { FlowItem, Project } from '../../types';
import { getRailFillPercent, getSortedItems } from '../../utils/flowHelpers';
import { FlowlineNode } from './FlowlineNode';
import type { ItemActions } from './ItemActionsMenu';
import type { FocusTimerControls } from '../focus/FocusTimer';

type Props = {
  project: Project;
  focusMode?: boolean;
  dimCompleted?: boolean;
  timer?: FocusTimerControls | null;
  currentItemId?: string;
  currentNodeRef?: Ref<HTMLDivElement>;
  onStartFocus?: () => void;
  buildActions?: (item: FlowItem) => ItemActions;
};

export function FlowlineTimeline({
  project,
  focusMode,
  dimCompleted,
  timer,
  currentItemId,
  currentNodeRef,
  onStartFocus,
  buildActions,
}: Props) {
  const items = getSortedItems(project.items);
  const railFill = getRailFillPercent(project.items);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 py-16 text-center">
        <p className="text-sm font-medium text-neutral-600">Your flow is empty</p>
        <p className="mt-1 text-sm text-neutral-400">
          Add sections, blocks, and breaks to build your timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="group/timeline relative">
      {/* Rail track */}
      <div className="pointer-events-none absolute bottom-4 left-[22px] top-4 w-[2px] -translate-x-1/2 rounded-full bg-neutral-200/80" />
      {/* Rail fill — how far down the flow we've reached */}
      <div
        className="pointer-events-none absolute left-[22px] top-4 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-flow-400 to-flow-500 shadow-[0_0_8px_rgba(79,107,246,0.4)] transition-all duration-700 ease-out"
        style={{ height: `calc(${railFill}% - 1rem)` }}
      />

      <div className="relative">
        {items.map((item, index) => (
          <FlowlineNode
            key={item.id}
            ref={item.id === currentItemId ? currentNodeRef : undefined}
            item={item}
            allItems={project.items}
            isLast={index === items.length - 1}
            focusMode={focusMode}
            dimmed={dimCompleted && (item.status === 'completed' || item.status === 'skipped')}
            timer={item.id === currentItemId ? timer : null}
            actions={buildActions?.(item)}
            onStartFocus={onStartFocus}
          />
        ))}
      </div>
    </div>
  );
}
