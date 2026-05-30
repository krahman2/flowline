import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { TEMPLATES } from '../../store/templates';
import { Modal } from '../ui/Modal';
import { ProjectMark } from '../illustrations/ProjectMark';
import { MARK_IDS } from '../illustrations/marks';
import { TemplateMark } from '../illustrations/TemplateMark';
import type { Project } from '../../types';

const COLORS = ['#4f6bf6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#0ea5e9'];

type Props = {
  onClose: () => void;
  navigateOnCreate?: boolean;
  project?: Project;
};

export function AddProjectModal({ onClose, navigateOnCreate = true, project }: Props) {
  const { addProject, createProjectFromTemplate, updateProject } = useApp();
  const navigate = useNavigate();
  const editing = !!project;
  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [dueDate, setDueDate] = useState(project?.dueDate ?? '');
  const [color, setColor] = useState(project?.color ?? COLORS[0]);
  const [icon, setIcon] = useState<string>(project?.icon ?? 'path');
  const [templateId, setTemplateId] = useState('blank');

  const submit = () => {
    if (!title.trim()) return;
    const meta = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      color,
      icon,
    };
    if (editing && project) {
      updateProject(project.id, meta);
      onClose();
      return;
    }
    const template = TEMPLATES.find((t) => t.id === templateId);
    const id =
      template && template.items.length > 0
        ? createProjectFromTemplate(meta, template)
        : addProject(meta);
    onClose();
    if (navigateOnCreate) navigate(`/projects/${id}`);
  };

  return (
    <Modal
      title={editing ? 'Edit flow' : 'New flow'}
      subtitle="Give your flow a name and identity"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="btn-subtle">
            Cancel
          </button>
          <button onClick={submit} disabled={!title.trim()} className="btn-primary">
            {editing ? 'Save changes' : 'Create flow'}
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
            placeholder="e.g. Math Homework"
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="input resize-none"
            placeholder="Optional"
          />
        </div>

        {!editing && (
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Start from a template</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTemplateId(t.id);
                  if (t.id !== 'blank') {
                    setIcon(t.icon);
                    setColor(t.color);
                  }
                }}
                className={`rounded-xl border p-2.5 text-left transition ${
                  templateId === t.id
                    ? 'border-flow-300 bg-flow-50/60 ring-1 ring-flow-100'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <TemplateMark mark={t.icon} color={t.color} size={28} />
                <p className="mt-1 text-sm font-medium text-neutral-800">{t.name}</p>
                <p className="truncate text-[11px] text-neutral-400">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Due date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Mark</label>
          <div className="flex flex-wrap gap-2">
            {MARK_IDS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setIcon(m)}
                className={`rounded-2xl p-0.5 transition ${
                  icon === m ? 'ring-2 ring-flow-400' : 'ring-1 ring-transparent hover:ring-neutral-200'
                }`}
              >
                <ProjectMark mark={m} color={color} size={36} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Color</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full transition ${
                  color === c ? 'ring-2 ring-neutral-300 ring-offset-2' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
