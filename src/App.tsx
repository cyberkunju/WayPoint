import { Layout } from './components/Layout';
import { TaskList } from './components/TaskList';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { GanttChart } from './components/GanttChart';
import { MindMapView } from './components/MindMapView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { useAppContext } from './contexts/AppContext';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { useInitializeData } from './hooks/use-initialize-data';

function App() {
  const { currentView } = useAppContext();
  
  // Initialize sample data on first load
  useInitializeData();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  const renderMainContent = () => {
    switch (currentView) {
      case 'kanban':
        return <KanbanBoard />;
      case 'today':
      case 'calendar':
        return <CalendarView />;
      case 'gantt':
        return <GanttChart />;
      case 'mindmap':
        return <MindMapView />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <TaskList />;
    }
  };

  return (
    <Layout>
      {renderMainContent()}
    </Layout>
  );
}

export default App;