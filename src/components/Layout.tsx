import { ReactNode, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DetailPanel } from './DetailPanel';
import { AIAssistant } from './AIAssistant';
import { Toaster } from './ui/sonner';
import { useUserStore } from '../hooks/use-store';
import { useAppContext } from '../contexts/AppContext';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { preferences } = useUserStore();
  const { isDetailPanelOpen } = useAppContext();

  // Apply theme to document
  useEffect(() => {
    const theme = preferences?.theme || 'light';
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [preferences?.theme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
            
            {isDetailPanelOpen && <DetailPanel />}
          </div>
        </div>
      </div>
      
      <AIAssistant />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}