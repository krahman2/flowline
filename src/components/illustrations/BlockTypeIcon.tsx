import {
  CheckCircle2,
  Circle,
  Coffee,
  CornerDownRight,
  Flag,
  Hourglass,
} from 'lucide-react';
import type { FlowItemType } from '../../types';

export function BlockTypeIcon({
  type,
  className = 'h-3.5 w-3.5',
}: {
  type: FlowItemType;
  className?: string;
}) {
  const props = { className, strokeWidth: 2.2 };
  switch (type) {
    case 'break':
      return <Coffee {...props} />;
    case 'buffer':
      return <Hourglass {...props} />;
    case 'review':
      return <CheckCircle2 {...props} />;
    case 'milestone':
      return <Flag {...props} />;
    case 'section':
    case 'subtask':
      return <CornerDownRight {...props} />;
    default:
      return <Circle {...props} />;
  }
}
