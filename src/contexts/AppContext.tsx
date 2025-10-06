import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';

interface AppContextType {
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDetailPanelOpen: boolean;
  setIsDetailPanelOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Use useKV for currentView to persist across refreshes
  const [persistedView, setPersistedView] = useKV<string>('clarity-current-view', 'inbox');
  
  // Use regular React state for UI interactions
  const [currentView, setCurrentViewState] = useState<string>(persistedView ?? 'inbox');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState<boolean>(false);

  // Sync currentView with persisted storage
  useEffect(() => {
    if (persistedView !== undefined && persistedView !== currentView) {
      setCurrentViewState(persistedView);
    }
  }, [persistedView]);

  const setCurrentView = (view: string) => {
    setCurrentViewState(view);
    setPersistedView(view);
  };

  return (
    <AppContext.Provider
      value={{
        selectedTaskId,
        setSelectedTaskId,
        currentView,
        setCurrentView,
        searchQuery,
        setSearchQuery,
        isDetailPanelOpen,
        setIsDetailPanelOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
