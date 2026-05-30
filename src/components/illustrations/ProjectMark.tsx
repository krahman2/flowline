import { MARK_IDS } from './marks';

function MarkGlyph({ id }: { id: string }) {
  switch (id) {
    case 'pulse':
      return (
        <>
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
        </>
      );
    case 'orbit':
      return (
        <>
          <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="18" cy="9" r="2" fill="currentColor" />
        </>
      );
    case 'layers':
      return (
        <>
          <rect x="6" y="6" width="12" height="3.2" rx="1.6" fill="currentColor" opacity="0.45" />
          <rect x="6" y="10.4" width="12" height="3.2" rx="1.6" fill="currentColor" opacity="0.7" />
          <rect x="6" y="14.8" width="12" height="3.2" rx="1.6" fill="currentColor" />
        </>
      );
    case 'spark':
      return (
        <path
          d="M12 5l1.6 4.4L18 11l-4.4 1.6L12 17l-1.6-4.4L6 11l4.4-1.6L12 5z"
          fill="currentColor"
        />
      );
    case 'target':
      return (
        <>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" opacity="0.4" />
          <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </>
      );
    case 'wave':
      return (
        <path
          d="M5 13c2-4 4-4 7 0s5 4 7 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      );
    case 'book':
      return (
        <>
          <path d="M12 7c-2-1.2-4-1.2-6-.6v10c2-.6 4-.6 6 .6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
          <path d="M12 7c2-1.2 4-1.2 6-.6v10c-2-.6-4-.6-6 .6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" opacity="0.55" />
        </>
      );
    case 'code':
      return (
        <path
          d="M9.5 8.5L6 12l3.5 3.5M14.5 8.5L18 12l-3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    case 'path':
    default:
      return (
        <>
          <path d="M8 6v8a2.5 2.5 0 0 0 2.5 2.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.45" />
          <circle cx="8" cy="6" r="2" fill="currentColor" />
          <circle cx="16" cy="16.5" r="2" fill="currentColor" />
          <circle cx="16" cy="11" r="1.4" fill="currentColor" opacity="0.6" />
        </>
      );
  }
}

type Props = {
  /** mark id or any project.icon string (falls back to 'path') */
  mark?: string;
  color?: string;
  size?: number;
  className?: string;
};

export function ProjectMark({ mark = 'path', color = 'var(--color-flow-500)', size = 40, className = '' }: Props) {
  const id = (MARK_IDS as readonly string[]).includes(mark) ? mark : 'path';
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl ${className}`}
      style={{
        width: size,
        height: size,
        color,
        backgroundColor: `color-mix(in srgb, ${color} 14%, white)`,
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <MarkGlyph id={id} />
      </svg>
    </span>
  );
}
