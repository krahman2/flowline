import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  CornerDownRight,
  type LucideIcon,
  MoreHorizontal,
  Pencil,
  Timer,
  Trash2,
} from 'lucide-react';
import type { FlowItem } from '../../types';

function Row({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-neutral-600 hover:bg-neutral-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export type ItemActions = {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddChild?: () => void;
  onAddBufferAfter: () => void;
  onToggleComplete?: () => void;
  onSetCurrent?: () => void;
};

export function ItemActionsMenu({ item, actions }: { item: FlowItem; actions: ItemActions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  const canHaveChild = item.type === 'section' || item.type === 'task';
  const isFocusable = item.type !== 'section' && item.type !== 'milestone';

  const run = (fn?: () => void) => () => {
    setOpen(false);
    fn?.();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
        aria-label="Item actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg animate-fade">
          {isFocusable && actions.onSetCurrent && (
            <Row icon={Timer} label="Set as current" onClick={run(actions.onSetCurrent)} />
          )}
          {isFocusable && actions.onToggleComplete && (
            <Row
              icon={CheckCircle2}
              label={item.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
              onClick={run(actions.onToggleComplete)}
            />
          )}
          <Row icon={Pencil} label="Edit" onClick={run(actions.onEdit)} />
          <Row icon={Copy} label="Duplicate" onClick={run(actions.onDuplicate)} />
          {canHaveChild && actions.onAddChild && (
            <Row icon={CornerDownRight} label="Add child item" onClick={run(actions.onAddChild)} />
          )}
          <Row icon={Timer} label="Add buffer after" onClick={run(actions.onAddBufferAfter)} />
          <div className="my-1 border-t border-neutral-100" />
          <Row icon={ArrowUp} label="Move up" onClick={run(actions.onMoveUp)} />
          <Row icon={ArrowDown} label="Move down" onClick={run(actions.onMoveDown)} />
          <div className="my-1 border-t border-neutral-100" />
          <Row icon={Trash2} label="Delete" onClick={run(actions.onDelete)} danger />
        </div>
      )}
    </div>
  );
}
