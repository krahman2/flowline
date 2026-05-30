import { Check, Flag } from 'lucide-react';
import type { FlowItem } from '../../types';
import { getTypeTheme } from '../../utils/flowHelpers';
import { BlockTypeIcon } from '../illustrations/BlockTypeIcon';

type Props = {
  item: FlowItem;
  emphasized?: boolean;
};

/** The circular/marker glyph that sits on the vertical rail. */
export function FlowNodeMarker({ item, emphasized }: Props) {
  const theme = getTypeTheme(item.type);
  const { status, type } = item;

  if (type === 'section') {
    return (
      <span className="flex h-3 w-3 items-center justify-center rounded-full bg-white ring-2 ring-neutral-300">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
      </span>
    );
  }

  if (type === 'milestone') {
    return (
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${
          status === 'completed' ? 'bg-flow-600 text-white' : 'bg-white text-flow-600 ring-2 ring-flow-200'
        }`}
      >
        <Flag className="h-4 w-4" strokeWidth={2.4} />
      </span>
    );
  }

  if (status === 'completed') {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-flow-600 text-white shadow-sm">
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }

  if (status === 'skipped') {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-neutral-300 bg-white">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
      </span>
    );
  }

  if (status === 'current') {
    return (
      <span
        className={`flex items-center justify-center rounded-full bg-white ring-[3px] ${theme.ring} animate-pulse-ring ${
          emphasized ? 'h-9 w-9' : 'h-8 w-8'
        }`}
      >
        <span className={`h-3 w-3 rounded-full ${theme.dot}`} />
      </span>
    );
  }

  // not started
  if (type === 'break' || type === 'buffer' || type === 'review') {
    return (
      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${theme.chipBg} ${theme.chipText} ring-1 ${theme.ring}`}>
        <BlockTypeIcon type={type} className="h-3.5 w-3.5" />
      </span>
    );
  }

  return <span className="block h-6 w-6 rounded-full border-2 border-neutral-300 bg-white" />;
}
