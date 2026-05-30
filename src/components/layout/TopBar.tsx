import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useUI } from '../../store/UIContext';
import { FlowlineMark } from '../illustrations/FlowlineMark';
import { AuthButton } from '../auth/AuthButton';

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/today': 'Today Flow',
  '/projects': 'Flows',
  '/calendar': 'Calendar',
  '/history': 'History',
  '/goals': 'Goals & Stats',
  '/settings': 'Settings',
};

export function TopBar() {
  const { pathname } = useLocation();
  const { openNewProject } = useUI();
  const title = TITLES[pathname] ?? (pathname.startsWith('/projects/') ? 'Flow' : 'Flowline');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-neutral-200/70 bg-canvas/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <FlowlineMark className="h-7 w-7" />
        <span className="text-[15px] font-semibold tracking-tight">Flowline</span>
      </div>
      <h1 className="hidden text-sm font-semibold text-neutral-500 lg:block">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={openNewProject} className="btn-ghost py-2 text-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New flow</span>
        </button>
        <AuthButton />
      </div>
    </header>
  );
}
