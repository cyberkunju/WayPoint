# Subtasks Feature

## Quick Reference

### Import Components
```typescript
import { SubtaskList } from '@/components/SubtaskList';
import { useTaskStore } from '@/hooks/use-store';
```

### Basic Usage
```typescript
function MyComponent() {
  const { tasks, addSubtask } = useTaskStore();
  
  const task = tasks.find(t => t.id === taskId);
  const subtasks = tasks.filter(t => t.parentId === taskId);

  return (
    <SubtaskList 
      parentTask={task}
      subtasks={subtasks}
      onSubtaskClick={(id) => console.log('Clicked:', id)}
    />
  );
}
```

### Store Actions
```typescript
// Create subtask
await addSubtask(parentId, { title: 'Subtask' });

// Calculate progress
const progress = await calculateTaskProgress(taskId);

// Reorder
await reorderTask(taskId, newPosition, projectId, parentId);

// Delete with subtasks
await deleteTaskWithSubtasks(taskId);
```

## Features

- ✅ Progress tracking with visual bar
- ✅ Drag-and-drop reordering
- ✅ Inline creation
- ✅ Auto-completion
- ✅ Expand/collapse
- ✅ Offline support

## Documentation

- **Full Guide:** `SUBTASK_INTEGRATION.md`
- **Implementation:** `docs/task-11-complete.md`
- **Demo:** `SubtaskDemo.tsx`
- **Tests:** `__tests__/subtasks.test.ts`

## Support

For questions or issues, refer to the integration guide or check the test examples.
