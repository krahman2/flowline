import type { LucideIcon } from 'lucide-react';

export type Segment<T extends string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
};

type Props<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
};

export function SegmentedTabs<T extends string>({ segments, value, onChange, size = 'md' }: Props<T>) {
  return (
    <div className="-mx-1 overflow-x-auto no-scrollbar">
      <div className="inline-flex min-w-full items-center gap-0.5 rounded-xl bg-neutral-100 p-1 sm:min-w-0">
      {segments.map((seg) => {
        const Icon = seg.icon;
        const active = seg.id === value;
        return (
          <button
            key={seg.id}
            onClick={() => onChange(seg.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg font-medium transition-all touch-manipulation ${
              size === 'sm' ? 'px-2.5 py-2 text-xs' : 'px-3.5 py-2 text-sm'
            } ${
              active
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {Icon && <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
            {seg.label}
          </button>
        );
      })}
      </div>
    </div>
  );
}
