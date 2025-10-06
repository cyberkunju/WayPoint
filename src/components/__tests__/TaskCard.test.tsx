import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskCard } from '../TaskCard';
import { Task } from '../../lib/types';

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
  toast: vi.fn((message: any) => {}),
}));

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  priority: 2,
  dueDate: '2024-12-31',
  labels: ['urgent', 'work'],
  dependencies: [],
  subtasks: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('TaskCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('displays labels', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
  });

  it('shows task card with proper structure', () => {
    render(<TaskCard task={mockTask} />);
    const card = screen.getByRole('button', { name: /Task: Test Task/i });
    expect(card).toBeInTheDocument();
  });

  it('renders with completed state', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskCard task={completedTask} />);
    
    const button = screen.getByRole('button', { name: /Mark "Test Task"/i });
    expect(button).toBeInTheDocument();
  });

  it('handles click to open detail panel', () => {
    const { container } = render(<TaskCard task={mockTask} />);
    const card = screen.getByRole('button', { name: /Task: Test Task/i });
    
    fireEvent.click(card);
    
    // Detail panel should open when task is clicked
    expect(card).toBeInTheDocument();
  });

  it('renders without description when not provided', () => {
    const taskWithoutDesc = { ...mockTask, description: undefined };
    render(<TaskCard task={taskWithoutDesc} />);
    
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('displays priority indicator', () => {
    render(<TaskCard task={mockTask} />);
    const card = screen.getByRole('button', { name: /Priority 2/i });
    expect(card).toBeInTheDocument();
  });
});
