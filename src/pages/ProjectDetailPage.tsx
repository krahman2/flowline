import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Copy,
  GitBranch,
  List as ListIcon,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Target,
  Trash2,
} from 'lucide-react';
import { useApp, useProject } from '../store/AppContext';
import type { FlowItem, ProjectViewMode } from '../types';
import {
  formatDuration,
  getCurrentItem,
  getProjectProgress,
  getRemainingMinutes,
  getTotalPlannedMinutes,
  isProjectComplete,
} from '../utils/flowHelpers';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { ProjectMark } from '../components/illustrations/ProjectMark';
import { FlowlineTimeline } from '../components/flowline/FlowlineTimeline';
import { ListView } from '../components/views/ListView';
import { CalendarView } from '../components/views/CalendarView';
import { ProjectStats } from '../components/views/ProjectStats';
import { ProjectInspector } from '../components/views/ProjectInspector';
import { FocusTimelineMode } from '../components/focus/FocusTimelineMode';
import { AddItemModal } from '../components/modals/AddItemModal';
import { AddBufferModal } from '../components/modals/AddBufferModal';
import { AddProjectModal } from '../components/modals/AddProjectModal';
import type { ItemActions } from '../components/flowline/ItemActionsMenu';

const TABS = [
  { id: 'flowline' as const, label: 'Flowline', icon: GitBranch },
  { id: 'list' as const, label: 'List', icon: ListIcon },
  { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
  { id: 'goals' as const, label: 'Stats', icon: Target },
];

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useProject(projectId);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    startFlow,
    deleteProject,
    duplicateProject,
    deleteItem,
    duplicateItem,
    moveItem,
    setCurrentItem,
    toggleItemComplete,
    addBufferAfter,
  } = useApp();

  const [tab, setTab] = useState<ProjectViewMode>('flowline');
  const [focusOpen, setFocusOpen] = useState(false);
  const [editItem, setEditItem] = useState<FlowItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addParent, setAddParent] = useState<string | undefined>();
  const [bufferAfter, setBufferAfter] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);

  const current = project ? getCurrentItem(project.items) : undefined;
  const complete = project ? isProjectComplete(project.items) : false;

  const openFocus = () => {
    if (!project) return;
    if (complete || !getCurrentItem(project.items)) startFlow(project.id);
    setFocusOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('focus') === '1' && project) {
      if (complete || !getCurrentItem(project.items)) startFlow(project.id);
      setFocusOpen(true);
      searchParams.delete('focus');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, project?.id]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-neutral-500">Flow not found.</p>
        <Link to="/projects" className="btn-ghost mt-4">
          Back to projects
        </Link>
      </div>
    );
  }

  const progress = getProjectProgress(project.items);
  const planned = getTotalPlannedMinutes(project.items);
  const remaining = getRemainingMinutes(project.items);
  const color = project.color ?? 'var(--color-flow-500)';

  const openAdd = (parent?: string) => {
    setAddParent(parent);
    setAddOpen(true);
  };

  const buildActions = (item: FlowItem): ItemActions => ({
    onEdit: () => setEditItem(item),
    onDuplicate: () => duplicateItem(project.id, item.id),
    onDelete: () => deleteItem(project.id, item.id),
    onMoveUp: () => moveItem(project.id, item.id, 'up'),
    onMoveDown: () => moveItem(project.id, item.id, 'down'),
    onAddChild:
      item.type === 'section' || item.type === 'task' ? () => openAdd(item.id) : undefined,
    onAddBufferAfter: () => setBufferAfter(item.id),
    onToggleComplete:
      item.type !== 'section' && item.type !== 'milestone'
        ? () => toggleItemComplete(project.id, item.id)
        : undefined,
    onSetCurrent:
      item.type !== 'section' && item.type !== 'milestone'
        ? () => setCurrentItem(project.id, item.id)
        : undefined,
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      {/* Sticky compact header */}
      <div className="top-header-safe sticky z-20 -mx-4 mb-6 border-b border-neutral-200/70 bg-canvas/85 px-4 pb-3 pt-1 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 py-1.5 text-xs text-neutral-400 transition hover:text-neutral-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Projects
        </Link>

        <div className="flex items-center gap-3">
          <ProjectMark mark={project.icon} color={color} size={44} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight text-neutral-900">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-400">
              {project.dueDate && <span>Due {project.dueDate}</span>}
              <span>{formatDuration(planned)} planned</span>
              <span>{formatDuration(remaining)} left</span>
              {current && (
                <span className="font-medium text-flow-600">· {current.title}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => openAdd()} className="btn-ghost hidden py-2 sm:inline-flex">
              <Plus className="h-4 w-4" />
              Add block
            </button>
            <button onClick={openFocus} className="btn-primary py-2">
              <Play className="h-4 w-4" />
              {complete ? 'Restart' : 'Start Flow'}
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setEditProjectOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit flow
                  </button>
                  <button
                    onClick={() => {
                      const newId = duplicateProject(project.id);
                      navigate(`/projects/${newId}`);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate flow
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this flow? This cannot be undone.')) {
                        deleteProject(project.id);
                        navigate('/projects');
                      }
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete flow
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <ProgressBar value={progress} color={color} className="h-1.5" />
        </div>

        <div className="mt-3">
          <SegmentedTabs segments={TABS} value={tab} onChange={(v) => setTab(v as ProjectViewMode)} />
        </div>
      </div>

      {/* Workspace */}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0">
          {project.description && tab === 'flowline' && (
            <p className="mb-5 max-w-2xl text-sm text-neutral-500">{project.description}</p>
          )}
          {tab === 'flowline' && (
            <FlowlineTimeline
              project={project}
              currentItemId={current?.id}
              onStartFocus={openFocus}
              buildActions={buildActions}
            />
          )}
          {tab === 'list' && <ListView project={project} />}
          {tab === 'calendar' && <CalendarView projects={[project]} onEditItem={(i) => setEditItem(i)} />}
          {tab === 'goals' && <ProjectStats project={project} />}
        </main>

        <aside className="hidden xl:block">
          <div className="top-header-safe sticky" style={{ top: 'calc(8.5rem + env(safe-area-inset-top, 0px))' }}>
            <ProjectInspector project={project} onStartFlow={openFocus} onAddBlock={() => openAdd()} />
          </div>
        </aside>
      </div>

      {focusOpen && <FocusTimelineMode project={project} onClose={() => setFocusOpen(false)} />}

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

      {bufferAfter && (
        <AddBufferModal
          onClose={() => setBufferAfter(null)}
          onConfirm={(minutes) => {
            addBufferAfter(project.id, bufferAfter, minutes);
            setBufferAfter(null);
          }}
        />
      )}

      {editProjectOpen && (
        <AddProjectModal project={project} onClose={() => setEditProjectOpen(false)} />
      )}

      {/* Mobile: quick add — desktop uses sidebar / header button */}
      <button
        type="button"
        onClick={() => openAdd()}
        aria-label="Add block"
        className="fixed right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-flow-600 text-white shadow-lg transition active:scale-95 lg:hidden"
        style={{ bottom: 'calc(4.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
