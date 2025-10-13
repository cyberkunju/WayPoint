import { useMemo } from 'react';
import { Layout } from './components/Layout';
import { TaskList } from './components/TaskList';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { GanttChart } from './components/GanttChart';
import { MindMapView } from './components/MindMapView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { EpicManagement } from './components/EpicManagement';
import { ProjectManagement } from './components/ProjectManagement';
import { ProjectRoadmap } from './components/ProjectRoadmap';
import { useAppContext } from './contexts/AppContext';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { useInitializeData } from './hooks/use-initialize-data';
import { useUserStore } from './hooks/use-store';

function App() {
  const { currentView } = useAppContext();
  const { user } = useUserStore();
  
  // Initialize sample data on first load
  useInitializeData();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Memoize the rendered content to prevent unnecessary re-renders
  const renderMainContent = useMemo(() => {
    switch (currentView) {
      case 'kanban':
        return <KanbanBoard />;
      case 'today':
      case 'calendar':
        return <CalendarView />;
      case 'gantt':
        return <GanttChart />;
      case 'roadmap':
        return user ? <ProjectRoadmap userId={user.id} /> : <div>Please log in</div>;
      case 'mindmap':
        return <MindMapView />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'settings':
        return <SettingsPanel />;
      case 'epics':
        return user ? <EpicManagement userId={user.id} /> : <div>Please log in</div>;
      case 'projects':
        return user ? <ProjectManagement userId={user.id} /> : <div>Please log in</div>;
      default:
        return <TaskList />;
    }
  }, [currentView, user]);

  return (
    <Layout>
      {renderMainContent}
    </Layout>
  );
}

export default App;