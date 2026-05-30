import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useUI } from '../store/UIContext';
import { Page, PageHeader } from '../components/ui/PageHeader';
import { ProjectCard } from '../components/ui/ProjectCard';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { EmptyState } from '../components/ui/EmptyState';
import { EmptyFlowIllustration } from '../components/illustrations/EmptyFlowIllustration';
import { getProjectProgress, isProjectComplete } from '../utils/flowHelpers';

type Filter = 'all' | 'active' | 'due_soon' | 'completed';
type Sort = 'recent' | 'due' | 'progress';

const FILTERS = [
  { id: 'all' as const, label: 'All' },
  { id: 'active' as const, label: 'Active' },
  { id: 'due_soon' as const, label: 'Due soon' },
  { id: 'completed' as const, label: 'Completed' },
];

const SORTS = [
  { id: 'recent' as const, label: 'Recent' },
  { id: 'due' as const, label: 'Due date' },
  { id: 'progress' as const, label: 'Progress' },
];

function dueInDays(date?: string) {
  if (!date) return Infinity;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export function ProjectsPage() {
  const { projects } = useApp();
  const { openNewProject } = useUI();
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('recent');

  const list = useMemo(() => {
    let out = [...projects];
    if (filter === 'active') out = out.filter((p) => !isProjectComplete(p.items));
    else if (filter === 'completed') out = out.filter((p) => isProjectComplete(p.items));
    else if (filter === 'due_soon')
      out = out.filter((p) => !isProjectComplete(p.items) && dueInDays(p.dueDate) <= 3);

    out.sort((a, b) => {
      if (sort === 'recent') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sort === 'due') return dueInDays(a.dueDate) - dueInDays(b.dueDate);
      return getProjectProgress(b.items) - getProjectProgress(a.items);
    });
    return out;
  }, [projects, filter, sort]);

  return (
    <Page>
      <PageHeader
        title="Flows"
        subtitle="Every project you're moving through"
        actions={
          <button onClick={openNewProject} className="btn-primary">
            <Plus className="h-4 w-4" />
            New flow
          </button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          illustration={<EmptyFlowIllustration className="h-28 w-28" />}
          title="No flows yet"
          description="Create your first flow to turn a project into a timed progress path."
          actions={
            <button onClick={openNewProject} className="btn-primary">
              Create flow
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <SegmentedTabs segments={FILTERS} value={filter} onChange={setFilter} size="sm" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Sort</span>
              <SegmentedTabs segments={SORTS} value={sort} onChange={setSort} size="sm" />
            </div>
          </div>

          {list.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-400">No flows match this filter.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3), ease: 'easeOut' }}
                >
                  <ProjectCard project={p} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </Page>
  );
}
