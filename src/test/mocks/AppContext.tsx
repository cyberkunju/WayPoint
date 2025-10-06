import { ReactNode } from 'react';
import { vi } from 'vitest';

// Mock AppContext
const mockAppContext = {
  selectedTaskId: null,
  setSelectedTaskId: vi.fn(),
  isDetailPanelOpen: false,
  setIsDetailPanelOpen: vi.fn(),
  currentView: 'list' as const,
  setCurrentView: vi.fn(),
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const useAppContext = () => mockAppContext;
