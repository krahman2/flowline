export function FlowlineMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <span className={`flex items-center justify-center rounded-[10px] bg-flow-600 text-white ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M7 6v6a2.4 2.4 0 0 0 2.4 2.4H13"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="7" cy="6" r="2.3" fill="currentColor" />
        <circle cx="17" cy="14.4" r="2.3" fill="currentColor" />
        <circle cx="13" cy="14.4" r="1.4" fill="currentColor" opacity="0.6" />
        <circle cx="17" cy="14.4" r="3.6" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      </svg>
    </span>
  );
}
