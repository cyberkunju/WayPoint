import { createContext, useContext, ReactNode } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Debug logging
const DEBUG = true;
const log = (message: string, data?: any) => {
  if (DEBUG) {
    const timestamp = performance.now();
    console.log(`[AppState ${timestamp.toFixed(2)}ms] ${message}`, data || '');
  }
};

interface AppState {
  selectedTaskId: string | null;
  currentView: string;
  searchQuery: string;
  isDetailPanelOpen: boolean;
  
  setSelectedTaskId: (id: string | null) => void;
  setCurrentView: (view: string) => void;
  setSearchQuery: (query: string) => void;
  setIsDetailPanelOpen: (open: boolean) => void;
}

// Zustand store for app state - blazing fast!
export const useAppState = create<AppState>()(
  persist(
    (set) => ({
      selectedTaskId: null,
      currentView: 'inbox',
      searchQuery: '',
      isDetailPanelOpen: false,
      
      setSelectedTaskId: (id) => {
        const start = performance.now();
        set({ selectedTaskId: id });
        log(`Selected task in ${(performance.now() - start).toFixed(2)}ms`, id);
      },
      
      setCurrentView: (view) => {
        const start = performance.now();
        set({ currentView: view });
        log(`View changed in ${(performance.now() - start).toFixed(2)}ms`, view);
      },
      
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
      
      setIsDetailPanelOpen: (open) => {
        set({ isDetailPanelOpen: open });
      },
    }),
    {
      name: 'clarity-app-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentView: state.currentView }), // Only persist currentView
      onRehydrateStorage: () => (state) => {
        log('App state rehydrated', { currentView: state?.currentView });
      },
    }
  )
);

// Legacy Context API (for backward compatibility)
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
  // Use Zustand store
  const state = useAppState();
  
  return (
    <AppContext.Provider value={state}>
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
