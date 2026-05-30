import { motion } from 'framer-motion';

export function EmptyFlowIllustration({ className = '' }: { className?: string }) {
  const nodes = [
    { cy: 26, r: 7, fill: 'var(--color-flow-500)', delay: 0.1 },
    { cy: 64, r: 6, fill: 'var(--color-mint-500)', delay: 0.25 },
    { cy: 102, r: 6, fill: 'var(--color-violet-500)', delay: 0.4 },
  ];
  return (
    <svg viewBox="0 0 120 128" className={className} fill="none">
      {/* rail */}
      <motion.line
        x1="40"
        y1="26"
        x2="40"
        y2="102"
        stroke="var(--color-neutral-200)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      <motion.line
        x1="40"
        y1="26"
        x2="40"
        y2="64"
        stroke="var(--color-flow-400)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
      />
      {nodes.map((n, i) => (
        <g key={i}>
          <motion.circle
            cx="40"
            cy={n.cy}
            r={n.r}
            fill={n.fill}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: n.delay }}
            style={{ transformOrigin: `40px ${n.cy}px` }}
          />
          {i === 0 && (
            <motion.circle
              cx="40"
              cy={n.cy}
              r={n.r}
              fill="none"
              stroke={n.fill}
              strokeWidth="2"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              style={{ transformOrigin: `40px ${n.cy}px` }}
            />
          )}
          <motion.rect
            x="58"
            y={n.cy - 5}
            width={i === 0 ? 46 : 34}
            height="10"
            rx="5"
            fill="var(--color-neutral-100)"
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 58 }}
            transition={{ duration: 0.4, delay: n.delay + 0.1 }}
          />
        </g>
      ))}
    </svg>
  );
}
