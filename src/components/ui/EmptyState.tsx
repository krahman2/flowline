import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  illustration?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  compact?: boolean;
};

export function EmptyState({ illustration, title, description, actions, compact }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`card flex flex-col items-center justify-center text-center ${compact ? 'py-10' : 'py-16'}`}
    >
      {illustration && <div className="mb-5">{illustration}</div>}
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-neutral-500">{description}</p>}
      {actions && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </motion.div>
  );
}
