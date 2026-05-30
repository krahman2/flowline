import { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import type { FlowItem, Project } from '../../types';
import { useApp } from '../../store/AppContext';
import {
  formatDuration,
  getEffectiveDurationMinutes,
  getIndentLevel,
  getSortedItems,
  getTypeTheme,
  isRollupParent,
} from '../../utils/flowHelpers';
import { ItemActionsMenu } from '../flowline/ItemActionsMenu';
import { AddItemModal } from '../modals/AddItemModal';
import { TypeChip } from '../ui/TypeChip';

export function ListView({ project }: { project: Project }) {
  const {
    toggleItemComplete,
    setCurrentItem,
    deleteItem,
    duplicateItem,
    moveItem,
    addBufferAfter,
    updateItem,
  } = useApp();
  const [editItem, setEditItem] = useState<FlowItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addParent, setAddParent] = useState<string | undefined>();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editingDuration, setEditingDuration] = useState<string | null>(null);

  const sorted = getSortedItems(project.items);

  const hiddenIds = useMemo(() => {
    const hidden = new Set<string>();
    const collect = (parentId: string) => {
      for (const child of project.items.filter((i) => i.parentId === parentId)) {
        hidden.add(child.id);
        collect(child.id);
      }
    };
    collapsed.forEach((id) => collect(id));
    return hidden;
  }, [collapsed, project.items]);

  const childCount = (id: string) => project.items.filter((i) => i.parentId === id).length;

  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const visible = sorted.filter((i) => !hiddenIds.has(i.id));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-neutral-400">{project.items.length} blocks</p>
        <button
          onClick={() => {
            setAddParent(undefined);
            setAddOpen(true);
          }}
          className="btn-subtle"
        >
          <Plus className="h-4 w-4" />
          Add block
        </button>
      </div>

      <div className="card divide-y divide-neutral-100 overflow-hidden">
        {visible.map((item) => {
          const indent = getIndentLevel(project.items, item);
          const theme = getTypeTheme(item.type);
          const focusable = item.type !== 'section' && item.type !== 'milestone';
          const isSection = item.type === 'section';
          const expandable = (item.type === 'section' || item.type === 'task') && childCount(item.id) > 0;
          const isCollapsed = collapsed.has(item.id);

          return (
            <div
              key={item.id}
              className={`group flex items-center gap-3 px-4 py-3 transition hover:bg-neutral-50/70 ${
                item.status === 'current' ? 'bg-flow-50/40' : ''
              }`}
              style={{ paddingLeft: 16 + indent * 24 }}
            >
              {expandable ? (
                <button
                  onClick={() => toggleCollapse(item.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
                >
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              ) : focusable ? (
                <button
                  onClick={() => toggleItemComplete(project.id, item.id)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    item.status === 'completed'
                      ? 'border-flow-600 bg-flow-600 text-white'
                      : 'border-neutral-300 hover:border-flow-400'
                  }`}
                >
                  {item.status === 'completed' && <Check className="h-3 w-3" strokeWidth={3} />}
                </button>
              ) : (
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${theme.dot}`} />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {!isSection && <TypeChip type={item.type} />}
                  <span
                    className={`truncate ${
                      isSection
                        ? 'text-[13px] font-semibold uppercase tracking-wide text-neutral-500'
                        : item.status === 'completed'
                          ? 'text-[15px] text-neutral-400 line-through'
                          : 'text-[15px] font-medium text-neutral-800'
                    }`}
                  >
                    {item.title}
                  </span>
                  {expandable && isCollapsed && (
                    <span className="text-xs text-neutral-300">({childCount(item.id)})</span>
                  )}
                </div>
              </div>

              {/* Inline duration edit */}
              {item.type !== 'milestone' && item.type !== 'section' && (
                isRollupParent(project.items, item) ? (
                  <span
                    className="shrink-0 rounded-md px-1.5 py-0.5 text-xs tabular-nums text-flow-600"
                    title="Rolls up from subtasks"
                  >
                    {formatDuration(getEffectiveDurationMinutes(project.items, item))}
                  </span>
                ) : editingDuration === item.id ? (
                  <input
                    type="number"
                    min={1}
                    autoFocus
                    defaultValue={item.durationMinutes}
                    onBlur={(e) => {
                      updateItem(project.id, item.id, {
                        durationMinutes: Math.max(1, Number(e.target.value) || item.durationMinutes),
                      });
                      setEditingDuration(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      if (e.key === 'Escape') setEditingDuration(null);
                    }}
                    className="w-16 rounded-lg border border-flow-300 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-flow-100"
                  />
                ) : (
                  <button
                    onClick={() => setEditingDuration(item.id)}
                    className="shrink-0 rounded-md px-1.5 py-0.5 text-xs tabular-nums text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
                  >
                    {formatDuration(item.durationMinutes)}
                  </button>
                )
              )}

              <div className="shrink-0 opacity-0 transition group-hover:opacity-100">
                <ItemActionsMenu
                  item={item}
                  actions={{
                    onEdit: () => setEditItem(item),
                    onDuplicate: () => duplicateItem(project.id, item.id),
                    onDelete: () => deleteItem(project.id, item.id),
                    onMoveUp: () => moveItem(project.id, item.id, 'up'),
                    onMoveDown: () => moveItem(project.id, item.id, 'down'),
                    onAddChild:
                      item.type === 'section' || item.type === 'task'
                        ? () => {
                            setAddParent(item.id);
                            setAddOpen(true);
                          }
                        : undefined,
                    onAddBufferAfter: () => addBufferAfter(project.id, item.id, 10),
                    onToggleComplete: focusable
                      ? () => toggleItemComplete(project.id, item.id)
                      : undefined,
                    onSetCurrent: focusable ? () => setCurrentItem(project.id, item.id) : undefined,
                  }}
                />
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="py-14 text-center text-sm text-neutral-400">
            No blocks yet. Add your first one.
          </div>
        )}
      </div>

      {(addOpen || editItem) && (
        <AddItemModal
          projectId={project.id}
          item={editItem ?? undefined}
          defaultParentId={addParent}
          onClose={() => {
            setAddOpen(false);
            setEditItem(null);
            setAddParent(undefined);
          }}
        />
      )}
    </div>
  );
}
