import type { FlowItemType } from '../../types';
import { getItemTypeLabel, getTypeTheme } from '../../utils/flowHelpers';
import { BlockTypeIcon } from '../illustrations/BlockTypeIcon';

export function TypeChip({ type, className = '' }: { type: FlowItemType; className?: string }) {
  const theme = getTypeTheme(type);
  return (
    <span className={`chip ${theme.chipBg} ${theme.chipText} ${className}`}>
      <BlockTypeIcon type={type} className="h-3 w-3" />
      {getItemTypeLabel(type)}
    </span>
  );
}
