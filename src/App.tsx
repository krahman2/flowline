import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { AuthProvider } from './store/AuthContext';
import { useStandalone } from './hooks/useStandalone';
import { UIProvider } from './store/UIContext';
import { ThemeApplier } from './components/ThemeApplier';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { TodayPage } from './pages/TodayPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { GlobalCalendarPage } from './pages/GlobalCalendarPage';
import { GlobalHistoryPage } from './pages/GlobalHistoryPage';
import { GlobalGoalsPage } from './pages/GlobalGoalsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  useStandalone();

  return (
    <AuthProvider>
      <AppProvider>
        <ThemeApplier />
        <BrowserRouter>
          <UIProvider>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="today" element={<TodayPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:projectId" element={<ProjectDetailPage />} />
                <Route path="calendar" element={<GlobalCalendarPage />} />
                <Route path="history" element={<GlobalHistoryPage />} />
                <Route path="goals" element={<GlobalGoalsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </UIProvider>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
