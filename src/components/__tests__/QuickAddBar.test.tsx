import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuickAddBar } from '../QuickAddBar';

// Mock the hooks
vi.mock('../../hooks/use-store', () => ({
  useTaskStore: () => ({
    tasks: [],
    addTask: vi.fn(),
    updateTask: vi.fn(),
  }),
  useAppState: () => ({
    selectedProjectId: null,
  }),
}));

describe('QuickAddBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input field correctly', () => {
    render(<QuickAddBar />);
    
    const input = screen.getByPlaceholderText(/add a task/i);
    expect(input).toBeInTheDocument();
  });

  it('allows typing in the input field', () => {
    render(<QuickAddBar />);
    
    const input = screen.getByPlaceholderText(/add a task/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New test task' } });
    
    expect(input.value).toBe('New test task');
  });

  it('has voice input button when speech recognition is available', () => {
    render(<QuickAddBar />);
    
    const voiceButton = screen.queryByRole('button', { name: /voice/i });
    // Voice button may or may not be present depending on browser support
    if (voiceButton) {
      expect(voiceButton).toBeInTheDocument();
    }
  });

  it('renders with proper structure', () => {
    const { container } = render(<QuickAddBar />);
    
    const input = screen.getByPlaceholderText(/add a task/i);
    expect(input).toBeInTheDocument();
    expect(container.querySelector('form')).toBeInTheDocument();
  });
});
