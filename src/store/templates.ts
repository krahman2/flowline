import type { FlowItem, FlowItemType } from '../types';

export type TemplateItem = {
  title: string;
  type: FlowItemType;
  durationMinutes: number;
  notes?: string;
  section?: string;
};

export type ProjectTemplate = {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  items: TemplateItem[];
};

export const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank flow',
    icon: 'path',
    description: 'Start from an empty timeline',
    color: '#4f6bf6',
    items: [],
  },
  {
    id: 'homework',
    name: 'Homework',
    icon: 'target',
    description: 'Question blocks with breaks and review',
    color: '#4f6bf6',
    items: [
      { title: 'Question 1', type: 'section', durationMinutes: 0 },
      { title: '1a', type: 'subtask', durationMinutes: 20, section: 'Question 1' },
      { title: '1b', type: 'subtask', durationMinutes: 20, section: 'Question 1' },
      { title: '1c', type: 'subtask', durationMinutes: 20, section: 'Question 1' },
      { title: 'Short Break', type: 'break', durationMinutes: 10 },
      { title: 'Question 2', type: 'section', durationMinutes: 0 },
      { title: '2a', type: 'subtask', durationMinutes: 20, section: 'Question 2' },
      { title: '2b', type: 'subtask', durationMinutes: 20, section: 'Question 2' },
      { title: '2c', type: 'subtask', durationMinutes: 20, section: 'Question 2' },
      { title: 'Review & Submit', type: 'review', durationMinutes: 15 },
      { title: 'Extra Buffer', type: 'buffer', durationMinutes: 20 },
      { title: 'Homework Complete', type: 'milestone', durationMinutes: 0 },
    ],
  },
  {
    id: 'essay',
    name: 'Essay',
    icon: 'book',
    description: 'Research, draft, revise, submit',
    color: '#10b981',
    items: [
      { title: 'Gather sources', type: 'task', durationMinutes: 25 },
      { title: 'Outline', type: 'task', durationMinutes: 20 },
      { title: 'Draft intro', type: 'task', durationMinutes: 25 },
      { title: 'Draft body', type: 'task', durationMinutes: 45 },
      { title: 'Break', type: 'break', durationMinutes: 10 },
      { title: 'Revise', type: 'task', durationMinutes: 30 },
      { title: 'Final review', type: 'review', durationMinutes: 20 },
      { title: 'Buffer', type: 'buffer', durationMinutes: 15 },
      { title: 'Submit Essay', type: 'milestone', durationMinutes: 0 },
    ],
  },
  {
    id: 'study',
    name: 'Study session',
    icon: 'layers',
    description: 'Review, practice, self-quiz',
    color: '#8b5cf6',
    items: [
      { title: 'Review notes', type: 'task', durationMinutes: 25 },
      { title: 'Practice problems', type: 'task', durationMinutes: 30 },
      { title: 'Break', type: 'break', durationMinutes: 10 },
      { title: 'Quiz yourself', type: 'task', durationMinutes: 20 },
      { title: 'Review mistakes', type: 'review', durationMinutes: 20 },
      { title: 'Buffer', type: 'buffer', durationMinutes: 15 },
    ],
  },
  {
    id: 'coding',
    name: 'Coding project',
    icon: 'code',
    description: 'Plan, build, test, ship',
    color: '#0c87eb',
    items: [
      { title: 'Plan & scope', type: 'task', durationMinutes: 20 },
      { title: 'Build', type: 'section', durationMinutes: 0 },
      { title: 'Core feature', type: 'task', durationMinutes: 45, section: 'Build' },
      { title: 'Edge cases', type: 'task', durationMinutes: 25, section: 'Build' },
      { title: 'Break', type: 'break', durationMinutes: 10 },
      { title: 'Write tests', type: 'task', durationMinutes: 30 },
      { title: 'Code review pass', type: 'review', durationMinutes: 20 },
      { title: 'Buffer', type: 'buffer', durationMinutes: 20 },
      { title: 'Ship it', type: 'milestone', durationMinutes: 0 },
    ],
  },
  {
    id: 'exam',
    name: 'Exam prep',
    icon: 'spark',
    description: 'Topic review with timed practice',
    color: '#f43f5e',
    items: [
      { title: 'Topic 1 review', type: 'task', durationMinutes: 30 },
      { title: 'Topic 1 practice', type: 'task', durationMinutes: 25 },
      { title: 'Break', type: 'break', durationMinutes: 10 },
      { title: 'Topic 2 review', type: 'task', durationMinutes: 30 },
      { title: 'Topic 2 practice', type: 'task', durationMinutes: 25 },
      { title: 'Mock test', type: 'review', durationMinutes: 40 },
      { title: 'Buffer', type: 'buffer', durationMinutes: 20 },
      { title: 'Ready for Exam', type: 'milestone', durationMinutes: 0 },
    ],
  },
];

/** Materialize template items into FlowItems for a given project. */
export function buildTemplateItems(projectId: string, template: ProjectTemplate): FlowItem[] {
  const sectionIds: Record<string, string> = {};
  const items: FlowItem[] = [];
  template.items.forEach((def, index) => {
    const id = `${projectId}-${index}-${Math.random().toString(36).slice(2, 8)}`;
    if (def.type === 'section') sectionIds[def.title] = id;
    items.push({
      id,
      projectId,
      parentId: def.section ? sectionIds[def.section] : undefined,
      title: def.title,
      type: def.type,
      durationMinutes: def.durationMinutes,
      status: 'not_started',
      notes: def.notes,
      order: index,
    });
  });
  const firstFocusable = items.find((i) => i.type !== 'section' && i.type !== 'milestone');
  if (firstFocusable) firstFocusable.status = 'current';
  return items;
}
