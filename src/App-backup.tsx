import { Layout } from './components/Layout';
import { TaskList } from './components/TaskList';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { useAppState } from './hooks/use-store';
import { useInitializeData } from './hooks/use-initialize-data';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';

function App() {
  const { currentView } = useAppState();
  
  // Initialize sample data if needed
  useInitializeData();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  const renderMainContent = () => {
    switch (currentView) {
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