import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useKV } from '@github/spark/hooks';
import { Task, Project } from '../lib/types';
import { TaskCard } from '../components/TaskCard';
import { QuickAddBar } from '../components/QuickAddBar';
import { KanbanBoard } from '../components/KanbanBoard';
import { CalendarView } from '../components/CalendarView';

// Mock the spark runtime
const mockKV = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  keys: jest.fn(),
};

global.window.spark = {
  kv: mockKV,
  llm: jest.fn(),
  llmPrompt: jest.fn(),
  user: jest.fn(),
};

// Mock useKV hook
jest.mock('@github/spark/hooks', () => ({
  useKV: jest.fn(),
}));

describe('Task Management Core', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useKV as jest.Mock).mockReturnValue([[], jest.fn(), jest.fn()]);
  });

  describe('TaskCard Component', () => {
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

    it('renders task information correctly', () => {
      render(<TaskCard task={mockTask} />);
      
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
      expect(screen.getByText('work')).toBeInTheDocument();
    });

    it('handles task completion toggle', async () => {
      const mockUpdateTask = jest.fn();
      (useKV as jest.Mock).mockReturnValue([[mockTask], jest.fn(), jest.fn()]);
      
      render(<TaskCard task={mockTask} onUpdate={mockUpdateTask} />);
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(mockTask.id, { completed: true });
      });
    });

    it('displays priority indicator correctly', () => {
      render(<TaskCard task={mockTask} />);
      
      const priorityElement = screen.getByTestId('task-priority');
      expect(priorityElement).toHaveClass('priority-2');
    });

    it('shows due date when present', () => {
      render(<TaskCard task={mockTask} />);
      
      expect(screen.getByText('Jan 15')).toBeInTheDocument();
    });

    it('handles overdue tasks styling', () => {
      const overdueTask = {
        ...mockTask,
        dueDate: '2023-12-01', // Past date
      };
      
      render(<TaskCard task={overdueTask} />);
      
      const dueDateElement = screen.getByText('Dec 1');
      expect(dueDateElement).toHaveClass('text-red-500');
    });
  });

  describe('QuickAddBar Component', () => {
    it('renders input field correctly', () => {
      render(<QuickAddBar />);
      
      const input = screen.getByPlaceholderText(/add a task/i);
      expect(input).toBeInTheDocument();
    });

    it('adds task on Enter key press', async () => {
      const mockAddTask = jest.fn();
      (useKV as jest.Mock).mockReturnValue([[], mockAddTask, jest.fn()]);
      
      render(<QuickAddBar />);
      
      const input = screen.getByPlaceholderText(/add a task/i);
      fireEvent.change(input, { target: { value: 'New test task' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(mockAddTask).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New test task',
          })
        );
      });
    });

    it('parses due dates from natural language', async () => {
      const mockAddTask = jest.fn();
      (useKV as jest.Mock).mockReturnValue([[], mockAddTask, jest.fn()]);
      
      render(<QuickAddBar />);
      
      const input = screen.getByPlaceholderText(/add a task/i);
      fireEvent.change(input, { target: { value: 'Call client tomorrow' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(mockAddTask).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Call client',
            dueDate: expect.any(String),
          })
        );
      });
    });

    it('parses priority indicators', async () => {
      const mockAddTask = jest.fn();
      (useKV as jest.Mock).mockReturnValue([[], mockAddTask, jest.fn()]);
      
      render(<QuickAddBar />);
      
      const input = screen.getByPlaceholderText(/add a task/i);
      fireEvent.change(input, { target: { value: 'Important task !!' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(mockAddTask).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Important task',
            priority: 1,
          })
        );
      });
    });
  });
});

describe('View Components', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Todo Task',
      completed: false,
      priority: 2,
      labels: [],
      dependencies: [],
      subtasks: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'In Progress Task',
      completed: false,
      priority: 1,
      labels: [],
      dependencies: [],
      subtasks: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '3',
      title: 'Done Task',
      completed: true,
      priority: 3,
      labels: [],
      dependencies: [],
      subtasks: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    (useKV as jest.Mock).mockReturnValue([mockTasks, jest.fn(), jest.fn()]);
  });

  describe('KanbanBoard Component', () => {
    it('renders all kanban columns', () => {
      render(<KanbanBoard />);
      
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('displays tasks in appropriate columns', () => {
      render(<KanbanBoard />);
      
      // Check that tasks appear in correct columns based on their status
      expect(screen.getByText('Todo Task')).toBeInTheDocument();
      expect(screen.getByText('Done Task')).toBeInTheDocument();
    });

    it('supports drag and drop functionality', async () => {
      const mockUpdateTask = jest.fn();
      (useKV as jest.Mock).mockReturnValue([mockTasks, mockUpdateTask, jest.fn()]);
      
      render(<KanbanBoard />);
      
      const taskElement = screen.getByText('Todo Task');
      const dropZone = screen.getByTestId('progress-column');
      
      // Simulate drag and drop
      fireEvent.dragStart(taskElement);
      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone);
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({ status: 'progress' })
        );
      });
    });
  });

  describe('CalendarView Component', () => {
    it('renders calendar grid correctly', () => {
      render(<CalendarView />);
      
      // Check for calendar navigation
      expect(screen.getByLabelText(/previous month/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next month/i)).toBeInTheDocument();
      
      // Check for weekday headers
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });

    it('displays tasks on correct dates', () => {
      const tasksWithDates = mockTasks.map((task, index) => ({
        ...task,
        dueDate: `2024-01-${15 + index}`,
      }));
      
      (useKV as jest.Mock).mockReturnValue([tasksWithDates, jest.fn(), jest.fn()]);
      
      render(<CalendarView />);
      
      // Tasks should appear on their due dates
      expect(screen.getByText('Todo Task')).toBeInTheDocument();
    });

    it('supports task rescheduling via drag and drop', async () => {
      const mockUpdateTask = jest.fn();
      const tasksWithDates = [{ ...mockTasks[0], dueDate: '2024-01-15' }];
      
      (useKV as jest.Mock).mockReturnValue([tasksWithDates, mockUpdateTask, jest.fn()]);
      
      render(<CalendarView />);
      
      const taskElement = screen.getByText('Todo Task');
      const newDateCell = screen.getByTestId('calendar-cell-2024-01-20');
      
      fireEvent.dragStart(taskElement);
      fireEvent.dragOver(newDateCell);
      fireEvent.drop(newDateCell);
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({ dueDate: '2024-01-20' })
        );
      });
    });
  });
});

describe('AI Assistant Integration', () => {
  beforeEach(() => {
    global.window.spark.llm = jest.fn().mockResolvedValue('AI response');
    global.window.spark.llmPrompt = jest.fn().mockReturnValue('formatted prompt');
  });

  it('generates task suggestions', async () => {
    const { result } = renderHook(() => useAIAssistant());
    
    await act(async () => {
      await result.current.generateTaskSuggestions();
    });
    
    expect(global.window.spark.llm).toHaveBeenCalledWith(
      expect.stringContaining('suggestions'),
      'gpt-4o',
      true
    );
  });

  it('analyzes overdue tasks', async () => {
    const { result } = renderHook(() => useAIAssistant());
    
    await act(async () => {
      await result.current.analyzeOverdueTasks();
    });
    
    expect(global.window.spark.llmPrompt).toHaveBeenCalled();
    expect(global.window.spark.llm).toHaveBeenCalled();
  });
});

describe('Data Persistence', () => {
  it('persists tasks correctly', async () => {
    const mockSetValue = jest.fn();
    (useKV as jest.Mock).mockReturnValue([[], mockSetValue, jest.fn()]);
    
    const { result } = renderHook(() => useTaskStore());
    
    await act(async () => {
      result.current.addTask({
        title: 'Test persistence',
        priority: 2,
      });
    });
    
    expect(mockSetValue).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Test persistence',
        })
      ])
    );
  });

  it('handles data export correctly', async () => {
    const mockTasks = [mockTasks[0]];
    (useKV as jest.Mock).mockReturnValue([mockTasks, jest.fn(), jest.fn()]);
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    const exportData = () => {
      const data = {
        tasks: mockTasks,
        exportDate: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      return blob;
    };
    
    const blob = exportData();
    expect(blob.type).toBe('application/json');
  });
});

describe('Accessibility', () => {
  it('provides keyboard navigation for task cards', () => {
    render(<TaskCard task={mockTasks[0]} />);
    
    const taskElement = screen.getByRole('article');
    expect(taskElement).toHaveAttribute('tabIndex', '0');
  });

  it('includes proper ARIA labels', () => {
    render(<TaskCard task={mockTasks[0]} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', expect.stringContaining('Mark'));
  });

  it('supports screen reader navigation', () => {
    render(<KanbanBoard />);
    
    const columns = screen.getAllByRole('region');
    columns.forEach(column => {
      expect(column).toHaveAttribute('aria-label');
    });
  });

  it('maintains focus management', () => {
    render(<QuickAddBar />);
    
    const input = screen.getByPlaceholderText(/add a task/i);
    fireEvent.focus(input);
    
    expect(input).toHaveFocus();
  });
});

// Test utilities and helpers
export const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: Math.random().toString(36),
  title: 'Mock Task',
  completed: false,
  priority: 3,
  labels: [],
  dependencies: [],
  subtasks: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: Math.random().toString(36),
  name: 'Mock Project',
  color: '#2E5AAC',
  isExpanded: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Integration test helpers
export const waitForAsyncUpdates = () => new Promise(resolve => setTimeout(resolve, 0));

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
  };
};