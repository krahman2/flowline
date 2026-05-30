import { motion } from 'framer-motion';

export function CompletionIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} fill="none">
      <motion.circle
        cx="48"
        cy="48"
        r="34"
        fill="var(--color-flow-50)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        style={{ transformOrigin: 'center' }}
      />
      <motion.circle
        cx="48"
        cy="48"
        r="34"
        fill="none"
        stroke="var(--color-flow-300)"
        strokeWidth="2"
        initial={{ scale: 1, opacity: 0.7 }}
        animate={{ scale: 1.35, opacity: 0 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        style={{ transformOrigin: 'center' }}
      />
      <motion.path
        d="M34 49l9 9 19-20"
        stroke="var(--color-flow-600)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
      />
    </svg>
  );
}
