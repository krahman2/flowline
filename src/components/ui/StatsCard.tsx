import type { LucideIcon } from 'lucide-react';

type Props = {
  icon?: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: 'flow' | 'mint' | 'amber' | 'violet' | 'neutral';
};

const accentMap: Record<NonNullable<Props['accent']>, string> = {
  flow: 'text-flow-600 bg-flow-50',
  mint: 'text-mint-600 bg-mint-50',
  amber: 'text-amber-600 bg-amber-50',
  violet: 'text-violet-600 bg-violet-50',
  neutral: 'text-neutral-600 bg-neutral-100',
};

export function StatsCard({ icon: Icon, label, value, hint, accent = 'neutral' }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentMap[accent]}`}>
            <Icon className="h-4 w-4" />
          </span>
        )}
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          {label}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}
