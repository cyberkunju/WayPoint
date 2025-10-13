# Subtask Integration Guide

## Overview

This guide explains how to integrate the subtask functionality into your ClarityFlow application.

## Quick Start

### 1. Import Required Components

```typescript
import { SubtaskList } from '@/components/SubtaskList';
import { useTaskStore } from '@/hooks/use-store';
```

### 2. Basic Usage in Task Detail Panel

```typescript
function TaskDetailPanel({ taskId }: { taskId: string }) {
  const { tasks, addSubtask } = useTaskStore();
  
  const task = tasks.find(t => t.id === taskId);
  const subtasks = tasks.filter(t => t.parentId === taskId);

  if (!task) return null;

  return (
    <div>
      <h2>{task.title}</h2>
      
      {/* Subtask section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Subtasks</h3>
        <SubtaskList 
          parentTask={task}
          subtasks={subtasks}
          onSubtaskClick={(subtaskId) => {
            // Handle subtask click - open in detail panel
            console.log('Subtask clicked:', subtaskId);
          }}
        />
      </div>
    </div>
  );
}
```

### 3. TaskCard Already Supports Subtasks

The `TaskCard` component automatically displays subtasks when they exist:

```typescript
import { TaskCard } from '@/components/TaskCard';

function TaskList() {
  const { tasks } = useTaskStore();
  
  // Filter out subtasks - they appear under their parent
  const topLevelTasks = tasks.filter(t => !t.parentId);

  return (
    <div>
      {topLevelTasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

## Store Actions

### Creating Subtasks

```typescript
const { addSubtask } = useTaskStore();

// Create a subtask
await addSubtask(parentTaskId, {
  title: 'Subtask title',
  description: 'Optional description',
  priority: 2,
  dueDate: '2024-12-31T23:59:59Z',
});
```

### Calculating Progress

```typescript
const { calculateTaskProgress } = useTaskStore();

// Get progress percentage (0-100)
const progress = await calculateTaskProgress(taskId);
console.log(`Task is ${progress}% complete`);
```

### Reordering Subtasks

```typescript
const { reorderTask } = useTaskStore();

// Reorder a subtask within its parent
await reorderTask(
  subtaskId,      // Task to move
  newPosition,    // New position (0-based index)
  projectId,      // Optional: project context
  parentId        // Optional: parent task context
);
```

### Deleting with Subtasks

```typescript
const { deleteTaskWithSubtasks } = useTaskStore();

// Delete task and all its subtasks recursively
await deleteTaskWithSubtasks(taskId);
```

## Service Methods

### Task Service API

```typescript
import { taskService } from '@/services/task.service';

// Create subtask
const subtask = await taskService.createSubtask(
  parentTaskId,
  { title: 'Subtask', priority: 2 },
  userId
);

// Get all subtasks
const subtasks = await taskService.getSubtasksForTask(parentTaskId, userId);

// Calculate progress
const progress = await taskService.calculateTaskProgress(parentTaskId, userId);

// Update parent progress
await taskService.updateParentTaskProgress(parentTaskId, userId);

// Convert task to subtask
await taskService.convertToSubtask(taskId, parentTaskId);

// Remove from parent (make top-level)
await taskService.removeFromParent(taskId);

// Delete with all subtasks
await taskService.deleteTaskWithSubtasks(taskId, userId);
```

## Component Props

### SubtaskList Props

```typescript
interface SubtaskListProps {
  parentTask: Task;           // The parent task
  subtasks: Task[];           // Array of subtasks
  onSubtaskClick?: (id: string) => void;  // Optional click handler
}
```

### TaskCard Props (Subtask-Related)

The TaskCard automatically handles subtasks. No additional props needed:

```typescript
interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isDraggedOver?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  showProject?: boolean;
  compact?: boolean;
}
```

## Features

### 1. Progress Tracking

- Visual progress bar
- Completion count (e.g., "2/5")
- Auto-updates when subtasks are toggled
- Parent auto-completes when all subtasks done

### 2. Drag & Drop Reordering

- Drag handle appears on hover
- Visual feedback during drag
- Smooth position updates
- Works within parent context

### 3. Inline Creation

- Click "Add subtask" button
- Type title and press Enter
- Press Escape to cancel
- Auto-focus on input

### 4. Expand/Collapse

- Caret icon shows expand state
- Click to toggle visibility
- Remembers state per task
- Smooth animations

## Styling

### Custom Styles

The components use Tailwind CSS and follow the project's design system:

```typescript
// Progress bar color
className="bg-primary"

// Subtask item hover
className="hover:bg-muted/50"

// Drag feedback
className="opacity-50" // When dragging
className="border-2 border-primary" // When dragged over
```

### Theme Integration

All components respect the current theme (light/dark) and use CSS variables:

- `--primary` - Progress bar, checkmarks
- `--muted` - Backgrounds, borders
- `--foreground` - Text color
- `--muted-foreground` - Secondary text

## Accessibility

### Keyboard Navigation

- **Tab**: Navigate between subtasks
- **Enter**: Add subtask (when in input)
- **Escape**: Cancel adding subtask
- **Space**: Toggle subtask completion

### ARIA Labels

All interactive elements have proper ARIA labels:

```typescript
aria-label="Mark subtask 'Design mockups' as complete"
aria-label="Delete subtask 'Write docs'"
aria-label="Expand subtasks"
```

### Screen Reader Support

- Progress announced as "2 of 5 subtasks complete"
- Drag operations announced
- State changes announced via toast notifications

## Performance

### Optimizations

1. **Memoization**: Subtask lists are memoized
2. **Batch Updates**: Position changes use batch operations
3. **Optimistic Updates**: UI updates immediately
4. **Lazy Loading**: Subtasks only load when expanded

### Best Practices

```typescript
// ✅ Good: Filter subtasks once
const subtasks = useMemo(
  () => tasks.filter(t => t.parentId === taskId),
  [tasks, taskId]
);

// ❌ Bad: Filter on every render
const subtasks = tasks.filter(t => t.parentId === taskId);
```

## Offline Support

All subtask operations work offline:

1. **Create**: Queued for sync
2. **Update**: Queued for sync
3. **Delete**: Queued for sync
4. **Reorder**: Queued for sync

Sync happens automatically when online.

## Error Handling

```typescript
try {
  await addSubtask(parentId, { title: 'Subtask' });
  toast.success('Subtask added');
} catch (error) {
  console.error('Failed to add subtask:', error);
  toast.error('Failed to add subtask');
}
```

## Examples

### Example 1: Task Detail with Subtasks

```typescript
function TaskDetail({ taskId }: { taskId: string }) {
  const { tasks } = useTaskStore();
  
  const task = tasks.find(t => t.id === taskId);
  const subtasks = tasks.filter(t => t.parentId === taskId);
  
  if (!task) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1>{task.title}</h1>
        <p>{task.description}</p>
      </div>

      {/* Subtasks section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length})
        </h2>
        <SubtaskList 
          parentTask={task}
          subtasks={subtasks}
        />
      </div>
    </div>
  );
}
```

### Example 2: Progress Indicator

```typescript
function TaskProgress({ taskId }: { taskId: string }) {
  const { tasks, calculateTaskProgress } = useTaskStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    calculateTaskProgress(taskId).then(setProgress);
  }, [taskId, tasks]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
```

### Example 3: Bulk Subtask Creation

```typescript
async function createProjectWithSubtasks() {
  const { addTask, addSubtask } = useTaskStore();

  // Create parent task
  const project = await addTask({
    title: 'Launch Website',
    priority: 1,
  });

  // Create multiple subtasks
  const subtaskTitles = [
    'Design homepage',
    'Set up hosting',
    'Write content',
    'Test on mobile',
    'Deploy to production',
  ];

  for (const title of subtaskTitles) {
    await addSubtask(project.id, {
      title,
      priority: 2,
    });
  }

  toast.success('Project created with 5 subtasks!');
}
```

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { taskService } from '@/services/task.service';

describe('Subtasks', () => {
  it('should create subtask with parent relationship', async () => {
    const subtask = await taskService.createSubtask(
      'parent-id',
      { title: 'Subtask' },
      'user-id'
    );
    
    expect(subtask.parentId).toBe('parent-id');
  });

  it('should calculate progress correctly', async () => {
    const progress = await taskService.calculateTaskProgress(
      'task-id',
      'user-id'
    );
    
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });
});
```

### Integration Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SubtaskList } from '@/components/SubtaskList';

describe('SubtaskList', () => {
  it('should display subtasks', () => {
    render(
      <SubtaskList 
        parentTask={mockTask}
        subtasks={mockSubtasks}
      />
    );
    
    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
  });

  it('should toggle subtask completion', async () => {
    render(
      <SubtaskList 
        parentTask={mockTask}
        subtasks={mockSubtasks}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Assert completion state changed
  });
});
```

## Troubleshooting

### Subtasks Not Showing

1. Check that `parentId` is set correctly
2. Verify subtasks are not filtered out
3. Ensure task is expanded (check `isExpanded` state)

### Progress Not Updating

1. Verify `calculateTaskProgress` is called after toggle
2. Check that subtasks array is up to date
3. Ensure parent task is being updated

### Drag & Drop Not Working

1. Check that `draggable` attribute is set
2. Verify drag handlers are attached
3. Ensure `reorderTask` is being called on drop

## Migration Guide

### From Flat Tasks to Hierarchical

```typescript
// Before: Flat task list
const tasks = [
  { id: '1', title: 'Task 1' },
  { id: '2', title: 'Task 2' },
];

// After: With subtasks
const tasks = [
  { 
    id: '1', 
    title: 'Task 1',
    subtasks: ['1-1', '1-2']
  },
  { 
    id: '1-1', 
    title: 'Subtask 1',
    parentId: '1'
  },
  { 
    id: '1-2', 
    title: 'Subtask 2',
    parentId: '1'
  },
];
```

## Support

For issues or questions:
1. Check the documentation in `docs/task-11-complete.md`
2. Review test examples in `src/services/__tests__/subtasks.test.ts`
3. Try the demo component in `src/components/SubtaskDemo.tsx`
