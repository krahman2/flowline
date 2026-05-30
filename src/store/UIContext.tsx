import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AddProjectModal } from '../components/modals/AddProjectModal';

type UIContextValue = {
  openNewProject: () => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [showNewProject, setShowNewProject] = useState(false);

  const openNewProject = useCallback(() => setShowNewProject(true), []);

  const value = useMemo(() => ({ openNewProject }), [openNewProject]);

  return (
    <UIContext.Provider value={value}>
      {children}
      {showNewProject && <AddProjectModal onClose={() => setShowNewProject(false)} />}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
