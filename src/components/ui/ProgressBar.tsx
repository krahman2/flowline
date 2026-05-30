type Props = {
  value: number; // 0–100
  className?: string;
  color?: string;
  trackClassName?: string;
  animated?: boolean;
};

export function ProgressBar({
  value,
  className = 'h-1.5',
  color = 'var(--color-flow-500)',
  trackClassName = 'bg-neutral-100',
  animated,
}: Props) {
  return (
    <div className={`w-full overflow-hidden rounded-full ${trackClassName} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${
          animated ? 'shimmer' : ''
        }`}
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: animated ? undefined : color,
          backgroundImage: animated
            ? `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 55%, white), ${color})`
            : undefined,
        }}
      />
    </div>
  );
}
