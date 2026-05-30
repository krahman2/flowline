import { useApp } from '../store/AppContext';
import { Page, PageHeader } from '../components/ui/PageHeader';
import { CalendarView } from '../components/views/CalendarView';

export function GlobalCalendarPage() {
  const { projects } = useApp();
  return (
    <Page>
      <PageHeader title="Calendar" subtitle="Scheduled blocks and due dates across all projects" />
      <CalendarView projects={projects} />
    </Page>
  );
}
