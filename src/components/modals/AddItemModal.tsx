import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Modal } from '../ui/Modal';
import type { FlowItem, FlowItemType } from '../../types';
import {
  formatDuration,
  getCurrentItem,
  getFocusableChildItems,
  getItemTypeLabel,
  isRollupParent,
} from '../../utils/flowHelpers';

const TYPES: FlowItemType[] = ['section', 'task', 'subtask', 'break', 'buffer', 'review', 'milestone'];

type Position = 'end' | 'after_current';

type Props = {
  projectId: string;
  item?: FlowItem;
  defaultParentId?: string;
  onClose: () => void;
};

export function AddItemModal({ projectId, item, defaultParentId, onClose }: Props) {
  const { addItem, updateItem, getProject, preferences } = useApp();
  const project = getProject(projectId);

  const [title, setTitle] = useState(item?.title ?? '');
  const [type, setType] = useState<FlowItemType>(item?.type ?? (defaultParentId ? 'subtask' : 'task'));
  const [durationMinutes, setDurationMinutes] = useState(item?.durationMinutes ?? preferences.defaultFocusMinutes);

  const pickType = (t: FlowItemType) => {
    setType(t);
    if (!item) {
      if (t === 'break') setDurationMinutes(preferences.defaultBreakMinutes);
      else if (t === 'buffer') setDurationMinutes(preferences.defaultBufferMinutes);
      else if (t !== 'milestone' && t !== 'section') setDurationMinutes(preferences.defaultFocusMinutes);
    }
  };
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [parentId, setParentId] = useState(item?.parentId ?? defaultParentId ?? '');
  const [scheduledDate, setScheduledDate] = useState(item?.scheduledDate ?? '');
  const [position, setPosition] = useState<Position>('end');

  const current = project ? getCurrentItem(project.items) : undefined;
  const editingRollup =
    item && project ? isRollupParent(project.items, item) : false;
  const rollupChildCount =
    item && project ? getFocusableChildItems(project.items, item.id).length : 0;

  const parents = (project?.items ?? []).filter(
    (i) => (i.type === 'section' || i.type === 'task') && i.id !== item?.id,
  );
  const noDuration = type === 'milestone' || type === 'section';

  const submit = () => {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      type,
      durationMinutes: noDuration ? 0 : durationMinutes,
      notes: notes.trim() || undefined,
      parentId: parentId || undefined,
      scheduledDate: scheduledDate || undefined,
    };
    if (item) {
      updateItem(projectId, item.id, payload);
    } else {
      const afterId = position === 'after_current' && current ? current.id : undefined;
      addItem(projectId, payload, afterId);
    }
    onClose();
  };

  return (
    <Modal
      title={item ? 'Edit block' : 'Add block'}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="btn-subtle">
            Cancel
          </button>
          <button onClick={submit} disabled={!title.trim()} className="btn-primary">
            {item ? 'Save' : 'Add block'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="input"
            placeholder="Task name"
            autoFocus
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Type</label>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => pickType(t)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  type === t
                    ? 'bg-flow-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {getItemTypeLabel(t)}
              </button>
            ))}
          </div>
        </div>

        {!noDuration && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Duration (minutes)
            </label>
            {editingRollup ? (
              <p className="rounded-xl bg-flow-50 px-3 py-2.5 text-sm text-flow-700">
                {formatDuration(durationMinutes)} — auto-summed from {rollupChildCount} subtask
                {rollupChildCount === 1 ? '' : 's'}. Edit subtask times to change this.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                    className="input w-28"
                  />
                  <div className="flex gap-1.5">
                    {[10, 20, 25, 45].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDurationMinutes(m)}
                        className="rounded-lg bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200"
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
                {type === 'subtask' && parentId && (
                  <p className="mt-1.5 text-xs text-neutral-400">
                    Parent task time updates automatically from its subtasks.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {parents.length > 0 && type !== 'section' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Parent</label>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="input">
              <option value="">None (top level)</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {!item && current && !parentId && (
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">Position</label>
            <div className="flex gap-1.5">
              {([
                { id: 'end' as const, label: 'End of flow' },
                { id: 'after_current' as const, label: 'After current block' },
              ]).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPosition(opt.id)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    position === opt.id
                      ? 'bg-flow-600 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Scheduled date <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="input resize-none"
            placeholder="Optional"
          />
        </div>
      </div>
    </Modal>
  );
}
