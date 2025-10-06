import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Task } from '../../lib/types';
import { TaskCard } from '../TaskCard';

// Mock dependencies
vi.mock('../../hooks/use-store', () => ({
  useTaskStore: () => ({
    toggleTask: vi.fn(),
  }),
}));

vi.mock('../../contexts/AppContext', () => ({
  useAppContext: () => ({
    setSelectedTaskId: vi.fn(),
    setIsDetailPanelOpen: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: vi.fn(),
}));

// Mock data
const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  priority: 2,
  dueDate: '2024-01-15',
  labels: ['urgent', 'work'],
  dependencies: [],
  subtasks: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('Task Management Core', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TaskCard Component', () => {
    it('renders task information correctly', () => {
      render(<TaskCard task={mockTask} />);
      
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('displays priority indicator correctly', () => {
      render(<TaskCard task={mockTask} />);
      
      const card = screen.getByRole('button', { name: /Priority 2/i });
      expect(card).toBeInTheDocument();
    });

    it('shows labels when present', () => {
      render(<TaskCard task={mockTask} />);
      
      expect(screen.getByText('urgent')).toBeInTheDocument();
      expect(screen.getByText('work')).toBeInTheDocument();
    });
  });
});
